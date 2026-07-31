import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const { profissional_id, title, body, url } = await req.json();
    if (!profissional_id || !title || !body) {
      return NextResponse.json({ error: "profissional_id, title e body obrigatórios" }, { status: 400 });
    }

    const adminDb = createAdminClient();
    const { data: subs } = await adminDb
      .from("push_subscriptions")
      .select("subscription")
      .eq("user_id", profissional_id);

    if (!subs || subs.length === 0) {
      return NextResponse.json({ sent: 0, error: "Nenhuma inscrição encontrada" });
    }

    const webpush = require("web-push");
    webpush.setVapidDetails(
      process.env.VAPID_CONTACT || "mailto:caridad@email.com",
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "",
      process.env.VAPID_PRIVATE_KEY || "",
    );

    const payload = JSON.stringify({ title, body, data: { url: url || "/" } });
    let sent = 0;
    const results = [];

    for (const s of subs) {
      try {
        await webpush.sendNotification(s.subscription, payload);
        sent++;
      } catch (err: any) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          await adminDb
            .from("push_subscriptions")
            .delete()
            .eq("subscription->>endpoint", s.subscription.endpoint);
        }
        results.push({ error: err.message });
      }
    }

    return NextResponse.json({ sent, total: subs.length, results });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
