import type { CategoriaId } from "@/lib/servicos-padrao";

export type NichePaleta = {
  /** Cor primária sugerida para a categoria */
  primary: string;
  /** Cor secundária / de contraste */
  secondary: string;
  /** Fundo da página */
  bg: string;
  /** Fundo de superfícies (cards) */
  paper: string;
  /** Texto principal */
  ink: string;
  /** Texto secundário */
  ink_soft: string;
  /** Cor de bordas / divisores */
  line: string;
  /** Par de cores para gradiente de destaque */
  gradient: [string, string];
};

export const NICHES_PALETA: Record<CategoriaId, NichePaleta> = {
  limpeza: {
    primary: "#0d9488",
    secondary: "#1c1917",
    bg: "#f5f9f8",
    paper: "#ffffff",
    ink: "#1c1917",
    ink_soft: "#5f6b68",
    line: "#e0ecea",
    gradient: ["#0d9488", "#14b8a6"],
  },
  beleza: {
    primary: "#db2777",
    secondary: "#4c0519",
    bg: "#fdf5f8",
    paper: "#ffffff",
    ink: "#2d1220",
    ink_soft: "#8a6b78",
    line: "#f6e1ea",
    gradient: ["#db2777", "#ec4899"],
  },
  unhas: {
    primary: "#c026d3",
    secondary: "#3b0764",
    bg: "#fbf5fd",
    paper: "#ffffff",
    ink: "#2c0f38",
    ink_soft: "#8a6a96",
    line: "#f4e2f8",
    gradient: ["#c026d3", "#e879f9"],
  },
  saude: {
    primary: "#2563eb",
    secondary: "#172554",
    bg: "#f3f7fe",
    paper: "#ffffff",
    ink: "#101c3d",
    ink_soft: "#5f6c8c",
    line: "#dde6f7",
    gradient: ["#2563eb", "#3b82f6"],
  },
  clinica: {
    primary: "#0891b2",
    secondary: "#083344",
    bg: "#f1f9fb",
    paper: "#ffffff",
    ink: "#0d2730",
    ink_soft: "#56747d",
    line: "#d8eef3",
    gradient: ["#0891b2", "#06b6d4"],
  },
  personal: {
    primary: "#ea580c",
    secondary: "#431407",
    bg: "#fef6f0",
    paper: "#ffffff",
    ink: "#2a160a",
    ink_soft: "#8a6a55",
    line: "#f6e3d6",
    gradient: ["#ea580c", "#f97316"],
  },
  automotivo: {
    primary: "#dc2626",
    secondary: "#1c1917",
    bg: "#fbf5f5",
    paper: "#ffffff",
    ink: "#241414",
    ink_soft: "#8a5f5f",
    line: "#f3e0e0",
    gradient: ["#dc2626", "#ef4444"],
  },
  veterinario: {
    primary: "#059669",
    secondary: "#022c22",
    bg: "#f2faf7",
    paper: "#ffffff",
    ink: "#0d2a20",
    ink_soft: "#54736a",
    line: "#dcefec",
    gradient: ["#059669", "#10b981"],
  },
  artes: {
    primary: "#7c3aed",
    secondary: "#1e1b4b",
    bg: "#f7f3fe",
    paper: "#ffffff",
    ink: "#1d1430",
    ink_soft: "#766c8c",
    line: "#e8e0f7",
    gradient: ["#7c3aed", "#a78bfa"],
  },
  gastronomia: {
    primary: "#d97706",
    secondary: "#451a03",
    bg: "#fdf7f0",
    paper: "#ffffff",
    ink: "#2a1a0d",
    ink_soft: "#8a6f55",
    line: "#f4e5d4",
    gradient: ["#d97706", "#f59e0b"],
  },
  fotografia: {
    primary: "#4f46e5",
    secondary: "#1e1b4b",
    bg: "#f5f5fe",
    paper: "#ffffff",
    ink: "#17122e",
    ink_soft: "#6a6690",
    line: "#e2e0f6",
    gradient: ["#4f46e5", "#818cf8"],
  },
  consultoria: {
    primary: "#0f766e",
    secondary: "#134e4a",
    bg: "#f1f8f7",
    paper: "#ffffff",
    ink: "#0f2a27",
    ink_soft: "#52716d",
    line: "#d9ecea",
    gradient: ["#0f766e", "#14b8a6"],
  },
  outro: {
    primary: "#14b8a6",
    secondary: "#1c1917",
    bg: "#faf8f5",
    paper: "#ffffff",
    ink: "#1c1917",
    ink_soft: "#6b6560",
    line: "#e5e2df",
    gradient: ["#14b8a6", "#2dd4bf"],
  },
};

export function getNichePaleta(categoria?: string | null): NichePaleta {
  const key = (categoria || "outro") as CategoriaId;
  return NICHES_PALETA[key] || NICHES_PALETA.outro;
}
