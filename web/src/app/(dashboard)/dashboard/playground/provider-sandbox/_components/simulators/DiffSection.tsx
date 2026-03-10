"use client"

import type { DiffBadgeVariant } from "@/lib/sandbox/types"
import { DiffBadge } from "./DiffBadge"

interface DiffSectionProps {
  title: string
  variant: DiffBadgeVariant
  beforeContent: React.ReactNode
  afterContent: React.ReactNode
}

export function DiffSection({ title, variant, beforeContent, afterContent }: DiffSectionProps) {
  if (variant === "unchanged") {
    return (
      <div style={{ padding: "16px 0" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h4
            style={{
              color: "#fff",
              fontSize: "13px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              margin: 0,
            }}
          >
            {title}
          </h4>
          <DiffBadge variant="unchanged" />
        </div>
        <div style={{ color: "#555", fontSize: "12px", marginTop: "8px" }}>
          {afterContent}
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: "16px 0" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "12px",
        }}
      >
        <h4
          style={{
            color: "#fff",
            fontSize: "13px",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            margin: 0,
          }}
        >
          {title}
        </h4>
        <DiffBadge variant={variant} />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          borderRadius: "8px",
          overflow: "hidden",
          border: "1px solid #333333",
        }}
      >
        {/* BEFORE column */}
        <div
          aria-label="Before enforcement"
          style={{
            backgroundColor: "rgba(255, 107, 107, 0.06)",
            padding: "12px",
            borderRight: "1px solid #333333",
          }}
        >
          <div
            style={{
              fontSize: "10px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "#FF6B6B",
              marginBottom: "8px",
            }}
          >
            Before
          </div>
          <div style={{ color: "#FF6B6B" }}>{beforeContent}</div>
        </div>

        {/* AFTER column */}
        <div
          aria-label="After enforcement"
          style={{
            backgroundColor: "rgba(0, 212, 126, 0.06)",
            padding: "12px",
          }}
        >
          <div
            style={{
              fontSize: "10px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "#00D47E",
              marginBottom: "8px",
            }}
          >
            After
          </div>
          <div style={{ color: "#00D47E" }}>{afterContent}</div>
        </div>
      </div>
    </div>
  )
}
