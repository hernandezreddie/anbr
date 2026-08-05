import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { handleCallback, validateMetaOAuthState } from "@/lib/meta/graph"

async function redirectParaAgente(profissional_id: string, req: NextRequest, params: string) {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from("profissionais")
    .select("slug")
    .eq("id", profissional_id)
    .single()
  const slug = data?.slug || ""
  return NextResponse.redirect(new URL(`/admin/agent/${slug}?meta=${params}`, req.url))
}

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code")
  const state = req.nextUrl.searchParams.get("state")
  const errorParam = req.nextUrl.searchParams.get("error")

  if (errorParam) {
    return NextResponse.redirect(new URL(`/admin?meta=error`, req.url))
  }

  if (!code || !state) {
    return NextResponse.redirect(new URL(`/admin?meta=error&message=Parâmetros+ausentes`, req.url))
  }

  try {
    const profissional_id = await validateMetaOAuthState(state)
    await handleCallback(code, profissional_id)
    return redirectParaAgente(profissional_id, req, "success")
  } catch (err: any) {
    return NextResponse.redirect(
      new URL(`/admin?meta=error&message=${encodeURIComponent(err.message)}`, req.url)
    )
  }
}
