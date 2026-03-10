"use client"

import { MATURITY_TIERS, type NetflixMaturityTier } from "@/lib/sandbox/types"

interface NetflixMaturitySliderProps {
  value: NetflixMaturityTier
  previousValue: NetflixMaturityTier | null
  isHighlighted: boolean
}

function SliderBar({ tier, isActive, activeIndex }: { tier: NetflixMaturityTier; isActive: boolean; activeIndex: number }) {
  const i = MATURITY_TIERS.indexOf(tier)
  return (
    <div
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
}

export function NetflixMaturitySlider({ value, previousValue, isHighlighted }: NetflixMaturitySliderProps) {
  const activeIndex = MATURITY_TIERS.indexOf(value)

  // No diff mode: render single slider
  if (previousValue === null || previousValue === value) {
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
          {MATURITY_TIERS.map((tier, i) => (
            <SliderBar key={tier} tier={tier} isActive={i <= activeIndex} activeIndex={activeIndex} />
          ))}
        </div>
        <p style={{ color: "#777", fontSize: "11px", marginTop: "8px" }}>
          Show titles rated <strong style={{ color: "#ccc" }}>{value}</strong> and below for this profile
        </p>
      </div>
    )
  }

  // Diff mode: render two sliders side by side
  const prevIndex = MATURITY_TIERS.indexOf(previousValue)

  return (
    <div style={{ padding: "16px 0" }}>
      <div style={{ display: "flex", gap: "0px" }}>
        {/* Before slider */}
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", gap: "0px", opacity: 0.7 }}>
            {MATURITY_TIERS.map((tier, i) => (
              <SliderBar key={tier} tier={tier} isActive={i <= prevIndex} activeIndex={prevIndex} />
            ))}
          </div>
          <p style={{ color: "#FF6B6B", fontSize: "11px", marginTop: "6px" }}>
            {previousValue} and below
          </p>
        </div>

        {/* After slider */}
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", gap: "0px" }}>
            {MATURITY_TIERS.map((tier, i) => (
              <SliderBar key={tier} tier={tier} isActive={i <= activeIndex} activeIndex={activeIndex} />
            ))}
          </div>
          <p style={{ color: "#00D47E", fontSize: "11px", marginTop: "6px" }}>
            {value} and below
          </p>
        </div>
      </div>
    </div>
  )
}
