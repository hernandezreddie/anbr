export type FundoEstilo =
  | "none"
  | "mesh"
  | "waves"
  | "dots"
  | "glass"
  | "aurora"
  | "geometric"
  | "noise";

export type FundoItem = {
  id: FundoEstilo;
  nome: string;
  descricao: string;
  /** Suggested cor_primaria for this fundo */
  primary: string;
  /** Suggested cor_secundaria for this fundo */
  secondary: string;
};

export const FUNDOS: FundoItem[] = [
  { id: "none", nome: "Sólido", descricao: "Fundo limpo com a cor principal", primary: "#059669", secondary: "#1c1917" },
  { id: "mesh", nome: "Mesh", descricao: "Gradiente fluido e moderno", primary: "#059669", secondary: "#1c1917" },
  { id: "aurora", nome: "Aurora", descricao: "Gradiente inspirado em aurora boreal", primary: "#7c3aed", secondary: "#1e1b4b" },
  { id: "waves", nome: "Ondas", descricao: "Padrão de ondas suaves", primary: "#0d9488", secondary: "#1c1917" },
  { id: "dots", nome: "Pontos", descricao: "Grade de pontos sutil", primary: "#0369a1", secondary: "#1c1917" },
  { id: "glass", nome: "Vidro", descricao: "Efeito vidro fosco moderno", primary: "#0891b2", secondary: "#1c1917" },
  { id: "geometric", nome: "Geométrico", descricao: "Padrão geométrico contemporâneo", primary: "#d97706", secondary: "#1c1917" },
  { id: "noise", nome: "Textura", descricao: "Textura de ruído sutil", primary: "#4f46e5", secondary: "#1c1917" },
];

export function fundoStyle(estilo: FundoEstilo, corPrimaria: string): React.CSSProperties {
  const c = corPrimaria || "#059669";

  const styles: Record<string, React.CSSProperties> = {
    none: { backgroundColor: "var(--color-bg)" },
    mesh: {
      background: `linear-gradient(to bottom right, var(--color-bg), ${c}08, ${c}15)`,
    },
    aurora: {
      background: `linear-gradient(to bottom right, var(--color-bg), ${c}18, ${c}08, var(--color-bg))`,
    },
    waves: {
      backgroundColor: "var(--color-bg)",
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='20' viewBox='0 0 100 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 10 Q 25 0 50 10 Q 75 20 100 10' stroke='${encodeURIComponent(c + "20")}' fill='none' stroke-width='2'/%3E%3C/svg%3E")`,
      backgroundRepeat: "repeat-x",
      backgroundPosition: "bottom",
    },
    dots: {
      backgroundColor: "var(--color-bg)",
      backgroundImage: `radial-gradient(${c}20 1px, transparent 1px)`,
      backgroundSize: "20px 20px",
    },
    glass: {
      backgroundColor: "rgba(255, 255, 255, 0.6)",
      backdropFilter: "blur(24px)",
    },
    geometric: {
      backgroundColor: "var(--color-bg)",
      backgroundImage: `linear-gradient(45deg, ${c}08 25%, transparent 25%), linear-gradient(-45deg, ${c}08 25%, transparent 25%), linear-gradient(45deg, transparent 75%, ${c}08 75%), linear-gradient(-45deg, transparent 75%, ${c}08 75%)`,
      backgroundSize: "40px 40px",
      backgroundPosition: "0 0, 0 20px, 20px -20px, -20px 0px",
    },
    noise: {
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
      backgroundRepeat: "repeat",
      backgroundSize: "256px 256px",
    },
  };

  return styles[estilo] || { backgroundColor: "var(--color-bg)" };
}

export function fundoHeaderStyle(estilo: FundoEstilo, corPrimaria: string): React.CSSProperties {
  const c = corPrimaria || "#059669";

  const styles: Record<string, React.CSSProperties> = {
    none: { backgroundColor: c },
    mesh: {
      background: `linear-gradient(to bottom right, ${c}, ${c}dd, ${c}88)`,
      backgroundSize: "200% 200%",
      animation: "gradientShift 8s ease infinite",
    },
    aurora: {
      background: `linear-gradient(to bottom right, ${c}, #a855f7cc, #f472b6cc, ${c})`,
      backgroundSize: "300% 300%",
      animation: "gradientShift 12s ease infinite",
    },
    waves: {
      backgroundColor: c,
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='20' viewBox='0 0 100 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 10 Q 25 0 50 10 Q 75 20 100 10' stroke='white' fill='none' stroke-width='2' opacity='0.15'/%3E%3C/svg%3E")`,
      backgroundRepeat: "repeat-x",
      backgroundPosition: "bottom",
    },
    dots: {
      backgroundColor: c,
      backgroundImage: `radial-gradient(rgba(255,255,255,0.15) 1px, transparent 1px)`,
      backgroundSize: "20px 20px",
    },
    glass: {
      backgroundColor: c,
      backdropFilter: "blur(24px)",
    },
    geometric: {
      backgroundColor: c,
      backgroundImage: `linear-gradient(45deg, rgba(255,255,255,0.08) 25%, transparent 25%), linear-gradient(-45deg, rgba(255,255,255,0.08) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(255,255,255,0.08) 75%), linear-gradient(-45deg, transparent 75%, rgba(255,255,255,0.08) 75%)`,
      backgroundSize: "40px 40px",
      backgroundPosition: "0 0, 0 20px, 20px -20px, -20px 0px",
    },
    noise: {
      backgroundColor: c,
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.06'/%3E%3C/svg%3E")`,
      backgroundRepeat: "repeat",
      backgroundSize: "256px 256px",
    },
  };

  return styles[estilo] || { backgroundColor: c };
}