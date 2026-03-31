"use client"

import { useMemo } from "react"
import Link from "next/link"
import { type PersonaKey, PERSONA_ONELINERS, PERSONA_MARQUEE_ITEMS } from "./persona-data"

interface HeroMarqueeProps {
  persona: PersonaKey
}

export function HeroMarquee({ persona }: HeroMarqueeProps) {
  const oneliner = PERSONA_ONELINERS[persona]
  const items = useMemo(() => {
    const base = PERSONA_MARQUEE_ITEMS[persona]
    return [...base, ...base]
  }, [persona])

  return (
    <div className="text-center">
      {/* Divider */}
      <div
        className="w-12 h-px mx-auto mt-12 mb-9"
        style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)" }}
      />

      {/* Persona-adaptive one-liner */}
      <p className="font-sans text-sm font-normal tracking-wide text-white/40 mb-7 transition-opacity duration-400">
        {oneliner}
      </p>

      {/* Marquee */}
      <div
        className="relative overflow-hidden w-screen -ml-[calc(50vw-50%)]"
        style={{
          WebkitMaskImage: "linear-gradient(90deg, transparent 0%, #000 8%, #000 92%, transparent 100%)",
          maskImage: "linear-gradient(90deg, transparent 0%, #000 8%, #000 92%, transparent 100%)",
        }}
      >
        <div className="flex gap-3 animate-marquee-scroll w-max py-1.5">
          {items.map((item, i) => (
            <span
              key={`${item}-${i}`}
              className="flex-shrink-0 px-4 py-1.5 rounded-full border border-white/[0.08] font-sans text-[13px] font-medium text-white/35 whitespace-nowrap transition-[border-color,color] duration-700"
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Founder embed — parent mode only */}
      <div
        className={`flex items-center justify-center gap-2.5 mt-7 transition-opacity duration-500 ${
          persona === "parent" ? "opacity-35" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#00D47E]/30 to-[#2DB8A5]/30 border border-white/[0.08] flex items-center justify-center font-sans text-[9px] font-semibold text-white/50 flex-shrink-0">
          JK
        </div>
        <span className="font-sans text-[12.5px] text-white/35">
          Built by Jake &amp; Susannah Klinvex — parents of 5, founders of 3 acquired companies
        </span>
        <Link href="/about" className="font-sans text-[12.5px] text-[#00D47E]/50 hover:text-[#00D47E]/80 transition-colors">
          Read our story &rarr;
        </Link>
      </div>
    </div>
  )
}
