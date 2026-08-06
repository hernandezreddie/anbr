import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { verificarAcessoProfissional, isAdminPlataforma } from "@/lib/auth-roles";

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
  const { data: agentConfig } = await adminDb
    .from("agent_configs")
    .select("*")
    .eq("profissional_id", profissionalId)
    .single();

  const { data: docs } = await adminDb
    .from("knowledge_docs")
    .select("id, filename, type, chunk_count, token_count, created_at")
    .eq("profissional_id", profissionalId)
    .order("created_at", { ascending: false });

  if (!agentConfig) {
    return NextResponse.json({
      config: null,
      docs: docs || [],
      profissional_id: profissionalId,
    });
  }

  return NextResponse.json({
    config: agentConfig,
    docs: docs || [],
    profissional_id: profissionalId,
  });
}

export async function PUT(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const body = await req.json();
  const { profissional_id, ...configData } = body;

  if (!profissional_id) return NextResponse.json({ error: "profissional_id é obrigatório" }, { status: 400 });

  const acesso = await verificarAcessoProfissional(profissional_id);
  if (!acesso.permitido) {
    return NextResponse.json({ error: "Sem permissão para este profissional" }, { status: 403 });
  }

  const adminDb = createAdminClient();

  const { data: existing } = await adminDb
    .from("agent_configs")
    .select("id")
    .eq("profissional_id", profissional_id)
    .single();

  let result;
  if (existing) {
    result = await adminDb
      .from("agent_configs")
      .update({ ...configData, updated_at: new Date().toISOString() })
      .eq("profissional_id", profissional_id)
      .select()
      .single();
  } else {
    result = await adminDb
      .from("agent_configs")
      .insert({ profissional_id, ...configData })
      .select()
      .single();
  }

  if (result.error) {
    return NextResponse.json({ error: "Erro ao salvar configuração" }, { status: 500 });
  }

  return NextResponse.json({ config: result.data });
}
