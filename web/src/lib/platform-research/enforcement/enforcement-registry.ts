import type { BrowserEnforcementAdapter } from "./types"

// Lazy imports to avoid loading all adapters at startup
const enforcementAdapterFactories: Record<string, () => Promise<BrowserEnforcementAdapter>> = {
  netflix: () => import("./adapters/netflix").then((m) => new m.NetflixEnforcementAdapter()),
  youtube: () => import("./adapters/youtube").then((m) => new m.YouTubeEnforcementAdapter()),
  roblox: () => import("./adapters/roblox").then((m) => new m.RobloxEnforcementAdapter()),
}

/**
 * Get an enforcement adapter instance for a platform.
 * Returns null if no adapter is available.
 */
export async function getEnforcementAdapter(
  platformId: string,
): Promise<BrowserEnforcementAdapter | null> {
  const factory = enforcementAdapterFactories[platformId]
  if (!factory) return null
  return factory()
}

/**
 * Get all platform IDs that have enforcement adapters.
 */
export function getEnforcementAdapterIds(): string[] {
  return Object.keys(enforcementAdapterFactories)
}

/**
 * Check if a platform has an enforcement adapter.
 */
export function hasEnforcementAdapter(platformId: string): boolean {
  return platformId in enforcementAdapterFactories
}
