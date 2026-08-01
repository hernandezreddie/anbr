import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Não autorizado" }, { status: 401 });

  const { agendamento_id } = await request.json();
  if (!agendamento_id) return Response.json({ error: "agendamento_id obrigatório" }, { status: 400 });

  const { data: ag } = await supabase
    .from("agendamentos")
    .select("id, profissional_id")
    .eq("id", agendamento_id)
    .single();

  if (!ag) return Response.json({ error: "Agendamento não encontrado" }, { status: 404 });

  const { data: profissional } = await supabase
    .from("profissionais")
    .select("id")
    .eq("email", user.email)
    .single();

  if (!profissional || profissional.id !== ag.profissional_id) {
    return Response.json({ error: "Sem permissão" }, { status: 403 });
  }

  try {
    const { enviarConviteAvaliacao } = await import("@/lib/notificacoes");
    const res = await enviarConviteAvaliacao(ag.id);
    if (!res.enviado) {
      return Response.json({ error: res.motivo || "Não foi possível enviar" }, { status: 400 });
    }
    return Response.json({ success: true });
  } catch (err) {
    console.error("Erro:", err);
    return Response.json({ error: "Erro interno" }, { status: 500 });
  }
}
