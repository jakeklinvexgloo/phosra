import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const publicPathPatterns = [
  /^\/$/,
  /^\/login(.*)/,
  /^\/docs(.*)/,
  /^\/platforms(.*)/,
  /^\/playground(.*)/,
  /^\/pricing(.*)/,
  /^\/changelog(.*)/,
  /^\/demo(.*)/,
  /^\/compliance(.*)/,
  /^\/standards(.*)/,
  /^\/movements(.*)/,
  /^\/technology-services(.*)/,
  /^\/parental-controls(.*)/,
  /^\/about(.*)/,
  /^\/brand(.*)/,
  /^\/contact(.*)/,
  /^\/investors$/,
  /^\/investors\/portal(.*)/,
  /^\/investors\/financial-model(.*)/,
  /^\/deck(.*)/,
  /^\/api\/investors(.*)/,
  /^\/api\/agents(.*)/,
  /^\/newsroom(.*)/,
  /^\/privacy(.*)/,
  /^\/terms(.*)/,
  /^\/auth\/callback(.*)/,
  /^\/api\/playground(.*)/,
  /^\/opengraph-image(.*)/,
  /^\/twitter-image(.*)/,
]

function isPublicPath(pathname: string): boolean {
  return publicPathPatterns.some((pattern) => pattern.test(pathname))
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Sandbox mode bypass — skip auth for all dashboard routes
  if (process.env.NEXT_PUBLIC_SANDBOX_MODE === "true") {
    return NextResponse.next()
  }

  // Allow public paths
  if (isPublicPath(pathname)) {
    return NextResponse.next()
  }

  // Check for Stytch session JWT cookie (existence only — no full validation in Edge Runtime)
  const sessionJwt = request.cookies.get("stytch_session_jwt")?.value
  if (!sessionJwt) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/agents/:path*", "/api/investors/admin/:path*"],
}
