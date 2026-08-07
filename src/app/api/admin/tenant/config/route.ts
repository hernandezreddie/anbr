import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminPlataforma } from "@/lib/auth-roles";
import { FUNDOS } from "@/lib/backgrounds";

export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (!(await isAdminPlataforma())) {
    return NextResponse.json({ error: "Acesso restrito ao admin" }, { status: 403 });
  }

  const { id, video_fundo, fundo_estilo, template_id } = await req.json();
  if (!id) return NextResponse.json({ error: "id é obrigatório" }, { status: 400 });

  const updates: Record<string, string | number> = {};
  if (template_id !== undefined) {
    const t = Number(template_id);
    if (t !== 1 && t !== 2) return NextResponse.json({ error: "Plantilla inválida" }, { status: 400 });
    updates.template_id = t;
  }
  if (fundo_estilo !== undefined) {
    if (!FUNDOS.some((f) => f.id === fundo_estilo)) {
      return NextResponse.json({ error: "Fundo inválido" }, { status: 400 });
    }
    updates.fundo_estilo = fundo_estilo;
  }
  if (video_fundo !== undefined) {
    updates.video_fundo = typeof video_fundo === "string" ? video_fundo : "";
  }

  const adminDb = createAdminClient();
  const { error } = await adminDb.from("configuracoes").update(updates).eq("profissional_id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
