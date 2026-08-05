import crypto from "crypto";

const API = "https://api.mercadopago.com";

export interface ConfigGateway {
  ativo: boolean;
  access_token: string;
  webhook_secret: string;
  webhook_url: string;
}

export function getConfigGateway(): ConfigGateway {
  const access_token = process.env.MERCADOPAGO_ACCESS_TOKEN || "";
  const webhook_secret = process.env.MERCADOPAGO_WEBHOOK_SECRET || "";
  return {
    ativo: !!access_token,
    access_token,
    webhook_secret,
    webhook_url: `${process.env.NEXT_PUBLIC_DOMAIN || ""}/api/webhooks/mercadopago`,
  };
}

export interface PixCobranca {
  payment_id: string;
  qr_code_base64: string;
  copia_e_cola: string;
  expires_at: string;
  status: string;
}

/**
 * Cria um PIX dinâmico na Mercado Pago (QR + copia e cola, com expiração).
 */
export async function criarPixCobranca(params: {
  valor: number;
  descricao: string;
  external_reference: string;
  payer_email: string;
  expires_minutes?: number;
}): Promise<PixCobranca> {
  const cfg = getConfigGateway();
  if (!cfg.ativo) throw new Error("Mercado Pago não configurado (MERCADOPAGO_ACCESS_TOKEN ausente)");

  const expires_minutes = params.expires_minutes || 30;
  const date_of_expiration = new Date(Date.now() + expires_minutes * 60 * 1000).toISOString();

  const res = await fetch(`${API}/v1/payments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${cfg.access_token}`,
      "X-Idempotency-Key": params.external_reference,
    },
    body: JSON.stringify({
      transaction_amount: params.valor,
      description: params.descricao,
      payment_method_id: "pix",
      payer: { email: params.payer_email },
      external_reference: params.external_reference,
      date_of_expiration,
      notification_url: cfg.webhook_url,
    }),
  });

  const data = await res.json();
  if (!res.ok || !data.id) {
    throw new Error(
      `Erro ao criar cobrança PIX: ${data.message || data.error || res.status}`
    );
  }

  const point = data.point_of_interaction?.transaction_data;
  return {
    payment_id: String(data.id),
    qr_code_base64: point?.qr_code_base64 || "",
    copia_e_cola: point?.qr_code || "",
    expires_at: date_of_expiration,
    status: data.status || "pending",
  };
}

/**
 * Consulta o estado de um pagamento na Mercado Pago.
 */
export async function consultarPagamento(payment_id: string): Promise<{
  status: string;
  status_detail: string;
}> {
  const cfg = getConfigGateway();
  if (!cfg.ativo) throw new Error("Mercado Pago não configurado");

  const res = await fetch(`${API}/v1/payments/${payment_id}`, {
    headers: { "Authorization": `Bearer ${cfg.access_token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Erro ao consultar pagamento: ${data.message || res.status}`);
  return { status: data.status || "unknown", status_detail: data.status_detail || "" };
}

/**
 * Valida a assinatura do webhook da Mercado Pago.
 * Formato do header x-signature: ts=<timestamp>,v1=<hash>
 * hash = HMAC-SHA256(webhook_secret, "id:<notification_id>;request-id:<request_id>;time-stamp:<ts>;")
 */
export function validarFirmaWebhook(req: Request, rawBody: string): boolean {
  const cfg = getConfigGateway();
  if (!cfg.webhook_secret) {
    console.warn(
      "[mercadopago] MERCADOPAGO_WEBHOOK_SECRET ausente — webhook rejeitado. Configure o secret no dashboard da MP (Webhooks → secret) e na env var."
    );
    return false;
  }

  const signature = req.headers.get("x-signature") || "";
  const url = new URL(req.url);
  const data_id = url.searchParams.get("data.id") || "";

  const tsMatch = signature.match(/ts=(\d+)/);
  const v1Match = signature.match(/v1=([0-9a-fA-F]+)/);
  if (!tsMatch || !v1Match) return false;

  const ts = tsMatch[1];
  const v1 = v1Match[1].toLowerCase();
  const manifest = `id:${data_id};request-id:${req.headers.get("x-request-id") || ""};time-stamp:${ts};`;

  const hmac = crypto.createHmac("sha256", cfg.webhook_secret).update(manifest).digest("hex");
  const hashBytes = Buffer.from(hmac, "hex");
  const receivedBytes = Buffer.from(v1, "hex");
  if (hashBytes.length !== receivedBytes.length) return false;
  return crypto.timingSafeEqual(hashBytes, receivedBytes);
}
