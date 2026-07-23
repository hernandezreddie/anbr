import type { Servico, Adicional, Frequencia } from "@/types";

const round05 = (n: number) => Math.round(n * 2) / 2;

export function estimar(params: {
  servico: Servico;
  horas_base: number;
  adicionais: Adicional[];
  adicionaisSelecionados: string[];
  frequencia: Frequencia | null;
}) {
  const { servico, horas_base, adicionais, adicionaisSelecionados, frequencia } = params;

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
  const desconto = frequencia ? bruto * (frequencia.desconto / 100) : 0;

  return {
    servico_nome: servico.nome,
    horas,
    bruto,
    desconto,
    total: Math.round((bruto - desconto) * 100) / 100,
  };
}
