"use client"

import { useEffect, useState } from "react"

interface TOCItem {
  id: string
  label: string
}

interface ComplianceSidebarTOCProps {
  items: TOCItem[]
}

export function ComplianceSidebarTOC({ items }: ComplianceSidebarTOCProps) {
  const [activeId, setActiveId] = useState<string>("")

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 }
    )

    for (const item of items) {
      const el = document.getElementById(item.id)
      if (el) observer.observe(el)
    }

    return () => observer.disconnect()
  }, [items])

  return (
    <nav className="sticky top-20 hidden lg:block" aria-label="Table of contents">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        On this page
      </p>
      <ul className="space-y-1">
        {items.map((item) => {
          const isActive = activeId === item.id
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={`
                  block text-sm py-1 pl-3 border-l-2 transition-colors
                  ${
                    isActive
                      ? "text-brand-green font-semibold border-brand-green"
                      : "text-muted-foreground border-transparent hover:text-foreground hover:border-border"
                  }
                `}
              >
                {item.label}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
