import Anthropic from "@anthropic-ai/sdk";
import { AIProvider, AIResponse, AIMessage, AIProviderConfig } from "../types";
import { estimarTokens } from "../costs";
import { buildAgentTools } from "../tool-definitions";

export class AnthropicProvider implements AIProvider {
  private config: AIProviderConfig;
  private client: Anthropic | null;

  constructor(config: AIProviderConfig) {
    this.config = config;
    const apiKey = config.apiKey || process.env.ANTHROPIC_API_KEY;
    this.client = apiKey ? new Anthropic({ apiKey, timeout: 10000, maxRetries: 2 }) : null;
  }

  async chat(mensaje: string, historial: AIMessage[] = []): Promise<AIResponse> {
    if (!this.client) {
      return { respuesta: "", model: this.config.model, error: "API key de Anthropic não configurada", status: 500 };
    }

    const model = this.config.model || "claude-sonnet-4-20250514";
    const toolDefs = buildAgentTools(this.config.tools_enabled || []);
    const tools: Anthropic.Tool[] = toolDefs.map((t) => ({
      name: t.name,
      description: t.description,
      input_schema: t.parameters,
    }));

    const messages: Anthropic.MessageParam[] = historial
      .filter((m) => m.role !== "system")
      .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

    messages.push({ role: "user", content: mensaje });

    try {
      const params: Anthropic.MessageCreateParams = {
        model,
        max_tokens: this.config.max_tokens ?? 4096,
        temperature: this.config.temperature ?? 0.7,
        system: this.config.system_prompt || "Você é um assistente útil.",
        messages,
      };
      if (tools.length > 0) params.tools = tools;

      let response = await this.client.messages.create(params);

      const toolCalls: { name: string; args: Record<string, any> }[] = [];
      const toolResults: { name: string; result: string }[] = [];

      // Loop de tool-calling nativo (tool_use / tool_result)
      for (let round = 0; round < 5; round++) {
        const toolUses = response.content.filter((b) => b.type === "tool_use");
        if (toolUses.length === 0) break;

        messages.push({ role: "assistant", content: response.content });

        const userContent: Anthropic.ContentBlockParam[] = [];
        for (const tu of toolUses) {
          const args = tu.input as Record<string, any>;
          toolCalls.push({ name: tu.name, args });

          let result: string;
          if (this.config.executeTool) {
            try {
              result = await this.config.executeTool(tu.name, args);
            } catch (e: any) {
              result = JSON.stringify({ erro: e.message });
            }
          } else {
            result = JSON.stringify({ erro: "Ferramenta não implementada" });
          }
          toolResults.push({ name: tu.name, result });

          userContent.push({
            type: "tool_result",
            tool_use_id: tu.id,
            content: result,
          });
        }

        messages.push({ role: "user", content: userContent });
        response = await this.client.messages.create(params);
      }

      const texto = response.content
        .filter((b) => b.type === "text")
        .map((b) => (b.type === "text" ? b.text : ""))
        .join("");

      return {
        respuesta: texto,
        toolCalls,
        toolResults,
        tokens: {
          input: response.usage.input_tokens,
          output: response.usage.output_tokens,
          total: response.usage.input_tokens + response.usage.output_tokens,
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
