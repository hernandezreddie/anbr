import { NextRequest, NextResponse } from "next/server"
import { createOAuthState, getAuthUrl } from "@/lib/google/oauth"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(req: NextRequest) {
  const { profissional_id } = await req.json()
  if (!profissional_id) return NextResponse.json({ error: "profissional_id é obrigatório" }, { status: 400 })

  const state = await createOAuthState(profissional_id)
  const url = getAuthUrl(state)
  return NextResponse.json({ url })
}

export async function GET(req: NextRequest) {
  const profissional_id = req.nextUrl.searchParams.get("profissional_id")
  if (!profissional_id) return NextResponse.json({ error: "profissional_id é obrigatório" }, { status: 400 })

  const supabase = createAdminClient()
  const { data: token } = await supabase
    .from("google_calendar_tokens")
    .select("calendar_email, expires_at")
    .eq("profissional_id", profissional_id)
    .single()

  const state = await createOAuthState(profissional_id)

  if (!token) {
    return NextResponse.json({ connected: false, authUrl: getAuthUrl(state) })
  }

  return NextResponse.json({
    connected: true,
    email: token.calendar_email,
    expires_at: token.expires_at,
    authUrl: getAuthUrl(state),
  })
}
