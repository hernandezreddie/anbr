function escaparXml(texto: string): string {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function iniciales(nome: string): string {
  const palavras = nome.trim().split(/\s+/).filter(Boolean);
  if (palavras.length === 0) return "A";
  if (palavras.length === 1) return palavras[0].charAt(0).toUpperCase();
  return (palavras[0].charAt(0) + palavras[1].charAt(0)).toUpperCase();
}

const PALETAS: Record<number, { de: string; para: string; anel: string }> = {
  1: { de: "#0f766e", para: "#14b8a6", anel: "#ccfbf1" },
  2: { de: "#6d28d9", para: "#8b5cf6", anel: "#ede9fe" },
};

export function gerarLogoSVG(nome: string, templateId: number): string {
  const paleta = PALETAS[templateId] ?? PALETAS[1];
  const iniciais = escaparXml(iniciales(nome));

  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${paleta.de}"/>
      <stop offset="100%" stop-color="${paleta.para}"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="96" fill="url(#g)"/>
  <circle cx="420" cy="90" r="150" fill="#ffffff" opacity="0.08"/>
  <circle cx="80" cy="430" r="180" fill="#ffffff" opacity="0.06"/>
  <circle cx="430" cy="420" r="70" fill="#ffffff" opacity="0.1"/>
  <text x="256" y="296" font-family="Georgia, 'Times New Roman', serif" font-size="190" font-weight="bold" fill="#ffffff" text-anchor="middle" opacity="0.98">${iniciais}</text>
  <rect x="176" y="380" width="160" height="6" rx="3" fill="#ffffff" opacity="0.45"/>
</svg>`;
}
