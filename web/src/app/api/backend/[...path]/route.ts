import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

/**
 * Catch-all proxy to the Go backend.
 *
 * Reads the Stytch session JWT from the HttpOnly cookie and forwards
 * it as an Authorization header. This avoids the client needing to
 * extract the JWT — the server handles it.
 *
 * Frontend calls:  /api/backend/auth/me
 * Proxy forwards:  https://phosra-api.fly.dev/api/v1/auth/me
 */
async function handler(request: NextRequest, { params }: { params: { path: string[] } }) {
  const path = params.path.join("/")
  const url = new URL(`/api/v1/${path}`, BACKEND_URL)

  // Forward query string
  request.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.set(key, value)
  })

  // Build headers — forward most, add auth from cookie
  const headers = new Headers()
  headers.set("Content-Type", request.headers.get("Content-Type") || "application/json")

  // Read the Stytch JWT from the cookie
  const jwt = request.cookies.get("stytch_session_jwt")?.value
  if (jwt) {
    headers.set("Authorization", `Bearer ${jwt}`)
  }

  // Forward sandbox header if present
  const sandbox = request.headers.get("X-Sandbox-Session")
  if (sandbox) {
    headers.set("X-Sandbox-Session", sandbox)
  }

  // Proxy the request
  const body = request.method !== "GET" && request.method !== "HEAD"
    ? await request.arrayBuffer()
    : undefined

  const backendRes = await fetch(url.toString(), {
    method: request.method,
    headers,
    body,
  })

  // Return the backend response as-is
  const responseBody = await backendRes.arrayBuffer()
  return new NextResponse(responseBody, {
    status: backendRes.status,
    statusText: backendRes.statusText,
    headers: {
      "Content-Type": backendRes.headers.get("Content-Type") || "application/json",
    },
  })
}

export const GET = handler
export const POST = handler
export const PUT = handler
export const PATCH = handler
export const DELETE = handler
