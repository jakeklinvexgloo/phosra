"use client"

import { useState } from "react"

/* ── Platform list ────────────────────────────────────────────── */

const PLATFORMS = [
  { id: "netflix", name: "Netflix", logo: "🎬" },
  { id: "peacock", name: "Peacock", logo: "🦚" },
  { id: "disney_plus", name: "Disney+", logo: "🏰" },
  { id: "prime_video", name: "Prime Video", logo: "📦" },
  { id: "apple_tv", name: "Apple TV+", logo: "🍎" },
  { id: "youtube", name: "YouTube", logo: "▶️" },
]

/* ── Types (mirrors Convex schema — will use real queries once Convex is deployed) */

interface StructuredPolicy {
  maxMpaaRating: string
  maxCommonSenseAge: number
  maxViolenceScore: number
}

interface ContentPolicy {
  naturalLanguagePolicy: string
  structuredPolicy: StructuredPolicy
  agentInterpretation: string
}

interface FlaggedTitle {
  title: string
  reason: string
}

interface StreamingAudit {
  _id: string
  platform: string
  overallScore: number
  flaggedTitles: FlaggedTitle[]
  agentReport: string
  auditedAt: number
}

/* ── Main Component ───────────────────────────────────────────── */

export default function StreamingMonitor() {
  const [policyText, setPolicyText] = useState("")
  const [childAge, setChildAge] = useState(10)
  const [interpreting, setInterpreting] = useState(false)

  // Placeholder data — will be replaced with Convex queries:
  //   const policy = useQuery(api.contentPolicies.getByChild, { childId })
  //   const recentAudits = useQuery(api.streamingAudits.getForChild, { childId, limit: 5 })
  const policy: ContentPolicy | null = null
  const recentAudits: StreamingAudit[] = []

  const handleSetPolicy = async () => {
    setInterpreting(true)
    // Will call: await interpretPolicy({ childId, naturalLanguagePolicy: policyText, childAge })
    // Simulating delay for now
    await new Promise((r) => setTimeout(r, 1500))
    setInterpreting(false)
    setPolicyText("")
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold text-foreground mb-2">
        Streaming Monitor
      </h1>
      <p className="text-muted-foreground text-sm mb-8">
        AI-powered content auditing across Netflix, Peacock, Disney+, and more
      </p>

      {/* Policy Setup */}
      <div className="bg-card rounded-xl border border-border p-6 mb-8">
        <h2 className="font-semibold text-foreground mb-3">Content Policy</h2>
        {policy ? (
          <div>
            <div className="text-sm text-muted-foreground mb-3 italic">
              &ldquo;{policy.naturalLanguagePolicy}&rdquo;
            </div>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="bg-muted rounded p-2">
                <div className="text-muted-foreground text-xs">Max MPAA</div>
                <div className="font-semibold text-foreground">
                  {policy.structuredPolicy.maxMpaaRating}
                </div>
              </div>
              <div className="bg-muted rounded p-2">
                <div className="text-muted-foreground text-xs">
                  Max CSM Age
                </div>
                <div className="font-semibold text-foreground">
                  {policy.structuredPolicy.maxCommonSenseAge}
                </div>
              </div>
              <div className="bg-muted rounded p-2">
                <div className="text-muted-foreground text-xs">Violence</div>
                <div className="font-semibold text-foreground">
                  {policy.structuredPolicy.maxViolenceScore}/5
                </div>
              </div>
            </div>
            <div className="text-xs text-muted-foreground mt-2 italic">
              Agent interpretation: {policy.agentInterpretation}
            </div>
          </div>
        ) : (
          <div>
            <div className="flex gap-3 mb-2">
              <input
                type="number"
                value={childAge}
                onChange={(e) => setChildAge(+e.target.value)}
                className="border border-border rounded px-2 py-1 w-16 text-sm bg-background text-foreground"
                placeholder="Age"
              />
              <input
                value={policyText}
                onChange={(e) => setPolicyText(e.target.value)}
                className="border border-border rounded px-3 py-1 flex-1 text-sm bg-background text-foreground placeholder:text-muted-foreground"
                placeholder='e.g. "She\'s 8, loves animals, no violence or romance"'
              />
              <button
                onClick={handleSetPolicy}
                disabled={interpreting || !policyText}
                className="bg-brand-green text-foreground px-4 py-1 rounded text-sm font-medium disabled:opacity-50 hover:opacity-90 transition"
              >
                {interpreting ? "Interpreting..." : "Set Policy"}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Describe your child&apos;s content policy in plain English — our
              AI translates it to platform-specific rules.
            </p>
          </div>
        )}
      </div>

      {/* Platform Grid */}
      <h2 className="font-semibold text-foreground mb-3">
        Connected Platforms
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        {PLATFORMS.map((platform) => {
          const audit = recentAudits.find((a) => a.platform === platform.id)
          return (
            <div
              key={platform.id}
              className="bg-card rounded-xl border border-border p-4 hover:shadow-card-hover transition-shadow"
            >
              <div className="text-2xl mb-1">{platform.logo}</div>
              <div className="font-semibold text-sm text-foreground">
                {platform.name}
              </div>
              {audit ? (
                <div>
                  <div
                    className={`text-lg font-bold mt-1 ${
                      audit.overallScore >= 70
                        ? "text-green-600"
                        : audit.overallScore >= 40
                          ? "text-yellow-600"
                          : "text-red-600"
                    }`}
                  >
                    {audit.overallScore}/100
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {audit.flaggedTitles.length} titles flagged
                  </div>
                  <button className="text-xs text-brand-green mt-1 hover:underline">
                    View audit &rarr;
                  </button>
                </div>
              ) : (
                <div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Not connected
                  </div>
                  <button className="text-xs text-brand-green mt-1 hover:underline">
                    Connect &rarr;
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Recent Audit Results */}
      {recentAudits.length > 0 && (
        <div>
          <h2 className="font-semibold text-foreground mb-3">Recent Audits</h2>
          {recentAudits.map((audit) => (
            <div
              key={audit._id}
              className="bg-card border border-border rounded-xl p-4 mb-3"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-semibold text-foreground capitalize">
                    {audit.platform}
                  </span>
                  <span className="text-xs text-muted-foreground ml-2">
                    {new Date(audit.auditedAt).toLocaleDateString()}
                  </span>
                </div>
                <div
                  className={`text-xl font-bold ${
                    audit.overallScore >= 70
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {audit.overallScore}/100
                </div>
              </div>
              {audit.flaggedTitles.length > 0 && (
                <div className="mt-2">
                  <div className="text-xs text-muted-foreground mb-1">
                    Flagged content:
                  </div>
                  {audit.flaggedTitles.slice(0, 3).map((t, i) => (
                    <div
                      key={i}
                      className="text-xs bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded px-2 py-1 mb-1"
                    >
                      {t.title} — {t.reason}
                    </div>
                  ))}
                </div>
              )}
              <div className="text-xs text-muted-foreground mt-2">
                {audit.agentReport}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
