import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { consultarPagamento } from "@/lib/pagamentos/mercadopago";
import { extenderPlano, getPlanoAtivo } from "@/lib/planos";

/**
 * Polling de estado do pedido PIX (fallback se o webhook não chegar).
 * GET /api/planos/pedido/estado?pagamento_id=<id>
 * Se o gateway responder "approved", ativa o plano imediatamente.
 */
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const pagamentoId = req.nextUrl.searchParams.get("pagamento_id");
  if (!pagamentoId) return NextResponse.json({ error: "pagamento_id é obrigatório" }, { status: 400 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("profissional_id")
    .eq("id", user.id)
    .single();
  if (!profile?.profissional_id) {
    return NextResponse.json({ error: "Perfil não encontrado" }, { status: 400 });
  }

  const adminDb = createAdminClient();
  const { data: pagamento } = await adminDb
    .from("pagamentos_pix")
    .select("id, profissional_id, plano, frequencia, status, payment_id")
    .eq("id", pagamentoId)
    .eq("profissional_id", profile.profissional_id)
    .maybeSingle();

  if (!pagamento) return NextResponse.json({ error: "Pagamento não encontrado" }, { status: 404 });

  // Polling: consulta o gateway enquanto pendente
  if (pagamento.status === "pendente" && pagamento.payment_id) {
    try {
      const { status } = await consultarPagamento(pagamento.payment_id);
      if (status === "approved") {
        const meses = pagamento.frequencia === "anual" ? 12 : 1;
        await extenderPlano(
          pagamento.profissional_id,
          pagamento.plano as "profissional" | "ia_premium",
          meses
        );
        await adminDb
          .from("pagamentos_pix")
          .update({ status: "pago", pago_em: new Date().toISOString() })
          .eq("id", pagamento.id);
        pagamento.status = "pago";
      } else if (["rejected", "expired", "cancelled"].includes(status)) {
        await adminDb.from("pagamentos_pix").update({ status: "cancelado" }).eq("id", pagamento.id);
        pagamento.status = "cancelado";
      }
    } catch {
      // gateway indisponível — mantém pendente
    }
  }

  const planoAtivo = await getPlanoAtivo(profile.profissional_id);

  return NextResponse.json({
    pagamento_id: pagamento.id,
    status: pagamento.status,
    plano: planoAtivo.plano,
    plano_nome: planoAtivo.nome,
    plano_ativo: planoAtivo.ativo,
    expira_em: planoAtivo.expira_em,
  });
}
