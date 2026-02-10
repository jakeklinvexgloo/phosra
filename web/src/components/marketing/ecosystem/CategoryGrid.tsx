"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence, useInView } from "framer-motion"
import { ChevronDown } from "lucide-react"
import type { PlatformCategory, PlatformEntry } from "../ecosystem-data"
import { PlatformIcon } from "./PlatformIcon"

interface CategoryGridProps {
  categories: PlatformCategory[]
  marqueeTargets?: PlatformEntry[]
}

const cardVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -8, scale: 0.97 },
}

function CategoryCard({ category }: { category: PlatformCategory }) {
  const [userToggled, setUserToggled] = useState<boolean | null>(null)
  const [isDesktop, setIsDesktop] = useState(true)

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 640)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  const defaultOpen = isDesktop
  const open = userToggled !== null ? userToggled : defaultOpen

  const accentBorder = category.accentClass.split(" ").find((c) => c.startsWith("border-")) ?? "border-emerald-400"
  const accentText = category.accentClass.split(" ")[0] ?? "text-emerald-600"
  const accentBg = category.accentClass.split(" ").find((c) => c.startsWith("bg-")) ?? "bg-emerald-50"

  return (
    <motion.div
      layout
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -2 }}
      className={`bg-white border border-border rounded-sm shadow-plaid-card hover:shadow-plaid-card-hover transition-shadow overflow-hidden border-l-[3px] ${accentBorder}`}
    >
      {/* Card header — clickable on mobile for accordion */}
      <button
        type="button"
        onClick={() => setUserToggled((prev) => !(prev !== null ? prev : defaultOpen))}
        className="w-full flex items-center justify-between px-4 py-3 border-b border-border/50 hover:bg-muted/30 sm:hover:bg-transparent transition-colors sm:cursor-default"
      >
        <div className="flex items-center gap-2">
          <h4 className="text-xs font-bold text-foreground">{category.category}</h4>
          <span className={`text-[10px] font-bold tabular-nums px-2 py-0.5 rounded-sm ${accentText} ${accentBg}`}>
            {category.items.length} platforms
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground transition-transform duration-200 sm:hidden ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Collapsible logo grid — always open on desktop */}
      <div
        className="grid transition-all duration-300 ease-in-out sm:!grid-rows-[1fr]"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-4 gap-0.5 p-2">
            {category.items.map((platform) => (
              <div
                key={platform.name}
                className="group flex flex-col items-center gap-1 py-2 px-1 rounded hover:bg-muted/60 transition-colors"
              >
                <div className="relative">
                  <div className="group-hover:hidden">
                    <PlatformIcon
                      platform={platform}
                      size={24}
                      grayscale
                      fallbackHex={category.accentHex}
                    />
                  </div>
                  <div className="hidden group-hover:block">
                    <PlatformIcon
                      platform={platform}
                      size={24}
                      grayscale={false}
                      fallbackHex={category.accentHex}
                    />
                  </div>
                </div>
                <span className="text-[9px] text-muted-foreground group-hover:text-foreground text-center leading-tight transition-colors line-clamp-1">
                  {platform.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export function CategoryGrid({ categories, marqueeTargets }: CategoryGridProps) {
  const [activeFilter, setActiveFilter] = useState<string>("Featured")
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-60px" })

  const isFeatured = activeFilter === "Featured"
  const filtered = isFeatured
    ? categories
    : categories.filter((c) => c.shortLabel === activeFilter)

  const filterLabels = ["Featured", ...categories.map((c) => c.shortLabel)]
  const totalPlatforms = categories.reduce((sum, c) => sum + c.items.length, 0)

  return (
    <div ref={ref} className="mt-8 sm:mt-12">
      {/* Filter bar */}
      <div className="flex gap-2 overflow-x-auto pb-4 px-1 no-scrollbar">
        {filterLabels.map((label) => (
          <button
            key={label}
            onClick={() => setActiveFilter(label)}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-full flex-shrink-0 transition-all duration-200 ${
              activeFilter === label
                ? "bg-foreground text-background shadow-sm"
                : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {label}
            {label !== "Featured" && (
              <span className="ml-1.5 opacity-60">
                {categories.find((c) => c.shortLabel === label)?.items.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {isFeatured && marqueeTargets && marqueeTargets.length > 0 ? (
        /* ── Featured: flat logo grid ── */
        <div className="bg-white border border-border rounded-sm shadow-plaid-card overflow-hidden p-4">
          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-1">
            {marqueeTargets.map((platform) => (
              <div
                key={platform.name}
                className="group flex flex-col items-center gap-1.5 py-3 px-1 rounded hover:bg-muted/60 transition-colors"
              >
                <div className="relative">
                  <div className="group-hover:hidden">
                    <PlatformIcon
                      platform={platform}
                      size={28}
                      grayscale
                      fallbackHex="94A3B8"
                    />
                  </div>
                  <div className="hidden group-hover:block">
                    <PlatformIcon
                      platform={platform}
                      size={28}
                      grayscale={false}
                      fallbackHex="94A3B8"
                    />
                  </div>
                </div>
                <span className="text-[9px] text-muted-foreground group-hover:text-foreground text-center leading-tight transition-colors line-clamp-1">
                  {platform.name}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-3 pt-3 border-t border-border text-center">
            <p className="text-xs text-muted-foreground">
              Showing {marqueeTargets.length} featured platforms of{" "}
              {totalPlatforms} total.{" "}
              <button
                onClick={() => setActiveFilter(categories[0]?.shortLabel ?? "Streaming")}
                className="text-brand-green hover:underline"
              >
                Browse all categories
              </button>
            </p>
          </div>
        </div>
      ) : (
        /* ── Category cards grid ── */
        <>
          <motion.div
            initial={false}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <AnimatePresence mode="popLayout">
              {isInView &&
                filtered.map((category) => (
                  <CategoryCard key={category.category} category={category} />
                ))}
            </AnimatePresence>
          </motion.div>

          {!isFeatured && (
            <p className="text-center text-xs text-muted-foreground mt-4">
              Showing {filtered.reduce((sum, c) => sum + c.items.length, 0)} of{" "}
              {totalPlatforms} platforms
            </p>
          )}
        </>
      )}
    </div>
  )
}
