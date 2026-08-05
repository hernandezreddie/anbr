const MODEL_RATES: Record<string, { input: number; output: number }> = {
  "gpt-4o-mini": { input: 0.15 / 1_000_000, output: 0.60 / 1_000_000 },
  "gpt-4o": { input: 2.50 / 1_000_000, output: 10.00 / 1_000_000 },
  "gpt-4.1": { input: 2.00 / 1_000_000, output: 8.00 / 1_000_000 },
  "gpt-4.1-mini": { input: 0.40 / 1_000_000, output: 1.60 / 1_000_000 },
  "claude-sonnet-4-20250514": { input: 3.00 / 1_000_000, output: 15.00 / 1_000_000 },
  "claude-haiku-3-5-20241022": { input: 0.80 / 1_000_000, output: 4.00 / 1_000_000 },
  "openai/gpt-4o-mini": { input: 0.15 / 1_000_000, output: 0.60 / 1_000_000 },
  "deepseek/deepseek-chat": { input: 0.27 / 1_000_000, output: 1.10 / 1_000_000 },
  "deepseek/deepseek-reasoner": { input: 0.55 / 1_000_000, output: 2.19 / 1_000_000 },
  "meta-llama/llama-3.1-8b-instruct:free": { input: 0, output: 0 },
  "meta-llama/llama-3.3-70b-instruct:free": { input: 0, output: 0 },
  "meta-llama/llama-3.3-70b-instruct": { input: 0.25 / 1_000_000, output: 1.00 / 1_000_000 },
  "mistralai/mistral-7b-instruct:free": { input: 0, output: 0 },
  "gemini-1.5-flash": { input: 0.075 / 1_000_000, output: 0.30 / 1_000_000 },
  "gemini-2.0-flash": { input: 0.10 / 1_000_000, output: 0.40 / 1_000_000 },
  "gemini-2.5-flash": { input: 0.30 / 1_000_000, output: 2.50 / 1_000_000 },
};

const DEFAULT_RATE = { input: 0.50 / 1_000_000, output: 1.50 / 1_000_000 };

const EMBEDDING_COST_PER_TOKEN = 0.00013 / 1_000;

export function calcularCustoTokens(
  tokensInput: number,
  tokensOutput: number,
  model: string
): number {
  const rates = MODEL_RATES[model] || DEFAULT_RATE;
  return tokensInput * rates.input + tokensOutput * rates.output;
}

export function calcularCustoEmbedding(tokenCount: number): number {
  return tokenCount * EMBEDDING_COST_PER_TOKEN;
}

export function estimarTokens(texto: string): number {
  return Math.ceil(texto.length / 4);
}
