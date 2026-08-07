import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { exigirPlano, PLANOS_COM_AGENTE, checarCotaAgente } from "@/lib/planos";
import { verificarAcessoProfissional } from "@/lib/auth-roles";
import { rateLimitar } from "@/lib/rate-limit";

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

    const chaveLimite = conversation_id
      ? `agente:${conversation_id}`
      : `agente:${profissional_id}`;
    const limit = rateLimitar(chaveLimite, 10, 60_000);
    if (!limit.permitido) {
      return NextResponse.json(
        { error: `Muitas mensagens. Aguarde ${limit.emBreve}s.` },
        { status: 429 }
      );
    }

    const acesso = await verificarAcessoProfissional(profissional_id);
    if (!acesso.permitido) {
      return NextResponse.json({ error: "Sem permissão para este profissional" }, { status: 403 });
    }

    const bloqueio = await exigirPlano(profissional_id, PLANOS_COM_AGENTE, "AI Agent");
    if (bloqueio) return NextResponse.json({ error: bloqueio.error }, { status: bloqueio.status });

    const adminDb = createAdminClient();

    // Limite mensal de mensagens do agente por plano
    const semCota = await checarCotaAgente(profissional_id, adminDb);
    if (semCota) return NextResponse.json({ error: semCota.error }, { status: semCota.status });

    const { chatComAgente } = await import("@/lib/ai/agent");

    // Timeout de segurança: nenhuma chamada de IA deve ficar pendurada
    const TIMEOUT_MS = 60_000;
    let result;
    try {
      result = await Promise.race([
        chatComAgente(profissional_id, mensagem, historico || []),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Tempo esgotado ao consultar a IA (60s). Tente novamente.")), TIMEOUT_MS)
        ),
      ]);
    } catch (e: any) {
      console.error("[agent/chat] chamada de IA falhou:", e?.message || e);
      return NextResponse.json({ error: "Erro ao consultar a IA. Tente novamente." }, { status: 504 });
    }

    if (result.error) {
      console.error("[agent/chat] erro do agente:", result.error);
      return NextResponse.json({ error: "Erro ao processar mensagem da IA" }, { status: result.status || 500 });
    }
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
  } catch (err: any) {
    console.error("[agent/chat] erro interno:", err?.message || err);
    return NextResponse.json(
      { error: "Erro interno ao processar mensagem" },
      { status: 500 }
    );
  }
}
