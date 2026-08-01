import type { CategoriaId } from "@/lib/servicos-padrao";

export type PromocaoPronta = {
  titulo: string;
  texto: string;
  tipo: "porcentagem" | "fixo";
  valor: number;
  dias_semana?: number[];
};

export const PROMOCOES_PADRAO: Record<CategoriaId, PromocaoPronta[]> = {
  limpeza: [
    { titulo: "Primeira limpeza 20% OFF", texto: "Conheça meu trabalho na primeira visita com 20% de desconto. Sem compromisso!", tipo: "porcentagem", valor: 20 },
    { titulo: "Plano semanal com 15% OFF", texto: "Casa sempre limpa, toda semana, com 15% de desconto no pacote semanal.", tipo: "porcentagem", valor: 15 },
    { titulo: "Limpeza pós-obra com 10% OFF", texto: "Reforma acabou? Limpeza pós-obra completa com 10% de desconto.", tipo: "porcentagem", valor: 10 },
    { titulo: "Dias de agenda livre com 10% OFF", texto: "Agende de segunda a quarta e ganhe 10% de desconto.", tipo: "porcentagem", valor: 10, dias_semana: [1, 2, 3] },
  ],
  beleza: [
    { titulo: "Primeira visita 20% OFF", texto: "Sua primeira visita com 20% de desconto. Vem conhecer meu trabalho!", tipo: "porcentagem", valor: 20 },
    { titulo: "Combo corte + escova com 15% OFF", texto: "Corte e escova juntos com 15% de desconto. Saia renovada!", tipo: "porcentagem", valor: 15 },
    { titulo: "Segunda a quarta com 10% OFF", texto: "Dias de agenda livre: 10% de desconto de segunda a quarta.", tipo: "porcentagem", valor: 10, dias_semana: [1, 2, 3] },
  ],
  unhas: [
    { titulo: "Manutenção com 10% OFF", texto: "Manutenção do alongamento com 10% de desconto — unhas sempre impecáveis.", tipo: "porcentagem", valor: 10 },
    { titulo: "Primeira visita 15% OFF", texto: "Primeira vez por aqui? Ganhe 15% de desconto no seu primeiro serviço.", tipo: "porcentagem", valor: 15 },
    { titulo: "Segunda a quinta com 10% OFF", texto: "Agende de segunda a quinta e ganhe 10% de desconto.", tipo: "porcentagem", valor: 10, dias_semana: [1, 2, 3, 4] },
  ],
  saude: [
    { titulo: "Pacote de 5 sessões com 15% OFF", texto: "Cuide de você: pacote de 5 sessões com 15% de desconto.", tipo: "porcentagem", valor: 15 },
    { titulo: "Primeira sessão com 20% OFF", texto: "Sua primeira sessão com 20% de desconto. Puro cuidado, sem compromisso.", tipo: "porcentagem", valor: 20 },
    { titulo: "Segunda a quinta com 10% OFF", texto: "Sessões de segunda a quinta com 10% de desconto.", tipo: "porcentagem", valor: 10, dias_semana: [1, 2, 3, 4] },
  ],
  clinica: [
    { titulo: "Primeira consulta com 15% OFF", texto: "Agende sua primeira consulta com 15% de desconto na avaliação inicial.", tipo: "porcentagem", valor: 15 },
    { titulo: "Retorno em 30 dias com 10% OFF", texto: "Retorno dentro de 30 dias com 10% de desconto. Continuidade do cuidado.", tipo: "porcentagem", valor: 10 },
    { titulo: "Check-up completo com 20% OFF", texto: "Check-up completo com 20% de desconto neste mês.", tipo: "porcentagem", valor: 20 },
  ],
  personal: [
    { titulo: "Pacote de 10 aulas com 15% OFF", texto: "Compromisso com seu resultado: pacote de 10 aulas com 15% de desconto.", tipo: "porcentagem", valor: 15 },
    { titulo: "Primeira aula com 20% OFF", texto: "Primeira aula com 20% de desconto. Sinta a diferença de um treino de verdade.", tipo: "porcentagem", valor: 20 },
    { titulo: "Aulas em dupla com 10% OFF", texto: "Treine com alguém e os dois ganham 10% de desconto.", tipo: "porcentagem", valor: 10 },
  ],
  automotivo: [
    { titulo: "Primeira lavagem com 20% OFF", texto: "Primeira lavagem completa com 20% de desconto. Conheça o serviço!", tipo: "porcentagem", valor: 20 },
    { titulo: "Plano de lavagem mensal com 15% OFF", texto: "Carro sempre no ponto: plano mensal de lavagem com 15% de desconto.", tipo: "porcentagem", valor: 15 },
    { titulo: "Polimento + cristalização com 10% OFF", texto: "Polimento e cristalização juntos com 10% de desconto.", tipo: "porcentagem", valor: 10 },
  ],
  veterinario: [
    { titulo: "Primeiro banho e tosa com 20% OFF", texto: "Primeiro banho e tosa com 20% de desconto. Seu pet vai amar!", tipo: "porcentagem", valor: 20 },
    { titulo: "Pacote de vacinas com 15% OFF", texto: "Proteção em dia: pacote de vacinas com 15% de desconto.", tipo: "porcentagem", valor: 15 },
    { titulo: "Banho + consulta com 10% OFF", texto: "Banho e consulta juntos com 10% de desconto.", tipo: "porcentagem", valor: 10 },
  ],
  artes: [
    { titulo: "Primeira tatuagem com 10% OFF", texto: "Agende sua primeira tatuagem e ganhe 10% de desconto no fechamento do orçamento.", tipo: "porcentagem", valor: 10 },
    { titulo: "Tatuagem em dupla com 15% OFF", texto: "Faça sua tatuagem acompanhado e os dois ganham 15% de desconto.", tipo: "porcentagem", valor: 15 },
    { titulo: "Sessão dupla com 10% OFF", texto: "Duas sessões agendadas juntas com 10% de desconto.", tipo: "porcentagem", valor: 10 },
  ],
  gastronomia: [
    { titulo: "Jantar especial com 10% OFF", texto: "Chef em casa para o seu jantar com 10% de desconto em eventos de até 10 pessoas.", tipo: "porcentagem", valor: 10 },
    { titulo: "Primeiro evento com 15% OFF", texto: "Primeiro evento com 15% de desconto. Seu momento merece capricho.", tipo: "porcentagem", valor: 15 },
    { titulo: "Aula em dupla com 10% OFF", texto: "Aula de culinária em dupla com 10% de desconto.", tipo: "porcentagem", valor: 10 },
  ],
  fotografia: [
    { titulo: "Primeiro ensaio com 15% OFF", texto: "Seu primeiro ensaio com 15% de desconto. Momentos que valem a pena eternizar.", tipo: "porcentagem", valor: 15 },
    { titulo: "Ensaio de família com 10% OFF", texto: "Ensaio de família com 10% de desconto neste mês.", tipo: "porcentagem", valor: 10 },
    { titulo: "Pacote casamento com 10% OFF", texto: "Cobertura completa do casamento com 10% de desconto.", tipo: "porcentagem", valor: 10 },
  ],
  consultoria: [
    { titulo: "Primeira sessão com 20% OFF", texto: "Primeira sessão com 20% de desconto. Conheça o método antes de decidir.", tipo: "porcentagem", valor: 20 },
    { titulo: "Pacote mensal com 15% OFF", texto: "Acompanhamento mensal com 15% de desconto. Evolução constante.", tipo: "porcentagem", valor: 15 },
    { titulo: "Sessões online com 10% OFF", texto: "Sessões online com 10% de desconto. Onde você estiver.", tipo: "porcentagem", valor: 10 },
  ],
  outro: [
    { titulo: "Primeira visita 20% OFF", texto: "Primeira visita com 20% de desconto. Conheça meu trabalho!", tipo: "porcentagem", valor: 20 },
    { titulo: "Pacote mensal com 15% OFF", texto: "Atendimento mensal com 15% de desconto no pacote.", tipo: "porcentagem", valor: 15 },
    { titulo: "Dias de agenda livre com 10% OFF", texto: "Agende de segunda a quarta e ganhe 10% de desconto.", tipo: "porcentagem", valor: 10, dias_semana: [1, 2, 3] },
  ],
};

export function getPromocoesPadrao(categoria: string | null | undefined): PromocaoPronta[] {
  return PROMOCOES_PADRAO[(categoria ?? "outro") as CategoriaId] ?? PROMOCOES_PADRAO.outro;
}
