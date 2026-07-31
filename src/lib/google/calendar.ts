import { google } from "googleapis"
import { createAdminClient } from "@/lib/supabase/admin"

export async function getAuthClient(profissional_id: string) {
  const supabase = createAdminClient()
  const { data: token, error } = await supabase
    .from("google_calendar_tokens")
    .select("*")
    .eq("profissional_id", profissional_id)
    .single()

  if (error || !token) {
    throw new Error("Google Calendar não conectado")
  }

  const oauth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID!,
    process.env.GOOGLE_CLIENT_SECRET!,
    process.env.GOOGLE_REDIRECT_URI || `${process.env.NEXT_PUBLIC_DOMAIN}/api/google/callback`
  )

  oauth.setCredentials({
    access_token: token.access_token,
    refresh_token: token.refresh_token,
    expiry_date: new Date(token.expires_at).getTime(),
    token_type: token.token_type,
    scope: token.scope,
  })

  oauth.on("tokens", async (newTokens) => {
    const updates: Record<string, any> = {}
    if (newTokens.access_token) updates.access_token = newTokens.access_token
    if (newTokens.refresh_token) updates.refresh_token = newTokens.refresh_token
    if (newTokens.expiry_date) updates.expires_at = new Date(newTokens.expiry_date).toISOString()
    if (Object.keys(updates).length > 0) {
      updates.updated_at = new Date().toISOString()
      await supabase.from("google_calendar_tokens").update(updates).eq("profissional_id", profissional_id)
    }
  })

  return { auth: oauth, calendarId: token.calendar_id }
}

export async function checkFreeBusy(
  profissional_id: string,
  start: string,
  end: string
): Promise<{ busy: boolean; events: any[] }> {
  const { auth, calendarId } = await getAuthClient(profissional_id)
  const calendar = google.calendar({ version: "v3", auth })

  const res = await calendar.freebusy.query({
    requestBody: {
      timeMin: start,
      timeMax: end,
      items: [{ id: calendarId }],
    },
  })

  const busy = res.data.calendars?.[calendarId]?.busy || []
  return { busy: busy.length > 0, events: busy }
}

export async function createCalendarEvent(
  profissional_id: string,
  params: {
    summary: string
    description: string
    start: { dateTime: string; timeZone: string }
    end: { dateTime: string; timeZone: string }
    location?: string
    agendamento_id?: string
  }
) {
  const { auth, calendarId } = await getAuthClient(profissional_id)
  const calendar = google.calendar({ version: "v3", auth })

  const res = await calendar.events.insert({
    calendarId,
    requestBody: {
      summary: params.summary,
      description: params.description,
      start: params.start,
      end: params.end,
      location: params.location,
    },
  })

  const eventId = res.data.id
  if (eventId && params.agendamento_id) {
    const supabase = createAdminClient()
    await supabase.from("google_calendar_events").insert({
      profissional_id,
      agendamento_id: params.agendamento_id,
      google_event_id: eventId,
      calendar_id: calendarId,
      event_data: res.data,
    })
  }

  return res.data
}

export async function deleteCalendarEvent(profissional_id: string, googleEventId: string) {
  const { auth, calendarId } = await getAuthClient(profissional_id)
  const calendar = google.calendar({ version: "v3", auth })

  await calendar.events.delete({
    calendarId,
    eventId: googleEventId,
  })

  const supabase = createAdminClient()
  await supabase.from("google_calendar_events").delete().eq("google_event_id", googleEventId)
}

export async function isConnected(profissional_id: string): Promise<boolean> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from("google_calendar_tokens")
    .select("profissional_id")
    .eq("profissional_id", profissional_id)
    .single()
  return !!data
}

export async function getCalendarStatus(profissional_id: string) {
  const supabase = createAdminClient()
  const { data: token } = await supabase
    .from("google_calendar_tokens")
    .select("calendar_email, expires_at, updated_at")
    .eq("profissional_id", profissional_id)
    .single()

  if (!token) return { connected: false }

  return {
    connected: true,
    email: token.calendar_email,
    expires_at: token.expires_at,
    updated_at: token.updated_at,
  }
}
