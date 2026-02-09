const STEPS = [
  {
    number: "1",
    title: "Set your rules",
    description: "Open your parental controls app — Bark, Qustodio, Aura, or any Phosra-powered app — and set age-appropriate rules for your child.",
  },
  {
    number: "2",
    title: "Phosra connects",
    description: "Behind the scenes, Phosra translates your rules into platform-specific settings and connects to every service your child uses.",
  },
  {
    number: "3",
    title: "Enforced everywhere",
    description: "Your rules are pushed to YouTube, TikTok, Roblox, Android, Apple, and more. Real-time monitoring ensures they stay enforced.",
  },
]

export function HowItWorks() {
  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            How Phosra works
          </h2>
          <p className="text-muted-foreground text-base max-w-2xl mx-auto">
            Your parental controls app handles the experience. Phosra handles the enforcement.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12 relative">
          {/* Connecting line (desktop only) */}
          <div className="hidden md:block absolute top-10 left-[16.67%] right-[16.67%] h-px bg-border" />

          {STEPS.map((step) => (
            <div key={step.number} className="relative text-center">
              {/* Number badge */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-brand-green/10 flex items-center justify-center mx-auto mb-4 sm:mb-6 relative z-10">
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
