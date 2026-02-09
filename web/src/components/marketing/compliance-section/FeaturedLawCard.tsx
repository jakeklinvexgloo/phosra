"use client"

import type { ReactNode } from "react"
import type { LawEntry } from "@/lib/compliance/types"
import { JURISDICTION_META, STATUS_META } from "@/lib/compliance/types"

function colorizeSnippet(text: string): ReactNode {
  const lines = text.split("\n")
  return lines.map((line, i) => {
    if (line.trimStart().startsWith("//")) {
      return (
        <span key={i}>
          <span className="text-slate-500">{line}</span>
          {"\n"}
        </span>
      )
    }
    if (line.trimStart().startsWith("→")) {
      const match = line.match(/^(\s*→\s*)(\S+(?:\s\S+)?)\s{2,}(.+?)\s{2,}(✓)$/)
      if (match) {
        return (
          <span key={i}>
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
      return (
        <span key={i}>
          <span className="text-slate-400">{line}</span>
          {"\n"}
        </span>
      )
    }
    if (line.trimStart().startsWith("tool:")) {
      const parts = line.split("tool:")
      return (
        <span key={i}>
          {parts[0]}
          <span className="text-sky-400">tool:</span>
          <span className="text-sky-300">{parts[1]}</span>
          {"\n"}
        </span>
      )
    }
    if (line.includes('"')) {
      return (
        <span key={i}>
          {line.split(/(\"[^\"]*\")/).map((part, j) =>
            part.startsWith('"') ? (
              <span key={j} className="text-emerald-400">
                {part}
              </span>
            ) : (
              <span key={j} className="text-slate-300">
                {part}
              </span>
            )
          )}
          {"\n"}
        </span>
      )
    }
    return (
      <span key={i}>
        <span className="text-slate-300">{line}</span>
        {"\n"}
      </span>
    )
  })
}

interface FeaturedLawCardProps {
  law: LawEntry
}

export function FeaturedLawCard({ law }: FeaturedLawCardProps) {
  const jMeta = JURISDICTION_META[law.jurisdictionGroup]
  const sMeta = STATUS_META[law.status]

  return (
    <div
      className="plaid-card border-l-2 border-l-foreground/20 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            {law.shortName}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {law.fullName}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span
            className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${jMeta.bgColor} ${jMeta.textColor}`}
          >
            {law.jurisdiction}
          </span>
          <span
            className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${sMeta.bgColor} ${sMeta.textColor}`}
          >
            {law.statusLabel}
          </span>
        </div>
      </div>

      {/* Summary */}
      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
        {law.summary}
      </p>

      {/* MCP Snippet */}
      <div className="rounded-lg bg-[#0D1B2A] p-4 font-mono text-xs leading-relaxed overflow-x-auto">
        <pre className="whitespace-pre">{colorizeSnippet(law.mcpSnippet)}</pre>
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap gap-1.5 mt-4">
        {law.ruleCategories.slice(0, 4).map((cat) => (
          <span
            key={cat}
            className="text-[10px] font-mono bg-muted text-muted-foreground px-2 py-0.5 rounded"
          >
            {cat}
          </span>
        ))}
        {law.ruleCategories.length > 4 && (
          <span className="text-[10px] text-muted-foreground">
            +{law.ruleCategories.length - 4} more
          </span>
        )}
      </div>
    </div>
  )
}
