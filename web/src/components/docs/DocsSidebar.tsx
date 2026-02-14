"use client"

import { useState, useEffect } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import { sections } from "@/lib/docs/sections"
import { ENDPOINTS, ENDPOINT_SECTIONS } from "@/lib/docs/endpoints"

// Map spec sections to their endpoint groups (where applicable)
const sectionEndpointMap: Record<string, string> = {
  auth: "Auth",
  families: "Families",
  members: "Family Members",
  policies: "Policies",
  "compliance-links": "Compliance Links",
  enforcement: "Enforcement",
  webhooks: "Webhooks",
  standards: "Community Standards",
  reports: "Reports",
}

interface SidebarSectionProps {
  id: string
  title: string
  activeId: string
  onNavigate: (id: string) => void
}

function SidebarSection({ id, title, activeId, onNavigate }: SidebarSectionProps) {
  const endpointGroup = sectionEndpointMap[id]
  const endpoints = endpointGroup
    ? ENDPOINTS.filter((e) => e.section === endpointGroup)
    : []
  const hasEndpoints = endpoints.length > 0
  const isActive = activeId === id
  const hasActiveEndpoint = endpoints.some((e) => activeId === e.id)
  const [expanded, setExpanded] = useState(hasActiveEndpoint)

  useEffect(() => {
    if (hasActiveEndpoint) setExpanded(true)
  }, [hasActiveEndpoint])

  return (
    <div>
      <button
        onClick={() => {
          onNavigate(id)
          if (hasEndpoints) setExpanded(!expanded)
        }}
        className={`w-full flex items-center gap-2 px-3 py-1.5 rounded text-[13px] transition-colors text-left ${
          isActive
            ? "text-foreground font-medium bg-muted"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
        }`}
      >
        {hasEndpoints && (
          <span className="flex-shrink-0">
            {expanded ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )}
          </span>
        )}
        <span className={hasEndpoints ? "" : "ml-5"}>{title}</span>
      </button>

      {/* Nested endpoints */}
      {hasEndpoints && expanded && (
        <div className="ml-5 mt-0.5 space-y-px">
          {endpoints.map((ep) => {
            const methodColors: Record<string, string> = {
              GET: "text-emerald-600",
              POST: "text-blue-600",
              PUT: "text-amber-600",
              DELETE: "text-red-600",
              PATCH: "text-purple-600",
            }
            return (
              <button
                key={ep.id}
                onClick={() => onNavigate(ep.id)}
                className={`w-full flex items-center gap-2 px-3 py-1 rounded text-[12px] font-mono transition-colors text-left ${
                  activeId === ep.id
                    ? "text-foreground bg-muted/70"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                }`}
              >
                <span className={`text-[10px] font-bold w-8 flex-shrink-0 ${methodColors[ep.method] || ""}`}>
                  {ep.method}
                </span>
                <span className="truncate">{ep.path}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function DocsSidebar() {
  const [activeId, setActiveId] = useState("")

  // Track active section via IntersectionObserver
  useEffect(() => {
    const allIds = [
      ...sections.map((s) => s.id),
      ...ENDPOINTS.map((e) => e.id),
    ]
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
            break
          }
        }
      },
      { rootMargin: "-120px 0px -60% 0px", threshold: 0 },
    )

    for (const id of allIds) {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    }

    return () => observer.disconnect()
  }, [])

  const handleNavigate = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" })
      setActiveId(id)
    }
  }

  return (
    <aside className="w-full lg:w-[240px] flex-shrink-0 lg:sticky lg:top-[120px] lg:max-h-[calc(100vh-120px)] overflow-y-auto">
      {/* Specification sections */}
      <div className="mb-6">
        <p className="px-3 mb-2 text-[11px] font-semibold text-muted-foreground tracking-widest uppercase">
          Specification
        </p>
        <div className="space-y-px">
          {sections.map((s) => (
            <SidebarSection
              key={s.id}
              id={s.id}
              title={s.title}
              activeId={activeId}
              onNavigate={handleNavigate}
            />
          ))}
        </div>
      </div>

      {/* API Reference sections (all endpoint groups not already shown) */}
      <div className="mb-6">
        <p className="px-3 mb-2 text-[11px] font-semibold text-muted-foreground tracking-widest uppercase">
          API Reference
        </p>
        <div className="space-y-px">
          {ENDPOINT_SECTIONS.filter(
            (s) => !Object.values(sectionEndpointMap).includes(s),
          ).map((section) => {
            const eps = ENDPOINTS.filter((e) => e.section === section)
            return (
              <div key={section}>
                <button
                  onClick={() => handleNavigate(eps[0]?.id || "")}
                  className="w-full flex items-center gap-2 px-3 py-1.5 rounded text-[13px] text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors text-left ml-5"
                >
                  {section}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Reference */}
      <div className="mb-6">
        <p className="px-3 mb-2 text-[11px] font-semibold text-muted-foreground tracking-widest uppercase">
          Reference
        </p>
        <div className="space-y-px">
          <button
            onClick={() => handleNavigate("policy-categories")}
            className={`w-full px-3 py-1.5 rounded text-[13px] ml-5 text-left transition-colors ${
              activeId === "policy-categories"
                ? "text-foreground font-medium bg-muted"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            45 Policy Categories
          </button>
          <button
            onClick={() => handleNavigate("ratings")}
            className={`w-full px-3 py-1.5 rounded text-[13px] ml-5 text-left transition-colors ${
              activeId === "ratings"
                ? "text-foreground font-medium bg-muted"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            Age-Rating Map
          </button>
          <button
            onClick={() => handleNavigate("legislation")}
            className={`w-full px-3 py-1.5 rounded text-[13px] ml-5 text-left transition-colors ${
              activeId === "legislation"
                ? "text-foreground font-medium bg-muted"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            Legislative Compliance
          </button>
        </div>
      </div>

      {/* Guides */}
      <div className="mb-6">
        <p className="px-3 mb-2 text-[11px] font-semibold text-muted-foreground tracking-widest uppercase">
          Guides
        </p>
        <div className="space-y-px">
          <button
            onClick={() => {
              window.dispatchEvent(new CustomEvent("docs-tab-switch", { detail: "recipes" }))
              handleNavigate("recipes")
            }}
            className={`w-full px-3 py-1.5 rounded text-[13px] ml-5 text-left transition-colors ${
              activeId === "recipes"
                ? "text-foreground font-medium bg-muted"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            Recipes
          </button>
        </div>
      </div>
    </aside>
  )
}
