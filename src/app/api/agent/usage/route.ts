import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verificarAcessoProfissional } from "@/lib/auth-roles";

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

  const period = req.nextUrl.searchParams.get("period") || "30d";

  let days: number;
  switch (period) {
    case "7d": days = 7; break;
    case "90d": days = 90; break;
    case "all": days = 365 * 10; break;
    default: days = 30;
  }

  const since = new Date();
  since.setDate(since.getDate() - days);

  const adminDb = createAdminClient();
  const { data: usage } = await adminDb
    .from("agent_usage")
    .select("*")
    .eq("profissional_id", profissionalId)
    .gte("date", since.toISOString().split("T")[0])
    .order("date", { ascending: false });

  const totals = (usage || []).reduce(
    (acc, row: any) => ({
      tokens_input: acc.tokens_input + (row.tokens_input || 0),
      tokens_output: acc.tokens_output + (row.tokens_output || 0),
      messages: acc.messages + (row.messages || 0),
      conversations: acc.conversations + (row.conversations || 0),
      cost: acc.cost + Number(row.cost || 0),
    }),
    { tokens_input: 0, tokens_output: 0, messages: 0, conversations: 0, cost: 0 }
  );

  return NextResponse.json({
    usage: usage || [],
    totals,
    period,
  });
}
