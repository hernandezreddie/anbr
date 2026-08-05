import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { createCustomHostname, verifyHostname, deleteCustomHostname } from "@/lib/cloudflare/saas"
import { verificarAcessoProfissional } from "@/lib/auth-roles"
import { exigirPlano, PLANOS_COM_DOMINIO } from "@/lib/planos"

async function checarAcesso(profissional_id: string): Promise<NextResponse | null> {
  const acesso = await verificarAcessoProfissional(profissional_id)
  if (!acesso.permitido) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }
  const plano = await exigirPlano(profissional_id, PLANOS_COM_DOMINIO, "domínio próprio")
  if (plano) {
    return NextResponse.json({ error: plano.error }, { status: plano.status })
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
    .from("custom_domains")
    .select("*")
    .eq("profissional_id", profissional_id)
    .single()

  if (!data) return NextResponse.json({ configured: false })

  return NextResponse.json({ configured: true, ...data })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { profissional_id, domain } = body

  if (!profissional_id || !domain) {
    return NextResponse.json({ error: "profissional_id e domain são obrigatórios" }, { status: 400 })
  }

  const negado = await checarAcesso(profissional_id)
  if (negado) return negado

  const supabase = createAdminClient()

  try {
    // Create custom hostname on Cloudflare
    const cf = await createCustomHostname(domain)

    // Save to database
    const { error } = await supabase.from("custom_domains").upsert(
      {
        profissional_id,
        domain,
        cloudflare_hostname_id: cf.hostname_id,
        ssl_status: cf.ssl_status,
        ssl_validation_records: JSON.parse(JSON.stringify(cf.validation_records)),
        verified: false,
      },
      { onConflict: "profissional_id" }
    )

    if (error) throw error

    return NextResponse.json({
      success: true,
      domain,
      validation_records: cf.validation_records,
      ssl_status: cf.ssl_status,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const { profissional_id } = body

  if (!profissional_id) {
    return NextResponse.json({ error: "profissional_id é obrigatório" }, { status: 400 })
  }

  const negado = await checarAcesso(profissional_id)
  if (negado) return negado

  const supabase = createAdminClient()
  const { data: domain } = await supabase
    .from("custom_domains")
    .select("*")
    .eq("profissional_id", profissional_id)
    .single()

  if (!domain || !domain.cloudflare_hostname_id) {
    return NextResponse.json({ error: "Domínio não configurado" }, { status: 400 })
  }

  try {
    const status = await verifyHostname(domain.cloudflare_hostname_id)

    await supabase
      .from("custom_domains")
      .update({ ssl_status: status.ssl_status, verified: status.verified, updated_at: new Date().toISOString() })
      .eq("profissional_id", profissional_id)

    return NextResponse.json(status)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const body = await req.json()
  const { profissional_id } = body

  if (!profissional_id) {
    return NextResponse.json({ error: "profissional_id é obrigatório" }, { status: 400 })
  }

  const negado = await checarAcesso(profissional_id)
  if (negado) return negado

  const supabase = createAdminClient()
  const { data: domain } = await supabase
    .from("custom_domains")
    .select("cloudflare_hostname_id")
    .eq("profissional_id", profissional_id)
    .single()

  if (domain?.cloudflare_hostname_id) {
    try {
      await deleteCustomHostname(domain.cloudflare_hostname_id)
    } catch {}
  }

  await supabase.from("custom_domains").delete().eq("profissional_id", profissional_id)
  return NextResponse.json({ success: true })
}
