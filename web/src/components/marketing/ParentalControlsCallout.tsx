import Link from "next/link"
import { Smartphone, ArrowRight } from "lucide-react"
import { AnimatedSection } from "./shared/AnimatedSection"

export function ParentalControlsCallout() {
  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <AnimatedSection>
          <div className="relative rounded-2xl border border-border bg-gradient-to-br from-muted/40 to-muted/10 p-8 sm:p-12 overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-10">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-brand-green/10 border border-brand-green/20 flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-brand-green" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg sm:text-xl font-display text-foreground mb-2">
                  Every parental control, one API
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
                  Compare 21+ parental control apps and built-in platform controls.
                  See what each one supports, how it integrates with Phosra, and manage
                  them all from a single dashboard.
                </p>
              </div>
              <Link
                href="/parental-controls"
                className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 bg-brand-green text-foreground text-sm font-semibold rounded-lg hover:shadow-[0_0_24px_-4px_rgba(0,212,126,0.5)] transition-all"
              >
                Browse Controls
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
