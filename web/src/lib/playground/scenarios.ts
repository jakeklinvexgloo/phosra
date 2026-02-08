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
    description: "Set up age-appropriate rules for a young child",
    prompt:
      "I have an 8-year-old daughter named Emma. Help me set up age-appropriate parental controls for her. Explain what rules you're applying and why.",
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
    description: "Configure age-appropriate rules for children of different ages",
    prompt:
      "I need to set up parental controls for two children: Emma (age 8) and Noah (age 14). Each should get age-appropriate defaults. Show me how their rules compare.",
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
    description: "Trigger enforcement and inspect results per platform",
    prompt:
      "Push Emma's active policy to all connected platforms. Show me what happened on each platform — which rules were applied, skipped, or failed.",
    icon: Rocket,
  },
]
