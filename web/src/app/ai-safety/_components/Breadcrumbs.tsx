"use client"

import Link from "next/link"
import { ChevronRight } from "lucide-react"

export interface BreadcrumbItem {
  label: string
  href?: string
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="flex items-center gap-1 text-xs mb-4" aria-label="Breadcrumb">
      {items.map((item, i) => {
        const isLast = i === items.length - 1
        return (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="w-3 h-3 text-white/30 flex-shrink-0" />}
            {isLast || !item.href ? (
              <span className={isLast ? "text-white/80" : "text-white/40"}>
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="text-white/40 hover:text-white/70 transition-colors"
              >
                {item.label}
              </Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}
