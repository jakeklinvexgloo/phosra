"use client"

import {
  LayoutDashboard,
  ShieldCheck,
  Star,
  Users,
  Code2,
  Camera,
  Plug,
  Map,
  AlertTriangle,
  type LucideIcon,
} from "lucide-react"

export interface SectionDef {
  id: string
  label: string
  icon: LucideIcon
}

export const SECTIONS: SectionDef[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "capabilities", label: "Capabilities", icon: ShieldCheck },
  { id: "ratings", label: "Ratings", icon: Star },
  { id: "account-structure", label: "Account Structure", icon: Users },
  { id: "api-technical", label: "API & Technical", icon: Code2 },
  { id: "screenshots", label: "Screenshots", icon: Camera },
  { id: "phosra-integration", label: "Phosra Integration", icon: Plug },
  { id: "adapter-roadmap", label: "Adapter Roadmap", icon: Map },
  { id: "risk-tos", label: "Risk & ToS", icon: AlertTriangle },
]

interface SectionNavProps {
  activeSection: string
}

export function SectionNav({ activeSection }: SectionNavProps) {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  return (
    <>
      {/* Desktop: sticky sidebar */}
      <nav className="hidden lg:block sticky top-20 self-start space-y-0.5">
        <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-3">
          Sections
        </div>
        {SECTIONS.map((s) => {
          const active = activeSection === s.id
          return (
            <button
              key={s.id}
              onClick={() => scrollTo(s.id)}
              className={`flex items-center gap-2 w-full px-3 py-1.5 rounded-md text-left text-sm transition-colors ${
                active
                  ? "text-brand-green font-medium border-l-2 border-brand-green bg-muted/40"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
              }`}
              style={
                active
                  ? { borderLeftColor: "hsl(var(--brand-green))" }
                  : undefined
              }
            >
              <s.icon className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{s.label}</span>
            </button>
          )
        })}
      </nav>

      {/* Mobile: horizontal scrollable pills */}
      <nav className="lg:hidden flex gap-1.5 overflow-x-auto no-scrollbar pb-2 -mx-1 px-1">
        {SECTIONS.map((s) => {
          const active = activeSection === s.id
          return (
            <button
              key={s.id}
              onClick={() => scrollTo(s.id)}
              className={`flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex-shrink-0 ${
                active
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              <s.icon className="w-3 h-3" />
              {s.label}
            </button>
          )
        })}
      </nav>
    </>
  )
}
