// Ações do AI Agent sobre agendamentos/clientes.
// Mesmas validações do booking web (expediente, conflito, limite diário, plano grátis)
// para que o agente nunca consiga burlar as regras do negócio.

import { createAdminClient } from "@/lib/supabase/admin";
import { getPlanoAtivo, AGENDAMENTOS_GRATIS_POR_MES } from "@/lib/planos";
import { estimar } from "@/lib/precos";
import type { Servico, Adicional, Frequencia, Promocao } from "@/types";

const VALID_HORA = /^([01]\d|2[0-3]):[0-5]\d$/;
const VALID_WHATSAPP = /^\d{10,13}$/;
const round05 = (n: number) => Math.round(n * 2) / 2;
const horaParaMin = (h: string) => {
  const [hh, mm] = h.split(":").map(Number);
  return hh * 60 + mm;
};
const formatarMinuto = (m: number) =>
  `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
const MAX_DURACAO_DIAS = 31;
const somarDiasISO = (dataISO: string, dias: number) => {
  const d = new Date(dataISO + "T12:00:00");
  d.setDate(d.getDate() + dias);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
};
const ehMultiDia = (duracao: number, wIni: number, wFim: number) => duracao > wFim - wIni;
const diasDaFaixa = (dataInicio: string, inicioMin: number, duracao: number) => {
  const nDias = Math.max(1, Math.ceil((inicioMin + duracao) / 1440));
  return Array.from({ length: nDias }, (_, i) =>
    i === 0 ? dataInicio : somarDiasISO(dataInicio, i)
  );
};

function duracaoMinutos(servico: Servico, horas: number): number {
  if (servico.tipo_preco === "fixo") {
    return servico.duracao_minutos || 60;
  }
  return Math.max(30, Math.round((horas || 1) * 60));
}

async function carregarJornada(adminDb: any, profissionalId: string) {
  const { data: cfg } = await adminDb
    .from("configuracoes")
    .select("horario_inicio, horario_fim")
    .eq("profissional_id", profissionalId)
    .single();
  return {
    wIni: Number(cfg?.horario_inicio) || 8 * 60,
    wFim: Number(cfg?.horario_fim) || 20 * 60,
  };
}

/** Slots livres de 30min para um serviço numa data (mesma lógica do GET /api/agendamentos). */
export async function buscarHorariosDisponiveis(
  profissionalId: string,
  servicoId: string,
  data: string
): Promise<string> {
  const adminDb = createAdminClient();

  const [{ data: servico }, { wIni, wFim }, config, ags, servicosDb] = await Promise.all([
    adminDb.from("servicos").select("*").eq("id", servicoId).eq("profissional_id", profissionalId).eq("ativo", true).single(),
    carregarJornada(adminDb, profissionalId),
    adminDb.from("configuracoes").select("max_agendamentos_dia").eq("profissional_id", profissionalId).single(),
    adminDb
      .from("agendamentos")
      .select("data, hora, servico_id, horas")
      .eq("profissional_id", profissionalId)
      .gte("data", somarDiasISO(data, -MAX_DURACAO_DIAS))
      .lte("data", data)
      .neq("status", "cancelado"),
    adminDb.from("servicos").select("id, tipo_preco, duracao_minutos"),
  ]);

  if (!servico) return "ERRO: serviço não encontrado ou inativo.";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) return "ERRO: data inválida (use AAAA-MM-DD).";

  const duracao = duracaoMinutos(servico as Servico, 0);
  const durMap = new Map<string, number>();
  for (const s of servicosDb.data || []) {
    if (s.tipo_preco === "fixo" && s.duracao_minutos) durMap.set(s.id, s.duracao_minutos);
  }

  const ocupados: { inicio: number; minutos: number }[] = [];
  for (const a of ags.data || []) {
    if (!a.hora) continue;
    const minutos = durMap.get(a.servico_id) || Math.max(30, Math.round((Number(a.horas) || 1) * 60));
    if (ehMultiDia(minutos, wIni, wFim)) {
      if (diasDaFaixa(a.data, horaParaMin(a.hora), minutos).includes(data)) {
        ocupados.push({ inicio: 0, minutos: 1440 });
      }
    } else if (a.data === data) {
      ocupados.push({ inicio: horaParaMin(a.hora), minutos });
    }
  }

  const maxDia = Number(config.data?.max_agendamentos_dia) || 0;
  const totalDia = (ags.data || []).filter((a) => a.data === data).length;
  if (maxDia > 0 && totalDia >= maxDia) {
    return `LIMITE: o dia ${data} já atingiu o limite de ${maxDia} agendamentos. Proponha outra data.`;
  }
  if (duracao > wFim - wIni) {
    const dias = Math.ceil(duracao / 1440);
    const livre = !ocupados.some((o) => o.minutos === 1440);
    return livre
      ? `SERVIÇO MULTI-DIA: dura ${dias} dia(s). Só pode iniciar às ${formatarMinuto(wIni)} de ${data}. Slot único: ${formatarMinuto(wIni)}.`
      : `INDISPONÍVEL: ${data} já está ocupado (serviço multi-dia). Proponha outra data.`;
  }

  const slots: string[] = [];
  for (let ini = wIni; ini + duracao <= wFim; ini += 30) {
    const conflito = ocupados.some((o) => ini < o.inicio + o.minutos && ini + duracao > o.inicio);
    if (!conflito) slots.push(formatarMinuto(ini));
  }

  return slots.length
    ? `Horários livres em ${data} (${formatarMinuto(wIni)}–${formatarMinuto(wFim)}, duração ${Math.round(duracao / 60)}h): ${slots.join(", ")}`
    : `Sem horários livres em ${data}. Proponha outra data.`;
}

/** Cria um agendamento CONFIRMADO com todas as validações do booking web. */
export async function criarAgendamento(
  profissionalId: string,
  args: {
    servico_id?: string;
    data?: string;
    hora?: string;
    cliente_nome?: string;
    cliente_whatsapp?: string;
    cliente_endereco?: string;
  }
): Promise<string> {
  const { servico_id, data, hora, cliente_nome, cliente_whatsapp, cliente_endereco } = args;

  if (!servico_id || !data || !hora || !cliente_nome?.trim() || !cliente_whatsapp) {
    return "ERRO: faltam dados. Necessário: servico_id, data (AAAA-MM-DD), hora (HH:MM), cliente_nome, cliente_whatsapp (com DDD, só dígitos).";
  }
  const whatsapp = String(cliente_whatsapp).replace(/\D/g, "");
  if (!VALID_WHATSAPP.test(whatsapp)) {
    return "ERRO: WhatsApp inválido. Informe o número com DDD, só dígitos (ex: 41999999999).";
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) return "ERRO: data inválida.";
  if (!VALID_HORA.test(hora)) return "ERRO: hora inválida (use HH:MM).";

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const dataAlvo = new Date(data + "T12:00:00");
  if (isNaN(dataAlvo.getTime()) || dataAlvo < hoje) {
    return "ERRO: escolha uma data futura.";
  }

  const adminDb = createAdminClient();

  const { data: prof } = await adminDb
    .from("profissionais")
    .select("id, categoria, status")
    .eq("id", profissionalId)
    .single();
  if (!prof || prof.status !== "ativo") return "ERRO: profissional indisponível.";

  const { data: servico } = await adminDb
    .from("servicos")
    .select("*")
    .eq("id", servico_id)
    .eq("profissional_id", profissionalId)
    .eq("ativo", true)
    .single();
  if (!servico) return "ERRO: serviço inválido. Use consultar_servicos para obter um ID válido.";

  const { wIni, wFim } = await carregarJornada(adminDb, profissionalId);
  const usaComodos = prof.categoria === "limpeza";
  const horasBase = servico.tipo_preco !== "fixo" ? round05(servico.horas_base || 0) : 0;
  const orcamento = estimar({
    servico: servico as Servico,
    horas_base: horasBase,
    adicionais: [],
    adicionaisSelecionados: [],
    frequencia: null,
    promocao: null,
  });

  const horas = servico.tipo_preco === "fixo" ? 0 : orcamento.horas;
  const duracao = duracaoMinutos(servico as Servico, horas);
  const inicioMin = horaParaMin(hora);
  const multiDia = ehMultiDia(duracao, wIni, wFim);

  if (multiDia) {
    if (duracao > MAX_DURACAO_DIAS * 1440) return "ERRO: duração máxima de 31 dias.";
    if (inicioMin !== wIni) {
      return `ERRO: este serviço dura mais de um dia de expediente — só pode iniciar às ${formatarMinuto(wIni)}.`;
    }
  } else if (inicioMin < wIni || inicioMin + duracao > wFim) {
    return "ERRO: horário fora do expediente. Use buscar_horarios_disponiveis para ver os horários válidos.";
  }

  const { plano, ativo } = await getPlanoAtivo(profissionalId);
  if (plano === "gratis" || !ativo) {
    const inicioMes = new Date();
    inicioMes.setDate(1);
    inicioMes.setHours(0, 0, 0, 0);
    const { count } = await adminDb
      .from("agendamentos")
      .select("id", { count: "exact", head: true })
      .eq("profissional_id", profissionalId)
      .gte("created_at", inicioMes.toISOString())
      .neq("status", "cancelado");
    if ((count || 0) >= AGENDAMENTOS_GRATIS_POR_MES) {
      return "ERRO: o plano grátis atingiu o limite de agendamentos do mês. Avise o dono do negócio.";
    }
  }

  const { data: config } = await adminDb
    .from("configuracoes")
    .select("max_agendamentos_dia")
    .eq("profissional_id", profissionalId)
    .single();
  const maxDia = Number(config?.max_agendamentos_dia) || 0;

  const minhasDatas = multiDia ? diasDaFaixa(data, inicioMin, duracao) : [data];
  const { data: doDia } = await adminDb
    .from("agendamentos")
    .select("data, hora, servico_id, horas")
    .eq("profissional_id", profissionalId)
    .gte("data", somarDiasISO(data, -MAX_DURACAO_DIAS))
    .lte("data", data)
    .neq("status", "cancelado");

  if (maxDia > 0) {
    const totalDia = (doDia || []).filter((a) => a.data === data).length;
    if (totalDia >= maxDia) return "ERRO: esse dia já atingiu o limite de agendamentos. Proponha outra data.";
  }

  const { data: servicosDia } = await adminDb.from("servicos").select("id, tipo_preco, duracao_minutos");
  const durMap = new Map<string, number>();
  for (const s of servicosDia || []) {
    if (s.tipo_preco === "fixo" && s.duracao_minutos) durMap.set(s.id, s.duracao_minutos);
  }

  const conflito = (doDia || []).some((a) => {
    if (!a.hora) return false;
    const aIni = horaParaMin(a.hora);
    const aDur = durMap.get(a.servico_id) || Math.max(30, Math.round((Number(a.horas) || 1) * 60));
    const aMulti = ehMultiDia(aDur, wIni, wFim);
    const aDatas = aMulti ? diasDaFaixa(a.data, aIni, aDur) : [a.data];
    return aDatas.some((ad) => {
      if (!minhasDatas.includes(ad)) return false;
      const meuIni = multiDia ? 0 : inicioMin;
      const meuFim = multiDia ? 1440 : inicioMin + duracao;
      const delIni = aMulti ? 0 : aIni;
      const delFim = aMulti ? 1440 : aIni + aDur;
      return meuIni < delFim && meuFim > delIni;
    });
  });

  if (conflito) return "ERRO: esse horário já foi reservado. Use buscar_horarios_disponiveis e proponha outro.";

  // Cliente (create or get)
  let clienteId: string | null = null;
  const { data: existing } = await adminDb
    .from("clientes")
    .select("id")
    .eq("profissional_id", profissionalId)
    .eq("whatsapp", whatsapp)
    .maybeSingle();
  if (existing) {
    clienteId = existing.id;
  } else {
    const { data: newCliente } = await adminDb
      .from("clientes")
      .insert({
        profissional_id: profissionalId,
        nome: cliente_nome.trim(),
        whatsapp,
        endereco: cliente_endereco || null,
      })
      .select("id")
      .single();
    clienteId = newCliente?.id || null;
  }

  const { data: agendamento, error } = await adminDb
    .from("agendamentos")
    .insert({
      profissional_id: profissionalId,
      cliente_id: clienteId,
      servico_id: servico_id || null,
      servico_nome: servico.nome,
      cliente_nome: cliente_nome.trim(),
      cliente_whatsapp: whatsapp,
      cliente_endereco: cliente_endereco || null,
      data,
      hora,
      horas,
      valor: orcamento.total,
      status: "confirmado",
      adicionais: [],
      token_avaliacao: crypto.randomUUID(),
      consentimento_lgpd: true,
      consentimento_data: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error) {
    if (String(error.message).toLowerCase().includes("duplicate")) {
      return "ERRO: esse horário acabou de ser reservado. Proponha outro.";
    }
    console.error("[agente] erro ao criar agendamento:", error);
    return "ERRO: não foi possível criar o agendamento. Tente novamente.";
  }

  try {
    const { enviarConfirmacao, enviarNotificacaoProfissional } = await import("@/lib/notificacoes");
    await enviarConfirmacao({
      profissional_id: profissionalId,
      cliente_whatsapp: whatsapp,
      servico_nome: servico.nome,
      data,
      hora,
      valor: orcamento.total,
      endereco: cliente_endereco || null,
    });
    await enviarNotificacaoProfissional({
      profissional_id: profissionalId,
      cliente_nome: cliente_nome.trim(),
      servico_nome: servico.nome,
      adicionais: [],
      data,
      hora,
      valor: orcamento.total,
    });
  } catch (err) {
    console.warn("[agente] notificações não enviadas:", err);
  }

  return `SUCESSO: agendamento criado e CONFIRMADO para ${cliente_nome.trim()} (${servico.nome}) em ${data} às ${hora.slice(0, 5)} por R$ ${orcamento.total.toFixed(2)}. ID: ${agendamento.id}.`;
}

/** Altera status e dispara as notificações correspondentes (mesma lógica do PATCH). */
export async function atualizarStatusAgendamento(
  profissionalId: string,
  agendamentoId: string,
  novoStatus: string
): Promise<string> {
  if (!["confirmado", "concluido", "cancelado"].includes(novoStatus)) {
    return "ERRO: status inválido. Use confirmado, concluido ou cancelado.";
  }

  const adminDb = createAdminClient();
  const { data: agendamento, error: e1 } = await adminDb
    .from("agendamentos")
    .select("id, profissional_id, cliente_whatsapp, servico_nome, data, hora, status")
    .eq("id", agendamentoId)
    .single();

  if (e1 || !agendamento) return "ERRO: agendamento não encontrado.";
  if (agendamento.profissional_id !== profissionalId) return "ERRO: sem permissão sobre este agendamento.";

  const { error } = await adminDb.from("agendamentos").update({ status: novoStatus }).eq("id", agendamentoId);
  if (error) return `ERRO: ${error.message}`;

  try {
    if (novoStatus === "cancelado") {
      const { enviarCancelamento } = await import("@/lib/notificacoes");
      await enviarCancelamento({
        profissional_id: profissionalId,
        cliente_whatsapp: agendamento.cliente_whatsapp,
        servico_nome: agendamento.servico_nome,
        data: agendamento.data,
        hora: agendamento.hora,
      });
    } else if (novoStatus === "concluido") {
      const { enviarConviteAvaliacao, enviarConviteReagendamento } = await import("@/lib/notificacoes");
      await enviarConviteAvaliacao(agendamentoId);
      await enviarConviteReagendamento(agendamentoId);
    }
  } catch (err) {
    console.warn("[agente] notificação de status não enviada:", err);
  }

  return `SUCESSO: agendamento ${agendamento.id.slice(0, 8)} (${agendamento.servico_nome}, ${agendamento.data} ${agendamento.hora?.slice(0, 5)}) agora está ${novoStatus}.`;
}

/** Histórico do cliente por nome ou WhatsApp. */
export async function consultarCliente(
  profissionalId: string,
  nome?: string,
  whatsapp?: string
): Promise<string> {
  const adminDb = createAdminClient();

  let q = adminDb.from("clientes").select("*").eq("profissional_id", profissionalId);
  if (whatsapp) {
    q = q.eq("whatsapp", String(whatsapp).replace(/\D/g, ""));
  } else if (nome?.trim()) {
    q = q.ilike("nome", `%${nome.trim()}%`);
  } else {
    return "ERRO: informe nome ou whatsapp do cliente.";
  }
  q = q.limit(5);

  const { data: clientes, error } = await q;
  if (error || !clientes || clientes.length === 0) {
    return "Nenhum cliente encontrado com esses dados.";
  }

  const linhas: string[] = [];
  for (const c of clientes) {
    const { data: ags } = await adminDb
      .from("agendamentos")
      .select("data, hora, servico_nome, status, valor")
      .eq("cliente_id", c.id)
      .order("data", { ascending: false })
      .limit(10);
    const historico = (ags || [])
      .map((a) => `  ${a.data} ${a.hora?.slice(0, 5)} — ${a.servico_nome} (${a.status}) R$ ${Number(a.valor || 0).toFixed(2)}`)
      .join("\n");
    linhas.push(
      `Cliente: ${c.nome}${c.whatsapp ? ` (${c.whatsapp})` : ""}${c.endereco ? `, ${c.endereco}` : ""}\nHistórico:\n${historico || "  (sem agendamentos)"}`
    );
  }
  return linhas.join("\n\n");
}
