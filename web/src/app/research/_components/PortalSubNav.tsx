"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"

interface Tab {
  label: string
  href: string
}

interface PortalSubNavProps {
  tabs: readonly Tab[]
  basePath: string
}

export function PortalSubNav({ tabs, basePath }: PortalSubNavProps) {
  const pathname = usePathname()
  const [visible, setVisible] = useState(true)
  const lastScrollY = useRef(0)
  const ticking = useRef(false)

  useEffect(() => {
    const THRESHOLD = 80

    function onScroll() {
      if (ticking.current) return
      ticking.current = true

      requestAnimationFrame(() => {
        const currentY = window.scrollY
        const delta = currentY - lastScrollY.current

        if (currentY < THRESHOLD) {
          setVisible(true)
        } else if (delta > 4) {
          setVisible(false)
        } else if (delta < -4) {
          setVisible(true)
        }

        lastScrollY.current = currentY
        ticking.current = false
      })
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <div
      className={`sticky top-[60px] z-40 transition-transform duration-200 ease-in-out ${
        visible ? "translate-y-0" : "-translate-y-[120px]"
      }`}
    >
      <nav
        aria-label="Portal sections"
        className="bg-background/90 backdrop-blur-[20px] saturate-[160%] border-b border-border/50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="flex items-center gap-1 overflow-x-auto scrollbar-none py-1.5"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {tabs.map((tab) => {
              const isActive =
                tab.href === basePath
                  ? pathname === basePath
                  : pathname.startsWith(tab.href)

              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`flex-shrink-0 flex items-center justify-center px-4 py-2 text-sm font-medium rounded-full min-h-[40px] whitespace-nowrap transition-all duration-150 ${
                    isActive
                      ? "bg-[#00D47E]/10 text-[#00D47E] font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                >
                  {tab.label}
                </Link>
              )
            })}
          </div>
        </div>
      </nav>
    </div>
  )
}
