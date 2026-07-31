export type CategoriaId =
  | "limpeza"
  | "beleza"
  | "saude"
  | "personal"
  | "artes"
  | "gastronomia"
  | "fotografia"
  | "consultoria"
  | "outro";

export type TipoPreco = "por_hora" | "fixo";

export type ServicoPadrao = {
  nome: string;
  descricao: string;
  tipo_preco: TipoPreco;
  valor_hora: number;
  horas_minimas: number;
  preco_fixo: number;
  duracao_minutos: number;
};

export type CategoriaPadrao = {
  id: CategoriaId;
  nome: string;
  icone: string;
  slogan: string;
  servicos: ServicoPadrao[];
  msg_confirmacao: string;
  msg_lembrete: string;
};

export const CATEGORIAS_PADRAO: CategoriaPadrao[] = [
  {
    id: "limpeza",
    nome: "Limpeza e Conservação",
    icone: "Wrench",
    slogan: "Limpeza profissional de confiança",
    servicos: [
      { nome: "Limpeza Padrão", descricao: "Limpeza geral de manutenção: pisos, banheiros, cozinha, quartos e áreas comuns", tipo_preco: "fixo", valor_hora: 0, horas_minimas: 0, preco_fixo: 120, duracao_minutos: 240 },
      { nome: "Limpeza Completa", descricao: "Limpeza detalhada incluindo armários, geladeira, azulejos, vidros e áreas de difícil acesso", tipo_preco: "fixo", valor_hora: 0, horas_minimas: 0, preco_fixo: 220, duracao_minutos: 480 },
      { nome: "Limpeza Pós-Obra", descricao: "Limpeza pesada para remoção de resíduos de obra, reforma ou mudança", tipo_preco: "fixo", valor_hora: 0, horas_minimas: 0, preco_fixo: 350, duracao_minutos: 480 },
      { nome: "Passar Roupa", descricao: "Serviço de passar roupa por hora", tipo_preco: "por_hora", valor_hora: 35, horas_minimas: 2, preco_fixo: 0, duracao_minutos: 60 },
    ],
    msg_confirmacao: "Olá! Recebemos seu agendamento de {servico} no dia {data} às {hora}. Estou confirmado(a) e irei preparar tudo com capricho. Qualquer dúvida, estou à disposição!",
    msg_lembrete: "Olá! Lembrando que amanhã temos {servico} às {hora}. Confirmado? Qualquer imprevisto, me avise!",
  },
  {
    id: "beleza",
    nome: "Beleza e Estética",
    icone: "Scissors",
    slogan: "Sua beleza em boas mãos",
    servicos: [
      { nome: "Corte Feminino", descricao: "Corte personalizado com lavagem e finalização", tipo_preco: "fixo", valor_hora: 0, horas_minimas: 0, preco_fixo: 80, duracao_minutos: 60 },
      { nome: "Manicure", descricao: "Manicure tradicional com esmaltação", tipo_preco: "fixo", valor_hora: 0, horas_minimas: 0, preco_fixo: 40, duracao_minutos: 40 },
      { nome: "Pedicure", descricao: "Pedicure tradicional com esmaltação", tipo_preco: "fixo", valor_hora: 0, horas_minimas: 0, preco_fixo: 45, duracao_minutos: 50 },
      { nome: "Manicure + Pedicure", descricao: "Combo mão e pé com esmaltação", tipo_preco: "fixo", valor_hora: 0, horas_minimas: 0, preco_fixo: 75, duracao_minutos: 80 },
      { nome: "Design de Sobrancelhas", descricao: "Design personalizado com pinça e tesoura", tipo_preco: "fixo", valor_hora: 0, horas_minimas: 0, preco_fixo: 55, duracao_minutos: 30 },
      { nome: "Escova", descricao: "Escova modelada com lavagem e finalização", tipo_preco: "fixo", valor_hora: 0, horas_minimas: 0, preco_fixo: 50, duracao_minutos: 50 },
    ],
    msg_confirmacao: "Olá! Seu agendamento de {servico} no dia {data} às {hora} está confirmado. Te espero no salão!",
    msg_lembrete: "Oi! Amanhã tem {servico} às {hora} combinado. Confirmado? Me avise se precisar remarcar.",
  },
  {
    id: "saude",
    nome: "Saúde e Bem-estar",
    icone: "Stethoscope",
    slogan: "Cuide do seu corpo e da sua mente",
    servicos: [
      { nome: "Massagem Relaxante", descricao: "Massagem suave para aliviar tensão e promover relaxamento profundo (1h)", tipo_preco: "por_hora", valor_hora: 90, horas_minimas: 1, preco_fixo: 0, duracao_minutos: 60 },
      { nome: "Massagem Terapêutica", descricao: "Massagem focada em pontos de tensão muscular e dores específicas (1h)", tipo_preco: "por_hora", valor_hora: 120, horas_minimas: 1, preco_fixo: 0, duracao_minutos: 60 },
      { nome: "Acupuntura", descricao: "Sessão de acupuntura tradicional para equilíbrio energético e alívio de dores", tipo_preco: "fixo", valor_hora: 0, horas_minimas: 0, preco_fixo: 80, duracao_minutos: 50 },
      { nome: "Limpeza de Pele", descricao: "Limpeza de pele profunda com extração e máscara calmante", tipo_preco: "fixo", valor_hora: 0, horas_minimas: 0, preco_fixo: 120, duracao_minutos: 60 },
      { nome: "Drenagem Linfática", descricao: "Drenagem linfática manual para redução de inchaço e eliminação de toxinas", tipo_preco: "fixo", valor_hora: 0, horas_minimas: 0, preco_fixo: 110, duracao_minutos: 60 },
    ],
    msg_confirmacao: "Olá! Seu horário de {servico} no dia {data} às {hora} foi confirmado. Prepare-se para relaxar!",
    msg_lembrete: "Oi! Passando para lembrar da sua sessão de {servico} amanhã às {hora}. Confirmado?",
  },
  {
    id: "personal",
    nome: "Personal & Esportes",
    icone: "Dumbbell",
    slogan: "Treine com quem entende do seu corpo",
    servicos: [
      { nome: "Aula Personal (1h)", descricao: "Treino individualizado com acompanhamento presencial exclusivo", tipo_preco: "por_hora", valor_hora: 90, horas_minimas: 1, preco_fixo: 0, duracao_minutos: 60 },
      { nome: "Aula em Dupla", descricao: "Treino para dupla — valor por pessoa", tipo_preco: "por_hora", valor_hora: 55, horas_minimas: 1, preco_fixo: 0, duracao_minutos: 60 },
      { nome: "Consultoria Online (mensal)", descricao: "Plano de treino personalizado + acompanhamento por WhatsApp", tipo_preco: "fixo", valor_hora: 0, horas_minimas: 0, preco_fixo: 150, duracao_minutos: 1 },
      { nome: "Pilates (1h)", descricao: "Sessão de pilates solo ou equipamentos", tipo_preco: "por_hora", valor_hora: 70, horas_minimas: 1, preco_fixo: 0, duracao_minutos: 60 },
    ],
    msg_confirmacao: "Olá! Sua sessão de {servico} no dia {data} às {hora} está agendada. Vamos treinar!",
    msg_lembrete: "E aí! Lembrando do treino de {servico} amanhã às {hora}. Confirmado? Bora!",
  },
  {
    id: "artes",
    nome: "Artes e Ofícios",
    icone: "Brush",
    slogan: "Arte e criaturança feitas pra você",
    servicos: [
      { nome: "Tatuagem Pequena", descricao: "Tatuagem de até 5cm — orçamento inclui arte e execução", tipo_preco: "fixo", valor_hora: 0, horas_minimas: 0, preco_fixo: 200, duracao_minutos: 120 },
      { nome: "Tatuagem Média", descricao: "Tatuagem de 5 a 15cm com nível médio de detalhes", tipo_preco: "fixo", valor_hora: 0, horas_minimas: 0, preco_fixo: 500, duracao_minutos: 240 },
      { nome: "Sessão de Arte (por hora)", descricao: "Hora de trabalho artístico (pintura, desenho, ilustração)", tipo_preco: "por_hora", valor_hora: 80, horas_minimas: 1, preco_fixo: 0, duracao_minutos: 60 },
    ],
    msg_confirmacao: "Olá! Seu agendamento de {servico} no dia {data} às {hora} está confirmado. Te espero no estúdio!",
    msg_lembrete: "Oi! Amanhã temos {servico} às {hora}. Confirmado? Me avise se precisar alterar.",
  },
  {
    id: "gastronomia",
    nome: "Gastronomia",
    icone: "ChefHat",
    slogan: "Sabores que encantam na sua casa",
    servicos: [
      { nome: "Chef em Casa — Jantar", descricao: "Jantar personalizado para até 4 pessoas (entrada, prato principal, sobremesa)", tipo_preco: "fixo", valor_hora: 0, horas_minimas: 0, preco_fixo: 350, duracao_minutos: 240 },
      { nome: "Chef em Casa — Almoço", descricao: "Almoço preparado na sua casa para até 4 pessoas", tipo_preco: "fixo", valor_hora: 0, horas_minimas: 0, preco_fixo: 280, duracao_minutos: 180 },
      { nome: "Buffet por Pessoa", descricao: "Buffet completo para eventos — valor por pessoa (mín. 10 pessoas)", tipo_preco: "fixo", valor_hora: 0, horas_minimas: 0, preco_fixo: 80, duracao_minutos: 300 },
      { nome: "Aula de Culinária (2h)", descricao: "Aula prática de culinária com chef profissional", tipo_preco: "fixo", valor_hora: 0, horas_minimas: 0, preco_fixo: 150, duracao_minutos: 120 },
    ],
    msg_confirmacao: "Olá! Seu evento de {servico} no dia {data} às {hora} está confirmado. Vou preparar tudo com muito carinho!",
    msg_lembrete: "Olá! Lembrando do seu {servico} amanhã às {hora}. Já estou organizando tudo! Confirmado?",
  },
  {
    id: "fotografia",
    nome: "Fotografia e Eventos",
    icone: "Camera",
    slogan: "Registrando seus melhores momentos",
    servicos: [
      { nome: "Ensaio Retrato (2h)", descricao: "Ensaio fotográfico individual ou casal, 1 locação, 30 fotos tratadas", tipo_preco: "fixo", valor_hora: 0, horas_minimas: 0, preco_fixo: 350, duracao_minutos: 120 },
      { nome: "Ensaio Gestante/Família", descricao: "Ensaio externo ou estúdio, 40 fotos tratadas", tipo_preco: "fixo", valor_hora: 0, horas_minimas: 0, preco_fixo: 500, duracao_minutos: 120 },
      { nome: "Cobertura de Evento (4h)", descricao: "Cobertura fotográfica de evento social ou corporativo", tipo_preco: "fixo", valor_hora: 0, horas_minimas: 0, preco_fixo: 700, duracao_minutos: 240 },
      { nome: "Cobertura de Casamento", descricao: "Cobertura completa cerimônia + festa, 500+ fotos tratadas", tipo_preco: "fixo", valor_hora: 0, horas_minimas: 0, preco_fixo: 2500, duracao_minutos: 600 },
    ],
    msg_confirmacao: "Olá! Seu ensaio de {servico} no dia {data} às {hora} está confirmado. Vamos criar fotos incríveis!",
    msg_lembrete: "Oi! Amanhã temos {servico} às {hora}. Confirmado? Qualquer dúvida, me chame!",
  },
  {
    id: "consultoria",
    nome: "Consultoria e Aulas",
    icone: "MonitorSmartphone",
    slogan: "Conhecimento que transforma",
    servicos: [
      { nome: "Sessão de Consultoria (1h)", descricao: "Consultoria individual online ou presencial", tipo_preco: "por_hora", valor_hora: 120, horas_minimas: 1, preco_fixo: 0, duracao_minutos: 60 },
      { nome: "Pacote Mensal (4 sessões)", descricao: "4 sessões de consultoria com acompanhamento contínuo", tipo_preco: "fixo", valor_hora: 0, horas_minimas: 0, preco_fixo: 380, duracao_minutos: 60 },
      { nome: "Aula Particular (1h)", descricao: "Aula individual de reforço, idiomas ou música", tipo_preco: "por_hora", valor_hora: 75, horas_minimas: 1, preco_fixo: 0, duracao_minutos: 60 },
      { nome: "Aula em Grupo (2h)", descricao: "Aula para até 4 pessoas — valor por pessoa", tipo_preco: "fixo", valor_hora: 0, horas_minimas: 0, preco_fixo: 40, duracao_minutos: 120 },
    ],
    msg_confirmacao: "Olá! Sua sessão de {servico} no dia {data} às {hora} está agendada. Te espero!",
    msg_lembrete: "Oi! Lembrando da nossa sessão de {servico} amanhã às {hora}. Confirmado?",
  },
  {
    id: "outro",
    nome: "Outro Negócio",
    icone: "Briefcase",
    slogan: "Atendimento profissional de confiança",
    servicos: [],
    msg_confirmacao: "Olá! Recebemos seu agendamento de {servico} no dia {data} às {hora}. Confirmado! Qualquer dúvida, estou à disposição.",
    msg_lembrete: "Olá! Lembrando que amanhã temos {servico} às {hora}. Confirmado? Qualquer imprevisto, me avise!",
  },
];

export function getCategoriaPadrao(id: CategoriaId): CategoriaPadrao | undefined {
  return CATEGORIAS_PADRAO.find((c) => c.id === id);
}

export function getServicosPadrao(id: CategoriaId): ServicoPadrao[] {
  return getCategoriaPadrao(id)?.servicos || [];
}

export function getSloganPadrao(id: CategoriaId): string {
  return getCategoriaPadrao(id)?.slogan || "Profissional de confiança";
}