import { NextRequest, NextResponse } from "next/server"
import { disconnectCalendar } from "@/lib/google/oauth"
import { verificarAcessoProfissional } from "@/lib/auth-roles"

export async function POST(req: NextRequest) {
  const { profissional_id } = await req.json()
  if (!profissional_id) return NextResponse.json({ error: "profissional_id é obrigatório" }, { status: 400 })

  const acesso = await verificarAcessoProfissional(profissional_id)
  if (!acesso.permitido) {
    return NextResponse.json({ error: "Sem permissão para este profissional" }, { status: 403 })
  }

  try {
    await disconnectCalendar(profissional_id)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Erro ao desconectar Google Calendar" }, { status: 500 })
  }
}
