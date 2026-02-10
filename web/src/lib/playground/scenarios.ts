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
 * Pool of 20 branded scenario prompts. Each page load randomly picks 6.
 * Prompts reference real providers, standards, and legislation that Phosra enforces.
 */
export const SCENARIO_POOL: Scenario[] = [
  // ── Providers & Platforms ──────────────────────────────────────────
  {
    id: "qustodio-protect",
    badge: "Qustodio",
    title: "Protect my 8-year-old",
    description: "Full setup with age-appropriate rules across all platforms",
    prompt:
      "I have an 8-year-old daughter named Emma. Set up her profile with age-appropriate parental controls — content ratings, safe search, time limits, and purchase approval — then push the rules to all connected platforms. Show me exactly what got configured on each one.",
    icon: Shield,
  },
  {
    id: "netflix-block-title",
    badge: "Netflix",
    title: "Block Stranger Things",
    description: "Too scary for a 9-year-old — block by title across streaming",
    prompt:
      "My 9-year-old keeps trying to watch Stranger Things on Netflix. It's too scary for her age. Can you block that specific title and anything rated TV-14 or above across Netflix, Disney+, and Prime Video?",
    icon: Tv,
  },
  {
    id: "xbox-two-kids",
    badge: "Xbox",
    title: "Set up Xbox for two kids",
    description: "Age-appropriate gaming profiles with purchase approval",
    prompt:
      "I need to configure Xbox parental controls for my two kids — Emma (age 8) and Noah (age 14). Emma should only see E-rated games, Noah can go up to T-rated. Both need purchase approval turned on and multiplayer chat restricted to friends only.",
    icon: Gamepad2,
  },
  {
    id: "nextdns-filtering",
    badge: "NextDNS",
    title: "Block adult websites",
    description: "Set up DNS-level filtering with strict safe search everywhere",
    prompt:
      "Set up NextDNS filtering for our home network. I want strict safe search forced on Google, Bing, and YouTube, adult content categories blocked, and a custom blocklist for reddit.com and 4chan.org. Show me the DNS configuration.",
    icon: Wifi,
  },
  {
    id: "youtube-kids-safe",
    badge: "YouTube Kids",
    title: "Safe YouTube only",
    description: "Lock YouTube to Kids mode with no search and no autoplay",
    prompt:
      "My 6-year-old should only be able to watch YouTube Kids, not regular YouTube. Disable autoplay, turn off search so she can only browse curated content, and set a 45-minute daily limit. Push this to all her devices.",
    icon: Eye,
  },
  {
    id: "android-family-link",
    badge: "Android",
    title: "Set up Family Link",
    description: "Configure Google Family Link with time limits and app approval",
    prompt:
      "Walk me through setting up Google Family Link for my 10-year-old's Android tablet. I want a 2-hour daily screen limit, app install approval required, and bedtime lockout from 8:30 PM to 7 AM on school nights.",
    icon: Smartphone,
  },
  {
    id: "apple-bedtime",
    badge: "Apple Screen Time",
    title: "Bedtime wind-down",
    description: "Block all notifications and apps from 9 PM to 7 AM",
    prompt:
      "Configure Apple Screen Time downtime for my 12-year-old's iPhone. From 9 PM to 7 AM on school nights, block all apps except Phone and Messages. On weekends, push it to 10 PM. Also enable a notification curfew during those hours.",
    icon: Clock,
  },

  // ── Standards & Movements ──────────────────────────────────────────
  {
    id: "wait-until-8th",
    badge: "Wait Until 8th",
    title: "No social until 8th grade",
    description: "Enforce the Wait Until 8th pledge for my 11-year-old",
    prompt:
      "We signed the Wait Until 8th pledge. My son is 11 and in 5th grade. Enforce the full standard — no social media apps at all, no smartphone-level browser access, content restricted to G/PG, and web filtering set to strict. Show me what changes on each platform.",
    icon: Ban,
  },
  {
    id: "four-norms",
    badge: "Anxious Generation",
    title: "Apply the Four Norms",
    description: "No smartphone until 14, no social until 16, phone-free schools",
    prompt:
      "I want to follow Jonathan Haidt's Four Norms from The Anxious Generation for my family. Apply: no smartphone until age 14, no social media until 16, phone-free schools from 8 AM to 3 PM, and a max of 2 hours daily screen time. I have kids aged 10 and 15 — configure both.",
    icon: BookOpen,
  },
  {
    id: "aap-screen-time",
    badge: "AAP Guidelines",
    title: "Screen time by age",
    description: "Configure the AAP's recommended limits for a toddler and teen",
    prompt:
      "I want to follow the American Academy of Pediatrics screen time guidelines. I have a 3-year-old and a 13-year-old. The toddler should have max 1 hour of educational-only content per day. The teen should have reasonable limits with content ratings enforced. Set both up.",
    icon: Baby,
  },
  {
    id: "common-sense-ratings",
    badge: "Common Sense Media",
    title: "Age-matched ratings",
    description: "Apply CSM's age-appropriate content ratings across all streaming",
    prompt:
      "Apply Common Sense Media's recommended age ratings for my 11-year-old across all streaming platforms. Use their guidelines for what's appropriate at age 11 — this usually means PG and some PG-13 movies, TV-Y7 to TV-PG shows, and E to E10+ games. Show me what gets blocked on each platform.",
    icon: Heart,
  },
  {
    id: "surgeon-general",
    badge: "Surgeon General",
    title: "Delay social media",
    description: "Follow the US Surgeon General's advisory — no social until 13",
    prompt:
      "The US Surgeon General recommends delaying social media until at least age 13. My daughter is 11. Block all social media platforms (Instagram, TikTok, Snapchat, X), enforce safe search, and set up activity monitoring so I can see what she's doing online.",
    icon: Scale,
  },
  {
    id: "1000-hours-outside",
    badge: "1000 Hours Outside",
    title: "Balance screen & outdoors",
    description: "Set a 2-hour daily screen cap with outdoor activity reminders",
    prompt:
      "We're doing the 1000 Hours Outside challenge this year. Set my kids' daily screen time limit to 2 hours max, with 20-minute usage reminders. Block all screens from 10 AM to 12 PM on weekends for mandatory outdoor time. Configure this across all devices.",
    icon: TreePine,
  },

  // ── Legislation & Compliance ───────────────────────────────────────
  {
    id: "coppa-delete-data",
    badge: "COPPA 2.0",
    title: "Delete my kid's data",
    description: "Invoke the eraser button to remove data from streaming platforms",
    prompt:
      "Under COPPA 2.0, I want to exercise the eraser button for my 10-year-old. Submit data deletion requests to Netflix, YouTube, and any other connected platforms. Also disable all targeted advertising and block commercial data sharing for her profile.",
    icon: MonitorOff,
  },
  {
    id: "phone-free-schools",
    badge: "Phone-Free Schools",
    title: "School hours downtime",
    description: "Lock devices 8 AM to 3 PM on weekdays for school compliance",
    prompt:
      "My kids' school adopted a phone-free policy. Set up scheduled downtime from 8 AM to 3 PM every weekday across all their devices. Only allow the Phone app for emergencies. Block all social media, games, and notifications during school hours.",
    icon: Lock,
  },
  {
    id: "kosa-algo-off",
    badge: "KOSA",
    title: "Disable the algorithm",
    description: "Turn off algorithmic feeds on TikTok, Instagram, and YouTube",
    prompt:
      "Under the Kids Online Safety Act, platforms must let minors opt out of algorithmic recommendations. Disable algorithmic feeds on TikTok, Instagram, YouTube, and any other connected social platform for both my kids. Switch them all to chronological-only feeds.",
    icon: Zap,
  },
  {
    id: "fairplay-ads",
    badge: "Fairplay",
    title: "Ban targeted ads",
    description: "Block all behavioral advertising across every connected platform",
    prompt:
      "Following Fairplay's commercial-free childhood standard, block all targeted and behavioral advertising for my children across every connected platform. Also disable loot boxes and in-app purchase prompts, and turn off addictive design features like infinite scroll and autoplay.",
    icon: Ban,
  },
  {
    id: "uk-childrens-code",
    badge: "UK Children's Code",
    title: "Privacy by default",
    description: "Make all profiles private, disable location, block data sharing",
    prompt:
      "Apply the UK Age Appropriate Design Code (Children's Code) settings for my 13-year-old. Make all social profiles private by default, disable geolocation tracking, block data sharing with third parties, and ensure privacy-protective settings are the default on every platform.",
    icon: Lock,
  },
  {
    id: "thorn-safety",
    badge: "Thorn",
    title: "Enable safety alerts",
    description: "Turn on grooming detection, CSAM reporting, and contact controls",
    prompt:
      "Apply Thorn's Digital Defenders safety recommendations for my kids. Enable monitoring alerts for potential grooming patterns, restrict direct messages to approved contacts only, turn on CSAM reporting compliance, and block unknown users from sending friend requests or messages.",
    icon: AlertTriangle,
  },
  {
    id: "eu-dsa-compliance",
    badge: "EU DSA",
    title: "Comply with EU rules",
    description: "Apply Digital Services Act requirements for minors across platforms",
    prompt:
      "We live in the EU and I want all connected platforms to comply with the Digital Services Act for my 14-year-old. That means: no targeted advertising based on profiling, no dark patterns or addictive design, transparent algorithmic recommendations, and age-appropriate terms of service. Apply all of these rules.",
    icon: Globe,
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
