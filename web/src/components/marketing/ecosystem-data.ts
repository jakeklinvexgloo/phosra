/*
 * Ecosystem Section — Platform Data & Icon Mappings
 *
 * Maps every platform to its simple-icons slug (for SVG rendering)
 * and an optional hex color override. Platforms without a simple-icons
 * match get a text-initial fallback rendered by PlatformIcon.
 */

/* ── Types ─────────────────────────────────────────────────────────── */

export interface PlatformEntry {
  name: string
  /** simple-icons export key, e.g. "siNetflix". null = use text fallback */
  iconKey: string | null
  /** Brand hex color (without #). Falls back to category color if null */
  hex: string | null
}

export interface PlatformCategory {
  category: string
  /** Short label for filter chips */
  shortLabel: string
  items: PlatformEntry[]
  /** Tailwind color class for left border + badge */
  accentClass: string
  /** Hex color for icon fallback circles */
  accentHex: string
}

/* ── Helper to define platforms concisely ──────────────────────────── */

function p(name: string, iconKey: string | null = null, hex: string | null = null): PlatformEntry {
  return { name, iconKey, hex }
}

/* ── LEFT SIDE: Where parents set controls ────────────────────────── */

export const CONTROL_SOURCES: PlatformCategory[] = [
  {
    category: "Parental Controls Apps",
    shortLabel: "Parental Apps",
    accentClass: "text-emerald-600 bg-emerald-50 border-emerald-400",
    accentHex: "10B981",
    items: [
      p("Bark"),
      p("Qustodio"),
      p("Aura"),
      p("Net Nanny"),
      p("Norton Family", "siNorton", "FDB511"),
      p("Kaspersky Safe Kids", "siKaspersky", "006D5C"),
      p("FamilyTime"),
      p("OurPact"),
      p("Mobicip"),
      p("Canopy"),
      p("Covenant Eyes"),
      p("Kidslox"),
      p("Boomerang"),
      p("MMGuardian"),
      p("Life360", "siLife360", "62CC2F"),
      p("Famisafe"),
    ],
  },
  {
    category: "Built-in Platform Controls",
    shortLabel: "Built-in",
    accentClass: "text-blue-600 bg-blue-50 border-blue-400",
    accentHex: "3B82F6",
    items: [
      p("Apple Screen Time", "siApple", "000000"),
      p("Google Family Link", "siGoogle", "4285F4"),
      p("Microsoft Family Safety", "siMicrosoft", "5E5E5E"),
      p("Samsung Kids", "siSamsung", "1428A0"),
      p("Amazon Kids+"),
    ],
  },
  {
    category: "ISP & Carrier Tools",
    shortLabel: "ISP & Carrier",
    accentClass: "text-violet-600 bg-violet-50 border-violet-400",
    accentHex: "7C3AED",
    items: [
      p("Xfinity xFi"),
      p("Verizon Smart Family"),
      p("AT&T Secure Family"),
      p("T-Mobile FamilyMode"),
      p("Spectrum WiFi"),
      p("Cox Panoramic"),
      p("Google Fiber", "siGooglefiber", "E37400"),
    ],
  },
  {
    category: "School & Institutional",
    shortLabel: "Schools",
    accentClass: "text-amber-600 bg-amber-50 border-amber-400",
    accentHex: "D97706",
    items: [
      p("GoGuardian"),
      p("Lightspeed Systems"),
      p("Gaggle"),
      p("Bark for Schools"),
      p("Securly"),
      p("Linewize"),
      p("Hapara"),
    ],
  },
]

/* ── RIGHT SIDE: What gets controlled ─────────────────────────────── */

export const ENFORCEMENT_TARGETS: PlatformCategory[] = [
  {
    category: "Streaming",
    shortLabel: "Streaming",
    accentClass: "text-emerald-600 bg-emerald-50 border-emerald-400",
    accentHex: "10B981",
    items: [
      p("Netflix", "siNetflix", "E50914"),
      p("Disney+", "siDisney", "113CCF"),
      p("Hulu"),
      p("Max"),
      p("Paramount+", "siParamountplus", "0064FF"),
      p("Peacock"),
      p("Apple TV+", "siAppletv", "000000"),
      p("Prime Video"),
      p("YouTube TV", "siYoutubetv", "FF0000"),
      p("ESPN+"),
      p("Crunchyroll", "siCrunchyroll", "FF5E00"),
      p("Tubi"),
      p("Pluto TV"),
      p("Sling TV"),
      p("FuboTV"),
      p("Discovery+"),
      p("Starz"),
      p("AMC+"),
      p("BET+"),
      p("Roku Channel", "siRoku", "6F1AB1"),
    ],
  },
  {
    category: "Social Media",
    shortLabel: "Social",
    accentClass: "text-purple-600 bg-purple-50 border-purple-400",
    accentHex: "9333EA",
    items: [
      p("TikTok", "siTiktok", "000000"),
      p("Instagram", "siInstagram", "FF0069"),
      p("Snapchat", "siSnapchat", "FFFC00"),
      p("Facebook", "siFacebook", "0866FF"),
      p("X", "siX", "000000"),
      p("Reddit", "siReddit", "FF4500"),
      p("Threads", "siThreads", "000000"),
      p("BeReal", "siBereal", "0B0B0B"),
      p("Pinterest", "siPinterest", "BD081C"),
      p("Tumblr", "siTumblr", "36465D"),
      p("VSCO"),
      p("Yubo"),
      p("Lemon8"),
      p("Bluesky", "siBluesky", "0285FF"),
      p("Discord", "siDiscord", "5865F2"),
    ],
  },
  {
    category: "Gaming",
    shortLabel: "Gaming",
    accentClass: "text-teal-600 bg-teal-50 border-teal-400",
    accentHex: "0D9488",
    items: [
      p("Roblox", "siRoblox", "000000"),
      p("Minecraft"),
      p("Fortnite", "siFortnite", "000000"),
      p("Steam", "siSteam", "000000"),
      p("PlayStation", "siPlaystation", "0070D1"),
      p("Xbox"),
      p("Nintendo Switch"),
      p("Epic Games", "siEpicgames", "313131"),
      p("Apple Arcade"),
      p("Twitch", "siTwitch", "9146FF"),
      p("Kick"),
      p("Meta Quest", "siMeta", "0081FB"),
      p("GeForce NOW"),
      p("Rec Room"),
      p("Among Us"),
      p("Brawl Stars"),
    ],
  },
  {
    category: "Devices & OS",
    shortLabel: "Devices",
    accentClass: "text-slate-600 bg-slate-50 border-slate-400",
    accentHex: "475569",
    items: [
      p("Android", "siAndroid", "34A853"),
      p("iOS", "siApple", "000000"),
      p("iPadOS", "siApple", "000000"),
      p("Windows", "siWindows", "0078D4"),
      p("macOS", "siMacos", "000000"),
      p("ChromeOS", "siGooglechrome", "4285F4"),
      p("Fire OS"),
      p("Kindle"),
      p("Fire Tablet"),
      p("Apple Watch", "siApple", "000000"),
      p("Gabb Watch"),
      p("Gabb Phone"),
      p("Pinwheel"),
      p("Bark Phone"),
    ],
  },
  {
    category: "Smart TV & Streaming Devices",
    shortLabel: "Smart TV",
    accentClass: "text-indigo-600 bg-indigo-50 border-indigo-400",
    accentHex: "4F46E5",
    items: [
      p("Samsung Tizen", "siSamsung", "1428A0"),
      p("LG webOS", "siLg", "A50034"),
      p("Roku", "siRoku", "6F1AB1"),
      p("Fire TV"),
      p("Apple TV", "siAppletv", "000000"),
      p("Android TV", "siAndroid", "34A853"),
      p("Google TV", "siGoogle", "4285F4"),
      p("Chromecast", "siGooglechromecast", "999999"),
      p("Vizio SmartCast"),
      p("NVIDIA Shield", "siNvidia", "76B900"),
    ],
  },
  {
    category: "Music & Audio",
    shortLabel: "Music",
    accentClass: "text-fuchsia-600 bg-fuchsia-50 border-fuchsia-400",
    accentHex: "C026D3",
    items: [
      p("Spotify", "siSpotify", "1ED760"),
      p("Apple Music", "siApplemusic", "FA243C"),
      p("YouTube Music", "siYoutubemusic", "FF0000"),
      p("Amazon Music"),
      p("SoundCloud", "siSoundcloud", "FF3300"),
      p("Pandora", "siPandora", "224099"),
      p("Tidal", "siTidal", "000000"),
      p("Deezer", "siDeezer", "A238FF"),
      p("Audible", "siAudible", "F8991C"),
    ],
  },
  {
    category: "Messaging",
    shortLabel: "Messaging",
    accentClass: "text-blue-600 bg-blue-50 border-blue-400",
    accentHex: "3B82F6",
    items: [
      p("WhatsApp", "siWhatsapp", "25D366"),
      p("iMessage", "siApple", "000000"),
      p("Messenger", "siFacebookmessenger", "168AFF"),
      p("Telegram", "siTelegram", "26A5E4"),
      p("Signal", "siSignal", "3B45FD"),
      p("Kik"),
      p("GroupMe"),
      p("Google Chat", "siGooglechat", "34A853"),
      p("Viber", "siViber", "7360F2"),
      p("Line", "siLine", "00C300"),
    ],
  },
  {
    category: "AI & Chatbots",
    shortLabel: "AI",
    accentClass: "text-cyan-600 bg-cyan-50 border-cyan-400",
    accentHex: "0891B2",
    items: [
      p("ChatGPT"),
      p("Claude", "siClaude", "D97757"),
      p("Gemini", "siGooglegemini", "8E75B2"),
      p("Copilot", "siGithubcopilot", "000000"),
      p("Character.ai"),
      p("Perplexity", "siPerplexity", "1FB8CD"),
      p("Grok"),
      p("Replika"),
      p("Midjourney"),
      p("DALL-E"),
    ],
  },
  {
    category: "Network & DNS",
    shortLabel: "Network",
    accentClass: "text-emerald-600 bg-emerald-50 border-emerald-400",
    accentHex: "10B981",
    items: [
      p("NextDNS"),
      p("CleanBrowsing"),
      p("OpenDNS"),
      p("Cloudflare Family", "siCloudflare", "F38020"),
      p("AdGuard DNS", "siAdguard", "68BC71"),
      p("Pi-hole", "siPihole", "96060C"),
      p("Eero"),
      p("Circle"),
      p("Gryphon"),
      p("Firewalla"),
    ],
  },
  {
    category: "Browsers & Search",
    shortLabel: "Browsers",
    accentClass: "text-orange-600 bg-orange-50 border-orange-400",
    accentHex: "EA580C",
    items: [
      p("Chrome", "siGooglechrome", "4285F4"),
      p("Safari", "siSafari", "006CFF"),
      p("Firefox", "siFirefox", "FF7139"),
      p("Edge", "siMicrosoftedge", "0078D7"),
      p("Brave", "siBrave", "FB542B"),
      p("Google Search", "siGoogle", "4285F4"),
      p("Bing", "siMicrosoftbing", "258FFA"),
      p("DuckDuckGo", "siDuckduckgo", "DE5833"),
      p("Kiddle"),
    ],
  },
  {
    category: "Education",
    shortLabel: "Education",
    accentClass: "text-yellow-600 bg-yellow-50 border-yellow-400",
    accentHex: "CA8A04",
    items: [
      p("Khan Academy", "siKhanacademy", "14BF96"),
      p("YouTube Kids", "siYoutube", "FF0000"),
      p("Duolingo", "siDuolingo", "58CC02"),
      p("PBS Kids"),
      p("Google Classroom", "siGoogleclassroom", "0F9D58"),
      p("Scratch", "siScratch", "4D97FF"),
      p("Kahoot"),
      p("IXL"),
      p("Epic!"),
      p("Outschool"),
    ],
  },
  {
    category: "Shopping & Payments",
    shortLabel: "Shopping",
    accentClass: "text-pink-600 bg-pink-50 border-pink-400",
    accentHex: "DB2777",
    items: [
      p("Amazon"),
      p("eBay", "siEbay", "E53238"),
      p("Shein", "siShein", "000000"),
      p("Temu"),
      p("Cash App", "siCashapp", "00C853"),
      p("Venmo", "siVenmo", "008CFF"),
      p("Greenlight"),
      p("GoHenry"),
    ],
  },
  {
    category: "Smart Home",
    shortLabel: "Smart Home",
    accentClass: "text-teal-600 bg-teal-50 border-teal-400",
    accentHex: "0D9488",
    items: [
      p("Amazon Echo"),
      p("Google Nest", "siGooglenest", "EA4335"),
      p("Apple HomePod", "siApple", "000000"),
      p("Echo Show"),
      p("Nest Hub", "siGooglenest", "EA4335"),
    ],
  },
  {
    category: "VPN & Age-Restricted",
    shortLabel: "VPN",
    accentClass: "text-red-600 bg-red-50 border-red-400",
    accentHex: "DC2626",
    items: [
      p("NordVPN", "siNordvpn", "4687FF"),
      p("ExpressVPN", "siExpressvpn", "DA3940"),
      p("Surfshark", "siSurfshark", "178BF1"),
      p("Tinder", "siTinder", "FF6B6B"),
      p("Bumble", "siBumble", "FFC629"),
      p("DraftKings"),
      p("FanDuel"),
    ],
  },
]

/* ── Computed counts ──────────────────────────────────────────────── */

export const SOURCE_COUNT = CONTROL_SOURCES.reduce((sum, g) => sum + g.items.length, 0)
export const TARGET_COUNT = ENFORCEMENT_TARGETS.reduce((sum, g) => sum + g.items.length, 0)
export const TOTAL_COUNT = SOURCE_COUNT + TARGET_COUNT
export const CATEGORY_COUNT = CONTROL_SOURCES.length + ENFORCEMENT_TARGETS.length

/* ── Marquee subsets (most recognizable brands for the scroll) ───── */

export const MARQUEE_SOURCES: PlatformEntry[] = [
  ...CONTROL_SOURCES[0].items.slice(0, 6), // Top 6 parental apps
  ...CONTROL_SOURCES[1].items,              // All built-in (5)
  ...CONTROL_SOURCES[2].items.slice(0, 4),  // Top 4 ISP
  ...CONTROL_SOURCES[3].items.slice(0, 3),  // Top 3 school
]

export const MARQUEE_TARGETS: PlatformEntry[] = [
  ...ENFORCEMENT_TARGETS[0].items.slice(0, 6),  // Top streaming
  ...ENFORCEMENT_TARGETS[1].items.slice(0, 6),  // Top social
  ...ENFORCEMENT_TARGETS[2].items.slice(0, 5),  // Top gaming
  ...ENFORCEMENT_TARGETS[5].items.slice(0, 3),  // Top music
  ...ENFORCEMENT_TARGETS[7].items.slice(0, 4),  // Top AI
  ...ENFORCEMENT_TARGETS[9].items.slice(0, 3),  // Top browsers
  ...ENFORCEMENT_TARGETS[6].items.slice(0, 3),  // Top messaging
]
