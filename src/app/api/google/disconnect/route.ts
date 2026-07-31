import { NextRequest, NextResponse } from "next/server"
import { disconnectCalendar } from "@/lib/google/oauth"

export async function POST(req: NextRequest) {
  const { profissional_id } = await req.json()
  if (!profissional_id) return NextResponse.json({ error: "profissional_id é obrigatório" }, { status: 400 })

  try {
    await disconnectCalendar(profissional_id)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Erro ao desconectar Google Calendar" }, { status: 500 })
  }
}
