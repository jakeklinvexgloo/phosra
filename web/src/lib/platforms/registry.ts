/*
 * Unified Platform Registry — Single Source of Truth
 *
 * Every platform Phosra supports or plans to support is listed here.
 * Adapters in ./adapters/ derive marketing, docs, and page data from this file.
 * To add a platform, add an entry here — no other files need modification.
 */

import type { CategoryMeta, IntegrationTier, PlatformCategorySlug, PlatformRegistryEntry, PlatformSide } from "./types"

/* ── Category Metadata ──────────────────────────────────────────── */

export const CATEGORY_META: CategoryMeta[] = [
  // Sources (4)
  { slug: "parental_apps", label: "Parental Controls Apps", shortLabel: "Parental Apps", side: "source", accentClass: "text-emerald-600 bg-emerald-50 border-emerald-400", accentHex: "10B981" },
  { slug: "builtin_controls", label: "Built-in Platform Controls", shortLabel: "Built-in", side: "source", accentClass: "text-blue-600 bg-blue-50 border-blue-400", accentHex: "3B82F6" },
  { slug: "isp_carrier", label: "ISP & Carrier Tools", shortLabel: "ISP & Carrier", side: "source", accentClass: "text-violet-600 bg-violet-50 border-violet-400", accentHex: "7C3AED" },
  { slug: "school_institutional", label: "School & Institutional", shortLabel: "Schools", side: "source", accentClass: "text-amber-600 bg-amber-50 border-amber-400", accentHex: "D97706" },
  // Targets (14)
  { slug: "streaming", label: "Streaming", shortLabel: "Streaming", side: "target", accentClass: "text-emerald-600 bg-emerald-50 border-emerald-400", accentHex: "10B981", dbCategory: "streaming" },
  { slug: "social_media", label: "Social Media", shortLabel: "Social", side: "target", accentClass: "text-purple-600 bg-purple-50 border-purple-400", accentHex: "9333EA" },
  { slug: "gaming", label: "Gaming", shortLabel: "Gaming", side: "target", accentClass: "text-teal-600 bg-teal-50 border-teal-400", accentHex: "0D9488", dbCategory: "gaming" },
  { slug: "devices_os", label: "Devices & OS", shortLabel: "Devices", side: "target", accentClass: "text-slate-600 bg-slate-50 border-slate-400", accentHex: "475569", dbCategory: "device" },
  { slug: "smart_tv", label: "Smart TV & Streaming Devices", shortLabel: "Smart TV", side: "target", accentClass: "text-indigo-600 bg-indigo-50 border-indigo-400", accentHex: "4F46E5" },
  { slug: "music_audio", label: "Music & Audio", shortLabel: "Music", side: "target", accentClass: "text-fuchsia-600 bg-fuchsia-50 border-fuchsia-400", accentHex: "C026D3" },
  { slug: "messaging", label: "Messaging", shortLabel: "Messaging", side: "target", accentClass: "text-blue-600 bg-blue-50 border-blue-400", accentHex: "3B82F6" },
  { slug: "ai_chatbots", label: "AI & Chatbots", shortLabel: "AI", side: "target", accentClass: "text-cyan-600 bg-cyan-50 border-cyan-400", accentHex: "0891B2" },
  { slug: "network_dns", label: "Network & DNS", shortLabel: "Network", side: "target", accentClass: "text-emerald-600 bg-emerald-50 border-emerald-400", accentHex: "10B981", dbCategory: "dns" },
  { slug: "browsers_search", label: "Browsers & Search", shortLabel: "Browsers", side: "target", accentClass: "text-orange-600 bg-orange-50 border-orange-400", accentHex: "EA580C", dbCategory: "browser" },
  { slug: "education", label: "Education", shortLabel: "Education", side: "target", accentClass: "text-yellow-600 bg-yellow-50 border-yellow-400", accentHex: "CA8A04" },
  { slug: "shopping_payments", label: "Shopping & Payments", shortLabel: "Shopping", side: "target", accentClass: "text-pink-600 bg-pink-50 border-pink-400", accentHex: "DB2777" },
  { slug: "smart_home", label: "Smart Home", shortLabel: "Smart Home", side: "target", accentClass: "text-teal-600 bg-teal-50 border-teal-400", accentHex: "0D9488" },
  { slug: "vpn_age_restricted", label: "VPN & Age-Restricted", shortLabel: "VPN", side: "target", accentClass: "text-red-600 bg-red-50 border-red-400", accentHex: "DC2626" },
]

/* ── Helper ──────────────────────────────────────────────────────── */

function p(
  id: string,
  name: string,
  category: PlatformCategorySlug,
  side: PlatformSide,
  tier: IntegrationTier,
  iconKey: string | null = null,
  hex: string | null = null,
  extra: Partial<PlatformRegistryEntry> = {},
): PlatformRegistryEntry {
  return { id, name, category, side, tier, iconKey, hex, ...extra }
}

/* ── Platform Registry ──────────────────────────────────────────── */

export const PLATFORM_REGISTRY: PlatformRegistryEntry[] = [
  // ─── Sources: Parental Controls Apps (16) ───
  p("bark", "Bark", "parental_apps", "source", "planned", null, null, { marquee: true }),
  p("qustodio", "Qustodio", "parental_apps", "source", "planned", null, null, { marquee: true }),
  p("aura", "Aura", "parental_apps", "source", "planned", null, null, { marquee: true }),
  p("net_nanny", "Net Nanny", "parental_apps", "source", "planned", null, null, { marquee: true }),
  p("norton_family", "Norton Family", "parental_apps", "source", "planned", "siNorton", "FDB511", { marquee: true }),
  p("kaspersky_safe_kids", "Kaspersky Safe Kids", "parental_apps", "source", "planned", "siKaspersky", "006D5C", { marquee: true }),
  p("familytime", "FamilyTime", "parental_apps", "source", "planned"),
  p("ourpact", "OurPact", "parental_apps", "source", "planned"),
  p("mobicip", "Mobicip", "parental_apps", "source", "planned"),
  p("canopy", "Canopy", "parental_apps", "source", "planned"),
  p("covenant_eyes", "Covenant Eyes", "parental_apps", "source", "planned"),
  p("kidslox", "Kidslox", "parental_apps", "source", "planned"),
  p("boomerang", "Boomerang", "parental_apps", "source", "planned"),
  p("mmguardian", "MMGuardian", "parental_apps", "source", "planned"),
  p("life360", "Life360", "parental_apps", "source", "planned", "siLife360", "62CC2F"),
  p("famisafe", "Famisafe", "parental_apps", "source", "planned"),

  // ─── Sources: Built-in Platform Controls (5) ───
  p("apple_screen_time", "Apple Screen Time", "builtin_controls", "source", "partial", "siApple", "000000", { marquee: true, dbPlatformId: "apple" }),
  p("google_family_link", "Google Family Link", "builtin_controls", "source", "planned", "siGoogle", "4285F4", { marquee: true }),
  p("microsoft_family_safety", "Microsoft Family Safety", "builtin_controls", "source", "partial", "siMicrosoft", "5E5E5E", { marquee: true, dbPlatformId: "microsoft" }),
  p("samsung_kids", "Samsung Kids", "builtin_controls", "source", "planned", "siSamsung", "1428A0", { marquee: true }),
  p("amazon_kids_plus", "Amazon Kids+", "builtin_controls", "source", "planned", null, null, { marquee: true }),

  // ─── Sources: ISP & Carrier Tools (7) ───
  p("xfinity_xfi", "Xfinity xFi", "isp_carrier", "source", "planned", null, null, { marquee: true }),
  p("verizon_smart_family", "Verizon Smart Family", "isp_carrier", "source", "planned", null, null, { marquee: true }),
  p("att_secure_family", "AT&T Secure Family", "isp_carrier", "source", "planned", null, null, { marquee: true }),
  p("tmobile_familymode", "T-Mobile FamilyMode", "isp_carrier", "source", "planned", null, null, { marquee: true }),
  p("spectrum_wifi", "Spectrum WiFi", "isp_carrier", "source", "planned"),
  p("cox_panoramic", "Cox Panoramic", "isp_carrier", "source", "planned"),
  p("google_fiber", "Google Fiber", "isp_carrier", "source", "planned", "siGooglefiber", "E37400"),

  // ─── Sources: School & Institutional (7) ───
  p("goguardian", "GoGuardian", "school_institutional", "source", "planned", null, null, { marquee: true }),
  p("lightspeed_systems", "Lightspeed Systems", "school_institutional", "source", "planned", null, null, { marquee: true }),
  p("gaggle", "Gaggle", "school_institutional", "source", "planned", null, null, { marquee: true }),
  p("bark_for_schools", "Bark for Schools", "school_institutional", "source", "planned"),
  p("securly", "Securly", "school_institutional", "source", "planned"),
  p("linewize", "Linewize", "school_institutional", "source", "planned"),
  p("hapara", "Hapara", "school_institutional", "source", "planned"),

  // ─── Targets: Streaming (21) ───
  p("youtube", "YouTube", "streaming", "target", "planned", "siYoutube", "FF0000", { marquee: true }),
  p("netflix", "Netflix", "streaming", "target", "stub", "siNetflix", "E50914", { marquee: true, dbPlatformId: "netflix" }),
  p("disney_plus", "Disney+", "streaming", "target", "stub", "siDisney", "113CCF", { marquee: true, dbPlatformId: "disney_plus" }),
  p("hulu", "Hulu", "streaming", "target", "stub", null, null, { marquee: true, dbPlatformId: "hulu" }),
  p("max", "Max", "streaming", "target", "stub", null, null, { marquee: true, dbPlatformId: "max" }),
  p("paramount_plus", "Paramount+", "streaming", "target", "planned", "siParamountplus", "0064FF", { marquee: true }),
  p("peacock", "Peacock", "streaming", "target", "stub", null, "069DE0", { marquee: true }),
  p("apple_tv_plus", "Apple TV+", "streaming", "target", "planned", "siAppletv", "000000"),
  p("prime_video", "Prime Video", "streaming", "target", "stub", null, null, { marquee: true, dbPlatformId: "prime_video" }),
  p("youtube_tv", "YouTube TV", "streaming", "target", "planned", "siYoutubetv", "FF0000"),
  p("espn_plus", "ESPN+", "streaming", "target", "planned"),
  p("crunchyroll", "Crunchyroll", "streaming", "target", "planned", "siCrunchyroll", "FF5E00"),
  p("tubi", "Tubi", "streaming", "target", "planned"),
  p("pluto_tv", "Pluto TV", "streaming", "target", "planned"),
  p("sling_tv", "Sling TV", "streaming", "target", "planned"),
  p("fubotv", "FuboTV", "streaming", "target", "planned"),
  p("discovery_plus", "Discovery+", "streaming", "target", "planned"),
  p("starz", "Starz", "streaming", "target", "planned"),
  p("amc_plus", "AMC+", "streaming", "target", "planned"),
  p("bet_plus", "BET+", "streaming", "target", "planned"),
  p("roku_channel", "Roku Channel", "streaming", "target", "planned", "siRoku", "6F1AB1"),

  // ─── Targets: Social Media (16) ───
  p("tiktok", "TikTok", "social_media", "target", "planned", "siTiktok", "000000", { marquee: true }),
  p("instagram", "Instagram", "social_media", "target", "planned", "siInstagram", "FF0069", { marquee: true }),
  p("snapchat", "Snapchat", "social_media", "target", "planned", "siSnapchat", "FFFC00", { marquee: true }),
  p("facebook", "Facebook", "social_media", "target", "planned", "siFacebook", "0866FF", { marquee: true }),
  p("x", "X", "social_media", "target", "planned", "siX", "000000", { marquee: true }),
  p("reddit", "Reddit", "social_media", "target", "planned", "siReddit", "FF4500", { marquee: true }),
  p("threads", "Threads", "social_media", "target", "planned", "siThreads", "000000"),
  p("bereal", "BeReal", "social_media", "target", "planned", "siBereal", "0B0B0B"),
  p("pinterest", "Pinterest", "social_media", "target", "planned", "siPinterest", "BD081C"),
  p("tumblr", "Tumblr", "social_media", "target", "planned", "siTumblr", "36465D"),
  p("vsco", "VSCO", "social_media", "target", "planned"),
  p("yubo", "Yubo", "social_media", "target", "planned"),
  p("lemon8", "Lemon8", "social_media", "target", "planned"),
  p("bluesky", "Bluesky", "social_media", "target", "planned", "siBluesky", "0285FF"),
  p("discord", "Discord", "social_media", "target", "planned", "siDiscord", "5865F2"),
  p("messenger_kids", "Messenger Kids", "social_media", "target", "planned", "siFacebookmessenger", "168AFF"),

  // ─── Targets: Gaming (22) ───
  p("roblox", "Roblox", "gaming", "target", "planned", "siRoblox", "000000", { marquee: true }),
  p("minecraft", "Minecraft", "gaming", "target", "planned", null, null, { marquee: true }),
  p("fortnite", "Fortnite", "gaming", "target", "planned", "siFortnite", "000000", { marquee: true }),
  p("steam", "Steam", "gaming", "target", "planned", "siSteam", "000000", { marquee: true }),
  p("playstation", "PlayStation", "gaming", "target", "stub", "siPlaystation", "0070D1", { marquee: true, dbPlatformId: "playstation" }),
  p("xbox", "Xbox", "gaming", "target", "stub", null, null, { marquee: true, dbPlatformId: "xbox" }),
  p("nintendo_switch", "Nintendo Switch", "gaming", "target", "stub", null, null, { dbPlatformId: "nintendo" }),
  p("epic_games", "Epic Games", "gaming", "target", "planned", "siEpicgames", "313131"),
  p("apple_arcade", "Apple Arcade", "gaming", "target", "planned"),
  p("twitch", "Twitch", "gaming", "target", "planned", "siTwitch", "9146FF"),
  p("kick", "Kick", "gaming", "target", "planned"),
  p("meta_quest", "Meta Quest", "gaming", "target", "planned", "siMeta", "0081FB"),
  p("geforce_now", "GeForce NOW", "gaming", "target", "planned"),
  p("rec_room", "Rec Room", "gaming", "target", "planned"),
  p("among_us", "Among Us", "gaming", "target", "planned"),
  p("brawl_stars", "Brawl Stars", "gaming", "target", "planned"),
  p("steam_deck", "Steam Deck", "gaming", "target", "planned", "siSteamdeck", "1A9FFF"),
  p("playstation_portal", "PlayStation Portal", "gaming", "target", "planned", "siPlaystation", "0070D1"),
  p("ea_play", "EA Play", "gaming", "target", "planned", "siEa", "000000"),
  p("battle_net", "Battle.net", "gaming", "target", "planned", "siBattledotnet", "148EFF"),
  p("apple_vision_pro", "Apple Vision Pro", "gaming", "target", "planned", "siApple", "000000"),
  p("psvr2", "PlayStation VR2", "gaming", "target", "planned", "siPlaystation", "0070D1"),

  // ─── Targets: Devices & OS (39) ───
  // ── Mainstream Phones ──
  p("iphone", "iPhone", "devices_os", "target", "planned", "siApple", "000000", { marquee: true }),
  p("samsung_galaxy", "Samsung Galaxy", "devices_os", "target", "planned", "siSamsung", "1428A0", { marquee: true }),
  p("android", "Android", "devices_os", "target", "live", "siAndroid", "34A853", { marquee: true, dbPlatformId: "android" }),
  // ── Kid-Specific Phones ──
  p("gabb_phone", "Gabb Phone", "devices_os", "target", "planned"),
  p("bark_phone", "Bark Phone", "devices_os", "target", "planned"),
  p("pinwheel", "Pinwheel", "devices_os", "target", "planned"),
  p("troomi", "Troomi Phone", "devices_os", "target", "planned"),
  p("relay", "Relay", "devices_os", "target", "planned"),
  p("light_phone", "Light Phone", "devices_os", "target", "planned"),
  p("wisephone", "Wisephone", "devices_os", "target", "planned"),
  // ── Smartwatches ──
  p("apple_watch", "Apple Watch", "devices_os", "target", "planned", "siApple", "000000"),
  p("gabb_watch", "Gabb Watch", "devices_os", "target", "planned"),
  p("xplora_watch", "Xplora Watch", "devices_os", "target", "planned"),
  p("ticktalk_watch", "TickTalk Watch", "devices_os", "target", "planned"),
  p("cosmo_jrtrack", "Cosmo JrTrack Watch", "devices_os", "target", "planned"),
  p("gizmo_watch", "Verizon GizmoWatch", "devices_os", "target", "planned"),
  p("syncup_kids", "T-Mobile SyncUP KIDS Watch", "devices_os", "target", "planned"),
  p("samsung_galaxy_watch", "Samsung Galaxy Watch", "devices_os", "target", "planned", "siSamsung", "1428A0"),
  p("garmin_bounce", "Garmin Bounce", "devices_os", "target", "planned", "siGarmin", "000000"),
  // ── Tablets ──
  p("ipad", "iPad", "devices_os", "target", "planned", "siApple", "000000"),
  p("samsung_galaxy_tab", "Samsung Galaxy Tab", "devices_os", "target", "planned", "siSamsung", "1428A0"),
  p("google_pixel_tablet", "Google Pixel Tablet", "devices_os", "target", "planned", "siGoogle", "4285F4"),
  p("lenovo_tab", "Lenovo Tab", "devices_os", "target", "planned", "siLenovo", "E2231A"),
  p("surface_go", "Microsoft Surface Go", "devices_os", "target", "planned", "siMicrosoft", "5E5E5E"),
  p("fire_tablet", "Fire Tablet", "devices_os", "target", "planned"),
  p("leapfrog", "LeapFrog LeapPad", "devices_os", "target", "planned"),
  p("kurio", "Kurio Tablet", "devices_os", "target", "planned"),
  p("dragon_touch", "Dragon Touch KidzPad", "devices_os", "target", "planned"),
  p("contixo", "Contixo Kids Tablet", "devices_os", "target", "planned"),
  // ── E-Readers ──
  p("kindle", "Kindle", "devices_os", "target", "planned"),
  p("kindle_kids", "Kindle Kids", "devices_os", "target", "planned"),
  p("kobo", "Kobo E-Reader", "devices_os", "target", "planned"),
  p("nook", "Nook E-Reader", "devices_os", "target", "planned"),
  // ── Operating Systems ──
  p("ios", "iOS", "devices_os", "target", "planned", "siApple", "000000"),
  p("ipados", "iPadOS", "devices_os", "target", "planned", "siApple", "000000"),
  p("windows", "Windows", "devices_os", "target", "planned", "siWindows", "0078D4"),
  p("macos", "macOS", "devices_os", "target", "planned", "siMacos", "000000"),
  p("chromeos", "ChromeOS", "devices_os", "target", "planned", "siGooglechrome", "4285F4"),
  p("fire_os", "Fire OS", "devices_os", "target", "planned"),

  // ─── Targets: Smart TV & Streaming Devices (10) ───
  p("samsung_tizen", "Samsung Tizen", "smart_tv", "target", "planned", "siSamsung", "1428A0"),
  p("lg_webos", "LG webOS", "smart_tv", "target", "planned", "siLg", "A50034"),
  p("roku", "Roku", "smart_tv", "target", "stub", "siRoku", "6F1AB1", { dbPlatformId: "roku" }),
  p("fire_tv", "Fire TV", "smart_tv", "target", "planned"),
  p("apple_tv", "Apple TV", "smart_tv", "target", "planned", "siAppletv", "000000"),
  p("android_tv", "Android TV", "smart_tv", "target", "planned", "siAndroid", "34A853"),
  p("google_tv", "Google TV", "smart_tv", "target", "planned", "siGoogle", "4285F4"),
  p("chromecast", "Chromecast", "smart_tv", "target", "planned", "siGooglechromecast", "999999"),
  p("vizio_smartcast", "Vizio SmartCast", "smart_tv", "target", "planned"),
  p("nvidia_shield", "NVIDIA Shield", "smart_tv", "target", "planned", "siNvidia", "76B900"),

  // ─── Targets: Music & Audio (10) ───
  p("spotify", "Spotify", "music_audio", "target", "planned", "siSpotify", "1ED760", { marquee: true }),
  p("apple_music", "Apple Music", "music_audio", "target", "planned", "siApplemusic", "FA243C", { marquee: true }),
  p("youtube_music", "YouTube Music", "music_audio", "target", "planned", "siYoutubemusic", "FF0000", { marquee: true }),
  p("amazon_music", "Amazon Music", "music_audio", "target", "planned"),
  p("soundcloud", "SoundCloud", "music_audio", "target", "planned", "siSoundcloud", "FF3300"),
  p("pandora", "Pandora", "music_audio", "target", "planned", "siPandora", "224099"),
  p("tidal", "Tidal", "music_audio", "target", "planned", "siTidal", "000000"),
  p("deezer", "Deezer", "music_audio", "target", "planned", "siDeezer", "A238FF"),
  p("audible", "Audible", "music_audio", "target", "planned", "siAudible", "F8991C"),
  p("iheart_radio", "iHeartRadio", "music_audio", "target", "planned", "siIheart", "C6002B"),

  // ─── Targets: Messaging (10) ───
  p("whatsapp", "WhatsApp", "messaging", "target", "planned", "siWhatsapp", "25D366", { marquee: true }),
  p("imessage", "iMessage", "messaging", "target", "planned", "siApple", "000000", { marquee: true }),
  p("messenger", "Messenger", "messaging", "target", "planned", "siFacebookmessenger", "168AFF", { marquee: true }),
  p("telegram", "Telegram", "messaging", "target", "planned", "siTelegram", "26A5E4"),
  p("signal", "Signal", "messaging", "target", "planned", "siSignal", "3B45FD"),
  p("kik", "Kik", "messaging", "target", "planned"),
  p("groupme", "GroupMe", "messaging", "target", "planned"),
  p("google_chat", "Google Chat", "messaging", "target", "planned", "siGooglechat", "34A853"),
  p("viber", "Viber", "messaging", "target", "planned", "siViber", "7360F2"),
  p("line", "Line", "messaging", "target", "planned", "siLine", "00C300"),

  // ─── Targets: AI & Chatbots (10) ───
  p("chatgpt", "ChatGPT", "ai_chatbots", "target", "planned", null, null, { marquee: true }),
  p("claude", "Claude", "ai_chatbots", "target", "planned", "siClaude", "D97757", { marquee: true }),
  p("gemini", "Gemini", "ai_chatbots", "target", "planned", "siGooglegemini", "8E75B2", { marquee: true }),
  p("copilot", "Copilot", "ai_chatbots", "target", "planned", "siGithubcopilot", "000000", { marquee: true }),
  p("character_ai", "Character.ai", "ai_chatbots", "target", "planned"),
  p("perplexity", "Perplexity", "ai_chatbots", "target", "planned", "siPerplexity", "1FB8CD"),
  p("grok", "Grok", "ai_chatbots", "target", "planned"),
  p("replika", "Replika", "ai_chatbots", "target", "planned"),
  p("midjourney", "Midjourney", "ai_chatbots", "target", "planned"),
  p("dall_e", "DALL-E", "ai_chatbots", "target", "planned"),

  // ─── Targets: Network & DNS (14) ───
  p("nextdns", "NextDNS", "network_dns", "target", "live", null, null, { marquee: true, dbPlatformId: "nextdns" }),
  p("cleanbrowsing", "CleanBrowsing", "network_dns", "target", "live", null, null, { marquee: true, dbPlatformId: "cleanbrowsing" }),
  p("controld", "Control D", "network_dns", "target", "live", null, null, { marquee: true, dbPlatformId: "controld" }),
  p("opendns", "OpenDNS", "network_dns", "target", "planned"),
  p("cloudflare_family", "Cloudflare Family", "network_dns", "target", "planned", "siCloudflare", "F38020"),
  p("adguard_dns", "AdGuard DNS", "network_dns", "target", "planned", "siAdguard", "68BC71"),
  p("pihole", "Pi-hole", "network_dns", "target", "planned", "siPihole", "96060C"),
  p("eero", "Eero", "network_dns", "target", "planned"),
  p("circle", "Circle", "network_dns", "target", "planned"),
  p("gryphon", "Gryphon", "network_dns", "target", "planned"),
  p("firewalla", "Firewalla", "network_dns", "target", "planned"),
  p("netgear_armor", "Netgear Armor", "network_dns", "target", "planned"),
  p("tp_link_homecare", "TP-Link HomeCare", "network_dns", "target", "planned"),
  p("ubiquiti", "Ubiquiti", "network_dns", "target", "planned"),

  // ─── Targets: Browsers & Search (9) ───
  p("chrome", "Chrome", "browsers_search", "target", "planned", "siGooglechrome", "4285F4", { marquee: true }),
  p("safari", "Safari", "browsers_search", "target", "planned", "siSafari", "006CFF", { marquee: true }),
  p("firefox", "Firefox", "browsers_search", "target", "planned", "siFirefox", "FF7139", { marquee: true }),
  p("edge", "Edge", "browsers_search", "target", "planned", "siMicrosoftedge", "0078D7"),
  p("brave", "Brave", "browsers_search", "target", "planned", "siBrave", "FB542B"),
  p("google_search", "Google Search", "browsers_search", "target", "planned", "siGoogle", "4285F4"),
  p("bing", "Bing", "browsers_search", "target", "planned", "siMicrosoftbing", "258FFA"),
  p("duckduckgo", "DuckDuckGo", "browsers_search", "target", "planned", "siDuckduckgo", "DE5833"),
  p("kiddle", "Kiddle", "browsers_search", "target", "planned"),

  // ─── Targets: Education (13) ───
  p("khan_academy", "Khan Academy", "education", "target", "planned", "siKhanacademy", "14BF96"),
  p("youtube_kids", "YouTube Kids", "education", "target", "planned", "siYoutube", "FF0000"),
  p("duolingo", "Duolingo", "education", "target", "planned", "siDuolingo", "58CC02"),
  p("pbs_kids", "PBS Kids", "education", "target", "planned"),
  p("google_classroom", "Google Classroom", "education", "target", "planned", "siGoogleclassroom", "0F9D58"),
  p("scratch", "Scratch", "education", "target", "planned", "siScratch", "4D97FF"),
  p("kahoot", "Kahoot", "education", "target", "planned"),
  p("ixl", "IXL", "education", "target", "planned"),
  p("epic_reading", "Epic!", "education", "target", "planned"),
  p("outschool", "Outschool", "education", "target", "planned"),
  p("google_workspace_edu", "Google Workspace for Education", "education", "target", "planned", "siGoogle", "4285F4"),
  p("apple_school_manager", "Apple School Manager", "education", "target", "planned", "siApple", "000000"),
  p("microsoft_365_edu", "Microsoft 365 Education", "education", "target", "planned", "siMicrosoft", "5E5E5E"),

  // ─── Targets: Shopping & Payments (8) ───
  p("amazon", "Amazon", "shopping_payments", "target", "planned"),
  p("ebay", "eBay", "shopping_payments", "target", "planned", "siEbay", "E53238"),
  p("shein", "Shein", "shopping_payments", "target", "planned", "siShein", "000000"),
  p("temu", "Temu", "shopping_payments", "target", "planned"),
  p("cash_app", "Cash App", "shopping_payments", "target", "planned", "siCashapp", "00C853"),
  p("venmo", "Venmo", "shopping_payments", "target", "planned", "siVenmo", "008CFF"),
  p("greenlight", "Greenlight", "shopping_payments", "target", "planned"),
  p("gohenry", "GoHenry", "shopping_payments", "target", "planned"),

  // ─── Targets: Smart Home (5) ───
  p("amazon_echo", "Amazon Echo", "smart_home", "target", "planned"),
  p("google_nest", "Google Nest", "smart_home", "target", "planned", "siGooglenest", "EA4335"),
  p("apple_homepod", "Apple HomePod", "smart_home", "target", "planned", "siApple", "000000"),
  p("echo_show", "Echo Show", "smart_home", "target", "planned"),
  p("nest_hub", "Nest Hub", "smart_home", "target", "planned", "siGooglenest", "EA4335"),

  // ─── Targets: VPN & Age-Restricted (7) ───
  p("nordvpn", "NordVPN", "vpn_age_restricted", "target", "planned", "siNordvpn", "4687FF"),
  p("expressvpn", "ExpressVPN", "vpn_age_restricted", "target", "planned", "siExpressvpn", "DA3940"),
  p("surfshark", "Surfshark", "vpn_age_restricted", "target", "planned", "siSurfshark", "178BF1"),
  p("tinder", "Tinder", "vpn_age_restricted", "target", "planned", "siTinder", "FF6B6B"),
  p("bumble", "Bumble", "vpn_age_restricted", "target", "planned", "siBumble", "FFC629"),
  p("draftkings", "DraftKings", "vpn_age_restricted", "target", "planned"),
  p("fanduel", "FanDuel", "vpn_age_restricted", "target", "planned"),
]
