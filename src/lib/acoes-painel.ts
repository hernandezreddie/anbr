export type AgParaAcao = {
  id: string;
  cliente_nome: string;
  cliente_whatsapp: string | null;
  data: string | null;
  hora: string | null;
  servico_nome: string | null;
  valor: number;
  status: string;
  created_at: string | null;
};

export type MensagensEstilo = {
  confirmacao: string;
  lembrete: string;
};

export type AcaoPainel = {
  id: string;
  tipo: "confirmar" | "lembrete" | "receber" | "retorno" | "remarcar";
  titulo: string;
  descricao: string;
  mensagem?: string;
  agendamento_id?: string;
  valor?: number;
};

function fmtCurto(data: string | null): string {
  if (!data) return "em breve";
  const [y, m, d] = data.split("-");
  return `${d}/${m}`;
}

function fmtDataHora(data: string | null, hora: string | null): string {
  if (!data) return "em breve";
  return `${fmtCurto(data)}${hora ? ` às ${hora.slice(0, 5)}` : ""}`;
}

function fmtR$(n: number) {
  return `R$ ${Number(n).toFixed(2).replace(".", ",")}`;
}

const HOJE = new Date().toLocaleDateString("sv-SE");
const AMANHA = new Date(Date.now() + 86400000).toLocaleDateString("sv-SE");

function preencher(texto: string, ag: AgParaAcao): string {
  return texto
    .replaceAll("{servico}", ag.servico_nome || "o serviço")
    .replaceAll("{data}", fmtCurto(ag.data))
    .replaceAll("{hora}", ag.hora ? ag.hora.slice(0, 5) : "");
}

export function gerarAcoes(
  items: AgParaAcao[],
  idsPagos: Set<string>,
  msgs: MensagensEstilo,
  limite = 8
): AcaoPainel[] {
  const acoes: AcaoPainel[] = [];

  for (const ag of items) {
    if (acoes.length >= limite) break;

    if (ag.status === "solicitado") {
      acoes.push({
        id: `confirmar-${ag.id}`,
        tipo: "confirmar",
        titulo: `Confirmar ${ag.cliente_nome.split(" ")[0]}`,
        descricao: `Agendou ${ag.servico_nome ?? "serviço"} para ${fmtDataHora(ag.data, ag.hora)}. Confirme pelo WhatsApp.`,
        mensagem: preencher(msgs.confirmacao, ag),
        agendamento_id: ag.id,
      });
      continue;
    }

    if (ag.status === "confirmado" && ag.data === AMANHA) {
      acoes.push({
        id: `lembrete-${ag.id}`,
        tipo: "lembrete",
        titulo: `Lembrete para ${ag.cliente_nome.split(" ")[0]}`,
        descricao: `${ag.servico_nome ?? "Serviço"} amanhã (${fmtCurto(ag.data)}). Envie o lembrete de véspera.`,
        mensagem: preencher(msgs.lembrete, ag),
        agendamento_id: ag.id,
      });
      continue;
    }

    if (ag.status === "concluido" && !idsPagos.has(ag.id)) {
      acoes.push({
        id: `receber-${ag.id}`,
        tipo: "receber",
        titulo: `Receber de ${ag.cliente_nome.split(" ")[0]}`,
        descricao: `Serviço concluído e não pago: ${fmtR$(ag.valor)}. Gere o Pix para cobrar.`,
        valor: ag.valor,
        agendamento_id: ag.id,
      });
      continue;
    }

    if (ag.status === "concluido" && idsPagos.has(ag.id)) {
      acoes.push({
        id: `retorno-${ag.id}`,
        tipo: "retorno",
        titulo: `Sugerir retorno a ${ag.cliente_nome.split(" ")[0]}`,
        descricao: "Já foi atendido(a). Proponha o próximo horário ou plano mensal.",
        mensagem: `Olá ${ag.cliente_nome.split(" ")[0]}! Obrigado(a) pela preferência. Quer já deixar agendado o próximo horário?`,
        agendamento_id: ag.id,
      });
      continue;
    }

    if (ag.status === "cancelado") {
      acoes.push({
        id: `remarcar-${ag.id}`,
        tipo: "remarcar",
        titulo: `Retomar contato com ${ag.cliente_nome.split(" ")[0]}`,
        descricao: "O último agendamento foi cancelado. Uma mensagem pode recuperar a venda.",
        mensagem: `Olá ${ag.cliente_nome.split(" ")[0]}! Tudo bem? Senti sua falta por aqui. Quer remarcar?`,
        agendamento_id: ag.id,
      });
      continue;
    }
  }

  return acoes;
}

export const ACRO_TIPO_META: Record<AcaoPainel["tipo"], { icone: string; cor: string }> = {
  confirmar: { icone: "check", cor: "#d97706" },
  lembrete: { icone: "bell", cor: "#2563eb" },
  receber: { icone: "wallet", cor: "#059669" },
  retorno: { icone: "sparkles", cor: "#7c3aed" },
  remarcar: { icone: "refresh", cor: "#64748b" },
};
