import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verificarAcessoProfissional } from "@/lib/auth-roles";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { content } = await req.json();
  if (!content?.trim()) {
    return NextResponse.json({ error: "Conteúdo da mensagem é obrigatório" }, { status: 400 });
  }

  const adminDb = createAdminClient();

  const { data: conv } = await adminDb
    .from("agent_conversations")
    .select("id, profissional_id, channel, customer_id, message_count")
    .eq("id", id)
    .single();

  if (!conv) return NextResponse.json({ error: "Conversa não encontrada" }, { status: 404 });

  const acesso = await verificarAcessoProfissional(conv.profissional_id);
  if (!acesso.permitido) {
    return NextResponse.json({ error: "Sem permissão para esta conversa" }, { status: 403 });
  }

  const { data: msg, error: msgErr } = await adminDb
    .from("agent_messages")
    .insert({
      conversation_id: id,
      profissional_id: conv.profissional_id,
      role: "assistant",
      content: content.trim(),
    })
    .select()
    .single();

  if (msgErr) return NextResponse.json({ error: msgErr.message }, { status: 500 });

  await adminDb
    .from("agent_conversations")
    .update({ message_count: (conv.message_count || 0) + 1, updated_at: new Date().toISOString() })
    .eq("id", id);

  const channel = conv.channel;
  const customerId = conv.customer_id;
  const platform = conv.profissional_id;

  if (channel === "whatsapp" && customerId) {
    try {
      const { sendText } = await import("@/lib/whatsapp/evolution");
      await sendText(platform, customerId, content.trim());
    } catch (err: any) {
      return NextResponse.json({ error: `Falha ao enviar no WhatsApp: ${err.message}` }, { status: 500 });
    }
  } else if ((channel === "instagram" || channel === "messenger") && customerId) {
    try {
      const { sendMessage } = await import("@/lib/meta/graph");
      await sendMessage(platform, customerId, content.trim(), channel);
    } catch (err: any) {
      return NextResponse.json({ error: `Falha ao enviar no ${channel}: ${err.message}` }, { status: 500 });
    }
  }

  return NextResponse.json(msg);
}