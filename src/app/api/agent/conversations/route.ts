import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verificarAcessoProfissional, isAdminPlataforma } from "@/lib/auth-roles";

export async function POST(req: NextRequest) {
  if (!(await isAdminPlataforma())) {
    return NextResponse.json({ error: "Acesso restrito ao admin" }, { status: 403 });
  }

  const adminDb = createAdminClient();
  const body = await req.json();

  const { data, error } = await adminDb
    .from("agent_conversations")
    .insert({
      profissional_id: body.profissional_id,
      channel: body.channel || "web_test",
      customer_name: body.customer_name || null,
      message_count: 0,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const profissionalId = req.nextUrl.searchParams.get("profissional_id");
  if (!profissionalId) return NextResponse.json({ error: "profissional_id é obrigatório" }, { status: 400 });

  const acesso = await verificarAcessoProfissional(profissionalId);
  if (!acesso.permitido) {
    return NextResponse.json({ error: "Sem permissão para este profissional" }, { status: 403 });
  }

  const adminDb = createAdminClient();
  const { data: conversations } = await adminDb
    .from("agent_conversations")
    .select("*")
    .eq("profissional_id", profissionalId)
    .order("updated_at", { ascending: false })
    .limit(50);

  return NextResponse.json({ conversations: conversations || [] });
}
