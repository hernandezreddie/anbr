import type { FundoEstilo } from "@/lib/backgrounds";
import type { CategoriaId } from "@/lib/servicos-padrao";

export type TemaPreset = {
  nome: string;
  descricao: string;
  template_id: 1 | 2;
  cor_primaria: string;
  cor_secundaria: string;
  fundo_estilo: FundoEstilo;
  fonte_titulo: string;
  fonte_corpo: string;
};

export const TEMAS_POR_NICHO: Record<CategoriaId, TemaPreset> = {
  limpeza: {
    nome: "Limpo & Confiável",
    descricao: "Azul de confiança com pontos sutis",
    template_id: 1,
    cor_primaria: "#0284c7",
    cor_secundaria: "#0c4a6e",
    fundo_estilo: "dots",
    fonte_titulo: "Fraunces",
    fonte_corpo: "Inter",
  },
  beleza: {
    nome: "Beleza Elegante",
    descricao: "Rosa sofisticado com efeito vidro",
    template_id: 1,
    cor_primaria: "#db2777",
    cor_secundaria: "#831843",
    fundo_estilo: "glass",
    fonte_titulo: "Fraunces",
    fonte_corpo: "Inter",
  },
  unhas: {
    nome: "Delicado Rosé",
    descricao: "Rose suave com gradiente leve",
    template_id: 1,
    cor_primaria: "#e11d48",
    cor_secundaria: "#881337",
    fundo_estilo: "mesh",
    fonte_titulo: "Fraunces",
    fonte_corpo: "Inter",
  },
  saude: {
    nome: "Bem-estar Calmo",
    descricao: "Verde sereno com ondas suaves",
    template_id: 1,
    cor_primaria: "#10b981",
    cor_secundaria: "#064e3b",
    fundo_estilo: "waves",
    fonte_titulo: "Fraunces",
    fonte_corpo: "Inter",
  },
  clinica: {
    nome: "Clínica Limpa",
    descricao: "Azul médico direto e sóbrio",
    template_id: 1,
    cor_primaria: "#2563eb",
    cor_secundaria: "#1e3a8a",
    fundo_estilo: "none",
    fonte_titulo: "Inter",
    fonte_corpo: "Inter",
  },
  personal: {
    nome: "Energia Total",
    descricao: "Laranja vibrante com textura",
    template_id: 2,
    cor_primaria: "#ea580c",
    cor_secundaria: "#431407",
    fundo_estilo: "noise",
    fonte_titulo: "Inter",
    fonte_corpo: "Inter",
  },
  automotivo: {
    nome: "Força Motor",
    descricao: "Vermelho forte com padrão geométrico",
    template_id: 2,
    cor_primaria: "#b91c1c",
    cor_secundaria: "#1f2937",
    fundo_estilo: "geometric",
    fonte_titulo: "Inter",
    fonte_corpo: "Inter",
  },
  veterinario: {
    nome: "Pet Amigo",
    descricao: "Verde-água acolhedor com pontinhos",
    template_id: 1,
    cor_primaria: "#0d9488",
    cor_secundaria: "#134e4a",
    fundo_estilo: "dots",
    fonte_titulo: "Fraunces",
    fonte_corpo: "Inter",
  },
  artes: {
    nome: "Criativo Vibrante",
    descricao: "Fúcsia ousado com aurora",
    template_id: 2,
    cor_primaria: "#d946ef",
    cor_secundaria: "#4a044e",
    fundo_estilo: "aurora",
    fonte_titulo: "Inter",
    fonte_corpo: "Inter",
  },
  gastronomia: {
    nome: "Sabor Quente",
    descricao: "Âmbar apetitoso com geométrico",
    template_id: 1,
    cor_primaria: "#d97706",
    cor_secundaria: "#451a03",
    fundo_estilo: "geometric",
    fonte_titulo: "Fraunces",
    fonte_corpo: "Inter",
  },
  fotografia: {
    nome: "Premium Escuro",
    descricao: "Preto elegante com textura fina",
    template_id: 2,
    cor_primaria: "#18181b",
    cor_secundaria: "#000000",
    fundo_estilo: "noise",
    fonte_titulo: "Inter",
    fonte_corpo: "Inter",
  },
  consultoria: {
    nome: "Profissional Moderno",
    descricao: "Índigo executivo com vidro",
    template_id: 2,
    cor_primaria: "#4338ca",
    cor_secundaria: "#312e81",
    fundo_estilo: "glass",
    fonte_titulo: "Inter",
    fonte_corpo: "Inter",
  },
  outro: {
    nome: "Clássico AN.BR",
    descricao: "Verde-marca com tipografia serifada",
    template_id: 1,
    cor_primaria: "#059669",
    cor_secundaria: "#1c1917",
    fundo_estilo: "none",
    fonte_titulo: "Fraunces",
    fonte_corpo: "Inter",
  },
};

export function getTemaPorNicho(categoria?: string | null): TemaPreset {
  const key = (categoria ?? "outro") as CategoriaId;
  return TEMAS_POR_NICHO[key] ?? TEMAS_POR_NICHO.outro;
}
