import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPlanoAtivo, PLANOS } from "@/lib/planos";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("profissional_id")
    .eq("id", user.id)
    .single();
  if (!profile?.profissional_id) {
    return NextResponse.json({ error: "Perfil não encontrado" }, { status: 400 });
  }

  const { plano, nome, ativo, expira_em } = await getPlanoAtivo(profile.profissional_id);

  let dias_restantes: number | null = null;
  if (ativo && expira_em) {
    dias_restantes = Math.ceil((new Date(expira_em).getTime() - Date.now()) / 86400000);
  }

  return NextResponse.json({
    plano,
    nome,
    ativo,
    expira_em,
    dias_restantes,
    preco_profissional: PLANOS.profissional.precoMensal,
    preco_ia_premium: PLANOS.ia_premium.precoMensal,
  });
}
