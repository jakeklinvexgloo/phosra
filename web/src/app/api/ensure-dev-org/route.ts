export const runtime = "nodejs"

const API_BASE =
  (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080") + "/api/v1"

/**
 * Ensure-dev-org: idempotently returns the caller's developer org,
 * creating one if it doesn't exist yet.
 *
 * POST /api/ensure-dev-org  { name: string }
 *
 * Auth is forwarded from the client via Authorization header or
 * X-Sandbox-Session header.
 */
export async function POST(req: Request) {
  // Forward auth headers to the Go backend
  const authHeader = req.headers.get("authorization")
  const sandboxHeader = req.headers.get("x-sandbox-session")

  if (!authHeader && !sandboxHeader) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const headers: Record<string, string> = { "Content-Type": "application/json" }
  if (sandboxHeader) {
    headers["X-Sandbox-Session"] = sandboxHeader
  } else if (authHeader) {
    headers["Authorization"] = authHeader
  }

  // 1. Check for existing orgs
  try {
    const listRes = await fetch(`${API_BASE}/developers/orgs`, { headers })
    if (listRes.ok) {
      const orgs = await listRes.json()
      if (orgs && orgs.length > 0) {
        return Response.json(orgs[0])
      }
    } else if (listRes.status === 401) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }
  } catch {
    // Network error — fall through and try to create
  }

  // 2. Parse requested name from body
  const body = await req.json().catch(() => ({}))
  const baseName: string = body.name || "My Organization"

  // 3. Create org, with retry on 409 slug collision (up to 3 attempts)
  let lastError = ""
  for (let attempt = 0; attempt < 3; attempt++) {
    const name =
      attempt === 0
        ? baseName
        : `${baseName} ${Math.random().toString(36).slice(2, 6)}`

    const createRes = await fetch(`${API_BASE}/developers/orgs`, {
      method: "POST",
      headers,
      body: JSON.stringify({ name }),
    })

    if (createRes.ok) {
      return Response.json(await createRes.json())
    }

    if (createRes.status === 409) {
      // Slug collision — retry with modified name
      lastError = "slug collision"
      continue
    }

    // Some other error — return it
    const errBody = await createRes.json().catch(() => ({ message: createRes.statusText }))
    return Response.json(
      { error: errBody.message || errBody.error || createRes.statusText },
      { status: createRes.status }
    )
  }

  return Response.json(
    { error: `Failed to create org after 3 attempts (${lastError})` },
    { status: 409 }
  )
}
