import { createAdminClient } from "@/lib/supabase/admin";
import { getPlanoAtivo } from "@/lib/planos";
import { resolveApiKey } from "./agent";

export type TipoErro = 
  | "sem_chave"
  | "chave_invalida" 
  | "sem_creditos"
  | "modelo_invalido"
  | "erro_rede"
  | "erro_provedor"
  | "desativado"
  | "plano_expirado"
  | "plano_nao_permite"
  | null;

export interface StatusItem {
  nivel: "ok" | "aviso" | "erro";
  titulo: string;
  detalhe: string;
  acao?: string;
}

export interface DiagnosticoAgente {
  profissional_id: string;
  agente: {
    configurado: boolean;
    habilitado: boolean;
    modelo: string;
  };
  plano: {
    id: string;
    nome: string;
    ativo: boolean;
    expira_em: string | null;
    dias_restantes: number | null;
  };
  provedor: {
    id: "openai" | "anthropic" | "gemini" | "openrouter";
    nome: string;
    modelo: string;
    tem_chave_tenant: boolean;
    tem_chave_global: boolean;
  };
  teste?: {
    ok: boolean;
    tipo_erro: TipoErro;
    mensagem: string;
    duracao_ms: number;
    usando_chave_propria?: boolean;
  };
  status: StatusItem[];
}

function detectarProvedor(modelo: string): "openai" | "anthropic" | "gemini" | "openrouter" {
  const m = modelo.toLowerCase();
  if (m.startsWith("gemini")) return "gemini";
  if (m.startsWith("claude")) return "anthropic";
  if (m.startsWith("gpt")) return "openai";
  const openRouterPrefixes = [
    "openai/", "anthropic/", "google/", "meta-llama/", "deepseek/", 
    "mistralai/", "cohere/", "x-ai/", "nousresearch/", "qwen/", "amazon/", "microsoft/"
  ];
  if (openRouterPrefixes.some(p => m.startsWith(p)) || m.includes(":free")) {
    return "openrouter";
  }
  return "openai";
}

function pegarChaveGlobal(provedor: string): string | undefined {
  switch (provedor) {
    case "openai": return process.env.OPENAI_API_KEY;
    case "anthropic": return process.env.ANTHROPIC_API_KEY;
    case "gemini": return process.env.GEMINI_API_KEY;
    case "openrouter": return process.env.OPENROUTER_API_KEY;
    default: return undefined;
  }
}

async function testarConexao(
  provedor: string, 
  modelo: string, 
  apiKey: string
): Promise<{ ok: boolean; tipo_erro: TipoErro; mensagem: string }> {
  const inicio = Date.now();
  try {
    switch (provedor) {
      case "openai": {
        const OpenAI = (await import("openai")).default;
        const client = new OpenAI({ apiKey });
        await client.chat.completions.create({
          model: modelo,
          max_tokens: 1,
          messages: [{ role: "user", content: "ok" }],
        });
        return { ok: true, tipo_erro: null, mensagem: "Conexão OK" };
      }
      case "anthropic": {
        const Anthropic = (await import("@anthropic-ai/sdk")).default;
        const client = new Anthropic({ apiKey, timeout: 10000, maxRetries: 1 });
        await client.messages.create({
          model: modelo,
          max_tokens: 1,
          messages: [{ role: "user", content: "ok" }],
        });
        return { ok: true, tipo_erro: null, mensagem: "Conexão OK" };
      }
      case "gemini": {
        const { GoogleGenerativeAI } = await import("@google/generative-ai");
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: modelo });
        await model.generateContent({
          contents: [{ role: "user", parts: [{ text: "ok" }] }],
          generationConfig: { maxOutputTokens: 1 },
        });
        return { ok: true, tipo_erro: null, mensagem: "Conexão OK" };
      }
      case "openrouter": {
        const OpenAI = (await import("openai")).default;
        const client = new OpenAI({
          apiKey,
          baseURL: "https://openrouter.ai/api/v1",
          defaultHeaders: {
            "HTTP-Referer": process.env.NEXT_PUBLIC_DOMAIN || "https://livreta.app",
            "X-Title": "LIVRETA AI Agent",
          },
        });
        await client.chat.completions.create({
          model: modelo,
          max_tokens: 1,
          messages: [{ role: "user", content: "ok" }],
        });
        return { ok: true, tipo_erro: null, mensagem: "Conexão OK" };
      }
      default:
        return { ok: false, tipo_erro: "erro_provedor", mensagem: `Provedor ${provedor} não reconhecido` };
    }
  } catch (err: any) {
    const msg = err?.message || String(err);
    const status = err?.status || err?.response?.status;
    const code = err?.code;
    
    let tipo_erro: TipoErro = "erro_provedor";
    if (status === 401 || status === 403 || code === "invalid_api_key") {
      tipo_erro = "chave_invalida";
    } else if (status === 429 || code === "insufficient_quota" || msg.includes("insufficient_quota") || msg.includes("no credits remaining") || msg.includes("You have no credits remaining")) {
      tipo_erro = "sem_creditos";
    } else if (status === 404 || code === "model_not_found") {
      tipo_erro = "modelo_invalido";
    } else if (status === 402) {
      tipo_erro = "sem_creditos";
    } else if (!status && (msg.includes("ECONNREFUSED") || msg.includes("ENOTFOUND") || msg.includes("timeout"))) {
      tipo_erro = "erro_rede";
    }
    
    return { 
      ok: false, 
      tipo_erro, 
      mensagem: `${tipo_erro ? `[${tipo_erro}] ` : ""}${msg}`.slice(0, 200) 
    };
  }
}

export async function diagnosticarAgente(
  profissionalId: string,
  opts?: { testar?: boolean }
): Promise<DiagnosticoAgente> {
  const adminDb = createAdminClient();
  
  const [{ data: agentConfig }, { data: profissional }, { data: instanciaWhats }] = await Promise.all([
    adminDb.from("agent_configs").select("*").eq("profissional_id", profissionalId).single(),
    adminDb.from("profissionais").select("plano, plano_expira_em, nome").eq("id", profissionalId).single(),
    adminDb.from("whatsapp_instances").select("provider, connection_status").eq("profissional_id", profissionalId).maybeSingle(),
  ]);

  const planoInfo = await getPlanoAtivo(profissionalId);
  let diasRestantes: number | null = null;
  if (planoInfo.ativo && planoInfo.expira_em) {
    diasRestantes = Math.ceil((new Date(planoInfo.expira_em).getTime() - Date.now()) / 86400000);
  }
  const modelo = agentConfig?.model || "gpt-4o-mini";
  const habilitado = agentConfig?.enabled === true;
  const provedor = detectarProvedor(modelo);
  
  const apiKeys = agentConfig?.api_keys || {};
  const temChaveTenant = !!apiKeys[provedor === "openrouter" ? "openrouter" : provedor];
  const temChaveGlobal = !!pegarChaveGlobal(provedor);
  
  const status: StatusItem[] = [];
  
  if (!agentConfig) {
    status.push({
      nivel: "erro",
      titulo: "Agente não configurado",
      detalhe: "Nenhuma configuração de AI Agent encontrada para este profissional.",
      acao: "Acesse a aba Configuração do Agente e ative o atendente."
    });
  } else if (!habilitado) {
    status.push({
      nivel: "erro",
      titulo: "Agente desativado",
      detalhe: "O AI Agent está desligado e não responderá aos clientes.",
      acao: "Ative a chave 'Ligar o atendente' na configuração."
    });
  } else {
    status.push({ nivel: "ok", titulo: "Agente ativo", detalhe: `Modelo: ${modelo}` });
  }

  if (!planoInfo.ativo) {
    if (planoInfo.plano === "gratis") {
      status.push({
        nivel: "erro",
        titulo: "Plano gratuito não inclui AI Agent",
        detalhe: "O AI Agent requer plano Profissional ou IA Premium.",
        acao: "Assine um plano compatível em /painel/plano."
      });
    } else {
      status.push({
        nivel: "erro",
        titulo: "Plano expirado",
        detalhe: `O plano ${planoInfo.nome} expirou em ${planoInfo.expira_em?.split("T")[0]}.`,
        acao: "Renove o plano em /painel/plano."
      });
    }
  } else {
    status.push({ 
      nivel: "ok", 
      titulo: `Plano ativo: ${planoInfo.nome}`, 
      detalhe: planoInfo.expira_em 
        ? `Expira em ${diasRestantes ?? "?"} dia(s)` 
        : "Sem expiração definida"
    });
  }

  if (temChaveTenant) {
    status.push({ 
      nivel: "ok", 
      titulo: "Chave própria configurada", 
      detalhe: `Usando chave do tenant para ${provedor.toUpperCase()}.` 
    });
  } else if (temChaveGlobal) {
    status.push({ 
      nivel: "aviso", 
      titulo: "Usando chave global do servidor", 
      detalhe: `Sem chave própria do tenant. O agente usará a chave global (${provedor.toUpperCase()}).` 
    });
  } else {
    status.push({ 
      nivel: "erro", 
      titulo: "Nenhuma chave de API disponível", 
      detalhe: `Nem o tenant nem o servidor possuem chave para ${provedor.toUpperCase()}.`,
      acao: "Configure uma chave na aba Chaves de API ou peça ao admin para configurar a chave global."
    });
  }

  if (instanciaWhats) {
    const provider = instanciaWhats.provider === "meta_cloud" ? "Meta Cloud" : "Evolution";
    const estado = instanciaWhats.connection_status || "desconhecido";
    const conectado = ["connected", "open", "active"].includes(estado);
    status.push(
      conectado
        ? { nivel: "ok", titulo: `WhatsApp conectado (${provider})`, detalhe: `Estado: ${estado}` }
        : {
            nivel: "erro",
            titulo: `WhatsApp desconectado (${provider})`,
            detalhe: `Estado: ${estado}`,
            acao: "Reescaneie o QR Code na configuração do agente para reconectar.",
          }
    );
  } else {
    status.push({
      nivel: "aviso",
      titulo: "WhatsApp não conectado",
      detalhe: "Nenhuma instância de WhatsApp configurada.",
      acao: "Conecte uma instância Evolution ou Meta Cloud na configuração do agente.",
    });
  }

  let teste;
  if (opts?.testar && (temChaveTenant || temChaveGlobal)) {
    const apiKey = temChaveTenant ? apiKeys[provedor === "openrouter" ? "openrouter" : provedor] : pegarChaveGlobal(provedor);
    if (apiKey) {
      const inicio = Date.now();
      const resultado = await testarConexao(provedor, modelo, apiKey);
      teste = { ...resultado, duracao_ms: Date.now() - inicio, usando_chave_propria: temChaveTenant };
      if (resultado.ok) {
        status.push({ nivel: "ok", titulo: "Teste de conexão OK", detalhe: `Provedor ${provedor.toUpperCase()} respondeu corretamente.` });
      } else {
        const titulos: Record<Exclude<TipoErro, null>, string> = {
          sem_chave: "Sem chave",
          chave_invalida: "Chave inválida ou sem permissão",
          sem_creditos: "Sem créditos / cota esgotada",
          modelo_invalido: "Modelo não encontrado",
          erro_rede: "Erro de rede ao conectar",
          erro_provedor: "Erro do provedor",
          desativado: "Agente desativado",
          plano_expirado: "Plano expirado",
          plano_nao_permite: "Plano não permite"
        };
        status.push({ 
          nivel: "erro", 
          titulo: (resultado.tipo_erro ? titulos[resultado.tipo_erro] : "Erro no teste") || "Erro no teste", 
          detalhe: resultado.mensagem 
        });
      }
    }
  }

  return {
    profissional_id: profissionalId,
    agente: {
      configurado: !!agentConfig,
      habilitado,
      modelo,
    },
    plano: {
      id: planoInfo.plano,
      nome: planoInfo.nome,
      ativo: planoInfo.ativo,
      expira_em: planoInfo.expira_em,
      dias_restantes: diasRestantes,
    },
    provedor: {
      id: provedor,
      nome: provedor.charAt(0).toUpperCase() + provedor.slice(1),
      modelo,
      tem_chave_tenant: temChaveTenant,
      tem_chave_global: temChaveGlobal,
    },
    teste,
    status,
  };
}
