// Tipos unificados para el sistema multi-proveedor de IA
export interface AIProviderConfig {
  enabled: boolean;
  model: string;
  temperature: number;
  max_tokens: number;
  tools_enabled: string[];
  system_prompt?: string;
  executeTool?: (name: string, args: Record<string, any>) => Promise<string>;
  apiKey?: string;
}

// Tipo genérico para mensajes que pueden ser de cualquier proveedor
export type AIMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

// Resultado estandarizado de una llamada al agente
export interface AIResponse {
  respuesta: string;
  toolCalls?: Array<{ name: string; args: Record<string, any> }>;
  toolResults?: Array<{ name: string; result: string }>;
  tokens?: { input: number; output: number; total: number };
  model: string;
  error?: string;
  status?: number;
}

// Interfaz que todos los proveedores deben implementar
export interface AIProvider {
  chat(mensaje: string, historial: AIMessage[]): Promise<AIResponse>;
  countTokens(text: string): Promise<number>;
}