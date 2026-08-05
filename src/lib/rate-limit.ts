/**
 * Rate limit simples em memória (por instância do processo).
 * Suficiente para o MVP: bloqueia abusos básicos. Em serverless
 * multi-instância é best-effort — o limite real deve vir do edge.
 */

const hits = new Map<string, { count: number; resetAt: number }>();

export function rateLimitar(
  key: string,
  max: number,
  janelaMs: number
): { permitido: boolean; emBreve: number } {
  const agora = Date.now();
  const atual = hits.get(key);

  if (!atual || atual.resetAt <= agora) {
    hits.set(key, { count: 1, resetAt: agora + janelaMs });
    if (hits.size > 10_000) {
      const agoraMs = agora;
      for (const [k, v] of hits) {
        if (v.resetAt <= agoraMs) hits.delete(k);
      }
    }
    return { permitido: true, emBreve: 0 };
  }

  atual.count++;
  if (atual.count > max) {
    return { permitido: false, emBreve: Math.max(0, Math.ceil((atual.resetAt - agora) / 1000)) };
  }
  return { permitido: true, emBreve: 0 };
}

export function ipDoRequest(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for") || "";
  return fwd.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "desconhecido";
}
