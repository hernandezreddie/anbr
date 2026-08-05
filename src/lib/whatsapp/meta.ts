import { createAdminClient } from "@/lib/supabase/admin"

const GRAPH_VERSION = "v22.0"
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_VERSION}`

export interface MetaWhatsAppInstance {
  id?: string
  profissional_id: string
  provider: string
  phone_number_id: string
  waba_id: string
  meta_access_token: string
  meta_phone_number: string
  connection_status: string
  instance_name?: string
}

export function normalizePhone(raw: string): string {
  return raw.replace(/\D/g, "")
}

export async function getInstance(profissional_id: string): Promise<MetaWhatsAppInstance> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("whatsapp_instances")
    .select("*")
    .eq("profissional_id", profissional_id)
    .single()

  if (error || !data) throw new Error("WhatsApp não configurado")
  return data as MetaWhatsAppInstance
}

export async function getAccessToken(instance: MetaWhatsAppInstance): Promise<string> {
  return instance.meta_access_token || process.env.WHATSAPP_ACCESS_TOKEN || ""
}

export async function saveInstance(
  profissional_id: string,
  data: Partial<MetaWhatsAppInstance>
) {
  const supabase = createAdminClient()
  const { error } = await supabase.from("whatsapp_instances").upsert(
    { profissional_id, ...data },
    { onConflict: "profissional_id" }
  )
  if (error) throw error
}

export async function sendText(
  instance: MetaWhatsAppInstance,
  to: string,
  text: string
) {
  const token = await getAccessToken(instance)
  if (!token) throw new Error("Token de acesso do WhatsApp Cloud API não configurado")

  const res = await fetch(`${GRAPH_BASE}/${instance.phone_number_id}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: normalizePhone(to),
      type: "text",
      text: { body: text, preview_url: false },
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Erro ao enviar via WhatsApp Cloud: ${err}`)
  }
  return res.json()
}

export type TemplateName =
  | "confirmacao_agendamento"
  | "lembrete_agendamento"
  | "convite_avaliacao"

/**
 * Envia mensagem business-initiated via template aprovado na WhatsApp Cloud API.
 * Os parâmetros preenchem os placeholders {{1}}, {{2}}... do corpo do template.
 * Templates aprovados: confirmacao_agendamento, lembrete_agendamento, convite_avaliacao.
 */
export async function sendTemplate(
  instance: MetaWhatsAppInstance,
  to: string,
  templateName: TemplateName,
  parameters: Array<string | { type: "text" | "url"; text: string }>,
  language = "pt_BR"
) {
  const token = await getAccessToken(instance)
  if (!token) throw new Error("Token de acesso do WhatsApp Cloud API não configurado")

  const body: any = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: normalizePhone(to),
    type: "template",
    template: {
      name: templateName,
      language: { code: language },
    },
  }

  if (parameters.length) {
    body.template.components = [
      {
        type: "body",
        parameters: parameters.map((p) =>
          typeof p === "string" ? { type: "text", text: p } : p
        ),
      },
    ]
  }

  const res = await fetch(`${GRAPH_BASE}/${instance.phone_number_id}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Erro ao enviar template "${templateName}" via WhatsApp Cloud: ${err}`)
  }
  return res.json()
}

export async function testConnection(instance: MetaWhatsAppInstance): Promise<{ ok: boolean; error?: string; info?: any }> {
  const token = await getAccessToken(instance)
  if (!token) return { ok: false, error: "Token de acesso ausente" }
  if (!instance.phone_number_id) return { ok: false, error: "Phone Number ID ausente" }

  try {
    const res = await fetch(`${GRAPH_BASE}/${instance.phone_number_id}`, {
      headers: { "Authorization": `Bearer ${token}` },
    })
    if (!res.ok) {
      const err = await res.text()
      return { ok: false, error: `Credenciais inválidas: ${err}` }
    }
    const data = await res.json()
    return { ok: true, info: data }
  } catch (err: any) {
    return { ok: false, error: err.message }
  }
}

export function verifyWebhookToken(query: URLSearchParams): string | null {
  const mode = query.get("hub.mode")
  const token = query.get("hub.verify_token")
  const challenge = query.get("hub.challenge")

  const expected =
    process.env.META_WEBHOOK_VERIFY_TOKEN ||
    process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN
  if (mode === "subscribe" && token && expected && token === expected) {
    return challenge
  }
  return null
}

export interface MetaWebhookPayload {
  object?: string
  entry?: Array<{
    id?: string
    changes?: Array<{
      field?: string
      value?: {
        messaging_product?: string
        metadata?: { display_phone_number?: string; phone_number_id?: string }
        contacts?: Array<{ wa_id?: string; profile?: { name?: string } }>
        messages?: Array<{
          from?: string
          id?: string
          timestamp?: string
          type?: string
          text?: { body?: string }
        }>
        statuses?: Array<{ id?: string; status?: string }>
      }
    }>
  }>
}

export async function resolveProfissionalByPhoneNumberId(
  phoneNumberId: string
): Promise<MetaWhatsAppInstance | null> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("whatsapp_instances")
    .select("*")
    .eq("phone_number_id", phoneNumberId)
    .single()

  if (error || !data) return null
  return data as MetaWhatsAppInstance
}