import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Cron diário (CRON_SECRET): detecta planos pagos vencidos,
 * degrada para grátis e notifica o profissional (WhatsApp + push).
 */
export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization") || "";
  const esperado = process.env.CRON_SECRET;
  if (!esperado || auth !== `Bearer ${esperado}`) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const agora = new Date();

  const { data: vencidos } = await supabase
    .from("profissionais")
    .select("id, slug, nome, whatsapp, plano, plano_expira_em")
    .neq("plano", "gratis")
    .lt("plano_expira_em", agora.toISOString());

  let degradados = 0;
  let notificados = 0;

  for (const prof of vencidos || []) {
    await supabase
      .from("profissionais")
      .update({ plano: "gratis", plano_expira_em: null })
      .eq("id", prof.id);
    degradados++;

    try {
      const { enviarPushProfissional } = await import("@/lib/push-server");
      const pushOk = await enviarPushProfissional(
        prof.id,
        "⚠️ Seu plano expirou",
        `Seu plano ${prof.plano} expirou. Renove em /painel/plano para manter os recursos.`,
        `/painel/plano`
      );
      if (pushOk) notificados++;
    } catch {}

    const whatsapp = prof.whatsapp?.replace(/\D/g, "");
    if (whatsapp && whatsapp.length >= 10) {
      try {
        const { sendText } = await import("@/lib/whatsapp/evolution");
        await sendText(
          prof.id,
          whatsapp,
          `⚠️ *Seu plano ${prof.plano} expirou*\n\nSeu acesso foi rebaixado para o plano Grátis. Renove em: ${process.env.NEXT_PUBLIC_DOMAIN}/${prof.slug}/painel/plano`
        );
      } catch {
        // best-effort
      }
    }
  }

  return NextResponse.json({ degradados, notificados, processados: vencidos?.length || 0 });
}
