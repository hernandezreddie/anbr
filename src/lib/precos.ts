import type { Servico, Adicional, Frequencia } from "@/types";

const round05 = (n: number) => Math.round(n * 2) / 2;

type PromoAplicavel = {
  tipo: "porcentagem" | "fixo";
  valor: number;
} | null;

function aplicarPromo(base: number, promo: PromoAplicavel): { desconto: number; total: number } {
  if (!promo) return { desconto: 0, total: base };
  const desconto =
    promo.tipo === "porcentagem"
      ? base * (promo.valor / 100)
      : Math.min(Number(promo.valor) || 0, base);
  return {
    desconto: Math.round(desconto * 100) / 100,
    total: Math.max(0, Math.round((base - desconto) * 100) / 100),
  };
}

export function estimar(params: {
  servico: Servico;
  horas_base?: number;
  adicionais?: Adicional[];
  adicionaisSelecionados?: string[];
  frequencia: Frequencia | null;
  promocao?: PromoAplicavel;
}) {
  const { servico, horas_base = 0, adicionais = [], adicionaisSelecionados = [], frequencia, promocao = null } = params;

  if (servico.tipo_preco === "fixo") {
    const precoAdd = adicionaisSelecionados.reduce(
      (s, id) => s + (adicionais.find((a) => a.id === id)?.preco ?? 0),
      0,
    );

    const bruto = servico.preco_fixo + precoAdd;
    const descontoFrequencia = frequencia ? bruto * (frequencia.desconto / 100) : 0;
    const { desconto: descontoPromo, total } = aplicarPromo(bruto - descontoFrequencia, promocao);

    return {
      servico_nome: servico.nome,
      horas: 0,
      bruto,
      descontoFrequencia,
      descontoPromo,
      desconto: descontoFrequencia + descontoPromo,
      total,
      duracao_minutos: servico.duracao_minutos,
    };
  }

  const horasServico = Math.max(servico.horas_minimas, round05(horas_base));
  const horasAdd = adicionaisSelecionados.reduce(
    (s, id) => s + (adicionais.find((a) => a.id === id)?.horas ?? 0),
    0,
  );
  const precoAdd = adicionaisSelecionados.reduce(
    (s, id) => s + (adicionais.find((a) => a.id === id)?.preco ?? 0),
    0,
  );

  const horas = horasServico + horasAdd;
  const bruto = horasServico * servico.valor_hora + precoAdd;
  const descontoFrequencia = frequencia ? bruto * (frequencia.desconto / 100) : 0;
  const { desconto: descontoPromo, total } = aplicarPromo(bruto - descontoFrequencia, promocao);

  return {
    servico_nome: servico.nome,
    horas,
    bruto,
    descontoFrequencia,
    descontoPromo,
    desconto: descontoFrequencia + descontoPromo,
    total,
    duracao_minutos: undefined,
  };
}
