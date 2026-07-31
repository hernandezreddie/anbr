import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminPlataforma } from "@/lib/auth-roles";

async function checkAdmin() {
  if (!(await isAdminPlataforma())) return false;
  return true;
}

export async function GET() {
  const adminSupabase = await checkAdmin();
  if (!adminSupabase) return NextResponse.json({ error: "Acesso restrito ao admin" }, { status: 403 });

  const adminDb = createAdminClient();
  const { data, error } = await adminDb
    .from("config_plataforma")
    .select("id, pix_chave, pix_nome, pix_cidade, whatsapp")
    .eq("id", 1)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  const adminSupabase = await checkAdmin();
  if (!adminSupabase) return NextResponse.json({ error: "Acesso restrito ao admin" }, { status: 403 });

  const body = await req.json();
  const updates: Record<string, string> = {};
  if (typeof body.pix_chave === "string") updates.pix_chave = body.pix_chave;
  if (typeof body.pix_nome === "string") updates.pix_nome = body.pix_nome;
  if (typeof body.pix_cidade === "string") updates.pix_cidade = body.pix_cidade;
  if (typeof body.whatsapp === "string") updates.whatsapp = body.whatsapp;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Nenhum campo para atualizar" }, { status: 400 });
  }

  const adminDb = createAdminClient();
  const { data, error } = await adminDb
    .from("config_plataforma")
    .update(updates)
    .eq("id", 1)
    .select("id, pix_chave, pix_nome, pix_cidade, whatsapp")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
