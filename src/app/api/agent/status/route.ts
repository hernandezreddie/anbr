import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verificarAcessoProfissional } from "@/lib/auth-roles";
import { diagnosticarAgente } from "@/lib/ai/diagnostico";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const profissionalId = req.nextUrl.searchParams.get("profissional_id");
  if (!profissionalId) {
    return NextResponse.json({ error: "profissional_id é obrigatório" }, { status: 400 });
  }

  const acesso = await verificarAcessoProfissional(profissionalId);
  if (!acesso.permitido) {
    return NextResponse.json({ error: "Sem permissão para este profissional" }, { status: 403 });
  }

  const testar = req.nextUrl.searchParams.get("teste") === "1";

  const diagnostico = await diagnosticarAgente(profissionalId, { testar });

  return NextResponse.json(diagnostico);
}
