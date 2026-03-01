import { Metadata } from "next"
import Link from "next/link"
import { loadAllChatbotResearch } from "@/lib/platform-research/loaders"
import { loadAllStreamingPlatforms } from "@/lib/streaming-research/loaders"

export const metadata: Metadata = {
  title: "Research Portal — Phosra",
  description:
    "Independent child safety research across AI chatbots and streaming platforms. Explore how major platforms protect children with our comprehensive testing methodology.",
  openGraph: {
    title: "Research Portal — Phosra",
    description:
      "Independent child safety research across AI chatbots and streaming platforms.",
  },
}

function gradeColor(grade: string): string {
  if (grade.startsWith("A")) return "text-emerald-500"
  if (grade.startsWith("B")) return "text-blue-500"
  if (grade.startsWith("C")) return "text-amber-500"
  if (grade.startsWith("D")) return "text-orange-500"
  if (grade === "F") return "text-red-500"
  return "text-muted-foreground"
}

function gradeBg(grade: string): string {
  if (grade.startsWith("A")) return "bg-emerald-100 dark:bg-emerald-900/30"
  if (grade.startsWith("B")) return "bg-blue-100 dark:bg-blue-900/30"
  if (grade.startsWith("C")) return "bg-amber-100 dark:bg-amber-900/30"
  if (grade.startsWith("D")) return "bg-orange-100 dark:bg-orange-900/30"
  if (grade === "F") return "bg-red-100 dark:bg-red-900/30"
  return "bg-muted"
}

export default async function ResearchHubPage() {
  const [chatbotPlatforms, streamingPlatforms] = await Promise.all([
    loadAllChatbotResearch(),
    loadAllStreamingPlatforms(),
  ])

  // Extract grade ranges
  const chatbotGrades = chatbotPlatforms
    .map((p) => p.chatbotData?.safetyTesting?.scorecard?.overallGrade)
    .filter((g): g is string => !!g)
  const streamingGrades = streamingPlatforms.map((p) => p.overallGrade)

  const chatbotGradeRange =
    chatbotGrades.length > 0
      ? `${chatbotGrades[chatbotGrades.length - 1]} - ${chatbotGrades[0]}`
      : "N/A"
  const streamingGradeRange =
    streamingGrades.length > 0
      ? `${streamingGrades[streamingGrades.length - 1]} - ${streamingGrades[0]}`
      : "N/A"

  const totalPlatforms = chatbotPlatforms.length + streamingPlatforms.length

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-background border-b border-border/40">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:py-28 text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-blue-400 mb-4">
            Independent Safety Research
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6">
            Research Portal
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-slate-300 leading-relaxed">
            Comprehensive, independent safety evaluations across {totalPlatforms} platforms.
            We test how AI chatbots and streaming services protect children using
            standardized methodologies and publish every result.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-8 text-sm text-slate-400">
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl font-bold text-white">{totalPlatforms}</span>
              <span>Platforms Tested</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl font-bold text-white">2</span>
              <span>Research Verticals</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl font-bold text-white">100%</span>
              <span>Transparent Results</span>
            </div>
          </div>
        </div>
      </section>

      {/* Research Verticals */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 text-center">
          Research Verticals
        </h2>
        <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
          Each vertical uses a specialized testing framework designed for its platform category.
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          {/* AI Chatbot Safety Card */}
          <Link
            href="/research/ai-chatbots"
            className="group relative rounded-xl border border-border bg-card p-8 transition-all hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/5"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground group-hover:text-blue-500 transition-colors">
                    AI Chatbot Safety
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {chatbotPlatforms.length} platforms tested
                  </p>
                </div>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-muted-foreground group-hover:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>

            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              How do ChatGPT, Claude, Gemini, and other AI chatbots protect minors?
              We test age verification, content safety, parental controls,
              emotional safety, and more across 40 standardized test prompts.
            </p>

            <div className="flex items-center gap-4 mb-4">
              <div className="text-sm text-muted-foreground">
                Grade range:{" "}
                <span className="font-semibold text-foreground">{chatbotGradeRange}</span>
              </div>
            </div>

            {/* Grade badges */}
            <div className="flex flex-wrap gap-2">
              {chatbotPlatforms.slice(0, 8).map((p) => {
                const grade = p.chatbotData?.safetyTesting?.scorecard?.overallGrade ?? "N/A"
                return (
                  <span
                    key={p.platformId}
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${gradeBg(grade)} ${gradeColor(grade)}`}
                  >
                    <span className="text-foreground/70">{p.platformName}</span>
                    <span className="font-bold">{grade}</span>
                  </span>
                )
              })}
            </div>

            <div className="mt-6 text-sm font-medium text-blue-500 group-hover:text-blue-400 transition-colors">
              Explore AI Chatbot Research &rarr;
            </div>
          </Link>

          {/* Streaming Content Safety Card */}
          <Link
            href="/research/streaming"
            className="group relative rounded-xl border border-border bg-card p-8 transition-all hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/5"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground group-hover:text-purple-500 transition-colors">
                    Streaming Content Safety
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {streamingPlatforms.length} platforms tested
                  </p>
                </div>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-muted-foreground group-hover:text-purple-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>

            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              Do Netflix, Peacock, and Prime Video effectively filter age-inappropriate content?
              We evaluate profile controls, maturity filters, search restrictions,
              and content access across 3 user profiles per platform.
            </p>

            <div className="flex items-center gap-4 mb-4">
              <div className="text-sm text-muted-foreground">
                Grade range:{" "}
                <span className="font-semibold text-foreground">{streamingGradeRange}</span>
              </div>
            </div>

            {/* Grade badges */}
            <div className="flex flex-wrap gap-2">
              {streamingPlatforms.map((p) => (
                <span
                  key={p.platformId}
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${gradeBg(p.overallGrade)} ${gradeColor(p.overallGrade)}`}
                >
                  <span className="text-foreground/70">{p.platformName}</span>
                  <span className="font-bold">{p.overallGrade}</span>
                </span>
              ))}
            </div>

            <div className="mt-6 text-sm font-medium text-purple-500 group-hover:text-purple-400 transition-colors">
              Explore Streaming Research &rarr;
            </div>
          </Link>
        </div>
      </section>

      {/* Cross-Portal CTA */}
      <section className="border-t border-border/40 bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-3">
            Cross-Portal Comparison
          </h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            Compare safety practices across both AI chatbots and streaming platforms
            to see which companies lead in child protection.
          </p>
          <Link
            href="/research/compare"
            className="inline-flex items-center gap-2 rounded-lg bg-foreground text-background px-6 py-3 text-sm font-medium transition-opacity hover:opacity-90"
          >
            View Cross-Portal Comparison
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>
    </>
  )
}
