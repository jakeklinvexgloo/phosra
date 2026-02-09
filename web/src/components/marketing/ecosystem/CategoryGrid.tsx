"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence, useInView } from "framer-motion"
import type { PlatformCategory } from "../ecosystem-data"
import { PlatformIcon } from "./PlatformIcon"

interface CategoryGridProps {
  categories: PlatformCategory[]
}

const cardVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -8, scale: 0.97 },
}

function CategoryCard({ category }: { category: PlatformCategory }) {
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
      {/* Card header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
        <h4 className="text-xs font-bold text-foreground">{category.category}</h4>
        <span className={`text-[10px] font-bold tabular-nums px-2 py-0.5 rounded-sm ${accentText} ${accentBg}`}>
          {category.items.length} platforms
        </span>
      </div>

      {/* Logo grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-0.5 p-2">
        {category.items.map((platform) => (
          <div
            key={platform.name}
            className="group flex flex-col items-center gap-1 py-2 px-1 rounded hover:bg-muted/60 transition-colors"
          >
            <div className="relative">
              {/* Grayscale icon (default) */}
              <div className="group-hover:hidden">
                <PlatformIcon
                  platform={platform}
                  size={24}
                  grayscale
                  fallbackHex={category.accentHex}
                />
              </div>
              {/* Color icon (hover) */}
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
    </motion.div>
  )
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  const [activeFilter, setActiveFilter] = useState<string>("All")
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-60px" })

  const filtered = activeFilter === "All"
    ? categories
    : categories.filter((c) => c.shortLabel === activeFilter)

  const filterLabels = ["All", ...categories.map((c) => c.shortLabel)]

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
            {label !== "All" && (
              <span className="ml-1.5 opacity-60">
                {categories.find((c) => c.shortLabel === label)?.items.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Card grid */}
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

      {/* Show count when filtered */}
      {activeFilter !== "All" && (
        <p className="text-center text-xs text-muted-foreground mt-4">
          Showing {filtered.reduce((sum, c) => sum + c.items.length, 0)} of{" "}
          {categories.reduce((sum, c) => sum + c.items.length, 0)} platforms
        </p>
      )}
    </div>
  )
}
