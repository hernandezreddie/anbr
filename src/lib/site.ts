// Dominio público de la plataforma — configurable por env.
// P0-2 (marca vs dominio): cuando se decida el dominio final (ej. an.br),
// basta con definir NEXT_PUBLIC_SITE_DOMAIN en el build.
export const SITE_DOMAIN =
  process.env.NEXT_PUBLIC_SITE_DOMAIN || "autonexabrasil.com.br";

export const SITE_URL = `https://${SITE_DOMAIN}`;
