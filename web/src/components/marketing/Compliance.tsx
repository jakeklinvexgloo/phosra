"use client"

import { useState, type ReactNode } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { COMPLIANCE_LAWS, GROUP_COLORS, type ComplianceLaw } from "./compliance-data"
import { AnimatedSection, WaveTexture, StaggerChildren } from "./shared"

function colorizeSnippet(text: string): ReactNode {
  const lines = text.split("\n")
  return lines.map((line, i) => {
    const key = i

    // Comment lines
    if (line.trimStart().startsWith("//")) {
      return (
        <span key={key}>
          <span className="text-slate-500">{line}</span>
          {"\n"}
        </span>
      )
    }

    // Result lines with checkmarks
    if (line.trimStart().startsWith("→")) {
      const match = line.match(/^(\s*→\s*)(\S+(?:\s\S+)?)\s{2,}(.+?)\s{2,}(✓)$/)
      if (match) {
        return (
          <span key={key}>
            <span className="text-slate-500">{match[1]}</span>
            <span className="text-white font-medium">{match[2]}</span>
            {"  "}
            <span className="text-slate-400">{match[3].trim()}</span>
            {"  "}
            <span className="text-brand-green font-bold">{match[4]}</span>
            {"\n"}
          </span>
        )
      }
      // Fallback for result lines
      return (
        <span key={key}>
          <span className="text-slate-400">{line}</span>
          {"\n"}
        </span>
      )
    }

    // tool: line
    if (line.trimStart().startsWith("tool:")) {
      const parts = line.split("tool:")
      return (
        <span key={key}>
          {parts[0]}<span className="text-sky-400">tool:</span>
          <span className="text-sky-300">{parts[1]}</span>
          {"\n"}
        </span>
      )
    }

    // input: line
    if (line.trimStart().startsWith("input:")) {
      const parts = line.split("input:")
      return (
        <span key={key}>
          {parts[0]}<span className="text-sky-400">input:</span>
          <span className="text-slate-400">{parts[1]}</span>
          {"\n"}
        </span>
      )
    }

    // Key-value lines inside input block
    const kvMatch = line.match(/^(\s+)(\w+):\s*(.+)$/)
    if (kvMatch) {
      return (
        <span key={key}>
          {kvMatch[1]}<span className="text-sky-300">{kvMatch[2]}</span>
          <span className="text-slate-400">: </span>
          <span className="text-green-400">{kvMatch[3]}</span>
          {"\n"}
        </span>
      )
    }

    // Bracket/brace lines
    if (line.trim() === "{" || line.trim() === "}" || line.trim() === "[" || line.trim() === "]") {
      return (
        <span key={key}>
          <span className="text-slate-500">{line}</span>
          {"\n"}
        </span>
      )
    }

    // Array items (strings in quotes)
    const arrayMatch = line.match(/^(\s+)"(.+)"(,?)$/)
    if (arrayMatch) {
      return (
        <span key={key}>
          {arrayMatch[1]}<span className="text-green-400">&quot;{arrayMatch[2]}&quot;</span>
          <span className="text-slate-500">{arrayMatch[3]}</span>
          {"\n"}
        </span>
      )
    }

    // Default
    return (
      <span key={key}>
        <span className="text-slate-400">{line}</span>
        {"\n"}
      </span>
    )
  })
}

function StageChip({ law }: { law: ComplianceLaw }) {
  const colors = {
    enacted: "bg-brand-green/10 text-brand-green",
    passed: "bg-amber-50 text-amber-700",
    pending: "bg-slate-100 text-slate-500",
  }
  return (
    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-medium ${colors[law.stageColor]}`}>
      {law.stage}
    </span>
  )
}

/* Jurisdiction-to-color mapping for left border accents */
const JURISDICTION_COLORS: Record<string, string> = {
  "U.S. Federal": "border-l-blue-500",
  "California": "border-l-amber-500",
  "EU": "border-l-indigo-500",
  "UK": "border-l-red-500",
  "Australia": "border-l-green-500",
}

function LawDetail({ law }: { law: ComplianceLaw }) {
  return (
    <div className="grid md:grid-cols-5 gap-6 p-5 sm:p-6">
      {/* Left column — 3/5 */}
      <div className="md:col-span-3 space-y-4">
        <div>
          <h3 className="text-lg font-bold text-foreground mb-2">{law.fullName}</h3>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
              {law.jurisdiction}
            </span>
            <StageChip law={law} />
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{law.summary}</p>
        </div>

        {/* Rule categories */}
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-2">Rule categories</p>
          <div className="flex flex-wrap gap-1.5">
            {law.categories.map((cat) => {
              const colors = GROUP_COLORS[cat.group] || { bg: "bg-slate-50", text: "text-slate-700" }
              return (
                <span
                  key={cat.id}
                  className={`inline-flex px-2.5 py-1 rounded text-[11px] font-medium ${colors.bg} ${colors.text}`}
                >
                  {cat.name}
                </span>
              )
            })}
          </div>
        </div>

        {/* Platforms */}
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-2">Enforced on</p>
          <div className="flex flex-wrap gap-1.5">
            {law.platforms.map((p) => (
              <span
                key={p}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium bg-slate-50 text-slate-600"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-brand-green" />
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right column — 2/5 — MCP snippet */}
      <div className="md:col-span-2">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-2">MCP enforcement call</p>
        <div className="bg-slate-900 rounded-lg overflow-hidden border border-slate-700/50">
          <pre className="p-3 sm:p-4 overflow-x-auto text-[10px] sm:text-[11px] leading-4 sm:leading-5 font-mono">
            <code>{colorizeSnippet(law.mcpSnippet)}</code>
          </pre>
        </div>
      </div>
    </div>
  )
}

export function Compliance() {
  const [selectedId, setSelectedId] = useState<string | null>(COMPLIANCE_LAWS[0]?.id ?? null)
  const selected = COMPLIANCE_LAWS.find((l) => l.id === selectedId) || null

  return (
    <section id="compliance" className="relative py-24 sm:py-32 overflow-hidden bg-gradient-to-b from-white to-[#FAFAFA]">
      {/* Subtle texture */}
      <WaveTexture colorStart="#00D47E" colorEnd="#7B5CB8" opacity={0.02} />

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-10 sm:mb-16">
          <h2 className="font-display text-4xl sm:text-5xl text-foreground leading-tight mb-5">
            Built for the laws that protect children
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Each of Phosra&apos;s 35 rule categories maps to specific legislative requirements. Click a law to see which rules and platforms it covers.
          </p>
        </AnimatedSection>

        {/* Law badges */}
        <StaggerChildren staggerDelay={0.05} className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
          {COMPLIANCE_LAWS.map((law) => {
            const borderColor = JURISDICTION_COLORS[law.jurisdiction] || "border-l-slate-400"
            return (
              <motion.button
                key={law.id}
                onClick={() => setSelectedId(selectedId === law.id ? null : law.id)}
                whileHover={{ y: -2 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className={`px-3 sm:px-4 py-2 sm:py-2.5 border-l-[3px] border rounded-sm text-xs sm:text-sm font-medium transition-colors ${borderColor} ${
                  selectedId === law.id
                    ? "border-y-brand-green border-r-brand-green bg-brand-green/5 text-foreground"
                    : "border-y-border border-r-border bg-white text-foreground hover:border-y-brand-green hover:border-r-brand-green hover:bg-brand-green/5 shadow-sm"
                }`}
              >
                {law.name}
              </motion.button>
            )
          })}
        </StaggerChildren>

        {/* Expandable detail card */}
        <div className="max-w-5xl mx-auto mt-6 relative">
          <AnimatePresence initial={false}>
            {selected && (
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8, position: "absolute", width: "100%" }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="bg-white border border-border rounded-lg shadow-sm">
                  <LawDetail law={selected} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
