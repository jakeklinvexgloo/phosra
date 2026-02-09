import { Shield, Globe, Zap, Users, BookOpen, Rocket } from "lucide-react"

export interface Scenario {
  id: string
  title: string
  description: string
  prompt: string
  icon: typeof Shield
}

export const SCENARIOS: Scenario[] = [
  {
    id: "protect-8yo",
    title: "Protect my 8-year-old",
    description: "Full setup: rules, platforms, and enforcement in one go",
    prompt:
      "I have an 8-year-old daughter named Emma. Set up her profile with age-appropriate parental controls, then push the rules to all connected platforms. Show me exactly what got configured on each platform — what she can and can't access on Netflix, YouTube, Xbox, and everything else.",
    icon: Shield,
  },
  {
    id: "platform-analysis",
    title: "Which platforms to connect?",
    description: "Analyze platforms and recommend connections for best coverage",
    prompt:
      "What platforms are available in Phosra? Which ones should I connect first to get the best rule coverage for my family's devices?",
    icon: Globe,
  },
  {
    id: "tune-rules",
    title: "Tune specific rules",
    description: "Adjust screen time while keeping content restrictions tight",
    prompt:
      "My son Noah is 14. I want to give him more screen time — 3 hours on weekdays and 5 on weekends — but keep content ratings strict at PG-13 and web filtering at moderate. Can you update his policy?",
    icon: Zap,
  },
  {
    id: "multi-child",
    title: "Set up both kids",
    description: "Configure and enforce rules for children of different ages",
    prompt:
      "I need to set up parental controls for two children: Emma (age 8) and Noah (age 14). Set them both up with age-appropriate defaults, push the rules to all platforms, and show me how their protections compare side by side.",
    icon: Users,
  },
  {
    id: "explain-blocking",
    title: "Why is this blocked?",
    description: "Understand the legislation behind specific controls",
    prompt:
      "My child's policy has 'addictive_design_control' enabled. Can you explain what exactly this blocks, which laws require it, and which platforms support enforcing it?",
    icon: BookOpen,
  },
  {
    id: "enforce-all",
    title: "Push rules everywhere",
    description: "Trigger enforcement and see per-platform results",
    prompt:
      "Push Emma's active policy to all connected platforms. Show me what happened on each platform — which rules were applied, what content is blocked, and what her experience will look like on each service.",
    icon: Rocket,
  },
]
