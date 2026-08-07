import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest } from "next/server";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Não autorizado" }, { status: 401 });

  const { status } = await request.json();

  if (!["solicitado", "confirmado", "concluido", "cancelado"].includes(status)) {
    return Response.json({ error: "Status inválido" }, { status: 400 });
  }

  // Check if user is platform admin (uses auth user context)
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const admin = profile?.role === 'admin' || profile?.role === 'plataforma';

  // Use admin client to bypass RLS when user is admin
  const client = admin ? createAdminClient() : supabase;

  const { data: agendamento } = await client
    .from("agendamentos")
    .select("profissional_id, cliente_whatsapp, servico_nome, data, hora")
    .eq("id", id)
    .single();

  if (!agendamento) return Response.json({ error: "Agendamento não encontrado" }, { status: 404 });

  // Non-admin: verify the profissional belongs to the user
  if (!admin) {
    const { data: profissional } = await supabase
      .from("profissionais")
      .select("id")
      .eq("email", user.email)
      .single();

    if (!profissional || profissional.id !== agendamento.profissional_id) {
      return Response.json({ error: "Sem permissão" }, { status: 403 });
    }
  }

  const { error } = await client
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
