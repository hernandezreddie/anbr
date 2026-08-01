export type CategoriaId =
  | "limpeza"
  | "beleza"
  | "unhas"
  | "saude"
  | "clinica"
  | "personal"
  | "automotivo"
  | "veterinario"
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

export type FrequenciaPadrao = {
  nome: string;
  slug: string;
  desconto: number;
  ordem: number;
};

export type MensagemVariante = {
  nome: string;
  confirmacao: string;
  lembrete: string;
};

export type AdicionalPadrao = {
  nome: string;
  preco: number;
  horas: number;
};

export type CategoriaPadrao = {
  id: CategoriaId;
  nome: string;
  icone: string;
  slogan: string;
  servicos: ServicoPadrao[];
  frequencias: FrequenciaPadrao[];
  adicionais: AdicionalPadrao[];
  /** Mostra o passo de cômodos (quartos/banheiros) na reserva */
  usa_comodos: boolean;
  msg_confirmacao: string;
  msg_lembrete: string;
  /** Estilos alternativos de mensagens WhatsApp — o profissional escolhe no painel */
  msg_variantes: MensagemVariante[];
};

export const CATEGORIAS_PADRAO: CategoriaPadrao[] = [
  {
    id: "limpeza",
    nome: "Limpeza e Conservação",
    icone: "Wrench",
    slogan: "Limpeza profissional de confiança",
    usa_comodos: true,
    servicos: [
      { nome: "Limpeza Padrão", descricao: "Limpeza geral de manutenção: pisos, banheiros, cozinha, quartos e áreas comuns", tipo_preco: "fixo", valor_hora: 0, horas_minimas: 0, preco_fixo: 120, duracao_minutos: 240 },
      { nome: "Limpeza Completa", descricao: "Limpeza detalhada incluindo armários, geladeira, azulejos, vidros e áreas de difícil acesso", tipo_preco: "fixo", valor_hora: 0, horas_minimas: 0, preco_fixo: 220, duracao_minutos: 480 },
      { nome: "Limpeza Pós-Obra", descricao: "Limpeza pesada para remoção de resíduos de obra, reforma ou mudança", tipo_preco: "fixo", valor_hora: 0, horas_minimas: 0, preco_fixo: 350, duracao_minutos: 480 },
      { nome: "Passar Roupa", descricao: "Serviço de passar roupa por hora", tipo_preco: "por_hora", valor_hora: 35, horas_minimas: 2, preco_fixo: 0, duracao_minutos: 60 },
    ],
    frequencias: [
      { nome: "Pontual", slug: "pontual", desconto: 0, ordem: 1 },
      { nome: "Semanal", slug: "semanal", desconto: 15, ordem: 2 },
      { nome: "Quinzenal", slug: "quinzenal", desconto: 10, ordem: 3 },
      { nome: "Mensal", slug: "mensal", desconto: 5, ordem: 4 },
    ],
    adicionais: [
      { nome: "Limpeza de geladeira", preco: 50, horas: 0 },
      { nome: "Limpeza de vidros", preco: 60, horas: 0 },
      { nome: "Limpeza de forno", preco: 40, horas: 0 },
      { nome: "Arrumação de armários", preco: 70, horas: 0 },
      { nome: "Área externa/quintal", preco: 80, horas: 0 },
    ],
    msg_confirmacao: "Olá! Recebemos seu agendamento de {servico} no dia {data} às {hora}. Estou confirmado(a) e irei preparar tudo com capricho. Qualquer dúvida, estou à disposição!",
    msg_lembrete: "Olá! Lembrando que amanhã temos {servico} às {hora}. Confirmado? Qualquer imprevisto, me avise!",
    msg_variantes: [
      {
        nome: "Direto", confirmacao: "Oi! Seu {servico} está confirmado para {data} às {hora}. Até lá!",
        lembrete: "Oi! Amanhã às {hora} tem seu {servico}. Confirmado? Me avise se precisar mudar.",
      },
      {
        nome: "Carinhoso", confirmacao: "Olá! Que bom ter você comigo. Seu {servico} fica confirmado para {data} às {hora}. Vou deixar tudo impecável! Qualquer dúvida, é só chamar.",
        lembrete: "Oi! Amanhã às {hora} cuido do seu {servico}. Fica confirmado? Qualquer imprevisto, me avisa que a gente ajusta.",
      },
    ],
  },
  {
    id: "beleza",
    nome: "Beleza e Estética",
    icone: "Scissors",
    slogan: "Sua beleza em boas mãos",
    usa_comodos: false,
    servicos: [
      { nome: "Corte Feminino", descricao: "Corte personalizado com lavagem e finalização", tipo_preco: "fixo", valor_hora: 0, horas_minimas: 0, preco_fixo: 80, duracao_minutos: 60 },
      { nome: "Corte Masculino", descricao: "Corte masculino com lavagem e finalização", tipo_preco: "fixo", valor_hora: 0, horas_minimas: 0, preco_fixo: 45, duracao_minutos: 40 },
      { nome: "Manicure", descricao: "Manicure tradicional com esmaltação", tipo_preco: "fixo", valor_hora: 0, horas_minimas: 0, preco_fixo: 40, duracao_minutos: 40 },
      { nome: "Pedicure", descricao: "Pedicure tradicional com esmaltação", tipo_preco: "fixo", valor_hora: 0, horas_minimas: 0, preco_fixo: 45, duracao_minutos: 50 },
      { nome: "Manicure + Pedicure", descricao: "Combo mão e pé com esmaltação", tipo_preco: "fixo", valor_hora: 0, horas_minimas: 0, preco_fixo: 75, duracao_minutos: 80 },
      { nome: "Escova", descricao: "Escova modelada com lavagem e finalização", tipo_preco: "fixo", valor_hora: 0, horas_minimas: 0, preco_fixo: 50, duracao_minutos: 50 },
      { nome: "Design de Sobrancelhas", descricao: "Design personalizado com pinça e tesoura", tipo_preco: "fixo", valor_hora: 0, horas_minimas: 0, preco_fixo: 55, duracao_minutos: 30 },
      { nome: "Coloração", descricao: "Coloração completa com lavagem e finalização", tipo_preco: "fixo", valor_hora: 0, horas_minimas: 0, preco_fixo: 120, duracao_minutos: 120 },
    ],
    frequencias: [
      { nome: "Pontual", slug: "pontual", desconto: 0, ordem: 1 },
      { nome: "Mensal", slug: "mensal", desconto: 10, ordem: 2 },
    ],
    adicionais: [
      { nome: "Hidratação profunda", preco: 35, horas: 0 },
      { nome: "Luzes", preco: 150, horas: 0 },
      { nome: "Botox capilar", preco: 80, horas: 0 },
      { nome: "Pigmentação", preco: 60, horas: 0 },
    ],
    msg_confirmacao: "Olá! Seu agendamento de {servico} no dia {data} às {hora} está confirmado. Te espero no salão!",
    msg_lembrete: "Oi! Amanhã tem {servico} às {hora} combinado. Confirmado? Me avise se precisar remarcar.",
    msg_variantes: [
      {
        nome: "Direto", confirmacao: "Oi! Seu {servico} está confirmado para {data} às {hora}. Te espero!",
        lembrete: "Oi! Amanhã às {hora} tem seu {servico}. Confirmado? Me avise se precisar remarcar.",
      },
      {
        nome: "Carinhoso", confirmacao: "Olá! Seu horário de {servico} está garantido para {data} às {hora}. Já estou me preparando pra te receber com todo carinho!",
        lembrete: "Oi! Amanhã às {hora} tem o seu momento de {servico}. Tudo confirmado? Me avisa se precisar de algo.",
      },
    ],
  },
  {
    id: "unhas",
    nome: "Manicure & Nail Designer",
    icone: "Hand",
    slogan: "Unhas impecáveis do jeito que você merece",
    usa_comodos: false,
    servicos: [
      { nome: "Manicure Tradicional", descricao: "Manicure com esmaltação comum e cuidado de cutículas", tipo_preco: "fixo", valor_hora: 0, horas_minimas: 0, preco_fixo: 35, duracao_minutos: 45 },
      { nome: "Pedicure Tradicional", descricao: "Pedicure com esmaltação comum e cuidado de cutículas", tipo_preco: "fixo", valor_hora: 0, horas_minimas: 0, preco_fixo: 40, duracao_minutos: 50 },
      { nome: "Manicure + Pedicure", descricao: "Combo mão e pé com esmaltação", tipo_preco: "fixo", valor_hora: 0, horas_minimas: 0, preco_fixo: 70, duracao_minutos: 80 },
      { nome: "Alongamento em Gel", descricao: "Alongamento de unhas com gel modelado", tipo_preco: "fixo", valor_hora: 0, horas_minimas: 0, preco_fixo: 90, duracao_minutos: 150 },
      { nome: "Alongamento Fibra de Vidro", descricao: "Alongamento resistente com fibra de vidro", tipo_preco: "fixo", valor_hora: 0, horas_minimas: 0, preco_fixo: 120, duracao_minutos: 180 },
      { nome: "Manutenção de Alongamento", descricao: "Manutenção completa do alongamento", tipo_preco: "fixo", valor_hora: 0, horas_minimas: 0, preco_fixo: 70, duracao_minutos: 120 },
      { nome: "Esmaltação em Gel", descricao: "Esmaltação em gel com base e cobertura", tipo_preco: "fixo", valor_hora: 0, horas_minimas: 0, preco_fixo: 60, duracao_minutos: 60 },
      { nome: "Banho de Gel", descricao: "Esmaltação em gel com remoção e cuidado", tipo_preco: "fixo", valor_hora: 0, horas_minimas: 0, preco_fixo: 50, duracao_minutos: 60 },
      { nome: "Nail Art", descricao: "Decoração personalizada nas unhas", tipo_preco: "fixo", valor_hora: 0, horas_minimas: 0, preco_fixo: 20, duracao_minutos: 20 },
    ],
    frequencias: [
      { nome: "Pontual", slug: "pontual", desconto: 0, ordem: 1 },
      { nome: "Manutenção quinzenal", slug: "quinzenal", desconto: 10, ordem: 2 },
    ],
    adicionais: [
      { nome: "Francesinha", preco: 10, horas: 0 },
      { nome: "Blindagem", preco: 30, horas: 0 },
      { nome: "Hidratação das cutículas", preco: 10, horas: 0 },
      { nome: "Cristalização", preco: 15, horas: 0 },
    ],
    msg_confirmacao: "Olá! Seu horário de {servico} no dia {data} às {hora} está confirmado. Te espero para deixar suas unhas impecáveis!",
    msg_lembrete: "Oi! Lembrando do seu horário de {servico} amanhã às {hora}. Confirmado? Me avise se precisar remarcar.",
    msg_variantes: [
      {
        nome: "Direto", confirmacao: "Oi! Seu {servico} está confirmado para {data} às {hora}. Te espero!",
        lembrete: "Oi! Amanhã às {hora} tem seu {servico}. Confirmado? Me avise.",
      },
      {
        nome: "Carinhoso", confirmacao: "Olá! Suas unhas estão garantidas! {servico} no dia {data} às {hora}. Vou caprichar em cada detalhe pra você sair apaixonada pelo resultado!",
        lembrete: "Oi! Amanhã às {hora} é o nosso momento de {servico}. Tudo certo? Me avisa se precisar ajustar.",
      },
    ],
  },
  {
    id: "saude",
    nome: "Saúde e Bem-estar",
    icone: "Stethoscope",
    slogan: "Cuide do seu corpo e da sua mente",
    usa_comodos: false,
    servicos: [
      { nome: "Massagem Relaxante", descricao: "Massagem suave para aliviar tensão e promover relaxamento profundo (1h)", tipo_preco: "por_hora", valor_hora: 90, horas_minimas: 1, preco_fixo: 0, duracao_minutos: 60 },
      { nome: "Massagem Terapêutica", descricao: "Massagem focada em pontos de tensão muscular e dores específicas (1h)", tipo_preco: "por_hora", valor_hora: 120, horas_minimas: 1, preco_fixo: 0, duracao_minutos: 60 },
      { nome: "Acupuntura", descricao: "Sessão de acupuntura tradicional para equilíbrio energético e alívio de dores", tipo_preco: "fixo", valor_hora: 0, horas_minimas: 0, preco_fixo: 80, duracao_minutos: 50 },
      { nome: "Limpeza de Pele", descricao: "Limpeza de pele profunda com extração e máscara calmante", tipo_preco: "fixo", valor_hora: 0, horas_minimas: 0, preco_fixo: 120, duracao_minutos: 60 },
      { nome: "Drenagem Linfática", descricao: "Drenagem linfática manual para redução de inchaço e eliminação de toxinas", tipo_preco: "fixo", valor_hora: 0, horas_minimas: 0, preco_fixo: 110, duracao_minutos: 60 },
    ],
    frequencias: [
      { nome: "Pontual", slug: "pontual", desconto: 0, ordem: 1 },
      { nome: "Pacote 4 sessões", slug: "pacote", desconto: 10, ordem: 2 },
      { nome: "Mensal", slug: "mensal", desconto: 15, ordem: 3 },
    ],
    adicionais: [
      { nome: "Aromaterapia", preco: 20, horas: 0 },
      { nome: "Pedras quentes", preco: 30, horas: 0 },
      { nome: "Ventosa", preco: 25, horas: 0 },
      { nome: "Auriculoterapia", preco: 40, horas: 0 },
    ],
    msg_confirmacao: "Olá! Seu horário de {servico} no dia {data} às {hora} foi confirmado. Prepare-se para relaxar!",
    msg_lembrete: "Oi! Passando para lembrar da sua sessão de {servico} amanhã às {hora}. Confirmado?",
    msg_variantes: [
      {
        nome: "Direto", confirmacao: "Oi! Sua sessão de {servico} está confirmada para {data} às {hora}. Até lá!",
        lembrete: "Oi! Amanhã às {hora} tem sua sessão de {servico}. Confirmado?",
      },
      {
        nome: "Carinhoso", confirmacao: "Olá! Sua sessão de {servico} está reservada para {data} às {hora}. Já preparei tudo pra você relaxar de verdade. Qualquer coisa, me chame!",
        lembrete: "Oi! Amanhã às {hora} vamos cuidar de você com {servico}. Tudo certo? Me avisa se precisar remarcar.",
      },
    ],
  },
  {
    id: "clinica",
    nome: "Clínica e Consultório",
    icone: "HeartPulse",
    slogan: "Sua saúde com horário marcado, sem espera",
    usa_comodos: false,
    servicos: [
      { nome: "Consulta Clínica Geral", descricao: "Consulta médica com avaliação completa e orientação", tipo_preco: "fixo", valor_hora: 0, horas_minimas: 0, preco_fixo: 200, duracao_minutos: 30 },
      { nome: "Consulta Odontológica", descricao: "Avaliação odontológica e plano de tratamento", tipo_preco: "fixo", valor_hora: 0, horas_minimas: 0, preco_fixo: 180, duracao_minutos: 30 },
      { nome: "Consulta de Retorno", descricao: "Retorno para acompanhamento do tratamento", tipo_preco: "fixo", valor_hora: 0, horas_minimas: 0, preco_fixo: 120, duracao_minutos: 20 },
      { nome: "Fisioterapia", descricao: "Sessão de fisioterapia individual", tipo_preco: "fixo", valor_hora: 0, horas_minimas: 0, preco_fixo: 90, duracao_minutos: 50 },
      { nome: "Coleta de Exames", descricao: "Coleta de exames laboratoriais", tipo_preco: "fixo", valor_hora: 0, horas_minimas: 0, preco_fixo: 60, duracao_minutos: 20 },
      { nome: "Vacinação", descricao: "Aplicação de vacinas do calendário", tipo_preco: "fixo", valor_hora: 0, horas_minimas: 0, preco_fixo: 80, duracao_minutos: 15 },
      { nome: "Check-up Preventivo", descricao: "Avaliação completa de rotina com exames", tipo_preco: "fixo", valor_hora: 0, horas_minimas: 0, preco_fixo: 350, duracao_minutos: 60 },
    ],
    frequencias: [
      { nome: "Pontual", slug: "pontual", desconto: 0, ordem: 1 },
      { nome: "Retorno", slug: "retorno", desconto: 0, ordem: 2 },
    ],
    adicionais: [],
    msg_confirmacao: "Olá! Sua consulta de {servico} no dia {data} às {hora} foi confirmada. Traga seus documentos e chegue 10 minutos antes.",
    msg_lembrete: "Olá! Lembrando da sua consulta de {servico} amanhã às {hora}. Confirmado? Qualquer imprevisto, nos avise.",
    msg_variantes: [
      {
        nome: "Direto", confirmacao: "Oi! Sua consulta de {servico} está confirmada para {data} às {hora}. Chegue 10 minutos antes.",
        lembrete: "Oi! Amanhã às {hora} tem sua consulta de {servico}. Confirmado?",
      },
      {
        nome: "Carinhoso", confirmacao: "Olá! Sua consulta de {servico} está garantida para {data} às {hora}. Estaremos te esperando com atenção e cuidado. Até lá!",
        lembrete: "Olá! Amanhã às {hora} tem sua consulta de {servico}. Fica confirmado? Se precisar remarcar, é só avisar.",
      },
    ],
  },
  {
    id: "personal",
    nome: "Personal & Esportes",
    icone: "Dumbbell",
    slogan: "Treine com quem entende do seu corpo",
    usa_comodos: false,
    servicos: [
      { nome: "Aula Personal (1h)", descricao: "Treino individualizado com acompanhamento presencial exclusivo", tipo_preco: "por_hora", valor_hora: 90, horas_minimas: 1, preco_fixo: 0, duracao_minutos: 60 },
      { nome: "Aula em Dupla", descricao: "Treino para dupla — valor por pessoa", tipo_preco: "por_hora", valor_hora: 55, horas_minimas: 1, preco_fixo: 0, duracao_minutos: 60 },
      { nome: "Consultoria Online (mensal)", descricao: "Plano de treino personalizado + acompanhamento por WhatsApp", tipo_preco: "fixo", valor_hora: 0, horas_minimas: 0, preco_fixo: 150, duracao_minutos: 1 },
      { nome: "Pilates (1h)", descricao: "Sessão de pilates solo ou equipamentos", tipo_preco: "por_hora", valor_hora: 70, horas_minimas: 1, preco_fixo: 0, duracao_minutos: 60 },
    ],
    frequencias: [
      { nome: "Pontual", slug: "pontual", desconto: 0, ordem: 1 },
      { nome: "Mensal", slug: "mensal", desconto: 15, ordem: 2 },
      { nome: "3x por semana", slug: "frequente", desconto: 20, ordem: 3 },
    ],
    adicionais: [
      { nome: "Avaliação física", preco: 50, horas: 0 },
      { nome: "Montagem de treino", preco: 80, horas: 0 },
      { nome: "Acompanhamento nutricional", preco: 100, horas: 0 },
    ],
    msg_confirmacao: "Olá! Sua sessão de {servico} no dia {data} às {hora} está agendada. Vamos treinar!",
    msg_lembrete: "E aí! Lembrando do treino de {servico} amanhã às {hora}. Confirmado? Bora!",
    msg_variantes: [
      {
        nome: "Direto", confirmacao: "Oi! Seu treino de {servico} está confirmado para {data} às {hora}. Bora!",
        lembrete: "Oi! Amanhã às {hora} tem treino de {servico}. Confirmado? Bora!",
      },
      {
        nome: "Carinhoso", confirmacao: "Olá! Treino de {servico} confirmado para {data} às {hora}. Vou preparar uma sessão que vai te fazer sentir a evolução. Te espero!",
        lembrete: "E aí! Amanhã às {hora} tem {servico} no nosso cronograma. Confirma pra gente? Seu futuro eu agradece!",
      },
    ],
  },
  {
    id: "automotivo",
    nome: "Automotivo",
    icone: "Car",
    slogan: "Seu carro limpo, revisado e no ponto",
    usa_comodos: false,
    servicos: [
      { nome: "Lavagem Simples", descricao: "Lavagem externa com secagem", tipo_preco: "fixo", valor_hora: 0, horas_minimas: 0, preco_fixo: 40, duracao_minutos: 30 },
      { nome: "Lavagem Completa", descricao: "Lavagem externa e interna com aspiração", tipo_preco: "fixo", valor_hora: 0, horas_minimas: 0, preco_fixo: 60, duracao_minutos: 45 },
      { nome: "Detalhamento Interno", descricao: "Limpeza profunda de bancos, painel, teto e portas", tipo_preco: "fixo", valor_hora: 0, horas_minimas: 0, preco_fixo: 150, duracao_minutos: 120 },
      { nome: "Polimento", descricao: "Polimento da pintura com proteção", tipo_preco: "fixo", valor_hora: 0, horas_minimas: 0, preco_fixo: 200, duracao_minutos: 180 },
      { nome: "Higienização Completa", descricao: "Higienização interna e externa profunda", tipo_preco: "fixo", valor_hora: 0, horas_minimas: 0, preco_fixo: 250, duracao_minutos: 240 },
      { nome: "Troca de Óleo", descricao: "Troca de óleo com filtro", tipo_preco: "fixo", valor_hora: 0, horas_minimas: 0, preco_fixo: 80, duracao_minutos: 30 },
      { nome: "Revisão Preventiva", descricao: "Revisão completa com checklist de segurança", tipo_preco: "fixo", valor_hora: 0, horas_minimas: 0, preco_fixo: 150, duracao_minutos: 60 },
      { nome: "Alinhamento e Balanceamento", descricao: "Alinhamento e balanceamento das quatro rodas", tipo_preco: "fixo", valor_hora: 0, horas_minimas: 0, preco_fixo: 120, duracao_minutos: 40 },
    ],
    frequencias: [
      { nome: "Pontual", slug: "pontual", desconto: 0, ordem: 1 },
      { nome: "Plano mensal de lavagem", slug: "mensal", desconto: 15, ordem: 2 },
    ],
    adicionais: [
      { nome: "Lavagem de motor", preco: 50, horas: 0 },
      { nome: "Odorizador", preco: 20, horas: 0 },
      { nome: "Cera de proteção", preco: 60, horas: 0 },
      { nome: "Cobertura de bancos", preco: 25, horas: 0 },
    ],
    msg_confirmacao: "Olá! Seu agendamento de {servico} no dia {data} às {hora} está confirmado. Deixe seu carro no ponto com a gente!",
    msg_lembrete: "Oi! Amanhã temos {servico} às {hora} marcado. Confirmado? Qualquer dúvida, me chame.",
    msg_variantes: [
      {
        nome: "Direto", confirmacao: "Oi! Seu {servico} está confirmado para {data} às {hora}. Te esperamos!",
        lembrete: "Oi! Amanhã às {hora} tem seu {servico}. Confirmado?",
      },
      {
        nome: "Carinhoso", confirmacao: "Olá! Seu {servico} está reservado para {data} às {hora}. Vamos deixar seu carro impecável! Qualquer dúvida, é só chamar.",
        lembrete: "Oi! Amanhã às {hora} cuidamos do seu carro com {servico}. Tudo certo? Me avisa se precisar alterar.",
      },
    ],
  },
  {
    id: "veterinario",
    nome: "Pet Shop & Veterinária",
    icone: "PawPrint",
    slogan: "Cuidado de verdade para quem você ama",
    usa_comodos: false,
    servicos: [
      { nome: "Consulta Veterinária", descricao: "Consulta clínica geral com avaliação completa", tipo_preco: "fixo", valor_hora: 0, horas_minimas: 0, preco_fixo: 120, duracao_minutos: 30 },
      { nome: "Consulta de Retorno", descricao: "Retorno para acompanhamento do tratamento", tipo_preco: "fixo", valor_hora: 0, horas_minimas: 0, preco_fixo: 70, duracao_minutos: 20 },
      { nome: "Vacinação", descricao: "Aplicação de vacinas com carteirinha", tipo_preco: "fixo", valor_hora: 0, horas_minimas: 0, preco_fixo: 80, duracao_minutos: 15 },
      { nome: "Banho e Tosa (Pequeno)", descricao: "Banho e tosa para cães e gatos de pequeno porte", tipo_preco: "fixo", valor_hora: 0, horas_minimas: 0, preco_fixo: 60, duracao_minutos: 60 },
      { nome: "Banho e Tosa (Grande)", descricao: "Banho e tosa para cães de grande porte", tipo_preco: "fixo", valor_hora: 0, horas_minimas: 0, preco_fixo: 100, duracao_minutos: 90 },
      { nome: "Castração", descricao: "Procedimento cirúrgico de castração", tipo_preco: "fixo", valor_hora: 0, horas_minimas: 0, preco_fixo: 400, duracao_minutos: 120 },
      { nome: "Check-up Completo", descricao: "Avaliação completa com exames básicos", tipo_preco: "fixo", valor_hora: 0, horas_minimas: 0, preco_fixo: 250, duracao_minutos: 40 },
    ],
    frequencias: [
      { nome: "Pontual", slug: "pontual", desconto: 0, ordem: 1 },
      { nome: "Banho mensal", slug: "mensal", desconto: 10, ordem: 2 },
    ],
    adicionais: [
      { nome: "Tosa higiênica", preco: 20, horas: 0 },
      { nome: "Corte de unhas", preco: 15, horas: 0 },
      { nome: "Limpeza de ouvidos", preco: 25, horas: 0 },
      { nome: "Escovação dental", preco: 30, horas: 0 },
    ],
    msg_confirmacao: "Olá! Seu agendamento de {servico} no dia {data} às {hora} está confirmado. Seu pet está em boas mãos!",
    msg_lembrete: "Oi! Lembrando que amanhã temos {servico} às {hora} para o seu pet. Confirmado?",
    msg_variantes: [
      {
        nome: "Direto", confirmacao: "Oi! O {servico} do seu pet está confirmado para {data} às {hora}. Te esperamos!",
        lembrete: "Oi! Amanhã às {hora} tem {servico} do seu pet. Confirmado?",
      },
      {
        nome: "Carinhoso", confirmacao: "Olá! O {servico} do seu pet está garantido para {data} às {hora}. Vamos tratar ele com muito carinho! Qualquer dúvida, me chame.",
        lembrete: "Oi! Amanhã às {hora} cuidamos do seu pet com {servico}. Tudo confirmado? Qualquer imprevisto, me avisa.",
      },
    ],
  },
  {
    id: "artes",
    nome: "Artes e Ofícios",
    icone: "Brush",
    slogan: "Arte e criatividade feitas pra você",
    usa_comodos: false,
    servicos: [
      { nome: "Tatuagem Pequena", descricao: "Tatuagem de até 5cm — orçamento inclui arte e execução", tipo_preco: "fixo", valor_hora: 0, horas_minimas: 0, preco_fixo: 200, duracao_minutos: 120 },
      { nome: "Tatuagem Média", descricao: "Tatuagem de 5 a 15cm com nível médio de detalhes", tipo_preco: "fixo", valor_hora: 0, horas_minimas: 0, preco_fixo: 500, duracao_minutos: 240 },
      { nome: "Sessão de Arte (por hora)", descricao: "Hora de trabalho artístico (pintura, desenho, ilustração)", tipo_preco: "por_hora", valor_hora: 80, horas_minimas: 1, preco_fixo: 0, duracao_minutos: 60 },
    ],
    frequencias: [
      { nome: "Pontual", slug: "pontual", desconto: 0, ordem: 1 },
      { nome: "Sessão mensal", slug: "mensal", desconto: 10, ordem: 2 },
    ],
    adicionais: [],
    msg_confirmacao: "Olá! Seu agendamento de {servico} no dia {data} às {hora} está confirmado. Te espero no estúdio!",
    msg_lembrete: "Oi! Amanhã temos {servico} às {hora}. Confirmado? Me avise se precisar alterar.",
    msg_variantes: [
      {
        nome: "Direto", confirmacao: "Oi! Seu {servico} está confirmado para {data} às {hora}. Te espero!",
        lembrete: "Oi! Amanhã às {hora} tem seu {servico}. Confirmado?",
      },
      {
        nome: "Carinhoso", confirmacao: "Olá! Seu {servico} está reservado para {data} às {hora}. Já estou ansioso(a) pra criar essa arte com você!",
        lembrete: "Oi! Amanhã às {hora} vamos dar vida ao seu {servico}. Tudo certo? Me avisa se precisar ajustar.",
      },
    ],
  },
  {
    id: "gastronomia",
    nome: "Gastronomia",
    icone: "ChefHat",
    slogan: "Sabores que encantam na sua casa",
    usa_comodos: false,
    servicos: [
      { nome: "Chef em Casa — Jantar", descricao: "Jantar personalizado para até 4 pessoas (entrada, prato principal, sobremesa)", tipo_preco: "fixo", valor_hora: 0, horas_minimas: 0, preco_fixo: 350, duracao_minutos: 240 },
      { nome: "Chef em Casa — Almoço", descricao: "Almoço preparado na sua casa para até 4 pessoas", tipo_preco: "fixo", valor_hora: 0, horas_minimas: 0, preco_fixo: 280, duracao_minutos: 180 },
      { nome: "Buffet por Pessoa", descricao: "Buffet completo para eventos — valor por pessoa (mín. 10 pessoas)", tipo_preco: "fixo", valor_hora: 0, horas_minimas: 0, preco_fixo: 80, duracao_minutos: 300 },
      { nome: "Aula de Culinária (2h)", descricao: "Aula prática de culinária com chef profissional", tipo_preco: "fixo", valor_hora: 0, horas_minimas: 0, preco_fixo: 150, duracao_minutos: 120 },
    ],
    frequencias: [
      { nome: "Pontual", slug: "pontual", desconto: 0, ordem: 1 },
      { nome: "Mensal", slug: "mensal", desconto: 10, ordem: 2 },
    ],
    adicionais: [],
    msg_confirmacao: "Olá! Seu evento de {servico} no dia {data} às {hora} está confirmado. Vou preparar tudo com muito carinho!",
    msg_lembrete: "Olá! Lembrando do seu {servico} amanhã às {hora}. Já estou organizando tudo! Confirmado?",
    msg_variantes: [
      {
        nome: "Direto", confirmacao: "Oi! Seu {servico} está confirmado para {data} às {hora}. Tudo certo!",
        lembrete: "Oi! Amanhã às {hora} tem seu {servico}. Confirmado?",
      },
      {
        nome: "Carinhoso", confirmacao: "Olá! Seu {servico} está garantido para {data} às {hora}. Já estou selecionando os melhores ingredientes pra tornar esse momento especial!",
        lembrete: "Olá! Amanhã às {hora} preparamos seu {servico} com todo capricho. Fica confirmado? Me avisa se precisar de algo.",
      },
    ],
  },
  {
    id: "fotografia",
    nome: "Fotografia e Eventos",
    icone: "Camera",
    slogan: "Registrando seus melhores momentos",
    usa_comodos: false,
    servicos: [
      { nome: "Ensaio Retrato (2h)", descricao: "Ensaio fotográfico individual ou casal, 1 locação, 30 fotos tratadas", tipo_preco: "fixo", valor_hora: 0, horas_minimas: 0, preco_fixo: 350, duracao_minutos: 120 },
      { nome: "Ensaio Gestante/Família", descricao: "Ensaio externo ou estúdio, 40 fotos tratadas", tipo_preco: "fixo", valor_hora: 0, horas_minimas: 0, preco_fixo: 500, duracao_minutos: 120 },
      { nome: "Cobertura de Evento (4h)", descricao: "Cobertura fotográfica de evento social ou corporativo", tipo_preco: "fixo", valor_hora: 0, horas_minimas: 0, preco_fixo: 700, duracao_minutos: 240 },
      { nome: "Cobertura de Casamento", descricao: "Cobertura completa cerimônia + festa, 500+ fotos tratadas", tipo_preco: "fixo", valor_hora: 0, horas_minimas: 0, preco_fixo: 2500, duracao_minutos: 600 },
    ],
    frequencias: [
      { nome: "Pontual", slug: "pontual", desconto: 0, ordem: 1 },
    ],
    adicionais: [
      { nome: "Foto extra", preco: 25, horas: 0 },
      { nome: "Álbum impresso", preco: 150, horas: 0 },
      { nome: "Imagens com drone", preco: 200, horas: 0 },
    ],
    msg_confirmacao: "Olá! Seu ensaio de {servico} no dia {data} às {hora} está confirmado. Vamos criar fotos incríveis!",
    msg_lembrete: "Oi! Amanhã temos {servico} às {hora}. Confirmado? Qualquer dúvida, me chame!",
    msg_variantes: [
      {
        nome: "Direto", confirmacao: "Oi! Seu {servico} está confirmado para {data} às {hora}. Vamos lá!",
        lembrete: "Oi! Amanhã às {hora} tem seu {servico}. Confirmado?",
      },
      {
        nome: "Carinhoso", confirmacao: "Olá! Seu {servico} está reservado para {data} às {hora}. Já estou planejando cada clique pra eternizar esse momento com beleza e emoção!",
        lembrete: "Oi! Amanhã às {hora} eternizamos seu {servico}. Tudo certo? Qualquer dúvida, me chama.",
      },
    ],
  },
  {
    id: "consultoria",
    nome: "Consultoria e Aulas",
    icone: "MonitorSmartphone",
    slogan: "Conhecimento que transforma",
    usa_comodos: false,
    servicos: [
      { nome: "Sessão de Consultoria (1h)", descricao: "Consultoria individual online ou presencial", tipo_preco: "por_hora", valor_hora: 120, horas_minimas: 1, preco_fixo: 0, duracao_minutos: 60 },
      { nome: "Pacote Mensal (4 sessões)", descricao: "4 sessões de consultoria com acompanhamento contínuo", tipo_preco: "fixo", valor_hora: 0, horas_minimas: 0, preco_fixo: 380, duracao_minutos: 60 },
      { nome: "Aula Particular (1h)", descricao: "Aula individual de reforço, idiomas ou música", tipo_preco: "por_hora", valor_hora: 75, horas_minimas: 1, preco_fixo: 0, duracao_minutos: 60 },
      { nome: "Aula em Grupo (2h)", descricao: "Aula para até 4 pessoas — valor por pessoa", tipo_preco: "fixo", valor_hora: 0, horas_minimas: 0, preco_fixo: 40, duracao_minutos: 120 },
    ],
    frequencias: [
      { nome: "Pontual", slug: "pontual", desconto: 0, ordem: 1 },
      { nome: "Pacote mensal", slug: "mensal", desconto: 15, ordem: 2 },
    ],
    adicionais: [
      { nome: "Material de apoio", preco: 30, horas: 0 },
      { nome: "Análise extra", preco: 80, horas: 0 },
    ],
    msg_confirmacao: "Olá! Sua sessão de {servico} no dia {data} às {hora} está agendada. Te espero!",
    msg_lembrete: "Oi! Lembrando da nossa sessão de {servico} amanhã às {hora}. Confirmado?",
    msg_variantes: [
      {
        nome: "Direto", confirmacao: "Oi! Sua sessão de {servico} está confirmada para {data} às {hora}. Até lá!",
        lembrete: "Oi! Amanhã às {hora} tem nossa sessão de {servico}. Confirmado?",
      },
      {
        nome: "Carinhoso", confirmacao: "Olá! Sua sessão de {servico} está reservada para {data} às {hora}. Vou preparar cada momento pra você sair com aquele progresso!",
        lembrete: "Oi! Amanhã às {hora} temos nossa sessão de {servico}. Tudo certo? Me avisa se precisar remarcar.",
      },
    ],
  },
  {
    id: "outro",
    nome: "Outro Negócio",
    icone: "Briefcase",
    slogan: "Atendimento profissional de confiança",
    usa_comodos: false,
    servicos: [],
    frequencias: [
      { nome: "Pontual", slug: "pontual", desconto: 0, ordem: 1 },
    ],
    adicionais: [],
    msg_confirmacao: "Olá! Recebemos seu agendamento de {servico} no dia {data} às {hora}. Confirmado! Qualquer dúvida, estou à disposição.",
    msg_lembrete: "Olá! Lembrando que amanhã temos {servico} às {hora}. Confirmado? Qualquer imprevisto, me avise!",
    msg_variantes: [
      {
        nome: "Direto", confirmacao: "Oi! Seu {servico} está confirmado para {data} às {hora}. Até lá!",
        lembrete: "Oi! Amanhã às {hora} tem seu {servico}. Confirmado?",
      },
      {
        nome: "Carinhoso", confirmacao: "Olá! Seu {servico} está garantido para {data} às {hora}. Vou fazer o possível pra te atender com todo cuidado!",
        lembrete: "Oi! Amanhã às {hora} cuidamos do seu {servico}. Tudo certo? Me avisa se precisar de algo.",
      },
    ],
  },
];

export function getCategoriaPadrao(id: string | null | undefined): CategoriaPadrao | undefined {
  if (!id) return undefined;
  return CATEGORIAS_PADRAO.find((c) => c.id === (id as CategoriaId));
}

export function getServicosPadrao(id: CategoriaId): ServicoPadrao[] {
  return getCategoriaPadrao(id)?.servicos || [];
}

export function getFrequenciasPadrao(id: CategoriaId): FrequenciaPadrao[] {
  return getCategoriaPadrao(id)?.frequencias || [];
}

export function getAdicionaisPadrao(id: CategoriaId): AdicionalPadrao[] {
  return getCategoriaPadrao(id)?.adicionais || [];
}

export function getUsaComodos(id: CategoriaId): boolean {
  return getCategoriaPadrao(id)?.usa_comodos ?? false;
}

export function getSloganPadrao(id: CategoriaId): string {
  return getCategoriaPadrao(id)?.slogan || "Profissional de confiança";
}

export type MensagemEscolhida = {
  nome: string;
  confirmacao: string;
  lembrete: string;
};

export function getMensagensPadrao(id: string | null | undefined, variante = 0): MensagemEscolhida {
  const cat = getCategoriaPadrao(id ?? "outro");
  if (!cat) return { nome: "Equilibrado", confirmacao: "", lembrete: "" };
  const v = cat.msg_variantes?.[variante];
  return {
    nome: v?.nome || "Equilibrado",
    confirmacao: v?.confirmacao ?? cat.msg_confirmacao,
    lembrete: v?.lembrete ?? cat.msg_lembrete,
  };
}
