import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminPlataforma } from "@/lib/auth-roles";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  if (!(await isAdminPlataforma())) {
    return NextResponse.json({ error: "Acesso restrito ao admin" }, { status: 403 });
  }

  const adminDb = createAdminClient();
  const { data, error } = await adminDb
    .from("pagamentos_pix")
    .select("id, profissional_id, plano, frequencia, valor, status, criado_em, pago_em, profissionais(nome, slug, email, plano)")
    .order("criado_em", { ascending: false })
    .limit(100);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}
