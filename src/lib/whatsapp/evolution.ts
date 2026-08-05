import { createAdminClient } from "@/lib/supabase/admin"
import * as metaCloud from "@/lib/whatsapp/meta"

interface EvolutionInstance {
  id: string
  profissional_id: string
  instance_name: string
  instance_token: string
  evolution_api_url: string
  evolution_api_key: string
  connection_status: string
  provider?: string
}

async function getInstance(profissional_id: string): Promise<EvolutionInstance> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("whatsapp_instances")
    .select("*")
    .eq("profissional_id", profissional_id)
    .single()

  if (error || !data) throw new Error("WhatsApp não configurado")
  return data
}

export async function getProvider(profissional_id: string): Promise<string | null> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("whatsapp_instances")
    .select("provider")
    .eq("profissional_id", profissional_id)
    .single()
  if (error || !data) return null
  return data.provider || "evolution"
}

function apiCall(instance: EvolutionInstance, method: string, path: string, body?: any) {
  return fetch(`${instance.evolution_api_url}/${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "apiKey": instance.evolution_api_key,
    },
    body: body ? JSON.stringify(body) : undefined,
  })
}

export async function sendText(
  profissional_id: string,
  to: string,
  text: string
) {
  let instance: EvolutionInstance
  try {
    instance = await getInstance(profissional_id)
  } catch (err) {
    // Sem instância Evolution: tenta fallback para Meta Cloud, se houver.
    const meta = await tryFallbackMetaCloud(profissional_id, to, text)
    if (meta) return meta
    throw err
  }

  if (instance.provider === "meta_cloud") {
    return metaCloud.sendText(instance as any, to, text)
  }

  try {
    const res = await apiCall(instance, "POST", `message/sendText/${instance.instance_name}`, {
      number: to,
      options: { delay: 1000 },
      textMessage: { text },
    })
    if (!res.ok) {
      const errText = await res.text()
      throw new Error(`Evolution retornou ${res.status}: ${errText}`)
    }
    return res.json()
  } catch (err) {
    console.warn(`[evolution] falha no envio via Evolution, tentando fallback Meta Cloud: ${String(err)}`)
    const meta = await tryFallbackMetaCloud(profissional_id, to, text)
    if (meta) return meta
    throw err
  }
}

async function tryFallbackMetaCloud(
  profissional_id: string,
  to: string,
  text: string
): Promise<any | null> {
  try {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from("whatsapp_instances")
      .select("*")
      .eq("profissional_id", profissional_id)
      .eq("provider", "meta_cloud")
      .single()
    if (!data) return null
    return await metaCloud.sendText(data as any, to, text)
  } catch {
    return null
  }
}

export async function setWebhook(
  profissional_id: string,
  webhookUrl: string,
  secret?: string
) {
  const instance = await getInstance(profissional_id)
  const res = await apiCall(instance, "POST", `webhook/set/${instance.instance_name}`, {
    webhook: {
      url: webhookUrl,
      enabled: true,
      events: ["MESSAGES_UPSERT", "CONNECTION_UPDATE", "QRCODE_UPDATED"],
      headers: secret ? { "x-webhook-secret": secret } : {},
    },
  })
  return res.json()
}

export async function getConnectionState(
  profissional_id: string
): Promise<{ status: string; qrCode?: string }> {
  const instance = await getInstance(profissional_id)
  const res = await apiCall(instance, "GET", `instance/connectionState/${instance.instance_name}`)
  const data = await res.json()
  return {
    status: data.instance?.state || "disconnected",
    qrCode: data.instance?.qrcode?.code,
  }
}

export async function createInstance(
  profissional_id: string,
  instanceName: string,
  evolutionApiUrl: string,
  evolutionApiKey: string
) {
  const supabase = createAdminClient()

  // Create instance on Evolution API
  const res = await fetch(`${evolutionApiUrl}/instance/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apiKey": evolutionApiKey,
    },
    body: JSON.stringify({
      instanceName,
      token: instanceName,
      qrcode: true,
      number: "",
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Erro ao criar instância: ${err}`)
  }

  // Save to database
  const webhookSecret = crypto.randomUUID()
  const { error } = await supabase.from("whatsapp_instances").upsert(
    {
      profissional_id,
      instance_name: instanceName,
      instance_token: instanceName,
      evolution_api_url: evolutionApiUrl,
      evolution_api_key: evolutionApiKey,
      connection_status: "creating",
      webhook_secret: webhookSecret,
    },
    { onConflict: "profissional_id" }
  )

  if (error) throw error
  return webhookSecret
}

export async function deleteInstance(profissional_id: string) {
  const instance = await getInstance(profissional_id)

  // Delete from Evolution API only if it was created there
  if (instance.provider !== "meta_cloud") {
    try {
      await apiCall(instance, "DELETE", `instance/delete/${instance.instance_name}`)
    } catch {}
  }

  // Delete from database
  const supabase = createAdminClient()
  await supabase.from("whatsapp_instances").delete().eq("profissional_id", profissional_id)
}

export async function getOrCreateConversation(
  profissional_id: string,
  remoteJid: string,
  customerName: string
): Promise<string> {
  const supabase = createAdminClient()

  const jid = normalizeJid(remoteJid)

  // Check existing conversation
  const { data: existing } = await supabase
    .from("agent_conversations")
    .select("id")
    .eq("profissional_id", profissional_id)
    .eq("channel", "whatsapp")
    .eq("customer_id", jid)
    .eq("status", "active")
    .single()

  if (existing) return existing.id

  // Create new one
  const { data: conv } = await supabase
    .from("agent_conversations")
    .insert({
      profissional_id,
      channel: "whatsapp",
      customer_name: customerName,
      customer_phone: jid,
      customer_id: jid,
    })
    .select("id")
    .single()

  return conv?.id || ""
}

export async function processIncomingMessage(
  profissional_id: string,
  remoteJid: string,
  messageContent: string,
  messageId: string,
  customerName: string
) {
  const supabase = createAdminClient()

  // Normalize jid: "5511999999999@s.whatsapp.net" -> "5511999999999"
  const rawJid = remoteJid.split("@")[0].replace(/\D/g, "")
  const conversationId = await getOrCreateConversation(profissional_id, rawJid, customerName)

  // Save incoming message
  await supabase.from("whatsapp_messages").insert({
    profissional_id,
    conversation_id: conversationId,
    remote_jid: rawJid,
    message_id: messageId,
    from_me: false,
    type: "text",
    content: messageContent,
    timestamp: Math.floor(Date.now() / 1000),
  })

  // Save as agent_conversation message
  await supabase.from("agent_messages").insert({
    conversation_id: conversationId,
    profissional_id,
    role: "user",
    content: messageContent,
  })

  // Update conversation
  await supabase.rpc("increment").then(async (inc) => {
    const { data: conv } = await supabase
      .from("agent_conversations")
      .select("message_count")
      .eq("id", conversationId)
      .single()
    await supabase
      .from("agent_conversations")
      .update({ message_count: (conv?.message_count || 0) + 1, updated_at: new Date().toISOString() })
      .eq("id", conversationId)
  })

  return conversationId
}

export function normalizeJid(remoteJid: string): string {
  return remoteJid.split("@")[0].replace(/\D/g, "")
}
