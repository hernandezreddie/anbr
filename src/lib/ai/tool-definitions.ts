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
    tools.push({
      name: "buscar_horarios_disponiveis",
      description:
        "Busca os horários livres de um serviço em uma data específica. USE SEMPRE antes de sugerir ou criar um agendamento. Retorna slots de 30min livres, considerando expediente, limites e conflitos.",
      parameters: {
        type: "object",
        properties: {
          servico_id: { type: "string", description: "ID do serviço (obtenha com consultar_servicos)" },
          data: { type: "string", description: "Data no formato AAAA-MM-DD" },
        },
        required: ["servico_id", "data"],
      },
    });
    tools.push({
      name: "criar_agendamento",
      description:
        "Cria um agendamento CONFIRMADO para o cliente. Use somente depois de o cliente confirmar explicitamente nome, WhatsApp com DDD, serviço, data e hora. Dispara a confirmação por WhatsApp automaticamente.",
      parameters: {
        type: "object",
        properties: {
          servico_id: { type: "string", description: "ID do serviço (obtenha com consultar_servicos)" },
          data: { type: "string", description: "Data no formato AAAA-MM-DD (futura)" },
          hora: { type: "string", description: "Hora no formato HH:MM (dentro do expediente)" },
          cliente_nome: { type: "string", description: "Nome completo do cliente" },
          cliente_whatsapp: { type: "string", description: "WhatsApp com DDD, somente dígitos (ex: 41999999999)" },
          cliente_endereco: { type: "string", description: "Endereço (se o serviço for no local)" },
        },
        required: ["servico_id", "data", "hora", "cliente_nome", "cliente_whatsapp"],
      },
    });
    tools.push({
      name: "atualizar_status_agendamento",
      description:
        "Altera o status de um agendamento existente: confirmado, concluido ou cancelado. Ao cancelar, o cliente é avisado por WhatsApp automaticamente; ao concluir, o cliente recebe convite de avaliação e reagendamento.",
      parameters: {
        type: "object",
        properties: {
          agendamento_id: { type: "string", description: "ID do agendamento (obtenha com consultar_agendamentos)" },
          novo_status: { type: "string", enum: ["confirmado", "concluido", "cancelado"] },
        },
        required: ["agendamento_id", "novo_status"],
      },
    });
    tools.push({
      name: "consultar_cliente",
      description: "Busca um cliente pelo nome (parcial) ou WhatsApp e retorna seu histórico de agendamentos.",
      parameters: {
        type: "object",
        properties: {
          nome: { type: "string", description: "Nome ou parte do nome" },
          whatsapp: { type: "string", description: "WhatsApp com DDD, somente dígitos" },
        },
        required: [],
      },
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
