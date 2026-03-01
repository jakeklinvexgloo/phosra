"use client"

import Link from "next/link"
import type { NavDropdown } from "@/lib/nav-config"

interface MegaMenuSectionedProps {
  dropdown: NavDropdown
  variant: "dark" | "light"
  onClose: () => void
}

export function MegaMenuSectioned({ dropdown, variant, onClose }: MegaMenuSectionedProps) {
  const isDark = variant === "dark"
  const cols = dropdown.columns ?? 2
  const hasFeatured = !!dropdown.featured

  // Build grid columns: N section cols + 1 featured col
  const featuredWidth = cols >= 3 ? "220px" : "240px"
  const gridCols = hasFeatured
    ? `repeat(${cols}, 1fr) ${featuredWidth}`
    : `repeat(${cols}, 1fr)`

  // Subgrid: calculate max items across sections so rows align across columns
  const maxItems = Math.max(...dropdown.sections.map((s) => s.items.length))
  const totalRows = 1 + maxItems // 1 header row + item rows

  return (
    <div
      className="grid gap-x-6 gap-y-0.5"
      style={{
        gridTemplateColumns: gridCols,
        gridTemplateRows: `auto repeat(${maxItems}, auto)`,
      }}
    >
      {dropdown.sections.map((section) => (
        <div
          key={section.title}
          className="grid"
          style={{
            gridRow: `span ${totalRows}`,
            gridTemplateRows: "subgrid",
          }}
        >
          {/* Section header — self-end so it sits above the first item */}
          <div
            className={`text-[11px] font-bold uppercase tracking-[0.08em] pb-2 self-end ${
              isDark ? "text-white/30" : "text-slate-400"
            }`}
          >
            {section.title}
          </div>

          {/* Items — each occupies one subgrid row, aligned across columns */}
          {section.items.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-start gap-3 px-3 py-2 rounded-[10px] transition-colors ${
                  isDark ? "hover:bg-white/[0.06]" : "hover:bg-black/[0.03]"
                }`}
              >
                {Icon && (
                  <div
                    className={`w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0 ${
                      isDark ? "bg-[#00D47E]/[0.12]" : "bg-[#00D47E]/[0.08]"
                    }`}
                  >
                    <Icon className="w-[18px] h-[18px] text-[#00D47E]" />
                  </div>
                )}
                <div className="min-w-0 py-0.5">
                  <div
                    className={`text-sm font-semibold leading-tight ${
                      isDark ? "text-white" : "text-slate-900"
                    }`}
                  >
                    {item.label}
                  </div>
                  {item.description && (
                    <div
                      className={`text-xs mt-0.5 leading-snug ${
                        isDark ? "text-white/35" : "text-slate-400"
                      }`}
                    >
                      {item.description}
                    </div>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      ))}

      {/* Featured Card — spans all rows */}
      {dropdown.featured && (
        <div style={{ gridRow: "1 / -1" }}>
          <Link
            href={dropdown.featured.href}
            onClick={onClose}
            className={`block rounded-xl p-5 h-full flex flex-col justify-between transition-opacity hover:opacity-90 ${
              isDark
                ? "bg-[#00D47E]/[0.08] border border-[#00D47E]/[0.12]"
                : "bg-gradient-to-br from-[#0D1B2A] to-[#0A2F2F]"
            }`}
          >
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#00D47E] mb-3">
                {dropdown.featured.badge}
              </div>
              <div className="text-base font-bold text-white">
                {dropdown.featured.title}
              </div>
              <div className="text-xs text-white/50 mt-2 leading-relaxed">
                {dropdown.featured.description}
              </div>
            </div>
            <div className="text-[13px] font-semibold text-[#00D47E] mt-4">
              {dropdown.featured.cta}
            </div>
          </Link>
        </div>
      )}
    </div>
  )
}
