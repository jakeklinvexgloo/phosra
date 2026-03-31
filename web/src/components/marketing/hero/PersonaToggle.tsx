"use client"

import { User, Monitor, Code, Layers } from "lucide-react"
import { type PersonaKey, ALL_PERSONAS, PERSONA_LABELS, PERSONA_ACCENTS } from "./persona-data"

const ICONS: Record<PersonaKey, React.ReactNode> = {
  parent: <User className="w-4 h-4 opacity-70" />,
  "parental-controls": <Monitor className="w-4 h-4 opacity-70" />,
  platform: <Code className="w-4 h-4 opacity-70" />,
  regulator: <Layers className="w-4 h-4 opacity-70" />,
}

interface PersonaToggleProps {
  active: PersonaKey
  onChange: (p: PersonaKey) => void
}

export function PersonaToggle({ active, onChange }: PersonaToggleProps) {
  const accent = PERSONA_ACCENTS[active]

  return (
    <div className="flex justify-center mt-10 sm:mt-12 mb-12 sm:mb-14">
      <div className="inline-flex gap-0.5 bg-white/[0.04] border border-white/[0.08] rounded-[14px] p-1 backdrop-blur-2xl overflow-x-auto max-w-full scrollbar-hide relative">
        {ALL_PERSONAS.map((p) => {
          const isActive = p === active
          return (
            <button
              key={p}
              onClick={() => onChange(p)}
              className={`
                flex items-center gap-2 px-4 sm:px-5 py-2.5 border-none rounded-[10px]
                text-[13px] font-medium whitespace-nowrap relative
                transition-all duration-300
                ${isActive
                  ? "text-white bg-white/[0.08]"
                  : "text-white/50 hover:text-white/75 hover:bg-white/[0.04]"
                }
              `}
            >
              <span className="hidden sm:inline-flex">{ICONS[p]}</span>
              {PERSONA_LABELS[p]}
              {/* Active indicator line */}
              {isActive && (
                <span
                  className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full transition-colors duration-500"
                  style={{
                    background: accent.color,
                    boxShadow: `0 0 8px rgba(${accent.r}, ${accent.g}, ${accent.b}, 0.5)`,
                  }}
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
