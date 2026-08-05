import { AIProvider } from "./types";
import { OpenAIProvider } from "./providers/openai";
import { AnthropicProvider } from "./providers/anthropic";
import { GeminiProvider } from "./providers/gemini";
import { OpenRouterProvider } from "./providers/openrouter";
import type { AIProviderConfig } from "./types";

// Modelos OpenRouter seguem o padrão "provedor/modelo" (ex: openai/gpt-4o-mini, deepseek/deepseek-chat)
const OPENROUTER_PREFIXES = ["openai/", "anthropic/", "google/", "meta-llama/", "deepseek/", "mistralai/", "cohere/", "x-ai/", "nousresearch/", "qwen/", "amazon/", "microsoft/"];

function isOpenRouterModel(model: string): boolean {
  const m = model.toLowerCase();
  return OPENROUTER_PREFIXES.some((p) => m.startsWith(p)) || m.includes(":free");
}

export function createAIProvider(config: AIProviderConfig): AIProvider | null {
  const model = config.model || "gpt-4o-mini";
  const base = model.split("/").pop() || model;

  // OpenRouter primeiro: detecta pelo prefixo ou sufixo :free
  if (isOpenRouterModel(model)) {
    return new OpenRouterProvider(config);
  }

  switch (base.split("-")[0].toLowerCase()) {
    case "gpt":
      return new OpenAIProvider(config);
    case "claude":
      return new AnthropicProvider(config);
    case "gemini":
      return new GeminiProvider(config);
    default:
      // Por defecto, usar OpenAI para modelos desconocidos
      console.warn(`Modelo ${config.model} no reconocido, usando OpenAI como fallback`);
      return new OpenAIProvider(config);
  }
}

// Función para obtener el precio del modelo desde costs.ts
export function getModelCost(model: string): { input: number; output: number } {
  // Se actualizará después cuando actualizemos costs.ts
  // Por ahora retornamos un default
  return { input: 0.5 / 1_000_000, output: 1.5 / 1_000_000 };
}
