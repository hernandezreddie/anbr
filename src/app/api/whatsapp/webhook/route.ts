import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { processIncomingMessage, sendText } from "@/lib/whatsapp/evolution"

export async function POST(req: NextRequest) {
  const profissional_id = req.nextUrl.searchParams.get("profissional_id")
  if (!profissional_id) return NextResponse.json({ error: "profissional_id é obrigatório" }, { status: 400 })

  try {
    const body = await req.json()
    const data = body.data || body

    // Extract message data from Evolution API webhook format
    const key = data.key || {}
    const messageData = data.message || {}
    const pushName = data.pushName || data.sender?.pushName || "Cliente"

    const remoteJid = key.remoteJid || ""
    const fromMe = key.fromMe || false
    const messageId = key.id || ""
    const messageContent =
      messageData.conversation ||
      messageData.extendedTextMessage?.text ||
      messageData.imageMessage?.caption ||
      ""

    // Ignore messages sent by us
    if (fromMe || !messageContent) {
      return NextResponse.json({ ok: true })
    }

    // Extract customer name from phone number
    const customerName = pushName || remoteJid.split("@")[0] || "Cliente"

    const conversationId = await processIncomingMessage(
      profissional_id,
      remoteJid,
      messageContent,
      messageId,
      customerName
    )

    // Check if agent should auto-reply
    const supabase = createAdminClient()
    const { data: config } = await supabase
      .from("agent_configs")
      .select("enabled, connectors")
      .eq("profissional_id", profissional_id)
      .single()

    if (config?.enabled && config.connectors?.whatsapp) {
      // Call AI agent asynchronously
      try {
        const { chatComAgente } = await import("@/lib/ai/agent")

        const result = await chatComAgente(profissional_id, messageContent, [])

        if (result.resposta) {
          // Save assistant message
          await supabase.from("agent_messages").insert({
            conversation_id: conversationId,
            profissional_id,
            role: "assistant",
            content: result.resposta,
            tokens_input: result.tokens?.input || 0,
            tokens_output: result.tokens?.output || 0,
            model: result.model,
          })

          // Send reply via WhatsApp
          try {
            await sendText(profissional_id, remoteJid, result.resposta)
          } catch {}
        }
      } catch {}
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  return NextResponse.json({ ok: true, message: "WhatsApp webhook endpoint" })
}
