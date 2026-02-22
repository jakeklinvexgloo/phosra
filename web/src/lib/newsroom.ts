export type NewsCategory = "product" | "company" | "press" | "milestone"

export interface NewsEntry {
  slug: string
  title: string
  date: string
  category: NewsCategory
  excerpt: string
  content: ContentSection[]
  featured?: boolean
}

export interface ContentSection {
  type: "paragraph" | "quote" | "heading"
  text: string
  attribution?: string
}

export const CATEGORY_CONFIG: Record<NewsCategory, { label: string; bg: string; text: string }> = {
  product: { label: "Product", bg: "bg-brand-green/10", text: "text-brand-green" },
  company: { label: "Company", bg: "bg-accent-teal/10", text: "text-accent-teal" },
  press: { label: "Press", bg: "bg-accent-purple/10", text: "text-accent-purple" },
  milestone: { label: "Milestone", bg: "bg-amber-500/10", text: "text-amber-500" },
}

export const NEWSROOM: NewsEntry[] = [
  {
    slug: "introducing-phosra",
    title: "Introducing Phosra — Universal Parental Controls Infrastructure",
    date: "2025-02-01",
    category: "company",
    excerpt:
      "Today we're launching Phosra, the infrastructure layer that lets parents set rules once and enforce them across every platform their kids use.",
    featured: true,
    content: [
      {
        type: "paragraph",
        text: "Parents today face an impossible task. Every app their children use — Netflix, YouTube, TikTok, Roblox, Instagram — has its own parental controls, its own settings screen, its own mental model. A family with four kids might be managing 30 or more separate configuration panels. Most give up after two or three. That's not a parenting failure. It's a systems failure.",
      },
      {
        type: "paragraph",
        text: "Today we're launching Phosra to fix this. Phosra is infrastructure — a universal control layer that connects to 190+ platforms through a single API. Parents set their rules once, and those rules enforce everywhere automatically. Parental control providers can plug into Phosra to extend their reach from a handful of platforms to all of them.",
      },
      {
        type: "quote",
        text: "The open banking movement proved that consumers shouldn't be locked into each bank's proprietary interface to manage their own money. The same principle applies to how parents protect their children online.",
        attribution: "Jake Klinvex, Founder & CEO",
      },
      {
        type: "paragraph",
        text: "Phosra ships with the Phosra Child Safety Standard (PCSS), an open specification that defines how parental control rules are structured, transmitted, and enforced across platforms. PCSS v1.0 covers 45 rule categories — from screen time limits and content filtering to age-gated social media access and algorithmic transparency controls.",
      },
      {
        type: "paragraph",
        text: "The platform is available today for developers and enterprise customers. Visit phosra.com/docs for the full API reference and integration guides.",
      },
    ],
  },
  {
    slug: "67-laws-tracked",
    title: "Phosra Now Tracks 67 Child Safety Laws Across 25+ Jurisdictions",
    date: "2025-02-05",
    category: "milestone",
    excerpt:
      "Our compliance engine now maps 67 child safety laws — from KOSA and COPPA 2.0 to the EU Digital Services Act — to specific enforcement actions across platforms.",
    content: [
      {
        type: "paragraph",
        text: "Child safety legislation is accelerating worldwide. In the United States alone, 22 states have introduced or passed laws governing how platforms must protect minors. Internationally, the EU Digital Services Act, the UK Online Safety Act, and Australia's Online Safety Act are creating a complex compliance landscape that platforms and parental control providers must navigate.",
      },
      {
        type: "paragraph",
        text: "Phosra's compliance engine now tracks 67 of these laws across 25+ jurisdictions and maps each one to specific PCSS rule categories. When KOSA requires platforms to disable addictive features for minors, Phosra translates that into concrete enforcement actions on YouTube, TikTok, and Instagram simultaneously — rather than leaving interpretation to each platform.",
      },
      {
        type: "paragraph",
        text: "The full compliance database is available at phosra.com/compliance, where developers and policy teams can explore each law's provisions, see how they map to PCSS rules, and access enforcement snippets for their integrations.",
      },
    ],
  },
  {
    slug: "community-standards-enforcement",
    title: "31 Community Standards, 50,000 Families: Making Pledges Enforceable",
    date: "2025-02-08",
    category: "company",
    excerpt:
      "Phosra now supports 31 community standards — including Four Norms, Wait Until 8th, and the Surgeon General's Advisory — turning voluntary pledges into enforceable configurations.",
    content: [
      {
        type: "paragraph",
        text: "Across the country, parent-led movements are setting standards for children's technology use. Four Norms, Wait Until 8th, the Surgeon General's Advisory on Social Media, Common Sense Media guidelines — these represent the collective wisdom of families, educators, and health professionals about what healthy digital boundaries look like.",
      },
      {
        type: "paragraph",
        text: "The challenge has always been enforcement. A pledge to delay social media until age 16 is meaningful only if parents can actually enforce it across every platform their child encounters. Until now, that required dozens of manual configurations — one per app, per child, per device.",
      },
      {
        type: "quote",
        text: "When a school adopts Four Norms, every family in that community should be able to enforce those standards with a single click — not a weekend of configuring settings.",
        attribution: "Jake Klinvex, Founder & CEO",
      },
      {
        type: "paragraph",
        text: "Phosra now supports 31 community standards that collectively reach over 50,000 families and 2,000 schools. Each standard is mapped to specific PCSS rules, so adoption means automatic enforcement across all connected platforms. Explore the full standards library at phosra.com/standards.",
      },
    ],
  },
  {
    slug: "pcss-v1-specification",
    title: "PCSS v1.0: An Open Standard for Parental Controls",
    date: "2025-01-25",
    category: "product",
    excerpt:
      "The Phosra Child Safety Standard v1.0 defines 45 rule categories for structuring, transmitting, and enforcing parental controls across platforms.",
    content: [
      {
        type: "paragraph",
        text: "Today we're publishing the Phosra Child Safety Standard (PCSS) v1.0 — an open specification for how parental control rules should be structured, transmitted, and enforced across digital platforms.",
      },
      {
        type: "paragraph",
        text: "PCSS v1.0 defines 45 rule categories spanning content filtering, screen time management, social media access controls, privacy protections, commercial data restrictions, and algorithmic transparency requirements. The specification is designed to be platform-agnostic, regulation-aware, and extensible.",
      },
      {
        type: "paragraph",
        text: "The standard draws from our analysis of 67 child safety laws worldwide, mapping each regulation's requirements to specific, enforceable rule types. Platform developers can implement PCSS support through Phosra's API, enabling their parental control features to interoperate with the broader ecosystem.",
      },
      {
        type: "paragraph",
        text: "The full specification, API reference, and integration guides are available at phosra.com/docs. We welcome feedback from the developer community, policy researchers, and child safety advocates.",
      },
    ],
  },
  {
    slug: "190-platforms-connected",
    title: "Phosra Reaches 190+ Platform Connections",
    date: "2025-02-10",
    category: "milestone",
    excerpt:
      "Phosra's platform coverage now spans 190+ services — from streaming and social media to gaming and education — making it the most comprehensive parental control infrastructure available.",
    content: [
      {
        type: "paragraph",
        text: "Parental controls are only as useful as the platforms they cover. A solution that works on Netflix but not YouTube, or TikTok but not Roblox, forces parents back to the fragmented, platform-by-platform approach that fails most families.",
      },
      {
        type: "paragraph",
        text: "Phosra now connects to over 190 platforms spanning streaming, social media, gaming, education, communication, and web browsing. This includes the platforms families use most — YouTube, Netflix, TikTok, Instagram, Roblox, Minecraft, Discord, and Snapchat — as well as hundreds of others that traditional parental control apps don't reach.",
      },
      {
        type: "paragraph",
        text: "For developers building parental control features, this means a single Phosra integration gives you access to the entire ecosystem. For parents, it means rules that actually work — everywhere. Explore the full platform directory at phosra.com/platforms.",
      },
    ],
  },
]

export function getNewsEntry(slug: string): NewsEntry | undefined {
  return NEWSROOM.find((entry) => entry.slug === slug)
}

export function getRecentNews(count: number): NewsEntry[] {
  return [...NEWSROOM]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, count)
}

export function getFeaturedNews(): NewsEntry | undefined {
  return NEWSROOM.find((entry) => entry.featured)
}
