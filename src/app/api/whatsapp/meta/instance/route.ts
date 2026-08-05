import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { getInstance, saveInstance, testConnection } from "@/lib/whatsapp/meta"
import { verificarAcessoProfissional } from "@/lib/auth-roles"

async function checarAcesso(profissional_id: string): Promise<NextResponse | null> {
  const acesso = await verificarAcessoProfissional(profissional_id)
  if (!acesso.permitido) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }
  return null
}

// GET: status da conexão Cloud API
export async function GET(req: NextRequest) {
  const profissional_id = req.nextUrl.searchParams.get("profissional_id")
  if (!profissional_id) return NextResponse.json({ error: "profissional_id é obrigatório" }, { status: 400 })

  const negado = await checarAcesso(profissional_id)
  if (negado) return negado

  try {
    const instance = await getInstance(profissional_id)
    if (instance.provider !== "meta_cloud") {
      return NextResponse.json({ configured: false })
    }
    return NextResponse.json({
      configured: true,
      provider: "meta_cloud",
      phone_number_id: instance.phone_number_id,
      waba_id: instance.waba_id,
      meta_phone_number: instance.meta_phone_number,
      connection_status: instance.connection_status,
      webhook_url: `${process.env.NEXT_PUBLIC_DOMAIN}/api/whatsapp/meta/webhook`,
    })
  } catch {
    return NextResponse.json({ configured: false })
  }
}

// POST: salvar credenciais da Cloud API
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { profissional_id, phone_number_id, waba_id, meta_access_token, meta_phone_number } = body

  if (!profissional_id || !phone_number_id || !meta_access_token) {
    return NextResponse.json({ error: "profissional_id, phone_number_id e meta_access_token são obrigatórios" }, { status: 400 })
  }

  const negado = await checarAcesso(profissional_id)
  if (negado) return negado

  try {
    await saveInstance(profissional_id, {
      provider: "meta_cloud",
      phone_number_id,
      waba_id: waba_id || "",
      meta_access_token,
      meta_phone_number: meta_phone_number || "",
      connection_status: "testing",
    })

    const instance = await getInstance(profissional_id)
    const test = await testConnection(instance)
    if (!test.ok) {
      return NextResponse.json({ error: test.error || "Falha ao validar credenciais" }, { status: 400 })
    }

    await saveInstance(profissional_id, { connection_status: "connected" })
    return NextResponse.json({ success: true, ...test })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// DELETE: desconectar Cloud API
export async function DELETE(req: NextRequest) {
  const body = await req.json()
  const { profissional_id } = body
  if (!profissional_id) return NextResponse.json({ error: "profissional_id é obrigatório" }, { status: 400 })

  const negado = await checarAcesso(profissional_id)
  if (negado) return negado

  try {
    const supabase = createAdminClient()
    await supabase.from("whatsapp_instances").delete().eq("profissional_id", profissional_id)
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
