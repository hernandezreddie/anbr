import OpenAI from "openai";
import { AIProvider, AIResponse, AIMessage, AIProviderConfig } from "../types";

function getOpenAI() {
  if (!process.env.OPENAI_API_KEY) return null;
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export class OpenAIProvider implements AIProvider {
  private config: AIProviderConfig;
  private openai: ReturnType<typeof getOpenAI> | null;

  constructor(config: AIProviderConfig) {
    this.config = config;
    const apiKey = config.apiKey || process.env.OPENAI_API_KEY;
    this.openai = apiKey ? new OpenAI({ apiKey }) : null;
  }

  async chat(mensaje: string, historial: AIMessage[] = []): Promise<AIResponse> {
    if (!this.openai) {
      return { respuesta: "", model: this.config.model, error: "API key da OpenAI não configurada", status: 500 };
    }

    // Convertir historial al formato de OpenAI
    const openAIHistorial: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = historial.map(m => ({
      role: m.role as "user" | "assistant" | "system",
      content: m.content
    }));

    // Configurar herramientas (mover esta lógica desde el agent original)
    const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [];
    const toolsConfig: string[] = this.config.tools_enabled || [];

    // Aquí iría la lógica de herramientas, pero la mantendremos en el agent principal
    // Para simplificar, delegaremos la ejecución de herramientas al agent principal
    // y este proveedor solo manejará la llamada al LLM

    try {
      const completion = await this.openai.chat.completions.create({
        model: this.config.model || "gpt-4o-mini",
        temperature: this.config.temperature ?? 0.7,
        max_tokens: this.config.max_tokens ?? 4096,
        messages: [
          {
            role: "system",
            content: this.config.system_prompt || "Eres un asistente útil.",
          },
          ...openAIHistorial,
          { role: "user", content: mensaje },
        ],
        // Las herramientas se manejarán en el agent principal por ahora
        tools: tools.length > 0 ? tools : undefined,
        tool_choice: tools.length > 0 ? "auto" : undefined,
      });

      const choice = completion.choices[0];
      const respuesta = choice.message.content || "";
      const toolCalls = choice.message.tool_calls || null;
      const usage = completion.usage || { prompt_tokens: 0, completion_tokens: 0 };

      return {
        respuesta,
        toolCalls: toolCalls?.map((t: any) => ({
          name: t.function?.name || t.name,
          args: t.function?.arguments || t.arguments
        })),
        toolResults: [], // Se llenará en el agent principal
        tokens: {
          input: usage.prompt_tokens,
          output: usage.completion_tokens,
          total: (usage as any).total_tokens || usage.prompt_tokens + usage.completion_tokens
        },
        model: this.config.model
      };
    } catch (err: any) {
      return { respuesta: "", model: this.config.model, error: err.message, status: 500 };
    }
  }

  async countTokens(text: string): Promise<number> {
    // Estimación simple, en realidad deberíamos usar un tokenizer adecuado
    return Math.ceil(text.length / 4);
  }
}