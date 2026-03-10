"use client"

import type { DiffBadgeVariant } from "@/lib/sandbox/types"

interface DiffBadgeProps {
  variant: DiffBadgeVariant
}

const BADGE_STYLES: Record<DiffBadgeVariant, { bg: string; color: string; label: string }> = {
  changed: {
    bg: "rgba(217, 119, 6, 0.15)",
    color: "#D97706",
    label: "CHANGED",
  },
  new: {
    bg: "rgba(0, 212, 126, 0.15)",
    color: "#00D47E",
    label: "NEW",
  },
  unchanged: {
    bg: "rgba(85, 85, 85, 0.15)",
    color: "#555555",
    label: "UNCHANGED",
  },
}

export function DiffBadge({ variant }: DiffBadgeProps) {
  const style = BADGE_STYLES[variant]

  return (
    <span
      style={{
        display: "inline-block",
        fontSize: "10px",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        padding: "4px 8px",
        borderRadius: "4px",
        backgroundColor: style.bg,
        color: style.color,
        lineHeight: 1,
      }}
    >
      {style.label}
    </span>
  )
}
