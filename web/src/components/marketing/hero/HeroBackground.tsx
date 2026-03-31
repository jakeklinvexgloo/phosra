"use client"

import { useId, useMemo } from "react"
import { PhosraBurst } from "../shared/PhosraBurst"
import { type PersonaKey, PERSONA_ACCENTS } from "./persona-data"

interface HeroBackgroundProps {
  persona: PersonaKey
}

// Mesh gradient configs per persona — 5 radial ellipses
const MESH_CONFIGS: Record<PersonaKey, { before: string; after: string }> = {
  parent: {
    before: `radial-gradient(ellipse 80% 60% at 15% 20%, rgba(0,212,126,0.08) 0%, transparent 55%), radial-gradient(ellipse 70% 50% at 85% 25%, rgba(38,168,201,0.06) 0%, transparent 50%)`,
    after: `radial-gradient(ellipse 60% 70% at 50% 80%, rgba(123,92,184,0.05) 0%, transparent 55%), radial-gradient(ellipse 50% 40% at 80% 70%, rgba(45,184,165,0.04) 0%, transparent 45%), radial-gradient(ellipse 45% 35% at 30% 55%, rgba(0,212,126,0.03) 0%, transparent 50%)`,
  },
  "parental-controls": {
    before: `radial-gradient(ellipse 80% 60% at 15% 20%, rgba(45,184,165,0.09) 0%, transparent 55%), radial-gradient(ellipse 70% 50% at 85% 25%, rgba(0,212,126,0.05) 0%, transparent 50%)`,
    after: `radial-gradient(ellipse 60% 70% at 50% 80%, rgba(38,168,201,0.05) 0%, transparent 55%), radial-gradient(ellipse 50% 40% at 80% 70%, rgba(45,184,165,0.04) 0%, transparent 45%), radial-gradient(ellipse 45% 35% at 30% 55%, rgba(45,184,165,0.03) 0%, transparent 50%)`,
  },
  platform: {
    before: `radial-gradient(ellipse 80% 60% at 15% 20%, rgba(38,168,201,0.09) 0%, transparent 55%), radial-gradient(ellipse 70% 50% at 85% 25%, rgba(123,92,184,0.06) 0%, transparent 50%)`,
    after: `radial-gradient(ellipse 60% 70% at 50% 80%, rgba(38,168,201,0.05) 0%, transparent 55%), radial-gradient(ellipse 50% 40% at 80% 70%, rgba(123,92,184,0.04) 0%, transparent 45%), radial-gradient(ellipse 45% 35% at 30% 55%, rgba(38,168,201,0.03) 0%, transparent 50%)`,
  },
  regulator: {
    before: `radial-gradient(ellipse 80% 60% at 15% 20%, rgba(123,92,184,0.09) 0%, transparent 55%), radial-gradient(ellipse 70% 50% at 85% 25%, rgba(38,168,201,0.05) 0%, transparent 50%)`,
    after: `radial-gradient(ellipse 60% 70% at 50% 80%, rgba(123,92,184,0.06) 0%, transparent 55%), radial-gradient(ellipse 50% 40% at 80% 70%, rgba(123,92,184,0.04) 0%, transparent 45%), radial-gradient(ellipse 45% 35% at 30% 55%, rgba(123,92,184,0.03) 0%, transparent 50%)`,
  },
}

export function HeroBackground({ persona }: HeroBackgroundProps) {
  const waveId = useId()
  const accent = PERSONA_ACCENTS[persona]
  const mesh = MESH_CONFIGS[persona]

  return (
    <>
      {/* Base background */}
      <div
        className="absolute inset-0 transition-[background] duration-700"
        style={{ background: "#0D1B2A" }}
        aria-hidden="true"
      />

      {/* Mesh gradient layer 1 (2 ellipses) */}
      <div
        className="absolute inset-0 pointer-events-none transition-[background] duration-[1200ms]"
        style={{ background: mesh.before }}
        aria-hidden="true"
      />

      {/* Mesh gradient layer 2 (3 ellipses) */}
      <div
        className="absolute inset-0 pointer-events-none transition-[background] duration-[1200ms]"
        style={{ background: mesh.after }}
        aria-hidden="true"
      />

      {/* SVG Wave Texture */}
      <svg
        className="absolute bottom-0 left-0 w-full h-[45%] pointer-events-none opacity-10"
        viewBox="0 0 1440 600"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`wg1-${waveId}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={accent.color} stopOpacity={0.4} />
            <stop offset="50%" stopColor={accent.secondary} stopOpacity={0.2} />
            <stop offset="100%" stopColor={accent.color} stopOpacity={0.1} />
          </linearGradient>
          <linearGradient id={`wg2-${waveId}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={accent.secondary} stopOpacity={0.3} />
            <stop offset="100%" stopColor={accent.color} stopOpacity={0.15} />
          </linearGradient>
          <linearGradient id={`wg3-${waveId}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={accent.color} stopOpacity={0.2} />
            <stop offset="50%" stopColor="#7B5CB8" stopOpacity={0.1} />
            <stop offset="100%" stopColor={accent.secondary} stopOpacity={0.15} />
          </linearGradient>
        </defs>
        <path d="M0,300 C240,220 480,380 720,280 C960,180 1200,340 1440,260 L1440,600 L0,600 Z" fill={`url(#wg1-${waveId})`} opacity={0.6} />
        <path d="M0,380 C360,300 600,450 900,350 C1100,280 1300,400 1440,340 L1440,600 L0,600 Z" fill={`url(#wg2-${waveId})`} opacity={0.5} />
        <path d="M0,450 C200,400 500,500 720,420 C940,340 1200,480 1440,400 L1440,600 L0,600 Z" fill={`url(#wg3-${waveId})`} opacity={0.4} />
      </svg>

      {/* Scattered Phosra Marks */}
      <div className="absolute -top-[5%] -right-[8%] md:w-[600px] md:h-[600px] w-[350px] h-[350px]">
        <PhosraBurst size={600} color={accent.color} opacity={0.04} animate className="animate-slow-spin-120 w-full h-full" />
      </div>
      <div className="absolute top-[40%] -left-[6%] md:w-[350px] md:h-[350px] w-[200px] h-[200px]">
        <PhosraBurst size={350} color={accent.color} opacity={0.03} animate className="animate-slow-spin-reverse-90 w-full h-full" />
      </div>
      <div className="absolute bottom-[8%] right-[5%] md:w-[200px] md:h-[200px] w-[120px] h-[120px]">
        <PhosraBurst size={200} color={accent.color} opacity={0.02} rotate={15} className="w-full h-full" />
      </div>

      {/* Fine Grid Overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
        aria-hidden="true"
      />

      {/* Grain texture */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
        aria-hidden="true"
      />
    </>
  )
}
