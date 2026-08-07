import type { AIMessage } from "./types";

const META_HEADLINE_MAX = 40;
const META_PRIMARY_TEXT_MAX = 125;
const GOOGLE_HEADLINE_MAX = 30;
const GOOGLE_DESC_MAX = 90;

export type CampanhaBrief = {
  servicoPrincipal: string;
  preco: string;
  duracao: string;
  categoria: string;
  cidade: string;
  publicoAlvo: string;
  diferencial: string;
  objetivo: "agendamentos" | "seguidores" | "promocao" | "recuperacao";
};

export type CopysAnuncio = {
  objetivo: string;
  headlines: string[];
  primaryText: string;
  cta: string;
  segmentacao: {
    idade: string;
    interesses: string[];
    raioKm: number;
    genero: string;
  };
  orcamento: {
    diario: string;
    totalEstimado: string;
    cpcMedio: string;
  };
  dicas: string[];
};

type GeneratedResult = {
  copys: CopysAnuncio;
};

export function gerarBriefBasico(
  servicoPrincipal: string,
  preco: string,
  duracao: string,
  categoria: string,
  cidade: string,
  diferencial: string,
  objetivo: CampanhaBrief["objetivo"]
): CampanhaBrief {
  return {
    servicoPrincipal,
    preco,
    duracao,
    categoria,
    cidade,
    publicoAlvo: `Pessoas interessadas em ${categoria} em ${cidade}`,
    diferencial: diferencial || "Atendimento profissional e agendamento online",
    objetivo,
  };
}

export function gerarCopysAnuncio(brief: CampanhaBrief): CopysAnuncio {
  const { servicoPrincipal, preco, categoria, cidade, objetivo, diferencial } = brief;

  const templates: Record<CampanhaBrief["objetivo"], { headlines: string[]; primaryText: string; cta: string }> = {
    agendamentos: {
      headlines: [
        `${servicoPrincipal} em ${cidade}? Agende online`,
        `Agende seu ${servicoPrincipal} em 1 clique`,
        `${servicoPrincipal} a partir de ${preco} — horários livres`,
        `Chega de WhatsApp: agende ${servicoPrincipal} online`,
        `${servicoPrincipal} profissional. Agendamento 24h.`,
      ],
      primaryText: `${diferencial}. Agende agora seu ${servicoPrincipal} em ${cidade}. Horários disponíveis hoje e amanhã. Confirmação e lembrete no WhatsApp.`,
      cta: "Agendar agora",
    },
    seguidores: {
      headlines: [
        `Siga a gente: ${categoria} em ${cidade}`,
        `${servicoPrincipal}? Conheça nosso trabalho`,
        `Dicas de ${categoria} toda semana`,
        `Transforme seu visual com ${servicoPrincipal}`,
        `O melhor ${servicoPrincipal} de ${cidade}`,
      ],
      primaryText: `Siga nosso perfil e veja dicas, resultados e promoções exclusivas de ${categoria} em ${cidade}. ${diferencial}.`,
      cta: "Seguir agora",
    },
    promocao: {
      headlines: [
        `Promoção: ${servicoPrincipal} com desconto`,
        `Só essa semana: ${servicoPrincipal} ${preco}`,
        `${servicoPrincipal} — preço especial para novos clientes`,
        `Aproveite: ${servicoPrincipal} em ${cidade}`,
        `Oferta relâmpago: ${servicoPrincipal}`,
      ],
      primaryText: `Promoção por tempo limitado! ${servicoPrincipal} com condições especiais em ${cidade}. ${diferencial}. Garanta seu horário antes que acabe.`,
      cta: "Aproveitar oferta",
    },
    recuperacao: {
      headlines: [
        `Já faz um tempinho... que tal voltar?`,
        `Saudade de você! ${servicoPrincipal} te espera`,
        `Volte com condição especial — ${servicoPrincipal}`,
        `Seu ${servicoPrincipal} favorito te espera`,
        `Faz tempo que não nos vemos 🌟`,
      ],
      primaryText: `Já faz um tempo desde sua última visita! Que tal agendar seu ${servicoPrincipal} em ${cidade}? ${diferencial}. Preparamos um horário especial para você.`,
      cta: "Agendar retorno",
    },
  };

  const base = templates[objetivo];

  const segmentacaoPorCategoria: Record<string, { interesses: string[]; idade: string; genero: string }> = {
    "Beleza e Estética": { interesses: ["Beleza", "Cabelo", "Moda", "Bem-estar"], idade: "18-55", genero: "feminino" },
    "Saúde e Bem-estar": { interesses: ["Saúde", "Fitness", "Bem-estar", "Yoga"], idade: "25-60", genero: "todos" },
    "Personal & Esportes": { interesses: ["Academia", "Fitness", "Esportes", "Saúde"], idade: "20-50", genero: "todos" },
    "Automotivo": { interesses: ["Carros", "Automóveis", "Motos"], idade: "25-65", genero: "masculino" },
    "Pet Shop & Veterinária": { interesses: ["Animais de estimação", "Cães", "Gatos", "Pet care"], idade: "25-55", genero: "todos" },
    "Gastronomia": { interesses: ["Gastronomia", "Comida", "Restaurantes", "Eventos"], idade: "25-60", genero: "todos" },
    "Fotografia e Eventos": { interesses: ["Fotografia", "Eventos", "Família", "Casamento"], idade: "22-55", genero: "todos" },
    "Consultoria e Aulas": { interesses: ["Educação", "Carreira", "Negócios", "Mentoria"], idade: "25-55", genero: "todos" },
  };

  const segPadrao = { interesses: ["Serviços", "Profissionais", "Compras online"], idade: "25-55", genero: "todos" };
  const seg = segmentacaoPorCategoria[categoria] || segPadrao;

  return {
    objetivo: base.cta,
    headlines: base.headlines.slice(0, 5),
    primaryText: base.primaryText,
    cta: base.cta,
    segmentacao: {
      idade: seg.idade,
      interesses: seg.interesses,
      raioKm: 15,
      genero: seg.genero,
    },
    orcamento: {
      diario: "R$ 15 a R$ 30",
      totalEstimado: "R$ 450 a R$ 900 (30 dias)",
      cpcMedio: "R$ 0,50 a R$ 1,50 (estimativa Brasil)",
    },
    dicas: [
      "Use imagem de alta qualidade: foto do resultado do serviço (antes/depois funciona bem)",
      "Publique o anúncio entre terça e quinta-feira, das 10h às 14h",
      "Comece com R$ 15/dia e aumente aos poucos conforme os resultados",
      "Responda comentários e mensagens rapidamente — o engajamento melhora o alcance",
      "Teste 2-3 headlines diferentes e mantenha a que tiver mais cliques",
    ],
  };
}

export type RecursosPlano = {
  plano: string;
  agendamentoOnline: boolean;
  agenteWhatsApp: boolean;
  dominioProprio: boolean;
  limiteMensalGratis: number | null;
};

export function gerarCopysParaAI(
  brief: CampanhaBrief,
  recursosPlano?: RecursosPlano,
  conversaAnterior: AIMessage[] = []
): AIMessage[] {
  const recursos = recursosPlano
    ? `
Recursos que o profissional TEM no plano "${recursosPlano.plano}":
${recursosPlano.agenteWhatsApp ? "- Atendimento automático via WhatsApp (AI Agent) 24h" : "- SEM AI Agent: não prometa resposta automática 24h"}
- Agendamento online no site (todos os planos)
${recursosPlano.dominioProprio ? "- Domínio próprio" : "- Site em subdomínio gratuito"}
${recursosPlano.limiteMensalGratis ? `- ATENÇÃO: plano grátis limita a ${recursosPlano.limiteMensalGratis} agendamentos/mês — não prometa capacidade ilimitada` : "- Capacidade mensal sem limite de agendamentos"}
Os claims do anúncio DEVEM ser verdadeiros com base nos recursos acima.`
    : "";

  const systemPrompt: AIMessage = {
    role: "system",
    content: `Você é um especialista em anúncios para profissionais autônomos no Brasil. 
Gere copys de anúncios para Meta Ads (Facebook/Instagram) e Google Ads.

Contexto do profissional:
- Serviço principal: ${brief.servicoPrincipal}
- Preço: ${brief.preco}
- Duração: ${brief.duracao}
- Categoria: ${brief.categoria}
- Cidade: ${brief.cidade}
- Diferencial: ${brief.diferencial}
- Objetivo da campanha: ${brief.objetivo}
${recursos}

Regras:
- Headlines: máximo 40 caracteres (Meta) ou 30 (Google)
- Tom: profissional mas próximo, brasileiro, direto
- Foco em benefício e resultado, não em característica
- Inclua um CTA claro
- Faça claims apenas do que o plano do profissional permite (seção Recursos)

Responda APENAS com um JSON válido, sem texto extra, neste formato exato:
{"headlines": ["5 headlines entre 15 e 40 caracteres cada"], "primaryText": "texto principal de 1 a 3 frases com o CTA", "cta": "texto do botão", "segmentacao": {"idade": "ex: 25-55", "interesses": ["4 a 6 interesses do Meta Ads"], "raioKm": 15, "genero": "todos|feminino|masculino"}, "orcamento": {"diario": "ex: R$ 15 a R$ 30", "totalEstimado": "ex: R$ 450 a R$ 900 (30 dias)", "cpcMedio": "ex: R$ 0,50 a R$ 1,50 (estimativa Brasil)"}, "dicas": ["5 dicas práticas"]}`,
  };

  const userPrompt: AIMessage = {
    role: "user",
    content: `Gere o JSON com 5 headlines, 1 texto principal, 1 CTA, segmentação, orçamento e 5 dicas para um anúncio com objetivo "${brief.objetivo}" do serviço ${brief.servicoPrincipal}.`,
  };

  return [systemPrompt, userPrompt, ...conversaAnterior];
}

export function validarCopys(json: unknown): CopysAnuncio | null {
  const j = json as Record<string, any> | null;
  if (!j || typeof j !== "object") return null;
  const headlines = Array.isArray(j.headlines)
    ? j.headlines.filter((h: unknown): h is string => typeof h === "string" && h.length > 0).slice(0, 5)
    : null;
  const dicas = Array.isArray(j.dicas)
    ? j.dicas.filter((d: unknown): d is string => typeof d === "string" && d.length > 0).slice(0, 6)
    : null;
  const interesses = Array.isArray(j.segmentacao?.interesses)
    ? j.segmentacao.interesses.filter((i: unknown): i is string => typeof i === "string")
    : null;
  if (
    !headlines || headlines.length < 3 ||
    typeof j.primaryText !== "string" || !j.primaryText ||
    typeof j.cta !== "string" || !j.cta ||
    typeof j.segmentacao?.idade !== "string" || !interesses || interesses.length < 3 ||
    typeof j.segmentacao?.raioKm !== "number" ||
    typeof j.segmentacao?.genero !== "string" ||
    typeof j.orcamento?.diario !== "string" ||
    typeof j.orcamento?.totalEstimado !== "string" ||
    typeof j.orcamento?.cpcMedio !== "string" ||
    !dicas || dicas.length < 3
  ) {
    return null;
  }
  return {
    objetivo: j.cta,
    headlines,
    primaryText: j.primaryText,
    cta: j.cta,
    segmentacao: {
      idade: j.segmentacao.idade,
      interesses,
      raioKm: j.segmentacao.raioKm,
      genero: j.segmentacao.genero,
    },
    orcamento: {
      diario: j.orcamento.diario,
      totalEstimado: j.orcamento.totalEstimado,
      cpcMedio: j.orcamento.cpcMedio,
    },
    dicas,
  };
}
