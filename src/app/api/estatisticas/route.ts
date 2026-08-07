import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = createAdminClient();

    const [{ count: profissionais }, { count: agendamentos }] = await Promise.all([
      supabase
        .from("profissionais")
        .select("id", { count: "exact", head: true })
        .eq("status", "ativo"),
      supabase
        .from("agendamentos")
        .select("id", { count: "exact", head: true })
        .eq("status", "concluido"),
    ]);

    return NextResponse.json({
      profissionais: profissionais ?? 0,
      agendamentos: agendamentos ?? 0,
    });
  } catch {
    return NextResponse.json(
      { erro: "indisponivel" },
      { status: 503 }
    );
  }
}
