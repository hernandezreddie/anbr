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
    .select("profissional_id")
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

  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ success: true });
}
