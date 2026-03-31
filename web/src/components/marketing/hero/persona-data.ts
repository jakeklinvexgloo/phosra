export type PersonaKey = "parent" | "parental-controls" | "platform" | "regulator"

export interface PersonaAccent {
  color: string
  r: number
  g: number
  b: number
  secondary: string
  tailwindBg: string
}

export const PERSONA_ACCENTS: Record<PersonaKey, PersonaAccent> = {
  parent:              { color: "#00D47E", r: 0,   g: 212, b: 126, secondary: "#26A8C9", tailwindBg: "bg-[#00D47E]" },
  "parental-controls": { color: "#2DB8A5", r: 45,  g: 184, b: 165, secondary: "#00D47E", tailwindBg: "bg-[#2DB8A5]" },
  platform:            { color: "#26A8C9", r: 38,  g: 168, b: 201, secondary: "#7B5CB8", tailwindBg: "bg-[#26A8C9]" },
  regulator:           { color: "#7B5CB8", r: 123, g: 92,  b: 184, secondary: "#26A8C9", tailwindBg: "bg-[#7B5CB8]" },
}

export const PERSONA_LABELS: Record<PersonaKey, string> = {
  parent: "Parent",
  "parental-controls": "Parental Controls",
  platform: "Platform",
  regulator: "Regulator",
}

export const PERSONA_ONELINERS: Record<PersonaKey, string> = {
  parent: "Trusted by families. Backed by research. Built by parents.",
  "parental-controls": "One spec. Every platform. Automatic compliance.",
  platform: "67 laws. 45 rule categories. One API. <50ms.",
  regulator: "From recommendation to enforcement in hours, not years.",
}

export const PERSONA_MARQUEE_ITEMS: Record<PersonaKey, string[]> = {
  parent: [
    "Netflix", "Roblox", "YouTube", "TikTok", "Discord", "Spotify", "Apple",
    "Minecraft", "Fortnite", "ChatGPT", "Steam", "Disney+", "PlayStation", "Twitch",
    "Instagram", "Snapchat",
  ],
  "parental-controls": [
    "Bark", "Qustodio", "Aura", "Net Nanny", "Norton Family", "Screen Time",
    "NextDNS", "CleanBrowsing", "Family Link", "Microsoft Family",
  ],
  platform: [
    "COPPA 2.0", "KOSA", "EU DSA", "AU eSafety", "CA AADC", "UK ICO",
    "Ireland OSBA", "Korea YCPA", "Brazil LGPD", "Singapore PDPA",
  ],
  regulator: [
    "UC Berkeley", "Harvard", "Villanova", "Common Sense Media",
    "eSafety Commissioner", "EU Better Internet", "Four Norms", "Screen Free Schools",
  ],
}

export const PERSONA_PROBLEM_TEXT: Record<PersonaKey, string> = {
  parent:
    "\u201CYou configure Netflix. Then Roblox. Then TikTok. Then Discord. None of them talk to each other.\u201D",
  "parental-controls":
    "\u201CYou\u2019re building platform integrations one by one. Every new streaming service, every new game, every new social app \u2014 another custom adapter.\u201D",
  platform:
    "\u201CEvery jurisdiction adds new child safety laws. Your legal team scrambles. Your engineers rebuild. Compliance is a moving target.\u201D",
  regulator:
    "\u201CYou publish guidelines. Platforms interpret them differently \u2014 or ignore them entirely. The gap between policy and protection has never been wider.\u201D",
}

export const PERSONA_SOLUTION_TEXT: Record<PersonaKey, string> = {
  parent: "Define once. Protect everywhere.",
  "parental-controls": "One spec. Every platform. Automatic.",
  platform: "Integrate once. Comply everywhere.",
  regulator: "Turn standards into enforcement.",
}

export const PERSONA_CTA: Record<PersonaKey, { primary: string; primaryHref: string; ghost: string; ghostHref: string }> = {
  parent: {
    primary: "Get Started Free",
    primaryHref: "/login",
    ghost: "See How It Works",
    ghostHref: "#how-it-works",
  },
  "parental-controls": {
    primary: "Become a PCSS Partner",
    primaryHref: "/contact",
    ghost: "View Integration Docs",
    ghostHref: "/docs",
  },
  platform: {
    primary: "Get API Keys",
    primaryHref: "/docs",
    ghost: "Read the Spec",
    ghostHref: "/developers",
  },
  regulator: {
    primary: "Read the PCSS Spec",
    primaryHref: "/developers",
    ghost: "Partner With Us",
    ghostHref: "/contact",
  },
}

export const ALL_PERSONAS: PersonaKey[] = ["parent", "parental-controls", "platform", "regulator"]
