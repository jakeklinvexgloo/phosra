import {
  LayoutDashboard,
  ShieldCheck,
  Shield,
  Star,
  Users,
  Code2,
  Camera,
  Plug,
  Map,
  AlertTriangle,
  Heart,
  BookOpen,
  MessageSquare,
  Database,
  UserCheck,
  Lock,
  type LucideIcon,
} from "lucide-react"

export type PlatformCategory =
  | "streaming"
  | "ai_chatbots"
  | "social_media"
  | "gaming"
  | "music"
  | "education"
  | "smart_devices"

export interface SectionDef {
  id: string
  label: string
  icon: LucideIcon
  categories: PlatformCategory[] | "all"
  defaultCollapsed?: boolean
}

export const SECTION_REGISTRY: SectionDef[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard, categories: "all" },
  { id: "safety-testing", label: "Safety Testing", icon: Shield, categories: ["ai_chatbots"] },
  { id: "capabilities", label: "Capabilities", icon: ShieldCheck, categories: "all" },
  { id: "ratings", label: "Ratings", icon: Star, categories: ["streaming", "gaming"] },
  { id: "age-verification", label: "Age Verification", icon: UserCheck, categories: ["ai_chatbots", "social_media", "gaming"] },
  { id: "parental-controls", label: "Parental Controls", icon: Lock, categories: ["ai_chatbots", "social_media"] },
  { id: "conversation-controls", label: "Conversation Controls", icon: MessageSquare, categories: ["ai_chatbots"] },
  { id: "emotional-safety", label: "Emotional Safety", icon: Heart, categories: ["ai_chatbots"] },
  { id: "academic-integrity", label: "Academic Integrity", icon: BookOpen, categories: ["ai_chatbots"] },
  { id: "account-structure", label: "Account Structure", icon: Users, categories: "all" },
  { id: "privacy-data", label: "Privacy & Data", icon: Database, categories: ["ai_chatbots", "social_media"] },
  { id: "api-technical", label: "API & Technical", icon: Code2, categories: "all" },
  { id: "screenshots", label: "Screenshots", icon: Camera, categories: "all" },
  { id: "phosra-integration", label: "Phosra Integration", icon: Plug, categories: "all" },
  { id: "adapter-roadmap", label: "Adapter Roadmap", icon: Map, categories: "all" },
  { id: "risk-tos", label: "Risk & ToS", icon: AlertTriangle, categories: "all", defaultCollapsed: true },
]

export function getSectionsForCategory(category: string): SectionDef[] {
  return SECTION_REGISTRY.filter(
    (s) => s.categories === "all" || s.categories.includes(category as PlatformCategory)
  )
}
