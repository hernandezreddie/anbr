import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminPlataforma } from "@/lib/auth-roles";

export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (!(await isAdminPlataforma())) {
    return NextResponse.json({ error: "Acesso restrito ao admin" }, { status: 403 });
  }

  const { id, nome, email, whatsapp, cidade, status, pix_chave, pix_nome, pix_cidade, slogan, senha } = await req.json();
  if (!id) return NextResponse.json({ error: "id é obrigatório" }, { status: 400 });

  const adminDb = createAdminClient();

  if (senha !== undefined) {
    if (typeof senha !== "string" || senha.length < 6) {
      return NextResponse.json({ error: "A senha precisa ter no mínimo 6 caracteres" }, { status: 400 });
    }
    const { data: profile } = await adminDb.from("profiles").select("id").eq("profissional_id", id).maybeSingle();
    if (!profile?.id) {
      return NextResponse.json({ error: "Usuário de acesso não encontrado" }, { status: 400 });
    }
    const { error: authErr } = await adminDb.auth.admin.updateUserById(profile.id, { password: senha });
    if (authErr) {
      console.error("[admin/tenant] Error updating password:", authErr);
      return NextResponse.json({ error: "Falha ao atualizar senha" }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  }

  const updates: Record<string, string> = {};
  if (nome !== undefined) updates.nome = nome;
  if (whatsapp !== undefined) updates.whatsapp = whatsapp;
  if (cidade !== undefined) updates.cidade = cidade;
  if (status !== undefined) {
    if (!["ativo", "suspenso", "inativo"].includes(status)) {
      return NextResponse.json({ error: "Status inválido" }, { status: 400 });
    }
    updates.status = status;
  }
  if (pix_chave !== undefined) updates.pix_chave = pix_chave;
  if (pix_nome !== undefined) updates.pix_nome = pix_nome;
  if (pix_cidade !== undefined) updates.pix_cidade = pix_cidade;
  if (slogan !== undefined) updates.slogan = slogan;

  if (email !== undefined) {
    const { data: prof } = await adminDb.from("profissionais").select("email").eq("id", id).single();
    if (prof) {
      const { data: profile } = await adminDb.from("profiles").select("id").eq("profissional_id", id).maybeSingle();
      if (profile) {
        const { error: authErr } = await adminDb.auth.admin.updateUserById(profile.id, { email });
        if (authErr) {
          console.error("[admin/tenant] Error updating email:", authErr);
          return NextResponse.json({ error: "Falha ao atualizar e-mail" }, { status: 400 });
        }
      }
      updates.email = email;
    }
  }

  const { error } = await adminDb.from("profissionais").update(updates).eq("id", id);
  if (error) {
    console.error("[admin/tenant] Error updating profissional:", error);
    return NextResponse.json({ error: "Erro interno ao actualizar profissional" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (!(await isAdminPlataforma())) {
    return NextResponse.json({ error: "Acesso restrito ao admin" }, { status: 403 });
  }

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id é obrigatório" }, { status: 400 });

  const adminDb = createAdminClient();

  const { data: profile } = await adminDb.from("profiles").select("id").eq("profissional_id", id).maybeSingle();

  const { data: authUsers, error: authListErr } = await adminDb.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (authListErr) {
    console.error("[admin/tenant] Error listing users:", authListErr);
    return NextResponse.json({ error: "Erro interno ao listar usuários" }, { status: 500 });
  }

  const emails = new Set(
    (authUsers.users || []).map((u) => u.email?.toLowerCase()).filter(Boolean)
  );
  const { data: prof } = await adminDb.from("profissionais").select("email").eq("id", id).single();

  if (profile?.id) {
    await adminDb.auth.admin.deleteUser(profile.id);
  } else if (prof?.email && emails.has(prof.email.toLowerCase())) {
    const target = authUsers.users?.find((u) => u.email?.toLowerCase() === prof.email.toLowerCase());
    if (target) await adminDb.auth.admin.deleteUser(target.id);
  }

  const { error } = await adminDb.from("profissionais").delete().eq("id", id);
  if (error) {
    console.error("[admin/tenant] Error deleting profissional:", error);
    return NextResponse.json({ error: "Erro interno ao eliminar profissional" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
