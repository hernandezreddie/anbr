import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { isAdminPlataforma } from "@/lib/auth-roles"

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  if (!id) {
    return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 })
  }

  if (!(await isAdminPlataforma())) {
    return NextResponse.json({ error: "Acesso restrito ao admin" }, { status: 403 })
  }

  try {
    const adminDb = createAdminClient()
    await adminDb.from("knowledge_docs").delete().eq("id", id)
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: "Erro ao excluir documento" }, { status: 500 })
  }
}
