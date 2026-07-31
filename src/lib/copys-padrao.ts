import type { CategoriaId } from "@/lib/servicos-padrao";

export type HookConfianca = { titulo: string; texto: string };
export type DepoimentoPadrao = { nome: string; bairro: string; texto: string };

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
  cta_titulo: string;
  cta_sub: string;
  cta_btn: string;
  whatsapp_msg: string;
};

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
    cta_titulo: "Vamos conversar?",
    cta_sub: "Faça seu orçamento agora. Leva 1 minutinho e sua reserva já chega com todos os detalhes.",
    cta_btn: "Fazer orçamento",
    whatsapp_msg: "Olá {nome}! Vi seu site e gostaria de agendar um serviço.",
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
    cta_titulo: "Vamos cuidar de você?",
    cta_sub: "Agende seu horário agora e garanta seu momento de beleza. Leva menos de 1 minuto.",
    cta_btn: "Agendar horário",
    whatsapp_msg: "Olá {nome}! Vi seu site e gostaria de agendar um horário.",
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
    cta_titulo: "Vamos cuidar de você?",
    cta_sub: "Agende sua sessão agora. É rápido, e seu bem-estar agradece.",
    cta_btn: "Agendar sessão",
    whatsapp_msg: "Olá {nome}! Vi seu site e gostaria de agendar uma sessão.",
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
    cta_titulo: "Bora treinar?",
    cta_sub: "Agende sua aula agora e comece a evoluir ainda esta semana.",
    cta_btn: "Agendar aula",
    whatsapp_msg: "Olá {nome}! Vi seu site e gostaria de agendar uma aula.",
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
    cta_titulo: "Vamos criar juntos?",
    cta_sub: "Faça seu orçamento agora. Leva 1 minuto e sem compromisso.",
    cta_btn: "Fazer orçamento",
    whatsapp_msg: "Olá {nome}! Vi seu site e gostaria de fazer um orçamento.",
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
    cta_titulo: "Vamos cozinhar pra você?",
    cta_sub: "Monte seu evento ou jantar agora. Orçamento rápido e sem compromisso.",
    cta_btn: "Fazer orçamento",
    whatsapp_msg: "Olá {nome}! Vi seu site e gostaria de fazer um orçamento.",
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
    cta_titulo: "Vamos criar memórias?",
    cta_sub: "Agende seu ensaio agora e garanta fotos que você vai amar rever.",
    cta_btn: "Agendar ensaio",
    whatsapp_msg: "Olá {nome}! Vi seu site e gostaria de agendar um ensaio.",
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
    cta_titulo: "Vamos conversar?",
    cta_sub: "Agende sua sessão agora e dê o próximo passo hoje.",
    cta_btn: "Agendar sessão",
    whatsapp_msg: "Olá {nome}! Vi seu site e gostaria de agendar uma sessão.",
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
    cta_titulo: "Bora marcar seu horário?",
    cta_sub: "Agende online agora: seu horário confirmado no WhatsApp, sem fila e sem espera.",
    cta_btn: "Agendar horário",
    whatsapp_msg: "Olá {nome}! Vi seu site e quero agendar um horário para as unhas.",
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
    cta_titulo: "Agende sua consulta",
    cta_sub: "Escolha o horário que cabe na sua rotina. Confirmação imediata no WhatsApp.",
    cta_btn: "Agendar consulta",
    whatsapp_msg: "Olá {nome}! Vi o site da clínica e gostaria de agendar uma consulta.",
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
    cta_titulo: "Agende o serviço do seu carro",
    cta_sub: "Escolha o serviço e o horário — confirmação na hora no WhatsApp.",
    cta_btn: "Agendar serviço",
    whatsapp_msg: "Olá {nome}! Vi seu site e gostaria de agendar um serviço para meu carro.",
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
    cta_titulo: "Agende o cuidado do seu pet",
    cta_sub: "Consulta, banho ou vacina — escolha o horário e confirme no WhatsApp.",
    cta_btn: "Agendar atendimento",
    whatsapp_msg: "Olá {nome}! Vi seu site e gostaria de agendar um atendimento para meu pet.",
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
    cta_titulo: "Vamos conversar?",
    cta_sub: "Faça seu orçamento agora. Leva 1 minutinho e sem compromisso.",
    cta_btn: "Fazer orçamento",
    whatsapp_msg: "Olá {nome}! Vi seu site e gostaria de agendar.",
  },
};

export function getCopyPadrao(categoria?: string | null): CopyPadrao {
  const key = categoria as CategoriaId;
  return COPYS_PADRAO[key] ?? COPYS_PADRAO.outro;
}

export function preencherCopy(texto: string, valores: Record<string, string>): string {
  return Object.entries(valores).reduce(
    (acc, [chave, valor]) => acc.replaceAll(`{${chave}}`, valor),
    texto
  );
}
