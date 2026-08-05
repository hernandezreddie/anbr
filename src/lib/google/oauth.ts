import { google } from "googleapis"
import { createAdminClient } from "@/lib/supabase/admin"
import { randomBytes } from "crypto"

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID!
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!
const SCOPES = [
  "https://www.googleapis.com/auth/calendar",
  "openid",
  "https://www.googleapis.com/auth/userinfo.email",
]

function getRedirectUri() {
  return process.env.GOOGLE_REDIRECT_URI || `${process.env.NEXT_PUBLIC_DOMAIN}/api/google/callback`
}

export function getOAuth2Client() {
  return new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, getRedirectUri())
}

export async function createOAuthState(profissional_id: string): Promise<string> {
  const state = randomBytes(32).toString("hex")
  const supabase = createAdminClient()
  await supabase.from("oauth_states").insert({
    state,
    profissional_id,
    provider: "google",
    expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
  })
  return state
}

export async function validateOAuthState(state: string): Promise<string> {
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
  const oauth = getOAuth2Client()
  return oauth.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
    state,
  })
}

export async function handleCallback(code: string, profissional_id: string) {
  const oauth = getOAuth2Client()
  const { tokens } = await oauth.getToken(code)

  if (!tokens.access_token || !tokens.refresh_token) {
    throw new Error("Tokens inválidos")
  }

  // Resolve o email da conta conectada (id_token → userinfo como fallback)
  let calendarEmail: string | null = null
  try {
    if (tokens.id_token) {
      const payload = await oauth.verifyIdToken({ idToken: tokens.id_token })
      calendarEmail = payload.getPayload()?.email || null
    }
  } catch {
    // id_token ausente: tenta userinfo via access token
  }
  if (!calendarEmail) {
    try {
      const info = await oauth.getTokenInfo(tokens.access_token)
      calendarEmail = info.email || null
    } catch {
      // scopes antigos sem userinfo — email fica nulo
    }
  }

  const supabase = createAdminClient()

  const { error } = await supabase.from("google_calendar_tokens").upsert(
    {
      profissional_id,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      scope: tokens.scope || "",
      token_type: tokens.token_type || "Bearer",
      expires_at: new Date(
        Date.now() + (tokens.expiry_date || 3600 * 1000)
      ).toISOString(),
      calendar_id: "primary",
      calendar_email: calendarEmail,
    },
    { onConflict: "profissional_id" }
  )

  if (error) throw error
}

export async function disconnectCalendar(profissional_id: string) {
  const supabase = createAdminClient()
  await supabase.from("google_calendar_tokens").delete().eq("profissional_id", profissional_id)
  await supabase.from("google_calendar_events").delete().eq("profissional_id", profissional_id)
}
