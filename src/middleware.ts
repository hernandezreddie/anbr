import { NextRequest, NextResponse } from "next/server";

const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN
  ? new URL(process.env.NEXT_PUBLIC_DOMAIN).hostname
  : "autonexabrasil.com.br";
const APP_PATHS = ["/api", "/_next", "/favicon.ico", "/manifest.webmanifest"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get("host") || "";
  const host = hostname.replace(/:\d+$/, "").toLowerCase();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  if (APP_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  if (host === DOMAIN || host === `www.${DOMAIN}` || host === "localhost:3000") {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  if (host.endsWith(`.${DOMAIN}`) || host.endsWith(".localhost:3000")) {
    const slug = host.split(".")[0];
    const url = request.nextUrl.clone();
    url.pathname = `/(slug)/${slug}${pathname}`;
    const rewrite = NextResponse.rewrite(url, { request: { headers: requestHeaders } });
    rewrite.headers.set("x-pathname", pathname);
    return rewrite;
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|_next/data|favicon.ico|.*\\.).*)"],
};
