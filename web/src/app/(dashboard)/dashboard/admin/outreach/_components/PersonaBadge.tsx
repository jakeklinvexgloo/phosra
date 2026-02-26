"use client"

// ── Persona Config ──────────────────────────────────────────────

interface PersonaConfig {
  initials: string
  label: string
  bgColor: string
  textColor: string
  borderColor: string
}

const JAKE_CONFIG: PersonaConfig = {
  initials: "JK",
  label: "Jake",
  bgColor: "bg-blue-100 dark:bg-blue-900/30",
  textColor: "text-blue-700 dark:text-blue-300",
  borderColor: "border-blue-400",
}

const ALEX_CONFIG: PersonaConfig = {
  initials: "AC",
  label: "Alex",
  bgColor: "bg-purple-100 dark:bg-purple-900/30",
  textColor: "text-purple-700 dark:text-purple-300",
  borderColor: "border-purple-400",
}

const DEFAULT_CONFIG: PersonaConfig = {
  initials: "??",
  label: "Unknown",
  bgColor: "bg-gray-100 dark:bg-gray-800",
  textColor: "text-gray-600 dark:text-gray-400",
  borderColor: "border-gray-400",
}

/** Returns display config (initials, colors, label) for a persona key. */
export function getPersonaConfig(persona: string): PersonaConfig {
  const key = persona.toLowerCase()
  if (key === "jake" || key.includes("jake")) return JAKE_CONFIG
  if (key === "alex" || key === "outreach" || key.includes("alex")) return ALEX_CONFIG
  return DEFAULT_CONFIG
}

/** Returns the Tailwind `border-l-*` class for a persona's accent color. */
export function getPersonaBorderClass(persona: string): string {
  const key = persona.toLowerCase()
  if (key === "jake" || key.includes("jake")) return "border-l-blue-400"
  if (key === "alex" || key === "outreach" || key.includes("alex")) return "border-l-purple-400"
  return "border-l-gray-400"
}

// ── Component ───────────────────────────────────────────────────

interface PersonaBadgeProps {
  persona: string
  size?: "sm" | "md"
  className?: string
}

const SIZE_CLASSES = {
  sm: "w-5 h-5 text-[10px]",
  md: "w-7 h-7 text-xs",
} as const

export function PersonaBadge({ persona, size = "sm", className = "" }: PersonaBadgeProps) {
  const config = getPersonaConfig(persona)

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-semibold leading-none select-none ${SIZE_CLASSES[size]} ${config.bgColor} ${config.textColor} ${className}`}
      title={config.label}
    >
      {config.initials}
    </span>
  )
}
