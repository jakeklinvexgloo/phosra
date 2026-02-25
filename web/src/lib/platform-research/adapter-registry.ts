import type { PlatformResearchAdapter } from "./types"

// Lazy imports to avoid loading all adapters at startup
const adapterFactories: Record<string, () => Promise<PlatformResearchAdapter>> = {
  // Streaming
  netflix: () => import("./adapters/netflix").then((m) => new m.NetflixAdapter()),
  youtube: () => import("./adapters/youtube").then((m) => new m.YouTubeAdapter()),
  "disney-plus": () => import("./adapters/disney-plus").then((m) => new m.DisneyPlusAdapter()),
  hulu: () => import("./adapters/hulu").then((m) => new m.HuluAdapter()),

  // Social
  tiktok: () => import("./adapters/tiktok").then((m) => new m.TikTokAdapter()),
  instagram: () => import("./adapters/instagram").then((m) => new m.InstagramAdapter()),
  snapchat: () => import("./adapters/snapchat").then((m) => new m.SnapchatAdapter()),

  // Gaming / Music
  roblox: () => import("./adapters/roblox").then((m) => new m.RobloxAdapter()),
  spotify: () => import("./adapters/spotify").then((m) => new m.SpotifyAdapter()),
  xbox: () => import("./adapters/xbox").then((m) => new m.XboxAdapter()),
}

/**
 * Get an adapter instance for a platform.
 * Returns null if no adapter is available.
 */
export async function getAdapter(platformId: string): Promise<PlatformResearchAdapter | null> {
  const factory = adapterFactories[platformId]
  if (!factory) return null
  return factory()
}

/**
 * Get all platform IDs that have research adapters.
 */
export function getAdapterPlatformIds(): string[] {
  return Object.keys(adapterFactories)
}

/**
 * Check if a platform has a research adapter.
 */
export function hasAdapter(platformId: string): boolean {
  return platformId in adapterFactories
}
