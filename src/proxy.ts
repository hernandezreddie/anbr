import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"

const ROOT_DOMAIN = "autonexabrasil.com.br"
const CUSTOM_DOMAIN_CACHE = new Map<string, string | undefined>()

export default async function proxy(req: NextRequest) {
  const hostname = req.headers.get("host") || ""
  const { pathname } = req.nextUrl

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/auth") ||
    pathname === "/favicon.ico" ||
    pathname === "/manifest.webmanifest"
  ) {
    return NextResponse.next()
  }

  if (!hostname.includes(ROOT_DOMAIN) && !hostname.includes("localhost")) {
    let slug = CUSTOM_DOMAIN_CACHE.get(hostname)

    if (!slug) {
      try {
        const supabase = createServerClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          { cookies: { getAll: () => [], setAll: () => {} } }
        )

        const { data: domain } = await supabase
          .from("custom_domains")
          .select("profissional_id")
          .eq("domain", hostname)
          .single()

        if (domain) {
          const { data: prof } = await supabase
            .from("profissionais")
            .select("slug")
            .eq("id", domain.profissional_id)
            .single()

          if (prof?.slug) {
            CUSTOM_DOMAIN_CACHE.set(hostname, prof.slug)
            slug = prof.slug
          } else {
            slug = ""
          }
        }
      } catch {}
    }

    if (slug) {
      const url = new URL(req.url)
      url.pathname = `/${slug}${pathname === "/" ? "" : pathname}`
      return NextResponse.rewrite(url)
    }

    return new NextResponse("Domain not configured", { status: 404 })
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest).*)"],
}
