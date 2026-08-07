export const dynamic = "force-dynamic";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// Admin endpoint for panel mutations (status update, payment, date/time)
export async function PATCH(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const url = new URL(request.url);

  // Verify admin auth
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== 'admin' && profile?.role !== 'plataforma') {
    return NextResponse.json({ error: "Forbidden - admin access required" }, { status: 403 });
  }

  // Get target profissional_id from slug
  const adminClient = createAdminClient();
  const { data: prof } = await adminClient
    .from("profissionais")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (!prof) {
    return NextResponse.json({ error: "Profissional not found" }, { status: 404 });
  }

  const action = url.searchParams.get("action");
  const body = await request.json();

  if (action === "update_agendamento") {
    const { id, data, hora, status } = body;
    const update: Record<string, unknown> = {};
    if (data !== undefined) update.data = data;
    if (hora !== undefined) update.hora = hora;
    if (status !== undefined) update.status = status;

    const { error } = await adminClient
      .from("agendamentos")
      .update(update)
      .eq("id", id)
      .eq("profissional_id", prof.id); // Ensure it belongs to this tenant

    if (error) {
      console.error("[admin/painel PATCH] Error updating agendamento:", error);
      return NextResponse.json({ error: "Failed to update" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  }

  if (action === "marcar_pago") {
    const { agendamento_id, valor } = body;
    const { error } = await adminClient
      .from("pagamentos")
      .insert({
        agendamento_id,
        profissional_id: prof.id,
        valor,
        status: "pago",
        pago_em: new Date().toISOString(),
      });

    if (error) {
      console.error("[admin/painel PATCH] Error inserting pagamento:", error);
      return NextResponse.json({ error: "Failed to insert payment" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
