import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { subscription } = await req.json();
  if (!subscription) return NextResponse.json({ error: "Subscription obrigatória" }, { status: 400 });

  const adminDb = createAdminClient();
  const { data: prof } = await adminDb
    .from("profissionais")
    .select("id")
    .eq("email", user.email)
    .maybeSingle();

  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      user_id: user.id,
      profissional_id: prof?.id || null,
      subscription,
    },
    { onConflict: "user_id" }
  );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
