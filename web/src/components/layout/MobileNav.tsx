"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ChevronDown, LogOut, LayoutDashboard } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { NAV_ENTRIES, isDropdownActive } from "@/lib/nav-config"
import type { NavDropdown } from "@/lib/nav-config"

interface MobileNavProps {
  open: boolean
  onClose: () => void
  isAuthenticated: boolean
  displayName: string
  onSignOut: () => void
}

export function MobileNav({ open, onClose, isAuthenticated, displayName, onSignOut }: MobileNavProps) {
  const pathname = usePathname()
  const [expandedLabel, setExpandedLabel] = useState<string | null>(null)

  const toggleSection = (label: string) => {
    setExpandedLabel((prev) => (prev === label ? null : label))
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="lg:hidden fixed inset-x-0 top-[72px] z-40 bg-white/95 backdrop-blur-xl border-b border-black/[0.06] overflow-y-auto max-h-[calc(100dvh-72px)]"
        >
          <div className="px-5 py-4 space-y-1">
            {NAV_ENTRIES.map((entry) => {
              if (entry.type === "link") {
                const isActive = pathname.startsWith(entry.data.href)
                return (
                  <Link
                    key={entry.data.href}
                    href={entry.data.href}
                    onClick={onClose}
                    className={`block px-3 py-3 rounded-lg text-[15px] font-medium transition-colors ${
                      isActive ? "text-[#00D47E] bg-[#00D47E]/[0.06]" : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {entry.data.label}
                  </Link>
                )
              }

              const dropdown = entry.data as NavDropdown
              const isActive = isDropdownActive(dropdown, pathname)
              const isExpanded = expandedLabel === dropdown.label

              return (
                <div key={dropdown.label}>
                  <button
                    onClick={() => toggleSection(dropdown.label)}
                    className={`flex items-center justify-between w-full px-3 py-3 rounded-lg text-[15px] font-medium transition-colors ${
                      isActive ? "text-[#00D47E]" : "text-slate-700"
                    }`}
                  >
                    {dropdown.label}
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                    />
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.15 }}
                        className="overflow-hidden"
                      >
                        {dropdown.sections.map((section) => (
                          <div key={section.title} className="mb-2">
                            <div className="px-6 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              {section.title}
                            </div>
                            {section.items.map((item) => {
                              const Icon = item.icon
                              const itemActive = pathname.startsWith(item.href)
                              return (
                                <Link
                                  key={item.href}
                                  href={item.href}
                                  onClick={onClose}
                                  className={`flex items-center gap-3 pl-6 pr-3 py-2.5 rounded-lg text-sm transition-colors ${
                                    itemActive
                                      ? "text-[#00D47E] bg-[#00D47E]/[0.06] font-medium"
                                      : "text-slate-600 hover:bg-slate-50"
                                  }`}
                                >
                                  {Icon && <Icon className="w-4 h-4 text-[#00D47E] shrink-0" />}
                                  {item.label}
                                </Link>
                              )
                            })}
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}

            {/* Auth section */}
            <div className="pt-3 border-t border-slate-100 mt-3 space-y-1">
              {isAuthenticated ? (
                <>
                  {!pathname.startsWith("/dashboard") && (
                    <Link
                      href="/dashboard"
                      onClick={onClose}
                      className="flex items-center gap-2.5 px-3 py-3 rounded-lg text-[15px] font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      onClose()
                      onSignOut()
                    }}
                    className="flex items-center gap-2.5 w-full px-3 py-3 rounded-lg text-[15px] font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={onClose}
                    className="block px-3 py-3 rounded-lg text-[15px] font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/login"
                    onClick={onClose}
                    className="block text-center px-3 py-3 rounded-lg text-[15px] font-semibold bg-[#00D47E] text-slate-900"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
