import { createRouteClient } from "@/lib/supabase/route";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/entrar";

  if (code) {
    const supabase = await createRouteClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(`${origin}/entrar?erro=callback`);
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
