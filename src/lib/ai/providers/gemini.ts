import {
  GoogleGenerativeAI,
  SchemaType,
  type FunctionDeclaration,
  type Part,
} from "@google/generative-ai";
import { AIProvider, AIResponse, AIMessage, AIProviderConfig } from "../types";

function getGeminiClient() {
  if (!process.env.GEMINI_API_KEY) return null;
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

function buildToolDeclarations(toolsEnabled: string[]): FunctionDeclaration[] {
  const declarations: FunctionDeclaration[] = [];

  if (toolsEnabled.includes("database")) {
    declarations.push({
      name: "consultar_agendamentos",
      description: "Consulta agendamentos do profissional. Filtra por data, status ou nome do cliente.",
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          filtro: {
            type: SchemaType.OBJECT,
            description: "Filtros opcionais da consulta",
            properties: {
              data: { type: SchemaType.STRING, description: "Data no formato AAAA-MM-DD" },
              status: { type: SchemaType.STRING, description: "Status do agendamento: solicitado, confirmado, concluido ou cancelado" },
              cliente_nome: { type: SchemaType.STRING, description: "Nome do cliente" },
            },
          },
        },
      },
    });
    declarations.push({
      name: "consultar_servicos",
      description: "Lista os serviços disponíveis do profissional com preços.",
      parameters: {
        type: SchemaType.OBJECT,
        properties: {},
      },
    });
  }

  if (toolsEnabled.includes("google_calendar")) {
    declarations.push({
      name: "verificar_disponibilidade",
      description: "Verifica se há horário livre no Google Calendar entre dois horários. Use antes de sugerir ou confirmar um agendamento.",
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          inicio: { type: SchemaType.STRING, description: "ISO datetime de início (ex: 2026-07-30T14:00:00-03:00)" },
          fim: { type: SchemaType.STRING, description: "ISO datetime de fim (ex: 2026-07-30T16:00:00-03:00)" },
        },
        required: ["inicio", "fim"],
      },
    });
    declarations.push({
      name: "criar_evento_calendario",
      description: "Cria um evento no Google Calendar para um agendamento confirmado.",
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          titulo: { type: SchemaType.STRING, description: "Título do evento (ex: Corte de Cabelo - João)" },
          descricao: { type: SchemaType.STRING, description: "Descrição do evento" },
          inicio: { type: SchemaType.STRING, description: "ISO datetime de início" },
          fim: { type: SchemaType.STRING, description: "ISO datetime de fim" },
          local: { type: SchemaType.STRING, description: "Endereço do cliente (opcional)" },
        },
        required: ["titulo", "descricao", "inicio", "fim"],
      },
    });
  }

  return declarations;
}

export class GeminiProvider implements AIProvider {
  private config: AIProviderConfig;
  private client: GoogleGenerativeAI | null;

  constructor(config: AIProviderConfig) {
    this.config = config;
    const apiKey = config.apiKey || process.env.GEMINI_API_KEY;
    this.client = apiKey ? new GoogleGenerativeAI(apiKey) : null;
  }

  async chat(mensaje: string, historial: AIMessage[] = []): Promise<AIResponse> {
    if (!this.client) {
      return { respuesta: "", model: this.config.model, error: "API key do Gemini não configurada", status: 500 };
    }

    const model = this.config.model || "gemini-1.5-flash";
    const toolsEnabled = this.config.tools_enabled || [];
    const declarations = buildToolDeclarations(toolsEnabled);

    try {
      const genModel = this.client.getGenerativeModel({
        model,
        systemInstruction: this.config.system_prompt || "Você é um assistente útil.",
      });

      const history = historial
        .filter((m) => m.role !== "system")
        .map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        }));

      // Gemini exige que o primeiro turno do histórico seja do usuário
      while (history.length > 0 && history[0].role !== "user") {
        history.shift();
      }

      const chat = genModel.startChat({
        history,
        tools: declarations.length > 0 ? [{ functionDeclarations: declarations }] : undefined,
        generationConfig: {
          temperature: this.config.temperature ?? 0.7,
          maxOutputTokens: this.config.max_tokens ?? 4096,
        },
      });

      const toolCalls: { name: string; args: Record<string, any> }[] = [];
      const toolResults: { name: string; result: string }[] = [];

      let result = await chat.sendMessage(mensaje);
      let calls = result.response.functionCalls?.() || [];

      // Loop de tool-calling: executa funções e devolve os resultados até a resposta final
      for (let i = 0; i < 5 && calls.length > 0; i++) {
        const parts: Part[] = [];

        for (const call of calls) {
          toolCalls.push({ name: call.name, args: call.args || {} });

          let resultado: string;
          if (this.config.executeTool) {
            try {
              resultado = await this.config.executeTool(call.name, call.args || {});
            } catch (e: any) {
              resultado = JSON.stringify({ erro: e.message });
            }
          } else {
            resultado = JSON.stringify({ erro: "Ferramenta não implementada" });
          }

          toolResults.push({ name: call.name, result: resultado });

          let parsed: Record<string, any> = { resultado };
          try {
            parsed = JSON.parse(resultado);
          } catch {
            // mantém { resultado } como fallback
          }

          parts.push({
            functionResponse: {
              name: call.name,
              response: parsed,
            },
          });
        }

        result = await chat.sendMessage(parts);
        calls = result.response.functionCalls?.() || [];
      }

      const texto = result.response.text() || "";

      const usage = (result.response as any).usageMetadata;
      const input = usage?.promptTokenCount || 0;
      const output = usage?.candidatesTokenCount || 0;

      return {
        respuesta: texto,
        toolCalls,
        toolResults,
        tokens: {
          input,
          output,
          total: usage?.totalTokenCount || input + output,
        },
        model,
      };
    } catch (err: any) {
      return { respuesta: "", model, error: err.message, status: 500 };
    }
  }

  async countTokens(text: string): Promise<number> {
    return Math.ceil(text.length / 4);
  }
}