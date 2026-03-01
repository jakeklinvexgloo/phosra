import {
  Shield,
  Monitor,
  PlayCircle,
  ShieldCheck,
  Code,
  Puzzle,
  Terminal,
  Bot,
  Tv,
  BarChart3,
  Microscope,
  ListChecks,
  FlaskConical,
  ShieldAlert,
  Scale,
  FileText,
  ArrowRight,
  Megaphone,
  Award,
  Timer,
  Book,
  TerminalSquare,
  GitBranch,
  Palette,
  Newspaper,
  Mic2,
  Mail,
  Building2,
  TrendingUp,
  type LucideIcon,
} from "lucide-react"

// ── Types ────────────────────────────────────────────

export interface NavItem {
  label: string
  href: string
  icon?: LucideIcon
  description?: string
}

export interface NavSection {
  title: string
  items: NavItem[]
}

export interface FeaturedCard {
  badge: string
  title: string
  description: string
  href: string
  cta: string
}

export interface NavDropdown {
  label: string
  /** Hub page URL — clicking the dropdown label navigates here */
  href: string
  sections: NavSection[]
  featured?: FeaturedCard
  /** Number of columns for sections (featured card is always an extra column) */
  columns?: 2 | 3
}

export interface NavDirectLink {
  label: string
  href: string
}

export type NavEntry = { type: "dropdown"; data: NavDropdown } | { type: "link"; data: NavDirectLink }

// ── Dropdowns ────────────────────────────────────────

export const PRODUCTS_DROPDOWN: NavDropdown = {
  label: "Products",
  href: "/products",
  columns: 2,
  sections: [
    {
      title: "For Families",
      items: [
        { label: "Parental Controls", href: "/parental-controls", icon: Shield, description: "100+ safety solutions for every platform" },
        { label: "Platform Directory", href: "/platforms", icon: Monitor, description: "320+ platforms with safety ratings" },
        { label: "Interactive Demo", href: "/demo", icon: PlayCircle, description: "Try the Phosra dashboard" },
        { label: "PCSS Compliance Checker", href: "/check", icon: ShieldCheck, description: "Test any platform's compliance score" },
      ],
    },
    {
      title: "For Platforms",
      items: [
        { label: "Developer Portal", href: "/developers", icon: Code, description: "API docs, SDKs, and playground" },
        { label: "Technology Services", href: "/technology-services", icon: Puzzle, description: "320+ services with integration guides" },
        { label: "API Playground", href: "/developers/playground", icon: Terminal, description: "Test API calls live" },
      ],
    },
  ],
  featured: {
    badge: "New Research",
    title: "AI Chatbot Safety Report",
    description: "See how 8 AI platforms grade on child safety across 40 test prompts.",
    href: "/research/ai-chatbots",
    cta: "View report →",
  },
}

export const RESEARCH_DROPDOWN: NavDropdown = {
  label: "Research",
  href: "/research",
  columns: 2,
  sections: [
    {
      title: "Safety Studies",
      items: [
        { label: "AI Chatbot Safety", href: "/research/ai-chatbots", icon: Bot, description: "8 platforms, 40 test prompts" },
        { label: "Streaming Safety", href: "/research/streaming", icon: Tv, description: "Content filtering across 3 platforms" },
        { label: "Compare Platforms", href: "/research/compare", icon: BarChart3, description: "Head-to-head safety comparisons" },
      ],
    },
    {
      title: "Methodology",
      items: [
        { label: "AI Testing Methodology", href: "/research/ai-chatbots/methodology", icon: Microscope, description: "How we test chatbot safety" },
        { label: "Streaming Methodology", href: "/research/streaming/methodology", icon: ListChecks, description: "Content filtering test framework" },
        { label: "Test Prompts Library", href: "/research/ai-chatbots/prompts", icon: FlaskConical, description: "40 safety prompts across 7 dimensions" },
        { label: "Phosra Controls", href: "/research/ai-chatbots/phosra-controls", icon: ShieldAlert, description: "How Phosra applies research findings" },
      ],
    },
  ],
  featured: {
    badge: "Latest Research",
    title: "Streaming Content Safety Report",
    description: "NEW: How 3 streaming platforms handle content filtering for minors.",
    href: "/research/streaming",
    cta: "Read report →",
  },
}

export const COMPLIANCE_DROPDOWN: NavDropdown = {
  label: "Compliance",
  href: "/compliance",
  columns: 3,
  sections: [
    {
      title: "Legislation",
      items: [
        { label: "Compliance Hub", href: "/compliance", icon: Scale, description: "78+ child safety laws, filterable" },
        { label: "KOSA", href: "/compliance/kosa", icon: FileText, description: "Kids Online Safety Act" },
        { label: "COPPA 2.0", href: "/compliance/coppa-2", icon: FileText, description: "Updated FTC Rule" },
        { label: "EU DSA", href: "/compliance/eu-dsa", icon: FileText, description: "Digital Services Act" },
        { label: "UK Online Safety Act", href: "/compliance/uk-osa", icon: FileText, description: "UK Online Safety Act" },
        { label: "See all 78+ laws →", href: "/compliance", icon: ArrowRight, description: "" },
      ],
    },
    {
      title: "Advocacy",
      items: [
        { label: "Movements", href: "/movements", icon: Megaphone, description: "31+ child safety advocacy groups" },
        { label: "Community Standards", href: "/standards", icon: Award, description: "Industry safety frameworks" },
      ],
    },
    {
      title: "Tools",
      items: [
        { label: "COPPA Deadline Tracker", href: "/coppa-deadline", icon: Timer, description: "Countdown to April 22, 2026" },
        { label: "PCSS Checker", href: "/check", icon: ShieldCheck, description: "Test any platform's compliance" },
      ],
    },
  ],
}

export const RESOURCES_DROPDOWN: NavDropdown = {
  label: "Resources",
  href: "/resources",
  columns: 3,
  sections: [
    {
      title: "For Builders",
      items: [
        { label: "API Documentation", href: "/developers", icon: Book, description: "Guides, reference, tutorials" },
        { label: "API Playground", href: "/developers/playground", icon: TerminalSquare, description: "Test API calls live" },
        { label: "Changelog", href: "/changelog", icon: GitBranch, description: "Product updates" },
        { label: "Brand Assets", href: "/brand", icon: Palette, description: "Logos and guidelines" },
      ],
    },
    {
      title: "For Everyone",
      items: [
        { label: "Blog", href: "/blog", icon: Newspaper, description: "Engineering & company updates" },
        { label: "Newsroom", href: "/newsroom", icon: Mic2, description: "Press releases & coverage" },
        { label: "Press Kit", href: "/press", icon: FileText, description: "Media resources" },
      ],
    },
    {
      title: "Company",
      items: [
        { label: "About", href: "/about", icon: Building2, description: "Our mission and team" },
        { label: "Contact", href: "/contact", icon: Mail, description: "Get in touch" },
        { label: "Investors", href: "/investors", icon: TrendingUp, description: "Investor information" },
      ],
    },
  ],
  featured: {
    badge: "Latest",
    title: "Product Updates",
    description: "See what's new in the latest Phosra release.",
    href: "/changelog",
    cta: "View changelog →",
  },
}

// ── Main Navigation ──────────────────────────────────

export const NAV_ENTRIES: NavEntry[] = [
  { type: "dropdown", data: PRODUCTS_DROPDOWN },
  { type: "dropdown", data: RESEARCH_DROPDOWN },
  { type: "dropdown", data: COMPLIANCE_DROPDOWN },
  { type: "dropdown", data: RESOURCES_DROPDOWN },
  { type: "link", data: { label: "Pricing", href: "/pricing" } },
]

// ── Footer Sections ──────────────────────────────────

export interface FooterLink {
  label: string
  href: string
  external?: boolean
}

export interface FooterSection {
  title: string
  links: FooterLink[]
}

export const FOOTER_SECTIONS: FooterSection[] = [
  {
    title: "Product",
    links: [
      { label: "Platforms", href: "/platforms" },
      { label: "Playground", href: "/developers/playground" },
      { label: "AI Safety Research", href: "/research/ai-chatbots" },
      { label: "Pricing", href: "/pricing" },
      { label: "Demo", href: "/demo" },
      { label: "Changelog", href: "/changelog" },
    ],
  },
  {
    title: "Developers",
    links: [
      { label: "API Docs", href: "/developers" },
      { label: "API Playground", href: "/developers/playground" },
      { label: "GitHub", href: "https://github.com/phosra", external: true },
    ],
  },
  {
    title: "Compliance",
    links: [
      { label: "Compliance Hub", href: "/compliance" },
      { label: "KOSA", href: "/compliance/kosa" },
      { label: "COPPA 2.0", href: "/compliance/coppa-2" },
      { label: "EU DSA", href: "/compliance/eu-dsa" },
      { label: "UK Online Safety", href: "/compliance/uk-osa" },
      { label: "All 78+ Laws →", href: "/compliance" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Press", href: "/press" },
      { label: "Brand", href: "/brand" },
      { label: "Investors", href: "/investors" },
      { label: "Contact", href: "/contact" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
]

// ── Helpers ───────────────────────────────────────────

/** Check if a pathname matches any item in a dropdown */
export function isDropdownActive(dropdown: NavDropdown, pathname: string): boolean {
  return dropdown.sections.some((section) =>
    section.items.some((item) => pathname.startsWith(item.href))
  )
}

/** Get all hrefs from a dropdown for active-link matching */
export function getDropdownHrefs(dropdown: NavDropdown): string[] {
  return dropdown.sections.flatMap((s) => s.items.map((i) => i.href))
}
