import Link from "next/link"
import { Shield, ArrowRight } from "lucide-react"
import { AnimatedSection } from "./shared/AnimatedSection"
import { WaveTexture } from "./shared/WaveTexture"
import { GradientMesh } from "./shared/GradientMesh"
import { PhosraBurst } from "./shared/PhosraBurst"

interface PlatformSummary {
  id: string
  name: string
  grade: string
}

const GRADE_COLORS: Record<string, string> = {
  "A+": "text-emerald-400 border-emerald-400/30 bg-emerald-400/10",
  A: "text-emerald-400 border-emerald-400/30 bg-emerald-400/10",
  "A-": "text-emerald-400 border-emerald-400/30 bg-emerald-400/10",
  "B+": "text-green-400 border-green-400/30 bg-green-400/10",
  B: "text-green-400 border-green-400/30 bg-green-400/10",
  "B-": "text-yellow-400 border-yellow-400/30 bg-yellow-400/10",
  "C+": "text-yellow-400 border-yellow-400/30 bg-yellow-400/10",
  C: "text-orange-400 border-orange-400/30 bg-orange-400/10",
  "C-": "text-orange-400 border-orange-400/30 bg-orange-400/10",
  D: "text-red-400 border-red-400/30 bg-red-400/10",
  F: "text-red-500 border-red-500/30 bg-red-500/10",
}

const RESEARCH_DIMENSIONS = [
  "Explicit Content",
  "Self-Harm Response",
  "Predatory Patterns",
  "Dangerous Activities",
  "Emotional Manipulation",
  "Academic Integrity",
  "Age-Appropriate Filtering",
]

function getGradeColor(grade: string) {
  return GRADE_COLORS[grade] || "text-white/60 border-white/20 bg-white/5"
}

export function AISafetyCallout({ platforms }: { platforms: PlatformSummary[] }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#1A0D2E] via-[#0D1B2A] to-[#0A2F2F]">
      <WaveTexture colorStart="#7B5CB8" colorEnd="#00D47E" opacity={0.08} />
      <GradientMesh colors={["#7B5CB8", "#00D47E", "#26A8C9"]} />

      <div className="absolute left-[-10%] bottom-[-15%]">
        <PhosraBurst size={500} color="#7B5CB8" opacity={0.05} animate />
      </div>

      <div className="relative max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-20 sm:py-28">
        {/* Header */}
        <AnimatedSection>
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.06] border border-white/[0.08] mb-6">
              <Shield className="w-3.5 h-3.5 text-accent-purple" />
              <span className="text-xs text-white/60 font-medium">AI Safety Research</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight mb-4">
              How safe are AI chatbots{" "}
              <span className="bg-gradient-to-r from-[#7B5CB8] to-[#00D47E] bg-clip-text text-transparent">
                for kids?
              </span>
            </h2>
            <p className="text-lg text-white/40 max-w-2xl mx-auto">
              We tested 8 major platforms across 7 safety dimensions with 40 adversarial prompts.
              Every result is published in full.
            </p>
          </div>
        </AnimatedSection>

        {/* Platform grade cards */}
        <AnimatedSection delay={0.15}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-12 max-w-3xl mx-auto">
            {platforms.map((platform) => (
              <Link
                key={platform.id}
                href={`/research/ai-chatbots/${platform.id}`}
                className="group flex flex-col items-center gap-2 p-4 sm:p-5 rounded-lg bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] hover:border-white/[0.12] transition-all"
              >
                <span
                  className={`text-2xl sm:text-3xl font-bold tabular-nums px-3 py-1 rounded border ${getGradeColor(platform.grade)}`}
                >
                  {platform.grade}
                </span>
                <span className="text-xs sm:text-sm text-white/50 font-medium group-hover:text-white/70 transition-colors text-center">
                  {platform.name}
                </span>
              </Link>
            ))}
          </div>
        </AnimatedSection>

        {/* Research dimensions */}
        <AnimatedSection delay={0.25}>
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {RESEARCH_DIMENSIONS.map((dim) => (
              <span
                key={dim}
                className="text-xs text-white/35 px-3 py-1.5 rounded-full border border-white/[0.06] bg-white/[0.02]"
              >
                {dim}
              </span>
            ))}
          </div>
        </AnimatedSection>

        {/* CTAs */}
        <AnimatedSection delay={0.35}>
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
            <Link
              href="/research/ai-chatbots"
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-3.5 bg-brand-green text-foreground text-sm font-semibold rounded-sm hover:opacity-90 transition hover:shadow-[0_0_30px_-6px_rgba(0,212,126,0.4)]"
            >
              Explore the Research
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/research/ai-chatbots#compare"
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-3.5 border border-white/20 text-white text-sm font-semibold rounded-sm hover:bg-white/5 hover:border-white/30 transition"
            >
              Compare Platforms
            </Link>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
