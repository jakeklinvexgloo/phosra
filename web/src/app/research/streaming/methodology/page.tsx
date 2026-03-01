import type { Metadata } from "next"
import Link from "next/link"
import {
  STREAMING_TEST_CATEGORIES,
  STREAMING_SCORE_LABELS,
  STREAMING_PLATFORM_IDS,
  STREAMING_PLATFORM_NAMES,
} from "@/lib/streaming-research/streaming-data-types"

export const metadata: Metadata = {
  title: "Testing Methodology — Streaming Content Safety — Phosra",
  description:
    "How Phosra tests streaming platform parental controls using browser automation to simulate how real children interact with streaming platforms.",
}

const GRADE_THRESHOLDS = [
  { grade: "A+", range: "95-100" },
  { grade: "A", range: "85-94" },
  { grade: "A-", range: "80-84" },
  { grade: "B+", range: "75-79" },
  { grade: "B", range: "70-74" },
  { grade: "B-", range: "65-69" },
  { grade: "C+", range: "60-64" },
  { grade: "C", range: "55-59" },
  { grade: "C-", range: "50-54" },
  { grade: "D+", range: "40-49" },
  { grade: "D", range: "30-39" },
  { grade: "F", range: "0-29" },
]

const SCORE_COLORS: Record<number, string> = {
  0: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  1: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  2: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  3: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  4: "bg-red-500/20 text-red-400 border-red-500/30",
}

export default function MethodologyPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 lg:px-8 py-12">
      {/* Hero */}
      <div className="mb-12">
        <h1 className="text-3xl font-display font-bold text-foreground tracking-tight">
          Testing Methodology
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Streaming Content Safety Framework v1.0
        </p>
      </div>

      <div className="prose prose-neutral dark:prose-invert max-w-none">
        {/* How We Test */}
        <section className="mb-12">
          <h2 className="text-2xl font-display font-semibold text-foreground mb-4">How We Test</h2>
          <p className="text-muted-foreground leading-relaxed">
            We use browser automation (Chrome and Playwright) to simulate how real children interact
            with streaming platforms. Rather than cataloging what parental controls exist, we test
            whether those controls actually work -- from the perspective of a determined child who
            wants to watch restricted content.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-3">
            Every test scenario models a realistic action a child might attempt: searching for a
            forbidden show, switching to an unrestricted profile, clicking a shared link, or trying
            to bypass a PIN. Tests are automated, timestamped, and evidence-backed with screenshots
            at each step.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-3">
            Our primary adversary model is the &ldquo;determined child&rdquo; -- a tech-literate
            child aged 10-14 who has unsupervised access to a shared device where the streaming
            platform is already logged in. They know how to search, browse, and switch profiles, but
            do not use developer tools or exploit technical vulnerabilities.
          </p>
        </section>

        {/* Test Categories */}
        <section className="mb-12">
          <h2 className="text-2xl font-display font-semibold text-foreground mb-4">Test Categories</h2>
          <p className="text-muted-foreground mb-6">
            Each platform is tested across 9 categories, each weighted by severity. Higher weights
            indicate more critical attack vectors.
          </p>
          <div className="grid gap-4 not-prose">
            {STREAMING_TEST_CATEGORIES.map((cat) => (
              <div
                key={cat.id}
                className="p-4 rounded-lg border border-border bg-muted/20"
              >
                <div className="flex items-center gap-3 mb-1.5">
                  <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                    {cat.id}
                  </span>
                  <h3 className="font-medium text-foreground">{cat.category}</h3>
                  <span className="ml-auto text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground font-mono">
                    Weight: {cat.weight}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{cat.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Scoring Rubric */}
        <section className="mb-12">
          <h2 className="text-2xl font-display font-semibold text-foreground mb-4">Scoring Rubric</h2>
          <p className="text-muted-foreground mb-6">
            Each test scenario yields a score from 0 (best) to 4 (worst). Lower scores indicate
            stronger parental controls.
          </p>
          <div className="overflow-x-auto not-prose">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Score</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Label</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Meaning</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { score: 0, meaning: "The platform completely blocks this attack vector. No restricted content is accessible." },
                  { score: 1, meaning: "The platform partially blocks access but leaks some information (e.g., content existence revealed)." },
                  { score: 2, meaning: "A soft barrier exists (e.g., a warning dialog) but can be bypassed with a single click." },
                  { score: 3, meaning: "No protection. The child can access restricted content with no barriers." },
                  { score: 4, meaning: "The platform actively facilitates access to restricted content (e.g., recommending mature content on a kids profile)." },
                ].map((row) => (
                  <tr key={row.score} className="border-b border-border/50">
                    <td className="px-4 py-2.5">
                      <span className={`inline-block px-2.5 py-1 rounded border text-xs font-bold ${SCORE_COLORS[row.score]}`}>
                        {row.score}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 font-medium text-foreground">
                      {STREAMING_SCORE_LABELS[row.score]}
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">{row.meaning}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Test Profiles */}
        <section className="mb-12">
          <h2 className="text-2xl font-display font-semibold text-foreground mb-4">Test Profiles</h2>
          <p className="text-muted-foreground mb-6">
            Each platform is tested from the perspective of three child profiles with different
            maturity restriction levels.
          </p>
          <div className="grid gap-4 not-prose">
            {[
              {
                id: "TestChild7",
                label: "Child (7)",
                type: "Kids profile",
                description:
                  "Simulates a 7-year-old on the most restricted Kids profile. Should only see TV-Y and G-rated content. This is the primary test target -- if a child can escape from here, the platform has a critical failure.",
              },
              {
                id: "TestChild12",
                label: "Child (12)",
                type: "Kids / age-restricted profile",
                description:
                  "Simulates a 12-year-old with TV-PG/PG restrictions. Tests whether pre-teen restrictions hold against searches for TV-MA content and profile switching attempts.",
              },
              {
                id: "TestTeen16",
                label: "Teen (16)",
                type: "Standard profile with restrictions",
                description:
                  "Simulates a 16-year-old with TV-14/PG-13 restrictions. Should block TV-MA, R, and NC-17 content. Tests whether teen profiles leak adult content through recommendations or direct URL access.",
              },
            ].map((profile) => (
              <div
                key={profile.id}
                className="p-4 rounded-lg border border-border bg-muted/20"
              >
                <div className="flex items-center gap-3 mb-1.5">
                  <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                    {profile.id}
                  </span>
                  <h3 className="font-medium text-foreground">{profile.label}</h3>
                  <span className="ml-auto text-xs text-muted-foreground">{profile.type}</span>
                </div>
                <p className="text-sm text-muted-foreground">{profile.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Grade Calculation */}
        <section className="mb-12">
          <h2 className="text-2xl font-display font-semibold text-foreground mb-4">Grade Calculation</h2>
          <p className="text-muted-foreground leading-relaxed">
            Each profile receives a letter grade (A+ through F) based on a three-step process:
          </p>
          <ol className="mt-4 space-y-3 text-muted-foreground">
            <li>
              <strong className="text-foreground">Weighted average:</strong> Each test score (0-4)
              is multiplied by its category weight. The weighted sum is divided by total weight to
              produce a weighted average (0.0 = perfect, 4.0 = worst).
            </li>
            <li>
              <strong className="text-foreground">Exponential penalty:</strong> The weighted average
              is normalized to 0-1 and raised to the power of 1.5, then mapped to a 0-100 scale.
              This penalizes platforms with several moderate failures more heavily than a single bad
              score.
            </li>
            <li>
              <strong className="text-foreground">Letter grade assignment:</strong> The penalized
              score maps to a letter grade via standard thresholds.
            </li>
          </ol>

          <div className="mt-6 overflow-x-auto not-prose">
            <table className="text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-3 py-2 font-medium text-muted-foreground">Grade</th>
                  <th className="text-left px-3 py-2 font-medium text-muted-foreground">Score Range</th>
                </tr>
              </thead>
              <tbody>
                {GRADE_THRESHOLDS.map((row) => (
                  <tr key={row.grade} className="border-b border-border/50">
                    <td className="px-3 py-1.5 font-medium text-foreground">{row.grade}</td>
                    <td className="px-3 py-1.5 text-muted-foreground">{row.range}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-muted-foreground mt-4">
            The platform&apos;s overall grade equals the <strong className="text-foreground">worst profile grade</strong>.
            A platform is only as safe as its weakest profile -- if the Kids profile gets a D but
            the Teen profile gets a B, the platform grade is D.
          </p>
        </section>

        {/* Critical Failure Overrides */}
        <section className="mb-12">
          <h2 className="text-2xl font-display font-semibold text-foreground mb-4">Critical Failure Overrides</h2>
          <p className="text-muted-foreground leading-relaxed">
            Certain test failures are so severe that they cap a profile&apos;s grade regardless of
            other scores. These are called Critical Failure Overrides (CFOs).
          </p>
          <div className="mt-4 p-4 rounded-lg border border-orange-500/30 bg-orange-500/10 not-prose">
            <h3 className="font-medium text-orange-400 mb-2">CFO-2: Zero-Auth Profile Escape</h3>
            <p className="text-sm text-muted-foreground">
              If a child on a Kids or restricted profile can switch to an unrestricted profile with
              zero authentication (no PIN, no password, no confirmation dialog), the profile&apos;s
              grade is capped at <strong className="text-orange-400">D</strong> regardless of how
              well other categories score. This override exists because profile escape negates all
              other parental controls -- it does not matter if search is filtered and
              recommendations are clean if the child can simply switch to an adult profile.
            </p>
          </div>
          <p className="text-muted-foreground mt-4">
            Grades affected by a CFO are marked with an asterisk (e.g., D*) in platform reports.
          </p>
        </section>

        {/* Platforms Tested */}
        <section className="mb-12">
          <h2 className="text-2xl font-display font-semibold text-foreground mb-4">Platforms Tested</h2>
          <p className="text-muted-foreground mb-4">
            Phase 1 of our streaming content safety research covers {STREAMING_PLATFORM_IDS.length}{" "}
            major streaming platforms:
          </p>
          <div className="flex flex-wrap gap-3 not-prose">
            {STREAMING_PLATFORM_IDS.map((id) => (
              <Link
                key={id}
                href={`/research/streaming/${id}`}
                className="px-4 py-2 rounded-lg border border-border bg-muted/20 text-foreground font-medium text-sm hover:border-brand-green/50 hover:bg-brand-green/5 transition-colors"
              >
                {STREAMING_PLATFORM_NAMES[id]}
              </Link>
            ))}
          </div>
          <p className="text-muted-foreground mt-4 text-sm">
            Additional platforms (Disney+, Max, Hulu, Paramount+, Apple TV+, YouTube) are planned
            for future phases.
          </p>
        </section>
      </div>
    </div>
  )
}
