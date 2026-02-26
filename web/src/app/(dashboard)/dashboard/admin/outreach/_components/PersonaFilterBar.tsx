"use client"

import { PersonaBadge, getPersonaConfig } from "./PersonaBadge"

interface PersonaFilterBarProps {
  selected: "all" | "jake" | "alex"
  counts: { all: number; jake: number; alex: number }
  onSelect: (persona: "all" | "jake" | "alex") => void
}

export function PersonaFilterBar({ selected, counts, onSelect }: PersonaFilterBarProps) {
  return (
    <div className="flex items-center gap-2">
      {/* All chip */}
      <button
        onClick={() => onSelect("all")}
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium transition-colors ${
          selected === "all"
            ? "bg-neutral-800 text-white dark:bg-neutral-200 dark:text-neutral-900"
            : "border border-neutral-300 text-neutral-600 hover:border-neutral-400 hover:text-neutral-800 dark:border-neutral-600 dark:text-neutral-400 dark:hover:border-neutral-500 dark:hover:text-neutral-200"
        }`}
      >
        All ({counts.all})
      </button>

      {/* Jake chip */}
      {(["jake", "alex"] as const).map((persona) => {
        const config = getPersonaConfig(persona)
        const isSelected = selected === persona
        const isJake = persona === "jake"

        const activeClasses = isJake
          ? "bg-blue-600 text-white dark:bg-blue-500"
          : "bg-purple-600 text-white dark:bg-purple-500"

        const inactiveClasses = isJake
          ? "border border-blue-300 text-blue-700 hover:border-blue-400 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400 dark:hover:border-blue-600 dark:hover:bg-blue-900/20"
          : "border border-purple-300 text-purple-700 hover:border-purple-400 hover:bg-purple-50 dark:border-purple-700 dark:text-purple-400 dark:hover:border-purple-600 dark:hover:bg-purple-900/20"

        return (
          <button
            key={persona}
            onClick={() => onSelect(persona)}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium transition-colors ${
              isSelected ? activeClasses : inactiveClasses
            }`}
          >
            <PersonaBadge
              persona={persona}
              size="sm"
              className={isSelected ? "!bg-white/20 !text-white" : ""}
            />
            {config.label} ({counts[persona]})
          </button>
        )
      })}
    </div>
  )
}
