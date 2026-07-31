import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verificarAcessoProfissional, isAdminPlataforma } from "@/lib/auth-roles";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!(await isAdminPlataforma())) {
    return NextResponse.json({ error: "Acesso restrito ao admin" }, { status: 403 });
  }

  const body = await req.json();
  const adminDb = createAdminClient();

  const { data, error } = await adminDb
    .from("agent_messages")
    .insert({
      conversation_id: id,
      profissional_id: body.profissional_id,
      role: body.role,
      content: body.content,
      tokens_input: body.tokens_input || 0,
      tokens_output: body.tokens_output || 0,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: conv } = await adminDb
    .from("agent_conversations")
    .select("message_count")
    .eq("id", id)
    .single();
  await adminDb
    .from("agent_conversations")
    .update({ message_count: (conv?.message_count || 0) + 1, updated_at: new Date().toISOString() })
    .eq("id", id);

  return NextResponse.json(data);
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const adminDb = createAdminClient();
  const { data: conversation } = await adminDb
    .from("agent_conversations")
    .select("*")
    .eq("id", id)
    .single();

  if (!conversation) return NextResponse.json({ error: "Conversa não encontrada" }, { status: 404 });

  const acesso = await verificarAcessoProfissional(conversation.profissional_id);
  if (!acesso.permitido) {
    return NextResponse.json({ error: "Sem permissão para esta conversa" }, { status: 403 });
  }

  const { data: messages } = await adminDb
    .from("agent_messages")
    .select("*")
    .eq("conversation_id", id)
    .order("created_at", { ascending: true });

  return NextResponse.json({ conversation, messages: messages || [] });
}
