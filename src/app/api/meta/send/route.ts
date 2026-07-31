import { NextRequest, NextResponse } from "next/server"
import { sendMessage } from "@/lib/meta/graph"

export async function POST(req: NextRequest) {
  const { profissional_id, recipient_id, text, platform } = await req.json()

  if (!profissional_id || !recipient_id || !text) {
    return NextResponse.json({ error: "profissional_id, recipient_id e text são obrigatórios" }, { status: 400 })
  }

  try {
    const result = await sendMessage(profissional_id, recipient_id, text, platform || "messenger")
    return NextResponse.json(result)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
