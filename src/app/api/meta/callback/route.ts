import { NextRequest, NextResponse } from "next/server"
import { handleCallback, validateMetaOAuthState } from "@/lib/meta/graph"

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
    return NextResponse.redirect(new URL(`/admin?meta=success`, req.url))
  } catch (err: any) {
    return NextResponse.redirect(
      new URL(`/admin?meta=error&message=${encodeURIComponent(err.message)}`, req.url)
    )
  }
}
