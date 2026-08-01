const FALLBACK = "#059669";

export function parseHex(cor: string): { r: number; g: number; b: number } {
  let c = (cor || "").trim().replace(/^#/, "");
  if (/^[0-9a-f]{3}$/i.test(c)) c = c.split("").map((x) => x + x).join("");
  if (!/^[0-9a-f]{6}$/i.test(c)) c = FALLBACK.replace(/^#/, "");
  return {
    r: parseInt(c.slice(0, 2), 16),
    g: parseInt(c.slice(2, 4), 16),
    b: parseInt(c.slice(4, 6), 16),
  };
}

function canal(v: number): number {
  const s = v / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

/** Luminância relativa WCAG (0 = preto, 1 = branco) */
export function luminancia(cor: string): number {
  const { r, g, b } = parseHex(cor);
  return 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b);
}

export function ehClara(cor: string): boolean {
  return luminancia(cor) > 0.45;
}

/** Texto legível sobre um fundo sólido da cor dada (#ffffff ou #0f0f0f) */
export function contrastante(cor: string): string {
  return luminancia(cor) > 0.45 ? "#0f0f0f" : "#ffffff";
}

function paraHex(n: number): string {
  return Math.round(Math.min(255, Math.max(0, n))).toString(16).padStart(2, "0");
}

/** Escurece a cor pelo fator (0..1) mantendo o matiz */
export function escurecer(cor: string, fator: number): string {
  const { r, g, b } = parseHex(cor);
  const f = 1 - Math.min(1, Math.max(0, fator));
  return `#${paraHex(r * f)}${paraHex(g * f)}${paraHex(b * f)}`;
}

/**
 * Cor de acento legível sobre superfícies claras (cards brancos, fundo do template).
 * Se a cor escolhida for clara, escurece para manter contraste.
 */
export function accento(cor: string): string {
  const c = cor || FALLBACK;
  return ehClara(c) ? escurecer(c, 0.55) : c;
}
