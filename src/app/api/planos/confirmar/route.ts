import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminPlataforma } from "@/lib/auth-roles";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  if (!(await isAdminPlataforma())) {
    return NextResponse.json({ error: "Acesso restrito ao admin" }, { status: 403 });
  }

  const { pagamento_id } = await req.json();
  if (!pagamento_id) {
    return NextResponse.json({ error: "pagamento_id é obrigatório" }, { status: 400 });
  }

  const adminDb = createAdminClient();

  const { data: pagamento, error: pgError } = await adminDb
    .from("pagamentos_pix")
    .select("id, profissional_id, plano, frequencia, status")
    .eq("id", pagamento_id)
    .single();

  if (pgError || !pagamento) {
    return NextResponse.json({ error: "Pagamento não encontrado" }, { status: 404 });
  }
  if (pagamento.status !== "pendente") {
    return NextResponse.json({ error: "Pagamento já processado" }, { status: 400 });
  }

  const { data: prof } = await adminDb
    .from("profissionais")
    .select("plano, plano_expira_em")
    .eq("id", pagamento.profissional_id)
    .single();

  const meses = pagamento.frequencia === "anual" ? 12 : 1;

  const base = new Date();
  const expiraAtual = prof?.plano_expira_em ? new Date(prof.plano_expira_em) : null;
  const inicio = expiraAtual && expiraAtual.getTime() > Date.now() ? expiraAtual : base;
  const novaExpira = new Date(inicio);
  novaExpira.setMonth(novaExpira.getMonth() + meses);

  const { error: updError } = await adminDb
    .from("profissionais")
    .update({
      plano: pagamento.plano,
      plano_expira_em: novaExpira.toISOString(),
      ultimo_pagamento: new Date().toISOString(),
    })
    .eq("id", pagamento.profissional_id);

  if (updError) {
    return NextResponse.json({ error: updError.message }, { status: 500 });
  }

  await adminDb
    .from("pagamentos_pix")
    .update({ status: "pago", pago_em: new Date().toISOString() })
    .eq("id", pagamento.id);

  return NextResponse.json({ success: true, plano: pagamento.plano, expira_em: novaExpira.toISOString() });
}
