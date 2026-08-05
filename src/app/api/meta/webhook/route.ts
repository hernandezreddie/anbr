import { NextRequest, NextResponse } from "next/server"
import { handleWebhookEvent, getWebhookVerifyToken } from "@/lib/meta/graph"
import { validarAssinaturaMeta } from "@/lib/webhook-firma"

// Meta webhook verification (GET)
export async function GET(req: NextRequest) {
  const mode = req.nextUrl.searchParams.get("hub.mode")
  const token = req.nextUrl.searchParams.get("hub.verify_token")
  const challenge = req.nextUrl.searchParams.get("hub.challenge")

  const expected = getWebhookVerifyToken()
  if (mode === "subscribe" && token && expected && token === expected && challenge) {
    return new NextResponse(challenge, { status: 200 })
  }

  return NextResponse.json({ error: "Verificação falhou" }, { status: 403 })
}

// Meta webhook events (POST) — única callback URL para N tenants
export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const valido = validarAssinaturaMeta(req, rawBody, process.env.META_APP_SECRET)
  if (valido === false) {
    return NextResponse.json({ error: "Assinatura inválida" }, { status: 401 })
  }

  let body: unknown
  try {
    body = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 })
  }

  // Meta sends a challenge on first POST too, but usually it's GET
  // Handle the actual event (tenant é resolvido internamente)
  try {
    await handleWebhookEvent(body)
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
