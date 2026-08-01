import type { CategoriaId } from "@/lib/servicos-padrao";

export type HookConfianca = { titulo: string; texto: string };
export type DepoimentoPadrao = { nome: string; bairro: string; texto: string };

export type CopyVariante = {
  nome: string;
  descricao: string;
  hero_titulo: string[];
  hero_destaque: string;
  hero_sub: string;
  confianca_titulo: string;
  cta_titulo: string;
  cta_sub: string;
};

export type CopyPadrao = {
  hero_titulo: string[];
  hero_destaque: string;
  hero_sub: string;
  hero_cta1: string;
  hero_cta2: string;
  confianca_eyebrow: string;
  confianca_titulo: string;
  confianca_hooks: HookConfianca[];
  servicos_titulo: string;
  servicos_sub: string;
  depoimentos: DepoimentoPadrao[];
  /** Depoimentos adicionais para rotação — cada profissional mostra uma seleção diferente */
  depoimentos_extra: DepoimentoPadrao[];
  cta_titulo: string;
  cta_sub: string;
  cta_btn: string;
  whatsapp_msg: string;
  /** Estilos alternativos de texto do site — o profissional escolhe no cadastro/painel */
  variantes: CopyVariante[];
};

export const VARIANTS_ATUAL = { nome: "Equilibrado", descricao: "O texto padrão: claro e acolhedor" };

export const COPYS_PADRAO: Record<CategoriaId, CopyPadrao> = {
  limpeza: {
    hero_titulo: ["Sempre a mesma pessoa", "de confiança na sua casa."],
    hero_destaque: "confiança",
    hero_sub:
      "Sou {nome}. Cuido do seu lar com capricho e dedicação — direto com você, sem aplicativos no meio.",
    hero_cta1: "Ver meu preço em 1 minuto",
    hero_cta2: "Tirar dúvida no WhatsApp",
    confianca_eyebrow: "Por que escolher {nome}",
    confianca_titulo: "As famílias de {cidade} confiam — e recomendam.",
    confianca_hooks: [
      {
        titulo: "Você nunca abre a porta pra um estranho",
        texto:
          "A mesma profissional em todas as visitas. Nada de rostos diferentes a cada semana — só confiança que se constrói.",
      },
      {
        titulo: "Sem app no meio. Sem comissão no seu bolso.",
        texto:
          "Combinamos tudo direto pelo WhatsApp, sem a comissão de um aplicativo encarecendo o seu serviço.",
      },
      {
        titulo: "Cuidado em cada detalhe",
        texto:
          "Uma reputação construída lar por lar, com quem cuida do seu espaço como se fosse o próprio.",
      },
    ],
    servicos_titulo: "Meus serviços",
    servicos_sub: "Escolha o serviço ideal para você",
    depoimentos: [
      { nome: "Ana Paula M.", bairro: "Batel", texto: "Minha casa nunca esteve tão limpa. Caprichosa e super confiável — deixo as chaves sem preocupação." },
      { nome: "Roberto S.", bairro: "Água Verde", texto: "Contratei e minha casa ficou impecável, detalhe por detalhe. Recomendo de olhos fechados." },
      { nome: "Juliana T.", bairro: "Cabral", texto: "Melhor decisão sair dos aplicativos e chamar direto. Preço justo e sempre pontual." },
    ],
    depoimentos_extra: [
      { nome: "Carla D.", bairro: "Mercês", texto: "A mesma pessoa toda semana, chave comigo e casa sempre no capricho. Segurança e qualidade." },
      { nome: "Pedro H.", bairro: "Seminário", texto: "Agendamento pelo site e confirmação no WhatsApp. Ponto pra quem vive corrido." },
      { nome: "Vanessa B.", bairro: "Centro", texto: "Limpeza pós-obra impecável. Chegou, resolveu e ainda deixou dicas de conservação." },
    ],
    cta_titulo: "Vamos conversar?",
    cta_sub: "Faça seu orçamento agora. Leva 1 minutinho e sua reserva já chega com todos os detalhes.",
    cta_btn: "Fazer orçamento",
    whatsapp_msg: "Olá {nome}! Vi seu site e gostaria de agendar um serviço.",
    variantes: [
      {
        nome: "Direto", descricao: "Foco em agendamento rápido e sem complicação",
        hero_titulo: ["Limpeza de verdade,", "sem intermediário."],
        hero_destaque: "intermediário",
        hero_sub: "Sou {nome} e atendo {cidade} com horário marcado. Escolha o serviço, veja o preço e confirme pelo WhatsApp.",
        confianca_titulo: "Orçamento claro e horário garantido.",
        cta_titulo: "Vamos marcar sua limpeza?",
        cta_sub: "Veja os preços, escolha o dia e confirme. Sem compromisso.",
      },
      {
        nome: "Acolhedor", descricao: "Foco em confiança e cuidado com o lar",
        hero_titulo: ["Sua casa no capricho,", "com quem você confia."],
        hero_destaque: "confia",
        hero_sub: "{nome} cuida do seu lar em {cidade} como se fosse o próprio — sempre a mesma pessoa, do agendamento ao acabamento.",
        confianca_titulo: "Confiança que se constrói visita a visita.",
        cta_titulo: "Deixe sua casa em boas mãos?",
        cta_sub: "Agende agora e receba confirmação e lembrete no WhatsApp, sem surpresa.",
      },
    ],
  },
  beleza: {
    hero_titulo: ["Seu momento de beleza,", "do seu jeito e no seu tempo."],
    hero_destaque: "beleza",
    hero_sub:
      "Agende com {nome} em segundos: corte, escova, sobrancelhas e mais. Horário confirmado no WhatsApp, lembrete automático e pagamento via Pix.",
    hero_cta1: "Agendar meu horário",
    hero_cta2: "Tirar dúvida no WhatsApp",
    confianca_eyebrow: "Por que escolher {nome}",
    confianca_titulo: "Clientes de {cidade} confiam — e voltam sempre.",
    confianca_hooks: [
      {
        titulo: "Sempre a mesma profissional",
        texto:
          "Você é atendida pela mesma profissional em todas as visitas — ela conhece seu cabelo, sua pele e seu estilo.",
      },
      {
        titulo: "Preço justo, sem comissão",
        texto:
          "Sem aplicativo no meio cobrando comissão: você combina direto pelo WhatsApp e paga via Pix.",
      },
      {
        titulo: "Cuidado do início ao fim",
        texto:
          "Do orçamento à finalização, cada detalhe é pensado para você sair ainda mais bonita e confiante.",
      },
    ],
    servicos_titulo: "Meus serviços",
    servicos_sub: "Escolha o seu próximo cuidado",
    depoimentos: [
      { nome: "Ana Paula M.", bairro: "Batel", texto: "Saí me sentindo outra pessoa. A {nome} capricha em cada detalhe, do atendimento ao resultado final." },
      { nome: "Camila R.", bairro: "Água Verde", texto: "Agendo tudo pelo site, sem esperar na fila. Lembrete no dia anterior e ainda pago no Pix. Prático demais." },
      { nome: "Juliana T.", bairro: "Cabral", texto: "Encontrei a profissional que meu cabelo precisava. Pontual, atenciosa e o resultado sempre impecável." },
    ],
    depoimentos_extra: [
      { nome: "Marina D.", bairro: "Mercês", texto: "Meu cabelo nunca esteve tão saudável. Profissional de mão cheia e super atenciosa." },
      { nome: "Letícia F.", bairro: "Seminário", texto: "Agendo pelo link até de madrugada e chego no horário, sem espera. Perfeito." },
      { nome: "Paula N.", bairro: "Centro", texto: "Sobrancelha e corte impecáveis. Resultado que dura e atendimento nota dez." },
    ],
    cta_titulo: "Vamos cuidar de você?",
    cta_sub: "Agende seu horário agora e garanta seu momento de beleza. Leva menos de 1 minuto.",
    cta_btn: "Agendar horário",
    whatsapp_msg: "Olá {nome}! Vi seu site e gostaria de agendar um horário.",
    variantes: [
      {
        nome: "Direto", descricao: "Foco em agendamento rápido, sem fila",
        hero_titulo: ["Seu horário de beleza,", "reservado em 1 minuto."],
        hero_destaque: "reservado",
        hero_sub: "Agende com {nome} sem ligar nem esperar: escolha o horário, confirme no WhatsApp e pague no Pix.",
        confianca_titulo: "Beleza sem fila e sem espera.",
        cta_titulo: "Seu próximo horário é agora",
        cta_sub: "Agende em menos de 1 minuto e receba o lembrete no dia anterior.",
      },
      {
        nome: "Acolhedor", descricao: "Foco no momento só seu e no cuidado",
        hero_titulo: ["Seu melhor momento,", "feito só pra você."],
        hero_destaque: "você",
        hero_sub: "Cada atendimento com {nome} é pensado para você: do orçamento ao retorno, sempre o mesmo cuidado e o mesmo carinho.",
        confianca_titulo: "Cuidado que vai além da cadeira.",
        cta_titulo: "Vamos cuidar de você?",
        cta_sub: "Agende seu horário e viva um momento só seu. Confirmação e lembrete pelo WhatsApp.",
      },
    ],
  },
  saude: {
    hero_titulo: ["Seu bem-estar", "começa com uma pausa."],
    hero_destaque: "bem-estar",
    hero_sub:
      "Massagem, acupuntura e cuidados que renovam corpo e mente. Agende sua sessão com {nome} online — rápido, seguro e sem complicação.",
    hero_cta1: "Agendar minha sessão",
    hero_cta2: "Tirar dúvida no WhatsApp",
    confianca_eyebrow: "Por que escolher {nome}",
    confianca_titulo: "Quem cuida de você precisa ser de confiança.",
    confianca_hooks: [
      {
        titulo: "Atendimento profissional e seguro",
        texto:
          "Sessões conduzidas por profissional preparado, com foco no seu bem-estar e na sua segurança.",
      },
      {
        titulo: "Sem mensalidade, sem comissão",
        texto:
          "Você paga apenas pela sua sessão, direto via Pix. Sem planos escondidos nem taxas surpresa.",
      },
      {
        titulo: "Cada sessão, um cuidado especial",
        texto:
          "O atendimento é pensado para as suas dores e necessidades — você sai renovado e ouvido.",
      },
    ],
    servicos_titulo: "Meus cuidados",
    servicos_sub: "Escolha o tratamento ideal para você",
    depoimentos: [
      { nome: "Fernanda L.", bairro: "Batel", texto: "Sai de cada sessão renovada. Atendimento acolhedor e profissional, do agendamento ao pós-sessão." },
      { nome: "Marcos A.", bairro: "Bigorrilho", texto: "Agendei em 1 minuto pelo link e ainda recebi lembrete no WhatsApp. Melhor que ficar ligando pra marcar." },
      { nome: "Patrícia S.", bairro: "Água Verde", texto: "Profissional atenciosa e pontual. Recomendo de olhos fechados para quem precisa relaxar de verdade." },
    ],
    depoimentos_extra: [
      { nome: "Carla D.", bairro: "Mercês", texto: "Massagem terapêutica que resolve mesmo. Saio leve e com o corpo agradecendo." },
      { nome: "Renata V.", bairro: "Seminário", texto: "Sem mensalidade, pago só a sessão no Pix. Simples e honesto." },
      { nome: "Sérgio T.", bairro: "Centro", texto: "Profissional que escuta de verdade. A sessão é feita pra você, não pra qualquer um." },
    ],
    cta_titulo: "Vamos cuidar de você?",
    cta_sub: "Agende sua sessão agora. É rápido, e seu bem-estar agradece.",
    cta_btn: "Agendar sessão",
    whatsapp_msg: "Olá {nome}! Vi seu site e gostaria de agendar uma sessão.",
    variantes: [
      {
        nome: "Direto", descricao: "Foco em praticidade, sem mensalidade",
        hero_titulo: ["Seu momento de relaxar,", "agendado em segundos."],
        hero_destaque: "relaxar",
        hero_sub: "Massagem, acupuntura e mais com {nome}: escolha o horário, confirme no WhatsApp e pague só na sessão.",
        confianca_titulo: "Sem plano, sem mensalidade — pague só pelo seu cuidado.",
        cta_titulo: "Agende sua sessão",
        cta_sub: "Escolha o horário que cabe na sua rotina. Confirmação imediata.",
      },
      {
        nome: "Acolhedor", descricao: "Foco em renovação e cuidado pessoal",
        hero_titulo: ["Um cuidado que", "renova corpo e mente."],
        hero_destaque: "renova",
        hero_sub: "Cada sessão com {nome} é pensada para o que você sente: suas dores, seu estresse, seu descanso — do começo ao fim.",
        confianca_titulo: "Você ouvido, cuidado e renovado.",
        cta_titulo: "Cuide de você hoje",
        cta_sub: "Sua sessão de bem-estar está a um clique. Agende agora.",
      },
    ],
  },
  personal: {
    hero_titulo: ["Seu treino,", "do seu jeito e no seu ritmo."],
    hero_destaque: "treino",
    hero_sub:
      "Aulas personalizadas com {nome} — presencial ou online. Agende seu horário direto pelo site, confirme no WhatsApp e evolua sem enrolação.",
    hero_cta1: "Agendar minha aula",
    hero_cta2: "Tirar dúvida no WhatsApp",
    confianca_eyebrow: "Por que escolher {nome}",
    confianca_titulo: "Treino sério, resultado de verdade.",
    confianca_hooks: [
      {
        titulo: "Treino feito pra você",
        texto:
          "Nada de treino genérico: cada sessão é ajustada ao seu objetivo, nível e rotina.",
      },
      {
        titulo: "Sem academia cara, sem mensalidade",
        texto:
          "Você paga só pelas suas aulas, direto no Pix. Simples e sem burocracia.",
      },
      {
        titulo: "Acompanhamento de verdade",
        texto:
          "Além do treino, você tem acompanhamento próximo e cobrança saudável pra não sair do foco.",
      },
    ],
    servicos_titulo: "Meus treinos",
    servicos_sub: "Escolha a modalidade ideal para você",
    depoimentos: [
      { nome: "Rafael M.", bairro: "Bigorrilho", texto: "Em 3 meses mudei completamente minha disposição. Treino ajustado ao meu dia a dia e horários flexíveis." },
      { nome: "Carolina F.", bairro: "Batel", texto: "Agendo pelo link e recebo lembrete no WhatsApp. Nunca mais perdi um treino." },
      { nome: "Diego P.", bairro: "Água Verde", texto: "Profissional que acompanha de verdade. Você sente a diferença no treino e nos resultados." },
    ],
    depoimentos_extra: [
      { nome: "Lucas S.", bairro: "Mercês", texto: "Agendo a aula pelo site e recebo lembrete no WhatsApp. Nunca mais faltei." },
      { nome: "Beatriz O.", bairro: "Seminário", texto: "Treino ajustado ao meu objetivo e acompanhamento de verdade. Resultado aparece." },
      { nome: "Thiago M.", bairro: "Centro", texto: "Sem mensalidade de academia, pago só as aulas que faço. Melhor custo-benefício." },
    ],
    cta_titulo: "Bora treinar?",
    cta_sub: "Agende sua aula agora e comece a evoluir ainda esta semana.",
    cta_btn: "Agendar aula",
    whatsapp_msg: "Olá {nome}! Vi seu site e gostaria de agendar uma aula.",
    variantes: [
      {
        nome: "Direto", descricao: "Foco em agendamento fácil e resultado",
        hero_titulo: ["Aula marcada,", "desculpa dispensada."],
        hero_destaque: "dispensada",
        hero_sub: "Agende sua aula com {nome} direto pelo site: escolha o horário, confirme no WhatsApp e treine sem enrolação.",
        confianca_titulo: "Sem mensalidade de academia — pague só pelas suas aulas.",
        cta_titulo: "Agende sua aula",
        cta_sub: "Comece a evoluir ainda esta semana.",
      },
      {
        nome: "Acolhedor", descricao: "Foco em acompanhamento e compromisso",
        hero_titulo: ["Mais que treino,", "um compromisso com você."],
        hero_destaque: "compromisso",
        hero_sub: "{nome} acompanha seu progresso de perto: cada sessão ajustada ao seu objetivo, com cobrança saudável pra você não parar.",
        confianca_titulo: "Acompanhamento que faz diferença no resultado.",
        cta_titulo: "Vamos evoluir juntos?",
        cta_sub: "Sua primeira aula está a um clique. Agende agora.",
      },
    ],
  },
  artes: {
    hero_titulo: ["Sua ideia,", "transformada em arte."],
    hero_destaque: "arte",
    hero_sub:
      "Tatuagem, pintura e artesanato feitos sob medida para você. Converse, faça seu orçamento e agende direto pelo site, sem intermediários.",
    hero_cta1: "Fazer meu orçamento",
    hero_cta2: "Tirar dúvida no WhatsApp",
    confianca_eyebrow: "Por que escolher {nome}",
    confianca_titulo: "Arte é confiança — e confiança se constrói.",
    confianca_hooks: [
      {
        titulo: "Trabalho feito com capricho",
        texto:
          "Cada peça é criada com atenção aos detalhes, do primeiro traço ao acabamento final.",
      },
      {
        titulo: "Orçamento claro, sem surpresa",
        texto:
          "Você sabe exatamente o valor antes de fechar. Pagamento direto via Pix, sem taxa de aplicativo.",
      },
      {
        titulo: "Sua ideia em boas mãos",
        texto:
          "Conversa, referências e ajustes até a arte ficar exatamente como você imaginou.",
      },
    ],
    servicos_titulo: "Meus trabalhos",
    servicos_sub: "Escolha o serviço ideal para você",
    depoimentos: [
      { nome: "Lucas S.", bairro: "Batel", texto: "A arte ficou exatamente como eu queria — e ainda melhor. Processo super transparente, do orçamento ao resultado." },
      { nome: "Beatriz O.", bairro: "Cabral", texto: "Agendei pelo link, conversamos pelo WhatsApp e ficou tudo perfeito. Recomendo demais." },
      { nome: "Thiago M.", bairro: "Água Verde", texto: "Profissional comprometido com o trabalho e com o cliente. Detalhe por detalhe, impecável." },
    ],
    depoimentos_extra: [
      { nome: "André C.", bairro: "Mercês", texto: "Orçamento claro antes de começar e resultado impecável no fim. Zero surpresa." },
      { nome: "Amanda R.", bairro: "Seminário", texto: "A tatuagem ficou melhor que a referência que levei. Talento de verdade." },
      { nome: "Elaine S.", bairro: "Centro", texto: "Comunicação fácil pelo WhatsApp e agendamento rápido pelo site. Recomendo." },
    ],
    cta_titulo: "Vamos criar juntos?",
    cta_sub: "Faça seu orçamento agora. Leva 1 minuto e sem compromisso.",
    cta_btn: "Fazer orçamento",
    whatsapp_msg: "Olá {nome}! Vi seu site e gostaria de fazer um orçamento.",
    variantes: [
      {
        nome: "Direto", descricao: "Foco em orçamento claro e sem surpresa",
        hero_titulo: ["Orçamento rápido,", "arte sem surpresa."],
        hero_destaque: "surpresa",
        hero_sub: "Converse com {nome}, receba o orçamento claro e agende direto pelo site — sem intermediário, sem taxa.",
        confianca_titulo: "Valor fechado antes, resultado depois — sem surpresa.",
        cta_titulo: "Faça seu orçamento",
        cta_sub: "Leva 1 minuto e sem compromisso.",
      },
      {
        nome: "Acolhedor", descricao: "Foco na sua ideia e no processo criativo",
        hero_titulo: ["Sua ideia,", "cuidada do traço ao acabamento."],
        hero_destaque: "cuidada",
        hero_sub: "Cada trabalho de {nome} nasce da sua ideia: referências, conversa e ajustes até a arte ficar exatamente como você imaginou.",
        confianca_titulo: "Sua ideia em boas mãos, do início ao fim.",
        cta_titulo: "Vamos criar juntos?",
        cta_sub: "Agende uma conversa sem compromisso.",
      },
    ],
  },
  gastronomia: {
    hero_titulo: ["Uma experiência gastronômica", "no conforto da sua casa."],
    hero_destaque: "gastronômica",
    hero_sub:
      "Chef particular, buffet e aulas de culinária com {nome}. Monte seu evento, confirme pelo WhatsApp e receba tudo com capricho.",
    hero_cta1: "Fazer meu orçamento",
    hero_cta2: "Tirar dúvida no WhatsApp",
    confianca_eyebrow: "Por que escolher {nome}",
    confianca_titulo: "Sabores que fazem qualquer ocasião especial.",
    confianca_hooks: [
      {
        titulo: "Chef dedicado ao seu evento",
        texto:
          "Do menu à apresentação, tudo é preparado exclusivamente para você e seus convidados.",
      },
      {
        titulo: "Valor justo e transparente",
        texto:
          "Orçamento claro antes de fechar, pagamento direto via Pix. Sem taxa de plataforma.",
      },
      {
        titulo: "Cada detalhe com carinho",
        texto:
          "Ingredientes escolhidos a dedo e um cuidado que faz a diferença no sabor e na mesa.",
      },
    ],
    servicos_titulo: "Minhas experiências",
    servicos_sub: "Escolha o momento ideal para você",
    depoimentos: [
      { nome: "Renata V.", bairro: "Batel", texto: "O jantar foi um sucesso! Todos elogiaram. Organização impecável do agendamento à sobremesa." },
      { nome: "Eduardo C.", bairro: "Água Verde", texto: "Contratei pra um aniversário e foi impecável. Orçamento rápido pelo site e confirmação no WhatsApp." },
      { nome: "Marina D.", bairro: "Cabral", texto: "Comida deliciosa e profissional muito pontual. A experiência superou a expectativa." },
    ],
    depoimentos_extra: [
      { nome: "Felipe N.", bairro: "Mercês", texto: "Aula de culinária divertida e cheia de aprendizado. Saí cozinhando melhor no mesmo dia." },
      { nome: "Larissa M.", bairro: "Seminário", texto: "Buffet de aniversário impecável, do cardápio à apresentação. Todos elogiaram." },
      { nome: "Carlos M.", bairro: "Centro", texto: "Chef em casa pra um jantar especial: pontual, organizado e comida incrível." },
    ],
    cta_titulo: "Vamos cozinhar pra você?",
    cta_sub: "Monte seu evento ou jantar agora. Orçamento rápido e sem compromisso.",
    cta_btn: "Fazer orçamento",
    whatsapp_msg: "Olá {nome}! Vi seu site e gostaria de fazer um orçamento.",
    variantes: [
      {
        nome: "Direto", descricao: "Foco em evento montado sem complicação",
        hero_titulo: ["Evento montado,", "sem dor de cabeça."],
        hero_destaque: "cabeça",
        hero_sub: "Chef particular, buffet ou aula: {nome} organiza tudo e você só aproveita. Orçamento claro, confirmação no WhatsApp.",
        confianca_titulo: "Do menu à mesa, tudo combinado com você.",
        cta_titulo: "Monte seu evento",
        cta_sub: "Orçamento rápido, sem compromisso.",
      },
      {
        nome: "Acolhedor", descricao: "Foco no capricho e no sabor de verdade",
        hero_titulo: ["Sabores feitos", "com carinho pra você."],
        hero_destaque: "carinho",
        hero_sub: "Cada prato de {nome} é preparado exclusivamente para o seu momento — ingredientes escolhidos a dedo, da entrada à sobremesa.",
        confianca_titulo: "Cada detalhe pensado para emocionar à mesa.",
        cta_titulo: "Vamos cozinhar pra você?",
        cta_sub: "Agende seu jantar ou evento agora.",
      },
    ],
  },
  fotografia: {
    hero_titulo: ["Seus melhores momentos,", "registrados pra sempre."],
    hero_destaque: "momentos",
    hero_sub:
      "Ensaio, evento ou casamento: fotos com qualidade e emoção. Agende com {nome} direto pelo site e tenha lembranças que duram a vida toda.",
    hero_cta1: "Agendar meu ensaio",
    hero_cta2: "Tirar dúvida no WhatsApp",
    confianca_eyebrow: "Por que escolher {nome}",
    confianca_titulo: "Fotografia é memória — e memória merece capricho.",
    confianca_hooks: [
      {
        titulo: "Fotos com olhar profissional",
        texto:
          "Enquadramento, luz e direção que valorizam cada momento, com entrega no prazo combinado.",
      },
      {
        titulo: "Pacotes claros, sem surpresa",
        texto:
          "Valor fechado antes do ensaio, pagamento via Pix. Sem custo escondido.",
      },
      {
        titulo: "Você confortável em cada clique",
        texto:
          "Atendimento leve e acolhedor — até quem não gosta de posar se sente à vontade.",
      },
    ],
    servicos_titulo: "Meus ensaios",
    servicos_sub: "Escolha o momento para eternizar",
    depoimentos: [
      { nome: "Amanda R.", bairro: "Batel", texto: "As fotos ficaram lindas! Ensaio leve, divertido e com resultado profissional de verdade." },
      { nome: "Felipe N.", bairro: "Água Verde", texto: "Contratei pro meu casamento e cada foto conta a história do dia. Entrega rápida e muito capricho." },
      { nome: "Larissa M.", bairro: "Cabral", texto: "Agendei pelo link, sem burocracia. Melhor escolha: fotos incríveis e atendimento nota dez." },
    ],
    depoimentos_extra: [
      { nome: "Patrícia S.", bairro: "Mercês", texto: "Ensaio gestante emocionante. Fotos lindas e entrega antes do prazo combinado." },
      { nome: "Bruno T.", bairro: "Seminário", texto: "Ensaio de família leve e divertido — até as crianças cooperaram. Resultado nota dez." },
      { nome: "Aline G.", bairro: "Centro", texto: "Agendei tudo pelo site, sem burocracia. Fotos com qualidade de estúdio." },
    ],
    cta_titulo: "Vamos criar memórias?",
    cta_sub: "Agende seu ensaio agora e garanta fotos que você vai amar rever.",
    cta_btn: "Agendar ensaio",
    whatsapp_msg: "Olá {nome}! Vi seu site e gostaria de agendar um ensaio.",
    variantes: [
      {
        nome: "Direto", descricao: "Foco em pacote fechado e entrega no prazo",
        hero_titulo: ["Ensaio agendado,", "resultado no prazo."],
        hero_destaque: "prazo",
        hero_sub: "Agende seu ensaio ou evento com {nome}: pacote fechado, valor claro e fotos entregues na data combinada.",
        confianca_titulo: "Pacotes claros, entrega no prazo.",
        cta_titulo: "Agende seu ensaio",
        cta_sub: "Garanta a data que você quer.",
      },
      {
        nome: "Acolhedor", descricao: "Foco na emoção e no conforto de cada clique",
        hero_titulo: ["Momentos que", "merecem ser eternizados."],
        hero_destaque: "eternizados",
        hero_sub: "Além da foto, {nome} entrega a emoção do momento: direção leve e acolhedora pra você se sentir à vontade em cada clique.",
        confianca_titulo: "Você confortável — e lindo — em cada clique.",
        cta_titulo: "Vamos criar memórias?",
        cta_sub: "Agende agora e receba confirmação imediata.",
      },
    ],
  },
  consultoria: {
    hero_titulo: ["Conhecimento que", "transforma resultados."],
    hero_destaque: "conhecimento",
    hero_sub:
      "Consultoria, mentoria e aulas particulares com {nome}. Agende sua sessão online ou presencial direto pelo site — no seu horário, no seu ritmo.",
    hero_cta1: "Agendar minha sessão",
    hero_cta2: "Tirar dúvida no WhatsApp",
    confianca_eyebrow: "Por que escolher {nome}",
    confianca_titulo: "Aprendizado direto com quem entende.",
    confianca_hooks: [
      {
        titulo: "Conteúdo feito pra você",
        texto:
          "Cada sessão é preparada para o seu momento, objetivo e desafio específico.",
      },
      {
        titulo: "Investimento claro, sem taxa",
        texto:
          "Você paga direto ao profissional via Pix, sem intermediário e sem mensalidade obrigatória.",
      },
      {
        titulo: "Acompanhamento que engaja",
        texto:
          "Mais que conteúdo: direcionamento prático e suporte entre as sessões.",
      },
    ],
    servicos_titulo: "Minhas sessões",
    servicos_sub: "Escolha o formato ideal para você",
    depoimentos: [
      { nome: "Bruno T.", bairro: "Bigorrilho", texto: "A consultoria mudou meu jeito de trabalhar. Sessões objetivas, direto ao ponto e com resultado mensurável." },
      { nome: "Aline G.", bairro: "Batel", texto: "Agendo tudo pelo site e acompanho pelo WhatsApp. Prático, profissional e sem enrolação." },
      { nome: "Ricardo L.", bairro: "Água Verde", texto: "Profissional que realmente se importa com sua evolução. Recomendo sem pensar duas vezes." },
    ],
    depoimentos_extra: [
      { nome: "Marina D.", bairro: "Mercês", texto: "Saí da primeira sessão com um plano de ação claro. Mudança visível no meu resultado." },
      { nome: "Rodrigo F.", bairro: "Seminário", texto: "Aulas particulares no meu ritmo e no meu horário. Evolução constante." },
      { nome: "Paula N.", bairro: "Centro", texto: "Consultoria objetiva, sem enrolação. Investimento que se paga em poucas semanas." },
    ],
    cta_titulo: "Vamos conversar?",
    cta_sub: "Agende sua sessão agora e dê o próximo passo hoje.",
    cta_btn: "Agendar sessão",
    whatsapp_msg: "Olá {nome}! Vi seu site e gostaria de agendar uma sessão.",
    variantes: [
      {
        nome: "Direto", descricao: "Foco em sessão objetiva e resultado prático",
        hero_titulo: ["Sessão agendada,", "resultado em prática."],
        hero_destaque: "prática",
        hero_sub: "Agende sua consultoria ou aula com {nome} online ou presencial: sessão objetiva, material de apoio e direção prática.",
        confianca_titulo: "Mais que conteúdo: direção que gera resultado.",
        cta_titulo: "Agende sua sessão",
        cta_sub: "Dê o próximo passo hoje.",
      },
      {
        nome: "Acolhedor", descricao: "Foco na sua jornada e no acompanhamento",
        hero_titulo: ["Conhecimento que", "transforma a sua jornada."],
        hero_destaque: "transforma",
        hero_sub: "Cada sessão com {nome} é preparada para o seu momento: seu objetivo, seu desafio e o acompanhamento que você precisa entre sessões.",
        confianca_titulo: "Você acompanhado, não só atendido.",
        cta_titulo: "Vamos conversar?",
        cta_sub: "Sua evolução começa com uma sessão. Agende agora.",
      },
    ],
  },
  unhas: {
    hero_titulo: ["Unhas impecáveis,", "do seu jeito."],
    hero_destaque: "impecáveis",
    hero_sub:
      "Sou {nome}. Alongamento, esmaltação em gel e nail art com acabamento perfeito — agenda online e horário garantido.",
    hero_cta1: "Agendar meu horário",
    hero_cta2: "Tirar dúvida no WhatsApp",
    confianca_eyebrow: "Por que escolher {nome}",
    confianca_titulo: "Manicure e nail designer de confiança em {cidade}.",
    confianca_hooks: [
      {
        titulo: "Acabamento que dura",
        texto:
          "Técnica de verdade: base, cor e finalização bem feitas para suas unhas durarem semanas, não dias.",
      },
      {
        titulo: "Horário marcado, sem fila",
        texto:
          "Agende online e chegue direto: seu horário é seu. Nada de esperar na sala de espera.",
      },
      {
        titulo: "Hidratação e cuidado em cada detalhe",
        texto:
          "Cutículas, esmaltação e decoração feitas com carinho — suas unhas ficam lindas e saudáveis.",
      },
    ],
    servicos_titulo: "Meus serviços",
    servicos_sub: "Escolha o serviço ideal para você",
    depoimentos: [
      { nome: "Camila R.", bairro: "Bigorrilho", texto: "Meu alongamento de gel está perfeito há 3 semanas. Atendimento impecável e no horário certinho." },
      { nome: "Fernanda L.", bairro: "Cristo Rei", texto: "Unha de fibra de vidro mais linda que já fiz. Ela capricha em cada detalhe, recomendo demais." },
      { nome: "Patrícia M.", bairro: "Batel", texto: "Agendei pelo site, fui atendida no horário e saí com as unhas impecáveis. Já virei cliente fixa." },
    ],
    depoimentos_extra: [
      { nome: "Vanessa B.", bairro: "Mercês", texto: "Esmaltação em gel durando 3 semanas. Técnica impecável e unhas saudáveis." },
      { nome: "Carla D.", bairro: "Seminário", texto: "Nail art lindíssima pro meu casamento. Atendimento no horário e com capricho." },
      { nome: "Larissa M.", bairro: "Centro", texto: "Agendo pelo site e nunca espero. Horário é horário — e a unha fica perfeita." },
    ],
    cta_titulo: "Bora marcar seu horário?",
    cta_sub: "Agende online agora: seu horário confirmado no WhatsApp, sem fila e sem espera.",
    cta_btn: "Agendar horário",
    whatsapp_msg: "Olá {nome}! Vi seu site e quero agendar um horário para as unhas.",
    variantes: [
      {
        nome: "Direto", descricao: "Foco em horário marcado e pontualidade",
        hero_titulo: ["Unhas perfeitas,", "sem fila e sem espera."],
        hero_destaque: "espera",
        hero_sub: "Agende com {nome} em segundos e chegue no horário: seu alongamento ou esmaltação começa na hora marcada.",
        confianca_titulo: "Horário é horário — pontualidade em primeiro lugar.",
        cta_titulo: "Garanta seu horário hoje",
        cta_sub: "Agende online e receba confirmação na hora. Sem espera, sem fila.",
      },
      {
        nome: "Acolhedor", descricao: "Foco em técnica e acabamento que dura",
        hero_titulo: ["Suas unhas merecem", "um cuidado especial."],
        hero_destaque: "especial",
        hero_sub: "Mais que esmaltação: {nome} cuida das suas unhas com técnica e carinho para durarem semanas, não dias.",
        confianca_titulo: "Acabamento que dura — e cuidado que se sente.",
        cta_titulo: "Vamos cuidar das suas unhas?",
        cta_sub: "Agende agora e saia com as unhas que você sempre quis.",
      },
    ],
  },
  clinica: {
    hero_titulo: ["Sua saúde com", "horário marcado."],
    hero_destaque: "horário marcado",
    hero_sub:
      "Consulta e acompanhamento na Clínica {nome}, em {cidade} — agende online e evite filas e esperas na recepção.",
    hero_cta1: "Agendar consulta",
    hero_cta2: "Tirar dúvida no WhatsApp",
    confianca_eyebrow: "Por que escolher {nome}",
    confianca_titulo: "Atendimento sério, do agendamento ao tratamento.",
    confianca_hooks: [
      {
        titulo: "Sem espera na recepção",
        texto:
          "Seu horário é reservado só para você: chegue na hora marcada e seja atendido pontualmente.",
      },
      {
        titulo: "Acompanhamento contínuo",
        texto:
          "Registro completo do seu histórico e lembretes automáticos de retorno e exames no WhatsApp.",
      },
      {
        titulo: "Confirmação e lembretes automáticos",
        texto:
          "Confirmação na hora do agendamento e lembrete no dia anterior — você nunca mais perde uma consulta.",
      },
    ],
    servicos_titulo: "Nossos serviços",
    servicos_sub: "Escolha o atendimento ideal para você",
    depoimentos: [
      { nome: "Marcos V.", bairro: "Portão", texto: "Agendei online e fui atendido na hora, sem espera. Atendimento atencioso do início ao fim." },
      { nome: "Elaine S.", bairro: "Água Verde", texto: "Recebi confirmação e lembrete no WhatsApp. Nunca mais esqueci uma consulta." },
      { nome: "Rodrigo F.", bairro: "Campina do Siqueira", texto: "Praticidade total: marquei a consulta em 1 minuto pelo site e o atendimento foi excelente." },
    ],
    depoimentos_extra: [
      { nome: "Fernanda L.", bairro: "Mercês", texto: "Lembrete de retorno chegando sozinho no WhatsApp. Cuidado que faz diferença." },
      { nome: "Camila R.", bairro: "Seminário", texto: "Sem fila na recepção, horário cumprido e atendimento humano. Raridade hoje em dia." },
      { nome: "Diego P.", bairro: "Centro", texto: "Marquei a consulta em 1 minuto pelo site. Praticidade e pontualidade em primeiro lugar." },
    ],
    cta_titulo: "Agende sua consulta",
    cta_sub: "Escolha o horário que cabe na sua rotina. Confirmação imediata no WhatsApp.",
    cta_btn: "Agendar consulta",
    whatsapp_msg: "Olá {nome}! Vi o site da clínica e gostaria de agendar uma consulta.",
    variantes: [
      {
        nome: "Direto", descricao: "Foco em consulta sem espera",
        hero_titulo: ["Consulta sem espera,", "horário garantido."],
        hero_destaque: "garantido",
        hero_sub: "Agende sua consulta na {nome} online: chegue no horário e seja atendido sem fila na recepção.",
        confianca_titulo: "Do agendamento ao atendimento, pontualidade.",
        cta_titulo: "Agende sua consulta agora",
        cta_sub: "Escolha o melhor horário para você e receba confirmação imediata.",
      },
      {
        nome: "Acolhedor", descricao: "Foco em acompanhamento contínuo",
        hero_titulo: ["Seu tratamento,", "sem pressa e sem fila."],
        hero_destaque: "pressa",
        hero_sub: "Acompanhamento de verdade na {nome}: lembretes automáticos, histórico completo e retorno sempre lembrado — sem você correr atrás.",
        confianca_titulo: "Você nunca fica sem acompanhamento.",
        cta_titulo: "Comece seu tratamento",
        cta_sub: "Agende sua primeira consulta e tenha seu histórico sempre em dia.",
      },
    ],
  },
  automotivo: {
    hero_titulo: ["Seu carro", "sempre no ponto."],
    hero_destaque: "no ponto",
    hero_sub:
      "Lavagem, detalhamento, polimento e mecânica com {nome} — agende online e deixe seu carro nas melhores mãos.",
    hero_cta1: "Agendar serviço",
    hero_cta2: "Pedir orçamento no WhatsApp",
    confianca_eyebrow: "Por que escolher {nome}",
    confianca_titulo: "Cuidado de verdade com o seu veículo.",
    confianca_hooks: [
      {
        titulo: "Agendamento sem fila",
        texto:
          "Escolha o dia e horário online: chegue, entregue a chave e receba no prazo combinado.",
      },
      {
        titulo: "Produtos e peças de qualidade",
        texto:
          "Trabalhamos com produtos certificados e peças originais — sem atalhos no seu carro.",
      },
      {
        titulo: "Lembrete na hora certa",
        texto:
          "Confirmação e lembrete automáticos no WhatsApp: revisão, troca de óleo ou lavagem nunca mais passam da data.",
      },
    ],
    servicos_titulo: "Meus serviços",
    servicos_sub: "Escolha o serviço ideal para o seu veículo",
    depoimentos: [
      { nome: "André C.", bairro: "Bigorrilho", texto: "Agendei a lavagem completa online, entreguei o carro e busquei no horário. Impecável." },
      { nome: "Sérgio T.", bairro: "Batel", texto: "Revisão e troca de óleo sem espera. Agendamento online facilita muito a rotina." },
      { nome: "Paula N.", bairro: "Mercês", texto: "Polimento nota 10. Carro saiu brilhando e eles ainda mandam lembrete para a próxima manutenção." },
    ],
    depoimentos_extra: [
      { nome: "Roberto S.", bairro: "Mercês", texto: "Detalhamento completo que deixou o carro zero. Capricho em cada detalhe." },
      { nome: "Juliana T.", bairro: "Seminário", texto: "Agendei a troca de óleo online e fui atendida no horário. Sem espera." },
      { nome: "Ana Paula M.", bairro: "Centro", texto: "Lavagem semanal com desconto e lembrete automático. Praticidade total." },
    ],
    cta_titulo: "Agende o serviço do seu carro",
    cta_sub: "Escolha o serviço e o horário — confirmação na hora no WhatsApp.",
    cta_btn: "Agendar serviço",
    whatsapp_msg: "Olá {nome}! Vi seu site e gostaria de agendar um serviço para meu carro.",
    variantes: [
      {
        nome: "Direto", descricao: "Foco em agendamento sem fila",
        hero_titulo: ["Seu carro no ponto,", "sem fila e no horário."],
        hero_destaque: "horário",
        hero_sub: "Agende lavagem, polimento ou revisão com {nome}: entregue a chave e receba no prazo combinado.",
        confianca_titulo: "Chegou, entregou, recebeu — no horário.",
        cta_titulo: "Agende o serviço do seu carro",
        cta_sub: "Escolha o serviço e o horário. Confirmação na hora.",
      },
      {
        nome: "Acolhedor", descricao: "Foco em qualidade e cuidado com o veículo",
        hero_titulo: ["Cuidado de verdade", "com quem você confia o carro."],
        hero_destaque: "confia",
        hero_sub: "Produtos de qualidade e peças originais: {nome} trata seu carro como se fosse o próprio, do detalhe ao acabamento.",
        confianca_titulo: "Seu carro em mãos de quem se importa.",
        cta_titulo: "Deixe seu carro em boas mãos",
        cta_sub: "Agende agora e receba lembretes de manutenção no WhatsApp.",
      },
    ],
  },
  veterinario: {
    hero_titulo: ["Cuidado de verdade", "para quem você ama."],
    hero_destaque: "Cuidado de verdade",
    hero_sub:
      "Consulta, vacinação, banho e tosa com {nome} — agende online e dê ao seu pet o cuidado que ele merece.",
    hero_cta1: "Agendar atendimento",
    hero_cta2: "Tirar dúvida no WhatsApp",
    confianca_eyebrow: "Por que escolher {nome}",
    confianca_titulo: "Seu pet bem cuidado, do agendamento ao atendimento.",
    confianca_hooks: [
      {
        titulo: "Atendimento pontual",
        texto:
          "Seu horário é reservado para o seu pet: nada de espera longa nem fila no consultório.",
      },
      {
        titulo: "Carteirinha de vacinação em dia",
        texto:
          "Lembretes automáticos no WhatsApp para vacinas, retornos e banho — você nunca esquece.",
      },
      {
        titulo: "Amor e técnica em cada visita",
        texto:
          "Equipe dedicada e paciente que trata o seu pet com o carinho que ele merece.",
      },
    ],
    servicos_titulo: "Nossos serviços",
    servicos_sub: "Escolha o serviço ideal para o seu pet",
    depoimentos: [
      { nome: "Beatriz A.", bairro: "Campo Comprido", texto: "Agendei o banho e tosa online e o atendimento foi impecável. Meu cachorro saiu lindo!" },
      { nome: "Carlos M.", bairro: "Fazendinha", texto: "Vacinação sem espera e recebo lembrete de retorno no WhatsApp. Recomendo." },
      { nome: "Luciana P.", bairro: "Água Verde", texto: "Consulta agendada em 1 minuto e atendimento super atencioso com a minha gata." },
    ],
    depoimentos_extra: [
      { nome: "André C.", bairro: "Mercês", texto: "Banho e tosa nota dez. Meu cachorro sai sempre feliz e cheiroso." },
      { nome: "Patrícia M.", bairro: "Seminário", texto: "Lembrete de vacina chegou no WhatsApp e não deixei passar. Atendimento atencioso." },
      { nome: "Eduardo C.", bairro: "Centro", texto: "Agendei a consulta em 1 minuto e fui atendido sem espera. Meu pet adora voltar." },
    ],
    cta_titulo: "Agende o cuidado do seu pet",
    cta_sub: "Consulta, banho ou vacina — escolha o horário e confirme no WhatsApp.",
    cta_btn: "Agendar atendimento",
    whatsapp_msg: "Olá {nome}! Vi seu site e gostaria de agendar um atendimento para meu pet.",
    variantes: [
      {
        nome: "Direto", descricao: "Foco em horário reservado e pontual",
        hero_titulo: ["Seu pet no horário,", "sem fila e sem estresse."],
        hero_destaque: "estresse",
        hero_sub: "Agende consulta, vacina ou banho com {nome}: horário reservado, atendimento pontual e lembretes automáticos.",
        confianca_titulo: "Pontualidade que seu pet merece.",
        cta_titulo: "Agende o atendimento do seu pet",
        cta_sub: "Escolha o horário e confirme no WhatsApp.",
      },
      {
        nome: "Acolhedor", descricao: "Foco no carinho e no cuidado",
        hero_titulo: ["Quem você ama,", "nos melhores cuidados."],
        hero_destaque: "melhores",
        hero_sub: "Banho, vacina ou consulta: {nome} trata seu pet com a paciência e o carinho que ele merece, do início ao fim.",
        confianca_titulo: "Amor e técnica em cada atendimento.",
        cta_titulo: "Cuide de quem você ama",
        cta_sub: "Agende agora — vacina e retorno nunca mais passam da data.",
      },
    ],
  },
  outro: {
    hero_titulo: ["Atendimento profissional,", "do jeito que você merece."],
    hero_destaque: "profissional",
    hero_sub:
      "Agende seu horário com {nome} direto pelo site: confirmação e lembretes no WhatsApp, pagamento via Pix e atendimento sem burocracia.",
    hero_cta1: "Agendar horário",
    hero_cta2: "Tirar dúvida no WhatsApp",
    confianca_eyebrow: "Por que escolher {nome}",
    confianca_titulo: "Quem atende com qualidade, fideliza.",
    confianca_hooks: [
      {
        titulo: "Atendimento direto e de confiança",
        texto:
          "Você fala direto com quem executa o serviço — sem intermediários, sem ruído na comunicação.",
      },
      {
        titulo: "Sem comissão de aplicativo",
        texto:
          "Agende pelo site e pague direto ao profissional via Pix. Sem taxa escondida no seu bolso.",
      },
      {
        titulo: "Conveniência de verdade",
        texto:
          "Agendamento 24h, confirmação e lembrete automáticos no WhatsApp e horário garantido.",
      },
    ],
    servicos_titulo: "Meus serviços",
    servicos_sub: "Escolha o serviço ideal para você",
    depoimentos: [
      { nome: "Ana Paula M.", bairro: "Batel", texto: "Agendei pelo site e tudo funcionou perfeitamente. Atendimento pontual e de qualidade." },
      { nome: "Roberto S.", bairro: "Água Verde", texto: "Prático demais: escolhi o horário, recebi a confirmação no WhatsApp e fui atendido no dia combinado." },
      { nome: "Juliana T.", bairro: "Cabral", texto: "Recomendo! Profissional dedicado e agendamento sem dor de cabeça." },
    ],
    depoimentos_extra: [
      { nome: "Carla D.", bairro: "Mercês", texto: "Atendimento direto com quem faz o serviço. Comunicação clara e resultado no prazo." },
      { nome: "Marcos A.", bairro: "Seminário", texto: "Agendei pelo site, recebi confirmação no WhatsApp e fui atendido no horário." },
      { nome: "Renata V.", bairro: "Centro", texto: "Sem taxa de aplicativo e sem dor de cabeça. Recomendo de olhos fechados." },
    ],
    cta_titulo: "Vamos conversar?",
    cta_sub: "Faça seu orçamento agora. Leva 1 minutinho e sem compromisso.",
    cta_btn: "Fazer orçamento",
    whatsapp_msg: "Olá {nome}! Vi seu site e gostaria de agendar.",
    variantes: [
      {
        nome: "Direto", descricao: "Foco em agendamento rápido e sem burocracia",
        hero_titulo: ["Agendamento rápido,", "sem burocracia."],
        hero_destaque: "burocracia",
        hero_sub: "Agende seu horário com {nome} em segundos: escolha o serviço, confirme no WhatsApp e seja atendido no dia combinado.",
        confianca_titulo: "Simples, direto e sem enrolação.",
        cta_titulo: "Agende seu horário",
        cta_sub: "Confirmação na hora, sem complicação.",
      },
      {
        nome: "Acolhedor", descricao: "Foco em relação direta e transparência",
        hero_titulo: ["Atendimento de confiança,", "do primeiro contato ao fim."],
        hero_destaque: "confiança",
        hero_sub: "Você fala direto com {nome}: sem intermediários, sem ruído, sem surpresa — só um atendimento feito com atenção.",
        confianca_titulo: "Relação direta, transparência total.",
        cta_titulo: "Vamos conversar?",
        cta_sub: "Faça seu orçamento agora, sem compromisso.",
      },
    ],
  },
};

export function getCopyPadrao(categoria?: string | null, variante = 0): CopyPadrao {
  const key = (categoria ?? "outro") as CategoriaId;
  const base = COPYS_PADRAO[key] ?? COPYS_PADRAO.outro;
  const v = base.variantes?.[variante];
  if (!v) return base;
  return {
    ...base,
    hero_titulo: v.hero_titulo,
    hero_destaque: v.hero_destaque,
    hero_sub: v.hero_sub,
    confianca_titulo: v.confianca_titulo,
    cta_titulo: v.cta_titulo,
    cta_sub: v.cta_sub,
  };
}

export function preencherCopy(texto: string, valores: Record<string, string>): string {
  return Object.entries(valores).reduce(
    (acc, [chave, valor]) => acc.replaceAll(`{${chave}}`, valor),
    texto
  );
}

export function rotacionarDepoimentos(
  pool: DepoimentoPadrao[],
  semente: string,
  quantidade = 3
): DepoimentoPadrao[] {
  if (pool.length <= quantidade) return pool;
  let h = 0;
  for (let i = 0; i < semente.length; i++) {
    h = (h * 31 + semente.charCodeAt(i)) >>> 0;
  }
  const rnd = () => {
    h = (h * 1103515245 + 12345) >>> 0;
    return h / 2 ** 32;
  };
  const arr = [...pool];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, quantidade);
}
