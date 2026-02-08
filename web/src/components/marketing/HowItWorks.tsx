const STEPS = [
  {
    number: "1",
    title: "Define",
    description: "Create a family, add your children, set age. Phosra generates rules automatically based on age-appropriate defaults and legislative requirements.",
  },
  {
    number: "2",
    title: "Connect",
    description: "Link your platforms — NextDNS, Android, Apple, and more. One credential per platform, verified and encrypted with AES-256-GCM.",
  },
  {
    number: "3",
    title: "Enforce",
    description: "Push rules to every connected platform with one API call. Monitor compliance in real-time and get notified when enforcement fails.",
  },
]

export function HowItWorks() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Three steps to total protection
          </h2>
          <p className="text-muted-foreground text-base max-w-2xl mx-auto">
            From zero to fully enforced parental controls in minutes, not hours.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12 relative">
          {/* Connecting line (desktop only) */}
          <div className="hidden md:block absolute top-10 left-[16.67%] right-[16.67%] h-px bg-border" />

          {STEPS.map((step) => (
            <div key={step.number} className="relative text-center">
              {/* Number badge */}
              <div className="w-20 h-20 rounded-full bg-brand-green/10 flex items-center justify-center mx-auto mb-6 relative z-10">
                <span className="text-2xl font-bold text-brand-green">{step.number}</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
