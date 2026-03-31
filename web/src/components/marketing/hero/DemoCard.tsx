"use client"

import type { ReactNode } from "react"

interface DemoCardProps {
  title: string
  accentColor: string
  accentR: number
  accentG: number
  accentB: number
  /** Fixed height in pixels. Defaults to 420. Set to 0 to disable. */
  fixedHeight?: number
  children: ReactNode
}

export function DemoCard({
  title,
  accentColor,
  accentR,
  accentG,
  accentB,
  fixedHeight = 420,
  children,
}: DemoCardProps) {
  return (
    <div
      className="w-full max-w-[560px] mx-auto mb-8 bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-2xl text-left relative overflow-hidden transition-[border-color,box-shadow] duration-700 flex flex-col"
      style={{
        boxShadow: `0 0 40px -12px rgba(${accentR}, ${accentG}, ${accentB}, 0.12)`,
        height: fixedHeight > 0 ? `${fixedHeight}px` : undefined,
      }}
    >
      {/* Gradient border overlay */}
      <div
        className="absolute inset-[-1px] rounded-[17px] pointer-events-none transition-[background] duration-700 z-10"
        style={{
          padding: "1px",
          background: `linear-gradient(135deg, rgba(${accentR}, ${accentG}, ${accentB}, 0.15), transparent 60%)`,
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
      />

      {/* Header — pinned at top */}
      <div className="flex items-center gap-2 px-5 sm:px-6 pt-5 pb-3 shrink-0">
        <div className="w-2 h-2 rounded-full bg-[#ff5f57]" />
        <div className="w-2 h-2 rounded-full bg-[#ffbd2e]" />
        <div className="w-2 h-2 rounded-full bg-[#28c840]" />
        <span className="ml-2 font-mono text-[11px] text-white/35 tracking-wide">{title}</span>
      </div>

      {/* Scrollable content area — fills remaining space */}
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide px-5 sm:px-6 pb-5 sm:pb-6">
        {children}
      </div>
    </div>
  )
}
