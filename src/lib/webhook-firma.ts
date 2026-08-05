import crypto from "crypto";
import { NextRequest } from "next/server";

/**
 * Valida X-Hub-Signature-256 (HMAC SHA256) enviado por Meta.
 * Retorna true si la firma coincide; false si es inválida.
 * Si no hay app secret configurado, retorna null (skip, log en la ruta).
 */
export function validarAssinaturaMeta(
  req: NextRequest,
  rawBody: string,
  appSecret: string | undefined
): boolean | null {
  if (!appSecret) return null;

  const signature = req.headers.get("x-hub-signature-256") || "";
  const expected =
    "sha256=" + crypto.createHmac("sha256", appSecret).update(rawBody, "utf8").digest("hex");

  if (!signature || signature.length !== expected.length) return false;

  const a = Buffer.from(signature, "utf8");
  const b = Buffer.from(expected, "utf8");
  return crypto.timingSafeEqual(a, b);
}
