import { Metadata } from "next"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { AnimatedSection, WaveTexture, PhosraBurst } from "@/components/marketing/shared"
import { RESOURCES_DROPDOWN } from "@/lib/nav-config"

export const metadata: Metadata = {
  title: "Resources — Phosra",
  description:
    "Developer docs, API playground, blog, newsroom, brand assets, and more. Everything you need to build with and learn about Phosra.",
}

export default function ResourcesPage() {
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
                <span className="text-xs text-white/60">Resources</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-white leading-[1.1] mb-6">
                Build, learn,{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-green to-emerald-300">
                  get involved
                </span>
              </h1>
              <p className="text-lg text-white/60 leading-relaxed max-w-2xl">
                Developer documentation, API playground, engineering blog, press
                resources, and company information — everything you need to work
                with Phosra.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Sections from nav config */}
      {RESOURCES_DROPDOWN.sections.map((section, sectionIdx) => {
        const sectionDescriptions: Record<string, string> = {
          "For Builders": "APIs, documentation, and tools to integrate Phosra into your platform.",
          "For Everyone": "Stay up to date with engineering updates, press coverage, and media resources.",
          "Company": "Learn about our mission, team, and how to get in touch.",
        }

        return (
          <section
            key={section.title}
            className={sectionIdx % 2 === 0 ? "bg-background" : "bg-muted/30 border-y border-border"}
          >
            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
              <AnimatedSection direction="up">
                <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-2">
                  {section.title}
                </h2>
                <p className="text-muted-foreground mb-10 max-w-xl">
                  {sectionDescriptions[section.title] ?? ""}
                </p>
              </AnimatedSection>

              <div className={`grid grid-cols-1 sm:grid-cols-2 ${section.items.length >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"} gap-5`}>
                {section.items.map((item, i) => {
                  const Icon = item.icon
                  return (
                    <AnimatedSection key={item.href} direction="up" delay={i * 0.05}>
                      <Link href={item.href} className="group block h-full">
                        <div className="rounded-xl border border-border bg-card p-6 h-full transition-all hover:border-brand-green/30 hover:shadow-lg hover:shadow-brand-green/5 hover:-translate-y-1">
                          {Icon && (
                            <div className="w-11 h-11 rounded-xl bg-brand-green/10 flex items-center justify-center mb-4">
                              <Icon className="w-5 h-5 text-brand-green" />
                            </div>
                          )}
                          <h3 className="text-base font-semibold text-foreground group-hover:text-brand-green transition-colors mb-1.5">
                            {item.label}
                          </h3>
                          {item.description && (
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {item.description}
                            </p>
                          )}
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
        )
      })}

      {/* Featured Card */}
      {RESOURCES_DROPDOWN.featured && (
        <section className="bg-gradient-to-br from-[#0D1B2A] via-[#0F2035] to-[#0A1628] text-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
            <AnimatedSection direction="up">
              <div className="text-center max-w-2xl mx-auto">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-green/10 border border-brand-green/20 mb-6">
                  <span className="text-xs font-semibold text-brand-green">
                    {RESOURCES_DROPDOWN.featured.badge}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-display font-bold mb-4">
                  {RESOURCES_DROPDOWN.featured.title}
                </h2>
                <p className="text-white/60 mb-8">
                  {RESOURCES_DROPDOWN.featured.description}
                </p>
                <Link
                  href={RESOURCES_DROPDOWN.featured.href}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-brand-green text-white font-medium hover:bg-brand-green/90 transition-colors"
                >
                  {RESOURCES_DROPDOWN.featured.cta}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </AnimatedSection>
          </div>
        </section>
      )}
    </div>
  )
}
