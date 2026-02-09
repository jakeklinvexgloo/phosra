"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { Sun, Moon, Monitor } from "lucide-react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return (
      <button className="p-2 rounded-lg text-muted-foreground" aria-label="Toggle theme">
        <Sun className="w-4 h-4" />
      </button>
    )
  }

  const cycle = () => {
    if (theme === "light") setTheme("dark")
    else if (theme === "dark") setTheme("system")
    else setTheme("light")
  }

  const icon =
    theme === "dark" ? <Moon className="w-4 h-4" /> :
    theme === "system" ? <Monitor className="w-4 h-4" /> :
    <Sun className="w-4 h-4" />

  const label =
    theme === "dark" ? "Dark" :
    theme === "system" ? "System" :
    "Light"

  return (
    <button
      onClick={cycle}
      className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      aria-label={`Theme: ${label}. Click to change.`}
      title={`Theme: ${label}`}
    >
      {icon}
    </button>
  )
}
