"use client"

import { useState } from "react"
import { DemoCard } from "@/components/marketing/hero/DemoCard"
import { ParentChatDemoPanel } from "@/components/marketing/hero/ParentChatDemoPanel"
import { ParentSplitDemoPanel } from "@/components/marketing/hero/ParentSplitDemoPanel"
import { ParentDemoA4 } from "@/components/marketing/hero/ParentDemoA4"
import { ParentProgressiveDemoPanel } from "@/components/marketing/hero/ParentProgressiveDemoPanel"
import { HeroChatDemo } from "@/components/marketing/hero/HeroChatDemo"

const VERSIONS = [
  { id: "a1", label: "A1: Unified Card", description: "Same DemoCard wrapper, 3 scenario tabs, fixed height" },
  { id: "a3", label: "A3: Split Layout", description: "Chat left (60%) + Terminal right (40%)" },
  { id: "a4", label: "A4: Outcome Minimal", description: "Prompt → tools → result card, no chat" },
  { id: "a5", label: "A5: Progressive Chat", description: "Full chat with proper bubbles in DemoCard" },
  { id: "original", label: "Original HeroChatDemo", description: "The current production component" },
] as const

export default function DemoComparePage() {
  const [active, setActive] = useState<string>("a5")

  return (
    <div className="min-h-screen bg-[#0D1B2A] text-white p-8">
      <h1 className="text-2xl font-bold mb-2 text-center">Parent Demo Animation Comparison</h1>
      <p className="text-white/40 text-center text-sm mb-8">Click a version to preview it</p>

      {/* Version selector */}
      <div className="flex flex-wrap gap-2 justify-center mb-12 max-w-3xl mx-auto">
        {VERSIONS.map((v) => (
          <button
            key={v.id}
            onClick={() => setActive(v.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              active === v.id
                ? "bg-[#00D47E]/20 border border-[#00D47E]/40 text-[#00D47E]"
                : "bg-white/5 border border-white/10 text-white/50 hover:text-white/70"
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* Description */}
      <p className="text-center text-white/30 text-xs mb-6">
        {VERSIONS.find((v) => v.id === active)?.description}
      </p>

      {/* Demo preview */}
      <div className="max-w-[600px] mx-auto">
        {active === "a1" && <ParentChatDemoPanel isActive={true} />}
        {active === "a3" && <ParentSplitDemoPanel isActive={true} />}
        {active === "a4" && <ParentDemoA4 isActive={true} />}
        {active === "a5" && <ParentProgressiveDemoPanel />}
        {active === "original" && (
          <div className="text-left [&>div]:max-w-none [&>div]:mx-0">
            <HeroChatDemo />
          </div>
        )}
      </div>
    </div>
  )
}
