import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { enviarLembretesPendentes } from "@/lib/notificacoes";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const slug = request.nextUrl.searchParams.get("slug");
    if (!slug) {
      return NextResponse.json({ error: "slug obrigatório" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: prof } = await supabase
      .from("profissionais")
      .select("id")
      .eq("slug", slug)
      .single();

    if (!prof) {
      return NextResponse.json({ error: "Profissional não encontrado" }, { status: 404 });
    }

    const adminDb = createAdminClient();
    const { data: agent } = await adminDb
      .from("agent_configs")
      .select("enabled")
      .eq("profissional_id", prof.id)
      .single();
    if (agent?.enabled) {
      return NextResponse.json({ enviados: 0, total: 0, motivo: "agente ativo" });
    }

    const resultado = await enviarLembretesPendentes(prof.id);
    return NextResponse.json(resultado);
  } catch (err) {
    console.error("Erro ao enviar lembretes:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
