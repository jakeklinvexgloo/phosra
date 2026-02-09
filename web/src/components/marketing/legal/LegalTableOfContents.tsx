"use client"

import { useState, useEffect } from "react"

interface LegalTOCProps {
  sections: { id: string; title: string }[]
}

export function LegalTableOfContents({ sections }: LegalTOCProps) {
  const [activeId, setActiveId] = useState<string>(sections[0]?.id ?? "")

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        }
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0 }
    )

    for (const section of sections) {
      const el = document.getElementById(section.id)
      if (el) observer.observe(el)
    }

    return () => observer.disconnect()
  }, [sections])

  function scrollTo(id: string) {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <>
      {/* Desktop — sticky sidebar */}
      <nav className="hidden lg:block sticky top-24 w-[200px] flex-shrink-0">
        <ul className="space-y-1">
          {sections.map((section) => {
            const isActive = activeId === section.id
            return (
              <li key={section.id}>
                <button
                  onClick={() => scrollTo(section.id)}
                  className={`block w-full text-left text-sm pl-3 py-1.5 transition-colors ${
                    isActive
                      ? "border-l-2 border-brand-green text-brand-green font-medium"
                      : "border-l border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {section.title}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Mobile — horizontal scroll bar */}
      <nav className="lg:hidden overflow-x-auto -mx-4 px-4 pb-4">
        <div className="flex gap-2">
          {sections.map((section) => {
            const isActive = activeId === section.id
            return (
              <button
                key={section.id}
                onClick={() => scrollTo(section.id)}
                className={`whitespace-nowrap text-sm px-3 py-1.5 rounded-full transition-colors flex-shrink-0 ${
                  isActive
                    ? "bg-brand-green/10 text-brand-green font-medium"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {section.title}
              </button>
            )
          })}
        </div>
      </nav>
    </>
  )
}
