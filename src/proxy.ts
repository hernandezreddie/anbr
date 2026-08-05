import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"

const ROOT_DOMAIN = "autonexabrasil.com.br"
const CUSTOM_DOMAIN_CACHE = new Map<string, string | undefined>()

const WEBHOOK_PATHS = [
  "/api/webhooks/",
  "/api/whatsapp/webhook",
  "/api/whatsapp/meta/webhook",
  "/api/meta/webhook",
]

const CRON_PATHS = [
  "/api/agendamentos/lembretes",
  "/api/planos/vencidos",
]

const PUBLIC_API_PATHS = [
  "/api/agendamentos",
  "/api/cadastro",
  "/api/avaliacoes",
  "/api/profissional/config",
  "/api/planos/pedido/estado",
  "/api/health",
]

function isWebhook(pathname: string) {
  return WEBHOOK_PATHS.some((p) => pathname.startsWith(p))
}

function isCron(pathname: string) {
  return CRON_PATHS.some((p) => pathname.startsWith(p))
}

function isPublicApi(pathname: string) {
  return PUBLIC_API_PATHS.some((p) => pathname.startsWith(p))
}

function addSecurityHeaders(response: NextResponse) {
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co https://api.mercadopago.com https://api.openai.com https://openrouter.ai https://generativelanguage.googleapis.com https://api.anthropic.com; frame-ancestors 'none';"
  )
}

function validateCSRF(req: NextRequest): NextResponse | null {
  const { pathname } = req.nextUrl
  const method = req.method

  if (!pathname.startsWith("/api/")) return null
  if (!["POST", "PATCH", "DELETE"].includes(method)) return null

  if (isWebhook(pathname) || isCron(pathname) || isPublicApi(pathname)) return null

  const origin = req.headers.get("origin")
  const host = req.headers.get("host")
  const referer = req.headers.get("referer")

  if (origin) {
    try {
      const originHost = new URL(origin).host
      if (originHost !== host) {
        return new NextResponse(JSON.stringify({ error: "CSRF validation failed" }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        })
      }
    } catch {
      return new NextResponse(JSON.stringify({ error: "CSRF validation failed" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      })
    }
  } else if (referer) {
    try {
      const refererHost = new URL(referer).host
      if (refererHost !== host) {
        return new NextResponse(JSON.stringify({ error: "CSRF validation failed" }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        })
      }
    } catch {
      return new NextResponse(JSON.stringify({ error: "CSRF validation failed" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      })
    }
  }

  return null
}

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  const csrfResponse = validateCSRF(req)
  if (csrfResponse) return csrfResponse

  const hostname = req.headers.get("host") || ""

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/auth") ||
    pathname === "/favicon.ico" ||
    pathname === "/manifest.webmanifest"
  ) {
    const response = NextResponse.next()
    addSecurityHeaders(response)
    return response
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
      if (pathname === `/${slug}` || pathname.startsWith(`/${slug}/`)) {
        const response = NextResponse.next()
        addSecurityHeaders(response)
        return response
      }
      url.pathname = `/${slug}${pathname === "/" ? "" : pathname}`
      const response = NextResponse.rewrite(url)
      addSecurityHeaders(response)
      return response
    }

    return new NextResponse("Domain not configured", { status: 404 })
  }

  const response = NextResponse.next()
  addSecurityHeaders(response)
  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.svg|.*\\.png|.*\\.jpg|.*\\.ico).*)"],
}
