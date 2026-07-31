import { NextRequest, NextResponse } from "next/server"
import { sendMessage } from "@/lib/meta/graph"
import { exigirPlano, PLANOS_COM_META } from "@/lib/planos"
import { verificarAcessoProfissional } from "@/lib/auth-roles"

export async function POST(req: NextRequest) {
  const { profissional_id, recipient_id, text, platform } = await req.json()

  if (!profissional_id || !recipient_id || !text) {
    return NextResponse.json({ error: "profissional_id, recipient_id e text são obrigatórios" }, { status: 400 })
  }

  const acesso = await verificarAcessoProfissional(profissional_id)
  if (!acesso.permitido) return NextResponse.json({ error: "Sem permissão para este profissional" }, { status: 403 })

  const bloqueio = await exigirPlano(profissional_id, PLANOS_COM_META, "Instagram/Facebook DM")
  if (bloqueio) return NextResponse.json({ error: bloqueio.error }, { status: bloqueio.status })

  try {
    const result = await sendMessage(profissional_id, recipient_id, text, platform || "messenger")
    return NextResponse.json(result)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
