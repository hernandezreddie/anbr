export type StatusAgendamento = "solicitado" | "confirmado" | "concluido" | "cancelado";

export type EtapaCliente = {
  id: string;
  nome: string;
  cor: string;
  descricao: string;
  proximoPasso: string;
  mensagemSugerida: string;
};

export type HistoricoCliente = {
  data: string | null;
  status: StatusAgendamento | null;
};

function formatarData(data: string): string {
  const d = new Date(data + "T12:00:00");
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

export function obterEtapaCliente(
  historico: HistoricoCliente[],
  nome: string
): EtapaCliente {
  const validos = historico.filter(
    (h) => h.data && h.status && h.status !== "cancelado"
  );
  const concluidos = historico.filter((h) => h.status === "concluido").length;
  const ultimo = validos.sort((a, b) => (a.data! < b.data! ? 1 : -1))[0];
  const status = ultimo?.status ?? "cancelado";
  const dataProx = ultimo?.data;

  if (concluidos >= 2) {
    return {
      id: "recorrente",
      nome: "Cliente fiel",
      cor: "bg-purple-100 text-purple-700",
      descricao: "Já foi atendido(a) 2+ vezes. Valoriza o seu serviço.",
      proximoPasso: "Oferecer plano mensal ou retorno agendado",
      mensagemSugerida: `Olá ${nome}! Tudo certo com você? Posso já deixar agendado o seu próximo horário?`,
    };
  }

  switch (status) {
    case "solicitado":
      return {
        id: "agendado",
        nome: "Agendou, sem confirmação",
        cor: "bg-amber-100 text-amber-700",
        descricao: `Agendou para ${dataProx ? formatarData(dataProx) : "em breve"} e ainda não confirmou.`,
        proximoPasso: "Confirmar o agendamento pelo WhatsApp",
        mensagemSugerida: `Olá ${nome}! Vi seu agendamento para ${dataProx ? formatarData(dataProx) : "em breve"}. Posso confirmar?`,
      };
    case "confirmado":
      return {
        id: "confirmado",
        nome: "Agendamento confirmado",
        cor: "bg-teal-100 text-teal-700",
        descricao: `Confirmou o agendamento de ${dataProx ? formatarData(dataProx) : "em breve"}.`,
        proximoPasso: "Enviar lembrete na véspera (automático)",
        mensagemSugerida: `Olá ${nome}! Só confirmando nosso horário de ${dataProx ? formatarData(dataProx) : "em breve"}. Qualquer imprevisto, me avisa!`,
      };
    case "concluido":
      return {
        id: "concluido",
        nome: "Atendido",
        cor: "bg-blue-100 text-blue-700",
        descricao: "Último atendimento concluído. Momento ideal para avaliar o retorno.",
        proximoPasso: "Pedir avaliação e sugerir retorno em 30 dias",
        mensagemSugerida: `Olá ${nome}! Obrigado(a) pela preferência. Quer já deixar agendado o próximo horário?`,
      };
    default:
      return {
        id: "cancelado",
        nome: "Sem agenda ativa",
        cor: "bg-neutral-100 text-neutral-600",
        descricao: "Último agendamento foi cancelado ou não tem agenda recente.",
        proximoPasso: "Retomar o contato com um remarcado",
        mensagemSugerida: `Olá ${nome}! Tudo bem? Senti sua falta por aqui. Quer remarcar?`,
      };
  }
}
