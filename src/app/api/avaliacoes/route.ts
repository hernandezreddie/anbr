import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, nota, texto } = body;

    if (!token || typeof token !== "string") {
      return Response.json({ error: "Link de avaliação inválido" }, { status: 400 });
    }
    const n = Number(nota);
    if (!Number.isInteger(n) || n < 1 || n > 5) {
      return Response.json({ error: "Nota inválida (1 a 5)" }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: ag } = await supabase
      .from("agendamentos")
      .select("id, profissional_id, cliente_nome")
      .eq("token_avaliacao", token)
      .single();

    if (!ag) {
      return Response.json({ error: "Link de avaliação inválido ou expirado" }, { status: 404 });
    }

    const { error: insertError } = await supabase.from("avaliacoes").insert({
      profissional_id: ag.profissional_id,
      agendamento_id: ag.id,
      token,
      cliente_nome: ag.cliente_nome || "Cliente",
      nota: n,
      texto: (texto || "").toString().trim().slice(0, 500),
      aprovada: false,
    });

    if (insertError) {
      if (insertError.code === "23505") {
        return Response.json({ error: "Você já deixou sua avaliação" }, { status: 409 });
      }
      console.error("Erro ao salvar avaliação:", insertError);
      return Response.json({ error: "Erro ao salvar avaliação" }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error("Erro:", err);
    return Response.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Não autorizado" }, { status: 401 });

  const { id, aprovada } = await request.json();

  const { data: avaliacao } = await supabase
    .from("avaliacoes")
    .select("id, profissional_id, agendamento_id, cliente_nome")
    .eq("id", id)
    .single();

  if (!avaliacao) return Response.json({ error: "Avaliação não encontrada" }, { status: 404 });

  const { data: profissional } = await supabase
    .from("profissionais")
    .select("id")
    .eq("email", user.email)
    .single();

  if (!profissional || profissional.id !== avaliacao.profissional_id) {
    return Response.json({ error: "Sem permissão" }, { status: 403 });
  }

  const { error } = await supabase
    .from("avaliacoes")
    .update({ aprovada: Boolean(aprovada) })
    .eq("id", id);

  if (error) return Response.json({ error: error.message }, { status: 500 });

  if (aprovada) {
    try {
      const { data: ag } = await supabase
        .from("agendamentos")
        .select("profissional_id, cliente_whatsapp")
        .eq("id", avaliacao.agendamento_id)
        .single();
      const whatsapp = ag?.cliente_whatsapp?.replace(/\D/g, "");
      if (whatsapp && whatsapp.length >= 10) {
        const { sendText } = await import("@/lib/whatsapp/evolution");
        await sendText(
          ag!.profissional_id,
          whatsapp,
          `Oi ${avaliacao.cliente_nome.split(" ")[0] || "você"}! Seu depoimento foi publicado na minha página. Muito obrigado! 😊`
        );
      }
    } catch (err) {
      console.warn("Notificação de publicação não enviada:", err);
    }
  }

  return Response.json({ success: true });
}
