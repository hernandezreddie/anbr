import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { createInstance, deleteInstance, getConnectionState, setWebhook } from "@/lib/whatsapp/evolution"
import { verificarAcessoProfissional } from "@/lib/auth-roles"

async function checarAcesso(profissional_id: string): Promise<NextResponse | null> {
  const acesso = await verificarAcessoProfissional(profissional_id)
  if (!acesso.permitido) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }
  return null
}

export async function GET(req: NextRequest) {
  const profissional_id = req.nextUrl.searchParams.get("profissional_id")
  if (!profissional_id) return NextResponse.json({ error: "profissional_id é obrigatório" }, { status: 400 })

  const negado = await checarAcesso(profissional_id)
  if (negado) return negado

  const supabase = createAdminClient()
  const { data } = await supabase
    .from("whatsapp_instances")
    .select("id, instance_name, connection_status, phone_number, evolution_api_url, created_at")
    .eq("profissional_id", profissional_id)
    .single()

  if (!data) return NextResponse.json({ configured: false })

  let qrCode = ""
  try {
    const state = await getConnectionState(profissional_id)
    qrCode = state.qrCode || ""
  } catch {}

  return NextResponse.json({ configured: true, ...data, qrCode })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { profissional_id, instance_name, evolution_api_url, evolution_api_key } = body

  if (!profissional_id || !instance_name || !evolution_api_url || !evolution_api_key) {
    return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 })
  }

  const negado = await checarAcesso(profissional_id)
  if (negado) return negado

  try {
    const webhookSecret = await createInstance(profissional_id, instance_name, evolution_api_url, evolution_api_key)

    // Set webhook
    const webhookUrl = `${process.env.NEXT_PUBLIC_DOMAIN}/api/whatsapp/webhook?profissional_id=${profissional_id}`
    try {
      await setWebhook(profissional_id, webhookUrl, webhookSecret)
    } catch {}

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const body = await req.json()
  const { profissional_id } = body

  if (!profissional_id) return NextResponse.json({ error: "profissional_id é obrigatório" }, { status: 400 })

  const negado = await checarAcesso(profissional_id)
  if (negado) return negado

  try {
    await deleteInstance(profissional_id)
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
