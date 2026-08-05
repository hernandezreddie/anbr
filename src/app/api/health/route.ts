import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const auth = request.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (token !== (process.env.CRON_SECRET || process.env.HEALTH_SECRET || "anbr-health-2026")) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const checks: Record<string, { ok: boolean; detail?: string }> = {};

  try {
    const adminDb = createAdminClient();

    const { count: profissionais, error: dbErr } = await adminDb
      .from("profissionais")
      .select("id", { count: "exact", head: true });

    checks.db = dbErr
      ? { ok: false, detail: dbErr.message }
      : { ok: true, detail: `${profissionais} profissionais` };

    const { data: instances, error: waErr } = await adminDb
      .from("whatsapp_instances")
      .select("id, instance_name, provider, status")
      .eq("status", "connected");

    checks.whatsapp = waErr
      ? { ok: false, detail: waErr.message }
      : { ok: true, detail: `${instances?.length || 0} instâncias conectadas` };

    const { data: lastLembrete } = await adminDb
      .from("agendamentos")
      .select("id")
      .eq("status", "concluido")
      .order("updated_at", { ascending: false })
      .limit(1);

    checks.cron = { ok: true, detail: lastLembrete?.length ? "último agendamento concluído encontrado" : "sem agendamentos concluídos" };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "erro desconhecido";
    checks.db = { ok: false, detail: msg };
    checks.whatsapp = { ok: false, detail: "não verificado" };
    checks.cron = { ok: false, detail: "não verificado" };
  }

  const allOk = Object.values(checks).every((c) => c.ok);
  return NextResponse.json(
    { status: allOk ? "healthy" : "degraded", checks, uptime: process.uptime() },
    { status: allOk ? 200 : 503 }
  );
}
