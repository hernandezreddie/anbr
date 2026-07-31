import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const body = await req.json();
    const { profissional_id, mensagem, conversation_id, historico } = body;

    if (!profissional_id || !mensagem) {
      return NextResponse.json({ error: "profissional_id e mensagem são obrigatórios" }, { status: 400 });
    }

    const { chatComAgente } = await import("@/lib/ai/agent");
    const result = await chatComAgente(profissional_id, mensagem, historico || []);

    if (result.status === 400) {
      return NextResponse.json(result, { status: 400 });
    }

    const adminDb = createAdminClient();
    let convId = conversation_id;

    if (!convId) {
      const { data: conv } = await adminDb
        .from("agent_conversations")
        .insert({
          profissional_id,
          channel: "web",
          status: "active",
          message_count: 0,
        })
        .select()
        .single();
      convId = conv?.id;
    }

    if (convId) {
      await adminDb.from("agent_messages").insert([
        {
          conversation_id: convId,
          profissional_id,
          role: "user",
          content: mensagem,
          tokens_input: 0,
          tokens_output: 0,
        },
        {
          conversation_id: convId,
          profissional_id,
          role: "assistant",
          content: result.resposta || "",
          tool_calls: result.toolCalls ? JSON.stringify(result.toolCalls) : null,
          tool_results: result.toolResults ? JSON.stringify(result.toolResults) : null,
          tokens_input: result.tokens?.input || 0,
          tokens_output: result.tokens?.output || 0,
          model: result.model || "",
        },
      ]);

      const { count } = await adminDb
        .from("agent_messages")
        .select("*", { count: "exact", head: true })
        .eq("conversation_id", convId);

      await adminDb
        .from("agent_conversations")
        .update({
          message_count: count || 0,
          updated_at: new Date().toISOString(),
        })
        .eq("id", convId);
    }

    return NextResponse.json({
      resposta: result.resposta,
      toolCalls: result.toolCalls,
      toolResults: result.toolResults,
      tokens: result.tokens,
      model: result.model,
      conversation_id: convId,
    });
  } catch {
    return NextResponse.json({ error: "Erro interno ao processar mensagem" }, { status: 500 });
  }
}
