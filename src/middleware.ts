import { NextRequest, NextResponse } from "next/server";

const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN
  ? new URL(process.env.NEXT_PUBLIC_DOMAIN).hostname
  : "autonexabrasil.com.br";
const APP_PATHS = ["/api", "/_next", "/favicon.ico", "/manifest.webmanifest"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get("host") || "";

  const response = NextResponse.next();
  response.headers.set("x-pathname", pathname);

  if (APP_PATHS.some((p) => pathname.startsWith(p))) {
    return response;
  }

  const host = hostname.replace(/:\d+$/, "").toLowerCase();

  if (host === DOMAIN || host === `www.${DOMAIN}` || host === "localhost:3000") {
    return response;
  }

  if (host.endsWith(`.${DOMAIN}`) || host.endsWith(".localhost:3000")) {
    const slug = host.split(".")[0];
    const url = request.nextUrl.clone();
    url.pathname = `/(slug)/${slug}${pathname}`;
    const rewrite = NextResponse.rewrite(url);
    rewrite.headers.set("x-pathname", pathname);
    return rewrite;
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|_next/data|favicon.ico|.*\\.).*)"],
};
