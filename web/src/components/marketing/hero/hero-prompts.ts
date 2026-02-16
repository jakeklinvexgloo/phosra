/**
 * 153 categorized parental control prompts for the hero prompt bar.
 * Used for autocomplete suggestions and cycling placeholder text.
 */

export type PromptCategory =
  | "streaming"
  | "screen-time"
  | "family"
  | "social-media"
  | "privacy"
  | "gaming"
  | "compliance"
  | "devices"
  | "web-safety"
  | "standards"

export interface HeroPrompt {
  id: string
  text: string
  category: PromptCategory
  keywords: string[]
}

export const HERO_PROMPTS: HeroPrompt[] = [
  // ── Streaming (20) ──────────────────────────────────────────────────
  { id: "s1", text: "Set up Netflix for my 8-year-old", category: "streaming", keywords: ["netflix", "streaming", "age", "8"] },
  { id: "s2", text: "Block R-rated movies on Disney+", category: "streaming", keywords: ["disney", "block", "rated", "movies"] },
  { id: "s3", text: "YouTube Kids only for my 5-year-old", category: "streaming", keywords: ["youtube", "kids", "5", "restrict"] },
  { id: "s4", text: "Restrict Hulu to TV-Y7 and below", category: "streaming", keywords: ["hulu", "restrict", "rating", "tv"] },
  { id: "s5", text: "No horror movies on any platform", category: "streaming", keywords: ["horror", "block", "movies", "all"] },
  { id: "s6", text: "Block true crime documentaries", category: "streaming", keywords: ["true crime", "block", "documentaries"] },
  { id: "s7", text: "Set up Paramount+ for a preschooler", category: "streaming", keywords: ["paramount", "preschool", "young"] },
  { id: "s8", text: "PG-13 max on Netflix for my 12-year-old", category: "streaming", keywords: ["netflix", "pg13", "12", "teen"] },
  { id: "s9", text: "Block anime above PG on Crunchyroll", category: "streaming", keywords: ["anime", "crunchyroll", "block", "pg"] },
  { id: "s10", text: "Disney+ — only G-rated for my 4-year-old", category: "streaming", keywords: ["disney", "g-rated", "4", "toddler"] },
  { id: "s11", text: "Turn off autoplay on Netflix", category: "streaming", keywords: ["autoplay", "netflix", "disable"] },
  { id: "s12", text: "Block mature anime on all platforms", category: "streaming", keywords: ["anime", "mature", "block", "all"] },
  { id: "s13", text: "Set up Peacock for ages 6-10", category: "streaming", keywords: ["peacock", "ages", "6", "10"] },
  { id: "s14", text: "No violent content on YouTube TV", category: "streaming", keywords: ["violent", "youtube", "tv", "block"] },
  { id: "s15", text: "Restrict Amazon Prime Video to kids content", category: "streaming", keywords: ["amazon", "prime", "kids", "restrict"] },
  { id: "s16", text: "Block music videos on YouTube", category: "streaming", keywords: ["music", "videos", "youtube", "block"] },
  { id: "s17", text: "Set up Apple TV+ for family viewing", category: "streaming", keywords: ["apple", "tv", "family", "setup"] },
  { id: "s18", text: "HBO Max — block all TV-MA content", category: "streaming", keywords: ["hbo", "max", "block", "mature"] },
  { id: "s19", text: "Only allow educational content on streaming", category: "streaming", keywords: ["educational", "only", "streaming"] },
  { id: "s20", text: "Block reality TV shows for my tweens", category: "streaming", keywords: ["reality", "tv", "tweens", "block"] },

  // ── Screen Time (20) ────────────────────────────────────────────────
  { id: "t1", text: "Set bedtime at 8:30 PM on school nights", category: "screen-time", keywords: ["bedtime", "8:30", "school", "night"] },
  { id: "t2", text: "2 hours max screen time on weekdays", category: "screen-time", keywords: ["2 hours", "screen time", "weekday", "limit"] },
  { id: "t3", text: "Lock all devices during dinner 6-7 PM", category: "screen-time", keywords: ["lock", "dinner", "devices", "6"] },
  { id: "t4", text: "Weekend screen time: 3 hours max", category: "screen-time", keywords: ["weekend", "3 hours", "screen time", "limit"] },
  { id: "t5", text: "No screens before homework is done", category: "screen-time", keywords: ["homework", "no screens", "before"] },
  { id: "t6", text: "30 minutes of reading earns 30 minutes of screen time", category: "screen-time", keywords: ["reading", "earn", "screen time", "reward"] },
  { id: "t7", text: "School night bedtime 9 PM, weekend 10 PM", category: "screen-time", keywords: ["bedtime", "school", "weekend", "9", "10"] },
  { id: "t8", text: "1 hour daily limit for my 5-year-old", category: "screen-time", keywords: ["1 hour", "daily", "limit", "5"] },
  { id: "t9", text: "Screen-free Sunday mornings until noon", category: "screen-time", keywords: ["sunday", "screen-free", "morning", "noon"] },
  { id: "t10", text: "Gradual wind-down: reduce brightness at 8 PM", category: "screen-time", keywords: ["wind-down", "brightness", "8pm", "gradual"] },
  { id: "t11", text: "Set a 20-minute warning before screen time ends", category: "screen-time", keywords: ["warning", "20 minutes", "before", "ends"] },
  { id: "t12", text: "Block screens from 10 PM to 7 AM", category: "screen-time", keywords: ["block", "10pm", "7am", "overnight"] },
  { id: "t13", text: "Weekday limit: 1 hour after school", category: "screen-time", keywords: ["weekday", "1 hour", "after school"] },
  { id: "t14", text: "Summer schedule: 3 hours max per day", category: "screen-time", keywords: ["summer", "3 hours", "schedule"] },
  { id: "t15", text: "Homework hours: no entertainment apps 4-6 PM", category: "screen-time", keywords: ["homework", "no entertainment", "4pm", "6pm"] },
  { id: "t16", text: "Put downtime on all devices for 1 hour", category: "screen-time", keywords: ["downtime", "all devices", "1 hour"] },
  { id: "t17", text: "Cap total family screen time at 8 hours per day", category: "screen-time", keywords: ["family", "total", "8 hours", "cap"] },
  { id: "t18", text: "No screens during car rides under 30 minutes", category: "screen-time", keywords: ["car", "ride", "no screens", "30 minutes"] },
  { id: "t19", text: "Limit video calls to 2 hours per day", category: "screen-time", keywords: ["video calls", "2 hours", "limit"] },
  { id: "t20", text: "Set up usage reminders every 30 minutes", category: "screen-time", keywords: ["reminders", "30 minutes", "usage"] },

  // ── Family Management (15) ──────────────────────────────────────────
  { id: "f1", text: "Add my daughter Emma who is 7", category: "family", keywords: ["add", "daughter", "emma", "7"] },
  { id: "f2", text: "Set up profiles for my 4 kids ages 5-12", category: "family", keywords: ["profiles", "4 kids", "ages", "setup"] },
  { id: "f3", text: "Create a family for the Johnson household", category: "family", keywords: ["create", "family", "johnson", "household"] },
  { id: "f4", text: "Add a new baby — lock everything down", category: "family", keywords: ["baby", "new", "lock", "everything"] },
  { id: "f5", text: "Update Mona's age from 9 to 10", category: "family", keywords: ["update", "age", "mona", "10"] },
  { id: "f6", text: "Remove guest profile from all devices", category: "family", keywords: ["remove", "guest", "profile", "devices"] },
  { id: "f7", text: "Set up separate rules for weekdays vs weekends", category: "family", keywords: ["separate", "rules", "weekday", "weekend"] },
  { id: "f8", text: "Add my stepkids to the family profile", category: "family", keywords: ["stepkids", "add", "family"] },
  { id: "f9", text: "Create age groups: under 6, 6-9, and 10-13", category: "family", keywords: ["age groups", "create", "6", "9", "13"] },
  { id: "f10", text: "Move Lucas from 'little kids' to 'tweens' group", category: "family", keywords: ["move", "lucas", "tweens", "group"] },
  { id: "f11", text: "Add grandma as an approved adult viewer", category: "family", keywords: ["grandma", "adult", "approved", "viewer"] },
  { id: "f12", text: "Set up a shared family movie night profile", category: "family", keywords: ["shared", "family", "movie night", "profile"] },
  { id: "f13", text: "Add Chap who is 10 and Mona who is 9 to my family", category: "family", keywords: ["chap", "10", "mona", "9", "add"] },
  { id: "f14", text: "Create profiles for twins who are 8", category: "family", keywords: ["twins", "8", "profiles", "create"] },
  { id: "f15", text: "Set up a teen profile for my 14-year-old", category: "family", keywords: ["teen", "14", "profile", "setup"] },

  // ── Social Media (18) ───────────────────────────────────────────────
  { id: "sm1", text: "Block TikTok for my 11-year-old", category: "social-media", keywords: ["tiktok", "block", "11"] },
  { id: "sm2", text: "No social media until age 13", category: "social-media", keywords: ["no social media", "13", "age", "block"] },
  { id: "sm3", text: "Instagram DMs — contacts only", category: "social-media", keywords: ["instagram", "dms", "contacts", "restrict"] },
  { id: "sm4", text: "Block Snapchat and Discord completely", category: "social-media", keywords: ["snapchat", "discord", "block"] },
  { id: "sm5", text: "Disable algorithmic feeds on all platforms", category: "social-media", keywords: ["algorithmic", "feeds", "disable", "all"] },
  { id: "sm6", text: "Facebook — block entirely for kids under 13", category: "social-media", keywords: ["facebook", "block", "13", "kids"] },
  { id: "sm7", text: "Twitter/X — block for all my children", category: "social-media", keywords: ["twitter", "x", "block", "children"] },
  { id: "sm8", text: "Reddit — block until at least 15", category: "social-media", keywords: ["reddit", "block", "15"] },
  { id: "sm9", text: "BeReal only — block everything else", category: "social-media", keywords: ["bereal", "only", "block", "everything"] },
  { id: "sm10", text: "Pinterest — allow but block mature pins", category: "social-media", keywords: ["pinterest", "allow", "mature", "block"] },
  { id: "sm11", text: "WhatsApp — approved contacts only", category: "social-media", keywords: ["whatsapp", "contacts", "approved", "only"] },
  { id: "sm12", text: "Block all social media during school hours", category: "social-media", keywords: ["block", "social media", "school", "hours"] },
  { id: "sm13", text: "Limit TikTok to 30 minutes per day", category: "social-media", keywords: ["tiktok", "30 minutes", "limit", "daily"] },
  { id: "sm14", text: "No live streaming on any platform", category: "social-media", keywords: ["live streaming", "no", "block", "platform"] },
  { id: "sm15", text: "Disable comments on YouTube", category: "social-media", keywords: ["comments", "youtube", "disable"] },
  { id: "sm16", text: "Block dating apps on all devices", category: "social-media", keywords: ["dating", "apps", "block", "devices"] },
  { id: "sm17", text: "Turn off social media notifications after 8 PM", category: "social-media", keywords: ["notifications", "social media", "8pm", "off"] },
  { id: "sm18", text: "Disable location sharing on social apps", category: "social-media", keywords: ["location", "sharing", "disable", "social"] },

  // ── Privacy & Data (15) ─────────────────────────────────────────────
  { id: "p1", text: "Delete my kid's data from YouTube", category: "privacy", keywords: ["delete", "data", "youtube", "kid"] },
  { id: "p2", text: "Block all targeted ads for minors", category: "privacy", keywords: ["targeted ads", "block", "minors"] },
  { id: "p3", text: "COPPA lockdown for my 4-year-old", category: "privacy", keywords: ["coppa", "lockdown", "4", "privacy"] },
  { id: "p4", text: "Disable location tracking on all apps", category: "privacy", keywords: ["location", "tracking", "disable", "apps"] },
  { id: "p5", text: "Submit data deletion requests everywhere", category: "privacy", keywords: ["data deletion", "submit", "requests", "all"] },
  { id: "p6", text: "Block data sharing with third parties", category: "privacy", keywords: ["data sharing", "third parties", "block"] },
  { id: "p7", text: "Disable personalized recommendations", category: "privacy", keywords: ["personalized", "recommendations", "disable"] },
  { id: "p8", text: "Turn off voice recording on all devices", category: "privacy", keywords: ["voice", "recording", "off", "devices"] },
  { id: "p9", text: "Block in-app tracking across platforms", category: "privacy", keywords: ["in-app", "tracking", "block", "platforms"] },
  { id: "p10", text: "Exercise the COPPA eraser button", category: "privacy", keywords: ["coppa", "eraser", "button", "data"] },
  { id: "p11", text: "Disable camera and microphone by default", category: "privacy", keywords: ["camera", "microphone", "disable", "default"] },
  { id: "p12", text: "Block cross-app tracking", category: "privacy", keywords: ["cross-app", "tracking", "block"] },
  { id: "p13", text: "Opt out of data collection on all platforms", category: "privacy", keywords: ["opt out", "data collection", "all", "platforms"] },
  { id: "p14", text: "Privacy lockdown — strictest possible settings", category: "privacy", keywords: ["privacy", "lockdown", "strictest", "settings"] },
  { id: "p15", text: "Block all cookies and trackers for my kids", category: "privacy", keywords: ["cookies", "trackers", "block", "kids"] },

  // ── Gaming (18) ─────────────────────────────────────────────────────
  { id: "g1", text: "Roblox chat — contacts only", category: "gaming", keywords: ["roblox", "chat", "contacts", "only"] },
  { id: "g2", text: "Block M-rated games on Xbox", category: "gaming", keywords: ["m-rated", "xbox", "block", "games"] },
  { id: "g3", text: "Fortnite — no voice chat, no purchases", category: "gaming", keywords: ["fortnite", "voice chat", "purchases", "block"] },
  { id: "g4", text: "Limit Minecraft to 1 hour per day", category: "gaming", keywords: ["minecraft", "1 hour", "limit", "daily"] },
  { id: "g5", text: "Block in-app purchases on all games", category: "gaming", keywords: ["in-app purchases", "block", "games", "all"] },
  { id: "g6", text: "Nintendo Switch — set up parental controls", category: "gaming", keywords: ["nintendo", "switch", "parental", "controls"] },
  { id: "g7", text: "PlayStation — restrict to E and E10+ games", category: "gaming", keywords: ["playstation", "restrict", "e-rated", "e10"] },
  { id: "g8", text: "Steam — block mature content", category: "gaming", keywords: ["steam", "block", "mature", "content"] },
  { id: "g9", text: "Block Roblox experiences rated 13+", category: "gaming", keywords: ["roblox", "13+", "block", "experiences"] },
  { id: "g10", text: "No online multiplayer after 8 PM", category: "gaming", keywords: ["multiplayer", "online", "8pm", "block"] },
  { id: "g11", text: "Disable voice chat on all gaming platforms", category: "gaming", keywords: ["voice chat", "disable", "gaming", "all"] },
  { id: "g12", text: "Limit Fortnite to weekends only", category: "gaming", keywords: ["fortnite", "weekends", "only", "limit"] },
  { id: "g13", text: "Block gambling-like mechanics in games", category: "gaming", keywords: ["gambling", "mechanics", "block", "games"] },
  { id: "g14", text: "Set up Xbox Family Settings for 3 kids", category: "gaming", keywords: ["xbox", "family", "settings", "3 kids"] },
  { id: "g15", text: "Apple Arcade — allow, block App Store games", category: "gaming", keywords: ["apple arcade", "allow", "app store", "block"] },
  { id: "g16", text: "Block horror games on all platforms", category: "gaming", keywords: ["horror", "games", "block", "all"] },
  { id: "g17", text: "Gaming curfew: no games after 9 PM on school nights", category: "gaming", keywords: ["curfew", "9pm", "school", "games"] },
  { id: "g18", text: "Restrict Roblox spending to $5/month", category: "gaming", keywords: ["roblox", "spending", "$5", "restrict"] },

  // ── Compliance & Legislation (15) ───────────────────────────────────
  { id: "c1", text: "Make us KOSA compliant", category: "compliance", keywords: ["kosa", "compliant", "kids", "safety"] },
  { id: "c2", text: "Apply EU DSA protections for my family", category: "compliance", keywords: ["eu", "dsa", "protections", "family"] },
  { id: "c3", text: "Follow the Surgeon General's advisory", category: "compliance", keywords: ["surgeon general", "advisory", "social media"] },
  { id: "c4", text: "UK Children's Code — full compliance", category: "compliance", keywords: ["uk", "children's code", "compliance"] },
  { id: "c5", text: "COPPA 2.0 — everything for under-13s", category: "compliance", keywords: ["coppa", "2.0", "under 13"] },
  { id: "c6", text: "California AADC compliance check", category: "compliance", keywords: ["california", "aadc", "compliance"] },
  { id: "c7", text: "Apply all applicable US state laws", category: "compliance", keywords: ["us", "state laws", "apply", "all"] },
  { id: "c8", text: "What laws apply to my 10-year-old?", category: "compliance", keywords: ["laws", "apply", "10", "child"] },
  { id: "c9", text: "Algorithmic audit for all platforms", category: "compliance", keywords: ["algorithmic", "audit", "platforms"] },
  { id: "c10", text: "Parental consent verification setup", category: "compliance", keywords: ["parental consent", "verification", "setup"] },
  { id: "c11", text: "Disable dark patterns across all apps", category: "compliance", keywords: ["dark patterns", "disable", "apps"] },
  { id: "c12", text: "Age verification — set up for all kids", category: "compliance", keywords: ["age verification", "setup", "kids"] },
  { id: "c13", text: "Apply French digital majority rules", category: "compliance", keywords: ["french", "digital majority", "rules"] },
  { id: "c14", text: "Australian Online Safety Act compliance", category: "compliance", keywords: ["australian", "online safety", "compliance"] },
  { id: "c15", text: "Enable transparency reports for all platforms", category: "compliance", keywords: ["transparency", "reports", "platforms"] },

  // ── Standards & Movements (12) ──────────────────────────────────────
  { id: "st1", text: "Follow the Four Norms for all my kids", category: "standards", keywords: ["four norms", "haidt", "anxious generation"] },
  { id: "st2", text: "Wait Until 8th pledge for my 9-year-old", category: "standards", keywords: ["wait until 8th", "pledge", "9"] },
  { id: "st3", text: "AAP screen time guidelines by age", category: "standards", keywords: ["aap", "screen time", "guidelines", "age"] },
  { id: "st4", text: "Common Sense Media ratings for everything", category: "standards", keywords: ["common sense media", "ratings", "all"] },
  { id: "st5", text: "1000 Hours Outside — minimize screens", category: "standards", keywords: ["1000 hours", "outside", "minimize", "screens"] },
  { id: "st6", text: "No smartphone until high school", category: "standards", keywords: ["no smartphone", "high school", "delay"] },
  { id: "st7", text: "Digital wellness plan for the family", category: "standards", keywords: ["digital wellness", "plan", "family"] },
  { id: "st8", text: "Apply Anxious Generation recommendations", category: "standards", keywords: ["anxious generation", "haidt", "recommendations"] },
  { id: "st9", text: "WHO guidelines for screen time under 5", category: "standards", keywords: ["who", "guidelines", "screen time", "under 5"] },
  { id: "st10", text: "Unplug campaign — weekly digital detox", category: "standards", keywords: ["unplug", "digital detox", "weekly"] },
  { id: "st11", text: "Apply the 3-6-9-12 rule for screen ages", category: "standards", keywords: ["3-6-9-12", "rule", "screen", "ages"] },
  { id: "st12", text: "Family media agreement — set up rules together", category: "standards", keywords: ["family media", "agreement", "rules", "together"] },

  // ── Devices (10) ────────────────────────────────────────────────────
  { id: "d1", text: "Lock down the Fire Tablet", category: "devices", keywords: ["fire tablet", "lock", "amazon", "kids"] },
  { id: "d2", text: "Apple Watch school mode 8 AM to 3 PM", category: "devices", keywords: ["apple watch", "school", "8am", "3pm"] },
  { id: "d3", text: "Set up NextDNS filtering for the house", category: "devices", keywords: ["nextdns", "filtering", "house", "dns"] },
  { id: "d4", text: "Chromebook — restrict to educational sites", category: "devices", keywords: ["chromebook", "restrict", "educational", "sites"] },
  { id: "d5", text: "iPad — disable Safari, allow only approved apps", category: "devices", keywords: ["ipad", "safari", "disable", "approved"] },
  { id: "d6", text: "Set up Screen Time on all Apple devices", category: "devices", keywords: ["screen time", "apple", "setup", "devices"] },
  { id: "d7", text: "Android phone — Google Family Link controls", category: "devices", keywords: ["android", "family link", "google", "controls"] },
  { id: "d8", text: "Smart TV — restrict to kids profiles", category: "devices", keywords: ["smart tv", "restrict", "kids", "profiles"] },
  { id: "d9", text: "Block Alexa from playing explicit music", category: "devices", keywords: ["alexa", "explicit", "music", "block"] },
  { id: "d10", text: "Kindle — restrict book purchases to age-appropriate", category: "devices", keywords: ["kindle", "books", "restrict", "age-appropriate"] },

  // ── Web Safety (10) ─────────────────────────────────────────────────
  { id: "w1", text: "Force SafeSearch on all browsers", category: "web-safety", keywords: ["safesearch", "force", "browsers", "all"] },
  { id: "w2", text: "Block adult websites network-wide", category: "web-safety", keywords: ["adult", "websites", "block", "network"] },
  { id: "w3", text: "Custom blocklist for social media domains", category: "web-safety", keywords: ["blocklist", "social media", "domains", "custom"] },
  { id: "w4", text: "Block VPN and proxy apps", category: "web-safety", keywords: ["vpn", "proxy", "block", "apps"] },
  { id: "w5", text: "Whitelist-only browsing for under-7s", category: "web-safety", keywords: ["whitelist", "browsing", "under 7", "only"] },
  { id: "w6", text: "Block browser extensions for kids", category: "web-safety", keywords: ["browser", "extensions", "block", "kids"] },
  { id: "w7", text: "Set up CleanBrowsing for the family", category: "web-safety", keywords: ["cleanbrowsing", "family", "setup", "dns"] },
  { id: "w8", text: "Block gambling websites", category: "web-safety", keywords: ["gambling", "websites", "block"] },
  { id: "w9", text: "Restrict Google search to safe results", category: "web-safety", keywords: ["google", "search", "safe", "restrict"] },
  { id: "w10", text: "Block file-sharing and torrent sites", category: "web-safety", keywords: ["file-sharing", "torrent", "block", "sites"] },
]

/** Simple fuzzy search: returns prompts whose text or keywords match the query */
export function getFilteredPrompts(query: string, limit: number = 6): HeroPrompt[] {
  if (!query.trim()) return []
  const lower = query.toLowerCase()
  const terms = lower.split(/\s+/).filter(Boolean)

  const scored = HERO_PROMPTS.map((prompt) => {
    const textLower = prompt.text.toLowerCase()
    const allKeywords = prompt.keywords.join(" ").toLowerCase()
    let score = 0

    // Exact substring match in text gets highest score
    if (textLower.includes(lower)) score += 10

    // Individual term matches
    for (const term of terms) {
      if (textLower.includes(term)) score += 3
      if (allKeywords.includes(term)) score += 2
    }

    return { prompt, score }
  })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)

  return scored.map((s) => s.prompt)
}

/** Fisher-Yates shuffle — returns a new array */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Pick `count` random prompts from the full pool */
export function getRandomPrompts(count: number = 6): HeroPrompt[] {
  return shuffle(HERO_PROMPTS).slice(0, count)
}

/** Curated prompts for the cycling placeholder animation */
export const PLACEHOLDER_PROMPTS = [
  "Set up Netflix for my 8-year-old",
  "Block TikTok for my 11-year-old",
  "Follow the Four Norms for all my kids",
  "Put downtime on all devices for 1 hour",
  "Make us COPPA 2.0 compliant",
]
