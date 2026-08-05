import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import {
  MetaWebhookPayload,
  resolveProfissionalByPhoneNumberId,
  verifyWebhookToken,
  sendText,
  normalizePhone,
} from "@/lib/whatsapp/meta"
import { processIncomingMessage } from "@/lib/whatsapp/evolution"
import { validarAssinaturaMeta } from "@/lib/webhook-firma"

// GET: verificación del webhook por Meta (hub.challenge)
export async function GET(req: NextRequest) {
  const challenge = verifyWebhookToken(req.nextUrl.searchParams)
  if (challenge === null) {
    return NextResponse.json({ error: "Token de verificação inválido" }, { status: 403 })
  }
  return new NextResponse(challenge, { status: 200 })
}

// POST: eventos entrantes (messages, statuses)
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()
    const appSecret = process.env.META_APP_SECRET;
    if (!appSecret) {
      return NextResponse.json({ error: "META_APP_SECRET não configurado" }, { status: 500 });
    }
    const valido = validarAssinaturaMeta(req, rawBody, appSecret)
    if (valido === false) {
      return NextResponse.json({ error: "Assinatura inválida" }, { status: 401 })
    }

    let parsed: unknown
    try {
      parsed = JSON.parse(rawBody)
    } catch {
      return NextResponse.json({ error: "JSON inválido" }, { status: 400 })
    }
    const payload = parsed as MetaWebhookPayload

    if (payload.object !== "whatsapp_business_account" || !payload.entry) {
      return NextResponse.json({ ok: true })
    }

    for (const entry of payload.entry) {
      for (const change of entry.changes || []) {
        const value = change.value
        if (!value) continue

        const phoneNumberId = value.metadata?.phone_number_id
        if (!phoneNumberId) continue

        const instance = await resolveProfissionalByPhoneNumberId(phoneNumberId)
        if (!instance) continue
        const profissional_id = instance.profissional_id

        // Acknowledge status updates (delivered/read) — Meta reenvía si no respondemos 200
        if (value.statuses && value.statuses.length > 0) {
          continue
        }

        for (const msg of value.messages || []) {
          if (msg.type !== "text" || !msg.text?.body) continue

          const from = normalizePhone(msg.from || "")
          const customerName = value.contacts?.[0]?.profile?.name || from || "Cliente"

          const conversationId = await processIncomingMessage(
            profissional_id,
            from,
            msg.text.body,
            msg.id || "",
            customerName
          )

          // Verificar se o agente deve responder automaticamente
          const supabase = createAdminClient()
          const { data: config } = await supabase
            .from("agent_configs")
            .select("enabled, connectors")
            .eq("profissional_id", profissional_id)
            .single()

          if (config?.enabled && config.connectors?.whatsapp) {
            try {
              const { chatComAgente } = await import("@/lib/ai/agent")
              const result = await chatComAgente(profissional_id, msg.text.body, [])

              if (result.resposta) {
                await supabase.from("agent_messages").insert({
                  conversation_id: conversationId,
                  profissional_id,
                  role: "assistant",
                  content: result.resposta,
                  tokens_input: result.tokens?.input || 0,
                  tokens_output: result.tokens?.output || 0,
                  model: result.model,
                })

                try {
                  await sendText(instance, from, result.resposta)
                } catch {}
              }
            } catch {}
          }
        }
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}