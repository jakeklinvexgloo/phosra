export const runtime = "nodejs"

const API_BASE = process.env.PHOSRA_API_URL || "http://localhost:8080/api/v1"

/**
 * Klinvex Family playground setup.
 *
 * Creates the family, 5 children, and connects all platforms — but does NOT
 * create any policies or rules. The playground demo shows controls being
 * turned ON by the user via scenario cards / Claude.
 */

interface KlinvexChild {
  name: string
  /** Years to subtract from today to get birth date */
  ageYears: number
  /** Month offset so siblings aren't born on the same day */
  monthOffset: number
}

const KLINVEX_CHILDREN: KlinvexChild[] = [
  { name: "Chap", ageYears: 10, monthOffset: -8 },
  { name: "Samson", ageYears: 9, monthOffset: -6 },
  { name: "Mona", ageYears: 9, monthOffset: -3 },
  { name: "Ramsay", ageYears: 7, monthOffset: -10 },
  { name: "Coldy", ageYears: 5, monthOffset: -5 },
]

/** Platforms to auto-connect for the Klinvex Family */
const KLINVEX_PLATFORMS = [
  "netflix",
  "paramount_plus",
  "youtube_tv",
  "peacock",
  "prime_video",
  "fire_tablet",
  "apple_watch",
  "fire_tv",
  "youtube",
  "nextdns",
  "android",
]

function birthDateForAge(ageYears: number, monthOffset: number): string {
  const now = new Date()
  const birth = new Date(
    now.getFullYear() - ageYears,
    now.getMonth() + monthOffset,
    15
  )
  return birth.toISOString().split("T")[0]
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const sessionId = body.sessionId || "default"
  const token = `sandbox-${sessionId}`
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    "X-Sandbox-Session": sessionId,
  }

  // Idempotency: if family already exists, return early
  try {
    const familiesRes = await fetch(`${API_BASE}/families`, { headers })
    if (familiesRes.ok) {
      const families = await familiesRes.json()
      if (families && families.length > 0) {
        return Response.json({
          status: "already_setup",
          family_id: families[0].id,
        })
      }
    }
  } catch {
    // ignore — proceed to create
  }

  // Step 1: Create family
  const familyRes = await fetch(`${API_BASE}/families`, {
    method: "POST",
    headers,
    body: JSON.stringify({ name: "Klinvex Family" }),
  })

  if (!familyRes.ok) {
    const err = await familyRes.text()
    return Response.json(
      { error: `Failed to create family: ${err}` },
      { status: 500 }
    )
  }

  const family = await familyRes.json()
  const familyId = family.id

  // Step 2: Create 5 children (no policies — the demo shows controls being turned ON)
  const children = []
  for (const child of KLINVEX_CHILDREN) {
    const childRes = await fetch(
      `${API_BASE}/families/${familyId}/children`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          name: child.name,
          birth_date: birthDateForAge(child.ageYears, child.monthOffset),
        }),
      }
    )

    if (!childRes.ok) {
      const err = await childRes.text()
      return Response.json(
        { error: `Failed to create child ${child.name}: ${err}` },
        { status: 500 }
      )
    }

    const childData = await childRes.json()
    children.push({ id: childData.id, name: child.name })
  }

  // Step 3: Connect all platforms to the family
  const connectedPlatforms = []
  for (const platformId of KLINVEX_PLATFORMS) {
    try {
      const linkRes = await fetch(`${API_BASE}/compliance`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          family_id: familyId,
          platform_id: platformId,
          credentials: "",
        }),
      })
      if (linkRes.ok) {
        connectedPlatforms.push(platformId)
      }
    } catch {
      // skip if platform doesn't exist in DB yet
    }
  }

  return Response.json({
    status: "created",
    family_id: familyId,
    children,
    connected_platforms: connectedPlatforms,
  })
}
