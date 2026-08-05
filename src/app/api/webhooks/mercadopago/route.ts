import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { consultarPagamento, validarFirmaWebhook } from "@/lib/pagamentos/mercadopago";
import { extenderPlano } from "@/lib/planos";

/**
 * Webhook da Mercado Pago (PIX).
 * - Valida a assinatura x-signature (HMAC com MERCADOPAGO_WEBHOOK_SECRET).
 * - Confirma o status consultando a API (nunca confia no body).
 * - Se approved: marca pago e estende plano_expira_em automaticamente.
 */
export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  if (!validarFirmaWebhook(req, rawBody)) {
    return NextResponse.json({ error: "Assinatura inválida" }, { status: 401 });
  }

  let body: any;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  // MP envia notificações para payment, plan, subscription etc.
  const type = body.type || body.action || "payment";
  const paymentId = body.data?.id ? String(body.data.id) : null;

  if (!paymentId || (type !== "payment" && type !== "payment.created" && type !== "payment.updated")) {
    return NextResponse.json({ received: true, ignorado: true });
  }

  try {
    const { status } = await consultarPagamento(paymentId);
    const adminDb = createAdminClient();

    const { data: pagamento } = await adminDb
      .from("pagamentos_pix")
      .select("id, profissional_id, plano, frequencia, status")
      .eq("payment_id", paymentId)
      .maybeSingle();

    if (!pagamento) {
      return NextResponse.json({ received: true, motivo: "pagamento não encontrado na base" });
    }

    if (status === "approved") {
      if (pagamento.status !== "pago") {
        const meses = pagamento.frequencia === "anual" ? 12 : 1;
        const { expira_em } = await extenderPlano(
          pagamento.profissional_id,
          pagamento.plano as "profissional" | "ia_premium",
          meses
        );

        await adminDb
          .from("pagamentos_pix")
          .update({ status: "pago", pago_em: new Date().toISOString() })
          .eq("id", pagamento.id);

        try {
          const { enviarPushProfissional } = await import("@/lib/push-server");
          await enviarPushProfissional(
            pagamento.profissional_id,
            "✅ Pagamento confirmado",
            `Seu plano foi ativado! Válido até ${new Date(expira_em).toLocaleDateString("pt-BR")}.`,
            `/painel/plano`
          );
        } catch {}
      }
      return NextResponse.json({ received: true, status: "approved", processado: true });
    }

    if (["rejected", "expired", "cancelled"].includes(status)) {
      await adminDb
        .from("pagamentos_pix")
        .update({ status: "cancelado" })
        .eq("id", pagamento.id);
    }

    return NextResponse.json({ received: true, status });
  } catch (err: any) {
    console.error("[webhooks/mercadopago] erro:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
