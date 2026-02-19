"use client"

import { AnimatedSection, FloatingElement, WaveTexture, GradientMesh } from "./shared"
import { PLATFORM_STATS } from "@/lib/platforms"

/* ────────────────────────────────────────────────────
 * Full-bleed use-case showcases (replaces feature cards)
 * Three sections: Screen Time, Content Filtering, Enforcement
 * ──────────────────────────────────────────────────── */

const USE_CASES = [
  {
    badge: "Screen Time",
    badgeColor: "bg-accent-teal/15 text-accent-teal border-accent-teal/20",
    title: "Set limits once.",
    titleAccent: "Enforce everywhere.",
    description:
      "Define daily app usage limits, bedtimes, and downtime windows. Phosra pushes time-based rules to every connected device — iOS, Android, Fire tablets, and DNS-level blocking.",
    mockup: "screentime" as const,
    reverse: false,
  },
  {
    badge: "Content Filtering",
    badgeColor: "bg-accent-purple/15 text-accent-purple border-accent-purple/20",
    title: "Age-appropriate content.",
    titleAccent: "Every platform.",
    description:
      "Automatic age-to-rating mapping across MPAA, TV Parental, ESRB, PEGI, and CSM systems. One child profile generates tailored rules for Netflix, YouTube, gaming, and web filtering.",
    mockup: "content" as const,
    reverse: true,
  },
  {
    badge: "Enforcement",
    badgeColor: "bg-accent-cyan/15 text-accent-cyan border-accent-cyan/20",
    title: "Real-time compliance.",
    titleAccent: "Zero guesswork.",
    description:
      "Monitor enforcement across platforms and track compliance with child safety legislation in real-time. See which laws each platform satisfies — KOSA, COPPA, EU DSA — and get notified when enforcement fails.",
    mockup: "enforcement" as const,
    reverse: false,
  },
]

export function Features() {
  return (
    <section id="features" className="relative py-0 bg-gradient-to-b from-[#0D1B2A] via-[#0A2540] to-[#0D1B2A]">
      <WaveTexture colorStart="#00D47E" colorEnd="#26A8C9" opacity={0.06} />
      <GradientMesh
        colors={["#00D47E", "#26A8C9", "#7B5CB8", "#0D1B2A"]}
        className="opacity-15"
      />

      {USE_CASES.map((uc, i) => (
        <div
          key={uc.badge}
          className={`relative py-20 sm:py-28 overflow-hidden ${
            i > 0 ? "border-t border-white/[0.04]" : ""
          }`}
        >
          <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <div
              className={`grid lg:grid-cols-2 gap-12 lg:gap-20 items-center ${
                uc.reverse ? "lg:direction-rtl" : ""
              }`}
              style={uc.reverse ? { direction: "rtl" } : undefined}
            >
              {/* Text column */}
              <AnimatedSection
                direction={uc.reverse ? "right" : "left"}
                delay={0}
              >
                <div style={uc.reverse ? { direction: "ltr" } : undefined}>
                  <div
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium mb-6 ${uc.badgeColor}`}
                  >
                    {uc.badge}
                  </div>

                  <h2 className="font-display text-3xl sm:text-4xl lg:text-[44px] text-white leading-[1.2] mb-6">
                    {uc.title}{" "}
                    <span className="bg-gradient-to-r from-brand-green to-accent-teal bg-clip-text text-transparent">
                      {uc.titleAccent}
                    </span>
                  </h2>

                  <p className="text-white/50 text-base sm:text-lg leading-relaxed max-w-lg mb-8">
                    {uc.description}
                  </p>

                  {/* Feature bullets */}
                  <div className="space-y-3">
                    {getFeatureBullets(uc.mockup).map((bullet, j) => (
                      <div key={j} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-brand-green/15 flex items-center justify-center mt-0.5 shrink-0">
                          <svg className="w-3 h-3 text-brand-green" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-sm text-white/40">{bullet}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </AnimatedSection>

              {/* Mockup column */}
              <AnimatedSection
                direction={uc.reverse ? "left" : "right"}
                delay={0.15}
              >
                <div style={uc.reverse ? { direction: "ltr" } : undefined}>
                  <FloatingElement duration={8} distance={6} delay={i * 0.5}>
                    <ProductMockup type={uc.mockup} />
                  </FloatingElement>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </div>
      ))}
    </section>
  )
}

/* ── Feature bullets per use case ──────────────────── */

function getFeatureBullets(type: "screentime" | "content" | "enforcement"): string[] {
  switch (type) {
    case "screentime":
      return [
        "Daily limits, bedtimes, and downtime windows",
        "Per-app and per-category time budgets",
        "Automatic scheduling across all devices",
      ]
    case "content":
      return [
        "5 rating systems mapped automatically",
        "Per-platform content restrictions",
        "Safe search and explicit content blocking",
      ]
    case "enforcement":
      return [
        `Real-time status across ${PLATFORM_STATS.marketingTotal} platforms`,
        "Legislative compliance tracking (KOSA, COPPA, EU DSA)",
        "Instant failure alerts with automatic retry",
      ]
  }
}

/* ── Product Mockup Components ──────────────────────── */

function ProductMockup({ type }: { type: "screentime" | "content" | "enforcement" }) {
  return (
    <div className="relative">
      {/* Glow behind card */}
      <div className="absolute -inset-4 bg-gradient-to-br from-brand-green/10 via-accent-teal/5 to-transparent rounded-3xl blur-2xl" />

      {/* Glass card wrapper */}
      <div
        className="relative bg-white/[0.05] backdrop-blur-xl rounded-2xl border border-white/[0.08] overflow-hidden"
        style={{
          transform: "perspective(1200px) rotateY(-2deg) rotateX(1deg)",
        }}
      >
        {type === "screentime" && <ScreenTimeMockup />}
        {type === "content" && <ContentFilterMockup />}
        {type === "enforcement" && <EnforcementMockup />}
      </div>
    </div>
  )
}

/* ── Screen Time Mockup ──────────────────────────────── */

function ScreenTimeMockup() {
  const apps = [
    { name: "YouTube", time: "25m", percent: 50, color: "bg-red-500" },
    { name: "Roblox", time: "15m", percent: 30, color: "bg-blue-500" },
    { name: "Safari", time: "12m", percent: 24, color: "bg-sky-400" },
    { name: "Netflix", time: "8m", percent: 16, color: "bg-red-600" },
    { name: "TikTok", time: "0m", percent: 0, color: "bg-white/10" },
  ]

  return (
    <div className="p-6 sm:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs text-white/40 mb-0.5">Daily Usage</p>
          <p className="text-2xl font-bold text-white">1h 00m <span className="text-sm font-normal text-white/40">/ 2h limit</span></p>
        </div>
        {/* Circular progress */}
        <div className="relative w-14 h-14">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 40 40">
            <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
            <circle cx="20" cy="20" r="16" fill="none" stroke="hsl(var(--brand-green))" strokeWidth="3" strokeDasharray={`${50 * 1.005} 100.53`} strokeLinecap="round" />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">50%</span>
        </div>
      </div>

      {/* App bars */}
      <div className="space-y-3">
        {apps.map((app) => (
          <div key={app.name} className="flex items-center gap-3">
            <span className="text-xs text-white/40 w-14 shrink-0">{app.name}</span>
            <div className="flex-1 h-2.5 bg-white/[0.06] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${app.percent === 0 ? "bg-white/[0.06]" : app.color}`}
                style={{ width: `${Math.max(app.percent, 2)}%` }}
              />
            </div>
            <span className="text-xs font-medium text-white/70 w-14 text-right">
              {app.time}
            </span>
          </div>
        ))}
      </div>

      {/* Blocked label */}
      <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-red-400" />
        <span className="text-xs text-white/40">TikTok blocked — not in approved list</span>
      </div>
    </div>
  )
}

/* ── Content Filter Mockup ───────────────────────────── */

function ContentFilterMockup() {
  const platforms = ["Netflix", "YouTube", "Kindle", "Web"]
  const ratings = [
    { system: "MPAA", values: ["PG", "PG", "\u2014", "\u2014"] },
    { system: "TV", values: ["TV-Y7", "TV-Y7", "\u2014", "\u2014"] },
    { system: "ESRB", values: ["\u2014", "\u2014", "E10+", "\u2014"] },
    { system: "CSM", values: ["8+", "8+", "8+", "8+"] },
  ]

  return (
    <div className="p-6 sm:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-xs text-white/40 mb-0.5">Content Profile</p>
          <p className="text-lg font-bold text-white">Emma, age 8</p>
        </div>
        <div className="px-2.5 py-1 bg-brand-green/15 text-brand-green text-xs font-medium rounded-full">
          24 rules active
        </div>
      </div>

      {/* Rating matrix */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-white/[0.06]">
              <th className="text-left py-2 text-white/40 font-medium pr-4">System</th>
              {platforms.map((p) => (
                <th key={p} className="text-center py-2 text-white/40 font-medium px-2">{p}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ratings.map((row) => (
              <tr key={row.system} className="border-b border-white/[0.04]">
                <td className="py-2.5 font-medium text-white/70 pr-4">{row.system}</td>
                {row.values.map((val, j) => (
                  <td key={j} className="text-center py-2.5 px-2">
                    {val === "\u2014" ? (
                      <span className="text-white/20">{"\u2014"}</span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 bg-brand-green/15 text-brand-green font-medium rounded">
                        {val}
                      </span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center gap-2">
        <svg className="w-3.5 h-3.5 text-brand-green" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        <span className="text-xs text-white/40">Explicit content & safe search enforced</span>
      </div>
    </div>
  )
}

/* ── Enforcement Mockup ──────────────────────────────── */

function EnforcementMockup() {
  const platforms = [
    { name: "Streaming", status: "applied", rules: 6, time: "2s ago", laws: ["KOSA", "EU DSA"] },
    { name: "Devices", status: "applied", rules: 8, time: "2s ago", laws: ["COPPA"] },
    { name: "DNS Filter", status: "applied", rules: 5, time: "5s ago", laws: ["KOSA", "COPPA"] },
    { name: "Video", status: "applied", rules: 5, time: "3s ago", laws: ["KOSA", "COPPA", "DSA"] },
    { name: "Family Link", status: "pending", rules: 4, time: "retrying...", laws: ["COPPA"] },
  ]

  return (
    <div className="p-6 sm:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-xs text-white/40 mb-0.5">Enforcement Status</p>
          <p className="text-lg font-bold text-white">4 of 5 platforms</p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-brand-green/15 text-brand-green text-xs font-medium rounded-full">
          <div className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse" />
          Live
        </div>
      </div>

      {/* Platform list */}
      <div className="space-y-2.5">
        {platforms.map((p) => (
          <div
            key={p.name}
            className="flex items-center gap-2 sm:gap-2.5 p-2.5 sm:p-3 rounded-lg bg-white/[0.04]"
          >
            {/* Status dot */}
            <div
              className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full shrink-0 ${
                p.status === "applied"
                  ? "bg-brand-green"
                  : "bg-amber-400 animate-pulse"
              }`}
            />
            <span className="text-xs sm:text-sm font-medium text-white/80 w-16 sm:w-20 shrink-0 truncate">{p.name}</span>
            {/* Law badges */}
            <div className="flex gap-1 flex-wrap flex-1 min-w-0">
              {p.laws.map((law) => (
                <span
                  key={law}
                  className="text-[8px] sm:text-[9px] px-1 sm:px-1.5 py-0.5 rounded bg-brand-green/15 text-brand-green font-medium"
                >
                  {law}
                </span>
              ))}
            </div>
            <span className="text-[9px] sm:text-[10px] text-white/30 shrink-0 hidden sm:inline">{p.rules} rules</span>
            <span className={`text-[9px] sm:text-[10px] shrink-0 ${p.status === "applied" ? "text-brand-green" : "text-amber-500"}`}>
              {p.time}
            </span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-white/[0.06]">
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/40">28 of 28 rules applied</span>
          <span className="text-xs text-brand-green font-medium">All synced</span>
        </div>
        <div className="flex items-center gap-1.5 mt-2">
          <svg className="w-3.5 h-3.5 text-brand-green shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
          <span className="text-[10px] text-white/40">
            KOSA, COPPA 2.0, EU DSA compliance tracked
          </span>
        </div>
      </div>
    </div>
  )
}
