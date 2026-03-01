"use client"

interface StatCalloutProps {
  value: string
  label: string
}

export function StatCallout({ value, label }: StatCalloutProps) {
  return (
    <div className="my-2 inline-flex flex-col items-center px-4 py-3 rounded-lg bg-white/[0.04] border border-white/[0.08]">
      <span className="text-2xl font-bold text-brand-green font-mono">{value}</span>
      <span className="text-[11px] text-white/50 mt-0.5">{label}</span>
    </div>
  )
}

/** Parse stat code fence content like "97\nOverall Safety Score" */
export function parseStat(text: string): { value: string; label: string } | null {
  const lines = text.trim().split("\n").filter(Boolean)
  if (lines.length < 2) return null
  return { value: lines[0].trim(), label: lines.slice(1).join(" ").trim() }
}
