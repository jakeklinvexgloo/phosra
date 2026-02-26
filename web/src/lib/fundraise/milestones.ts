/**
 * Shared fundraise milestone data.
 * Imported by both the fundraise command center and press plan generator.
 */

export type Phase = {
  id: string
  name: string
  dates: string
  color: string
  dotColor: string
  milestones: Milestone[]
}

export type Milestone = {
  id: string
  title: string
  description: string
  owner: "founder" | "agent" | "both"
  status: "done" | "active" | "upcoming"
  dueDate: string
  agentId?: string
}

export const RAISE_TARGET = 950_000
export const DEADLINE = new Date("2026-05-31")
export const START = new Date("2026-02-21")

export const PHASES: Phase[] = [
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
        id: "m31", title: "Post Show HN technical deep-dive on PCSS spec",
        description: "Show HN launch with blog post (/blog/pcss-v1: 'How We Normalized 67 Child Safety Laws into 45 API Rule Categories'), open PCSS spec on GitHub (github.com/jakeklinvexgloo/pcss-spec), and interactive compliance checker at /check. Technical angle — HN audiences value open specs + infrastructure depth",
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
        description: "The Child Safety Compliance Landscape: 78 Laws, 45 States, One Deadline. Law registry now live as structured JSON on GitHub (pcss-spec repo) + compliance checker at /check. Target: IAPP pickup + journalist citations",
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

/** IDs of milestones that are PR/comms related and should generate press releases */
export const PR_MILESTONE_IDS = [
  "m27", "m28", "m29", "m30", "m31", // Phase 1 PR milestones
  "m7", "m8", "m14", "m32", "m33", "m34", "m35", "m36", // Phase 2 content/PR
  "m17", "m37", "m38", // Phase 3 PR
  "m24", "m26", // Phase 4 PR
]

/** Get all milestones with their phase context */
export function getAllMilestones(): (Milestone & { phaseId: string; phaseName: string })[] {
  return PHASES.flatMap(p =>
    p.milestones.map(m => ({ ...m, phaseId: p.id, phaseName: p.name }))
  )
}

/** Get PR-related milestones only */
export function getPRMilestones(): (Milestone & { phaseId: string; phaseName: string })[] {
  return getAllMilestones().filter(m => PR_MILESTONE_IDS.includes(m.id))
}
