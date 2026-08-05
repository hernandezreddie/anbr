import { NextRequest, NextResponse } from "next/server"
import { sendText } from "@/lib/whatsapp/evolution"
import { verificarAcessoProfissional } from "@/lib/auth-roles"

export async function POST(req: NextRequest) {
  const { profissional_id, to, text } = await req.json()

  if (!profissional_id || !to || !text) {
    return NextResponse.json({ error: "profissional_id, to e text são obrigatórios" }, { status: 400 })
  }

  const acesso = await verificarAcessoProfissional(profissional_id)
  if (!acesso.permitido) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  try {
    const result = await sendText(profissional_id, to, text)
    return NextResponse.json(result)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
