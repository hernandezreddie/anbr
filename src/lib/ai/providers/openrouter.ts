import OpenAI from "openai";
import { AIProvider, AIResponse, AIMessage, AIProviderConfig } from "../types";
import { estimarTokens } from "../costs";
import { buildAgentTools, toOpenAITools } from "../tool-definitions";

const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

function makeClient(apiKey: string): OpenAI {
  return new OpenAI({
    apiKey,
    baseURL: OPENROUTER_BASE_URL,
    defaultHeaders: {
      "HTTP-Referer": process.env.NEXT_PUBLIC_DOMAIN || "https://livreta.app",
      "X-Title": "AN.BR AI Agent",
    },
  });
}

export class OpenRouterProvider implements AIProvider {
  private config: AIProviderConfig;
  private client: OpenAI | null;

  constructor(config: AIProviderConfig) {
    this.config = config;
    const apiKey = config.apiKey || process.env.OPENROUTER_API_KEY;
    this.client = apiKey ? makeClient(apiKey) : null;
  }

  async chat(mensaje: string, historial: AIMessage[] = []): Promise<AIResponse> {
    if (!this.client) {
      return { respuesta: "", model: this.config.model, error: "API key do OpenRouter não configurada", status: 500 };
    }

    const tools = toOpenAITools(buildAgentTools(this.config.tools_enabled || []));

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: this.config.system_prompt || "Você é um assistente útil.",
      },
      ...historial
        .filter((m) => m.role !== "system")
        .map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
      { role: "user", content: mensaje },
    ];

    const model = this.config.model || "openai/gpt-4o-mini";

    try {
      const toolCalls: { name: string; args: Record<string, any> }[] = [];
      const toolResults: { name: string; result: string }[] = [];
      let usage = { prompt_tokens: 0, completion_tokens: 0 };
      let resposta = "";

      let completion = await this.client.chat.completions.create({
        model,
        temperature: this.config.temperature ?? 0.7,
        max_tokens: this.config.max_tokens ?? 4096,
        messages,
        tools: tools.length > 0 ? tools : undefined,
        tool_choice: tools.length > 0 ? "auto" : undefined,
      });

      // Loop de tool-calling (formato OpenAI, aceito pela maioria dos modelos OpenRouter)
      for (let round = 0; round < 5; round++) {
        const choice = completion.choices[0];
        resposta = choice?.message?.content || "";
        usage = completion.usage || { prompt_tokens: 0, completion_tokens: 0 };

        const calls = choice?.message?.tool_calls || null;
        if (!calls || calls.length === 0) break;

        messages.push({
          role: "assistant",
          content: resposta || null,
          tool_calls: calls.map((t) => {
            const tc = t as any;
            return {
              id: tc.id,
              type: "function",
              function: { name: tc.function.name, arguments: tc.function.arguments },
            };
          }),
        });

        for (const t of calls) {
          const tc = t as any;
          const args = JSON.parse(tc.function.arguments || "{}") as Record<string, any>;
          toolCalls.push({ name: tc.function.name, args });

          let result: string;
          if (this.config.executeTool) {
            try {
              result = await this.config.executeTool(tc.function.name, args);
            } catch (e: any) {
              result = JSON.stringify({ erro: e.message });
            }
          } else {
            result = JSON.stringify({ erro: "Ferramenta não implementada" });
          }
          toolResults.push({ name: tc.function.name, result });

          messages.push({ role: "tool", tool_call_id: tc.id, content: result });
        }

        completion = await this.client.chat.completions.create({
          model,
          temperature: this.config.temperature ?? 0.7,
          max_tokens: this.config.max_tokens ?? 4096,
          messages,
          tools: tools.length > 0 ? tools : undefined,
          tool_choice: tools.length > 0 ? "auto" : undefined,
        });
      }

      return {
        respuesta: resposta,
        toolCalls,
        toolResults,
        tokens: {
          input: usage.prompt_tokens,
          output: usage.completion_tokens,
          total: usage.prompt_tokens + usage.completion_tokens,
        },
        model,
      };
    } catch (err: any) {
      return { respuesta: "", model, error: err.message, status: 500 };
    }
  }

  async countTokens(text: string): Promise<number> {
    return estimarTokens(text);
  }
}
