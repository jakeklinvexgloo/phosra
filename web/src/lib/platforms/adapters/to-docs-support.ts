/*
 * Adapter: Registry → Docs Support Matrix
 *
 * Generates the 5 adapter-backed platform names used in the docs support matrix.
 */

import { PLATFORM_REGISTRY } from "../registry"
import type { PlatformRegistryEntry } from "../types"

/** Platform display names for the docs support matrix (adapter-backed platforms only) */
export const DOCS_PLATFORM_NAMES = [
  "NextDNS",
  "CleanBrowsing",
  "Android",
  "Apple MDM",
  "Microsoft",
] as const

export type DocsPlatformName = (typeof DOCS_PLATFORM_NAMES)[number]

/** Helper to build PlatformInfo[] arrays for category references */
export function buildPlatformSupport(
  supports: Partial<Record<DocsPlatformName, "full" | "partial" | "none">>,
): { name: string; support: "full" | "partial" | "none" }[] {
  return DOCS_PLATFORM_NAMES.map((name) => ({
    name,
    support: supports[name] ?? "none",
  }))
}

/** Get the registry entry for a docs platform by display name */
export function getDocsPlatformEntry(name: DocsPlatformName): PlatformRegistryEntry | undefined {
  const nameMap: Record<DocsPlatformName, string> = {
    "NextDNS": "nextdns",
    "CleanBrowsing": "cleanbrowsing",
    "Android": "android",
    "Apple MDM": "apple_screen_time",
    "Microsoft": "microsoft_family_safety",
  }
  return PLATFORM_REGISTRY.find((p) => p.id === nameMap[name])
}
