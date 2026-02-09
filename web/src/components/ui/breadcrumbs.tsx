"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

/** Map path segments to human-readable labels */
const segmentLabels: Record<string, string> = {
  dashboard: "Dashboard",
  children: "Children",
  settings: "Settings",
  docs: "API Docs",
  playground: "Playground",
  setup: "Quick Setup",
  platforms: "Platforms",
  deploy: "Deploy",
  enforcement: "Enforcement",
  policies: "Policies",
}

export function Breadcrumbs() {
  const pathname = usePathname()

  // Split path into segments, filter empty strings
  const segments = pathname.split("/").filter(Boolean)

  // Don't render breadcrumbs on the dashboard root
  if (segments.length <= 1) return null

  // Build breadcrumb items
  const items: { label: string; href: string; current: boolean }[] = []

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i]
    const href = "/" + segments.slice(0, i + 1).join("/")
    const isLast = i === segments.length - 1

    // Skip "dashboard" — it becomes "Home"
    if (i === 0 && segment === "dashboard") {
      items.push({ label: "Home", href: "/dashboard", current: isLast })
      continue
    }

    // Use label map, or title-case the segment, or keep dynamic IDs short
    const label =
      segmentLabels[segment] ||
      (segment.length > 20
        ? segment.slice(0, 8) + "..."
        : segment.charAt(0).toUpperCase() + segment.slice(1))

    items.push({ label, href, current: isLast })
  }

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm mb-6">
      {items.map((item, i) => (
        <span key={item.href} className="flex items-center gap-1.5">
          {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60" />}
          {item.current ? (
            <span className="text-foreground font-medium">{item.label}</span>
          ) : (
            <Link
              href={item.href}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  )
}
