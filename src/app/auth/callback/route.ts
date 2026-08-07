import { createRouteClient } from "@/lib/supabase/route";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/entrar";

  if (code) {
    const supabase = await createRouteClient();
    const { error, data } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error("Auth callback error:", error.message);
      return NextResponse.redirect(`${origin}/entrar?erro=callback`);
    }
    // Verify session was established
    if (!data?.session) {
      return NextResponse.redirect(`${origin}/entrar?erro=sin_sesion`);
    }
  }

  // Add a query param to force client to fetch fresh session
  const redirectUrl = new URL(`${origin}${next}`);
  redirectUrl.searchParams.set("from_auth_callback", "true");
  
  return NextResponse.redirect(redirectUrl.toString());
}
