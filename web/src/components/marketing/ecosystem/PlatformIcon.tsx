"use client"

import { ICON_PATHS } from "./icon-paths"
import type { PlatformEntry } from "../ecosystem-data"

interface PlatformIconProps {
  platform: PlatformEntry
  size?: number
  grayscale?: boolean
  /** Fallback color hex (without #) when platform has no icon */
  fallbackHex?: string
  className?: string
}

export function PlatformIcon({
  platform,
  size = 20,
  grayscale = true,
  fallbackHex = "94A3B8",
  className = "",
}: PlatformIconProps) {
  const icon = platform.iconKey ? ICON_PATHS[platform.iconKey] ?? null : null
  const fillColor = platform.hex ? `#${platform.hex}` : icon ? `#${icon.hex}` : `#${fallbackHex}`

  if (!icon) {
    // Text-initial fallback
    const initial = platform.name.charAt(0).toUpperCase()
    return (
      <div
        className={`inline-flex items-center justify-center rounded-full flex-shrink-0 ${className}`}
        style={{ width: size, height: size, backgroundColor: `#${fallbackHex}20` }}
      >
        <span
          className="font-semibold leading-none"
          style={{ fontSize: size * 0.45, color: `#${fallbackHex}` }}
        >
          {initial}
        </span>
      </div>
    )
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill={grayscale ? "#94A3B8" : fillColor}
      className={`flex-shrink-0 transition-colors duration-200 ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <path d={icon.path} />
    </svg>
  )
}
