"use client"

import { MATURITY_TIERS, type NetflixMaturityTier } from "@/lib/sandbox/types"

interface NetflixMaturitySliderProps {
  value: NetflixMaturityTier
  isHighlighted: boolean
}

export function NetflixMaturitySlider({ value, isHighlighted }: NetflixMaturitySliderProps) {
  const activeIndex = MATURITY_TIERS.indexOf(value)

  return (
    <div
      style={{
        padding: "16px 0",
        transition: "box-shadow 0.3s",
        boxShadow: isHighlighted ? "0 0 0 2px #00D47E" : "none",
        borderRadius: "8px",
      }}
    >
      <h4 style={{ color: "#fff", fontSize: "13px", fontWeight: 600, marginBottom: "12px", textTransform: "uppercase" as const, letterSpacing: "0.1em" }}>
        Maturity Rating
      </h4>
      <div style={{ display: "flex", gap: "0px" }}>
        {MATURITY_TIERS.map((tier, i) => {
          const isActive = i <= activeIndex
          return (
            <div
              key={tier}
              style={{
                flex: 1,
                padding: "8px 0",
                textAlign: "center",
                fontSize: "12px",
                fontWeight: i === activeIndex ? 700 : 500,
                color: isActive ? "#fff" : "#555",
                backgroundColor: isActive ? "#E50914" : "#2a2a2a",
                borderRight: i < MATURITY_TIERS.length - 1 ? "1px solid #141414" : "none",
                borderRadius:
                  i === 0
                    ? "6px 0 0 6px"
                    : i === MATURITY_TIERS.length - 1
                      ? "0 6px 6px 0"
                      : "0",
                transition: "all 0.3s",
              }}
            >
              {tier}
            </div>
          )
        })}
      </div>
      <p style={{ color: "#777", fontSize: "11px", marginTop: "8px" }}>
        Show titles rated <strong style={{ color: "#ccc" }}>{value}</strong> and below for this profile
      </p>
    </div>
  )
}
