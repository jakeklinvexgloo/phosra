"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import {
  Target, Calendar, DollarSign, TrendingUp,
  Users, FileText, Megaphone, Code2, Search, Mail,
  BarChart3, Linkedin, PenTool, Brain, Globe,
  Handshake, Presentation, Phone, ChevronDown, ChevronRight,
  CheckCircle2, Circle, Clock, ArrowRight, Sparkles,
  Bot, User, AlertTriangle, Eye, Plus, X, Power, Copy, Loader2,
  Smartphone, AlertCircle, MessageSquare,
} from "lucide-react"
import { formatPhoneDisplay } from "@/lib/investors/phone"

/** Format phone input as user types: (212) 555-1234 */
function formatAsYouType(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 10)
  if (digits.length === 0) return ""
  if (digits.length <= 3) return `(${digits}`
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
}
import WarmIntrosTab from "./_components/WarmIntrosTab"
import InvestorResearchModal from "./_components/InvestorResearchModal"
import MilestoneAgentModal from "./_components/MilestoneAgentModal"

/* ═══════════════════════════════════════════════════════════════
   DATA: Fundraise plan — milestones, agents, founder tasks
   ═══════════════════════════════════════════════════════════════ */

const RAISE_TARGET = 950_000
const DEADLINE = new Date("2026-05-31")
const START = new Date("2026-02-21")

type Phase = {
  id: string
  name: string
  dates: string
  color: string
  dotColor: string
  milestones: Milestone[]
}

type Milestone = {
  id: string
  title: string
  description: string
  owner: "founder" | "agent" | "both"
  status: "done" | "active" | "upcoming"
  dueDate: string
  agentId?: string
}

type Agent = {
  id: string
  name: string
  role: string
  description: string
  icon: typeof Bot
  color: string
  bgColor: string
  automationLevel: number // 0-100
  tasks: string[]
  tools: string[]
  cadence: string
}

type FounderTask = {
  id: string
  title: string
  why: string
  timePerWeek: string
  icon: typeof User
}

const PHASES: Phase[] = [
  {
    id: "foundation",
    name: "Phase 1: Foundation",
    dates: "Feb 21 — Mar 7",
    color: "text-blue-600 dark:text-blue-400",
    dotColor: "bg-blue-500",
    milestones: [
      {
        id: "m1", title: "Fix homepage zero-counter animation bug",
        description: "Stats sections show '0' instead of actual numbers — undermines credibility with investors",
        owner: "agent", status: "upcoming", dueDate: "Feb 24", agentId: "product-dev",
      },
      {
        id: "m2", title: "Finalize pitch deck (10-12 slides)",
        description: "Problem, solution, market ($5-8B), regulatory tailwind (COPPA 2.0 Apr 22), team (3 exits), product, ask",
        owner: "both", status: "upcoming", dueDate: "Feb 28", agentId: "pitch-deck",
      },
      {
        id: "m3", title: "Build data room in DocSend",
        description: "Deck, financial model, cap table, incorporation docs, product demo access, compliance registry export",
        owner: "both", status: "upcoming", dueDate: "Mar 1", agentId: "financial-model",
      },
      {
        id: "m4", title: "3-year financial model",
        description: "Conservative / moderate / aggressive scenarios. Path to $950K ARR. Benchmark against SaaS comps",
        owner: "both", status: "upcoming", dueDate: "Mar 3", agentId: "financial-model",
      },
      {
        id: "m5", title: "Map warm intro network (100+ paths)",
        description: "2nd/3rd-degree LinkedIn connections to target investors. Warm intros convert 10-15x vs cold",
        owner: "both", status: "upcoming", dueDate: "Mar 5", agentId: "investor-research",
      },
      {
        id: "m6", title: "Launch public API sandbox & developer docs",
        description: "Developers can hit your API in a sandbox. Key traction metric for pre-seed",
        owner: "agent", status: "upcoming", dueDate: "Mar 7", agentId: "product-dev",
      },
      {
        id: "m27", title: "Draft fundraise press release and embargo materials",
        description: "Hybrid narrative: COPPA deadline urgency + 'Plaid of child safety' positioning. 5 headline variants, lede, founder quotes, boilerplate. Target: Tue Mar 3 launch",
        owner: "both", status: "upcoming", dueDate: "Feb 28", agentId: "pr-comms",
      },
      {
        id: "m28", title: "Send embargo pitches to 3 target journalists",
        description: "48-72hr embargo to Sara Fischer (Axios Media Trends), Casey Newton (Platformer), Jedidiah Bracy (IAPP). Personalized pitches per outlet",
        owner: "founder", status: "upcoming", dueDate: "Feb 28",
      },
      {
        id: "m29", title: "Create PR derivative assets (one-pager, platform brief, FAQ)",
        description: "Investor one-pager with data room link, platform sales brief with COPPA timeline, founder FAQ for interviews, policy brief for regulators",
        owner: "both", status: "upcoming", dueDate: "Mar 1", agentId: "pr-comms",
      },
      {
        id: "m30", title: "Press release launch: embargo lift + LinkedIn + X thread",
        description: "8 AM ET embargo lift. Jake LinkedIn personal narrative (800-1200 words). 6-tweet X thread. Susannah companion post +6hrs. Email investor list + platform prospects",
        owner: "both", status: "upcoming", dueDate: "Mar 3", agentId: "pr-comms",
      },
      {
        id: "m31", title: "Post Show HN technical deep-dive on PCSS standard",
        description: "'Show HN: We mapped 78 child safety laws into a single compliance API.' Technical angle, not press release. HN audiences value open standards + infrastructure depth",
        owner: "founder", status: "upcoming", dueDate: "Mar 5",
      },
    ],
  },
  {
    id: "content-pilots",
    name: "Phase 2: Content & Pilots",
    dates: "Mar 8 — Mar 28",
    color: "text-amber-600 dark:text-amber-400",
    dotColor: "bg-amber-500",
    milestones: [
      {
        id: "m7", title: "Begin regulatory content publishing (2x/week)",
        description: "Blog posts analyzing new legislation. Your law registry (78 laws) is a content asset",
        owner: "agent", status: "upcoming", dueDate: "Mar 10", agentId: "content-engine",
      },
      {
        id: "m8", title: "COPPA 2.0 compliance guide (flagship content)",
        description: "April 22 deadline = massive content hook. Target: 'COPPA 2.0 compliance guide' keyword",
        owner: "both", status: "upcoming", dueDate: "Mar 14", agentId: "content-engine",
      },
      {
        id: "m9", title: "Identify & outreach to 10 pilot targets",
        description: "Mid-size platforms facing April 2026 COPPA deadline. Free pilot in exchange for LOI + case study",
        owner: "both", status: "upcoming", dueDate: "Mar 14", agentId: "lead-gen",
      },
      {
        id: "m10", title: "Get deck feedback from 5-10 advisors",
        description: "Steve Haggerty + trusted network. Iterate based on feedback before going live",
        owner: "founder", status: "upcoming", dueDate: "Mar 17",
      },
      {
        id: "m11", title: "Add 1-2 advisory board members",
        description: "Target: regulatory expertise (FTC alumni, child safety), trust & safety, enterprise sales",
        owner: "founder", status: "upcoming", dueDate: "Mar 21",
      },
      {
        id: "m12", title: "Begin scheduling investor meetings",
        description: "Target regtech funds, impact angels, edtech-adjacent (Emerge, Reach Capital), solo-founder-friendly (Hustle Fund, Precursor)",
        owner: "both", status: "upcoming", dueDate: "Mar 21", agentId: "investor-research",
      },
      {
        id: "m13", title: "Submit FTC/state AG public comments",
        description: "Position as regulatory resource. Enormous credibility builder with investors and customers",
        owner: "both", status: "upcoming", dueDate: "Mar 28", agentId: "regulatory-intel",
      },
      {
        id: "m14", title: "LinkedIn thought leadership cadence (daily)",
        description: "Consistent posting builds visibility. Regulatory analysis, product updates, market commentary",
        owner: "agent", status: "upcoming", dueDate: "Mar 10", agentId: "social-media",
      },
      {
        id: "m32", title: "Publish '78 Laws' data report — citable industry resource",
        description: "The Child Safety Compliance Landscape: 78 Laws, 45 States, One Deadline. Downloadable PDF + blog. Target: IAPP pickup + journalist citations",
        owner: "both", status: "upcoming", dueDate: "Mar 10", agentId: "pr-comms",
      },
      {
        id: "m33", title: "Activate super connectors for PR amplification",
        description: "Brief FOSI, IAPP, Technology Coalition, ROOST, k-ID ecosystem, startup attorneys. Share release + policy brief. Ask for newsletter features and event invitations",
        owner: "both", status: "upcoming", dueDate: "Mar 14", agentId: "pr-comms",
      },
      {
        id: "m34", title: "Begin COPPA countdown LinkedIn series (2-3x/week)",
        description: "'X Days to COPPA Compliance' posts highlighting specific requirements. Each post drives phosra.com traffic and positions Jake as the go-to regulatory voice",
        owner: "both", status: "upcoming", dueDate: "Mar 17", agentId: "social-media",
      },
      {
        id: "m35", title: "Publish founder essay: 'Why We Left Fintech for Child Safety'",
        description: "Personal narrative on LinkedIn + Medium. The 3-exits-to-mission arc. Recruiter signal + investor credibility. Targets 10K+ impressions",
        owner: "founder", status: "upcoming", dueDate: "Mar 19",
      },
      {
        id: "m36", title: "Pitch podcast & interview appearances",
        description: "IAPP Privacy Perspectives, Trust & Safety Foundation events, edtech podcasts. Position Jake as regulatory infrastructure expert, not just another founder",
        owner: "founder", status: "upcoming", dueDate: "Mar 21",
      },
    ],
  },
  {
    id: "active-raise",
    name: "Phase 3: Active Fundraise",
    dates: "Mar 29 — Apr 25",
    color: "text-brand-green",
    dotColor: "bg-brand-green",
    milestones: [
      {
        id: "m15", title: "Run 4-6 investor meetings per week",
        description: "Target 20-30 meetings this month. Focus on warm intros (68% of seed rounds start this way)",
        owner: "founder", status: "upcoming", dueDate: "Apr 25",
      },
      {
        id: "m16", title: "Close first pilot customer LOI",
        description: "Even 1 LOI from a recognizable platform transforms narrative from 'nice idea' to 'fundable company'",
        owner: "founder", status: "upcoming", dueDate: "Apr 7",
      },
      {
        id: "m17", title: "COPPA 2.0 deadline content blitz (Apr 22)",
        description: "The hard compliance deadline. Every piece of content, every sales convo should reference this",
        owner: "both", status: "upcoming", dueDate: "Apr 22", agentId: "content-engine",
      },
      {
        id: "m18", title: "Weekly investor updates to warm leads",
        description: "Momentum signals. Product updates, pilot progress, content traction, regulatory news",
        owner: "both", status: "upcoming", dueDate: "Apr 25", agentId: "outreach-seq",
      },
      {
        id: "m19", title: "Attend 1+ relevant conference or event",
        description: "TSPA, FTC workshop, RSA (compliance track), child safety summit. Live-tweet analysis",
        owner: "founder", status: "upcoming", dueDate: "Apr 18",
      },
      {
        id: "m20", title: "Secure lead investor commitment",
        description: "Target: $200-300K check from lead angel or micro-fund. Creates urgency for followers",
        owner: "founder", status: "upcoming", dueDate: "Apr 25",
      },
      {
        id: "m21", title: "Close 2-3 total pilot LOIs",
        description: "Build pipeline from 10 targets. Social proof + case study material for remaining angels",
        owner: "founder", status: "upcoming", dueDate: "Apr 25",
      },
      {
        id: "m37", title: "Pitch COPPA deadline op-ed to major outlet",
        description: "700-word op-ed targeting WSJ, Washington Post, or Axios as April 22 approaches. 'The compliance cliff platforms aren't ready for.' Leverage press coverage momentum",
        owner: "both", status: "upcoming", dueDate: "Apr 7", agentId: "pr-comms",
      },
      {
        id: "m38", title: "Apply to speak at FOSI 2026 + ASU+GSV Summit",
        description: "FOSI 20th Annual Conference (Nov 2026, DC) and ASU+GSV Summit (edtech). Conference presence validates Phosra as industry voice, not just a startup",
        owner: "founder", status: "upcoming", dueDate: "Apr 10",
      },
    ],
  },
  {
    id: "close",
    name: "Phase 4: Close",
    dates: "Apr 26 — May 31",
    color: "text-purple-600 dark:text-purple-400",
    dotColor: "bg-purple-500",
    milestones: [
      {
        id: "m22", title: "Close lead investor SAFE",
        description: "Post-money SAFE, $6M cap. Use YC standard template",
        owner: "founder", status: "upcoming", dueDate: "May 5",
      },
      {
        id: "m23", title: "Run parallel angel closing (5-10 angels)",
        description: "Use lead commitment to create urgency. Target $25-100K checks from 5-10 angels",
        owner: "founder", status: "upcoming", dueDate: "May 20",
      },
      {
        id: "m24", title: "Publish pilot case study",
        description: "How [Platform X] achieved COPPA 2.0 compliance with Phosra in [X] weeks",
        owner: "both", status: "upcoming", dueDate: "May 15", agentId: "content-engine",
      },
      {
        id: "m25", title: "Execute remaining SAFEs & wire funds",
        description: "Target: 8-16 total checks to reach $950K. Mix of lead + angels + syndicates",
        owner: "founder", status: "upcoming", dueDate: "May 28",
      },
      {
        id: "m26", title: "Announce raise (optional) for seed momentum",
        description: "Public announcement drives inbound for seed round. Time with product milestone. Use press release strategy playbook (docs/press-release-strategy.md) and accumulated media relationships",
        owner: "both", status: "upcoming", dueDate: "May 31", agentId: "social-media",
      },
    ],
  },
]

const AGENTS: Agent[] = [
  {
    id: "regulatory-intel",
    name: "Regulatory Intel",
    role: "Legislation Monitor",
    description: "Monitors child safety legislation across 50+ jurisdictions. Tracks bill introductions, committee votes, FTC enforcement actions, EU DSA updates. Generates investor-ready regulatory landscape reports.",
    icon: Globe,
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-100 dark:bg-red-900/30",
    automationLevel: 85,
    tasks: [
      "Scan congress.gov, state legislatures, FTC.gov, EU digital strategy daily",
      "Alert on new child safety bills, amendments, enforcement actions",
      "Generate weekly regulatory brief for investor updates",
      "Draft public comment submissions for FTC/AG proceedings",
      "Maintain and update law-registry.ts with new legislation",
    ],
    tools: ["Claude API", "Web scraping", "RSS feeds", "GitHub Actions"],
    cadence: "Daily scans, weekly reports",
  },
  {
    id: "investor-research",
    name: "Investor Research",
    role: "Deal Flow Intelligence",
    description: "Builds and maintains investor database. Maps warm intro paths through 2nd/3rd-degree connections. Tracks fund activity, thesis alignment, portfolio companies. Generates personalized outreach drafts.",
    icon: Search,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    automationLevel: 75,
    tasks: [
      "Build database: fund thesis, check size, portfolio, contact info",
      "Map warm intro paths through LinkedIn network analysis",
      "Track who just raised new funds or invested in adjacent spaces",
      "Generate personalized outreach drafts per investor",
      "Monitor Crunchbase/PitchBook for regtech/child-safety deals",
    ],
    tools: ["Clay", "Apollo", "LinkedIn Sales Navigator", "Crunchbase"],
    cadence: "Weekly database refresh, real-time alerts",
  },
  {
    id: "content-engine",
    name: "Content Engine",
    role: "Thought Leadership Writer",
    description: "Produces regulatory analysis blog posts, compliance guides, newsletters, and whitepapers. Leverages the 78-law registry as source material. Targets SEO keywords around COPPA 2.0, KOSA, age verification.",
    icon: PenTool,
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
    automationLevel: 70,
    tasks: [
      "Draft 2x/week blog posts analyzing legislation changes",
      "Create COPPA 2.0 compliance guide (flagship content piece)",
      "Write weekly newsletter for subscriber list",
      "Draft case studies from pilot customer data",
      "Generate SEO-optimized landing pages per law",
    ],
    tools: ["Claude API", "WordPress/Ghost", "Ahrefs", "Mailchimp"],
    cadence: "2 posts/week, 1 newsletter/week",
  },
  {
    id: "competitive-intel",
    name: "Competitive Intel",
    role: "Market Monitor",
    description: "Continuously monitors competitor websites, funding announcements, product launches, job postings, and partnership announcements. Maintains living competitive matrix for investor conversations.",
    icon: BarChart3,
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
    automationLevel: 80,
    tasks: [
      "Monitor Bark, Qustodio, Yoti, Veriff, SuperAwesome websites weekly",
      "Track funding announcements in age verification / child safety",
      "Analyze competitor job postings for strategic direction signals",
      "Generate weekly competitive brief",
      "Maintain investor-ready competitive positioning matrix",
    ],
    tools: ["Web scraping", "Crunchbase alerts", "Google Alerts", "Claude API"],
    cadence: "Weekly briefs, real-time alerts",
  },
  {
    id: "lead-gen",
    name: "Lead Generation",
    role: "Pipeline Builder",
    description: "Identifies platforms needing child safety compliance. Monitors buying signals: job postings for 'trust & safety' roles, recent funding (compliance pressure), regulatory deadlines. Enriches and scores leads.",
    icon: Target,
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
    automationLevel: 65,
    tasks: [
      "Identify platforms facing COPPA 2.0 April deadline",
      "Monitor job boards for 'trust and safety' / 'compliance' hiring",
      "Track recent funding rounds (freshly funded = compliance pressure)",
      "Enrich leads with company size, tech stack, decision makers",
      "Score and prioritize pipeline by urgency and fit",
    ],
    tools: ["Apollo", "Clay", "LinkedIn", "BuiltWith", "Claude API"],
    cadence: "Weekly pipeline refresh, daily alerts",
  },
  {
    id: "social-media",
    name: "Social Presence",
    role: "Brand Builder",
    description: "Maintains consistent LinkedIn and X/Twitter presence. Drafts thought leadership posts, regulatory commentary, product updates. Monitors relevant conversations for engagement opportunities.",
    icon: Linkedin,
    color: "text-sky-600 dark:text-sky-400",
    bgColor: "bg-sky-100 dark:bg-sky-900/30",
    automationLevel: 60,
    tasks: [
      "Draft daily LinkedIn posts (regulatory analysis, product insights)",
      "Draft 3-5x/week X/Twitter posts and threads",
      "Monitor #childsafety, #KOSA, #COPPA hashtags for engagement",
      "Schedule and optimize posting times",
      "Track engagement metrics and iterate on content strategy",
    ],
    tools: ["Buffer/Typefully", "Claude API", "LinkedIn", "X/Twitter"],
    cadence: "Daily LinkedIn, 3-5x/week Twitter",
  },
  {
    id: "pr-comms",
    name: "PR & Comms",
    role: "Press Strategy",
    description: "Manages press release strategy, media outreach, and earned media. Drafts releases, coordinates embargoes, produces derivative PR assets (one-pagers, briefs, data reports). Leverages COPPA deadline and regulatory momentum as media hooks.",
    icon: Megaphone,
    color: "text-pink-600 dark:text-pink-400",
    bgColor: "bg-pink-100 dark:bg-pink-900/30",
    automationLevel: 65,
    tasks: [
      "Draft press releases and coordinate embargo strategy with 3 target journalists",
      "Build targeted journalist contact list (Axios, Platformer, IAPP, TechCrunch)",
      "Create derivative PR assets (investor one-pager, platform brief, founder FAQ)",
      "Produce citable data reports from 78-law compliance registry",
      "Track media coverage, compile press roundups, pitch follow-on stories",
    ],
    tools: ["Claude API", "Muck Rack", "Google Docs", "Buffer"],
    cadence: "Continuous during launch week, weekly post-launch",
  },
  {
    id: "outreach-seq",
    name: "Outreach Sequencer",
    role: "Email Campaign Manager",
    description: "Manages multi-step email sequences for both investor and customer outreach. Personalizes at scale. Handles follow-ups, CRM updates, and meeting scheduling logistics.",
    icon: Mail,
    color: "text-indigo-600 dark:text-indigo-400",
    bgColor: "bg-indigo-100 dark:bg-indigo-900/30",
    automationLevel: 55,
    tasks: [
      "Build personalized investor email sequences (3-5 touch cadence)",
      "Draft customer outreach for pilot targets",
      "Manage follow-up scheduling and reminders",
      "Update CRM with meeting outcomes and next steps",
      "Generate weekly investor update emails",
    ],
    tools: ["Instantly.ai", "Attio/Notion CRM", "Calendly", "Claude API"],
    cadence: "Continuous sequences, weekly updates",
  },
  {
    id: "financial-model",
    name: "Financial Modeler",
    role: "Numbers & Projections",
    description: "Builds and iterates the 3-year financial model. Scenario analysis across conservative/moderate/aggressive. Benchmarks against comparable SaaS companies. Generates investor-ready outputs.",
    icon: DollarSign,
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-100 dark:bg-green-900/30",
    automationLevel: 70,
    tasks: [
      "Build 3-year P&L with SaaS metrics (ARR, churn, LTV, CAC)",
      "Model 3 scenarios: conservative, moderate, aggressive",
      "Benchmark against Qustodio, Bark, age verification comps",
      "Generate use-of-funds slide with $950K allocation",
      "Iterate model based on investor feedback",
    ],
    tools: ["Claude API", "Google Sheets", "Excel"],
    cadence: "Weekly iteration during active raise",
  },
  {
    id: "pitch-deck",
    name: "Pitch Deck",
    role: "Narrative Designer",
    description: "Iterates pitch deck based on investor feedback. A/B tests messaging angles. Creates data visualizations from compliance registry and market data. Maintains multiple deck versions for different audiences.",
    icon: Presentation,
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-100 dark:bg-orange-900/30",
    automationLevel: 50,
    tasks: [
      "Draft initial 10-12 slide deck structure and content",
      "Create market size / regulatory timeline visualizations",
      "Generate appendix slides (competitive matrix, law coverage)",
      "Iterate messaging based on meeting feedback",
      "Maintain 'enterprise' vs 'angel' deck variants",
    ],
    tools: ["Gamma/Canva", "Claude API", "Figma"],
    cadence: "Weekly iteration, post-meeting updates",
  },
  {
    id: "product-dev",
    name: "Product Dev",
    role: "Engineering Agent",
    description: "Ships features, fixes bugs, builds integrations. Currently: fix zero-counter bug, complete Clerk auth, expand platform adapters. Claude Code as the primary development tool.",
    icon: Code2,
    color: "text-cyan-600 dark:text-cyan-400",
    bgColor: "bg-cyan-100 dark:bg-cyan-900/30",
    automationLevel: 80,
    tasks: [
      "Fix homepage zero-counter animation bug (critical)",
      "Complete Clerk auth integration",
      "Build public API sandbox and developer playground",
      "Expand platform adapter coverage (Netflix, Disney+ stubs → partial)",
      "Ship features that drive pilot customer conversations",
    ],
    tools: ["Claude Code", "GitHub", "Vercel", "Railway"],
    cadence: "Continuous development",
  },
]

const FOUNDER_FOCUS: FounderTask[] = [
  {
    id: "f1", title: "Investor Meetings & Relationship Building",
    why: "You ARE the product at pre-seed. No agent can replace the trust, conviction, and founder-market fit that investors evaluate in person. Warm intros convert at 58%+ vs 2-4% cold.",
    timePerWeek: "10-15 hrs/week (Phase 3-4)",
    icon: Handshake,
  },
  {
    id: "f2", title: "Customer Discovery Calls",
    why: "This is where you learn what to build and how to position. Pattern recognition across discovery conversations shapes your entire product strategy. No substitute.",
    timePerWeek: "5-8 hrs/week",
    icon: Phone,
  },
  {
    id: "f3", title: "Strategic Decisions & Positioning",
    why: "Pricing, packaging, which pilots to prioritize, which advisors to add, how to frame the narrative. Agents provide data; you provide judgment.",
    timePerWeek: "3-5 hrs/week",
    icon: Brain,
  },
  {
    id: "f4", title: "Partnership Negotiations",
    why: "Age verification providers (Yoti, Veriff), law firms advising on COPPA, child safety nonprofits (NCMEC, FOSI). Trust-based relationships that require a human.",
    timePerWeek: "2-4 hrs/week",
    icon: Users,
  },
  {
    id: "f5", title: "The Pitch Itself",
    why: "Regulatory tailwind story, product demo, team credibility, the ask. Review and approve all agent-drafted content. Your voice, your conviction.",
    timePerWeek: "5-10 hrs/week",
    icon: Megaphone,
  },
]

const ROUND_STRUCTURE = [
  { type: "Lead angel or micro-fund", checkSize: "$200-300K", count: "1", total: "$200-300K" },
  { type: "Angel investors", checkSize: "$25-100K", count: "5-10", total: "$250-500K" },
  { type: "Angel syndicates", checkSize: "$100-250K", count: "1-2", total: "$200-350K" },
  { type: "Strategic angels (T&S, compliance)", checkSize: "$25-50K", count: "2-4", total: "$50-200K" },
]

/* ═══════════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export default function FundraiseCommandCenter() {
  const [expandedPhase, setExpandedPhase] = useState<string | null>("foundation")
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"timeline" | "agents" | "founder" | "warm-intros" | "investor-access">("timeline")
  const [showResearchModal, setShowResearchModal] = useState(false)
  const [activeMilestoneModal, setActiveMilestoneModal] = useState<{
    milestone: Milestone; agent: Agent; phase: Phase
  } | null>(null)

  // Milestone check-off state (persisted to localStorage)
  const [milestoneOverrides, setMilestoneOverrides] = useState<
    Record<string, { status: "done" | "active" | "upcoming"; comment?: string }>
  >({})
  const [commentingId, setCommentingId] = useState<string | null>(null)
  const [commentDraft, setCommentDraft] = useState("")
  const commentInputRef = useRef<HTMLTextAreaElement>(null)

  // Load milestone state from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("fundraise-milestones")
      if (saved) setMilestoneOverrides(JSON.parse(saved))
    } catch { /* ignore */ }
  }, [])

  // Persist milestone state to localStorage
  const saveMilestoneOverrides = useCallback(
    (next: Record<string, { status: "done" | "active" | "upcoming"; comment?: string }>) => {
      setMilestoneOverrides(next)
      try { localStorage.setItem("fundraise-milestones", JSON.stringify(next)) } catch { /* ignore */ }
    },
    [],
  )

  const getMilestoneStatus = useCallback(
    (m: Milestone) => milestoneOverrides[m.id]?.status ?? m.status,
    [milestoneOverrides],
  )

  const getMilestoneComment = useCallback(
    (id: string) => milestoneOverrides[id]?.comment,
    [milestoneOverrides],
  )

  const cycleMilestoneStatus = useCallback(
    (m: Milestone) => {
      const current = getMilestoneStatus(m)
      // Cycle: upcoming → active → done → upcoming
      const next = current === "upcoming" ? "active" : current === "active" ? "done" : "upcoming"
      const existing = milestoneOverrides[m.id]
      if (next === m.status && !existing?.comment) {
        // Remove override if returning to default with no comment
        const { [m.id]: _, ...rest } = milestoneOverrides
        saveMilestoneOverrides(rest)
      } else {
        saveMilestoneOverrides({
          ...milestoneOverrides,
          [m.id]: { ...existing, status: next },
        })
      }
      // If marking done, open comment input
      if (next === "done") {
        setCommentingId(m.id)
        setCommentDraft(existing?.comment ?? "")
      }
    },
    [milestoneOverrides, getMilestoneStatus, saveMilestoneOverrides],
  )

  const saveComment = useCallback(
    (id: string) => {
      const trimmed = commentDraft.trim()
      const existing = milestoneOverrides[id]
      if (existing) {
        saveMilestoneOverrides({
          ...milestoneOverrides,
          [id]: { ...existing, comment: trimmed || undefined },
        })
      }
      setCommentingId(null)
      setCommentDraft("")
    },
    [commentDraft, milestoneOverrides, saveMilestoneOverrides],
  )

  // Focus comment textarea when it opens
  useEffect(() => {
    if (commentingId && commentInputRef.current) {
      commentInputRef.current.focus()
    }
  }, [commentingId])

  // Calculate days remaining
  const now = new Date()
  const daysRemaining = Math.max(0, Math.ceil((DEADLINE.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
  const totalDays = Math.ceil((DEADLINE.getTime() - START.getTime()) / (1000 * 60 * 60 * 24))
  const elapsed = totalDays - daysRemaining
  const progressPct = Math.min(100, Math.round((elapsed / totalDays) * 100))

  // Count milestones (with overrides)
  const allMilestones = PHASES.flatMap((p) => p.milestones)
  const doneMilestones = allMilestones.filter((m) => getMilestoneStatus(m) === "done").length
  const activeMilestones = allMilestones.filter((m) => getMilestoneStatus(m) === "active").length

  // Investor access state
  const [investorPhones, setInvestorPhones] = useState<Array<{
    id: string; phone_e164: string; name: string; company: string;
    notes: string; is_active: boolean; created_at: string; last_login: string | null;
  }>>([])
  const [phonesLoading, setPhonesLoading] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [addForm, setAddForm] = useState({ phone: "", name: "", company: "", notes: "" })
  const [addLoading, setAddLoading] = useState(false)
  const [addError, setAddError] = useState("")
  const [copiedLink, setCopiedLink] = useState(false)
  const [confirmDeactivate, setConfirmDeactivate] = useState<string | null>(null)
  const [showAddConfirm, setShowAddConfirm] = useState(false)
  const [addSuccess, setAddSuccess] = useState(false)
  const [copiedInviteLink, setCopiedInviteLink] = useState(false)

  /** Build headers including sandbox session when applicable. */
  const investorAdminHeaders = useCallback((extra?: Record<string, string>) => {
    const h: Record<string, string> = { "Content-Type": "application/json", ...extra }
    const sandbox = typeof window !== "undefined" ? localStorage.getItem("sandbox-session") : null
    if (sandbox) h["X-Sandbox-Session"] = sandbox
    return h
  }, [])

  const fetchPhones = useCallback(async () => {
    setPhonesLoading(true)
    try {
      const res = await fetch("/api/investors/admin/phones", { headers: investorAdminHeaders() })
      if (res.ok) {
        const data = await res.json()
        setInvestorPhones(data.phones || [])
      }
    } catch {
      // silently fail
    } finally {
      setPhonesLoading(false)
    }
  }, [investorAdminHeaders])

  useEffect(() => {
    if (activeTab === "investor-access") {
      fetchPhones()
    }
  }, [activeTab, fetchPhones])

  const handleAddInvestor = async () => {
    if (!addForm.phone) { setAddError("Phone number is required"); return }
    if (addForm.phone.length < 10) { setAddError("Enter a valid 10-digit phone number"); return }
    // Show confirmation before sending SMS
    if (!showAddConfirm) { setShowAddConfirm(true); return }
    setShowAddConfirm(false)
    setAddLoading(true)
    setAddError("")
    try {
      const res = await fetch("/api/investors/admin/phones", {
        method: "POST",
        headers: investorAdminHeaders(),
        body: JSON.stringify(addForm),
      })
      if (res.ok) {
        setAddSuccess(true)
        fetchPhones()
      } else {
        const data = await res.json()
        setAddError(data.error || "Failed to add")
      }
    } catch {
      setAddError("Network error")
    } finally {
      setAddLoading(false)
    }
  }

  const handleToggleActive = async (phone: string, currentlyActive: boolean) => {
    if (currentlyActive) {
      // Require confirmation for deactivation
      if (confirmDeactivate !== phone) { setConfirmDeactivate(phone); return }
      setConfirmDeactivate(null)
      await fetch("/api/investors/admin/phones", {
        method: "DELETE",
        headers: investorAdminHeaders(),
        body: JSON.stringify({ phone }),
      })
    } else {
      await fetch("/api/investors/admin/phones", {
        method: "POST",
        headers: investorAdminHeaders(),
        body: JSON.stringify({ phone }),
      })
    }
    fetchPhones()
  }

  const portalUrl = typeof window !== "undefined" ? `${window.location.origin}/investors/portal` : "https://www.phosra.com/investors/portal"

  const handleCopyLink = () => {
    navigator.clipboard.writeText(portalUrl)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  const TABS = [
    { key: "timeline" as const, label: "Timeline", icon: Calendar },
    { key: "agents" as const, label: "Agent Workforce", icon: Bot },
    { key: "founder" as const, label: "Your Focus", icon: User },
    { key: "warm-intros" as const, label: "Warm Intros", icon: Handshake },
    { key: "investor-access" as const, label: "Investor Access", icon: Smartphone },
  ]

  return (
    <div className="space-y-8">
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-semibold text-foreground">Fundraise Command Center</h1>
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand-green/10 text-brand-green uppercase tracking-wider">
              Pre-Seed
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            $950K raise by May 31, 2026 — milestones, agent workforce, and your high-value work
          </p>
        </div>
        <a
          href="/investors/portal?admin_preview=1"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted/60 transition-colors whitespace-nowrap flex-shrink-0"
        >
          <Eye className="w-4 h-4" />
          Preview Investor Portal
        </a>
      </div>

      {/* ── Top Stats ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="plaid-card !py-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-md bg-brand-green/10">
              <DollarSign className="w-3.5 h-3.5 text-brand-green" />
            </div>
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Target</span>
          </div>
          <div className="text-xl font-semibold tabular-nums">$950,000</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">Post-money SAFE, $6M cap</div>
        </div>

        <div className="plaid-card !py-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-md bg-red-100 dark:bg-red-900/30">
              <Calendar className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
            </div>
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Deadline</span>
          </div>
          <div className="text-xl font-semibold tabular-nums">{daysRemaining}</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">days remaining</div>
        </div>

        <div className="plaid-card !py-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-md bg-amber-100 dark:bg-amber-900/30">
              <Target className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            </div>
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Milestones</span>
          </div>
          <div className="text-xl font-semibold tabular-nums">{doneMilestones}/{allMilestones.length}</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">{activeMilestones} in progress</div>
        </div>

        <div className="plaid-card !py-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-md bg-purple-100 dark:bg-purple-900/30">
              <Bot className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Agents</span>
          </div>
          <div className="text-xl font-semibold tabular-nums">{AGENTS.length}</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">in workforce</div>
        </div>

        <div className="plaid-card !py-3 col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-md bg-blue-100 dark:bg-blue-900/30">
              <TrendingUp className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">COPPA 2.0</span>
          </div>
          <div className="text-xl font-semibold tabular-nums text-red-600 dark:text-red-400">Apr 22</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">compliance deadline</div>
        </div>
      </div>

      {/* ── Progress Bar ─────────────────────────────────────── */}
      <div className="plaid-card !py-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-muted-foreground">Sprint Progress</span>
          <span className="text-xs text-muted-foreground tabular-nums">{progressPct}% elapsed</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-green rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
          <span>Feb 21</span>
          <span className="text-red-500 font-medium">Apr 22 COPPA</span>
          <span>May 31</span>
        </div>
      </div>

      {/* ── Tab Bar ──────────────────────────────────────────── */}
      <div className="flex items-center bg-muted/60 rounded-lg p-0.5 w-fit overflow-x-auto max-w-full">
        {TABS.map((t) => {
          const active = activeTab === t.key
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-medium transition-all ${
                active
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <t.icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          )
        })}
      </div>

      {/* ═══ TIMELINE TAB ══════════════════════════════════════ */}
      {activeTab === "timeline" && (
        <div className="space-y-4">
          {/* Round structure summary */}
          <div className="plaid-card">
            <h3 className="text-sm font-semibold text-foreground mb-3">Target Round Structure</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 text-muted-foreground font-medium">Investor Type</th>
                    <th className="text-left py-2 text-muted-foreground font-medium">Check Size</th>
                    <th className="text-left py-2 text-muted-foreground font-medium">Count</th>
                    <th className="text-right py-2 text-muted-foreground font-medium">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {ROUND_STRUCTURE.map((r) => (
                    <tr key={r.type} className="border-b border-border/50">
                      <td className="py-2 text-foreground">{r.type}</td>
                      <td className="py-2 text-muted-foreground tabular-nums">{r.checkSize}</td>
                      <td className="py-2 text-muted-foreground tabular-nums">{r.count}</td>
                      <td className="py-2 text-foreground font-medium tabular-nums text-right">{r.total}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td className="pt-2 text-foreground font-semibold">Total target</td>
                    <td></td>
                    <td className="pt-2 text-muted-foreground tabular-nums">8-16 checks</td>
                    <td className="pt-2 text-foreground font-semibold tabular-nums text-right">$950,000</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Phase timeline */}
          {PHASES.map((phase) => {
            const isExpanded = expandedPhase === phase.id
            const doneCount = phase.milestones.filter((m) => getMilestoneStatus(m) === "done").length
            return (
              <div key={phase.id} className="plaid-card p-0 overflow-hidden">
                <button
                  onClick={() => setExpandedPhase(isExpanded ? null : phase.id)}
                  className="w-full flex items-center gap-3 px-5 py-4 hover:bg-muted/30 transition-colors text-left"
                >
                  <div className={`w-2.5 h-2.5 rounded-full ${phase.dotColor} flex-shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-semibold ${phase.color}`}>{phase.name}</div>
                    <div className="text-xs text-muted-foreground">{phase.dates}</div>
                  </div>
                  <div className="text-xs text-muted-foreground tabular-nums mr-2">
                    {doneCount}/{phase.milestones.length} done
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  )}
                </button>
                {isExpanded && (
                  <div className="border-t border-border divide-y divide-border/50">
                    {phase.milestones.map((m) => {
                      const status = getMilestoneStatus(m)
                      const comment = getMilestoneComment(m.id)
                      const isCommenting = commentingId === m.id
                      return (
                        <div key={m.id} className="px-5 py-3 hover:bg-muted/20 transition-colors">
                          <div className="flex items-start gap-3">
                            <button
                              onClick={() => cycleMilestoneStatus(m)}
                              className="mt-0.5 flex-shrink-0 group"
                              title={`Status: ${status}. Click to cycle.`}
                            >
                              {status === "done" ? (
                                <CheckCircle2 className="w-4 h-4 text-brand-green group-hover:text-brand-green/70 transition-colors" />
                              ) : status === "active" ? (
                                <Clock className="w-4 h-4 text-amber-500 animate-pulse group-hover:text-amber-400 transition-colors" />
                              ) : (
                                <Circle className="w-4 h-4 text-muted-foreground/40 group-hover:text-muted-foreground/70 transition-colors" />
                              )}
                            </button>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`text-sm font-medium ${status === "done" ? "text-muted-foreground line-through" : "text-foreground"}`}>
                                  {m.title}
                                </span>
                                <span className={`inline-flex items-center gap-1 text-[9px] font-medium px-1.5 py-0.5 rounded-full ${
                                  m.owner === "agent"
                                    ? "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400"
                                    : m.owner === "founder"
                                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                                    : "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
                                }`}>
                                  {m.owner === "agent" ? (
                                    <><Bot className="w-2.5 h-2.5" /> Agent</>
                                  ) : m.owner === "founder" ? (
                                    <><User className="w-2.5 h-2.5" /> You</>
                                  ) : (
                                    <><Sparkles className="w-2.5 h-2.5" /> You + Agent</>
                                  )}
                                </span>
                                {comment && !isCommenting && (
                                  <button
                                    onClick={() => { setCommentingId(m.id); setCommentDraft(comment) }}
                                    className="inline-flex items-center gap-1 text-[9px] text-muted-foreground hover:text-foreground transition-colors"
                                    title="Edit comment"
                                  >
                                    <MessageSquare className="w-2.5 h-2.5" />
                                  </button>
                                )}
                                {!comment && !isCommenting && (
                                  <button
                                    onClick={() => { setCommentingId(m.id); setCommentDraft("") }}
                                    className="inline-flex items-center gap-1 text-[9px] text-muted-foreground/0 hover:text-muted-foreground transition-colors group-hover:text-muted-foreground/50"
                                    title="Add comment"
                                  >
                                    <MessageSquare className="w-2.5 h-2.5" />
                                  </button>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">{m.description}</p>

                              {/* Saved comment display */}
                              {comment && !isCommenting && (
                                <button
                                  onClick={() => { setCommentingId(m.id); setCommentDraft(comment) }}
                                  className="mt-2 flex items-start gap-1.5 text-left group/comment"
                                >
                                  <MessageSquare className="w-3 h-3 text-brand-green flex-shrink-0 mt-0.5" />
                                  <span className="text-xs text-foreground/80 leading-relaxed group-hover/comment:text-foreground transition-colors">
                                    {comment}
                                  </span>
                                </button>
                              )}

                              {/* Comment input */}
                              {isCommenting && (
                                <div className="mt-2 space-y-1.5">
                                  <textarea
                                    ref={commentInputRef}
                                    value={commentDraft}
                                    onChange={(e) => setCommentDraft(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault()
                                        saveComment(m.id)
                                      }
                                      if (e.key === "Escape") {
                                        setCommentingId(null)
                                        setCommentDraft("")
                                      }
                                    }}
                                    placeholder="Add a note (Enter to save, Esc to cancel)..."
                                    rows={2}
                                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-brand-green resize-none"
                                  />
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => saveComment(m.id)}
                                      className="text-[10px] font-medium px-2 py-1 rounded bg-brand-green text-[#0D1B2A] hover:bg-brand-green/90 transition-colors"
                                    >
                                      Save
                                    </button>
                                    <button
                                      onClick={() => { setCommentingId(null); setCommentDraft("") }}
                                      className="text-[10px] font-medium px-2 py-1 rounded text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                      Cancel
                                    </button>
                                    {comment && (
                                      <button
                                        onClick={() => {
                                          const existing = milestoneOverrides[m.id]
                                          if (existing) {
                                            const { comment: _, ...rest } = existing
                                            saveMilestoneOverrides({
                                              ...milestoneOverrides,
                                              [m.id]: rest as typeof existing,
                                            })
                                          }
                                          setCommentingId(null)
                                          setCommentDraft("")
                                        }}
                                        className="text-[10px] font-medium px-2 py-1 rounded text-red-500 hover:text-red-400 transition-colors"
                                      >
                                        Delete note
                                      </button>
                                    )}
                                  </div>
                                </div>
                              )}

                              <div className="flex items-center gap-3 mt-1.5">
                                <span className="text-[10px] text-muted-foreground">Due: {m.dueDate}</span>
                                {m.agentId && (() => {
                                  const agent = AGENTS.find((a) => a.id === m.agentId)
                                  if (!agent) return null
                                  return (
                                    <>
                                      <span className="text-[10px] text-muted-foreground/70">
                                        Agent: {agent.name}
                                      </span>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          setActiveMilestoneModal({ milestone: m, agent, phase })
                                        }}
                                        className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand-green/10 text-brand-green hover:bg-brand-green/20 transition-colors"
                                      >
                                        <Sparkles className="w-2.5 h-2.5" />
                                        Execute
                                      </button>
                                    </>
                                  )
                                })()}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}

          {/* The Narrative */}
          <div className="plaid-card border-l-2 border-l-brand-green">
            <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-brand-green" />
              The Pitch Narrative
            </h3>
            <div className="space-y-2 text-xs text-muted-foreground leading-relaxed">
              <p>
                <strong className="text-foreground">The problem:</strong> 67+ child safety laws are now in effect or pending. Platforms face a compliance cliff — COPPA 2.0 enforcement hits April 2026, half of US states mandate age gating, EU DSA enforcement is ramping. Every platform is building bespoke compliance solutions because no unified API exists.
              </p>
              <p>
                <strong className="text-foreground">The solution:</strong> Phosra is the Plaid for child safety compliance — a single API that maps 45 enforcement rule categories across 67+ laws and pushes controls to 15+ provider adapters. Define once, enforce everywhere.
              </p>
              <p>
                <strong className="text-foreground">The market:</strong> $5-8B combined market (parental controls + age verification + compliance tooling) growing at 12%+ CAGR, driven by regulatory mandate, not discretionary spend.
              </p>
              <p>
                <strong className="text-foreground">The timing:</strong> COPPA 2.0 compliance deadline is April 22, 2026. Platforms are panicking now. Every month of delay increases their regulatory risk and our urgency-driven sales motion.
              </p>
              <p>
                <strong className="text-foreground">The ask:</strong> $950K pre-seed to sign 10 pilot customers, expand law coverage to 75+ jurisdictions, and build the sales motion for seed.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ═══ AGENTS TAB ════════════════════════════════════════ */}
      {activeTab === "agents" && (
        <div className="space-y-4">
          {/* Key insight */}
          <div className="plaid-card border-l-2 border-l-amber-500 !py-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-foreground font-medium">Agents are your co-founder substitute for execution, not for relationships.</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Use them aggressively for content, research, competitive analysis, and outreach prep. The investor meetings, customer discovery calls, and partnership handshakes are yours alone.
                </p>
              </div>
            </div>
          </div>

          {/* Automation summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="plaid-card !py-3 text-center">
              <div className="text-2xl font-semibold text-brand-green tabular-nums">
                {Math.round(AGENTS.reduce((sum, a) => sum + a.automationLevel, 0) / AGENTS.length)}%
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">Avg automation level</div>
            </div>
            <div className="plaid-card !py-3 text-center">
              <div className="text-2xl font-semibold text-foreground tabular-nums">~$300</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">Est. monthly tool cost</div>
            </div>
            <div className="plaid-card !py-3 text-center">
              <div className="text-2xl font-semibold text-foreground tabular-nums">40+</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">hrs/week saved</div>
            </div>
          </div>

          {/* Agent cards */}
          <div className="space-y-2">
            {AGENTS.map((agent) => {
              const isExpanded = expandedAgent === agent.id
              return (
                <div key={agent.id} className="plaid-card p-0 overflow-hidden">
                  <button
                    onClick={() => setExpandedAgent(isExpanded ? null : agent.id)}
                    className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-muted/30 transition-colors text-left"
                  >
                    <div className={`p-1.5 rounded-md ${agent.bgColor} flex-shrink-0`}>
                      <agent.icon className={`w-3.5 h-3.5 ${agent.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground">{agent.name}</div>
                      <div className="text-xs text-muted-foreground">{agent.role}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="hidden sm:flex items-center gap-1.5">
                        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-brand-green rounded-full"
                            style={{ width: `${agent.automationLevel}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-muted-foreground tabular-nums w-8">{agent.automationLevel}%</span>
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      )}
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="border-t border-border px-5 py-4 space-y-4">
                      <p className="text-xs text-muted-foreground leading-relaxed">{agent.description}</p>

                      <div>
                        <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-2">Tasks</div>
                        <ul className="space-y-1.5">
                          {agent.tasks.map((task, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-foreground">
                              <ArrowRight className="w-3 h-3 text-muted-foreground flex-shrink-0 mt-0.5" />
                              {task}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex flex-wrap gap-4">
                        <div>
                          <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1">Tools</div>
                          <div className="flex flex-wrap gap-1">
                            {agent.tools.map((tool) => (
                              <span key={tool} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                                {tool}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1">Cadence</div>
                          <span className="text-xs text-foreground">{agent.cadence}</span>
                        </div>
                      </div>

                      {agent.id === "investor-research" && (
                        <button
                          onClick={() => setShowResearchModal(true)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-brand-green text-[#0D1B2A] text-xs font-semibold hover:bg-brand-green/90 transition-colors"
                        >
                          <Sparkles className="w-3 h-3" />
                          Run Research
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ═══ FOUNDER FOCUS TAB ═════════════════════════════════ */}
      {activeTab === "founder" && (
        <div className="space-y-4">
          {/* Time allocation */}
          <div className="plaid-card">
            <h3 className="text-sm font-semibold text-foreground mb-3">Your Weekly Time Budget</h3>
            <p className="text-xs text-muted-foreground mb-4">
              These are the activities where your time creates 10x+ more value than any agent.
              Everything else gets delegated.
            </p>
            <div className="space-y-3">
              {FOUNDER_FOCUS.map((task) => (
                <div key={task.id} className="flex items-start gap-3 py-3 border-b border-border/50 last:border-0 last:pb-0">
                  <div className="p-1.5 rounded-md bg-blue-100 dark:bg-blue-900/30 flex-shrink-0 mt-0.5">
                    <task.icon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-foreground">{task.title}</span>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap tabular-nums">{task.timePerWeek}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{task.why}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Key principles */}
          <div className="plaid-card border-l-2 border-l-brand-green">
            <h3 className="text-sm font-semibold text-foreground mb-3">Operating Principles</h3>
            <div className="space-y-3 text-xs text-muted-foreground">
              <div className="flex items-start gap-2">
                <span className="text-brand-green font-bold">1.</span>
                <p><strong className="text-foreground">COPPA 2.0 April 22 is your #1 asset.</strong> Every content piece, every sales convo, every investor meeting should reference this deadline. Urgency sells.</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-brand-green font-bold">2.</span>
                <p><strong className="text-foreground">Pilot customers unlock everything.</strong> Even 2-3 LOIs from recognizable platforms transform a &quot;nice idea&quot; into a &quot;fundable company.&quot; Prioritize this above everything except the product itself.</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-brand-green font-bold">3.</span>
                <p><strong className="text-foreground">Your law registry is a moat.</strong> 67 laws with full metadata, mapped to 45 rule categories — months of domain work that competitors would need to replicate. Make this visible in your pitch.</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-brand-green font-bold">4.</span>
                <p><strong className="text-foreground">Warm intros are 10-15x more effective than cold outreach.</strong> Spend time mapping your network before blasting cold emails. Ask every advisor, friend, and existing contact for introductions to 2-3 investors.</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-brand-green font-bold">5.</span>
                <p><strong className="text-foreground">You are the product at pre-seed.</strong> Investors buy founder-market fit. Your 3 exits, Mastercard infrastructure experience, and 5 kids dog-fooding the product IS the moat. Agents draft; you deliver.</p>
              </div>
            </div>
          </div>

          {/* Target investor profiles */}
          <div className="plaid-card">
            <h3 className="text-sm font-semibold text-foreground mb-3">Target Investor Profiles</h3>
            <div className="space-y-2">
              {[
                { type: "Regtech / compliance-focused funds", why: "Understand compliance buying motion", priority: "High" },
                { type: "Impact / safety-focused angels", why: "Trust & Safety leaders at major platforms", priority: "High" },
                { type: "EdTech-adjacent funds", why: "Emerge Education, Reach Capital, Brighteye Ventures", priority: "Medium" },
                { type: "Solo-founder-friendly funds", why: "a16z Speedrun, Hustle Fund, Precursor Ventures", priority: "Medium" },
                { type: "Strategic angels", why: "FTC alumni, COPPA enforcers, child safety nonprofit leaders", priority: "High" },
              ].map((inv) => (
                <div key={inv.type} className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
                  <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${
                    inv.priority === "High"
                      ? "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                      : "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
                  }`}>
                    {inv.priority}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-foreground">{inv.type}</div>
                    <div className="text-[11px] text-muted-foreground">{inv.why}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Key metrics to hit */}
          <div className="plaid-card">
            <h3 className="text-sm font-semibold text-foreground mb-3">Pre-Seed Benchmarks to Hit</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { metric: "Pilot customers / LOIs", target: "2-5", current: "0" },
                { metric: "Laws mapped to enforcement", target: "67+", current: "67" },
                { metric: "Advisory board members", target: "3-4", current: "1" },
                { metric: "Published content pieces", target: "10+", current: "0" },
                { metric: "Developer waitlist signups", target: "50-200", current: "0" },
                { metric: "Investor meetings taken", target: "40-60", current: "0" },
              ].map((b) => (
                <div key={b.metric} className="flex flex-col gap-1 py-2 border-b border-border/50">
                  <div className="text-[10px] text-muted-foreground">{b.metric}</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-semibold text-foreground tabular-nums">{b.current}</span>
                    <span className="text-[10px] text-muted-foreground">/ {b.target}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══ WARM INTROS TAB ══════════════════════════════════ */}
      {activeTab === "warm-intros" && <WarmIntrosTab />}

      {/* ═══ INVESTOR ACCESS TAB ═════════════════════════════ */}
      {activeTab === "investor-access" && (
        <div className="space-y-4">
          {/* Actions bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-semibold text-foreground">Approved Investors</h3>
              <span className="text-xs text-muted-foreground">
                {investorPhones.filter((p) => p.is_active).length} active
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border text-xs font-medium text-foreground hover:bg-muted/60 transition-colors"
              >
                <Copy className="w-3 h-3" />
                {copiedLink ? "Copied!" : "Copy Portal Link"}
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-brand-green text-[#0D1B2A] text-xs font-semibold hover:bg-brand-green/90 transition-colors"
              >
                <Plus className="w-3 h-3" />
                Add Investor
              </button>
            </div>
          </div>

          {/* Info card */}
          <div className="plaid-card border-l-2 border-l-brand-green !py-3">
            <p className="text-xs text-muted-foreground">
              Add an investor&apos;s phone number to grant portal access. Share the portal link with them — when they visit and enter their phone, they&apos;ll receive a verification code via SMS to sign in.
            </p>
          </div>

          {/* Table */}
          <div className="plaid-card p-0 overflow-hidden">
            {phonesLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : investorPhones.length === 0 ? (
              <div className="text-center py-12">
                <Smartphone className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No investors added yet</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Add an investor to send them an SMS invite</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2.5 px-4 text-muted-foreground font-medium">Name</th>
                      <th className="text-left py-2.5 px-4 text-muted-foreground font-medium">Company</th>
                      <th className="text-left py-2.5 px-4 text-muted-foreground font-medium">Phone</th>
                      <th className="text-left py-2.5 px-4 text-muted-foreground font-medium">Status</th>
                      <th className="text-left py-2.5 px-4 text-muted-foreground font-medium">Last Login</th>
                      <th className="text-right py-2.5 px-4 text-muted-foreground font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {investorPhones.map((p) => (
                      <tr key={p.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                        <td className="py-2.5 px-4 text-foreground font-medium">{p.name || "—"}</td>
                        <td className="py-2.5 px-4 text-muted-foreground">{p.company || "—"}</td>
                        <td className="py-2.5 px-4 text-muted-foreground font-mono">{formatPhoneDisplay(p.phone_e164)}</td>
                        <td className="py-2.5 px-4">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                            p.is_active
                              ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                              : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                          }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${p.is_active ? "bg-green-500" : "bg-red-500"}`} />
                            {p.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-muted-foreground">
                          {p.last_login ? new Date(p.last_login).toLocaleDateString() : "Never"}
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          {confirmDeactivate === p.phone_e164 ? (
                            <div className="inline-flex items-center gap-1">
                              <span className="text-[10px] text-muted-foreground mr-1">Revoke access?</span>
                              <button
                                onClick={() => handleToggleActive(p.phone_e164, true)}
                                className="text-[10px] font-medium px-2 py-1 rounded text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
                              >
                                Yes
                              </button>
                              <button
                                onClick={() => setConfirmDeactivate(null)}
                                className="text-[10px] font-medium px-2 py-1 rounded text-muted-foreground hover:bg-muted/60 transition-colors"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleToggleActive(p.phone_e164, p.is_active)}
                              className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded transition-colors ${
                                p.is_active
                                  ? "text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                                  : "text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20"
                              }`}
                            >
                              <Power className="w-3 h-3" />
                              {p.is_active ? "Deactivate" : "Activate"}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Add Investor Modal */}
          {showAddModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-md">
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                  <h3 className="text-sm font-semibold text-foreground">{addSuccess ? "Investor Added" : "Add Investor"}</h3>
                  <button onClick={() => { setShowAddModal(false); setAddError(""); setShowAddConfirm(false); setAddSuccess(false); setCopiedInviteLink(false) }} className="text-muted-foreground hover:text-foreground">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {addSuccess ? (
                  <>
                    <div className="p-5 space-y-4">
                      <div className="flex items-center gap-2 text-brand-green">
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="text-sm font-medium">
                          {addForm.name || "Investor"} has been approved for portal access.
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Send them the portal link below. When they visit and enter their phone number, they&apos;ll receive a verification code via SMS to sign in.
                      </p>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={`${typeof window !== "undefined" ? window.location.origin : "https://www.phosra.com"}/investors/portal`}
                          className="flex-1 px-3 py-2 rounded-lg border border-border bg-muted/50 text-foreground text-xs font-mono outline-none"
                        />
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/investors/portal`)
                            setCopiedInviteLink(true)
                            setTimeout(() => setCopiedInviteLink(false), 2000)
                          }}
                          className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-border text-xs font-medium text-foreground hover:bg-muted/60 transition-colors flex-shrink-0"
                        >
                          <Copy className="w-3 h-3" />
                          {copiedInviteLink ? "Copied!" : "Copy"}
                        </button>
                      </div>
                      {/* Quick-send via native Messages app */}
                      <a
                        href={`sms:+1${addForm.phone}&body=${encodeURIComponent(`You've been invited to the Phosra investor data room. View the pitch deck, financials, and SAFE here:\n\n${typeof window !== "undefined" ? window.location.origin : "https://www.phosra.com"}/investors/portal`)}`}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        Text Link to {addForm.name || formatPhoneDisplay(`+1${addForm.phone}`)}
                      </a>
                      <p className="text-[10px] text-muted-foreground text-center">
                        Opens Messages on your device with the portal link pre-filled
                      </p>
                    </div>
                    <div className="flex justify-end px-5 py-4 border-t border-border">
                      <button
                        onClick={() => { setShowAddModal(false); setAddForm({ phone: "", name: "", company: "", notes: "" }); setAddSuccess(false); setShowAddConfirm(false); setCopiedInviteLink(false) }}
                        className="px-4 py-2 rounded-md bg-brand-green text-[#0D1B2A] text-xs font-semibold hover:bg-brand-green/90 transition-colors"
                      >
                        Done
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-5 space-y-4">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">Phone Number *</label>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground font-mono flex-shrink-0">+1</span>
                          <input
                            type="tel"
                            inputMode="numeric"
                            placeholder="(555) 555-1234"
                            value={formatAsYouType(addForm.phone)}
                            onChange={(e) => {
                              const raw = e.target.value.replace(/\D/g, "").slice(0, 10)
                              setAddForm((f) => ({ ...f, phone: raw }))
                            }}
                            onKeyDown={(e) => { if (e.key === "Enter" && addForm.phone.length === 10) handleAddInvestor() }}
                            disabled={addLoading}
                            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm font-mono placeholder:text-muted-foreground/50 outline-none focus:border-brand-green"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">Name</label>
                        <input
                          type="text"
                          placeholder="Jane Smith"
                          value={addForm.name}
                          onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))}
                          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground/50 outline-none focus:border-brand-green"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">Company</label>
                        <input
                          type="text"
                          placeholder="Acme Ventures"
                          value={addForm.company}
                          onChange={(e) => setAddForm((f) => ({ ...f, company: e.target.value }))}
                          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground/50 outline-none focus:border-brand-green"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">Notes</label>
                        <input
                          type="text"
                          placeholder="Met at demo day, interested in Series A"
                          value={addForm.notes}
                          onChange={(e) => setAddForm((f) => ({ ...f, notes: e.target.value }))}
                          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground/50 outline-none focus:border-brand-green"
                        />
                      </div>
                      {addError && <p className="text-red-500 text-xs">{addError}</p>}
                    </div>
                    <div className="flex justify-end gap-2 px-5 py-4 border-t border-border">
                      <button
                        onClick={() => { setShowAddModal(false); setAddError(""); setShowAddConfirm(false) }}
                        className="px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddInvestor}
                        disabled={addLoading}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-brand-green text-[#0D1B2A] text-xs font-semibold hover:bg-brand-green/90 transition-colors disabled:opacity-50"
                      >
                        {addLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                        Add Investor
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══ INVESTOR RESEARCH MODAL (from Agent Workforce tab) ═══ */}
      <InvestorResearchModal
        open={showResearchModal}
        onClose={() => setShowResearchModal(false)}
      />

      {/* ═══ MILESTONE AGENT MODAL (from Timeline tab) ═══ */}
      {activeMilestoneModal && (
        <MilestoneAgentModal
          open={true}
          onClose={() => setActiveMilestoneModal(null)}
          milestone={{
            id: activeMilestoneModal.milestone.id,
            title: activeMilestoneModal.milestone.title,
            description: activeMilestoneModal.milestone.description,
            owner: activeMilestoneModal.milestone.owner,
            status: getMilestoneStatus(activeMilestoneModal.milestone),
            dueDate: activeMilestoneModal.milestone.dueDate,
            agentId: activeMilestoneModal.milestone.agentId!,
          }}
          agent={{
            id: activeMilestoneModal.agent.id,
            name: activeMilestoneModal.agent.name,
            role: activeMilestoneModal.agent.role,
            description: activeMilestoneModal.agent.description,
            tasks: activeMilestoneModal.agent.tasks,
            tools: activeMilestoneModal.agent.tools,
            cadence: activeMilestoneModal.agent.cadence,
            color: activeMilestoneModal.agent.color,
            bgColor: activeMilestoneModal.agent.bgColor,
          }}
          phase={{
            name: activeMilestoneModal.phase.name,
            dates: activeMilestoneModal.phase.dates,
          }}
        />
      )}
    </div>
  )
}
