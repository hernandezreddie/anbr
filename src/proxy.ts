import { NextRequest, NextResponse } from "next/server";

const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN || "livreta.com.br";
const APP_PATHS = ["/painel", "/api", "/_next", "/favicon.ico", "/manifest.webmanifest"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get("host") || "";

  if (APP_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const host = hostname.replace(/:\d+$/, "").toLowerCase();

  if (host === DOMAIN || host === `www.${DOMAIN}` || host === "localhost:3000") {
    return NextResponse.next();
  }

  if (host.endsWith(`.${DOMAIN}`) || host.endsWith(`.localhost:3000`)) {
    const slug = host.split(".")[0];
    const url = request.nextUrl.clone();
    url.pathname = `/_slug/${slug}${pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|_next/data|favicon.ico|.*\\.).*)"],
};
