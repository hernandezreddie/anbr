import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { getAuthUrl, createMetaOAuthState } from "@/lib/meta/graph"
import { exigirPlano, PLANOS_COM_META } from "@/lib/planos"
import { verificarAcessoProfissional } from "@/lib/auth-roles"

export async function POST(req: NextRequest) {
  const { profissional_id } = await req.json()
  if (!profissional_id) return NextResponse.json({ error: "profissional_id é obrigatório" }, { status: 400 })

  const acesso = await verificarAcessoProfissional(profissional_id)
  if (!acesso.permitido) return NextResponse.json({ error: "Sem permissão para este profissional" }, { status: 403 })

  const bloqueio = await exigirPlano(profissional_id, PLANOS_COM_META, "Instagram/Facebook DM")
  if (bloqueio) return NextResponse.json({ error: bloqueio.error }, { status: bloqueio.status })

  const state = await createMetaOAuthState(profissional_id)
  return NextResponse.json({ url: getAuthUrl(state) })
}

export async function GET(req: NextRequest) {
  const profissional_id = req.nextUrl.searchParams.get("profissional_id")
  if (!profissional_id) return NextResponse.json({ error: "profissional_id é obrigatório" }, { status: 400 })

  const supabase = createAdminClient()
  const { data } = await supabase
    .from("meta_connections")
    .select("page_id, page_name, instagram_id, instagram_name, expires_at")
    .eq("profissional_id", profissional_id)
    .single()

  const state = await createMetaOAuthState(profissional_id)

  if (!data) return NextResponse.json({ connected: false, authUrl: getAuthUrl(state) })

  return NextResponse.json({
    connected: true,
    ...data,
    authUrl: getAuthUrl(state),
  })
}
