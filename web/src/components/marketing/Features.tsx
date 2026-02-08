import { Zap, Shield, Globe, Star, MessageSquare } from "lucide-react"

const FEATURES = [
  {
    icon: Zap,
    title: "Quick Setup",
    description: "One API call creates a family, adds a child, and generates 24 age-appropriate rules automatically.",
    color: "bg-amber-50 text-amber-600",
  },
  {
    icon: Shield,
    title: "35 Rule Categories",
    description: "From screen time limits to algorithmic safety controls — every aspect of child safety, defined as policy.",
    color: "bg-green-50 text-green-600",
  },
  {
    icon: Globe,
    title: "15 Platform Adapters",
    description: "Push rules to NextDNS, Android, Apple, Microsoft, and more. Connect once, enforce everywhere.",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: Star,
    title: "Age-Aware Ratings",
    description: "Automatic age-to-rating mapping across MPAA, TV Parental, ESRB, PEGI, and CSM systems.",
    color: "bg-purple-50 text-purple-600",
  },
  {
    icon: MessageSquare,
    title: "AI Playground",
    description: "Describe what you want in natural language. Watch the AI chain API calls in real-time.",
    color: "bg-rose-50 text-rose-600",
  },
]

export function Features() {
  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Everything you need to protect your family
          </h2>
          <p className="text-muted-foreground text-base max-w-2xl mx-auto">
            A complete platform for defining, deploying, and monitoring parental controls across every device your children use.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.title}
                className="group plaid-card p-8 hover:shadow-[rgba(18,18,18,0.14)_0px_12px_24px] transition-shadow duration-300"
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
