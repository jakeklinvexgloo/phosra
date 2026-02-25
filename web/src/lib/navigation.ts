import { Home, Zap, Globe, Shield, Users, Settings, Rocket, LayoutDashboard, Send, Newspaper, Bot, Bell, Mail, Contact, CalendarDays, Mic, Monitor, DollarSign, Code2, Key, BarChart3, Megaphone } from "lucide-react"
import type { LucideIcon } from "lucide-react"

export interface NavItem {
  href: string
  label: string
  icon: LucideIcon
  exact?: boolean
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
  {
    label: "Developer",
    items: [
      { href: "/dashboard/developers", label: "Overview", icon: Code2, exact: true },
      { href: "/dashboard/developers/keys", label: "API Keys", icon: Key },
      { href: "/dashboard/developers/usage", label: "Usage", icon: BarChart3 },
    ],
  },
]

/** Admin-only navigation — only rendered when user.is_admin is true. */
export const adminNavGroups: NavGroup[] = [
  {
    label: "Admin",
    items: [
      { href: "/dashboard/admin", label: "Command Center", icon: LayoutDashboard, exact: true },
      { href: "/dashboard/admin/outreach", label: "Outreach", icon: Send },
      { href: "/dashboard/admin/news", label: "News Feed", icon: Newspaper },
      { href: "/dashboard/admin/press", label: "Press Center", icon: Megaphone },
      { href: "/dashboard/admin/workers", label: "Workers", icon: Bot },
      { href: "/dashboard/admin/compliance-alerts", label: "Alerts", icon: Bell },
      { href: "/dashboard/admin/fundraise", label: "Fundraise", icon: DollarSign },
      { href: "/dashboard/admin/pitch-coach", label: "Pitch Coach", icon: Mic },
      { href: "/dashboard/admin/provider-sandbox", label: "Provider Sandbox", icon: Monitor },
    ],
  },
  {
    label: "Google Workspace",
    items: [
      { href: "/dashboard/admin/gmail", label: "Gmail", icon: Mail },
      { href: "/dashboard/admin/contacts", label: "Contacts", icon: Contact },
      { href: "/dashboard/admin/calendar", label: "Calendar", icon: CalendarDays },
    ],
  },
]

/** Flatten all nav items for search */
export function getAllNavItems(includeAdmin = false): NavItem[] {
  const groups = includeAdmin ? [...navGroups, ...adminNavGroups] : navGroups
  return groups.flatMap((g) => g.items)
}
