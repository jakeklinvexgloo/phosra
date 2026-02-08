import Link from "next/link"

export function CTASection() {
  return (
    <section className="py-20 bg-brand-green">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
          Start protecting your family today
        </h2>
        <p className="text-foreground/70 text-base mb-10 max-w-lg mx-auto">
          Free for families. Pay only when you build.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/login"
            className="inline-flex items-center px-8 py-3.5 bg-foreground text-white text-sm font-semibold rounded-sm hover:opacity-90 transition"
          >
            Create Free Account
          </Link>
          <Link
            href="#"
            className="inline-flex items-center px-8 py-3.5 bg-white text-foreground text-sm font-semibold rounded-sm border border-foreground/10 hover:bg-white/90 transition"
          >
            Talk to Sales
          </Link>
        </div>
      </div>
    </section>
  )
}
