import webpush from "web-push";
import { createAdminClient } from "@/lib/supabase/admin";

function getWebPush() {
  webpush.setVapidDetails(
    process.env.VAPID_CONTACT || "mailto:caridad@email.com",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "",
    process.env.VAPID_PRIVATE_KEY || "",
  );
  return webpush;
}

/**
 * Envia push para as assinaturas do profissional.
 * Filtra primeiro por profissional_id (correlação correta);
 * se não houver, tenta user_id (legado).
 */
export async function enviarPushProfissional(
  profissional_id: string,
  title: string,
  body: string,
  url = "/"
): Promise<{ sent: number; total: number }> {
  const adminDb = createAdminClient();
  const payload = JSON.stringify({ title, body, data: { url } });

  let subs: { subscription: PushSubscriptionJSON }[] = [];
  let total = 0;

  const { data: porProfissional } = await adminDb
    .from("push_subscriptions")
    .select("subscription")
    .eq("profissional_id", profissional_id);
  subs = porProfissional || [];
  total = subs.length;

  if (subs.length === 0) {
    const { data: porUser } = await adminDb
      .from("push_subscriptions")
      .select("subscription")
      .eq("user_id", profissional_id);
    subs = porUser || [];
    total = subs.length;
  }

  if (subs.length === 0) return { sent: 0, total: 0 };

  const webpush = getWebPush();
  let sent = 0;
  for (const s of subs) {
    try {
      await webpush.sendNotification(s.subscription, payload);
      sent++;
    } catch (err: unknown) {
      const statusCode = (err as { statusCode?: number })?.statusCode;
      if (statusCode === 410 || statusCode === 404) {
        await adminDb
          .from("push_subscriptions")
          .delete()
          .eq("subscription->>endpoint", (s.subscription as unknown as { endpoint: string }).endpoint);
      }
    }
  }
  return { sent, total };
}
