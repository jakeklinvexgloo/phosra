export const runtime = "nodejs"

const API_BASE = process.env.PHOSRA_API_URL || "http://localhost:8080/api/v1"

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const sessionId = body.sessionId || "default"
  const token = `sandbox-${sessionId}`

  // Delete all families (cascades to children, policies, rules)
  try {
    const familiesRes = await fetch(`${API_BASE}/families`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Sandbox-Session": sessionId,
      },
    })
    if (familiesRes.ok) {
      const families = await familiesRes.json()
      for (const family of families || []) {
        await fetch(`${API_BASE}/families/${family.id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Sandbox-Session": sessionId,
          },
        })
      }
    }
  } catch {
    // ignore errors during cleanup
  }

  return Response.json({ status: "reset", session_id: sessionId })
}
