// Definições neutras das ferramentas do agente — usadas por todos os providers
// (OpenAI/OpenRouter via formato function-calling, Anthropic via tool_use, Gemini via FunctionDeclaration)

import type OpenAI from "openai";

export interface AgentToolDef {
  name: string;
  description: string;
  parameters: {
    type: "object";
    properties: Record<string, any>;
    required?: string[];
  };
}

export function buildAgentTools(toolsEnabled: string[]): AgentToolDef[] {
  const tools: AgentToolDef[] = [];

  if (toolsEnabled.includes("database")) {
    tools.push({
      name: "consultar_agendamentos",
      description: "Consulta agendamentos do profissional. Filtra por data, status ou nome do cliente.",
      parameters: {
        type: "object",
        properties: {
          filtro: {
            type: "object",
            description: "Filtros opcionais da consulta",
            properties: {
              data: { type: "string", description: "Data no formato AAAA-MM-DD" },
              status: { type: "string", description: "Status do agendamento: solicitado, confirmado, concluido ou cancelado" },
              cliente_nome: { type: "string", description: "Nome do cliente" },
            },
          },
        },
        required: [],
      },
    });
    tools.push({
      name: "consultar_servicos",
      description: "Lista os serviços disponíveis do profissional com preços.",
      parameters: { type: "object", properties: {}, required: [] },
    });
  }

  if (toolsEnabled.includes("google_calendar")) {
    tools.push({
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
    });
    tools.push({
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
    });
  }

  return tools;
}

/** Converte para o formato function-calling da OpenAI/OpenRouter */
export function toOpenAITools(tools: AgentToolDef[]): OpenAI.Chat.Completions.ChatCompletionTool[] {
  return tools.map((t) => ({
    type: "function" as const,
    function: {
      name: t.name,
      description: t.description,
      parameters: t.parameters as any,
    },
  }));
}
