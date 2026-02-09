import { Zap, Shield, Globe, Star, MessageSquare } from "lucide-react"

const FEATURES = [
  {
    icon: Zap,
    title: "Works With Your App",
    description: "Set your rules in Bark, Qustodio, Aura, or any Phosra-powered app. Phosra enforces them across every platform automatically.",
    color: "bg-amber-50 text-amber-600",
  },
  {
    icon: Shield,
    title: "35 Rule Categories",
    description: "From screen time limits to content filtering and social media controls — every aspect of child safety, standardized across platforms.",
    color: "bg-green-50 text-green-600",
  },
  {
    icon: Globe,
    title: "500+ Platforms Connected",
    description: "YouTube, TikTok, Roblox, Netflix, Android, Apple, and hundreds more. Your rules follow your kids wherever they go.",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: Star,
    title: "Always Up to Date on the Law",
    description: "KOSA, COPPA, EU DSA and 8 more child safety laws built in. When regulations change, your protections update automatically.",
    color: "bg-purple-50 text-purple-600",
  },
  {
    icon: MessageSquare,
    title: "AI Playground",
    description: "Describe what you want in plain English. The AI sets up your policies and connects your platforms in seconds.",
    color: "bg-rose-50 text-rose-600",
  },
]

export function Features() {
  return (
    <section id="features" className="py-16 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Everything your family needs, built into the apps you already use
          </h2>
          <p className="text-muted-foreground text-base max-w-2xl mx-auto">
            Phosra powers parental controls apps with universal enforcement, regulatory intelligence, and connections to every major platform.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.title}
                className="group plaid-card p-5 sm:p-8 hover:shadow-[rgba(18,18,18,0.14)_0px_12px_24px] transition-shadow duration-300"
              >
                <div className={`w-10 h-10 rounded-sm flex items-center justify-center mb-5 ${feature.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
