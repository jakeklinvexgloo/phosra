import { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, Bot, Tv, BarChart3 } from "lucide-react"
import { AnimatedSection, WaveTexture, PhosraBurst } from "@/components/marketing/shared"
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
  if (grade.startsWith("A")) return "text-emerald-400"
  if (grade.startsWith("B")) return "text-blue-400"
  if (grade.startsWith("C")) return "text-amber-400"
  if (grade.startsWith("D")) return "text-orange-400"
  if (grade === "F") return "text-red-400"
  return "text-white/50"
}

function gradeBg(grade: string): string {
  if (grade.startsWith("A")) return "bg-emerald-500/15 border-emerald-500/20"
  if (grade.startsWith("B")) return "bg-blue-500/15 border-blue-500/20"
  if (grade.startsWith("C")) return "bg-amber-500/15 border-amber-500/20"
  if (grade.startsWith("D")) return "bg-orange-500/15 border-orange-500/20"
  if (grade === "F") return "bg-red-500/15 border-red-500/20"
  return "bg-white/5 border-white/10"
}

export default async function ResearchHubPage() {
  const [chatbotPlatforms, streamingPlatforms] = await Promise.all([
    loadAllChatbotResearch(),
    loadAllStreamingPlatforms(),
  ])

  const chatbotGrades = chatbotPlatforms
    .map((p) => p.chatbotData?.safetyTesting?.scorecard?.overallGrade)
    .filter((g): g is string => !!g)
  const streamingGrades = streamingPlatforms.map((p) => p.overallGrade)

  const chatbotGradeRange =
    chatbotGrades.length > 0
      ? `${chatbotGrades[chatbotGrades.length - 1]} – ${chatbotGrades[0]}`
      : "N/A"
  const streamingGradeRange =
    streamingGrades.length > 0
      ? `${streamingGrades[streamingGrades.length - 1]} – ${streamingGrades[0]}`
      : "N/A"

  const totalPlatforms = chatbotPlatforms.length + streamingPlatforms.length

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0D1B2A] via-[#0F2035] to-[#0A1628]">
        <div className="absolute inset-0">
          <WaveTexture />
        </div>
        <div className="absolute top-10 right-10 opacity-5">
          <PhosraBurst size={400} color="#ffffff" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-28">
          <AnimatedSection direction="up">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.08] border border-white/[0.12] mb-6">
                <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />
                <span className="text-xs text-white/60">Independent Safety Research</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-white leading-[1.1] mb-6">
                Research{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-green to-emerald-300">
                  Portal
                </span>
              </h1>
              <p className="text-lg text-white/60 leading-relaxed max-w-2xl">
                Comprehensive, independent safety evaluations across {totalPlatforms} platforms.
                We test how AI chatbots and streaming services protect children using
                standardized methodologies and publish every result.
              </p>
            </div>
          </AnimatedSection>

          {/* Stats */}
          <AnimatedSection direction="up" className="mt-14">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="rounded-lg px-4 py-3 text-center bg-white/[0.05] border border-white/[0.08]">
                <div className="text-2xl sm:text-3xl font-display font-bold text-white">{totalPlatforms}</div>
                <div className="text-xs text-white/50 mt-0.5">Platforms Tested</div>
              </div>
              <div className="rounded-lg px-4 py-3 text-center bg-white/[0.05] border border-white/[0.08]">
                <div className="text-2xl sm:text-3xl font-display font-bold text-white">2</div>
                <div className="text-xs text-white/50 mt-0.5">Research Verticals</div>
              </div>
              <div className="rounded-lg px-4 py-3 text-center bg-white/[0.05] border border-white/[0.08]">
                <div className="text-2xl sm:text-3xl font-display font-bold text-white">40+</div>
                <div className="text-xs text-white/50 mt-0.5">Test Prompts</div>
              </div>
              <div className="rounded-lg px-4 py-3 text-center bg-white/[0.05] border border-white/[0.08]">
                <div className="text-2xl sm:text-3xl font-display font-bold text-white">100%</div>
                <div className="text-xs text-white/50 mt-0.5">Transparent Results</div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Research Verticals */}
      <section className="bg-background">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
          <AnimatedSection direction="up">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-2">
              Research Verticals
            </h2>
            <p className="text-muted-foreground mb-10 max-w-xl">
              Each vertical uses a specialized testing framework designed for its platform category.
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 gap-6">
            {/* AI Chatbot Safety Card */}
            <AnimatedSection direction="up" delay={0}>
              <Link
                href="/research/ai-chatbots"
                className="group block h-full"
              >
                <div className="rounded-xl border border-border bg-card p-8 h-full transition-all hover:border-brand-green/30 hover:shadow-lg hover:shadow-brand-green/5 hover:-translate-y-1">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-brand-green/10 flex items-center justify-center">
                        <Bot className="w-6 h-6 text-brand-green" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-foreground group-hover:text-brand-green transition-colors">
                          AI Chatbot Safety
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {chatbotPlatforms.length} platforms tested
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-brand-green transition-colors" />
                  </div>

                  <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                    How do ChatGPT, Claude, Gemini, and other AI chatbots protect minors?
                    We test age verification, content safety, parental controls,
                    emotional safety, and more across 40 standardized test prompts.
                  </p>

                  <div className="text-sm text-muted-foreground mb-4">
                    Grade range:{" "}
                    <span className="font-semibold text-foreground">{chatbotGradeRange}</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {chatbotPlatforms.slice(0, 8).map((p) => {
                      const grade = p.chatbotData?.safetyTesting?.scorecard?.overallGrade ?? "N/A"
                      return (
                        <span
                          key={p.platformId}
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${gradeBg(grade)} ${gradeColor(grade)}`}
                        >
                          <span className="text-foreground/70">{p.platformName}</span>
                          <span className="font-bold">{grade}</span>
                        </span>
                      )
                    })}
                  </div>
                </div>
              </Link>
            </AnimatedSection>

            {/* Streaming Content Safety Card */}
            <AnimatedSection direction="up" delay={0.05}>
              <Link
                href="/research/streaming"
                className="group block h-full"
              >
                <div className="rounded-xl border border-border bg-card p-8 h-full transition-all hover:border-brand-green/30 hover:shadow-lg hover:shadow-brand-green/5 hover:-translate-y-1">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-brand-green/10 flex items-center justify-center">
                        <Tv className="w-6 h-6 text-brand-green" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-foreground group-hover:text-brand-green transition-colors">
                          Streaming Content Safety
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {streamingPlatforms.length} platforms tested
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-brand-green transition-colors" />
                  </div>

                  <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                    Do Netflix, Peacock, and Prime Video effectively filter age-inappropriate content?
                    We evaluate profile controls, maturity filters, search restrictions,
                    and content access across 3 user profiles per platform.
                  </p>

                  <div className="text-sm text-muted-foreground mb-4">
                    Grade range:{" "}
                    <span className="font-semibold text-foreground">{streamingGradeRange}</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {streamingPlatforms.map((p) => (
                      <span
                        key={p.platformId}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${gradeBg(p.overallGrade)} ${gradeColor(p.overallGrade)}`}
                      >
                        <span className="text-foreground/70">{p.platformName}</span>
                        <span className="font-bold">{p.overallGrade}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Methodology & Tools */}
      <section className="bg-muted/30 border-y border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
          <AnimatedSection direction="up">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-2">
              Methodology & Tools
            </h2>
            <p className="text-muted-foreground mb-10 max-w-xl">
              Transparent frameworks, test libraries, and actionable safety controls.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { label: "AI Testing Methodology", href: "/research/ai-chatbots/methodology", icon: Bot, description: "How we test chatbot safety" },
              { label: "Streaming Methodology", href: "/research/streaming/methodology", icon: Tv, description: "Content filtering test framework" },
              { label: "Compare Platforms", href: "/research/compare", icon: BarChart3, description: "Head-to-head safety comparisons" },
            ].map((item, i) => {
              const Icon = item.icon
              return (
                <AnimatedSection key={item.href} direction="up" delay={i * 0.05}>
                  <Link href={item.href} className="group block h-full">
                    <div className="rounded-xl border border-border bg-card p-6 h-full transition-all hover:border-brand-green/30 hover:shadow-lg hover:shadow-brand-green/5 hover:-translate-y-1">
                      <div className="w-11 h-11 rounded-xl bg-brand-green/10 flex items-center justify-center mb-4">
                        <Icon className="w-5 h-5 text-brand-green" />
                      </div>
                      <h3 className="text-base font-semibold text-foreground group-hover:text-brand-green transition-colors mb-1.5">
                        {item.label}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {item.description}
                      </p>
                      <div className="mt-4 flex items-center gap-1 text-xs font-medium text-brand-green opacity-0 group-hover:opacity-100 transition-opacity">
                        Explore <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                  </Link>
                </AnimatedSection>
              )
            })}
          </div>
        </div>
      </section>

      {/* Cross-Portal CTA */}
      <section className="bg-gradient-to-br from-[#0D1B2A] via-[#0F2035] to-[#0A1628] text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
          <AnimatedSection direction="up">
            <div className="text-center max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-green/10 border border-brand-green/20 mb-6">
                <span className="text-xs font-semibold text-brand-green">
                  Cross-Portal
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-bold mb-4">
                Compare Safety Across All Platforms
              </h2>
              <p className="text-white/60 mb-8">
                See how AI chatbots and streaming platforms stack up side-by-side
                in child protection practices.
              </p>
              <Link
                href="/research/compare"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-brand-green text-white font-medium hover:bg-brand-green/90 transition-colors"
              >
                View Comparison
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  )
}
