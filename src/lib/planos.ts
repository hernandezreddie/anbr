import { createAdminClient } from "@/lib/supabase/admin";

export type PlanoId = "gratis" | "profissional" | "ia_premium";

export interface PlanoInfo {
  id: PlanoId;
  nome: string;
  precoMensal: number;
  cor: string;
  desc: string;
}

export const PLANOS: Record<PlanoId, PlanoInfo> = {
  gratis: { id: "gratis", nome: "Grátis", precoMensal: 0, cor: "#6b7280", desc: "Teste a plataforma sem compromisso." },
  profissional: { id: "profissional", nome: "Profissional", precoMensal: 49, cor: "#0d9488", desc: "Presença completa: domínio próprio, Google Calendar e redes sociais." },
  ia_premium: { id: "ia_premium", nome: "IA Premium", precoMensal: 99, cor: "#9333ea", desc: "Automação total com AI Agent inteligente e todos os recursos." },
};

export const PLANOS_ORDER: PlanoId[] = ["gratis", "profissional", "ia_premium"];

export const PLANOS_COM_GOOGLE: PlanoId[] = ["profissional", "ia_premium"];
export const PLANOS_COM_META: PlanoId[] = ["gratis", "profissional", "ia_premium"];
export const PLANOS_COM_AGENTE: PlanoId[] = ["profissional", "ia_premium"];
export const PLANOS_COM_DOMINIO: PlanoId[] = ["profissional", "ia_premium"];
export const PLANOS_ILIMITADO: PlanoId[] = ["profissional", "ia_premium"];
export const AGENDAMENTOS_GRATIS_POR_MES = 30;

export const AGENTE_MSG_POR_MES: Record<PlanoId, number> = {
  gratis: 0,
  profissional: 500,
  ia_premium: 2000,
};

export function formatarBRL(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export interface PlanoAtivo {
  plano: PlanoId;
  nome: string;
  ativo: boolean;
  expira_em: string | null;
}

/**
 * Determina o plano ativo do profissional.
 * Plano pago sem expiração registrada é considerado ativo.
 * Plano pago expirado volta a valer como "gratis".
 */
export async function getPlanoAtivo(profissional_id: string): Promise<PlanoAtivo> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("profissionais")
    .select("plano, plano_expira_em")
    .eq("id", profissional_id)
    .single();

  const planoRaw = (data?.plano || "gratis") as PlanoId;
  const expira = data?.plano_expira_em ? new Date(data.plano_expira_em) : null;

  if (planoRaw === "gratis") {
    return { plano: "gratis", nome: PLANOS.gratis.nome, ativo: false, expira_em: null };
  }

  const ativo = !expira || expira.getTime() > Date.now();
  return {
    plano: ativo ? planoRaw : "gratis",
    nome: ativo ? PLANOS[planoRaw].nome : PLANOS.gratis.nome,
    ativo,
    expira_em: data?.plano_expira_em || null,
  };
}

/**
 * Verifica se o profissional tem um dos planos permitidos (ativos).
 * Retorna null se permitido, ou um erro amigável com upgrade info.
 */
export async function exigirPlano(
  profissional_id: string,
  permitidos: PlanoId[],
  recurso: string
): Promise<{ error: string; status: number } | null> {
  const { plano, ativo } = await getPlanoAtivo(profissional_id);

  if (!permitidos.includes(plano) || (plano !== "gratis" && !ativo)) {
    const nomes = permitidos
      .filter((p) => p !== "gratis")
      .map((p) => PLANOS[p].nome)
      .join(" ou ");
    return {
      error: `O recurso ${recurso} requer o plano ${nomes}. Assine em /painel/plano.`,
      status: 403,
    };
  }
  return null;
}

/**
 * Ativa/renova o plano de um profissional de forma ACUMULATIVA:
 * expiração = max(hoje, expiração atual) + N meses.
 * Usada pelo webhook de pagamento (Fase 5) e pela confirmação manual do admin.
 */
export async function extenderPlano(
  profissional_id: string,
  plano: PlanoId,
  meses: number
): Promise<{ expira_em: string }> {
  const supabase = createAdminClient();
  const { data: prof } = await supabase
    .from("profissionais")
    .select("plano, plano_expira_em")
    .eq("id", profissional_id)
    .single();

  const expiraAtual = prof?.plano_expira_em ? new Date(prof.plano_expira_em) : null;
  const inicio = expiraAtual && expiraAtual.getTime() > Date.now() ? expiraAtual : new Date();
  const novaExpira = new Date(inicio);
  novaExpira.setMonth(novaExpira.getMonth() + meses);

  const { error } = await supabase
    .from("profissionais")
    .update({
      plano,
      plano_expira_em: novaExpira.toISOString(),
      ultimo_pagamento: new Date().toISOString(),
    })
    .eq("id", profissional_id);

  if (error) throw error;
  return { expira_em: novaExpira.toISOString() };
}

/**
 * Verifica o limite mensal de mensagens de IA do plano.
 * Retorna null se houver cota, ou erro com upgrade info.
 */
export async function checarCotaAgente(
  profissional_id: string,
  adminDb: Awaited<ReturnType<typeof createAdminClient>>
): Promise<{ error: string; status: number } | null> {
  const { plano } = await getPlanoAtivo(profissional_id);
  const limite = AGENTE_MSG_POR_MES[plano] || 0;

  const inicioMes = new Date();
  inicioMes.setDate(1);
  inicioMes.setHours(0, 0, 0, 0);
  const { count } = await adminDb
    .from("agent_messages")
    .select("id", { count: "exact", head: true })
    .eq("profissional_id", profissional_id)
    .eq("role", "assistant")
    .gt("tokens_input", 0)
    .gte("created_at", inicioMes.toISOString());

  if ((count || 0) >= limite) {
    return {
      error: `Seu plano permite ${limite} mensagens de IA por mês. Assine um plano maior em /painel/plano.`,
      status: 403,
    };
  }
  return null;
}
