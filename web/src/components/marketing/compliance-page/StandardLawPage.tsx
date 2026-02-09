"use client"

import Link from "next/link"
import { ArrowRight, BookOpen, Layers, Monitor, Terminal } from "lucide-react"
import { AnimatedSection } from "@/components/marketing/shared"
import { ComplianceHero } from "@/components/marketing/compliance-page/ComplianceHero"
import type { LawEntry } from "@/lib/compliance/types"

// ── Category display metadata ─────────────────────────────────
const CATEGORY_META: Record<
  string,
  { name: string; description: string; group: string }
> = {
  algo_feed_control: {
    name: "Algorithm Feed Control",
    description:
      "Disables personalized algorithmic feeds and switches to chronological or non-profiled content delivery.",
    group: "algorithmic",
  },
  addictive_design_control: {
    name: "Addictive Design Control",
    description:
      "Disables autoplay, infinite scroll, notification streaks, and other compulsive-use design patterns.",
    group: "algorithmic",
  },
  targeted_ad_block: {
    name: "Targeted Ad Block",
    description:
      "Blocks behavioral advertising, ad profiling, and retargeting for minor users across connected platforms.",
    group: "advertising",
  },
  data_deletion_request: {
    name: "Data Deletion Request",
    description:
      "Triggers data deletion workflows on connected platforms and enables full profile removal via API.",
    group: "privacy",
  },
  geolocation_opt_in: {
    name: "Geolocation Opt-In",
    description:
      "Ensures location tracking is disabled by default, requiring explicit parental authorization to enable.",
    group: "privacy",
  },
  notification_curfew: {
    name: "Notification Curfew",
    description:
      "Suppresses non-essential push notifications during configurable quiet hours (e.g., overnight).",
    group: "notifications",
  },
  usage_timer_notification: {
    name: "Usage Timer",
    description:
      "Sends configurable screen time alerts and enforces daily usage limits across platforms.",
    group: "notifications",
  },
  dm_restriction: {
    name: "DM Restriction",
    description:
      "Restricts direct messaging to approved contacts or friends only, blocking messages from strangers.",
    group: "access_control",
  },
  age_gate: {
    name: "Age Gate",
    description:
      "Enforces age verification requirements and restricts access to age-inappropriate content or features.",
    group: "access_control",
  },
  content_rating: {
    name: "Content Rating",
    description:
      "Applies content maturity ratings (MPAA, TV, ESRB, PEGI, CSM) to filter age-inappropriate media.",
    group: "content",
  },
  web_safesearch: {
    name: "Safe Search",
    description:
      "Enables safe search filters across search engines to block explicit content from results.",
    group: "content",
  },
  web_category_block: {
    name: "Web Category Block",
    description:
      "Blocks access to configurable website categories such as gambling, adult content, and violence.",
    group: "content",
  },
  web_filter_level: {
    name: "Web Filter Level",
    description:
      "Sets the overall web filtering strictness level from permissive to highly restrictive.",
    group: "content",
  },
  time_daily_limit: {
    name: "Daily Time Limit",
    description:
      "Enforces maximum daily screen time across platforms with configurable per-app or global limits.",
    group: "time",
  },
  time_scheduled_hours: {
    name: "Scheduled Hours",
    description:
      "Restricts platform access to specified time windows (e.g., after school, before bedtime).",
    group: "time",
  },
  privacy_data_sharing: {
    name: "Data Sharing Control",
    description:
      "Controls what personal data can be shared with third parties and platform partners.",
    group: "privacy",
  },
  monitoring_activity: {
    name: "Activity Monitoring",
    description:
      "Provides parental visibility into app usage, content accessed, and online activity patterns.",
    group: "monitoring",
  },
  social_media_min_age: {
    name: "Social Media Min Age",
    description:
      "Enforces minimum age requirements for social media platform access based on jurisdiction.",
    group: "access_control",
  },
  csam_reporting: {
    name: "CSAM Reporting",
    description:
      "Automates detection and reporting workflows for child sexual abuse material across platforms.",
    group: "reporting",
  },
  library_filter_compliance: {
    name: "Library Filter",
    description:
      "Implements content filtering for public library and educational institution compliance.",
    group: "content",
  },
  ai_minor_interaction: {
    name: "AI Minor Interaction",
    description:
      "Controls AI chatbot and generative AI interactions with minor users, enforcing safety guardrails.",
    group: "algorithmic",
  },
  image_rights_minor: {
    name: "Image Rights",
    description:
      "Protects minors' image rights by controlling photo sharing and facial recognition usage.",
    group: "privacy",
  },
}

const GROUP_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  algorithmic: {
    bg: "bg-purple-500/10",
    text: "text-purple-400",
    border: "border-purple-500/20",
  },
  notifications: {
    bg: "bg-rose-500/10",
    text: "text-rose-400",
    border: "border-rose-500/20",
  },
  advertising: {
    bg: "bg-green-500/10",
    text: "text-green-400",
    border: "border-green-500/20",
  },
  access_control: {
    bg: "bg-orange-500/10",
    text: "text-orange-400",
    border: "border-orange-500/20",
  },
  content: {
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    border: "border-blue-500/20",
  },
  privacy: {
    bg: "bg-teal-500/10",
    text: "text-teal-400",
    border: "border-teal-500/20",
  },
  time: {
    bg: "bg-yellow-500/10",
    text: "text-yellow-400",
    border: "border-yellow-500/20",
  },
  monitoring: {
    bg: "bg-indigo-500/10",
    text: "text-indigo-400",
    border: "border-indigo-500/20",
  },
  reporting: {
    bg: "bg-red-500/10",
    text: "text-red-400",
    border: "border-red-500/20",
  },
  other: {
    bg: "bg-slate-500/10",
    text: "text-slate-400",
    border: "border-slate-500/20",
  },
}

function getCategoryMeta(categoryId: string) {
  return (
    CATEGORY_META[categoryId] ?? {
      name: categoryId
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase()),
      description: `Enforces ${categoryId.replace(/_/g, " ")} rules across connected platforms.`,
      group: "other",
    }
  )
}

function getGroupColor(group: string) {
  return (
    GROUP_COLORS[group] ?? {
      bg: "bg-slate-500/10",
      text: "text-slate-400",
      border: "border-slate-500/20",
    }
  )
}

// ── Simple syntax coloring for MCP snippets ───────────────────
function colorizeSnippet(snippet: string) {
  return snippet.split("\n").map((line, i) => {
    // Comments
    if (line.trimStart().startsWith("//")) {
      return (
        <span key={i} className="text-emerald-400">
          {line}
          {"\n"}
        </span>
      )
    }
    // Result lines (arrows)
    if (line.trimStart().startsWith("\u2192")) {
      return (
        <span key={i} className="text-white/50">
          {line}
          {"\n"}
        </span>
      )
    }
    // Tool/input keywords
    if (line.trimStart().startsWith("tool:") || line.trimStart().startsWith("input:")) {
      const [keyword, ...rest] = line.split(":")
      return (
        <span key={i}>
          <span className="text-sky-400">{keyword}</span>
          <span className="text-white/70">:{rest.join(":")}</span>
          {"\n"}
        </span>
      )
    }
    // String values in quotes
    if (line.includes('"')) {
      const parts = line.split(/(".*?")/g)
      return (
        <span key={i}>
          {parts.map((part, j) =>
            part.startsWith('"') ? (
              <span key={j} className="text-amber-300">
                {part}
              </span>
            ) : (
              <span key={j} className="text-white/70">
                {part}
              </span>
            )
          )}
          {"\n"}
        </span>
      )
    }
    // Default
    return (
      <span key={i} className="text-white/70">
        {line}
        {"\n"}
      </span>
    )
  })
}

// ── Standard Law Page Component ───────────────────────────────

interface StandardLawPageProps {
  law: LawEntry
  stageColor: "enacted" | "passed" | "pending"
  relatedLaws: { id: string; name: string; href: string }[]
}

export function StandardLawPage({
  law,
  stageColor,
  relatedLaws,
}: StandardLawPageProps) {
  return (
    <div>
      {/* Hero */}
      <ComplianceHero
        lawName={law.fullName}
        shortName={law.shortName}
        jurisdiction={law.jurisdiction}
        stage={law.statusLabel}
        stageColor={stageColor}
        description={law.summary}
      />

      {/* Key Provisions */}
      <section className="max-w-5xl mx-auto px-4 sm:px-8 py-16 sm:py-20">
        <AnimatedSection>
          <div className="mb-10">
            <p className="text-brand-green text-sm font-semibold tracking-wider uppercase mb-3">
              Key Provisions
            </p>
            <h2 className="text-2xl sm:text-3xl font-display text-foreground">
              What {law.shortName} requires
            </h2>
          </div>
        </AnimatedSection>

        <div className="space-y-4">
          {law.keyProvisions.map((provision, i) => (
            <AnimatedSection key={i} delay={i * 0.06}>
              <div className="plaid-card flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-brand-green/10 flex items-center justify-center">
                  <span className="text-xs font-bold text-brand-green font-mono">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <BookOpen className="w-4 h-4 text-brand-green flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-foreground leading-relaxed">
                    {provision}
                  </p>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* Rule Categories Covered */}
      <section className="bg-muted/30 border-y border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-16 sm:py-20">
          <AnimatedSection>
            <div className="mb-10">
              <div className="flex items-center gap-2 mb-3">
                <Layers className="w-4 h-4 text-brand-green" />
                <p className="text-brand-green text-sm font-semibold tracking-wider uppercase">
                  Rule Categories Covered
                </p>
              </div>
              <h2 className="text-2xl sm:text-3xl font-display text-foreground">
                Phosra enforcement categories for {law.shortName}
              </h2>
            </div>
          </AnimatedSection>

          <div className="grid sm:grid-cols-2 gap-6">
            {law.ruleCategories.map((catId, i) => {
              const meta = getCategoryMeta(catId)
              const colors = getGroupColor(meta.group)
              return (
                <AnimatedSection key={catId} delay={i * 0.08}>
                  <div className="plaid-card h-full border-l-4 border-brand-green">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-foreground text-sm">
                        {meta.name}
                      </h3>
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${colors.bg} ${colors.text}`}
                      >
                        {meta.group.replace(/_/g, " ")}
                      </span>
                    </div>
                    <span className="inline-block text-[10px] font-mono bg-muted px-2 py-0.5 rounded mb-2">
                      {catId}
                    </span>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {meta.description}
                    </p>
                  </div>
                </AnimatedSection>
              )
            })}
          </div>
        </div>
      </section>

      {/* Platforms Affected */}
      <section className="max-w-5xl mx-auto px-4 sm:px-8 py-16 sm:py-20">
        <AnimatedSection>
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-3">
              <Monitor className="w-4 h-4 text-brand-green" />
              <p className="text-brand-green text-sm font-semibold tracking-wider uppercase">
                Platforms Affected
              </p>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display text-foreground">
              Platforms covered by {law.shortName}
            </h2>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.1}>
          <div className="flex flex-wrap gap-3">
            {law.platforms.map((platform) => (
              <span
                key={platform}
                className="inline-flex items-center px-4 py-2 rounded-full border border-border bg-card text-sm font-medium text-foreground"
              >
                {platform}
              </span>
            ))}
          </div>
        </AnimatedSection>

        {/* Additional metadata badges */}
        <AnimatedSection delay={0.2}>
          <div className="flex flex-wrap gap-3 mt-6">
            {law.ageThreshold && (
              <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-brand-green/10 text-brand-green text-xs font-medium">
                Age: {law.ageThreshold}
              </span>
            )}
            {law.penaltyRange && (
              <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-red-500/10 text-red-400 text-xs font-medium">
                Penalty: {law.penaltyRange}
              </span>
            )}
            {law.effectiveDate && (
              <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-400 text-xs font-medium">
                Effective: {law.effectiveDate}
              </span>
            )}
          </div>
        </AnimatedSection>
      </section>

      {/* MCP Enforcement Snippet */}
      <section className="bg-muted/30 border-y border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-16 sm:py-20">
          <AnimatedSection>
            <div className="mb-10">
              <div className="flex items-center gap-2 mb-3">
                <Terminal className="w-4 h-4 text-brand-green" />
                <p className="text-brand-green text-sm font-semibold tracking-wider uppercase">
                  MCP Enforcement
                </p>
              </div>
              <h2 className="text-2xl sm:text-3xl font-display text-foreground">
                Enforce {law.shortName} with a single API call
              </h2>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.1}>
            <div className="rounded-xl overflow-hidden border border-white/5">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-[#0D1B2A] border-b border-white/5">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                </div>
                <span className="text-[10px] text-white/30 font-mono ml-2">
                  mcp-enforcement
                </span>
              </div>
              <pre className="bg-[#0D1B2A] p-5 text-sm font-mono leading-relaxed overflow-x-auto">
                <code>{colorizeSnippet(law.mcpSnippet)}</code>
              </pre>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0D1B2A] via-[#0F2035] to-[#0A1628]">
        <div className="relative max-w-3xl mx-auto px-4 sm:px-8 py-16 sm:py-20 text-center">
          <AnimatedSection>
            <h2 className="text-2xl sm:text-3xl font-display text-white mb-4">
              Start building {law.shortName}-compliant features today
            </h2>
            <p className="text-white/60 mb-8 max-w-lg mx-auto">
              Phosra handles the complexity of multi-platform compliance so you
              can focus on building great products for families.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 bg-brand-green text-foreground px-6 py-3 rounded-full font-medium hover:shadow-[0_0_28px_-4px_rgba(0,212,126,0.5)] transition"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/docs"
                className="inline-flex items-center justify-center gap-2 border border-white/20 text-white px-6 py-3 rounded-full font-medium hover:bg-white/5 transition"
              >
                Read the Docs
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Related Laws */}
      {relatedLaws.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 sm:px-8 py-12 sm:py-16">
          <AnimatedSection>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              Related Legislation
            </h3>
            <div className="flex flex-wrap gap-3">
              {relatedLaws.map((related) => (
                <Link
                  key={related.id}
                  href={related.href}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card text-sm text-foreground hover:border-brand-green/30 transition-colors"
                >
                  {related.name}
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </AnimatedSection>
        </section>
      )}
    </div>
  )
}
