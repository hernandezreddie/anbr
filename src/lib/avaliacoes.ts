function urlAbsoluta(v: string | null | undefined): string | null {
  if (!v?.trim()) return null;
  const u = v.trim();
  return /^https?:\/\//i.test(u) ? u : `https://${u}`;
}

/**
 * Link para onde o cliente avalia:
 * 1. link_avaliacao (override manual do profissional, ex.: link direto de resenha Google)
 * 2. google_maps (perfil do Google Maps)
 * 3. página interna de avaliação com token
 */
export function linkAvaliacao(opts: {
  slug: string;
  link_avaliacao?: string | null;
  google_maps?: string | null;
  token?: string | null;
}): string {
  const manual = urlAbsoluta(opts.link_avaliacao);
  if (manual) return manual;
  const gmaps = urlAbsoluta(opts.google_maps);
  if (gmaps) return gmaps;
  const base = (process.env.NEXT_PUBLIC_DOMAIN || "").replace(/\/+$/, "");
  return `${base}/${opts.slug}/avaliar?t=${opts.token || ""}`;
}

export function textoConviteAvaliacao(opts: {
  nome: string;
  slug: string;
  link_avaliacao?: string | null;
  google_maps?: string | null;
  token?: string | null;
}): string {
  const primeiroNome = opts.nome.trim().split(" ")[0] || "você";
  const link = linkAvaliacao(opts);
  if (link.includes("/avaliar?t=")) {
    return `Oi ${primeiroNome}! Tudo certo por aí? 😊 Se puder, conta como foi o serviço — leva menos de 1 minuto:\n${link}`;
  }
  return `Oi ${primeiroNome}! Tudo certo por aí? 😊 Se gostou do serviço, ficaríamos muito felizes com sua avaliação:\n${link}`;
}
