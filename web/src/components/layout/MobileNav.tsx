"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
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

const itemVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: 0.05 + i * 0.04, duration: 0.25, ease: [0.4, 0, 0.2, 1] },
  }),
  exit: { opacity: 0, x: -8, transition: { duration: 0.15 } },
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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          className="lg:hidden fixed inset-0 z-40 overflow-hidden"
        >
          {/* Dark ocean gradient background */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0D1B2A] via-[#0F2035] to-[#0A1628]" />
          <div className="absolute inset-0 bg-[rgba(13,27,42,0.6)] backdrop-blur-[24px] saturate-[140%]" />

          {/* Green accent line */}
          <div className="absolute top-0 left-[10%] right-[10%] h-[2px] rounded-full bg-gradient-to-r from-transparent via-[#00D47E]/50 to-transparent z-10" />

          {/* Scrollable content */}
          <div className="relative z-10 flex flex-col h-full pt-[72px]">
            <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4">
              <div className="space-y-1">
                {NAV_ENTRIES.map((entry, index) => {
                  if (entry.type === "link") {
                    const isActive = pathname.startsWith(entry.data.href)
                    return (
                      <motion.div
                        key={entry.data.href}
                        custom={index}
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                      >
                        <Link
                          href={entry.data.href}
                          onClick={onClose}
                          className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${
                            isActive
                              ? "bg-[#00D47E]/[0.10] border border-[#00D47E]/[0.15]"
                              : "hover:bg-white/[0.04] border border-transparent"
                          }`}
                        >
                          <span className={`text-[15px] font-semibold ${isActive ? "text-[#00D47E]" : "text-white/80"}`}>
                            {entry.data.label}
                          </span>
                        </Link>
                      </motion.div>
                    )
                  }

                  const dropdown = entry.data as NavDropdown
                  const isActive = isDropdownActive(dropdown, pathname)
                  const isExpanded = expandedLabel === dropdown.label

                  return (
                    <motion.div
                      key={dropdown.label}
                      custom={index}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    >
                      <button
                        onClick={() => toggleSection(dropdown.label)}
                        className={`flex items-center justify-between w-full px-4 py-3.5 rounded-xl transition-all ${
                          isActive || isExpanded
                            ? "bg-[#00D47E]/[0.10] border border-[#00D47E]/[0.15]"
                            : "hover:bg-white/[0.04] border border-transparent"
                        }`}
                      >
                        <span className={`text-[15px] font-semibold ${isActive ? "text-[#00D47E]" : "text-white/80"}`}>
                          {dropdown.label}
                        </span>
                        <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                          <ChevronDown className="w-4 h-4 text-white/30" />
                        </motion.div>
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                            className="overflow-hidden"
                          >
                            <div className="mt-1 ml-3 rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 space-y-3">
                              {dropdown.sections.map((section) => (
                                <div key={section.title}>
                                  <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-white/25 px-3 pb-1.5">
                                    {section.title}
                                  </div>
                                  <div className="space-y-0.5">
                                    {section.items.map((item) => {
                                      const Icon = item.icon
                                      const itemActive = pathname.startsWith(item.href)
                                      return (
                                        <Link
                                          key={item.href}
                                          href={item.href}
                                          onClick={onClose}
                                          className={`flex items-start gap-3 px-3 py-2.5 rounded-[10px] transition-colors ${
                                            itemActive
                                              ? "bg-[#00D47E]/[0.10] border border-[#00D47E]/[0.12]"
                                              : "hover:bg-white/[0.04] border border-transparent"
                                          }`}
                                        >
                                          {Icon && (
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                                              itemActive ? "bg-[#00D47E]/[0.15]" : "bg-[#00D47E]/[0.08]"
                                            }`}>
                                              <Icon className="w-4 h-4 text-[#00D47E]" />
                                            </div>
                                          )}
                                          <div className="min-w-0">
                                            <div className={`text-sm font-semibold leading-tight ${
                                              itemActive ? "text-[#00D47E]" : "text-white/80"
                                            }`}>
                                              {item.label}
                                            </div>
                                            {item.description && (
                                              <div className="text-[12px] mt-0.5 leading-snug text-white/30">
                                                {item.description}
                                              </div>
                                            )}
                                          </div>
                                        </Link>
                                      )
                                    })}
                                  </div>
                                </div>
                              ))}

                              {/* Featured card */}
                              {dropdown.featured && (
                                <Link
                                  href={dropdown.featured.href}
                                  onClick={onClose}
                                  className="block rounded-xl p-4 mt-1 bg-[#00D47E]/[0.06] border border-[#00D47E]/[0.10] transition-opacity hover:opacity-90"
                                >
                                  <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#00D47E] mb-1.5">
                                    {dropdown.featured.badge}
                                  </div>
                                  <div className="text-[13px] font-bold text-white/90">
                                    {dropdown.featured.title}
                                  </div>
                                  <div className="text-[11px] text-white/35 mt-1 leading-relaxed">
                                    {dropdown.featured.description}
                                  </div>
                                  <div className="text-[12px] font-semibold text-[#00D47E] mt-2">
                                    {dropdown.featured.cta}
                                  </div>
                                </Link>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )
                })}
              </div>

              {/* Separator */}
              <div className="my-4 mx-4 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

              {/* Auth section */}
              <div className="space-y-1">
                {isAuthenticated ? (
                  <>
                    <div className="flex items-center gap-3 px-4 py-3">
                      <div className="w-9 h-9 rounded-full bg-[#00D47E]/[0.15] flex items-center justify-center text-[#00D47E] text-sm font-semibold border border-[#00D47E]/[0.12]">
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-[14px] font-semibold text-white/80">{displayName}</div>
                        <div className="text-[11px] text-white/30">Signed in</div>
                      </div>
                    </div>
                    {!pathname.startsWith("/dashboard") && (
                      <Link
                        href="/dashboard"
                        onClick={onClose}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:bg-white/[0.04] transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-[#00D47E]" />
                        <span className="text-[15px] font-medium">Dashboard</span>
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        onClose()
                        onSignOut()
                      }}
                      className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-white/50 hover:text-white/70 hover:bg-white/[0.04] transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-[15px] font-medium">Sign out</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={onClose}
                      className="flex items-center justify-center px-4 py-3 rounded-xl text-[15px] font-medium text-white/60 hover:text-white/90 hover:bg-white/[0.04] border border-white/[0.06] transition-all"
                    >
                      Log in
                    </Link>
                    <Link
                      href="/login"
                      onClick={onClose}
                      className="block text-center py-3.5 rounded-full text-[15px] font-semibold bg-[#00D47E] text-slate-900 shadow-[0_0_30px_-4px_rgba(0,212,126,0.4)] active:scale-[0.98] transition-all"
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
