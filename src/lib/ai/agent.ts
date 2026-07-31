import OpenAI from "openai";
import { createAdminClient } from "@/lib/supabase/admin";

function getOpenAI() {
  if (!process.env.OPENAI_API_KEY) return null
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
}

interface AgentContext {
  profissional_id: string
  config: {
    system_prompt: string
    model: string
    temperature: number
    max_tokens: number
    tools_enabled: string[]
  }
}

export async function getAgentConfig(profissionalId: string) {
  const adminDb = createAdminClient();
  const { data } = await adminDb
    .from("agent_configs")
    .select("*")
    .eq("profissional_id", profissionalId)
    .single();
  return data;
}

export async function buscarContextoRAG(
  profissionalId: string,
  query: string,
  limit = 5
): Promise<string> {
  const { generateEmbedding } = await import("./embeddings");
  const adminDb = createAdminClient();

  const embedding = await generateEmbedding(query);
  const embeddingStr = `[${embedding.join(",")}]`;

  const { data } = await adminDb.rpc("match_knowledge_chunks", {
    query_embedding: embeddingStr,
    match_count: limit,
    filter_profissional_id: profissionalId,
  });

  if (!data || data.length === 0) return "";

  return (data as any[])
    .map((d) => `[${d.filename}] ${d.content}`)
    .join("\n\n---\n\n");
}

export async function chatComAgente(
  profissionalId: string,
  mensagem: string,
  historico: { role: "user" | "assistant"; content: string }[] = []
) {
  const config = await getAgentConfig(profissionalId);
  if (!config || !config.enabled) {
    return { error: "Agente não configurado ou desativado", status: 400 };
  }

  const contextoRAG = await buscarContextoRAG(profissionalId, mensagem, 5);

  const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [];
  const toolsConfig: string[] = config.tools_enabled || [];

  if (toolsConfig.includes("database")) {
    tools.push({
      type: "function",
      function: {
        name: "consultar_agendamentos",
        description: "Consulta agendamentos do cliente. Filtra por data, status ou cliente.",
        parameters: {
          type: "object",
          properties: {
            filtro: {
              type: "object",
              properties: {
                data: { type: "string" },
                status: { type: "string", enum: ["solicitado", "confirmado", "concluido", "cancelado"] },
                cliente_nome: { type: "string" },
              },
            },
          },
          required: [],
        },
      },
    });
    tools.push({
      type: "function",
      function: {
        name: "consultar_servicos",
        description: "Lista os serviços disponíveis do profissional com preços.",
        parameters: {
          type: "object",
          properties: {},
          required: [],
        },
      },
    });
  }

  if (toolsConfig.includes("google_calendar")) {
    tools.push({
      type: "function",
      function: {
        name: "verificar_disponibilidade",
        description: "Verifica se há horário livre no Google Calendar entre dois horários. Use antes de sugerir ou confirmar um agendamento.",
        parameters: {
          type: "object",
          properties: {
            inicio: { type: "string", description: "ISO datetime de início (ex: 2026-07-30T14:00:00-03:00)" },
            fim: { type: "string", description: "ISO datetime de fim (ex: 2026-07-30T16:00:00-03:00)" },
          },
          required: ["inicio", "fim"],
        },
      },
    });
    tools.push({
      type: "function",
      function: {
        name: "criar_evento_calendario",
        description: "Cria um evento no Google Calendar para um agendamento confirmado.",
        parameters: {
          type: "object",
          properties: {
            titulo: { type: "string", description: "Título do evento (ex: Corte de Cabelo - João)" },
            descricao: { type: "string", description: "Descrição do evento" },
            inicio: { type: "string", description: "ISO datetime de início" },
            fim: { type: "string", description: "ISO datetime de fim" },
            local: { type: "string", description: "Endereço do cliente (opcional)" },
          },
          required: ["titulo", "descricao", "inicio", "fim"],
        },
      },
    });
  }

  const systemPrompt = config.system_prompt || `Você é um assistente de agendamento profissional.
Ajude clientes a agendar serviços, tirar dúvidas sobre horários e preços.
Seja educado e objetivo. Responda em português.`;

  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: contextoRAG
        ? `${systemPrompt}\n\n## Base de Conhecimento\nUse as informações abaixo para responder. Se não encontrar algo relevante, diga que não sabe.\n\n${contextoRAG}`
        : systemPrompt,
    },
    ...historico.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
    { role: "user", content: mensagem },
  ];

  const openai = getOpenAI()
  if (!openai) {
    return { error: "API key da OpenAI não configurada", status: 500 }
  }

  const completion = await openai.chat.completions.create({
    model: config.model || "gpt-4o-mini",
    temperature: config.temperature ?? 0.7,
    max_tokens: config.max_tokens ?? 4096,
    messages,
    tools: tools.length > 0 ? tools : undefined,
    tool_choice: tools.length > 0 ? "auto" : undefined,
  });

  const choice = completion.choices[0];
  const resposta = choice.message.content || "";
  const toolCalls = choice.message.tool_calls || null;
  const usage = completion.usage || { prompt_tokens: 0, completion_tokens: 0 };

  let toolResults: any[] = [];
  if (toolCalls) {
    toolResults = await executarTools(toolCalls, profissionalId);
  }

  await registrarUso(profissionalId, config.model, usage.prompt_tokens, usage.completion_tokens);

  return {
    resposta,
    toolCalls: toolCalls?.map((t: any) => ({ name: t.function?.name || t.name, args: t.function?.arguments || t.arguments })),
    toolResults,
    tokens: { input: usage.prompt_tokens, output: usage.completion_tokens, total: (usage as any).total_tokens || usage.prompt_tokens + usage.completion_tokens },
    model: config.model,
  };
}

async function executarTools(
  toolCalls: OpenAI.Chat.Completions.ChatCompletionMessage["tool_calls"],
  profissionalId: string
): Promise<any[]> {
  const adminDb = createAdminClient();
  const results = [];

  for (const tool of (toolCalls || []) as any[]) {
    const args = JSON.parse(tool.function?.arguments || tool.arguments || "{}");

    switch (tool.function?.name || tool.name) {
      case "consultar_agendamentos": {
        let query = adminDb
          .from("agendamentos")
          .select("*")
          .eq("profissional_id", profissionalId)
          .order("data", { ascending: true })
          .limit(20);

        if (args.filtro?.data) query = query.eq("data", args.filtro.data);
        if (args.filtro?.status) query = query.eq("status", args.filtro.status);
        if (args.filtro?.cliente_nome) query = query.ilike("cliente_nome", `%${args.filtro.cliente_nome}%`);

        const { data } = await query;
        results.push({ name: "consultar_agendamentos", result: JSON.stringify(data || []) });
        break;
      }

      case "consultar_servicos": {
        const { data } = await adminDb
          .from("servicos")
          .select("nome, descricao, tipo_preco, preco_fixo, valor_hora, duracao_minutos")
          .eq("profissional_id", profissionalId)
          .eq("ativo", true);
        results.push({ name: "consultar_servicos", result: JSON.stringify(data || []) });
        break;
      }

      case "verificar_disponibilidade": {
        try {
          const { checkFreeBusy } = await import("@/lib/google/calendar");
          const result = await checkFreeBusy(profissionalId, args.inicio, args.fim);
          results.push({
            name: "verificar_disponibilidade",
            result: JSON.stringify({
              disponivel: !result.busy,
              eventos_conflitantes: result.events,
            }),
          });
        } catch (e: any) {
          results.push({ name: "verificar_disponibilidade", result: `Erro: ${e.message}` });
        }
        break;
      }

      case "criar_evento_calendario": {
        try {
          const { createCalendarEvent } = await import("@/lib/google/calendar");
          const event = await createCalendarEvent(profissionalId, {
            summary: args.titulo,
            description: args.descricao,
            start: { dateTime: args.inicio, timeZone: "America/Sao_Paulo" },
            end: { dateTime: args.fim, timeZone: "America/Sao_Paulo" },
            location: args.local,
          });
          results.push({
            name: "criar_evento_calendario",
            result: JSON.stringify({ success: true, event_url: event.htmlLink }),
          });
        } catch (e: any) {
          results.push({ name: "criar_evento_calendario", result: `Erro: ${e.message}` });
        }
        break;
      }

      default:
        results.push({ name: tool.function.name, result: "Ferramenta não implementada" });
    }
  }

  return results;
}

async function registrarUso(
  profissionalId: string,
  model: string,
  tokensInput: number,
  tokensOutput: number
) {
  const { calcularCustoTokens } = await import("./costs");
  const adminDb = createAdminClient();
  const today = new Date().toISOString().split("T")[0];
  const cost = calcularCustoTokens(tokensInput, tokensOutput, model);

  await adminDb.rpc("upsert_agent_usage", {
    p_profissional_id: profissionalId,
    p_date: today,
    p_tokens_input: tokensInput,
    p_tokens_output: tokensOutput,
    p_messages: 1,
    p_cost: cost,
  });
}
