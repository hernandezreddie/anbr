import { NextRequest, NextResponse } from "next/server"
import { handleWebhookEvent } from "@/lib/meta/graph"

// Meta webhook verification (GET)
export async function GET(req: NextRequest) {
  const mode = req.nextUrl.searchParams.get("hub.mode")
  const token = req.nextUrl.searchParams.get("hub.verify_token")
  const challenge = req.nextUrl.searchParams.get("hub.challenge")
  const profissional_id = req.nextUrl.searchParams.get("profissional_id")

  if (mode === "subscribe" && token === profissional_id && challenge) {
    return new NextResponse(challenge, { status: 200 })
  }

  return NextResponse.json({ error: "Verificação falhou" }, { status: 403 })
}

// Meta webhook events (POST)
export async function POST(req: NextRequest) {
  const profissional_id = req.nextUrl.searchParams.get("profissional_id")
  if (!profissional_id) return NextResponse.json({ error: "profissional_id é obrigatório" }, { status: 400 })

  const body = await req.json()

  // Meta sends a challenge on first POST too, but usually it's GET
  // Handle the actual event
  try {
    await handleWebhookEvent(profissional_id, body)
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
