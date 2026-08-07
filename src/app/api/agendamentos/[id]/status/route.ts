import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Não autorizado" }, { status: 401 });

  const { status } = await request.json();

  if (!["solicitado", "confirmado", "concluido", "cancelado"].includes(status)) {
    return Response.json({ error: "Status inválido" }, { status: 400 });
  }

  const { data: agendamento } = await supabase
    .from("agendamentos")
    .select("profissional_id, cliente_whatsapp, servico_nome, data, hora")
    .eq("id", id)
    .single();

  if (!agendamento) return Response.json({ error: "Agendamento não encontrado" }, { status: 404 });

  const { data: profissional } = await supabase
    .from("profissionais")
    .select("id")
    .eq("email", user.email)
    .single();

  if (!profissional || profissional.id !== agendamento.profissional_id) {
    return Response.json({ error: "Sem permissão" }, { status: 403 });
  }

  const { error } = await supabase
    .from("agendamentos")
    .update({ status })
    .eq("id", id);

   if (error) {
    console.error("[agendamentos/status] Error updating status:", error);
    return Response.json({ error: "Erro interno ao actualizar estado" }, { status: 500 });
  }

  if (status === "cancelado") {
    try {
      const { enviarCancelamento } = await import("@/lib/notificacoes");
      await enviarCancelamento({
        profissional_id: agendamento.profissional_id,
        cliente_whatsapp: agendamento.cliente_whatsapp,
        servico_nome: agendamento.servico_nome,
        data: agendamento.data,
        hora: agendamento.hora,
      });
    } catch (err) {
      console.warn("Aviso de cancelamento não enviado:", err);
    }
  }

  if (status === "concluido") {
    try {
      const { enviarConviteAvaliacao, enviarConviteReagendamento } = await import("@/lib/notificacoes");
      await enviarConviteAvaliacao(id);
      await enviarConviteReagendamento(id);
    } catch (err) {
      console.warn("Convite de avaliação / reagendamento não enviado:", err);
    }
  }

  return Response.json({ success: true });
}
