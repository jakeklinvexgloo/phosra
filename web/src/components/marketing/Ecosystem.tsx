"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowRight } from "lucide-react"

/* ── LEFT SIDE: Where parents set controls ────────────────────────── */
const CONTROL_SOURCES = [
  {
    category: "Parental Controls Apps",
    items: ["Bark", "Qustodio", "Aura", "Net Nanny", "Norton Family", "Kaspersky Safe Kids", "FamilyTime", "OurPact", "Mobicip", "Canopy", "Covenant Eyes", "Kidslox", "Boomerang", "MMGuardian", "Life360", "Famisafe"],
  },
  {
    category: "Built-in Platform Controls",
    items: ["Apple Screen Time", "Google Family Link", "Microsoft Family Safety", "Samsung Kids", "Amazon Kids+"],
  },
  {
    category: "ISP & Carrier Tools",
    items: ["Xfinity xFi", "Verizon Smart Family", "AT&T Secure Family", "T-Mobile FamilyMode", "Spectrum WiFi", "Cox Panoramic", "Google Fiber"],
  },
  {
    category: "School & Institutional",
    items: ["GoGuardian", "Lightspeed Systems", "Gaggle", "Bark for Schools", "Securly", "Linewize", "Hapara"],
  },
]

/* ── RIGHT SIDE: What gets controlled ─────────────────────────────── */
const ENFORCEMENT_TARGETS = [
  {
    category: "Streaming",
    items: ["Netflix", "Disney+", "Hulu", "Max", "Paramount+", "Peacock", "Apple TV+", "Amazon Prime Video", "YouTube TV", "ESPN+", "Crunchyroll", "Tubi", "Pluto TV", "Sling TV", "FuboTV", "Discovery+", "Starz", "AMC+", "BET+", "Roku Channel"],
  },
  {
    category: "Social Media",
    items: ["TikTok", "Instagram", "Snapchat", "Facebook", "X", "Reddit", "Threads", "BeReal", "Pinterest", "Tumblr", "VSCO", "Yubo", "Lemon8", "Bluesky", "Discord"],
  },
  {
    category: "Gaming",
    items: ["Roblox", "Minecraft", "Fortnite", "Steam", "PlayStation", "Xbox", "Nintendo Switch", "Epic Games", "Apple Arcade", "Twitch", "Kick", "Meta Quest", "GeForce NOW", "Rec Room", "Among Us", "Brawl Stars"],
  },
  {
    category: "Devices & OS",
    items: ["Android", "iOS", "iPadOS", "Windows", "macOS", "ChromeOS", "Fire OS", "Kindle", "Fire Tablet", "Apple Watch", "Gabb Watch", "Gabb Phone", "Pinwheel", "Bark Phone"],
  },
  {
    category: "Smart TV & Streaming Devices",
    items: ["Samsung Tizen", "LG webOS", "Roku", "Fire TV", "Apple TV", "Android TV", "Google TV", "Chromecast", "Vizio SmartCast", "NVIDIA Shield"],
  },
  {
    category: "Music & Audio",
    items: ["Spotify", "Apple Music", "YouTube Music", "Amazon Music", "SoundCloud", "Pandora", "Tidal", "Deezer", "Audible"],
  },
  {
    category: "Messaging",
    items: ["WhatsApp", "iMessage", "Messenger", "Telegram", "Signal", "Kik", "GroupMe", "Google Chat", "Viber", "Line"],
  },
  {
    category: "AI & Chatbots",
    items: ["ChatGPT", "Claude", "Gemini", "Copilot", "Character.ai", "Perplexity", "Grok", "Replika", "Midjourney", "DALL-E"],
  },
  {
    category: "Network & DNS",
    items: ["NextDNS", "CleanBrowsing", "OpenDNS", "Cloudflare Family", "AdGuard DNS", "Pi-hole", "Eero", "Circle", "Gryphon", "Firewalla"],
  },
  {
    category: "Browsers & Search",
    items: ["Chrome", "Safari", "Firefox", "Edge", "Brave", "Google Search", "Bing", "DuckDuckGo", "Kiddle"],
  },
  {
    category: "Education",
    items: ["Khan Academy", "YouTube Kids", "Duolingo", "PBS Kids", "Google Classroom", "Scratch", "Kahoot", "IXL", "Epic!", "Outschool"],
  },
  {
    category: "Shopping & Payments",
    items: ["Amazon", "eBay", "Shein", "Temu", "Cash App", "Venmo", "Greenlight", "GoHenry"],
  },
  {
    category: "Smart Home",
    items: ["Amazon Echo", "Google Nest", "Apple HomePod", "Echo Show", "Nest Hub"],
  },
  {
    category: "VPN & Age-Restricted",
    items: ["NordVPN", "ExpressVPN", "Surfshark", "Tinder", "Bumble", "DraftKings", "FanDuel"],
  },
]

const SOURCE_COUNT = CONTROL_SOURCES.reduce((sum, g) => sum + g.items.length, 0)
const TARGET_COUNT = ENFORCEMENT_TARGETS.reduce((sum, g) => sum + g.items.length, 0)

/* ── Animated counter (reused from Stats) ─────────────────────────── */
function Counter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true)
          const duration = 1400
          const startTime = performance.now()
          const animate = (t: number) => {
            const p = Math.min((t - startTime) / duration, 1)
            setCount(Math.round((1 - Math.pow(1 - p, 3)) * value))
            if (p < 1) requestAnimationFrame(animate)
          }
          requestAnimationFrame(animate)
        }
      },
      { threshold: 0.2 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [value, hasAnimated])

  return <span ref={ref} className="tabular-nums">{count}{suffix}</span>
}

/* ── Column component ─────────────────────────────────────────────── */
function PlatformColumn({ groups, accent }: { groups: typeof CONTROL_SOURCES; accent: string }) {
  const [expanded, setExpanded] = useState<string | null>(null)

  return (
    <div className="space-y-3">
      {groups.map((group) => {
        const isOpen = expanded === group.category
        const preview = group.items.slice(0, 4)
        const rest = group.items.slice(4)

        return (
          <div key={group.category} className="bg-white border border-border rounded-sm overflow-hidden">
            <button
              onClick={() => setExpanded(isOpen ? null : group.category)}
              className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted/50 transition-colors"
            >
              <div>
                <span className="text-xs font-semibold text-foreground">{group.category}</span>
                <span className={`ml-2 text-[10px] font-medium ${accent}`}>{group.items.length}</span>
              </div>
              <svg
                className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            <div className="px-4 pb-3">
              <div className="flex flex-wrap gap-1.5">
                {preview.map((item) => (
                  <span key={item} className="text-[10px] text-muted-foreground bg-muted/60 px-2 py-0.5 rounded">{item}</span>
                ))}
                {!isOpen && rest.length > 0 && (
                  <span className={`text-[10px] font-medium ${accent} px-2 py-0.5`}>+{rest.length} more</span>
                )}
              </div>
              {isOpen && rest.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {rest.map((item) => (
                    <span key={item} className="text-[10px] text-muted-foreground bg-muted/60 px-2 py-0.5 rounded">{item}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ── Main Ecosystem Section ───────────────────────────────────────── */
export function Ecosystem() {
  return (
    <section id="ecosystem" className="py-16 sm:py-24 bg-[#FAFAFA]">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            The connective tissue of child safety
          </h2>
          <p className="text-muted-foreground text-base max-w-3xl mx-auto">
            Phosra sits between the apps parents already use and the platforms their kids are on.{" "}
            <span className="text-foreground font-medium"><Counter value={SOURCE_COUNT} suffix="+" /> control sources</span> on the left,{" "}
            <span className="text-foreground font-medium"><Counter value={TARGET_COUNT} suffix="+" /> enforcement targets</span> on the right — Phosra connects them all.
          </p>
        </div>

        {/* Three-column layout */}
        <div className="grid lg:grid-cols-[1fr,auto,1fr] gap-6 lg:gap-4 items-start">

          {/* LEFT — Control Sources */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">Where parents set controls</h3>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-sm">
                <Counter value={SOURCE_COUNT} suffix="+" /> apps
              </span>
            </div>
            <PlatformColumn groups={CONTROL_SOURCES} accent="text-emerald-600" />
          </div>

          {/* CENTER — Phosra */}
          <div className="flex lg:flex-col items-center justify-center gap-4 py-4 lg:py-0 lg:mt-16">
            {/* Arrows for desktop */}
            <div className="hidden lg:flex flex-col items-center gap-3">
              <ArrowRight className="w-5 h-5 text-brand-green rotate-180" />
              <div className="flex flex-col items-center gap-2 px-5 py-6 bg-[#111111] rounded-lg border border-white/10">
                <img src="/favicon.svg" alt="" className="w-8 h-8" />
                <span className="text-white text-xs font-bold tracking-wide">PHOSRA API</span>
                <div className="flex flex-col items-center gap-1 mt-2">
                  <span className="text-[9px] text-white/40 uppercase tracking-wider">Regulatory Intelligence</span>
                  <span className="text-[9px] text-white/40 uppercase tracking-wider">Policy Resolution</span>
                  <span className="text-[9px] text-white/40 uppercase tracking-wider">Universal Enforcement</span>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-brand-green" />
            </div>

            {/* Arrows for mobile (horizontal) */}
            <div className="flex lg:hidden items-center justify-center gap-3 w-full">
              <div className="h-px flex-1 bg-border" />
              <div className="flex items-center gap-2 px-4 py-3 bg-[#111111] rounded-lg border border-white/10">
                <img src="/favicon.svg" alt="" className="w-6 h-6" />
                <span className="text-white text-xs font-bold">PHOSRA API</span>
              </div>
              <div className="h-px flex-1 bg-border" />
            </div>
          </div>

          {/* RIGHT — Enforcement Targets */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">What gets controlled</h3>
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-sm">
                <Counter value={TARGET_COUNT} suffix="+" /> platforms
              </span>
            </div>
            <PlatformColumn groups={ENFORCEMENT_TARGETS} accent="text-blue-600" />
          </div>
        </div>

        {/* Bottom summary bar */}
        <div className="mt-10 sm:mt-14 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
          {[
            { value: SOURCE_COUNT + TARGET_COUNT, suffix: "+", label: "Total integrations" },
            { value: 44, suffix: "", label: "Platform categories" },
            { value: 11, suffix: "+", label: "Compliance laws" },
            { value: 35, suffix: "", label: "Rule categories" },
          ].map((stat) => (
            <div key={stat.label} className="text-center p-3 bg-white border border-border rounded-sm">
              <div className="text-xl sm:text-2xl font-bold text-foreground">
                <Counter value={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
