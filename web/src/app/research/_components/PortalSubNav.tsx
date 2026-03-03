"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useRef, useState, useEffect, useLayoutEffect, useCallback } from "react"

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
  const containerRef = useRef<HTMLDivElement>(null)
  const tabRefs = useRef<Map<string, HTMLAnchorElement>>(new Map())
  const [indicator, setIndicator] = useState({ left: 0, width: 0 })
  const [mounted, setMounted] = useState(false)

  const activeIndex = tabs.findIndex((tab) =>
    tab.href === basePath
      ? pathname === basePath
      : pathname.startsWith(tab.href)
  )

  const measureActive = useCallback(() => {
    const activeTab = tabs[activeIndex]
    if (!activeTab) return
    const el = tabRefs.current.get(activeTab.href)
    const container = containerRef.current
    if (!el || !container) return

    const containerRect = container.getBoundingClientRect()
    const tabRect = el.getBoundingClientRect()
    setIndicator({
      left: tabRect.left - containerRect.left,
      width: tabRect.width,
    })
  }, [activeIndex, tabs])

  // Measure on mount + route change
  useLayoutEffect(() => {
    measureActive()
    setMounted(true)
  }, [measureActive])

  // Re-measure on resize
  useEffect(() => {
    window.addEventListener("resize", measureActive)
    return () => window.removeEventListener("resize", measureActive)
  }, [measureActive])

  // Scroll active tab into view
  useEffect(() => {
    const activeTab = tabs[activeIndex]
    if (!activeTab) return
    const el = tabRefs.current.get(activeTab.href)
    el?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" })
  }, [activeIndex, tabs])

  const setTabRef = useCallback(
    (href: string) => (el: HTMLAnchorElement | null) => {
      if (el) tabRefs.current.set(href, el)
      else tabRefs.current.delete(href)
    },
    []
  )

  return (
    <div className="sticky top-[60px] z-40 flex justify-center px-3 py-1.5 pointer-events-none -mb-12">
      <nav
        aria-label="Portal sections"
        className={[
          "h-9 rounded-full pointer-events-auto",
          "bg-[rgba(13,27,42,0.65)] backdrop-blur-[20px] saturate-[140%]",
          "border border-white/[0.08]",
          "shadow-[0_2px_8px_rgba(0,0,0,0.2),0_1px_2px_rgba(0,0,0,0.15)]",
          "max-w-[calc(100vw-1.5rem)] overflow-hidden",
        ].join(" ")}
      >
        <div
          ref={containerRef}
          className="relative flex items-center h-full px-1 overflow-x-auto scrollbar-none"
          style={{ WebkitOverflowScrolling: "touch" } as React.CSSProperties}
        >
          {/* Sliding active indicator — positioned relative to this container */}
          {activeIndex >= 0 && (
            <div
              className="absolute inset-y-[3px] rounded-full bg-white/[0.1]"
              style={{
                left: indicator.left,
                width: indicator.width,
                transition: mounted
                  ? "left 300ms cubic-bezier(0.32, 0.72, 0, 1), width 300ms cubic-bezier(0.32, 0.72, 0, 1)"
                  : "none",
              }}
            />
          )}

          {/* Tab items */}
          {tabs.map((tab) => {
            const isActive =
              tab.href === basePath
                ? pathname === basePath
                : pathname.startsWith(tab.href)

            return (
              <Link
                key={tab.href}
                ref={setTabRef(tab.href)}
                href={tab.href}
                className={[
                  "relative z-10 flex-shrink-0 px-3.5",
                  "text-[13px] font-medium rounded-full",
                  "whitespace-nowrap transition-colors duration-150",
                  "h-[30px] flex items-center justify-center",
                  isActive
                    ? "text-white font-semibold"
                    : "text-white/50 hover:text-white/80",
                ].join(" ")}
              >
                {tab.label}
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
