import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { enviarPushProfissional } from "@/lib/push-server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const { profissional_id, title, body, url } = await req.json();
    if (!profissional_id || !title || !body) {
      return NextResponse.json({ error: "profissional_id, title e body obrigatórios" }, { status: 400 });
    }

    const { sent, total } = await enviarPushProfissional(profissional_id, title, body, url);
    return NextResponse.json({ sent, total });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
