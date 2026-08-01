import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminPlataforma } from "@/lib/auth-roles";
import { PLANOS } from "@/lib/planos";

export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (!(await isAdminPlataforma())) {
    return NextResponse.json({ error: "Acesso restrito ao admin" }, { status: 403 });
  }

  const { id, plano, expira_em, estender_dias } = await req.json();
  if (!id) return NextResponse.json({ error: "id é obrigatório" }, { status: 400 });

  if (plano !== undefined && !["gratis", "profissional", "ia_premium"].includes(plano)) {
    return NextResponse.json({ error: "Plano inválido" }, { status: 400 });
  }

  const adminDb = createAdminClient();

  const { data: prof } = await adminDb.from("profissionais").select("plano, plano_expira_em").eq("id", id).single();
  if (!prof) return NextResponse.json({ error: "Tenant não encontrado" }, { status: 404 });

  const updates: Record<string, string | null> = {};

  if (plano !== undefined) updates.plano = plano;

  if (estender_dias && typeof estender_dias === "number" && estender_dias > 0) {
    const base = prof.plano_expira_em ? new Date(prof.plano_expira_em) : new Date();
    if (!prof.plano_expira_em || base.getTime() < Date.now()) {
      updates.plano_expira_em = new Date(Date.now() + estender_dias * 86400000).toISOString();
    } else {
      updates.plano_expira_em = new Date(base.getTime() + estender_dias * 86400000).toISOString();
    }
  }

  if (expira_em !== undefined) {
    if (expira_em === null || expira_em === "") {
      updates.plano_expira_em = null;
    } else {
      updates.plano_expira_em = new Date(expira_em).toISOString();
    }
  }

  const { error } = await adminDb.from("profissionais").update(updates).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    success: true,
    plano: updates.plano ?? prof.plano,
    expira_em: updates.plano_expira_em ?? prof.plano_expira_em,
    nome: PLANOS[(updates.plano ?? prof.plano) as keyof typeof PLANOS]?.nome,
  });
}
