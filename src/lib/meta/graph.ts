import { createAdminClient } from "@/lib/supabase/admin"

const FB_API = "https://graph.facebook.com/v22.0"

interface MetaConnection {
  id: string
  profissional_id: string
  page_id: string
  page_name: string
  page_access_token: string
  instagram_id: string
  instagram_name: string
}

async function getConnection(profissional_id: string): Promise<MetaConnection> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("meta_connections")
    .select("*")
    .eq("profissional_id", profissional_id)
    .single()

  if (error || !data) throw new Error("Meta não configurado")
  return data
}

function getRedirectUri() {
  return process.env.META_REDIRECT_URI || `${process.env.NEXT_PUBLIC_DOMAIN}/api/meta/callback`
}

export async function createMetaOAuthState(profissional_id: string): Promise<string> {
  const { randomBytes } = await import("crypto")
  const state = randomBytes(32).toString("hex")
  const { createAdminClient } = await import("@/lib/supabase/admin")
  const supabase = createAdminClient()
  await supabase.from("oauth_states").insert({
    state,
    profissional_id,
    provider: "meta",
    expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
  })
  return state
}

export async function validateMetaOAuthState(state: string): Promise<string> {
  const { createAdminClient } = await import("@/lib/supabase/admin")
  const supabase = createAdminClient()
  const { data } = await supabase
    .from("oauth_states")
    .select("profissional_id")
    .eq("state", state)
    .eq("used", false)
    .gte("expires_at", new Date().toISOString())
    .single()
  if (!data) throw new Error("State inválido ou expirado")
  await supabase.from("oauth_states").update({ used: true }).eq("state", state)
  return data.profissional_id
}

export function getAuthUrl(state: string): string {
  const clientId = process.env.META_APP_ID!
  const redirectUri = getRedirectUri()

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    state,
    response_type: "code",
    scope: "pages_messaging,pages_manage_metadata,pages_show_list,instagram_basic,instagram_manage_messages",
  })

  return `https://www.facebook.com/v22.0/dialog/oauth?${params}`
}

export async function handleCallback(code: string, profissional_id: string) {
  const clientId = process.env.META_APP_ID!
  const clientSecret = process.env.META_APP_SECRET!
  const redirectUri = getRedirectUri()

  // Exchange code for short-lived token
  const tokenRes = await fetch(
    `${FB_API}/oauth/access_token?client_id=${clientId}&redirect_uri=${redirectUri}&client_secret=${clientSecret}&code=${code}`
  )
  const tokenData = await tokenRes.json()
  const shortToken = tokenData.access_token
  if (!shortToken) throw new Error("Falha ao obter token")

  // Exchange for long-lived token
  const longRes = await fetch(
    `${FB_API}/oauth/access_token?grant_type=fb_exchange_token&client_id=${clientId}&client_secret=${clientSecret}&fb_exchange_token=${shortToken}`
  )
  const longData = await longRes.json()
  const pageToken = longData.access_token

  // Get user's pages
  const pagesRes = await fetch(`${FB_API}/me/accounts?access_token=${pageToken}`)
  const pagesData = await pagesRes.json()
  const page = pagesData.data?.[0]

  if (!page) throw new Error("Nenhuma página encontrada")

  // Get Instagram account if exists
  const igRes = await fetch(`${FB_API}/${page.id}?fields=instagram_business_account&access_token=${page.access_token}`)
  const igData = await igRes.json()

  const supabase = createAdminClient()
  const { error } = await supabase.from("meta_connections").upsert(
    {
      profissional_id,
      page_id: page.id,
      page_name: page.name,
      page_access_token: page.access_token,
      instagram_id: igData.instagram_business_account?.id || "",
      instagram_name: igData.instagram_business_account?.name || "",
      expires_at: new Date(Date.now() + 60 * 24 * 3600 * 1000).toISOString(), // ~60 days
    },
    { onConflict: "profissional_id" }
  )

  if (error) throw error
}

export async function sendMessage(
  profissional_id: string,
  recipientId: string,
  text: string,
  platform: "messenger" | "instagram" = "messenger"
) {
  const conn = await getConnection(profissional_id)
  const id = platform === "instagram" ? conn.instagram_id : conn.page_id

  const res = await fetch(`${FB_API}/me/messages?access_token=${conn.page_access_token}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      recipient: { id: recipientId },
      messaging_type: "RESPONSE",
      message: { text },
    }),
  })

  return res.json()
}

export async function handleWebhookEvent(
  profissional_id: string,
  event: any
) {
  const supabase = createAdminClient()
  const entry = event.entry?.[0]
  const messaging = entry?.messaging?.[0] || entry?.changes?.[0]?.value?.messaging?.[0]

  if (!messaging) return

  const senderId = messaging.sender?.id
  const recipientId = messaging.recipient?.id
  const message = messaging.message
  const text = message?.text || ""
  const messageId = message?.mid || ""
  const timestamp = messaging.timestamp || Math.floor(Date.now() / 1000)

  if (!text || !senderId) return

  // Determine platform
  const platform = entry?.changes?.[0]?.field === "instagram" ? "instagram" : "messenger"

  // Save message
  await supabase.from("meta_messages").insert({
    profissional_id,
    platform,
    sender_id: senderId,
    recipient_id: recipientId,
    message_id: messageId,
    content: text,
    type: "text",
    timestamp,
  })

  // Get or create conversation
  let { data: conv } = await supabase
    .from("agent_conversations")
    .select("id")
    .eq("profissional_id", profissional_id)
    .eq("channel", platform)
    .eq("customer_id", senderId)
    .eq("status", "active")
    .single()

  if (!conv) {
    const { data: newConv } = await supabase
      .from("agent_conversations")
      .insert({
        profissional_id,
        channel: platform,
        customer_name: senderId,
        customer_id: senderId,
      })
      .select("id")
      .single()
    conv = newConv!
  }

  // Save as agent message
  await supabase.from("agent_messages").insert({
    conversation_id: conv.id,
    profissional_id,
    role: "user",
    content: text,
  })

  // Check if agent should reply
  const { data: config } = await supabase
    .from("agent_configs")
    .select("enabled, connectors")
    .eq("profissional_id", profissional_id)
    .single()

  if (config?.enabled && config.connectors?.[platform]) {
    try {
      const { checarCotaAgente } = await import("@/lib/planos")
      const semCota = await checarCotaAgente(profissional_id, supabase)
      if (semCota) return

      const { chatComAgente } = await import("@/lib/ai/agent")
      const result = await chatComAgente(profissional_id, text, [])

      if (result.resposta) {
        await supabase.from("agent_messages").insert({
          conversation_id: conv.id,
          profissional_id,
          role: "assistant",
          content: result.resposta,
          tokens_input: result.tokens?.input || 0,
          tokens_output: result.tokens?.output || 0,
          model: result.model,
        })

        await sendMessage(profissional_id, senderId, result.resposta, platform as any)
      }
    } catch {}
  }
}

export async function disconnect(profissional_id: string) {
  const supabase = createAdminClient()
  await supabase.from("meta_connections").delete().eq("profissional_id", profissional_id)
  await supabase.from("meta_messages").delete().eq("profissional_id", profissional_id)
}
