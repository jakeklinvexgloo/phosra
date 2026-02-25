import type { Platform } from "./types"

/**
 * Registry of all kids' applications and streaming providers that Phosra
 * researches for parental control capabilities.
 *
 * Organized by category. Each entry includes the credential env var keys
 * so Playwright scripts know which credentials to load.
 */
export const platformRegistry: Platform[] = [
  // ══════════════════════════════════════════════════════════════
  // STREAMING PROVIDERS
  // ══════════════════════════════════════════════════════════════
  {
    id: "netflix",
    name: "Netflix",
    category: "streaming",
    website: "https://www.netflix.com",
    parentalControlsUrl: "https://www.netflix.com/settings/parental-controls",
    hasApi: false,
    hasOAuth: false,
    credentialKeys: { email: "NETFLIX_EMAIL", password: "NETFLIX_PASSWORD" },
    estimatedKidUsers: "50M+",
    audience: "Family streaming — profiles, maturity ratings, Kids experience",
    tags: ["profiles", "maturity-ratings", "kids-profile", "pin-protection", "viewing-activity"],
  },
  {
    id: "disney-plus",
    name: "Disney+",
    category: "streaming",
    website: "https://www.disneyplus.com",
    parentalControlsUrl: "https://www.disneyplus.com/account/parental-controls",
    hasApi: false,
    hasOAuth: false,
    credentialKeys: { email: "DISNEY_PLUS_EMAIL", password: "DISNEY_PLUS_PASSWORD" },
    estimatedKidUsers: "40M+",
    audience: "Family-first streaming — content ratings, Junior Mode, profiles",
    tags: ["profiles", "content-ratings", "junior-mode", "pin-protection", "group-watch"],
  },
  {
    id: "amazon-prime-video",
    name: "Amazon Prime Video",
    category: "streaming",
    website: "https://www.amazon.com/gp/video",
    parentalControlsUrl: "https://www.amazon.com/gp/video/settings/parental-controls",
    hasApi: false,
    hasOAuth: false,
    credentialKeys: { email: "AMAZON_PRIME_EMAIL", password: "AMAZON_PRIME_PASSWORD" },
    estimatedKidUsers: "30M+",
    audience: "Family streaming with Amazon Kids+ integration and purchase controls",
    tags: ["profiles", "pin-protection", "purchase-controls", "kids-plus", "content-ratings"],
  },
  {
    id: "youtube",
    name: "YouTube / YouTube Kids",
    category: "streaming",
    website: "https://www.youtube.com",
    parentalControlsUrl: "https://www.youtube.com/account_privacy",
    hasApi: true,
    hasOAuth: true,
    credentialKeys: { email: "YOUTUBE_EMAIL", password: "YOUTUBE_PASSWORD" },
    estimatedKidUsers: "80M+",
    audience: "Largest video platform — Supervised accounts, Restricted Mode, YouTube Kids app",
    tags: ["supervised-accounts", "restricted-mode", "youtube-kids", "search-controls", "comment-controls", "watch-history"],
  },
  {
    id: "apple-tv-plus",
    name: "Apple TV+",
    category: "streaming",
    website: "https://tv.apple.com",
    parentalControlsUrl: "https://support.apple.com/guide/tv/parental-controls",
    hasApi: false,
    hasOAuth: false,
    credentialKeys: { email: "APPLE_TV_EMAIL", password: "APPLE_TV_PASSWORD" },
    estimatedKidUsers: "15M+",
    audience: "Apple ecosystem streaming with Screen Time integration",
    tags: ["content-ratings", "screen-time", "family-sharing", "restrictions"],
  },
  {
    id: "hulu",
    name: "Hulu",
    category: "streaming",
    website: "https://www.hulu.com",
    parentalControlsUrl: "https://secure.hulu.com/account",
    hasApi: false,
    hasOAuth: false,
    credentialKeys: { email: "HULU_EMAIL", password: "HULU_PASSWORD" },
    estimatedKidUsers: "15M+",
    audience: "Streaming with Kids Hub and content age ratings",
    tags: ["kids-hub", "profiles", "content-ratings", "pin-protection"],
  },
  {
    id: "peacock",
    name: "Peacock",
    category: "streaming",
    website: "https://www.peacocktv.com",
    parentalControlsUrl: "https://www.peacocktv.com/account/parental-controls",
    hasApi: false,
    hasOAuth: false,
    credentialKeys: { email: "PEACOCK_EMAIL", password: "PEACOCK_PASSWORD" },
    estimatedKidUsers: "8M+",
    audience: "NBC Universal streaming with Kids Mode",
    tags: ["kids-mode", "content-ratings", "profiles", "pin-protection"],
  },
  {
    id: "paramount-plus",
    name: "Paramount+",
    category: "streaming",
    website: "https://www.paramountplus.com",
    parentalControlsUrl: "https://www.paramountplus.com/account/parental-controls/",
    hasApi: false,
    hasOAuth: false,
    credentialKeys: { email: "PARAMOUNT_PLUS_EMAIL", password: "PARAMOUNT_PLUS_PASSWORD" },
    estimatedKidUsers: "10M+",
    audience: "Family streaming with Nickelodeon content and kids profiles",
    tags: ["kids-mode", "content-ratings", "nickelodeon", "profiles"],
  },
  {
    id: "hbo-max",
    name: "Max (HBO)",
    category: "streaming",
    website: "https://www.max.com",
    parentalControlsUrl: "https://www.max.com/settings/parental-controls",
    hasApi: false,
    hasOAuth: false,
    credentialKeys: { email: "HBO_MAX_EMAIL", password: "HBO_MAX_PASSWORD" },
    estimatedKidUsers: "12M+",
    audience: "Family streaming with Kids Profile and Cartoon Network/HBO content",
    tags: ["kids-profile", "content-ratings", "pin-protection", "profiles"],
  },

  // ══════════════════════════════════════════════════════════════
  // GAMING PLATFORMS
  // ══════════════════════════════════════════════════════════════
  {
    id: "roblox",
    name: "Roblox",
    category: "gaming",
    website: "https://www.roblox.com",
    parentalControlsUrl: "https://www.roblox.com/my/account#!/parental-controls",
    hasApi: true,
    hasOAuth: false,
    credentialKeys: { email: "ROBLOX_EMAIL", password: "ROBLOX_PASSWORD" },
    estimatedKidUsers: "70M+",
    audience: "Largest kids gaming platform — age verification, spending limits, chat filters",
    tags: ["age-verification", "spending-limits", "chat-filters", "experience-ratings", "screen-time", "contact-restrictions"],
  },
  {
    id: "minecraft",
    name: "Minecraft",
    category: "gaming",
    website: "https://www.minecraft.net",
    parentalControlsUrl: "https://account.xbox.com/settings",
    hasApi: false,
    hasOAuth: false,
    credentialKeys: { email: "MINECRAFT_EMAIL", password: "MINECRAFT_PASSWORD" },
    estimatedKidUsers: "40M+",
    audience: "Block-building game — Xbox family settings, multiplayer controls, chat",
    tags: ["xbox-family", "multiplayer-controls", "chat-controls", "realms-permissions", "marketplace"],
  },
  {
    id: "fortnite",
    name: "Fortnite / Epic Games",
    category: "gaming",
    website: "https://www.fortnite.com",
    parentalControlsUrl: "https://www.epicgames.com/account/parental-controls",
    hasApi: false,
    hasOAuth: false,
    credentialKeys: { email: "FORTNITE_EMAIL", password: "FORTNITE_PASSWORD" },
    estimatedKidUsers: "30M+",
    audience: "Battle royale with Cabined Accounts, playtime limits, spending controls",
    tags: ["cabined-accounts", "playtime-limits", "spending-controls", "voice-chat", "text-chat", "content-ratings"],
  },

  // ══════════════════════════════════════════════════════════════
  // SOCIAL / VIDEO PLATFORMS
  // ══════════════════════════════════════════════════════════════
  {
    id: "tiktok",
    name: "TikTok",
    category: "social",
    website: "https://www.tiktok.com",
    parentalControlsUrl: "https://www.tiktok.com/setting/family-pairing",
    hasApi: false,
    hasOAuth: false,
    credentialKeys: { email: "TIKTOK_EMAIL", password: "TIKTOK_PASSWORD" },
    estimatedKidUsers: "50M+",
    audience: "Short-form video — Family Pairing, screen time, restricted mode, DM controls",
    tags: ["family-pairing", "screen-time", "restricted-mode", "dm-controls", "content-filters", "privacy-settings"],
  },
  {
    id: "instagram",
    name: "Instagram",
    category: "social",
    website: "https://www.instagram.com",
    parentalControlsUrl: "https://help.instagram.com/teen-accounts",
    hasApi: true,
    hasOAuth: true,
    credentialKeys: { email: "INSTAGRAM_EMAIL", password: "INSTAGRAM_PASSWORD" },
    estimatedKidUsers: "40M+",
    audience: "Photo/video social — Teen Accounts, supervision, sensitive content controls",
    tags: ["teen-accounts", "supervision", "sensitive-content", "dm-controls", "time-limits", "notification-pausing"],
  },
  {
    id: "snapchat",
    name: "Snapchat",
    category: "social",
    website: "https://www.snapchat.com",
    parentalControlsUrl: "https://support.snapchat.com/a/family-center",
    hasApi: false,
    hasOAuth: false,
    credentialKeys: { email: "SNAPCHAT_EMAIL", password: "SNAPCHAT_PASSWORD" },
    estimatedKidUsers: "30M+",
    audience: "Messaging/stories — Family Center, contact restrictions, content controls",
    tags: ["family-center", "contact-restrictions", "content-controls", "location-sharing", "my-ai-controls"],
  },
  {
    id: "discord",
    name: "Discord",
    category: "social",
    website: "https://discord.com",
    parentalControlsUrl: "https://discord.com/safety/family-center",
    hasApi: true,
    hasOAuth: true,
    credentialKeys: { email: "DISCORD_EMAIL", password: "DISCORD_PASSWORD" },
    estimatedKidUsers: "25M+",
    audience: "Gaming/community chat — Family Center, content filters, DM safety",
    tags: ["family-center", "safe-messaging", "content-filters", "server-discovery", "age-verification"],
  },

  // ══════════════════════════════════════════════════════════════
  // DEVICE / OS PARENTAL CONTROLS
  // ══════════════════════════════════════════════════════════════
  {
    id: "google-family-link",
    name: "Google Family Link",
    category: "device",
    website: "https://families.google.com",
    parentalControlsUrl: "https://families.google.com/families",
    hasApi: true,
    hasOAuth: true,
    credentialKeys: { email: "GOOGLE_FAMILY_LINK_EMAIL", password: "GOOGLE_FAMILY_LINK_PASSWORD" },
    estimatedKidUsers: "50M+",
    audience: "Android/Chrome device management — app approval, screen time, location, web filters",
    tags: ["app-approval", "screen-time", "location-tracking", "web-filters", "purchase-approval", "device-lock"],
  },
  {
    id: "apple-screen-time",
    name: "Apple Screen Time",
    category: "device",
    website: "https://support.apple.com/screen-time",
    parentalControlsUrl: "https://support.apple.com/en-us/HT208982",
    hasApi: false,
    hasOAuth: false,
    credentialKeys: { email: "APPLE_SCREEN_TIME_EMAIL", password: "APPLE_SCREEN_TIME_PASSWORD" },
    estimatedKidUsers: "60M+",
    audience: "iOS/macOS device controls — app limits, downtime, content restrictions, communication limits",
    tags: ["app-limits", "downtime", "content-restrictions", "communication-limits", "purchase-controls", "location"],
  },
  {
    id: "amazon-kids-plus",
    name: "Amazon Kids+",
    category: "device",
    website: "https://www.amazon.com/ftu/home",
    parentalControlsUrl: "https://parents.amazon.com",
    hasApi: false,
    hasOAuth: false,
    credentialKeys: { email: "AMAZON_KIDS_PLUS_EMAIL", password: "AMAZON_KIDS_PLUS_PASSWORD" },
    estimatedKidUsers: "10M+",
    audience: "Amazon tablet/Fire controls — curated content, time limits, educational goals, web browser filters",
    tags: ["curated-content", "time-limits", "educational-goals", "web-filters", "age-filters", "bedtime-settings"],
  },
]

// ── Helpers ──────────────────────────────────────────────────────

export function getPlatform(id: string): Platform | undefined {
  return platformRegistry.find((p) => p.id === id)
}

export function getPlatformsByCategory(category: Platform["category"]): Platform[] {
  return platformRegistry.find((p) => p.category === category)
    ? platformRegistry.filter((p) => p.category === category)
    : []
}

export const CATEGORY_LABELS: Record<Platform["category"], string> = {
  streaming: "Streaming Providers",
  gaming: "Gaming Platforms",
  social: "Social & Video",
  device: "Device / OS Controls",
  education: "Education",
}

export const CATEGORY_ORDER: Platform["category"][] = [
  "streaming",
  "gaming",
  "social",
  "device",
  "education",
]
