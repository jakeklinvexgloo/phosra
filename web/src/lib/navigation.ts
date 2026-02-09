import { Home, Zap, BookOpen, MessageSquare, Globe, Shield, Users, Settings, Rocket } from "lucide-react"
import type { LucideIcon } from "lucide-react"

export interface NavItem {
  href: string
  label: string
  icon: LucideIcon
  exact?: boolean
  external?: boolean
}

export interface NavGroup {
  label?: string
  items: NavItem[]
}

export const navGroups: NavGroup[] = [
  {
    items: [
      { href: "/dashboard", label: "Home", icon: Home, exact: true },
      { href: "/dashboard/setup", label: "Quick Setup", icon: Zap },
      { href: "/docs", label: "API Docs", icon: BookOpen, external: true },
      { href: "/playground", label: "Playground", icon: MessageSquare, external: true },
    ],
  },
  {
    label: "Platform Compliance",
    items: [
      { href: "/dashboard/platforms", label: "Platforms", icon: Globe },
      { href: "/dashboard/enforcement", label: "Enforcement", icon: Shield },
    ],
  },
  {
    label: "Family Management",
    items: [
      { href: "/dashboard/children", label: "Children", icon: Users },
    ],
  },
  {
    label: "Settings & Account",
    items: [
      { href: "/dashboard/settings", label: "Settings", icon: Settings },
      { href: "/dashboard/deploy", label: "Deploy", icon: Rocket },
    ],
  },
]

/** Flatten all nav items for search */
export function getAllNavItems(): NavItem[] {
  return navGroups.flatMap((g) => g.items)
}
