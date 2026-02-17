import {
  Shield, Globe, Zap, Users, Tv, Gamepad2, Clock, Lock, Eye,
  Ban, Baby, TreePine, Scale, Wifi, Smartphone, Heart,
  BookOpen, Rocket, MonitorOff, AlertTriangle,
} from "lucide-react"

export interface Scenario {
  id: string
  title: string
  description: string
  prompt: string
  icon: typeof Shield
  /** Provider, standard, or law badge shown on the card */
  badge: string
}

/**
 * Pool of 20 Klinvex-family-specific scenario prompts. Each page load randomly picks 6.
 * Every scenario starts from an unprotected state and shows controls being turned ON.
 */
export const SCENARIO_POOL: Scenario[] = [
  // ── Providers & Platforms ──────────────────────────────────────────
  {
    id: "chap-netflix",
    badge: "Netflix",
    title: "Protect Chap on Netflix",
    description: "Set up age-appropriate streaming controls for a 10-year-old",
    prompt:
      "Chap is 10 years old and has no parental controls on Netflix yet. Set up a protection policy for him with preteen-appropriate content ratings, then push the rules to Netflix. Show me exactly what he can and can't watch.",
    icon: Tv,
  },
  {
    id: "twins-bedtime",
    badge: "Fire Tablet",
    title: "Bedtime for the twins",
    description: "Lock Samson and Mona's Fire Tablets at 8:30 PM",
    prompt:
      "Samson and Mona are both 9 years old and their Fire Tablets have no restrictions right now. Set up protection policies for both of them with a bedtime lockout at 8:30 PM on school nights and 9:30 PM on weekends. Also cap their daily screen time at 2 hours. Push the rules to their Fire Tablets and show me the enforcement results.",
    icon: Clock,
  },
  {
    id: "coldy-youtube",
    badge: "YouTube Kids",
    title: "Lock down Coldy's YouTube",
    description: "She's 5 — YouTube Kids only with no search",
    prompt:
      "Coldy is only 5 and currently has zero protections in place. Set up the strictest possible controls — YouTube Kids only (no regular YouTube), disable search, turn off autoplay, cap screen time at 30 minutes per day, and make sure content is restricted to G-rated only. Push the rules to YouTube and show me what changed.",
    icon: Eye,
  },
  {
    id: "ramsay-fire-tv",
    badge: "Fire TV",
    title: "Ramsay's TV time",
    description: "Limit what a 7-year-old can watch on the Fire TV Stick",
    prompt:
      "Ramsay is 7 and watches shows on the living room Fire TV Stick with no restrictions. Set up his protection policy — content ratings should be G and PG only, block anything TV-PG or above, and set a 1-hour daily limit. Enforce it on the Fire TV Stick.",
    icon: Tv,
  },
  {
    id: "apple-watch-controls",
    badge: "Apple Watch",
    title: "Apple Watch for the older kids",
    description: "Set up Screen Time on Chap, Samson, and Mona's watches",
    prompt:
      "Chap (10), Samson (9), and Mona (9) each have Apple Watches with no parental controls. Set up protection policies for all three with notification curfews from 9 PM to 7 AM, location tracking enabled, and screen time limited. Show me the enforcement results for each child's Apple Watch.",
    icon: Smartphone,
  },
  {
    id: "family-enforcement",
    badge: "All Platforms",
    title: "Protect all 5 kids",
    description: "Set up and enforce rules for the entire Klinvex Family",
    prompt:
      "None of the 5 Klinvex kids have any protection policies yet. Set up age-appropriate controls for ALL of them — Chap (10), Samson (9), Mona (9), Ramsay (7), and Coldy (5). Then trigger enforcement across all 11 connected platforms and show me a full breakdown of what each child can and can't do.",
    icon: Shield,
  },
  {
    id: "nextdns-filtering",
    badge: "NextDNS",
    title: "Home network filtering",
    description: "Set up DNS-level protection for the whole household",
    prompt:
      "The Klinvex home network runs on NextDNS but has no filtering rules. Set up the strictest child's rules first — probably Coldy since she's 5 — and push DNS filtering to NextDNS. I want safe search forced, adult content blocked, and a custom blocklist for social media sites. Show me what gets configured.",
    icon: Wifi,
  },

  // ── Standards & Movements ──────────────────────────────────────────
  {
    id: "wait-until-8th-twins",
    badge: "Wait Until 8th",
    title: "Wait Until 8th for the twins",
    description: "Enforce the pledge for Samson and Mona, age 9",
    prompt:
      "We signed the Wait Until 8th pledge for the twins — Samson and Mona are both 9. They currently have zero restrictions. Enforce the full standard: no social media, no smartphone-level browser access, content restricted to G/PG, and web filtering set to strict. Push to all their devices and show me the before-and-after.",
    icon: Ban,
  },
  {
    id: "four-norms-chap",
    badge: "Anxious Generation",
    title: "Four Norms for Chap",
    description: "Apply Jonathan Haidt's recommendations for a 10-year-old",
    prompt:
      "I want to follow Jonathan Haidt's Four Norms from The Anxious Generation for Chap, who is 10. He has no controls right now. Apply: no smartphone-level social media, phone-free during school hours (8 AM to 3 PM), max 2 hours daily screen time, and strict content filtering. Set it all up and enforce it.",
    icon: BookOpen,
  },
  {
    id: "screen-time-comparison",
    badge: "AAP Guidelines",
    title: "Screen time by age",
    description: "Compare AAP-recommended limits across all 5 ages",
    prompt:
      "Using the AAP's screen time recommendations, set up appropriate limits for each Klinvex child based on their age: Coldy (5) should get max 1 hour, Ramsay (7) about 1.5 hours, the twins (9) get 2 hours, and Chap (10) gets 2 hours. Create policies for all 5 kids, enforce them, and show me a comparison table.",
    icon: Baby,
  },
  {
    id: "csm-ramsay",
    badge: "Common Sense Media",
    title: "CSM ratings for Ramsay",
    description: "Apply age-appropriate ratings for a 7-year-old",
    prompt:
      "Ramsay is 7 and has no content controls. Apply Common Sense Media's recommended age ratings for him across all streaming platforms — that should be around G movies, TV-Y7 shows, and E-rated games. Set it up, enforce it, and tell me specifically which shows and games get blocked.",
    icon: Heart,
  },
  {
    id: "surgeon-general-twins",
    badge: "Surgeon General",
    title: "Surgeon General advisory",
    description: "Follow the no-social-media recommendation for Samson & Mona",
    prompt:
      "The US Surgeon General recommends delaying social media until at least 13. Samson and Mona are 9 — set up their protection policies following the Surgeon General's advisory. Block all social media, enforce safe search, set up activity monitoring, and restrict DMs to approved contacts only. Push to all platforms.",
    icon: Scale,
  },
  {
    id: "1000-hours-family",
    badge: "1000 Hours Outside",
    title: "1000 Hours Outside",
    description: "Limit all 5 kids' screen time to encourage outdoor play",
    prompt:
      "We're doing the 1000 Hours Outside challenge for the whole Klinvex family. Set up screen time limits for all 5 kids — 2 hours max for the older ones, 1 hour for Coldy. Add 20-minute usage reminders, and block all screens from 10 AM to 12 PM on weekends for mandatory outdoor time. Show enforcement across all devices.",
    icon: TreePine,
  },

  // ── Legislation & Compliance ───────────────────────────────────────
  {
    id: "coppa-coldy",
    badge: "COPPA 2.0",
    title: "COPPA protections for Coldy",
    description: "She's 5 — full COPPA data protections required",
    prompt:
      "Coldy is 5 years old and needs full COPPA 2.0 protections. She currently has nothing set up. Enable parental consent gates, block all targeted advertising, disable commercial data sharing, submit data deletion requests to all connected platforms, and set the strictest possible privacy controls. Show me the enforcement results.",
    icon: MonitorOff,
  },
  {
    id: "kosa-algorithmic",
    badge: "KOSA",
    title: "Disable the algorithm",
    description: "Turn off algorithmic feeds for all 5 kids per KOSA",
    prompt:
      "Under the Kids Online Safety Act, platforms must let minors opt out of algorithmic recommendations. None of the Klinvex kids have this enabled. Disable algorithmic feeds on YouTube, Netflix, Paramount+, Peacock, Prime Video, and YouTube TV for ALL 5 kids. Switch everything to chronological-only or curated feeds.",
    icon: Zap,
  },
  {
    id: "school-hours-lockdown",
    badge: "Phone-Free Schools",
    title: "School hours lockdown",
    description: "Lock all devices from 8 AM to 3 PM on weekdays",
    prompt:
      "The Klinvex kids' school has a phone-free policy. None of their devices are configured for this yet. Set up scheduled downtime from 8 AM to 3 PM every weekday across all Fire Tablets, Apple Watches, and connected platforms. Only allow emergency phone calls. Block games, social media, and notifications during school hours.",
    icon: Lock,
  },
  {
    id: "fairplay-ads",
    badge: "Fairplay",
    title: "Ban targeted ads",
    description: "Block behavioral advertising across every platform",
    prompt:
      "Following Fairplay's commercial-free childhood standard, set up ad-blocking protections for all 5 Klinvex kids. Block targeted and behavioral advertising, disable in-app purchase prompts, and turn off addictive design features like infinite scroll and autoplay on every connected platform. Show the enforcement breakdown.",
    icon: Ban,
  },
  {
    id: "coppa-data-deletion",
    badge: "COPPA 2.0",
    title: "Delete Coldy's data",
    description: "Exercise the COPPA eraser button across all platforms",
    prompt:
      "Coldy is 5 and under COPPA protection. I want to exercise the eraser button for her. First set up her protection policy, then submit data deletion requests to Netflix, YouTube, Paramount+, Peacock, Prime Video, and all other connected platforms. Disable all data collection and targeted advertising for her profile.",
    icon: MonitorOff,
  },
  {
    id: "eu-dsa-compliance",
    badge: "EU DSA",
    title: "EU DSA compliance",
    description: "Apply Digital Services Act rules across all platforms",
    prompt:
      "Apply EU Digital Services Act requirements for all 5 Klinvex kids. That means: no targeted advertising based on profiling, no dark patterns or addictive design, transparent algorithmic recommendations, age-appropriate privacy defaults, and parental notification of account changes. Set it all up and push enforcement.",
    icon: Globe,
  },
  {
    id: "uk-childrens-code",
    badge: "UK Children's Code",
    title: "Privacy by default",
    description: "Make all profiles private, block data sharing",
    prompt:
      "Apply the UK Children's Code (Age Appropriate Design Code) settings for the Klinvex kids. Make all profiles private by default, disable geolocation tracking on all devices except Apple Watch (keep for safety), block data sharing with third parties, and ensure privacy-protective settings are the default on every connected platform.",
    icon: Lock,
  },
]

/** Fisher-Yates shuffle — returns a new array */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Pick `count` random scenarios from the pool (no duplicates) */
export function getRandomScenarios(count: number = 6): Scenario[] {
  return shuffle(SCENARIO_POOL).slice(0, count)
}
