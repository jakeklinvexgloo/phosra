/**
 * Warm Intro Network Tracker
 * 100+ warm intro paths for Phosra's $950K pre-seed raise
 *
 * Generated: Feb 22, 2026
 * Target: Map 100+ warm intro paths by Mar 5, 2026
 * Context: Post-money SAFE, $6M cap, May 31 deadline
 *
 * Scoring (max 18 pts):
 *   Connection Strength: 1-5 (1st degree=5, strong 2nd=4, weak 2nd=2, 3rd+=1)
 *   Thesis Alignment:    1-5 (perfect=5, good=3, adjacent=1)
 *   Fund Signals:        0-3 (deploying=3, active=2, unknown=0)
 *   Check Size Fit:      0-2 (sweet spot $25-300K=2, outside=0)
 *   COPPA Interest:      0-3 (public stance=3, portfolio signal=2, none=0)
 *
 * Tiers: 15+ = Tier 1, 10-14 = Tier 2, 5-9 = Tier 3
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type InvestorCategory =
  | "regtech-vc"
  | "child-safety-vc"
  | "edtech-vc"
  | "solo-founder-fund"
  | "identity-vc"
  | "family-safety-vc"
  | "impact-fund"
  | "pre-seed-specialist"
  | "ts-leader"        // trust & safety leader
  | "ftc-alumni"
  | "nonprofit-leader"
  | "regtech-founder"
  | "angel-syndicate"
  | "hnw-angel"        // high net worth tech angel
  | "family-office"
  | "corporate-vc"
  | "impact-investor"
  | "celebrity-angel"
  | "policy-angel"
  | "parent-angel"
  | "fintech-angel"
  | "faith-family"

export type InvestorType = "vc" | "angel" | "syndicate" | "strategic" | "micro-fund" | "cvc" | "family-office" | "impact-fund"

export type IntroPathType =
  | "direct-1st-degree"
  | "2nd-degree-strong"
  | "2nd-degree-weak"
  | "3rd-degree"
  | "portfolio-founder"
  | "conference-event"
  | "industry-association"
  | "content-warmup"
  | "linkedin-group"
  | "alumni-network"
  | "podcast"
  | "accelerator-alumni"
  | "cold-application"  // for funds that accept cold apps
  | "attorney-intro"
  | "vc-scout"

export type PipelineStatus =
  | "identified"
  | "connector-contacted"
  | "intro-requested"
  | "intro-made"
  | "meeting-scheduled"
  | "meeting-complete"
  | "follow-up"
  | "term-sheet"
  | "committed"
  | "wired"
  | "passed"

export type PriorityTier = 1 | 2 | 3

export interface ContactInfo {
  linkedin?: string
  twitter?: string
  email?: string
  website?: string          // personal site or blog (fund website is separate)
}

export interface ApproachStrategy {
  recommended: string       // best single approach
  steps: string[]           // ordered action items
  openingAngle: string      // what to lead with
  timing?: string           // optimal timing considerations
}

export interface WarmIntroTarget {
  id: string
  name: string
  fundOrCompany: string
  role: string
  website?: string
  category: InvestorCategory
  type: InvestorType
  checkSizeRange: string
  stagePreference: string

  // Contact
  contact?: ContactInfo

  // Scoring
  thesisAlignment: "perfect" | "good" | "adjacent"
  thesisNote: string
  coppaInterest: "public-stance" | "portfolio-signal" | "none"
  fundSignal: "deploying" | "active" | "unknown"

  // Warm intro path
  introPaths: IntroPath[]
  tier: PriorityTier

  // How to reach them
  approachStrategy?: ApproachStrategy

  // Pipeline
  status: PipelineStatus
  notes: string

  // Comparables
  relevantPortfolio?: string[]
}

export interface IntroPath {
  type: IntroPathType
  connector?: string
  description: string
  strength: 1 | 2 | 3 | 4 | 5
}

export interface SuperConnector {
  id: string
  name: string
  type: string
  description: string
  reachableTargets: string[] // investor IDs they can connect to
  estimatedIntros: number
  website?: string
  contactNote?: string
}

// ─── Regtech & Child-Safety VCs (28 targets) ──────────────────────────────────

const REGTECH_VCS: WarmIntroTarget[] = [
  // Tier 1: Direct child safety investors
  {
    id: "konvoy",
    name: "Josh Chapman & Jason Chapman",
    fundOrCompany: "Konvoy Ventures",
    role: "General Partners",
    website: "konvoy.vc",
    category: "child-safety-vc",
    type: "vc",
    checkSizeRange: "$250K-$5M",
    stagePreference: "Pre-seed to Series A",
    contact: {
      linkedin: "https://www.linkedin.com/in/joshchapmanb/",
      twitter: "@joshchapmn",
    },
    thesisAlignment: "perfect",
    thesisNote: "$258M AUM gaming-focused. Invested in k-ID for child safety compliance. Strong thesis on safety infrastructure.",
    coppaInterest: "portfolio-signal",
    fundSignal: "deploying",
    introPaths: [
      { type: "portfolio-founder", description: "Intro via k-ID founder (Julian Corbett)", strength: 4 },
      { type: "industry-association", description: "Gaming industry events / GDC", strength: 2 },
    ],
    tier: 1,
    approachStrategy: {
      recommended: "Warm outreach via k-ID connection — Konvoy led k-ID's seed round",
      steps: [
        "Reference their blog post 'Why We Invested in k-ID' to show homework on their thesis",
        "Position Phosra as the compliance infrastructure layer that k-ID depends on",
        "Reach out to Josh Chapman via LinkedIn DM — he's the more public-facing partner",
        "Offer a 15-min demo showing MCP enforcement engine for gaming-specific regulations",
      ],
      openingAngle: "Your k-ID investment proved child safety compliance is a massive market. Phosra is the regulatory intelligence layer that powers companies like k-ID — we track 67+ child safety laws and auto-generate enforcement rules.",
    },
    status: "identified",
    notes: "Closest comp investor. k-ID raised $51M total. Right check size for our round.",
    relevantPortfolio: ["k-ID"],
  },
  {
    id: "okta-ventures",
    name: "Austin Kim",
    fundOrCompany: "Okta Ventures",
    role: "Investment Lead",
    website: "okta.com/okta-ventures",
    category: "child-safety-vc",
    type: "cvc",
    checkSizeRange: "$250K-$2M",
    stagePreference: "Seed to Series A",
    contact: {
      linkedin: "https://www.linkedin.com/in/austinarensberg/",
    },
    thesisAlignment: "perfect",
    thesisNote: "Invested in k-ID. Portfolio includes DataGrail (privacy), Drata (compliance). Identity-first thesis.",
    coppaInterest: "portfolio-signal",
    fundSignal: "deploying",
    introPaths: [
      { type: "portfolio-founder", description: "Intro via k-ID or DataGrail founders", strength: 3 },
      { type: "industry-association", description: "IAPP conferences, identity verification events", strength: 2 },
    ],
    tier: 1,
    approachStrategy: {
      recommended: "Identity-first pitch — Okta Ventures has a $50M fund for identity/security/privacy startups",
      steps: [
        "Apply through okta.com/okta-ventures formal process",
        "Frame Phosra as identity-adjacent: age verification, parental consent gates, identity-based compliance enforcement",
        "Reference their k-ID investment and position Phosra as complementary infrastructure",
        "Highlight the parental_consent_gate rule category as direct tie to Okta's identity-first thesis",
      ],
      openingAngle: "Okta Ventures backs identity infrastructure. Phosra is the compliance decision engine that tells platforms WHEN and HOW to enforce age verification and parental consent — the regulatory intelligence layer between identity providers and platform enforcement.",
    },
    status: "identified",
    notes: "Strategic CVC. Identity-first thesis perfectly aligned with age verification + consent.",
    relevantPortfolio: ["k-ID", "DataGrail", "Drata"],
  },
  {
    id: "anthemis",
    name: "Ruth Foxe Blader & Amy Nauiokas",
    fundOrCompany: "Anthemis Group",
    role: "Partners",
    website: "anthemis.com",
    category: "regtech-vc",
    type: "vc",
    checkSizeRange: "$500K-$10M",
    stagePreference: "Seed to Series B",
    contact: {
      linkedin: "https://www.linkedin.com/in/amynauiokas/",
    },
    thesisAlignment: "perfect",
    thesisNote: "World's largest early-stage fintech fund. 191 portfolio cos. Dedicated RegTech practice for digital compliance infra.",
    coppaInterest: "portfolio-signal",
    fundSignal: "active",
    introPaths: [
      { type: "industry-association", description: "Fintech/regtech conferences", strength: 2 },
      { type: "content-warmup", description: "Engage with regtech content on LinkedIn", strength: 1 },
    ],
    tier: 1,
    approachStrategy: {
      recommended: "Target Amy Nauiokas at Anthemis — Ruth Foxe Blader left in Jan 2024 to start Foxe Capital",
      steps: [
        "Target Amy Nauiokas as Anthemis CEO",
        "Frame Phosra within Anthemis' thesis of fintech regulatory compliance infrastructure",
        "Leverage the RegTech practice angle — Anthemis has explicit regtech focus",
        "Also consider parallel approach to Ruth Foxe Blader at Foxe Capital",
      ],
      openingAngle: "Anthemis has been the pioneer in fintech investing since 2008. Child data protection is becoming the next major compliance wave in financial services — every fintech serving minors needs Phosra's regulatory engine.",
    },
    status: "identified",
    notes: "Dedicated RegTech practice. B2B compliance infrastructure thesis is exact match.",
  },
  {
    id: "speedinvest",
    name: "Multiple Partners",
    fundOrCompany: "Speedinvest",
    role: "Fintech Team",
    website: "speedinvest.com",
    category: "regtech-vc",
    type: "vc",
    checkSizeRange: "$700K-$1.3M",
    stagePreference: "Pre-seed to Seed",
    contact: {
      linkedin: "https://www.linkedin.com/in/shikhantsova/",
    },
    thesisAlignment: "perfect",
    thesisNote: "Leading EU pre-seed/seed. 400+ portfolio cos. Invested in Alinia (AI compliance). Compliance-first approach.",
    coppaInterest: "portfolio-signal",
    fundSignal: "deploying",
    introPaths: [
      { type: "portfolio-founder", description: "Intro via Alinia founders", strength: 3 },
      { type: "cold-application", description: "Accepts applications on website", strength: 1 },
    ],
    tier: 1,
    approachStrategy: {
      recommended: "EU-first regulatory compliance pitch — target Olga Shikhantsova who led the Alinia AI investment",
      steps: [
        "Target Olga Shikhantsova, Fintech Partner — she led the Alinia AI investment showing direct regtech interest",
        "Position Phosra as the child-safety equivalent of Alinia — automated compliance for EU DSA, AADC, and national laws",
        "Emphasize EU regulatory leadership — GDPR, DSA, and multiple EU member state child safety laws",
        "Apply through Speedinvest's formal intake and reference Alinia portfolio overlap",
      ],
      openingAngle: "You backed Alinia for AI compliance guardrails. Phosra is the same thesis applied to child safety — automated regulatory enforcement across the EU's fragmented landscape of DSA, GDPR-K, and national child protection laws.",
    },
    status: "identified",
    notes: "Right check size, pre-seed focus, EU compliance thesis. Alinia investment validates space.",
    relevantPortfolio: ["Alinia"],
  },
  {
    id: "tribeca-vp",
    name: "Multiple Partners",
    fundOrCompany: "Tribeca Venture Partners",
    role: "Partners",
    website: "tribecavp.com",
    category: "child-safety-vc",
    type: "vc",
    checkSizeRange: "$500K-$5M",
    stagePreference: "Seed to Series A",
    contact: {
      linkedin: "https://www.linkedin.com/in/brianhirsch/",
      twitter: "@hirschb",
    },
    thesisAlignment: "perfect",
    thesisNote: "Co-led L1ght's $15M seed. NYC-based. Focus on AI/ML, education, security. Direct child safety track record.",
    coppaInterest: "portfolio-signal",
    fundSignal: "active",
    introPaths: [
      { type: "portfolio-founder", description: "Intro via L1ght founders", strength: 3 },
      { type: "industry-association", description: "NYC tech/VC events", strength: 2 },
    ],
    tier: 1,
    approachStrategy: {
      recommended: "NYC ecosystem play — Tribeca co-led L1ght's $15M seed. L1ght is now defunct, creating a portfolio gap.",
      steps: [
        "Reference their L1ght investment — they believed in AI child safety and L1ght is no longer active",
        "Position Phosra as next-gen approach: regulatory compliance infrastructure rather than content detection",
        "Reach out to Brian Hirsch via LinkedIn — co-founder and managing partner",
        "Offer to meet in NYC — Tribeca is deeply embedded in NY tech ecosystem",
      ],
      openingAngle: "You co-led L1ght's seed because you believed in protecting kids online. Phosra is the infrastructure play — instead of content detection, we're the regulatory compliance engine across 67+ child safety laws.",
    },
    status: "identified",
    notes: "Direct child safety investment history (L1ght). NYC-based, right check size.",
    relevantPortfolio: ["L1ght"],
  },
  {
    id: "mangrove",
    name: "Mark Tluszcz",
    fundOrCompany: "Mangrove Capital Partners",
    role: "Managing Partner",
    website: "mangrove.vc",
    category: "child-safety-vc",
    type: "vc",
    checkSizeRange: "$1M-$10M",
    stagePreference: "Seed to Series A",
    contact: {
      linkedin: "https://lu.linkedin.com/in/mark-tluszcz-a024b51",
      twitter: "@marktluszcz",
    },
    thesisAlignment: "perfect",
    thesisNote: "Co-led $15M seed in L1ght (AI child protection). Luxembourg-based. Strong European network.",
    coppaInterest: "portfolio-signal",
    fundSignal: "active",
    introPaths: [
      { type: "portfolio-founder", description: "Intro via L1ght team", strength: 3 },
    ],
    tier: 1,
    approachStrategy: {
      recommended: "Bold, founder-to-founder approach — Mark values contrarian conviction. He co-led L1ght's seed.",
      steps: [
        "Lead with the L1ght connection — child safety is a validated thesis for them",
        "Appeal to Mark's contrarian style — lead with mission and market timing",
        "Reach out via Twitter DM or LinkedIn — he's relatively accessible",
        "Emphasize the global regulatory wave — as Luxembourg-based, Mangrove understands EU dynamics",
      ],
      openingAngle: "You co-led L1ght's seed because you saw the child safety wave coming. The regulatory side has now arrived — 67+ laws globally. Phosra is the compliance infrastructure that makes enforcement possible.",
    },
    status: "identified",
    notes: "Direct child safety investment. European network for DSA/GDPR-K angle.",
    relevantPortfolio: ["L1ght"],
  },
  {
    id: "two-sigma",
    name: "Daniel Abelon",
    fundOrCompany: "Two Sigma Ventures",
    role: "Partner",
    website: "twosigmaventures.com",
    category: "family-safety-vc",
    type: "vc",
    checkSizeRange: "$1M-$10M",
    stagePreference: "Seed to Series A",
    contact: {
      linkedin: "https://www.linkedin.com/in/danabelon/",
      twitter: "@dabelon",
    },
    thesisAlignment: "good",
    thesisNote: "Invested in Bark Technologies ($9M Series A). ML-powered safety thesis. Quantitative approach.",
    coppaInterest: "portfolio-signal",
    fundSignal: "active",
    introPaths: [
      { type: "portfolio-founder", description: "Intro via Bark founders", strength: 3 },
    ],
    tier: 2,
    approachStrategy: {
      recommended: "Data-driven compliance pitch — Two Sigma Ventures invested in Bark Technologies' $9M Series A",
      steps: [
        "Reference their Bark investment — Dan wrote about why Two Sigma invested in Bark",
        "Frame Phosra as data infrastructure: real-time legislative monitoring, automated rule generation",
        "Emphasize the ML/data pipeline — legislation scanning, rule mapping are data problems",
        "Reach out via LinkedIn with concise, data-focused pitch",
      ],
      openingAngle: "You invested in Bark because data-driven approaches to child safety work. Phosra applies the same data-first philosophy to compliance — we ingest legislation from 200+ jurisdictions, classify into 45 rule categories, and auto-generate enforcement rules.",
    },
    status: "identified",
    notes: "Bark investor. Understands family safety market. Check size may be large for pre-seed.",
    relevantPortfolio: ["Bark Technologies"],
  },
  {
    id: "mosaic",
    name: "Toby Coppel & Simon Levene",
    fundOrCompany: "Mosaic Ventures",
    role: "General Partners",
    website: "mosaicventures.com",
    category: "identity-vc",
    type: "vc",
    checkSizeRange: "$1M-$10M",
    stagePreference: "Seed to Series A",
    contact: {
      linkedin: "https://uk.linkedin.com/in/tcoppel",
      twitter: "@tcoppel",
    },
    thesisAlignment: "good",
    thesisNote: "Led Veriff's $7.7M Series A. European early-stage. 5 unicorns. Identity verification thesis.",
    coppaInterest: "portfolio-signal",
    fundSignal: "active",
    introPaths: [
      { type: "portfolio-founder", description: "Intro via Veriff team", strength: 3 },
    ],
    tier: 2,
    approachStrategy: {
      recommended: "Identity verification thesis — Mosaic led Veriff's Series A. Simon Levene joined Veriff's board.",
      steps: [
        "Target Simon Levene — he led the Veriff investment and sits on their board",
        "Position Phosra as the regulatory decision layer upstream of identity verification",
        "Frame as London/EU-focused — Mosaic is London-based with deep European network",
        "Reach out via LinkedIn to Simon, or Twitter to Toby for informal first touch",
      ],
      openingAngle: "You led Veriff's Series A because identity verification is critical infrastructure. Phosra is the regulatory intelligence layer that tells platforms when and how to trigger verification — the compliance brain upstream of Veriff.",
    },
    status: "identified",
    notes: "Veriff investor. Identity/verification thesis is adjacent.",
    relevantPortfolio: ["Veriff"],
  },
  {
    id: "kapor",
    name: "Mitch & Freada Kapor Klein",
    fundOrCompany: "Kapor Capital",
    role: "Partners",
    website: "kaporcapital.com",
    category: "impact-fund",
    type: "vc",
    checkSizeRange: "$250K-$2M",
    stagePreference: "Pre-seed to Seed",
    contact: {
      linkedin: "https://www.linkedin.com/in/mitchkapor/",
      twitter: "@mkapor",
    },
    thesisAlignment: "good",
    thesisNote: "Impact-focused, top-quartile returns. 170+ portfolio cos. Justice & equity thesis. Child protection fits.",
    coppaInterest: "none",
    fundSignal: "active",
    introPaths: [
      { type: "cold-application", description: "Apply on website", strength: 1 },
      { type: "content-warmup", description: "Impact/child safety angle on LinkedIn", strength: 2 },
    ],
    tier: 2,
    approachStrategy: {
      recommended: "Impact-first, gap-closing thesis — Kapor invests in startups closing gaps of access for underserved communities",
      steps: [
        "Frame through their 'closing gaps' lens — children from low-income communities are disproportionately affected",
        "Target Freada Kapor Klein — deeply focused on equity in tech",
        "Emphasize that compliance burden falls hardest on smaller platforms, creating an equity gap",
        "Apply through kaporcapital.com and reference the social impact angle",
      ],
      openingAngle: "Child safety compliance shouldn't be a privilege of Big Tech. Phosra democratizes access to regulatory intelligence so every platform — not just those with million-dollar legal teams — can protect kids.",
    },
    status: "identified",
    notes: "Right check size, impact mission alignment. 59% diverse founders.",
  },
  {
    id: "signal-peak",
    name: "Scott Petty & Ron Heinz",
    fundOrCompany: "Signal Peak Ventures",
    role: "Partners",
    website: "signalpeakventures.com",
    category: "family-safety-vc",
    type: "vc",
    checkSizeRange: "$1M-$10M",
    stagePreference: "Seed to Series A",
    contact: {
      linkedin: "https://www.linkedin.com/in/scott-petty-54261a/",
    },
    thesisAlignment: "good",
    thesisNote: "Led Bark's $9M Series A. $550M committed capital. Family safety thesis.",
    coppaInterest: "portfolio-signal",
    fundSignal: "active",
    introPaths: [
      { type: "portfolio-founder", description: "Intro via Bark team", strength: 3 },
    ],
    tier: 2,
    approachStrategy: {
      recommended: "Direct Bark connection — Signal Peak led Bark's $9M Series A",
      steps: [
        "Reference their Bark Series A lead — strongest child safety conviction signal",
        "Position Phosra as complementary: Bark monitors children, Phosra ensures platforms comply legally",
        "Target Scott Petty — co-founder, most active partner, based in Salt Lake City",
        "Offer to connect with their Bark portfolio company to demonstrate synergy",
      ],
      openingAngle: "You led Bark's Series A because you believe in keeping kids safer online. Phosra is the compliance layer ensuring platforms implement those protections legally — tracking 67+ child safety laws.",
    },
    status: "identified",
    notes: "Bark lead investor. Family safety thesis validated.",
    relevantPortfolio: ["Bark Technologies"],
  },
  {
    id: "kibo",
    name: "Aquilino Pena & Javier Torremocha",
    fundOrCompany: "Kibo Ventures",
    role: "Partners",
    website: "kiboventures.com",
    category: "family-safety-vc",
    type: "vc",
    checkSizeRange: "$500K-$5M",
    stagePreference: "Seed to Series A",
    contact: {
      linkedin: "https://es.linkedin.com/in/aquilinopena",
      twitter: "@Aquilino",
    },
    thesisAlignment: "good",
    thesisNote: "Invested in Qustodio (parental controls). Spanish early-stage VC. 79 companies, 4 unicorns.",
    coppaInterest: "portfolio-signal",
    fundSignal: "active",
    introPaths: [
      { type: "portfolio-founder", description: "Intro via Qustodio founders", strength: 3 },
    ],
    tier: 2,
    approachStrategy: {
      recommended: "Qustodio connection — Kibo invested in Qustodio, proving child-safety thesis alignment",
      steps: [
        "Lead with the Qustodio portfolio overlap — they believe in child safety tech",
        "Position Phosra as B2B infrastructure complementing B2C tools like Qustodio",
        "Emphasize EU/Spanish regulatory complexity",
        "Reach out to Aquilino via Twitter or LinkedIn — more externally active partner",
      ],
      openingAngle: "Your Qustodio investment shows you understand child safety tech. Phosra is the B2B infrastructure play — the compliance engine across 67+ laws, including Spain's digital protection framework.",
    },
    status: "identified",
    notes: "Qustodio investor. European regulatory tech exposure.",
    relevantPortfolio: ["Qustodio"],
  },
  {
    id: "omidyar",
    name: "Mike Kubzansky",
    fundOrCompany: "Omidyar Network",
    role: "CEO",
    website: "omidyarnetwork.org",
    category: "impact-fund",
    type: "vc",
    checkSizeRange: "$500K-$10M",
    stagePreference: "Seed to Growth",
    contact: {
      linkedin: "https://www.linkedin.com/in/michael-kubzansky-4917154/",
      twitter: "@MikeKubzansky",
    },
    thesisAlignment: "good",
    thesisNote: "367 portfolio cos. Publicly praised KOSA. Active thesis on responsible tech & child digital wellbeing.",
    coppaInterest: "public-stance",
    fundSignal: "active",
    introPaths: [
      { type: "industry-association", description: "Responsible tech / digital wellbeing communities", strength: 2 },
    ],
    tier: 2,
    approachStrategy: {
      recommended: "Responsible tech + KOSA alignment — Omidyar was part of PassKOSA.org coalition",
      steps: [
        "Reference their KOSA advocacy — Omidyar was part of the PassKOSA coalition and funded polling",
        "Frame Phosra as the implementation layer for the legislation Omidyar advocates for",
        "Emphasize the responsible tech framing",
        "Reach out formally through Omidyar's responsible tech portfolio team",
      ],
      openingAngle: "Omidyar Network championed KOSA because kids deserve better online protection. Phosra is how platforms actually comply — we're the regulatory intelligence engine that translates 67+ child safety laws into enforceable rules.",
    },
    status: "identified",
    notes: "Publicly supportive of child safety legislation. Impact thesis alignment.",
  },
  {
    id: "hoxton",
    name: "Rob Sherwood & Hussein Kanji",
    fundOrCompany: "Hoxton Ventures",
    role: "Partners",
    website: "hoxtonventures.com",
    category: "child-safety-vc",
    type: "vc",
    checkSizeRange: "$500K-$5M",
    stagePreference: "Seed to Series A",
    contact: {
      linkedin: "https://uk.linkedin.com/in/hkanji",
      twitter: "@hkanji",
    },
    thesisAlignment: "good",
    thesisNote: "Invested in SuperAwesome. European early-stage focus. 89 portfolio cos including Deliveroo.",
    coppaInterest: "portfolio-signal",
    fundSignal: "active",
    introPaths: [
      { type: "portfolio-founder", description: "Via SuperAwesome/Epic Games contacts", strength: 2 },
    ],
    tier: 2,
    approachStrategy: {
      recommended: "SuperAwesome success story — Hoxton invested in SuperAwesome, acquired by Epic Games",
      steps: [
        "Lead with SuperAwesome — Hoxton backed it early and saw Epic Games acquisition",
        "Note Dylan Collins (SuperAwesome CEO) is a Hoxton Venture Partner — direct warm intro path",
        "Position Phosra as next evolution: beyond kid-safe ads to entire regulatory compliance stack",
        "Target Hussein Kanji via Twitter — active and accessible, Forbes Midas List Europe",
      ],
      openingAngle: "Your SuperAwesome investment proved kid-tech exits are real. Phosra is the next chapter: instead of just kid-safe ads, we're the compliance infrastructure for ALL child safety regulations across 67+ laws.",
    },
    status: "identified",
    notes: "SuperAwesome investor (acquired by Epic for kidtech).",
    relevantPortfolio: ["SuperAwesome"],
  },
  {
    id: "mouro",
    name: "Manuel Silva Martinez",
    fundOrCompany: "Mouro Capital",
    role: "Managing Partner",
    website: "mourocapital.com",
    category: "regtech-vc",
    type: "vc",
    checkSizeRange: "$1M-$10M",
    stagePreference: "Seed to Growth",
    contact: {
      linkedin: "https://uk.linkedin.com/in/msilvamartinez",
      twitter: "@_silvaman",
    },
    thesisAlignment: "good",
    thesisNote: "$400M AUM backed by Santander. Fintech-focused. Portfolio includes Skyflow (data protection). API-first thesis.",
    coppaInterest: "portfolio-signal",
    fundSignal: "active",
    introPaths: [
      { type: "content-warmup", description: "API/compliance content engagement", strength: 1 },
    ],
    tier: 2,
    approachStrategy: {
      recommended: "Fintech compliance angle — Mouro led Alinia AI's $7.5M seed for AI compliance guardrails",
      steps: [
        "Reference the Alinia AI investment — Manuel led this round for AI compliance",
        "Frame Phosra as child-safety-specific compliance engine — same thesis as Alinia",
        "Leverage the Santander connection — banks serving families need child data protection",
        "Reach out via Twitter for informal first touch, then LinkedIn",
      ],
      openingAngle: "You led Alinia's seed because AI compliance infrastructure is critical. Phosra applies the same thesis to child safety — the fastest-growing regulatory domain with 67+ laws globally.",
    },
    status: "identified",
    notes: "API-first thesis is good match. Santander backing adds enterprise credibility.",
  },
  {
    id: "costanoa",
    name: "Greg Sands & Amy Cheetham",
    fundOrCompany: "Costanoa Ventures",
    role: "Partners",
    website: "costanoa.vc",
    category: "pre-seed-specialist",
    type: "vc",
    checkSizeRange: "$1M-$5M",
    stagePreference: "Seed to Series A",
    contact: {
      linkedin: "https://www.linkedin.com/in/gregsands/",
      twitter: "@gsands",
    },
    thesisAlignment: "good",
    thesisNote: "Applied AI, data infra, fintech, cyber. Portfolio includes Passbase (identity verification, AML, KYC).",
    coppaInterest: "portfolio-signal",
    fundSignal: "active",
    introPaths: [
      { type: "portfolio-founder", description: "Intro via Passbase team", strength: 2 },
    ],
    tier: 2,
    approachStrategy: {
      recommended: "Identity verification thesis — Costanoa led Passbase's Series A for identity verification/KYC",
      steps: [
        "Target Amy Cheetham — she leads fintech practice with compliance-adjacent expertise",
        "Reference Passbase investment — identity verification for crypto maps to age verification",
        "Frame Phosra as regulatory intelligence determining WHEN verification must happen",
        "Reach out via LinkedIn to Amy, or Twitter to Greg",
      ],
      openingAngle: "You led Passbase's Series A because identity verification infrastructure is essential. Age verification for child safety is the next wave — Phosra is the regulatory engine that tells platforms when and how to verify.",
    },
    status: "identified",
    notes: "Identity verification portfolio signal. AI + compliance thesis.",
    relevantPortfolio: ["Passbase"],
  },
  {
    id: "amplify",
    name: "Multiple Partners",
    fundOrCompany: "Amplify Partners",
    role: "Partners",
    website: "amplifypartners.com",
    category: "pre-seed-specialist",
    type: "vc",
    checkSizeRange: "$500K-$3M",
    stagePreference: "Pre-seed to Seed",
    contact: {
      linkedin: "https://www.linkedin.com/in/sunildhaliwal/",
      twitter: "@dhaliwas",
    },
    thesisAlignment: "good",
    thesisNote: "$150M fund focused on AI/ML, SaaS, cybersecurity. Pre-seed and seed specialist. Developer tools thesis.",
    coppaInterest: "none",
    fundSignal: "active",
    introPaths: [
      { type: "content-warmup", description: "Developer tools / API content", strength: 1 },
    ],
    tier: 3,
    approachStrategy: {
      recommended: "Technical infrastructure pitch — Amplify backs technical founders building developer infra",
      steps: [
        "Lead with technical architecture — MCP enforcement snippets, automated legislation scanning are deeply technical",
        "Position as 'Datadog for child safety compliance' — developer-first infrastructure",
        "Emphasize the AI/ML pipeline — legislation scanning via Claude API, automated rule generation",
        "Reach out to Sunil via Twitter — former Battery Ventures GP who appreciates technical depth",
      ],
      openingAngle: "Amplify backs technical founders building infrastructure. Phosra is developer-first compliance infrastructure — we auto-scan legislation, classify into 45 rule categories, and generate MCP enforcement snippets.",
    },
    status: "identified",
    notes: "Developer tools thesis matches 'Plaid for child safety.' Right stage and check size.",
  },
  {
    id: "flybridge",
    name: "Jesse Middleton & Chip Hazard",
    fundOrCompany: "Flybridge Capital",
    role: "Partners",
    website: "flybridge.com",
    category: "pre-seed-specialist",
    type: "vc",
    checkSizeRange: "$500K-$3M",
    stagePreference: "Pre-seed to Seed",
    contact: {
      linkedin: "https://www.linkedin.com/in/jmiddleton/",
      twitter: "@srcasm",
    },
    thesisAlignment: "good",
    thesisNote: "$1B+ AUM. AI Native Vertical SaaS thesis. Developer platforms. East Coast network.",
    coppaInterest: "none",
    fundSignal: "active",
    introPaths: [
      { type: "content-warmup", description: "Vertical SaaS / compliance content", strength: 1 },
    ],
    tier: 3,
    approachStrategy: {
      recommended: "AI-native vertical SaaS pitch — Flybridge's thesis is 'AI Native Vertical SaaS', exactly what Phosra is",
      steps: [
        "Target Jesse Middleton — focused on AI-native vertical SaaS applications",
        "Frame as full-stack AI-native: legislation scanning via Claude API, automated rule classification, MCP generation",
        "Emphasize the vertical SaaS angle — child safety compliance is massive and underserved",
        "Reach out via Twitter or LinkedIn — Jesse is NYC-based and accessible",
      ],
      openingAngle: "Flybridge is backing AI-native vertical SaaS. Phosra is exactly that — we use AI to scan legislation, classify rules into 45 categories, and auto-generate enforcement code. The compliance vertical, AI-native from day one.",
    },
    status: "identified",
    notes: "AI native vertical SaaS thesis. Child safety compliance is a vertical SaaS play.",
  },
  {
    id: "unicef-vf",
    name: "UNICEF Venture Fund",
    fundOrCompany: "UNICEF Innovation",
    role: "Venture Fund",
    website: "unicef.org/innovation",
    category: "impact-fund",
    type: "vc",
    checkSizeRange: "Up to $100K",
    stagePreference: "Seed (equity-free)",
    contact: {
      website: "https://www.unicefventurefund.org/apply-funding",
    },
    thesisAlignment: "perfect",
    thesisNote: "Makes equity-free investments in child online safety tech. Dedicated Child Online Safety cohort.",
    coppaInterest: "public-stance",
    fundSignal: "deploying",
    introPaths: [
      { type: "cold-application", description: "Apply directly to UNICEF Venture Fund", strength: 2 },
    ],
    tier: 2,
    approachStrategy: {
      recommended: "Equity-free funding via open call — $50K-$100K seed. Must be in UNICEF programme country and willing to open-source.",
      steps: [
        "Review eligibility — must be registered in UNICEF programme country and willing to open-source",
        "If eligible, apply through unicefventurefund.org/apply-funding",
        "Frame Phosra's child safety legislation database as a global public good",
        "If not eligible (US-registered), explore partnership or use as strategic validation",
      ],
      openingAngle: "Phosra's regulatory intelligence engine protects children across 200+ jurisdictions. Our legislation database could be a global public good — open-sourcing the law registry serves UNICEF's mission of universal child protection.",
    },
    status: "identified",
    notes: "Equity-free! Small check but massive signal value. Direct child safety mandate.",
  },
]

// ─── EdTech-Adjacent Funds (10 targets) ───────────────────────────────────────

const EDTECH_FUNDS: WarmIntroTarget[] = [
  {
    id: "reach-capital",
    name: "Jennifer Carolan & Wayee Chu",
    fundOrCompany: "Reach Capital",
    role: "Partners",
    website: "reachcapital.com",
    category: "edtech-vc",
    type: "vc",
    checkSizeRange: "$500K-$5M",
    stagePreference: "Pre-seed to Series A",
    contact: {
      linkedin: "https://www.linkedin.com/in/jcarolan/",
      twitter: "@jencarolan",
    },
    thesisAlignment: "good",
    thesisNote: "Leading edtech investor. Portfolio includes Outschool, Seesaw, ClassTag — all COPPA-subject platforms. They understand the pain.",
    coppaInterest: "portfolio-signal",
    fundSignal: "deploying",
    introPaths: [
      { type: "portfolio-founder", description: "Intro via Outschool or Seesaw founders", strength: 3 },
      { type: "conference-event", description: "ASU+GSV Summit (Apr 2026)", strength: 2 },
    ],
    tier: 1,
    approachStrategy: {
      recommended: "Submit pitch through reachcapital.com/apply/ — their portfolio companies are COPPA-subject",
      steps: [
        "Submit pitch via reachcapital.com/apply/ — host deck on DocSend without password",
        "Engage Wayee Chu on Twitter (@wayeechu) — more active on social",
        "Follow up with Jennifer Carolan on LinkedIn referencing her teaching background",
        "Reference portfolio alignment: Outschool, Seesaw both need COPPA/KOSA compliance",
      ],
      openingAngle: "Reach Capital's portfolio companies (Outschool, Seesaw) serve kids and need COPPA 2.0, KOSA compliance. Phosra is the compliance layer their portfolio needs.",
    },
    status: "identified",
    notes: "Portfolio companies are literally COPPA-subject. 'Your portfolio companies need us' pitch angle.",
    relevantPortfolio: ["Outschool", "Seesaw", "ClassTag"],
  },
  {
    id: "magnify",
    name: "Rachel Carpenter",
    fundOrCompany: "Magnify Ventures",
    role: "Managing Partner",
    website: "magnify.vc",
    category: "edtech-vc",
    type: "vc",
    checkSizeRange: "$500K-$3M",
    stagePreference: "Seed to Series A",
    contact: {
      linkedin: "https://www.linkedin.com/in/juliewroblewski/",
      twitter: "@julie_wrob",
      email: "Julie@Magnify.vc",
    },
    thesisAlignment: "perfect",
    thesisNote: "Transform how families live, work, care. Family tech focus. Backed by Pivotal Ventures (Melinda French Gates). Child safety IS their concern.",
    coppaInterest: "public-stance",
    fundSignal: "deploying",
    introPaths: [
      { type: "cold-application", description: "Apply via website", strength: 1 },
      { type: "content-warmup", description: "Family tech / child safety content engagement", strength: 2 },
    ],
    tier: 1,
    approachStrategy: {
      recommended: "Email Julie Wroblewski directly — frame as care economy / family safety tech",
      steps: [
        "Email Julie@Magnify.vc framing Phosra as care economy infrastructure — protecting families online",
        "Engage Julie on Twitter (@julie_wrob) — actively building network",
        "Reference Pivotal Ventures / Melinda French Gates connection — child online safety is a flagship issue",
        "Emphasize parental consent, notification, and screen time features mapping to Magnify's thesis",
      ],
      openingAngle: "Phosra is care economy infrastructure for digital parenting — giving platforms tools to protect children and empower parents, aligned with Magnify's family life thesis and Melinda French Gates' child safety advocacy.",
    },
    status: "identified",
    notes: "Family tech thesis is most direct fit. Melinda French Gates backing adds signal.",
  },
  {
    id: "emerge",
    name: "Jan Gagin & Sam Adventures",
    fundOrCompany: "Emerge Education",
    role: "Partners",
    website: "emerge.education",
    category: "edtech-vc",
    type: "vc",
    checkSizeRange: "$314K-$1.9M",
    stagePreference: "Pre-seed to Seed",
    contact: {
      linkedin: "https://www.linkedin.com/in/janlynnmatern/",
      twitter: "@janmatern",
    },
    thesisAlignment: "good",
    thesisNote: "UK edtech accelerator. AI-first lens. Portfolio serves young learners needing compliance.",
    coppaInterest: "none",
    fundSignal: "deploying",
    introPaths: [
      { type: "cold-application", description: "Accelerator application", strength: 2 },
    ],
    tier: 2,
    approachStrategy: {
      recommended: "Cold outreach via LinkedIn/Twitter — reference Emerge's 100+ Venture Partner network",
      steps: [
        "DM Jan Lynn-Matern on LinkedIn about AI-powered compliance for edtech platforms",
        "Engage on Twitter (@janmatern) with regulatory intelligence insights",
        "Reference that Emerge's portfolio faces child safety compliance across EU and US",
        "Propose meeting at Emerge's Edspace HQ in London",
      ],
      openingAngle: "Every edtech platform in Emerge's portfolio faces child safety regulation (EU DSA, UK Online Safety Act, KOSA). Phosra is the API-first compliance layer protecting platforms before regulators come knocking.",
    },
    status: "identified",
    notes: "Right check size. AI-first requirement matches MCP approach. UK/EU regulatory angle.",
  },
  {
    id: "brighteye",
    name: "Alex Spiro & Benoit Wirz",
    fundOrCompany: "Brighteye Ventures",
    role: "Partners",
    website: "brighteye.vc",
    category: "edtech-vc",
    type: "vc",
    checkSizeRange: "EUR 200K-500K",
    stagePreference: "Pre-seed to Seed",
    contact: {
      linkedin: "https://uk.linkedin.com/in/alex-spiro-latsis-5b701aa4",
    },
    thesisAlignment: "good",
    thesisNote: "Europe's first edtech-only VC. EU focus means DSA/GDPR-K compliance is core to portfolio needs.",
    coppaInterest: "none",
    fundSignal: "active",
    introPaths: [
      { type: "cold-application", description: "Direct application on website", strength: 1 },
    ],
    tier: 2,
    approachStrategy: {
      recommended: "Submit pitch via brighteyevc.com — build relationship with Benoit Wirz on Twitter (@bthewirz)",
      steps: [
        "Submit pitch through brighteyevc.com — invests at pre-seed/seed/Series A",
        "Engage Benoit Wirz on Twitter (@bthewirz) — active and shares edtech insights",
        "Reference Alex's children's content background — child safety resonates personally",
        "Frame as product-led compliance platform for EU edtech portfolio",
      ],
      openingAngle: "Europe's child safety regulatory environment is intensifying (EU DSA, UK Online Safety Act, AADC). Brighteye's portfolio needs a compliance partner built for edtech — Phosra's MCP enforcement engine automates what otherwise requires dedicated legal teams.",
    },
    status: "identified",
    notes: "EU edtech + compliance angle. Pre-seed pool is right-sized.",
  },
  {
    id: "rethink-ed",
    name: "Matt Greenfield",
    fundOrCompany: "Rethink Education",
    role: "Managing Partner",
    website: "rethinkeducation.com",
    category: "edtech-vc",
    type: "vc",
    checkSizeRange: "$500K-$5M",
    stagePreference: "Seed to Growth",
    contact: {
      linkedin: "https://www.linkedin.com/in/matt-greenfield-07b96815/",
      twitter: "@mattgreenfield",
      email: "mgreenfield@rteducation.com",
    },
    thesisAlignment: "good",
    thesisNote: "TIME Top VC 2025. 25+ years edtech. Co-founded Rethink First ($100M ARR, neurodivergent learners). Deep child-serving portfolio.",
    coppaInterest: "portfolio-signal",
    fundSignal: "active",
    introPaths: [
      { type: "content-warmup", description: "EdTech / child-serving platform content", strength: 2 },
    ],
    tier: 2,
    approachStrategy: {
      recommended: "Email Matt directly — he invests in founders solving 'actual human suffering' for underserved populations",
      steps: [
        "Email mgreenfield@rteducation.com framing child safety as protecting vulnerable children online",
        "Reference his co-founding of Rethink First (SaaS for children with special needs)",
        "Engage on LinkedIn where he is more active",
        "Reference portfolio companies (NoRedInk, Ignite Reading) that serve K-12 and need COPPA/KOSA compliance",
      ],
      openingAngle: "The children most harmed by unsafe platforms are the same underserved populations Rethink champions. Phosra gives every platform the compliance tooling to actually protect them, not just check a legal box.",
    },
    status: "identified",
    notes: "Deep domain expertise in child-serving tech. Portfolio serves vulnerable populations.",
  },
]

// ─── Solo-Founder-Friendly Funds (7 targets) ─────────────────────────────────

const SOLO_FOUNDER_FUNDS: WarmIntroTarget[] = [
  {
    id: "precursor",
    name: "Charles Hudson",
    fundOrCompany: "Precursor Ventures",
    role: "Managing Partner",
    website: "precursorvc.com",
    category: "solo-founder-fund",
    type: "vc",
    checkSizeRange: "$250K-$500K",
    stagePreference: "Pre-seed",
    contact: {
      linkedin: "https://www.linkedin.com/in/chudson/",
      twitter: "@chudson",
    },
    thesisAlignment: "good",
    thesisNote: "70% founder / 30% market weighting. Backs 30-40 pre-launch founders/year. Invested in Alinia (AI compliance). Serial founder with 3 exits = ideal candidate.",
    coppaInterest: "portfolio-signal",
    fundSignal: "deploying",
    introPaths: [
      { type: "cold-application", description: "Reads every cold submission on website", strength: 3 },
      { type: "portfolio-founder", description: "Intro via Alinia founders", strength: 4 },
    ],
    tier: 1,
    approachStrategy: {
      recommended: "Cold email pitch — Charles famously reads every submission. Keep it concise and data-driven.",
      steps: [
        "Submit cold pitch via precursorvc.com — Charles reads every submission personally",
        "Keep email ultra-concise: solo founder + regulatory compliance API + market catalyst + early traction",
        "Engage on Twitter (@chudson) — active and responsive to founders in regulated spaces",
        "Reference his Alinia investment — he already has thesis conviction in this space",
      ],
      openingAngle: "You invested in Alinia because you saw the child safety compliance wave coming. Phosra is the API-first enforcement layer that platforms need to implement these 67+ laws — and I've mapped every one to machine-enforceable rules.",
    },
    status: "identified",
    notes: "TOP PRIORITY. Reads every cold sub. Solo-founder friendly. Compliance portfolio (Alinia). 3 exits = high founder score.",
    relevantPortfolio: ["Alinia"],
  },
  {
    id: "hustle-fund",
    name: "Elizabeth Yin & Eric Bahn",
    fundOrCompany: "Hustle Fund",
    role: "General Partners",
    website: "hustlefund.vc",
    category: "solo-founder-fund",
    type: "micro-fund",
    checkSizeRange: "$25K-$150K",
    stagePreference: "Pre-seed",
    contact: {
      linkedin: "https://www.linkedin.com/in/elizabethyin/",
      twitter: "@dunkhippo33",
    },
    thesisAlignment: "good",
    thesisNote: "Explicitly backs solo founders. Execution > pedigree. B2B/SaaS focus. Reviews 1,000+ decks/month.",
    coppaInterest: "none",
    fundSignal: "deploying",
    introPaths: [
      { type: "cold-application", description: "Cold applications welcome on website", strength: 3 },
    ],
    tier: 1,
    approachStrategy: {
      recommended: "Apply through hustlefund.vc — they make decisions in 48 hours. Show 'hustle' metrics.",
      steps: [
        "Apply through hustlefund.vc emphasizing execution velocity and week-over-week progress",
        "Engage Elizabeth on Twitter (@dunkhippo33) — very responsive to founders who show hustle",
        "Emphasize solo founder execution: mapping 67+ laws, building MCP engine, shipping product alone = hustle",
        "Reference that Hustle Fund explicitly backs solo founders with $25K-$150K and 48-hour decisions",
      ],
      openingAngle: "Solo founder, shipped an API-first compliance platform covering 67+ child safety laws with MCP enforcement engine. Every platform serving kids will need this.",
    },
    status: "identified",
    notes: "Small check but fast decision + valuable signal. No warm intro needed. Apply immediately.",
  },
  {
    id: "saastr-fund",
    name: "Jason Lemkin",
    fundOrCompany: "SaaStr Fund",
    role: "Managing Partner",
    website: "saastrfund.com",
    category: "solo-founder-fund",
    type: "vc",
    checkSizeRange: "$500K-$5M",
    stagePreference: "Seed (needs $10K+ MRR)",
    contact: {
      linkedin: "https://www.linkedin.com/in/jasonmlemkin/",
      twitter: "@jasonlk",
    },
    thesisAlignment: "perfect",
    thesisNote: "B2B/API/AI only. 'Don't require co-investors.' Want founder-CEO forever. Perfect thesis match for compliance API.",
    coppaInterest: "none",
    fundSignal: "active",
    introPaths: [
      { type: "cold-application", description: "Apply on saastrfund.com", strength: 2 },
      { type: "content-warmup", description: "Engage with Jason Lemkin's LinkedIn content", strength: 2 },
    ],
    tier: 1,
    approachStrategy: {
      recommended: "Do NOT pitch until $10K+ MRR and 10+ customers. Build relationship via SaaStr content/events.",
      steps: [
        "WAIT until $10K+ MRR with 10+ unaffiliated customers — Jason's explicit threshold",
        "Build visibility: comment on Jason's LinkedIn/Twitter posts, attend SaaStr AI 2026 (May, SF)",
        "When ready: email with detailed metrics (ARR, growth rate, NRR, customers)",
        "Frame as B2B API/compliance SaaS with regulatory moat",
      ],
      openingAngle: "B2B compliance API with a regulatory moat: 67+ child safety laws mapped to machine-enforceable rules. Every platform serving minors needs this. [Share only when MRR threshold is met]",
      timing: "Queue until $10K+ MRR milestone",
    },
    status: "identified",
    notes: "PERFECT thesis match (B2B API). Needs ~$10K MRR first. Queue for when revenue starts.",
  },
  {
    id: "a16z-speedrun",
    name: "a16z Speedrun Program",
    fundOrCompany: "Andreessen Horowitz",
    role: "Speedrun Accelerator",
    website: "speedrun.a16z.com",
    category: "solo-founder-fund",
    type: "vc",
    checkSizeRange: "$500K + $500K follow-on",
    stagePreference: "Pre-seed",
    contact: {
      twitter: "@speedrun",
    },
    thesisAlignment: "good",
    thesisNote: "12-week accelerator. Led k-ID's pre-seed. $180M+ deployed. $5M+ in cloud/AI credits. Brand halo effect.",
    coppaInterest: "portfolio-signal",
    fundSignal: "deploying",
    introPaths: [
      { type: "cold-application", description: "Application on speedrun.a16z.com", strength: 2 },
      { type: "portfolio-founder", description: "Intro via k-ID (went through Speedrun)", strength: 4 },
    ],
    tier: 1,
    approachStrategy: {
      recommended: "Apply at speedrun.a16z.com when applications open for next cohort",
      steps: [
        "Apply at speedrun.a16z.com when applications open for next cohort (SR007)",
        "Emphasize the AI angle: Phosra's MCP enforcement engine is AI-native compliance infrastructure",
        "Reference k-ID (a16z portfolio) — they already have thesis conviction in child digital safety",
        "Highlight massive regulatory tailwind: 67+ laws, $1B+ compliance market, solo founder building API layer",
      ],
      openingAngle: "You backed k-ID because you see the child safety compliance wave. Phosra is the AI-native API layer that every platform will need to enforce 67+ child safety laws.",
    },
    status: "identified",
    notes: "k-ID went through Speedrun for child safety. Brand + capital + credits. Check timing for Spring 2026 cohort.",
    relevantPortfolio: ["k-ID"],
  },
  {
    id: "calm-fund",
    name: "Tyler Tringas",
    fundOrCompany: "Calm Company Fund",
    role: "Managing Partner",
    website: "calmfund.com",
    category: "solo-founder-fund",
    type: "micro-fund",
    checkSizeRange: "$100K-$500K",
    stagePreference: "Seed",
    contact: {
      linkedin: "https://www.linkedin.com/in/tringastyler/",
      twitter: "@tylertringas",
      email: "hey@calmfund.com",
    },
    thesisAlignment: "adjacent",
    thesisNote: "SEAL structure for capital-efficient businesses. Built for solo/small-team founders. Phosra's API model fits.",
    coppaInterest: "none",
    fundSignal: "active",
    introPaths: [
      { type: "cold-application", description: "Application on calmfund.com", strength: 2 },
    ],
    tier: 3,
    approachStrategy: {
      recommended: "DM Tyler on Twitter (DMs open) or email hey@calmfund.com",
      steps: [
        "DM @tylertringas on Twitter or email hey@calmfund.com — Tyler prefers async email before calls",
        "Complete Trailhead application on calmfund.com",
        "Frame Phosra as a 'calm company' — regulatory compliance is durable, recurring-revenue with built-in retention",
        "Send monthly updates to updates@calmfund.com to build relationship",
      ],
      openingAngle: "Compliance SaaS is the ultimate calm company business: mandatory, recurring, high-retention revenue. When 67+ laws say you must comply, churn goes to zero.",
    },
    status: "identified",
    notes: "Good if wanting optionality between bootstrap and VC paths. SEAL structure preserves flexibility.",
  },
  {
    id: "backstage",
    name: "Arlan Hamilton",
    fundOrCompany: "Backstage Capital",
    role: "Founder & Managing Partner",
    website: "backstagecapital.com",
    category: "solo-founder-fund",
    type: "vc",
    checkSizeRange: "$250K-$500K",
    stagePreference: "Pre-seed to Seed",
    contact: {
      linkedin: "https://www.linkedin.com/in/arlanhamilton/",
      twitter: "@ArlanWasHere",
    },
    thesisAlignment: "adjacent",
    thesisNote: "Backs underrepresented founders. 35 pre-seed investments in 2025. Solo founder accepted.",
    coppaInterest: "none",
    fundSignal: "deploying",
    introPaths: [
      { type: "cold-application", description: "Apply on backstagecapital.com", strength: 2 },
    ],
    tier: 3,
    approachStrategy: {
      recommended: "Apply through backstagecapital.com/apply-2/ when applications reopen",
      steps: [
        "Sign up for Backstage's Mixtape newsletter for reopen notifications",
        "Engage Arlan on Twitter (@ArlanWasHere) — highly active and responsive",
        "When applications open, apply emphasizing how child safety impacts underrepresented communities",
        "Frame: Phosra protects children most vulnerable online — disproportionately children of color and LGBTQ+ youth",
      ],
      openingAngle: "The children most harmed by unsafe platforms are disproportionately from underrepresented communities. Phosra's compliance platform ensures every platform can afford to protect them.",
    },
    status: "identified",
    notes: "Active deployer. Focus on underrepresented founders.",
  },
  {
    id: "tinyseed",
    name: "Rob Walling & Einar Vollset",
    fundOrCompany: "TinySeed",
    role: "Partners",
    website: "tinyseed.com",
    category: "solo-founder-fund",
    type: "micro-fund",
    checkSizeRange: "$120K base",
    stagePreference: "Revenue-generating SaaS",
    contact: {
      linkedin: "https://www.linkedin.com/in/robwalling/",
      twitter: "@robwalling",
    },
    thesisAlignment: "adjacent",
    thesisNote: "Year-long remote accelerator for B2B SaaS. Capital-efficient focus. Solo founder gets $120K base.",
    coppaInterest: "none",
    fundSignal: "active",
    introPaths: [
      { type: "cold-application", description: "Apply on tinyseed.com (needs revenue)", strength: 2 },
    ],
    tier: 3,
    approachStrategy: {
      recommended: "Apply to next TinySeed batch — frame as vertical B2B SaaS with bootstrapper DNA",
      steps: [
        "Apply at tinyseed.com/apply for next batch",
        "Frame as vertical B2B SaaS — TinySeed data shows vertical SaaS outperforms horizontal",
        "Emphasize bootstrapper DNA: solo founder, revenue-focused, sustainable B2B SaaS",
        "Engage Rob on LinkedIn where he posts about SaaS metrics",
      ],
      openingAngle: "Vertical compliance SaaS for child safety — the regulatory wave creates mandatory demand. Solo founder, B2B API model, built for sustainable growth.",
    },
    status: "identified",
    notes: "Needs revenue to apply. Queue for later if revenue comes before close.",
  },
]

// ─── Strategic Angels: T&S Leaders (12 targets) ──────────────────────────────

const TS_LEADERS: WarmIntroTarget[] = [
  {
    id: "antigone-davis",
    name: "Antigone Davis",
    fundOrCompany: "Meta",
    role: "VP & Global Head of Safety",
    category: "ts-leader",
    type: "angel",
    checkSizeRange: "$25K-$50K",
    stagePreference: "Strategic",
    contact: {
      twitter: "@DavisAntigone",
    },
    thesisAlignment: "perfect",
    thesisNote: "Directly oversees Meta's COPPA compliance. 10 years in State AG office. Serves on FOSI board. Phosra solves her team's problem.",
    coppaInterest: "public-stance",
    fundSignal: "unknown",
    introPaths: [
      { type: "industry-association", description: "FOSI network, TSPA", strength: 3 },
      { type: "alumni-network", description: "State AG alumni networks", strength: 2 },
    ],
    tier: 1,
    approachStrategy: {
      recommended: "Warm intro via FOSI board network or State AG alumni",
      steps: [
        "Engage with her FOSI/child safety content on LinkedIn and Medium",
        "Request intro through FOSI's Stephen Balkam or NCMEC board connections",
        "Position as 'compliance infrastructure that reduces your team's burden' — she oversees Meta's COPPA compliance directly",
        "Offer advisory role: her State AG background + Meta operational view = invaluable product feedback",
      ],
      openingAngle: "Meta's Teen Accounts rollout shows her team is building bespoke compliance tooling internally — Phosra can be the cross-platform standard that makes her job easier, not harder.",
    },
    status: "identified",
    notes: "Perfect domain fit. Met with Greece PM on child safety. Massive distribution potential if she champions Phosra.",
  },
  {
    id: "cormac-keenan",
    name: "Cormac Keenan",
    fundOrCompany: "TikTok (former)",
    role: "Former Head of T&S, now Strategic Advisor",
    category: "ts-leader",
    type: "angel",
    checkSizeRange: "$25K-$50K",
    stagePreference: "Strategic",
    contact: {
      linkedin: "https://ie.linkedin.com/in/cormac-keenan-7b88862",
    },
    thesisAlignment: "perfect",
    thesisNote: "Led TikTok T&S 2020+. Built teen screen time limits, parental controls. Now advisory — has time for angel investing.",
    coppaInterest: "public-stance",
    fundSignal: "unknown",
    introPaths: [
      { type: "industry-association", description: "FOSI network, Technology Coalition", strength: 3 },
    ],
    tier: 1,
    approachStrategy: {
      recommended: "Direct LinkedIn outreach — he is in advisory mode and more accessible than active executives",
      steps: [
        "Connect on LinkedIn with a note referencing his TikTok T&S legacy and teen safety features",
        "Frame as advisory opportunity: his cross-jurisdiction compliance experience at TikTok is exactly what Phosra codifies",
        "Highlight that Phosra automates what his team built manually at TikTok — screen time rules, parental controls, age gating — across 67+ laws",
        "Offer formal advisory seat with equity: his Dublin/EU perspective is critical for DSA and GDPR-K compliance",
      ],
      openingAngle: "He built TikTok's teen safety features manually across jurisdictions — Phosra turns that operational pain into an API. As a strategic advisor with time, he is uniquely positioned to shape the compliance standard he wished existed.",
    },
    status: "identified",
    notes: "Available, experienced, strategic. Deep understanding of cross-jurisdiction compliance challenges.",
  },
  {
    id: "clint-smith",
    name: "Clint Smith",
    fundOrCompany: "Discord",
    role: "Chief Legal Officer, Board Chair of ROOST",
    category: "ts-leader",
    type: "angel",
    checkSizeRange: "$25K-$75K",
    stagePreference: "Strategic",
    contact: {
      linkedin: "https://www.linkedin.com/in/clintsmithsiliconvalley/",
    },
    thesisAlignment: "perfect",
    thesisNote: "Oversees Discord's T&S. Board Chair of ROOST ($27M child safety nonprofit). Discord under state AG scrutiny for child safety.",
    coppaInterest: "public-stance",
    fundSignal: "unknown",
    introPaths: [
      { type: "industry-association", description: "ROOST founding network, FOSI, TSPA", strength: 3 },
    ],
    tier: 1,
    approachStrategy: {
      recommended: "Warm intro via ROOST network or Digital Trust and Safety Partnership board",
      steps: [
        "Engage with his LinkedIn posts about Discord transparency reports and child safety initiatives",
        "Request intro through ROOST or DTSP board connections — he chairs both and is highly networked",
        "Position Phosra as infrastructure that supports ROOST's multi-platform mission: standardized compliance across Discord, Google, Roblox, OpenAI",
        "Propose advisory role leveraging his CLO perspective on multi-platform regulatory exposure",
      ],
      openingAngle: "As ROOST Board Chair overseeing $27M for child safety across Google, Discord, Roblox, and OpenAI, he sees the compliance fragmentation problem firsthand — Phosra is the interoperability layer ROOST's mission needs.",
    },
    status: "identified",
    notes: "Multi-platform influence via ROOST. Led Discord's Lantern CSAM detection program.",
  },
  {
    id: "joanna-shields",
    name: "Joanna Shields (Baroness Shields)",
    fundOrCompany: "WeProtect Global Alliance (founder)",
    role: "Founder, Former Facebook VP, UK Minister for Internet Safety",
    category: "ts-leader",
    type: "angel",
    checkSizeRange: "$25K-$50K",
    stagePreference: "Strategic",
    contact: {
      linkedin: "https://www.linkedin.com/in/baronessjoannashields/",
      twitter: "@joannashields",
      website: "https://www.joannashields.com/",
    },
    thesisAlignment: "perfect",
    thesisNote: "Founded WeProtect. Senior Facebook exec. On k-ID/OpenAge supervisory board. Deep network across platforms and governments.",
    coppaInterest: "public-stance",
    fundSignal: "unknown",
    introPaths: [
      { type: "industry-association", description: "WeProtect network, k-ID/OpenAge board", strength: 3 },
    ],
    tier: 1,
    approachStrategy: {
      recommended: "Warm intro via k-ID/OpenAge board connection (Julian Corbett) or WeProtect network",
      steps: [
        "Connect via Julian Corbett (k-ID co-founder) — she sits on k-ID's supervisory board and is already invested in the child safety compliance space",
        "Reference her WeProtect Global Alliance founding work: Phosra operationalizes the compliance standards 100+ WeProtect member countries are enacting",
        "Highlight her government + platform dual perspective: she uniquely understands both sides of the regulatory equation",
        "Propose advisory role with equity: her WeProtect network opens doors to 100+ governments and her k-ID board seat validates the age verification thesis",
      ],
      openingAngle: "She founded WeProtect to coordinate global child protection policy — Phosra is the technical implementation layer that turns those 100+ countries' commitments into enforceable platform compliance. The k-ID connection makes this a natural extension of her current portfolio.",
    },
    status: "identified",
    notes: "Founded the leading global child safety alliance. Active in k-ID ecosystem.",
  },
  {
    id: "adam-presser",
    name: "Adam Presser",
    fundOrCompany: "TikTok USDS Joint Venture",
    role: "CEO (former Head of Operations / Global T&S)",
    category: "ts-leader",
    type: "angel",
    checkSizeRange: "$25K-$50K",
    stagePreference: "Strategic",
    contact: {
      linkedin: "https://www.linkedin.com/in/adampresser/",
    },
    thesisAlignment: "perfect",
    thesisNote: "Now CEO of TikTok's US entity (Jan 2026). Previously ran TikTok global T&S. Under intense COPPA scrutiny. Phosra's law-mapping solves their multi-jurisdiction problem.",
    coppaInterest: "public-stance",
    fundSignal: "unknown",
    introPaths: [
      { type: "industry-association", description: "FOSI, Technology Coalition", strength: 2 },
    ],
    tier: 1,
    approachStrategy: {
      recommended: "Warm intro via Cormac Keenan (his predecessor) or FOSI/Technology Coalition network",
      steps: [
        "Connect via Cormac Keenan who transitioned the T&S role to Presser — natural warm intro path",
        "Reference TikTok's US JV regulatory requirements: as CEO of the new US entity, compliance tooling is mission-critical",
        "Position as infrastructure that helps his team demonstrate compliance to US regulators — a key mandate for the TikTok USDS structure",
        "Propose strategic advisory: his Harvard Law + HBS background and CEO perspective on regulatory compliance is invaluable",
      ],
      openingAngle: "As CEO of TikTok's new US joint venture, he needs to demonstrate ironclad COPPA and child safety compliance to US regulators more than any other executive in tech right now. Phosra is purpose-built for this exact problem.",
    },
    status: "identified",
    notes: "TikTok's regulatory exposure = high urgency for compliance tooling. Now CEO of TikTok US entity (Jan 2026).",
  },
  {
    id: "yoel-roth",
    name: "Yoel Roth",
    fundOrCompany: "Match Group",
    role: "SVP Trust & Safety",
    category: "ts-leader",
    type: "angel",
    checkSizeRange: "$25K-$50K",
    stagePreference: "Strategic",
    contact: {
      linkedin: "https://www.linkedin.com/in/yoelroth",
      website: "https://yoyoel.com/",
    },
    thesisAlignment: "good",
    thesisNote: "Former Twitter Head of T&S. Now Match Group (Tinder/Hinge). PhD on dating app safety/privacy. Carnegie Endowment scholar. UC Berkeley policy fellow.",
    coppaInterest: "public-stance",
    fundSignal: "unknown",
    introPaths: [
      { type: "industry-association", description: "Carnegie Endowment, UC Berkeley, TSPA, Aspen Institute", strength: 2 },
    ],
    tier: 2,
    approachStrategy: {
      recommended: "Thought-leadership engagement via his writing and conference circuit",
      steps: [
        "Engage with his published work on trust & safety challenges (his personal site yoyoel.com and academic papers)",
        "Attend a TSPA or Aspen Institute event where he speaks and introduce Phosra's approach",
        "Frame as: Match Group's dating apps face age verification mandates across 50 states — Phosra maps these automatically",
        "Propose advisory role: his academic rigor + operational experience at Twitter and Match Group = ideal product advisor",
      ],
      openingAngle: "His PhD was on safety and privacy in dating apps — Match Group now faces a patchwork of state age verification laws for minors. Phosra solves the exact multi-jurisdiction compliance problem he has studied academically and now manages operationally.",
    },
    status: "identified",
    notes: "Strong thought leader. Published extensively on T&S challenges.",
  },
  {
    id: "del-harvey",
    name: "Del Harvey",
    fundOrCompany: "Twitter (former)",
    role: "Former VP Trust & Safety (13 years)",
    category: "ts-leader",
    type: "angel",
    checkSizeRange: "$15K-$25K",
    stagePreference: "Strategic",
    contact: {
      linkedin: "https://www.linkedin.com/in/delharvey/",
      twitter: "@delbius",
    },
    thesisAlignment: "good",
    thesisNote: "Founded Twitter's T&S function. Before Twitter, ran sting operations for child predator investigations (Perverted Justice). Deep personal commitment.",
    coppaInterest: "public-stance",
    fundSignal: "unknown",
    introPaths: [
      { type: "industry-association", description: "TSPA, TED network, Twitter T&S alumni", strength: 2 },
    ],
    tier: 1,
    approachStrategy: {
      recommended: "Direct LinkedIn outreach — she is now independent and associated with TSPA",
      steps: [
        "Connect on LinkedIn referencing her TSPA involvement and pioneering T&S work at Twitter",
        "Appeal to her personal mission: she investigated child predators before Twitter — child safety is deeply personal",
        "Frame Phosra as the compliance infrastructure she wished existed when building Twitter's T&S from scratch",
        "Offer advisory role: her 13 years building T&S at scale provides irreplaceable operational insight",
      ],
      openingAngle: "She spent years catching child predators before building Twitter's T&S function from zero — Phosra is the compliance automation layer that lets platforms focus on protection rather than regulatory paperwork. Her pioneering experience is exactly the advisory voice the product needs.",
    },
    status: "identified",
    notes: "Legendary T&S figure. TED speaker. Now independent — available for advisory/angel.",
  },
  {
    id: "angela-hession",
    name: "Angela Hession",
    fundOrCompany: "Halo Studios (formerly Twitch, Microsoft Xbox)",
    role: "Chief of Staff at Halo Studios (former Twitch Global VP T&S, Xbox T&S Head)",
    category: "ts-leader",
    type: "angel",
    checkSizeRange: "$15K-$25K",
    stagePreference: "Strategic",
    contact: {
      linkedin: "https://www.linkedin.com/in/angela-hession-a294ab17/",
      twitter: "@Heshogirl",
    },
    thesisAlignment: "good",
    thesisNote: "Created Xbox's Project Artemis grooming detection. Former Twitch Global VP T&S. Now Chief of Staff at Halo Studios. 20yr Microsoft veteran. Enterprise compliance background.",
    coppaInterest: "public-stance",
    fundSignal: "unknown",
    introPaths: [
      { type: "industry-association", description: "Technology Coalition, NCMEC, Microsoft/Xbox alumni", strength: 2 },
    ],
    tier: 1,
    approachStrategy: {
      recommended: "Direct LinkedIn outreach referencing Project Artemis and her gaming safety legacy",
      steps: [
        "Connect on LinkedIn referencing her pioneering Project Artemis work at Xbox and Twitch T&S leadership",
        "Frame around gaming industry compliance: Project Artemis detected grooming, Phosra ensures the legal framework is automated across jurisdictions",
        "Highlight her unique three-platform perspective (Xbox, Twitch, Halo) — she understands enterprise-scale compliance from multiple angles",
        "Offer advisory role: her 20-year Microsoft enterprise background + gaming safety expertise is invaluable for product design",
      ],
      openingAngle: "She created Project Artemis to detect grooming at Xbox and then scaled T&S at Twitch — Phosra is the compliance layer that ensures platforms like these implement the right rules in every jurisdiction, complementing detection tools like Artemis.",
    },
    status: "identified",
    notes: "Enterprise compliance background from Microsoft. Left Twitch mid-2024, now Chief of Staff at Halo Studios.",
  },
  {
    id: "tami-bhaumik",
    name: "Tami Bhaumik",
    fundOrCompany: "Roblox",
    role: "VP Civility & Partnerships (FOSI Board Chair)",
    category: "ts-leader",
    type: "angel",
    checkSizeRange: "$15K-$25K",
    stagePreference: "Strategic",
    contact: {
      linkedin: "https://www.linkedin.com/in/tamibhaumik/",
      twitter: "@tamibhaumik",
    },
    thesisAlignment: "good",
    thesisNote: "Leads Roblox civility/safety partnerships. FOSI Board Chair. Roblox faces ~80 child exploitation lawsuits. 25+ years consumer tech experience.",
    coppaInterest: "public-stance",
    fundSignal: "unknown",
    introPaths: [
      { type: "industry-association", description: "FOSI board network, Roblox safety partners", strength: 3 },
    ],
    tier: 1,
    approachStrategy: {
      recommended: "Warm intro via FOSI board network — she chairs the board and is deeply connected",
      steps: [
        "Engage with her LinkedIn content on Roblox civility initiatives and Safer Internet Day activities",
        "Connect via FOSI's Stephen Balkam or other board members — she has been FOSI Board Chair/Director",
        "Frame around Roblox's legal exposure: ~80 child exploitation lawsuits = urgent need for demonstrable compliance automation",
        "Propose advisory role: her 25+ years in consumer tech marketing + child safety operations = uniquely valuable product perspective",
      ],
      openingAngle: "Roblox faces ~80 child exploitation lawsuits and increasing regulatory scrutiny — as VP of Civility & Partnerships and FOSI Board Chair, she needs to demonstrate compliance across dozens of jurisdictions. Phosra automates exactly this.",
    },
    status: "identified",
    notes: "Roblox's legal exposure makes compliance tooling urgent for her team.",
  },
  {
    id: "eric-ebenstein",
    name: "Eric Ebenstein",
    fundOrCompany: "TikTok",
    role: "Senior Director of Public Policy, FOSI Chair (Jan 2026)",
    category: "ts-leader",
    type: "angel",
    checkSizeRange: "$15K-$25K",
    stagePreference: "Strategic",
    contact: {
      linkedin: "https://www.linkedin.com/in/eric-ebenstein/",
      twitter: "@EricintheDC",
    },
    thesisAlignment: "good",
    thesisNote: "Just became FOSI Chair (Jan 2026). TikTok's policy lead dealing with COPPA 2.0. Nexus of policy and platform. Cardozo Law JD.",
    coppaInterest: "public-stance",
    fundSignal: "unknown",
    introPaths: [
      { type: "industry-association", description: "FOSI network (he IS the chair)", strength: 4 },
    ],
    tier: 2,
    approachStrategy: {
      recommended: "Direct approach via FOSI — he is the new chair and is the gateway to the entire ecosystem",
      steps: [
        "Engage with his LinkedIn and Twitter content on TikTok policy and FOSI initiatives",
        "Request intro through FOSI network or attend FOSI 2026 conference where he will be prominent",
        "Frame Phosra as the compliance tool that maps every law his TikTok policy team must navigate — especially post-COPPA 2.0",
        "Propose advisory role: as FOSI Chair + TikTok policy lead, he sits at the intersection of legislation and implementation",
      ],
      openingAngle: "As the new FOSI Chair and TikTok's senior policy director, he is the single person most connected to both the legislative pipeline and the platform compliance challenge. Phosra maps the exact laws his policy team tracks manually.",
    },
    status: "identified",
    notes: "New FOSI chair = strong network connector to the entire ecosystem.",
  },
]

// ─── Strategic Angels: FTC Alumni & Regulatory (5 targets) ────────────────────

const FTC_ALUMNI: WarmIntroTarget[] = [
  {
    id: "jules-polonetsky",
    name: "Jules Polonetsky",
    fundOrCompany: "Future of Privacy Forum",
    role: "CEO",
    category: "ftc-alumni",
    type: "angel",
    checkSizeRange: "$15K-$25K",
    stagePreference: "Strategic",
    contact: {
      linkedin: "https://www.linkedin.com/in/julespolonetsky/",
      twitter: "@JulesPolonetsky",
    },
    thesisAlignment: "perfect",
    thesisNote: "Leads preeminent privacy think tank for 15 years. Former CPO at AOL/DoubleClick. IAPP Privacy Leadership Award winner. Angel investor in privacy tech.",
    coppaInterest: "public-stance",
    fundSignal: "unknown",
    introPaths: [
      { type: "industry-association", description: "IAPP, FPF convenings, privacy bar", strength: 3 },
    ],
    tier: 1,
    approachStrategy: {
      recommended: "Direct engagement via FPF events or IAPP network — he is the most accessible privacy leader",
      steps: [
        "Attend a Future of Privacy Forum convening or IAPP event where he regularly speaks and is approachable",
        "Frame Phosra as the technical implementation of the policy frameworks FPF advocates for — his think tank sets policy, Phosra enforces it",
        "Reference his dual CPO background (AOL + DoubleClick): he understands both the operator pain and the regulatory necessity",
        "Propose advisory/angel: as a known privacy tech angel investor, this is in his existing investment thesis",
      ],
      openingAngle: "He has spent 30 years at the intersection of privacy policy and technology — first as CPO at AOL and DoubleClick, now leading FPF. Phosra is the compliance automation layer that turns the children's privacy frameworks FPF champions into enforceable platform rules.",
    },
    status: "identified",
    notes: "Active in privacy startup ecosystem. Deep regulatory knowledge. Known angel investor. IAPP 2023 Privacy Leadership Award.",
  },
  {
    id: "lina-khan",
    name: "Lina Khan",
    fundOrCompany: "Columbia Law School (former FTC Chair 2021-2025)",
    role: "Associate Professor, Columbia Law School; Former FTC Chair",
    category: "ftc-alumni",
    type: "angel",
    checkSizeRange: "$10K-$25K",
    stagePreference: "Advisory",
    contact: {
      twitter: "@linamkhan",
    },
    thesisAlignment: "perfect",
    thesisNote: "Youngest FTC Chair ever (age 32). Oversaw COPPA enforcement. Spoke at YC. Now at Columbia Law + advising NYC mayor transition. Enormous credibility signal.",
    coppaInterest: "public-stance",
    fundSignal: "unknown",
    introPaths: [
      { type: "alumni-network", description: "YC network, Columbia Law, NYC policy circles", strength: 2 },
    ],
    tier: 2,
    approachStrategy: {
      recommended: "YC network intro or Columbia Law connection — approach for advisory, not check size",
      steps: [
        "Pursue intro through YC network (she spoke at YC and has startup sympathies — rare for a regulator)",
        "Reference her COPPA enforcement record at FTC: Phosra automates compliance with the rules she enforced",
        "Frame as advisory opportunity: her name on a cap table is the ultimate regulatory credibility signal for child safety compliance",
        "Be sensitive to post-government ethics rules: advisory/informal engagement first, formal role when appropriate",
      ],
      openingAngle: "She oversaw COPPA enforcement as the youngest FTC Chair and spoke at YC about startup-friendly regulation — Phosra is the rare startup that makes her enforcement legacy actionable by giving platforms the tools to actually comply. Advisory value far exceeds any check size.",
    },
    status: "identified",
    notes: "Enormous credibility signal. Currently at Columbia Law + advising NYC mayor transition. Worth pursuing for advisory.",
  },
  {
    id: "rebecca-slaughter",
    name: "Rebecca Kelly Slaughter",
    fundOrCompany: "Former FTC Commissioner",
    role: "Former Commissioner (fighting reinstatement at Supreme Court)",
    category: "ftc-alumni",
    type: "angel",
    checkSizeRange: "$10K-$25K",
    stagePreference: "Advisory",
    contact: {
      linkedin: "https://www.linkedin.com/in/becca-kelly-slaughter-360a8467/",
      twitter: "@RKSlaughterFTC",
    },
    thesisAlignment: "good",
    thesisNote: "Strong child privacy advocate at FTC. Yale Law. Deep expertise in children's data protection and COPPA enforcement. Fired by Trump, fighting reinstatement at SCOTUS.",
    coppaInterest: "public-stance",
    fundSignal: "unknown",
    introPaths: [
      { type: "industry-association", description: "FTC alumni network, Georgetown Law, privacy bar", strength: 2 },
    ],
    tier: 2,
    approachStrategy: {
      recommended: "Approach through privacy bar or FTC alumni network — timing depends on SCOTUS case resolution",
      steps: [
        "Monitor her SCOTUS case status (Trump v. Slaughter) — approach when her situation stabilizes",
        "Connect via privacy bar or Yale Law network where she is deeply connected",
        "Frame Phosra as the practical implementation of the children's privacy agenda she championed at FTC",
        "Propose advisory role: her FTC enforcement perspective ensures Phosra builds what regulators actually look for",
      ],
      openingAngle: "She was one of the FTC's strongest COPPA advocates — Phosra operationalizes the enforcement standards she championed. Once her SCOTUS case resolves, her advisory voice would ensure the product meets the regulatory bar she helped set.",
      timing: "Wait for SCOTUS resolution of Trump v. Slaughter before formal approach. Monitor case status.",
    },
    status: "identified",
    notes: "Strong COPPA advocate. Currently in legal battle over FTC firing (SCOTUS case pending).",
  },
  {
    id: "alvaro-bedoya",
    name: "Alvaro Bedoya",
    fundOrCompany: "American Economic Liberties Project (former FTC Commissioner)",
    role: "Senior Advisor, Economic Liberties; Former FTC Commissioner; Georgetown Privacy Center Founder",
    category: "ftc-alumni",
    type: "angel",
    checkSizeRange: "$10K-$25K",
    stagePreference: "Advisory",
    contact: {
      linkedin: "https://www.linkedin.com/in/alvaro-bedoya-9312b258",
      twitter: "@alvarombedoya",
    },
    thesisAlignment: "good",
    thesisNote: "Founded Georgetown Center on Privacy & Technology. Expert on surveillance and children's privacy. Resigned from FTC June 2025. Now Senior Advisor at Economic Liberties.",
    coppaInterest: "public-stance",
    fundSignal: "unknown",
    introPaths: [
      { type: "alumni-network", description: "Georgetown Law network, privacy advocacy community", strength: 2 },
    ],
    tier: 2,
    approachStrategy: {
      recommended: "Direct outreach via Georgetown privacy network or Economic Liberties connections",
      steps: [
        "Connect via Georgetown Center on Privacy & Technology alumni network — he founded it and maintains strong ties",
        "Reference his scholarship on privacy for vulnerable populations: children are the most vulnerable digital citizens",
        "Frame Phosra as the compliance tool that enforces the privacy protections his Center researched and he enforced at FTC",
        "Propose advisory role: his academic + regulatory dual perspective ensures Phosra meets both scholarly and enforcement standards",
      ],
      openingAngle: "He founded Georgetown's Privacy Center to study how surveillance harms vulnerable people, then enforced those principles as FTC Commissioner — Phosra is the compliance engine that turns his life's work into platform-level protections for children, the most vulnerable digital users.",
    },
    status: "identified",
    notes: "Recently freed up from FTC (resigned June 2025). Now Senior Advisor at American Economic Liberties Project. Available for advisory.",
  },
  {
    id: "mamie-kresses",
    name: "Mamie Kresses",
    fundOrCompany: "BBB National Programs / CARU",
    role: "VP, Children's Advertising Review Unit (CARU); Former FTC (30+ years)",
    category: "ftc-alumni",
    type: "angel",
    checkSizeRange: "$10K-$25K",
    stagePreference: "Advisory",
    contact: {
      linkedin: "https://www.linkedin.com/in/mamie-kresses-0a263320",
    },
    thesisAlignment: "perfect",
    thesisNote: "30+ years at FTC Bureau of Consumer Protection. Co-led 2012 COPPA rule review. Robert Pitofsky Lifetime Achievement Award. Now VP of CARU (first FTC-approved COPPA Safe Harbor).",
    coppaInterest: "public-stance",
    fundSignal: "unknown",
    introPaths: [
      { type: "industry-association", description: "FTC alumni, IAPP, CARU network", strength: 2 },
    ],
    tier: 2,
    approachStrategy: {
      recommended: "Direct approach via CARU/BBB National Programs network or IAPP events",
      steps: [
        "Connect via IAPP or CARU events where she regularly speaks on COPPA compliance",
        "Frame Phosra as the technology layer that helps platforms comply with the COPPA rules she literally co-authored (2012 rule review)",
        "Highlight CARU's COPPA Safe Harbor program: Phosra automates the compliance requirements CARU evaluates",
        "Propose advisory role: no one alive has more COPPA enforcement expertise — her guidance ensures Phosra maps rules exactly as regulators interpret them",
      ],
      openingAngle: "She co-led the FTC's 2012 COPPA rule review and now leads the first FTC-approved COPPA Safe Harbor at CARU — Phosra is the compliance automation engine that implements the rules she wrote and now evaluates. She is the ultimate product validator.",
    },
    status: "identified",
    notes: "Deep COPPA enforcement expertise. Now VP at CARU. Robert Pitofsky Lifetime Achievement Award winner.",
  },
]

// ─── Strategic Angels: Nonprofit Leaders (6 targets) ──────────────────────────

const NONPROFIT_LEADERS: WarmIntroTarget[] = [
  {
    id: "jim-steyer",
    name: "Jim Steyer",
    fundOrCompany: "Common Sense Media",
    role: "Founder & CEO",
    category: "nonprofit-leader",
    type: "angel",
    checkSizeRange: "$25K-$50K",
    stagePreference: "Strategic",
    contact: {
      linkedin: "https://www.linkedin.com/in/jimsteyer/",
      twitter: "@jimsteyer",
    },
    thesisAlignment: "perfect",
    thesisNote: "Founded leading children's media advocacy org. Stanford faculty. Partnered with OpenAI on Parents & Kids Safe AI Act. Massive legislative influence.",
    coppaInterest: "public-stance",
    fundSignal: "unknown",
    introPaths: [
      { type: "alumni-network", description: "Stanford faculty network, Aspen Ideas", strength: 2 },
      { type: "industry-association", description: "Common Sense advisory board", strength: 2 },
    ],
    tier: 1,
    approachStrategy: {
      recommended: "Warm intro via Stanford network or direct outreach as fellow child safety advocate",
      steps: [
        "Engage with his Common Sense Media content on LinkedIn/X",
        "Reference shared mission — position Phosra as enforcement infrastructure for the legislation he advocates",
        "Request 15-min call via Stanford faculty channels or press@commonsense.org",
        "Offer to present at a Common Sense Media event",
      ],
      openingAngle: "Phosra automates enforcement of the exact legislation Common Sense Media has championed — KOSA, COPPA 2.0, and state-level child safety laws. We turn his policy wins into platform compliance reality.",
    },
    status: "identified",
    notes: "Enormous signal value. 20+ years advocating for children's digital safety.",
  },
  {
    id: "baroness-kidron",
    name: "Baroness Beeban Kidron",
    fundOrCompany: "5Rights Foundation",
    role: "Founder",
    category: "nonprofit-leader",
    type: "angel",
    checkSizeRange: "$25K-$50K",
    stagePreference: "Strategic",
    contact: {
      linkedin: "https://uk.linkedin.com/in/baroness-beeban-kidron-94061933",
      email: "info@5rightsfoundation.com",
    },
    thesisAlignment: "perfect",
    thesisNote: "Created UK's Age Appropriate Design Code (AADC) which influenced global legislation. UN Broadband Commissioner. Her work literally created the laws Phosra maps.",
    coppaInterest: "public-stance",
    fundSignal: "unknown",
    introPaths: [
      { type: "industry-association", description: "5Rights network, UK House of Lords, IEEE, Oxford AI Ethics", strength: 2 },
    ],
    tier: 1,
    approachStrategy: {
      recommended: "Formal approach through 5Rights Foundation or UK Parliament channels",
      steps: [
        "Contact 5Rights Foundation via info@5rightsfoundation.com positioning as implementation partner for UK AADC",
        "Reference Phosra's coverage of UK AADC and international child safety regulations",
        "Propose collaboration on enforcement tooling making her AADC vision practically achievable",
        "Offer to present at a 5Rights event or contribute to research",
      ],
      openingAngle: "Baroness Kidron created the UK AADC — Phosra is the technical infrastructure that makes it enforceable at scale. We bridge the gap between her regulatory vision and platform compliance reality.",
    },
    status: "identified",
    notes: "Her legislation IS Phosra's product category. Pioneer of the space.",
  },
  {
    id: "stephen-balkam",
    name: "Stephen Balkam",
    fundOrCompany: "FOSI",
    role: "Founder & CEO",
    category: "nonprofit-leader",
    type: "angel",
    checkSizeRange: "$15K-$25K",
    stagePreference: "Strategic",
    contact: {
      linkedin: "https://www.linkedin.com/in/stephenbalkam/",
      twitter: "@StephenBalkam",
    },
    thesisAlignment: "perfect",
    thesisNote: "Founded Family Online Safety Institute. Convener of major platforms. Direct connection to every T&S leader.",
    coppaInterest: "public-stance",
    fundSignal: "unknown",
    introPaths: [
      { type: "industry-association", description: "FOSI events/convenings", strength: 3 },
    ],
    tier: 1,
    approachStrategy: {
      recommended: "Leverage his super-connector role in Trust & Safety — attend FOSI events",
      steps: [
        "Attend FOSI Annual Conference and introduce Phosra as compliance infrastructure",
        "Engage with his content on LinkedIn/X — active on both",
        "Request meeting positioning Phosra as tool helping FOSI member companies achieve compliance",
        "Ask for introductions to his extensive T&S network — known super-connector",
      ],
      openingAngle: "FOSI's mission is making the online world safer for kids — Phosra gives their member companies the technical infrastructure to comply with the rapidly expanding patchwork of child safety laws.",
    },
    status: "identified",
    notes: "SUPER CONNECTOR. Connects to nearly all T&S leaders on this list. 20+ years building cross-industry collaboration.",
  },
  {
    id: "julie-cordua",
    name: "Julie Cordua",
    fundOrCompany: "Thorn",
    role: "CEO",
    category: "nonprofit-leader",
    type: "angel",
    checkSizeRange: "$15K-$25K",
    stagePreference: "Strategic",
    contact: {
      linkedin: "https://www.linkedin.com/in/juliecordua/",
      twitter: "@juliecordua",
    },
    thesisAlignment: "perfect",
    thesisNote: "Leads the leading child safety tech nonprofit. Thorn's Safer product detects CSAM. Complementary to Phosra. Technology-first approach.",
    coppaInterest: "public-stance",
    fundSignal: "unknown",
    introPaths: [
      { type: "industry-association", description: "Thorn board, Technology Coalition", strength: 3 },
    ],
    tier: 1,
    approachStrategy: {
      recommended: "Position as complementary to Thorn's CSAM detection — focus on regulatory compliance layer",
      steps: [
        "Reference Thorn's mission alignment — both use technology to protect children online",
        "Differentiate clearly: Thorn does CSAM detection, Phosra does regulatory compliance — complementary",
        "Reach out via LinkedIn or through Thorn's partnership channels",
        "Propose integration where Phosra's compliance rules reference Thorn's detection",
      ],
      openingAngle: "Thorn detects exploitation content, Phosra enforces the regulatory framework — together they create end-to-end child safety compliance.",
    },
    status: "identified",
    notes: "Complementary product (CSAM detection feeds into Phosra's compliance rules). 17K+ child victims identified.",
  },
  {
    id: "sean-litton",
    name: "Sean Litton",
    fundOrCompany: "Technology Coalition",
    role: "Executive Director",
    category: "nonprofit-leader",
    type: "angel",
    checkSizeRange: "$10K-$25K",
    stagePreference: "Strategic",
    contact: {
      linkedin: "https://www.linkedin.com/in/seanlitton/",
      twitter: "@SeanLitton",
    },
    thesisAlignment: "good",
    thesisNote: "Leads 59-member coalition of companies committed to child safety. Phosra directly supports member compliance needs.",
    coppaInterest: "public-stance",
    fundSignal: "unknown",
    introPaths: [
      { type: "industry-association", description: "Technology Coalition events, TrustCon", strength: 3 },
    ],
    tier: 2,
    approachStrategy: {
      recommended: "Position Phosra as compliance tool for the Technology Coalition's 59 member companies",
      steps: [
        "Reference his International Justice Mission background — deep child protection understanding",
        "Position as infrastructure helping Tech Coalition members meet compliance obligations",
        "Reach out via LinkedIn referencing the Voluntary Framework and how Phosra maps to it",
        "Propose presenting at a Tech Coalition member event",
      ],
      openingAngle: "The Tech Coalition unites 59 companies to protect children — Phosra gives those members automated compliance infrastructure for the 67+ child safety laws they need to track and enforce.",
    },
    status: "identified",
    notes: "Distribution channel for Phosra. Connector to 59 member companies.",
  },
  {
    id: "michelle-delaune",
    name: "Michelle DeLaune",
    fundOrCompany: "NCMEC",
    role: "President & CEO",
    category: "nonprofit-leader",
    type: "angel",
    checkSizeRange: "$10K-$25K",
    stagePreference: "Strategic",
    contact: {
      linkedin: "https://www.linkedin.com/in/michelle-delaune-b4494ba/",
      twitter: "@NCMEC_CEO",
    },
    thesisAlignment: "good",
    thesisNote: "Leads the national clearinghouse for missing/exploited children. Knows which platforms are and aren't compliant.",
    coppaInterest: "public-stance",
    fundSignal: "unknown",
    introPaths: [
      { type: "industry-association", description: "Technology Coalition, NCMEC board, Congressional allies", strength: 2 },
    ],
    tier: 2,
    approachStrategy: {
      recommended: "Formal institutional approach — NCMEC is quasi-governmental",
      steps: [
        "Approach via official NCMEC partnership channels — formal processes",
        "Position as complementary infrastructure ensuring platforms comply with NCMEC reporting requirements",
        "Reference CyberTipline integration and how Phosra helps platforms meet reporting obligations",
        "Request meeting through mutual child safety policy connections",
      ],
      openingAngle: "NCMEC receives CyberTipline reports from platforms — Phosra ensures those platforms are fully compliant with the regulatory framework mandating reporting, closing compliance gaps.",
    },
    status: "identified",
    notes: "Credibility signal. Less likely to write large checks (nonprofit salary).",
  },
]

// ─── Strategic Angels: RegTech Founders (6 targets) ───────────────────────────

const REGTECH_FOUNDERS: WarmIntroTarget[] = [
  {
    id: "dimitri-sirota",
    name: "Dimitri Sirota",
    fundOrCompany: "BigID",
    role: "CEO & Co-Founder",
    category: "regtech-founder",
    type: "angel",
    checkSizeRange: "$25K-$75K",
    stagePreference: "Seed",
    contact: {
      linkedin: "https://www.linkedin.com/in/dimitrisirota/",
      twitter: "@dimitrisirota",
    },
    thesisAlignment: "perfect",
    thesisNote: "Serial entrepreneur ($200M exit pre-BigID). Active angel in 9 startups (Snyk, Protect AI). BigID ($1.25B) does data privacy discovery. Complementary.",
    coppaInterest: "portfolio-signal",
    fundSignal: "unknown",
    introPaths: [
      { type: "industry-association", description: "IAPP conferences, NYC privacy tech community, Boldstart Ventures network", strength: 2 },
    ],
    tier: 1,
    approachStrategy: {
      recommended: "Angel investment pitch — he's active in security/privacy startups (Snyk, Protect AI)",
      steps: [
        "Lead with his angel investor hat — invested in ~6-9 companies including Snyk and Protect AI",
        "Position Phosra as adjacent to BigID's data privacy but focused on child safety compliance",
        "Reach out via LinkedIn DM or Twitter referencing his angel portfolio",
        "Offer strategic value: BigID handles privacy broadly, Phosra handles child safety specifically",
      ],
      openingAngle: "You built BigID to solve enterprise data privacy — Phosra solves the child safety compliance gap that BigID doesn't cover. As an angel in Snyk and Protect AI, you know the security-compliance intersection.",
    },
    status: "identified",
    notes: "Active angel. Understands compliance market. Strategic partner potential. Named Entrepreneur of Year.",
  },
  {
    id: "rehan-jalil",
    name: "Rehan Jalil",
    fundOrCompany: "Securiti AI / Veeam",
    role: "Former CEO (3 exits: $180M, $4.7B, $1.73B), now Veeam President",
    category: "regtech-founder",
    type: "angel",
    checkSizeRange: "$50K-$100K",
    stagePreference: "Seed",
    contact: {
      linkedin: "https://www.linkedin.com/in/rehanjalil/",
      twitter: "@R_Jalil",
    },
    thesisAlignment: "perfect",
    thesisNote: "Three massive exits. Venture Advisor at Mayfield Fund. Mentors Silicon Valley startups. Deeply understands compliance.",
    coppaInterest: "public-stance",
    fundSignal: "unknown",
    introPaths: [
      { type: "industry-association", description: "Mayfield Fund, IAPP, Silicon Valley tech community", strength: 2 },
    ],
    tier: 1,
    approachStrategy: {
      recommended: "Angel/advisor pitch — leverage serial founder credibility and Mayfield Fund advisor role",
      steps: [
        "Reference his 3 exits ($4.7B Elastica, Securiti AI to Veeam) — deep compliance/security expertise",
        "Position as angel opportunity — Venture Advisor at Mayfield Fund, mentors startups",
        "Reach out via LinkedIn referencing Securiti AI's privacy automation parallel",
        "Ask for advisory role given expertise in building compliance automation companies",
      ],
      openingAngle: "You built Securiti AI to automate privacy compliance and sold it to Veeam — Phosra applies the same automation-first approach to the exploding child safety compliance space.",
    },
    status: "identified",
    notes: "Massive exits ($6.6B+ total). Active mentor/advisor. Compliance market expertise.",
  },
  {
    id: "kabir-barday",
    name: "Kabir Barday",
    fundOrCompany: "OneTrust",
    role: "Founder & CEO ($4.5B valuation)",
    category: "regtech-founder",
    type: "angel",
    checkSizeRange: "$50K-$100K",
    stagePreference: "Seed",
    contact: {
      linkedin: "https://www.linkedin.com/in/kbarday",
      twitter: "@kbarday",
    },
    thesisAlignment: "perfect",
    thesisNote: "Founded the dominant privacy compliance platform. Active angel. TiE Atlanta charter. Understands compliance tooling market better than anyone.",
    coppaInterest: "portfolio-signal",
    fundSignal: "unknown",
    introPaths: [
      { type: "industry-association", description: "TiE Atlanta, Insight Partners network, IAPP", strength: 2 },
    ],
    tier: 1,
    approachStrategy: {
      recommended: "Angel investment pitch via TiE Atlanta or Aspen Institute Henry Crown Fellows network",
      steps: [
        "Approach through TiE Atlanta (charter member) or Aspen Institute Henry Crown Fellows network",
        "Position Phosra as solving the child safety compliance gap OneTrust doesn't cover",
        "Reference his EY Entrepreneur of the Year win and Aspen Fellows status — social impact orientation",
        "Propose meeting at a TiE Atlanta event or through Atlanta tech/privacy connections",
      ],
      openingAngle: "OneTrust built the $4.5B privacy compliance platform — but child safety compliance is a distinct, fast-growing regulatory wave. Phosra is the OneTrust for child safety.",
    },
    status: "identified",
    notes: "THE compliance tech founder. Strategic investor/acquirer potential. Named National Entrepreneur of Year.",
  },
  {
    id: "chris-babel",
    name: "Chris Babel",
    fundOrCompany: "TrustArc (acquired Oct 2025)",
    role: "Former CEO (15+ years)",
    category: "regtech-founder",
    type: "angel",
    checkSizeRange: "$25K-$50K",
    stagePreference: "Seed",
    contact: {
      linkedin: "https://www.linkedin.com/in/chrisbabel/",
    },
    thesisAlignment: "perfect",
    thesisNote: "Led TrustArc (ex-TRUSTe) through transformation. Fresh exit to Main Capital Partners Oct 2025. Has capital and time.",
    coppaInterest: "portfolio-signal",
    fundSignal: "unknown",
    introPaths: [
      { type: "industry-association", description: "IAPP, Silicon Valley privacy community", strength: 2 },
    ],
    tier: 2,
    approachStrategy: {
      recommended: "Angel/advisor pitch — fresh exit from TrustArc (Oct 2025), likely has capital and time",
      steps: [
        "Reference his 15+ year tenure building TrustArc — deep compliance market understanding",
        "Position as angel opportunity post-exit — fresh capital and bandwidth",
        "Reach out via LinkedIn emphasizing TrustArc/Phosra parallels",
        "Offer advisory board seat — operational expertise scaling compliance platform",
      ],
      openingAngle: "You spent 15+ years building TrustArc into a privacy compliance leader — child safety compliance is the next wave with 67+ laws globally. Your operational playbook is exactly what we need.",
    },
    status: "identified",
    notes: "Fresh exit = available capital. 15+ years of compliance market knowledge.",
  },
  {
    id: "cillian-kieran",
    name: "Cillian Kieran",
    fundOrCompany: "Ethyca",
    role: "Founder & CEO",
    category: "regtech-founder",
    type: "angel",
    checkSizeRange: "$15K-$25K",
    stagePreference: "Seed",
    contact: {
      linkedin: "https://www.linkedin.com/in/cilliankieran/",
      twitter: "@cillian",
    },
    thesisAlignment: "good",
    thesisNote: "Serial entrepreneur. Built Ethyca as privacy engineering platform. Open-source privacy tooling (Fides). Developer-first compliance.",
    coppaInterest: "portfolio-signal",
    fundSignal: "unknown",
    introPaths: [
      { type: "industry-association", description: "NYC privacy tech, IA Ventures/Founder Collective, Irish tech diaspora", strength: 2 },
    ],
    tier: 2,
    approachStrategy: {
      recommended: "Developer-tools founder to founder — leverage open-source privacy community connection",
      steps: [
        "Engage with his Fides open-source project and Ethyca content on LinkedIn",
        "Position Phosra's MCP enforcement snippets as analogous to Fides's privacy-as-code approach",
        "Reach out via LinkedIn or Twitter referencing open-source privacy tooling angle",
        "Propose collaboration where Fides handles privacy taxonomy and Phosra handles child safety enforcement",
      ],
      openingAngle: "You built Fides to make privacy-as-code the default — Phosra applies the same developer-first philosophy to child safety compliance with auto-generated MCP enforcement snippets.",
    },
    status: "identified",
    notes: "Strong domain expertise. Developer-first perspective matches Phosra's API approach.",
  },
  {
    id: "julian-corbett",
    name: "Julian Corbett",
    fundOrCompany: "k-ID / OpenAge",
    role: "Co-Founder",
    category: "regtech-founder",
    type: "angel",
    checkSizeRange: "$15K-$25K",
    stagePreference: "Strategic",
    contact: {
      linkedin: "https://www.linkedin.com/in/juliancorbett/",
      twitter: "@JulianCorbett",
    },
    thesisAlignment: "good",
    thesisNote: "Built the age verification system Meta adopted (AgeKey, Dec 2025). Supervisory board includes Baroness Shields.",
    coppaInterest: "public-stance",
    fundSignal: "unknown",
    introPaths: [
      { type: "industry-association", description: "Baroness Shields connection, Meta safety team", strength: 3 },
    ],
    tier: 2,
    approachStrategy: {
      recommended: "Partnership/strategic ally — k-ID's age verification + Phosra's compliance enforcement are complementary",
      steps: [
        "Reference AgeKey adoption by Meta — he's at center of age assurance movement",
        "Position as complementary: k-ID handles age verification, Phosra handles broader compliance enforcement",
        "Reach out via LinkedIn referencing OpenAge initiative and Phosra's law registry coverage",
        "Propose integration where Phosra's compliance rules reference AgeKey/OpenAge",
      ],
      openingAngle: "k-ID built AgeKey and OpenAge to solve age verification — Phosra covers the full regulatory compliance framework that mandates it. Together: your age assurance layer plus our enforcement infrastructure.",
    },
    status: "identified",
    notes: "Complementary product (age verification feeds into Phosra's compliance rules). k-ID's Meta partnership is validation.",
  },
]

// ─── Angel Syndicates (6 targets) ─────────────────────────────────────────────

const SYNDICATES: WarmIntroTarget[] = [
  {
    id: "hbs-angels",
    name: "HBS Alumni Angels",
    fundOrCompany: "HBS Alumni Angels (14 chapters)",
    role: "Angel Syndicate",
    category: "angel-syndicate",
    type: "syndicate",
    checkSizeRange: "$100K-$250K",
    stagePreference: "Pre-seed to Seed",
    contact: {
      linkedin: "https://www.linkedin.com/company/hbsnyangels",
      email: "angels@hbscny.org",
      website: "https://www.hbsangelsny.com/",
    },
    thesisAlignment: "good",
    thesisNote: "Global network, $3M+/year from NY chapter alone. $31M+ invested. 14 chapters means one deal reaches all.",
    coppaInterest: "none",
    fundSignal: "active",
    introPaths: [
      { type: "alumni-network", description: "HBS alumni connections", strength: 2 },
      { type: "cold-application", description: "Apply through local chapter", strength: 2 },
    ],
    tier: 1,
    approachStrategy: {
      recommended: "Apply via Gust to the NY chapter ($3M+/year) — also target Northern California chapter",
      steps: [
        "Submit application via NY chapter at hbsangelsny.com",
        "Identify HBS alumni in network for warm intro to screening committee",
        "Prepare for in-person CEO pitch — ~5 companies selected per month",
        "Also apply to Northern California chapter and other relevant chapters",
      ],
      openingAngle: "RegTech/child safety compliance platform with 67+ laws tracked, addressing a $2B+ market as global child safety regulation explodes.",
    },
    status: "identified",
    notes: "Large check sizes. Syndication multiplier. Prestige signal on cap table.",
  },
  {
    id: "pipeline-angels",
    name: "Pipeline Angels",
    fundOrCompany: "Pipeline Angels",
    role: "Impact Angel Syndicate",
    category: "angel-syndicate",
    type: "syndicate",
    checkSizeRange: "$25K-$50K",
    stagePreference: "Seed",
    contact: {
      linkedin: "https://www.linkedin.com/company/pipeline-angels",
      website: "https://www.pipelineangels.org/",
    },
    thesisAlignment: "good",
    thesisNote: "Impact-focused. 500+ members. Child safety has massive social impact angle.",
    coppaInterest: "none",
    fundSignal: "active",
    introPaths: [
      { type: "cold-application", description: "Apply for Pitch Summit", strength: 2 },
    ],
    tier: 2,
    approachStrategy: {
      recommended: "Apply for pitch summit — emphasize social impact angle",
      steps: [
        "Apply for next Pipeline Angels Pitch Summit via pipelineangels.org",
        "Emphasize social impact dimension — protecting children online aligns with mission-driven investing",
        "Highlight diversity and inclusion aspects",
        "Connect with Pipeline Angels members on LinkedIn",
      ],
      openingAngle: "Phosra protects children online by giving platforms compliance infrastructure for 67+ child safety laws — a social impact technology company.",
    },
    status: "identified",
    notes: "Impact narrative fits. Not sector-specific but child safety aligns with mission.",
  },
  {
    id: "gaingels",
    name: "Gaingels",
    fundOrCompany: "Gaingels",
    role: "Diversity-Focused Syndicate",
    category: "angel-syndicate",
    type: "syndicate",
    checkSizeRange: "Varies",
    stagePreference: "Seed to Growth",
    contact: {
      linkedin: "https://www.linkedin.com/company/gaingels",
      website: "https://gaingels.com/",
    },
    thesisAlignment: "adjacent",
    thesisNote: "$900M+ invested across 2,600+ rounds. Diversity & social impact focus.",
    coppaInterest: "none",
    fundSignal: "active",
    introPaths: [
      { type: "cold-application", description: "Apply through gaingels.com", strength: 1 },
    ],
    tier: 2,
    approachStrategy: {
      recommended: "Submit deal for co-investment — emphasize social impact and diversity alignment",
      steps: [
        "Submit deal through Gaingels pipeline — they co-invest with VC leads",
        "Emphasize social impact of child safety compliance — protecting vulnerable populations",
        "Highlight diversity dimensions of founding team and culture",
        "Leverage scout program for introductions to deal team",
      ],
      openingAngle: "Phosra is a child safety compliance platform with $900M+ TAM and strong social impact — protecting children online aligns with Gaingels' mission.",
    },
    status: "identified",
    notes: "Large network. Impact-aligned. Syndicate model means variable check sizes.",
  },
  {
    id: "venture-security",
    name: "Venture in Security (Ross Haleliuk)",
    fundOrCompany: "Venture in Security Angel Syndicate",
    role: "Security Practitioner Syndicate",
    category: "angel-syndicate",
    type: "syndicate",
    checkSizeRange: "$2K-$2.5K minimum per member",
    stagePreference: "Seed",
    contact: {
      linkedin: "https://www.linkedin.com/in/rosshaleliuk/",
      twitter: "@rosshaleliuk",
      website: "https://ventureinsecurity.net/p/angel-syndicate",
    },
    thesisAlignment: "good",
    thesisNote: "Only angel syndicate for security practitioners. Cybersecurity + compliance overlap. Members understand the pain.",
    coppaInterest: "none",
    fundSignal: "active",
    introPaths: [
      { type: "cold-application", description: "Apply through ventureinsecurity.net", strength: 2 },
    ],
    tier: 2,
    approachStrategy: {
      recommended: "Direct outreach to Ross — position child safety compliance as adjacent to cybersecurity",
      steps: [
        "Engage with Ross's Venture in Security Substack content on compliance automation",
        "Reach out via LinkedIn DM positioning Phosra at intersection of security and compliance",
        "Frame child safety compliance as next frontier of platform security",
        "Apply for deal flow — minimum $2K-2.5K per deal, security practitioner focused",
      ],
      openingAngle: "Child safety compliance is the next wave of platform security regulation — 67+ laws globally. Phosra automates enforcement the way security tools automate threat detection.",
    },
    status: "identified",
    notes: "Niche but perfect domain fit. Small individual checks but strong signal + network.",
  },
  {
    id: "esac",
    name: "European Super Angels Club (ESAC)",
    fundOrCompany: "ESAC",
    role: "Pan-European Angel Network",
    category: "angel-syndicate",
    type: "syndicate",
    checkSizeRange: "Varies",
    stagePreference: "Seed",
    contact: {
      linkedin: "https://www.linkedin.com/company/europeansuperangels",
      website: "https://superangels.club/for-founders/",
    },
    thesisAlignment: "good",
    thesisNote: "Pan-European network with family offices. Explicit RegTech thesis (invested in Blockpit, 360kompany). President calls RegTech a 'painkiller.'",
    coppaInterest: "portfolio-signal",
    fundSignal: "active",
    introPaths: [
      { type: "cold-application", description: "ESAC application", strength: 1 },
    ],
    tier: 2,
    approachStrategy: {
      recommended: "Submit via founders page — ESAC has explicit RegTech thesis and guarantees feedback",
      steps: [
        "Submit pitch via superangels.club/for-founders/ — they guarantee feedback on every submission",
        "Emphasize RegTech positioning — ESAC invested in Blockpit, 360kompany",
        "Highlight European regulatory angle — EU DSA, UK AADC are in Phosra's registry",
        "Get Club Member referral if possible to waive listing fee",
      ],
      openingAngle: "Phosra is a RegTech platform covering 67+ global child safety laws including EU DSA and UK AADC — exactly the regulatory technology category ESAC has invested in.",
    },
    status: "identified",
    notes: "Strong if pursuing EU expansion narrative. Explicit RegTech investment thesis.",
  },
  {
    id: "stanford-angels",
    name: "Stanford Angels & Entrepreneurs",
    fundOrCompany: "Stanford Angels",
    role: "Alumni Angel Group",
    category: "angel-syndicate",
    type: "syndicate",
    checkSizeRange: "$50K-$150K",
    stagePreference: "Seed",
    contact: {
      linkedin: "https://www.linkedin.com/company/stanford-angels-entrepreneurs",
      email: "submission@stanfordaande.com",
      website: "https://stanfordaande.com/",
    },
    thesisAlignment: "adjacent",
    thesisNote: "Jim Steyer (Common Sense Media) is Stanford faculty. Silicon Valley proximity. Joint events with HBS Angels.",
    coppaInterest: "none",
    fundSignal: "active",
    introPaths: [
      { type: "alumni-network", description: "Stanford alumni network", strength: 2 },
    ],
    tier: 2,
    approachStrategy: {
      recommended: "Apply via Silicon Valley chapter + Stanford United — leverage Stanford connections",
      steps: [
        "Submit pitch deck to submission@stanfordaande.com for Silicon Valley chapter",
        "Also apply via Stanford Angels United at stanfordangels.us",
        "Leverage any Stanford alumni connections for warm introductions",
        "Jim Steyer is Stanford faculty — if that relationship develops, he could be warm intro",
      ],
      openingAngle: "RegTech platform automating child safety compliance for 67+ global laws — addressing a massive regulatory wave. Seeking angel investment from the Stanford ecosystem.",
    },
    status: "identified",
    notes: "Strong if founder has Stanford connections. Joint events with HBS Angels.",
  },
]

const HNW_ANGELS: WarmIntroTarget[] = [
  // ─── Tier 1: Strong thesis alignment ─────────────────────────────────────────

  {
    id: "naval-ravikant",
    name: "Naval Ravikant",
    fundOrCompany: "AngelList / Personal",
    role: "Co-Founder & Chairman, AngelList",
    website: "https://nav.al",
    category: "hnw-angel",
    type: "angel",
    checkSizeRange: "$50K-$500K",
    stagePreference: "Seed",
    contact: {
      linkedin: "https://www.linkedin.com/in/navalr",
      twitter: "@naval",
    },
    thesisAlignment: "good",
    thesisNote:
      "Naval backs API-first infrastructure companies (invested in Plaid, Clearbit, etc.). Phosra's 'Plaid of child safety' positioning maps directly to his API-layer thesis. His syndicate on AngelList could multiply the allocation.",
    coppaInterest: "none",
    fundSignal: "active",
    introPaths: [
      {
        type: "cold-application",
        description: "Apply through AngelList syndicate — Naval still reviews deal flow",
        strength: 1,
      },
      {
        type: "content-warmup",
        description: "Engage with Naval's Twitter/podcast content on infrastructure plays; DM with concise pitch framing Phosra as compliance infrastructure",
        strength: 2,
      },
    ],
    tier: 2,
    approachStrategy: {
      recommended: "Position as API infrastructure play, not child safety charity",
      steps: [
        "Frame pitch as 'Plaid for compliance' — Naval loves infrastructure-layer bets",
        "Apply through AngelList syndicate with crisp 1-pager",
        "Reference regulatory tailwind: 67+ laws = massive TAM for compliance API",
        "Emphasize Jake's 3 exits and Mastercard infrastructure background",
      ],
      openingAngle:
        "Every platform serving users under 18 needs a compliance API. 67 child safety laws, 45 rule categories, zero unified standard — until now.",
    },
    status: "identified",
    notes:
      "376 investments total; most recent was Quanta (Dec 2025). Check size sweet spot ~$100K-$500K. Co-founded Airchat in 2023. Primarily backs SF/NY companies. Responds to concise, infrastructure-focused pitches.",
  },

  {
    id: "esther-dyson",
    name: "Esther Dyson",
    fundOrCompany: "EDventure Holdings / Personal",
    role: "Angel Investor; Founder, Way to Wellville",
    website: "https://www.edventure.com",
    category: "hnw-angel",
    type: "angel",
    checkSizeRange: "$25K-$100K",
    stagePreference: "Seed",
    contact: {
      linkedin: "https://www.linkedin.com/in/edyson/",
      twitter: "@edyson",
    },
    thesisAlignment: "perfect",
    thesisNote:
      "Esther is one of the original internet governance and digital privacy thought leaders. Board chair of The Commons Project (digital trust infrastructure) and Avanlee Care (family care tech). Her career focus on digital rights, health tech, and open government perfectly aligns with Phosra's child safety compliance mission.",
    coppaInterest: "public-stance",
    fundSignal: "active",
    introPaths: [
      {
        type: "conference-event",
        description: "Esther is a regular at digital rights, privacy, and internet governance conferences",
        strength: 2,
      },
      {
        type: "industry-association",
        description: "Through digital privacy / internet governance communities — she's deeply networked in this space",
        strength: 3,
      },
    ],
    tier: 1,
    approachStrategy: {
      recommended: "Lead with digital rights and child protection mission alignment",
      steps: [
        "Reference her decades of work on internet governance and digital privacy",
        "Connect Phosra to The Commons Project's digital trust infrastructure mission",
        "Frame compliance API as the technical layer that makes digital rights enforceable",
        "Approach through digital rights conference circuit or direct email",
      ],
      openingAngle:
        "You've spent decades fighting for digital rights. We built the enforcement layer — a compliance API that turns 67 child safety laws into programmable rules platforms can actually implement.",
    },
    status: "identified",
    notes:
      "195 investments over career. Pioneer of internet governance and digital privacy. Board chair: Avanlee Care, The Commons Project. Investments span health care, open government, digital technology. RELease 1.0 newsletter was foundational in tech. Smaller check sizes but massive credibility signal.",
  },

  {
    id: "jason-calacanis",
    name: "Jason Calacanis",
    fundOrCompany: "LAUNCH / The Syndicate",
    role: "Founder & CEO, LAUNCH",
    website: "https://www.launch.co",
    category: "hnw-angel",
    type: "angel",
    checkSizeRange: "$25K-$100K",
    stagePreference: "Pre-seed to Seed",
    contact: {
      linkedin: "https://www.linkedin.com/in/jasoncalacanis/",
      twitter: "@Jason",
    },
    thesisAlignment: "good",
    thesisNote:
      "Calacanis invests in ~100 startups/year through LAUNCH and is one of the most prolific pre-seed angels. He's vocal about tech regulation and child safety on his podcast. LAUNCH accelerator gives deal flow visibility. His $25-100K checks are perfect for Phosra's round size.",
    coppaInterest: "portfolio-signal",
    fundSignal: "deploying",
    introPaths: [
      {
        type: "cold-application",
        description: "Apply at launch.co/apply — Jason's team reviews every application; strong conversion for infrastructure plays",
        strength: 2,
      },
      {
        type: "podcast",
        description: "Pitch for This Week in Startups coverage; regulatory infrastructure is a recurring theme",
        strength: 2,
      },
      {
        type: "conference-event",
        description: "LAUNCH events and demo days — next accelerator cohort accepting applications",
        strength: 2,
      },
    ],
    tier: 1,
    approachStrategy: {
      recommended: "Apply through launch.co/apply with a sharp 2-minute video pitch",
      steps: [
        "Submit application at launch.co/apply with focus on market size ($130B+ regtech spend)",
        "Record concise video pitch emphasizing 3 exits, Mastercard background, 5 kids = personal mission",
        "Frame the regulatory tsunami (67 laws) as the compliance Stripe moment",
        "If accepted, leverage LAUNCH demo day for syndicate allocation",
      ],
      openingAngle:
        "67 child safety laws. Zero unified compliance API. Every platform serving minors needs this — and the regulatory wave is just starting.",
    },
    status: "identified",
    notes:
      "Invests in 100 new startups/year. LAUNCH LA35 cohort demo day held Jan 31, 2026. Typical check $25-100K. Angel University sessions running in 2026. The Syndicate can amplify allocation. Very responsive to cold applications through launch.co.",
  },

  // ─── Tier 2: Good alignment, strong networks ──────────────────────────────────

  {
    id: "balaji-srinivasan",
    name: "Balaji Srinivasan",
    fundOrCompany: "Balaji Fund / Personal",
    role: "Angel Investor; Former CTO, Coinbase",
    website: "https://balajis.com",
    category: "hnw-angel",
    type: "angel",
    checkSizeRange: "$25K-$250K",
    stagePreference: "Pre-seed to Seed",
    contact: {
      linkedin: "https://www.linkedin.com/in/balajissrinivasan/",
      twitter: "@balaborat",
    },
    thesisAlignment: "good",
    thesisNote:
      "Balaji invested in OpenGov (govtech/compliance) and advocates for technology solutions to regulatory problems. His 'Network State' thesis values infrastructure that codifies rules into programmable systems — Phosra literally turns legislation into API calls.",
    coppaInterest: "none",
    fundSignal: "active",
    introPaths: [
      {
        type: "content-warmup",
        description: "Engage on Twitter/Substack with Phosra's approach to codifying legislation as API infrastructure; resonates with his programmable-governance thesis",
        strength: 2,
      },
      {
        type: "cold-application",
        description: "Apply through Balaji Fund on AngelList",
        strength: 1,
      },
    ],
    tier: 2,
    approachStrategy: {
      recommended: "Frame as 'programmable compliance' — legislation-as-code resonates with Network State thesis",
      steps: [
        "Lead with the concept of turning 67 laws into a programmable API layer",
        "Reference his OpenGov investment as prior art for govtech conviction",
        "Position child safety compliance as the first vertical for a broader compliance-as-API platform",
        "Share via Twitter DM or Substack reply with a concise technical pitch",
      ],
      openingAngle:
        "We turned 67 child safety laws into 45 programmable rule categories — legislation-as-code for the compliance layer every platform needs.",
    },
    status: "identified",
    notes:
      "170 investments total. Latest: Reason Robotics (Dec 2025). Former Coinbase CTO, a16z GP. OpenGov investor (govtech). Responds to technically dense, thesis-aligned pitches. Strong Twitter presence.",
  },

  {
    id: "elad-gil",
    name: "Elad Gil",
    fundOrCompany: "Personal / Color Genomics",
    role: "Angel Investor; Author, High Growth Handbook",
    website: "https://eladgil.com",
    category: "hnw-angel",
    type: "angel",
    checkSizeRange: "$50K-$1M",
    stagePreference: "Pre-seed to Series A",
    contact: {
      linkedin: "https://www.linkedin.com/in/eladgil/",
      twitter: "@eaborat",
    },
    thesisAlignment: "good",
    thesisNote:
      "Elad runs one of the largest solo GP funds ever ($1B+) and has an exceptional hit rate (Airbnb, Stripe, Figma). He backs infrastructure companies at seed stage and understands API-first businesses deeply. His SaaS and enterprise infrastructure thesis aligns well with Phosra's compliance API positioning.",
    coppaInterest: "none",
    fundSignal: "deploying",
    introPaths: [
      {
        type: "content-warmup",
        description: "Elad is highly active on Twitter and his blog; engage with infrastructure-layer content before reaching out",
        strength: 2,
      },
      {
        type: "2nd-degree-weak",
        description: "Through YC/startup founder networks — Elad is well-connected in SF founder circles",
        strength: 2,
      },
    ],
    tier: 2,
    approachStrategy: {
      recommended: "Position as infrastructure-layer bet with regulatory moat",
      steps: [
        "Lead with the compliance infrastructure thesis — Elad loves platform plays",
        "Reference Stripe/Plaid parallels: Phosra is the API layer for child safety compliance",
        "Emphasize the regulatory moat: 67 laws = switching cost + complexity barrier",
        "Send cold email to his public contact with a 1-page memo",
      ],
      openingAngle:
        "The compliance API layer for child safety — 67 laws, 45 rule categories, one integration. Think Plaid for regulatory compliance.",
    },
    status: "identified",
    notes:
      "Largest solo GP fund ($1B+ AUM). Latest investment: Decagon (Jan 2026). Former Google VP, Twitter exec. Hit rate includes Airbnb, Stripe, Coinbase, Figma, Notion. Prefers infrastructure and platform companies.",
  },

  {
    id: "ron-conway",
    name: "Ron Conway",
    fundOrCompany: "SV Angel",
    role: "Founder & Managing Partner",
    website: "https://svangel.com",
    category: "hnw-angel",
    type: "angel",
    checkSizeRange: "$50K-$250K",
    stagePreference: "Seed",
    contact: {
      linkedin: "https://www.linkedin.com/in/ronconway/",
      twitter: "@ronconway",
    },
    thesisAlignment: "good",
    thesisNote:
      "Ron Conway is Silicon Valley's most connected angel investor ('Godfather of Silicon Valley'). SV Angel's seed fund (led by Beth Turner) actively deploys into infrastructure plays. His political connections (SF/CA government) and advocacy work make child safety compliance a natural conversation topic.",
    coppaInterest: "portfolio-signal",
    fundSignal: "active",
    introPaths: [
      {
        type: "2nd-degree-weak",
        description: "Through SF startup ecosystem — Ron is one of the most connected investors in Silicon Valley",
        strength: 2,
      },
      {
        type: "attorney-intro",
        description: "Through startup-focused law firms in SF that work with SV Angel portfolio companies",
        strength: 2,
      },
    ],
    tier: 2,
    approachStrategy: {
      recommended: "Get a warm intro through SF startup ecosystem; SV Angel reviews all referred deals",
      steps: [
        "Identify a shared connection in SF startup/tech community for warm intro",
        "Frame pitch around infrastructure + regulatory tailwind — SV Angel loves platform plays",
        "Highlight the OpenAI/Sam Altman connection angle — Conway helped save OpenAI, understands tech-policy intersection",
        "Target Beth Turner (leads seed fund) as primary contact at SV Angel",
      ],
      openingAngle:
        "The 'Plaid of child safety' — a single API for 67 laws and 45 rule categories. Every platform serving minors needs this, and the regulatory wave is accelerating.",
    },
    status: "identified",
    notes:
      "The 'Godfather of Silicon Valley.' SV Angel promoted Beth Turner to lead seed fund. Recent investments: World Labs, Kumo.AI. Raised $330M growth fund. Deeply connected to SF/CA politics. Early backer of Google, Facebook, PayPal.",
  },

  {
    id: "cyan-banister",
    name: "Cyan Banister",
    fundOrCompany: "Long Journey Ventures",
    role: "General Partner",
    website: "https://cyanbanister.com",
    category: "hnw-angel",
    type: "angel",
    checkSizeRange: "$25K-$250K",
    stagePreference: "Pre-seed to Seed",
    contact: {
      linkedin: "https://www.linkedin.com/in/cyanb/",
      twitter: "@cyantist",
    },
    thesisAlignment: "good",
    thesisNote:
      "Cyan is an early-stage investor through Long Journey Ventures (Fund IV closed March 2025). Her portfolio includes Vigil Labs and Barndoor AI (safety/compliance adjacent). Her personal story (grew up homeless, self-taught) resonates with mission-driven founders. Long Journey's early-stage focus and check sizes fit perfectly.",
    coppaInterest: "portfolio-signal",
    fundSignal: "deploying",
    introPaths: [
      {
        type: "content-warmup",
        description: "Cyan is active on Twitter and has appeared on Tim Ferriss Show; engage with her content on early-stage investing",
        strength: 2,
      },
      {
        type: "cold-application",
        description: "Long Journey Ventures accepts inbound — apply through their website",
        strength: 2,
      },
    ],
    tier: 2,
    approachStrategy: {
      recommended: "Apply to Long Journey Ventures; emphasize mission-driven founder with personal stake (5 kids)",
      steps: [
        "Apply through Long Journey Ventures website with focus on founder story",
        "Lead with personal mission angle — Jake has 5 kids, built this out of necessity",
        "Highlight the regulatory infrastructure thesis and Plaid comparison",
        "Reference Vigil Labs / Barndoor AI investments as portfolio pattern",
      ],
      openingAngle:
        "Father of 5, 3 exits, Mastercard infrastructure background — I built the compliance API I wished existed. 67 child safety laws, one integration.",
    },
    status: "identified",
    notes:
      "Long Journey Ventures Fund IV closed March 2025 (actively deploying). Partners: Cyan Banister, Arielle Zuckerberg, Lee Jacobs. Early investor in Uber, SpaceX, DeepMind, Flexport, Affirm. 100+ investments. Featured on Tim Ferriss Show (#780).",
  },

  {
    id: "scott-belsky",
    name: "Scott Belsky",
    fundOrCompany: "Personal",
    role: "Seed Investor; Founder, Behance; Former Adobe CPO",
    website: "https://www.scottbelsky.com",
    category: "hnw-angel",
    type: "angel",
    checkSizeRange: "$25K-$250K",
    stagePreference: "Seed",
    contact: {
      linkedin: "https://www.linkedin.com/in/scottbelsky/",
      twitter: "@scottbelsky",
    },
    thesisAlignment: "good",
    thesisNote:
      "Scott was named to Business Insider's 'Best Early-Stage Investors' in 2025. His 'transformation by interface' thesis means he values companies that turn complexity into elegant developer/user experiences — exactly what Phosra does by abstracting 67 laws into a clean API. Former Benchmark GP gives him strong network.",
    coppaInterest: "none",
    fundSignal: "active",
    introPaths: [
      {
        type: "content-warmup",
        description: "Scott is very active on Twitter/LinkedIn about product design and early-stage investing; engage with his content",
        strength: 2,
      },
      {
        type: "conference-event",
        description: "Speaks regularly at design and startup conferences; approach in person",
        strength: 2,
      },
    ],
    tier: 2,
    approachStrategy: {
      recommended: "Frame Phosra through his 'transformation by interface' lens",
      steps: [
        "Lead with the interface/DX angle: turning 67 complex laws into a beautiful API",
        "Reference his portfolio pattern (Airtable, Ramp) — complex problems, elegant solutions",
        "Emphasize the developer experience and API design",
        "Apply through his website or reach via Twitter/LinkedIn DM",
      ],
      openingAngle:
        "67 child safety laws, 45 rule categories — a nightmare of regulatory complexity. We turned it into one clean API integration. Transformation by interface.",
    },
    status: "identified",
    notes:
      "155 investments. Latest: Extend AI (Jun 2025). Named to BI 'Best Early-Stage Investors' 2025. Founded Behance (acquired by Adobe). Former Benchmark GP. Seed investments: Airtable, Pinterest, Ramp, Uber, Warby Parker. NYC-based.",
  },

  {
    id: "jyoti-bansal",
    name: "Jyoti Bansal",
    fundOrCompany: "Unusual Ventures / Personal",
    role: "Co-Founder, Unusual Ventures; Founder, AppDynamics",
    website: "https://www.unusual.vc",
    category: "hnw-angel",
    type: "angel",
    checkSizeRange: "$50K-$250K",
    stagePreference: "Seed to Series A",
    contact: {
      linkedin: "https://www.linkedin.com/in/jyotibansal",
    },
    thesisAlignment: "good",
    thesisNote:
      "Jyoti built AppDynamics (acquired by Cisco for $3.7B) and now runs Unusual Ventures ($600M AUM). His Harness + Traceable merger (2025) shows deep understanding of compliance and security infrastructure. Traceable specifically focused on API security — directly adjacent to Phosra's API compliance layer.",
    coppaInterest: "portfolio-signal",
    fundSignal: "deploying",
    introPaths: [
      {
        type: "cold-application",
        description: "Apply to Unusual Ventures — they actively invest at seed stage",
        strength: 2,
      },
      {
        type: "industry-association",
        description: "Through enterprise infrastructure / API security communities",
        strength: 2,
      },
    ],
    tier: 2,
    approachStrategy: {
      recommended: "Lead with API infrastructure and compliance automation parallels to his own companies",
      steps: [
        "Reference Harness + Traceable merger as proof he understands compliance infrastructure",
        "Frame Phosra as the compliance equivalent of what AppDynamics did for performance monitoring",
        "Emphasize the API-first architecture and enterprise scalability",
        "Apply through Unusual Ventures with a technical architecture overview",
      ],
      openingAngle:
        "AppDynamics automated performance monitoring. Harness automated DevOps. Phosra automates child safety compliance — same infrastructure-layer thesis, massive regulatory tailwind.",
    },
    status: "identified",
    notes:
      "AppDynamics sold to Cisco for $3.7B. Unusual Ventures has $600M AUM. Merged Harness + Traceable in 2025 ($5B valuation, $250M revenue). H-1B to billionaire story. Deep infrastructure DNA. SF-based.",
  },

  {
    id: "gil-elbaz",
    name: "Gil Elbaz",
    fundOrCompany: "TenOneTen Ventures / Personal",
    role: "Co-Founder, TenOneTen Ventures; Founder, Factual & Applied Semantics",
    website: "https://www.tenonetenventures.com",
    category: "hnw-angel",
    type: "angel",
    checkSizeRange: "$100K-$500K",
    stagePreference: "Pre-seed to Seed",
    contact: {
      linkedin: "https://www.linkedin.com/in/gilelbaz/",
    },
    thesisAlignment: "good",
    thesisNote:
      "Gil co-created the technology behind Google AdSense and founded Factual (structured data infrastructure). His career obsession is organizing and structuring the world's data — Phosra structures the world's child safety legislation into a programmable API. His data-infrastructure thesis is a direct match.",
    coppaInterest: "none",
    fundSignal: "active",
    introPaths: [
      {
        type: "industry-association",
        description: "Through LA tech community and data infrastructure circles",
        strength: 2,
      },
      {
        type: "content-warmup",
        description: "Gil writes on Medium about data quality and structured information; engage before pitching",
        strength: 2,
      },
    ],
    tier: 2,
    approachStrategy: {
      recommended: "Frame Phosra as structured data infrastructure for compliance",
      steps: [
        "Lead with the data structuring angle: 67 laws, 500+ provisions, structured into 45 rule categories",
        "Reference his Factual vision of structuring world data — Phosra does this for legislation",
        "Emphasize the semantic layer: laws parsed into machine-readable enforcement rules",
        "Approach through TenOneTen Ventures or LA tech community",
      ],
      openingAngle:
        "You structured the world's data with Factual. We're structuring the world's child safety legislation — 67 laws into 45 programmable rule categories, delivered as an API.",
    },
    status: "identified",
    notes:
      "Co-created Google AdSense technology. Founded Factual (structured data) and Applied Semantics. TenOneTen Ventures co-founder. Notable investments: Climate Corporation (sold to Monsanto $1.2B), GoodReads (Amazon), Kaggle. LA-based. Focus on data infrastructure.",
  },

  // ─── Tier 3: Adjacent alignment, worth pursuing ───────────────────────────────

  {
    id: "david-sacks",
    name: "David Sacks",
    fundOrCompany: "Craft Ventures",
    role: "Co-Founder & General Partner, Craft Ventures",
    website: "https://www.craftventures.com",
    category: "hnw-angel",
    type: "angel",
    checkSizeRange: "$100K-$500K",
    stagePreference: "Seed to Series A",
    contact: {
      linkedin: "https://www.linkedin.com/in/davidoliversacks/",
      twitter: "@DavidSacks",
    },
    thesisAlignment: "adjacent",
    thesisNote:
      "Sacks' Craft Ventures led $42M Series A in Starbridge (AI govtech with compliance focus). He's currently serving as White House AI & Crypto Czar, giving him direct exposure to tech regulation. However, his government role may limit new personal investments and his focus is primarily AI/crypto — making alignment adjacent rather than strong.",
    coppaInterest: "portfolio-signal",
    fundSignal: "unknown",
    introPaths: [
      {
        type: "2nd-degree-weak",
        description: "Through PayPal mafia network — Sacks is deeply connected to Levchin, Thiel, Musk circles",
        strength: 2,
      },
      {
        type: "content-warmup",
        description: "Sacks hosts All-In Podcast; pitch through that ecosystem",
        strength: 1,
      },
    ],
    tier: 3,
    approachStrategy: {
      recommended: "Approach after government role ends; reference Starbridge govtech investment",
      steps: [
        "Monitor when Sacks returns to full-time investing (government role may limit activity)",
        "Reference Craft's Starbridge investment as precedent for compliance-focused govtech",
        "Frame through All-In Podcast lens — regulatory compliance as next big infrastructure layer",
        "Approach Craft Ventures team even if David is personally occupied with government role",
      ],
      openingAngle:
        "Craft backed Starbridge for AI govtech compliance. Phosra is the compliance API layer for the $130B child safety regtech market — same thesis, horizontal platform play.",
    },
    status: "identified",
    notes:
      "PayPal co-founder, COO. Craft Ventures co-founder. 80 angel investments (Facebook, Uber, SpaceX, Palantir, Airbnb). Currently White House AI & Crypto Czar (Dec 2024). Craft invested $42M in Starbridge (compliance-focused AI govtech). Government role may limit personal investment activity. All-In Podcast host.",
  },
]
const FAMILY_OFFICES: WarmIntroTarget[] = [
  // ── Tier 1: Strong thesis alignment ──────────────────────────────────────

  {
    id: "emerson-collective",
    name: "Laurene Powell Jobs",
    fundOrCompany: "Emerson Collective",
    role: "Founder & President",
    website: "https://www.emersoncollective.com",
    category: "family-office",
    type: "family-office",
    checkSizeRange: "$100K-$5M",
    stagePreference: "Seed to Series A",
    contact: {
      linkedin: "https://www.linkedin.com/in/laurene-powell-jobs-15929b188/",
      twitter: "@laurenepowell",
    },
    thesisAlignment: "perfect",
    thesisNote:
      "Emerson Collective invests in education, digital health, and AI — all directly relevant to Phosra. Founded College Track and XQ Institute for K-12 reform. Led seed investment in Amplify (edtech). Their LLC structure lets them deploy grants, advocacy, or venture capital — perfect for child safety compliance which spans all three. 200+ investments since 2019.",
    coppaInterest: "portfolio-signal",
    fundSignal: "deploying",
    introPaths: [
      {
        type: "industry-association",
        description:
          "XQ Institute / education policy circles — position Phosra as infrastructure protecting the students Emerson Collective's education investments serve",
        strength: 2,
      },
      {
        type: "content-warmup",
        description:
          "Engage with Emerson Collective's education and AI coverage on The Atlantic (which they own) — pitch op-ed on child safety compliance gap",
        strength: 2,
      },
      {
        type: "conference-event",
        description:
          "Emerson Collective hosts invite-only convenings on education and technology policy",
        strength: 1,
      },
    ],
    tier: 1,
    approachStrategy: {
      recommended:
        "Position Phosra at the intersection of Emerson Collective's education and technology thesis — protecting the children their education portfolio serves",
      steps: [
        "Research Emerson Collective's venture team members on LinkedIn — identify who covers compliance/regtech investments",
        "Draft a pitch op-ed for The Atlantic (Emerson-owned) on the child safety compliance crisis — build awareness before outreach",
        "Reference their Amplify investment and XQ Institute work to show alignment with their education thesis",
        "Request intro through education policy networks — Emerson is deeply embedded in K-12 policy advocacy",
      ],
      openingAngle:
        "Emerson Collective invested in Amplify to transform education and founded XQ to reimagine high school. Phosra is the compliance infrastructure that ensures every platform those students use actually protects them — we map 67+ child safety laws into 45 enforceable rule categories via a single API.",
    },
    status: "identified",
    notes:
      "Emerson Collective is an LLC (not a foundation), giving maximum flexibility for venture investments. Has participated in $1B+ of AI funding rounds. Education is a core pillar. Laurene Powell Jobs has 3 children — personal stake in child safety. Very high profile but actively deploying at seed stage (e.g., Teal Health $10M seed extension in 2025).",
  },

  {
    id: "ballmer-group",
    name: "Connie Ballmer",
    fundOrCompany: "Ballmer Group",
    role: "Co-founder",
    website: "https://ballmergroup.org",
    category: "family-office",
    type: "family-office",
    checkSizeRange: "$100K-$1M",
    stagePreference: "Seed to Series A",
    contact: {
      linkedin: "https://www.linkedin.com/in/connie-ballmer-b8a86519/",
    },
    thesisAlignment: "perfect",
    thesisNote:
      "Ballmer Group's explicit mission is helping children in economically disadvantaged families achieve economic mobility. $1B+ committed to early childhood education in Washington state. Backed Recidiviz (data-driven policy), StriveTogether ($175M for AI-driven edtech equity), and co-launched NextLadder Ventures ($1B+ initiative with Gates Foundation). Children and families are the core thesis — Phosra's child safety compliance maps directly.",
    coppaInterest: "portfolio-signal",
    fundSignal: "deploying",
    introPaths: [
      {
        type: "industry-association",
        description:
          "StriveTogether network — Ballmer Group is the anchor funder; approach through Cradle to Career community",
        strength: 2,
      },
      {
        type: "conference-event",
        description:
          "NextLadder Ventures coalition events — attend or connect through Gates Foundation overlap",
        strength: 2,
      },
      {
        type: "content-warmup",
        description:
          "Reference USAFacts.org (Steve Ballmer's data transparency project) and frame Phosra as bringing similar transparency to child safety regulation",
        strength: 2,
      },
    ],
    tier: 1,
    approachStrategy: {
      recommended:
        "Lead with Ballmer Group's children-and-families mission — Phosra protects the children they're investing in educating",
      steps: [
        "Research Ballmer Group's venture arm leadership — identify the team member covering technology investments",
        "Reference their StriveTogether and NextLadder Ventures work to show you understand their thesis",
        "Frame Phosra as 'USAFacts for child safety regulation' — data-driven compliance transparency that Steve Ballmer's data ethos aligns with",
        "Propose a 15-min call focused on how platforms fail children from disadvantaged communities disproportionately — directly tied to Ballmer's equity thesis",
      ],
      openingAngle:
        "Ballmer Group has committed billions to help children achieve economic mobility. But the platforms those children use daily lack compliance infrastructure — Phosra maps 67+ child safety laws into enforceable API rules, ensuring the digital environments your portfolio serves actually protect kids.",
    },
    status: "identified",
    notes:
      "Steve and Connie Ballmer have 3 sons. $145B net worth. Based in Bellevue, WA. Very active deploying capital in 2025 — $1B+ to NextLadder Ventures, $1B to WA early childhood education. Data-driven approach (USAFacts). Connie is the more engaged philanthropic leader. Ballmer Group is technically a 'philanthropic investment company' but makes venture-style investments.",
  },

  {
    id: "blue-haven",
    name: "Liesel Pritzker Simmons",
    fundOrCompany: "Blue Haven Initiative",
    role: "Co-founder & Managing Partner",
    website: "https://www.bluehaveninitiative.com",
    category: "family-office",
    type: "family-office",
    checkSizeRange: "$50-500K",
    stagePreference: "Seed to Series A",
    contact: {
      linkedin: "https://www.linkedin.com/in/liesel-pritzker-simmons-0714124/",
      twitter: "@lieselsimmons",
    },
    thesisAlignment: "good",
    thesisNote:
      "Blue Haven is one of the first family offices built from scratch for impact investing. Diversified portfolio spanning private equity, venture, public equities, and fixed income — all with impact lens. Focus areas include education technology, financial services, and healthcare. Ian and Liesel Simmons seek market-rate returns plus maximum social/environmental impact. Pritzker family connections open additional doors.",
    coppaInterest: "none",
    fundSignal: "active",
    introPaths: [
      {
        type: "industry-association",
        description:
          "Blue Haven is a member of The GIIN (Global Impact Investing Network) — approach through impact investing conferences and GIIN events",
        strength: 2,
      },
      {
        type: "content-warmup",
        description:
          "Reference Liesel's ImpactAlpha interview on family office impact investing — engage on social media with her thought leadership",
        strength: 2,
      },
      {
        type: "conference-event",
        description:
          "Impact investing conferences (GIIN, Skoll World Forum, SOCAP) where Blue Haven team speaks regularly",
        strength: 2,
      },
    ],
    tier: 2,
    approachStrategy: {
      recommended:
        "Lead with Blue Haven's impact investing thesis — Phosra generates market returns while protecting children, the ultimate impact investing proposition",
      steps: [
        "Research Blue Haven's current portfolio for edtech or regtech adjacencies",
        "Reference Liesel's ImpactAlpha interview on impact investing in challenging times",
        "Frame child safety compliance as an impact investment with strong financial returns — $37B TAM in regulatory compliance",
        "Apply through GIIN network or impact investing events where Blue Haven is visible",
      ],
      openingAngle:
        "Blue Haven pioneered the 100% impact portfolio model. Phosra is the rare investment that delivers both: market-rate VC returns in a $37B compliance market and direct child protection impact. We map 67+ child safety laws so platforms actually enforce them.",
    },
    status: "identified",
    notes:
      "Liesel is a Pritzker family member — potential overlap with Pritzker Group VC. Ian Simmons co-manages. No 2025 investments recorded publicly — may be in a quieter deployment phase. Harvard Business School case study written about their approach. Strong thought leadership in impact investing space.",
  },

  {
    id: "schusterman",
    name: "Stacy Schusterman",
    fundOrCompany: "Schusterman Family Investments",
    role: "Chairman",
    website: "https://www.schusterman.org",
    category: "family-office",
    type: "family-office",
    checkSizeRange: "$100K-$2M",
    stagePreference: "Seed to Series B",
    contact: {
      linkedin: "https://www.linkedin.com/company/schusterman-family-investments/",
    },
    thesisAlignment: "good",
    thesisNote:
      "SFI is the investment arm of the Schusterman family, managing venture/growth investments in technology, healthcare, and energy. The Schusterman Foundation invests heavily in K-12 public education reform and youth development. Founded 2010, headquartered in NYC. Recent investments include Navina (healthtech, March 2025). The education philanthropy creates a natural bridge to child safety compliance.",
    coppaInterest: "portfolio-signal",
    fundSignal: "active",
    introPaths: [
      {
        type: "industry-association",
        description:
          "Schusterman Foundation's education reform network — K-12 education policy circles overlap with child safety advocacy",
        strength: 2,
      },
      {
        type: "linkedin-group",
        description:
          "Schusterman Family Investments LinkedIn page — engage with their content and connect with investment team",
        strength: 1,
      },
      {
        type: "conference-event",
        description:
          "Education reform and Jewish community leadership events where Schusterman is a major funder",
        strength: 2,
      },
    ],
    tier: 1,
    approachStrategy: {
      recommended:
        "Bridge the gap between SFI's tech investment focus and the Schusterman Foundation's education mission — Phosra sits at the intersection",
      steps: [
        "Identify the SFI investment team members covering technology deals on LinkedIn",
        "Reference the Schusterman Foundation's K-12 education investments to show thesis understanding",
        "Position Phosra as protecting the students the Foundation's education programs serve — compliance infrastructure for the digital tools used in classrooms",
        "Apply through their venture pipeline or seek intro via education reform network",
      ],
      openingAngle:
        "The Schusterman Foundation invests in K-12 education reform, and SFI backs high-growth technology companies. Phosra bridges both: we're the compliance API ensuring the educational platforms your students use actually comply with 67+ child safety laws.",
    },
    status: "identified",
    notes:
      "Dual structure: SFI (for-profit investments) + Schusterman Foundation (philanthropic, education focus). NYC headquarters. Technology and healthcare are primary investment sectors. Most recent investment was Navina in March 2025. Good fit given the education-technology crossover, though child safety is not an explicit investment thesis.",
  },

  // ── Tier 2: Good alignment ───────────────────────────────────────────────

  {
    id: "time-ventures",
    name: "Marc Benioff",
    fundOrCompany: "TIME Ventures",
    role: "Founder, Chairman & CEO of Salesforce",
    website: "https://time.com",
    category: "family-office",
    type: "family-office",
    checkSizeRange: "$50-500K",
    stagePreference: "Seed to Series B",
    contact: {
      linkedin: "https://www.linkedin.com/in/marc-benioff-4a5646117/",
      twitter: "@Benioff",
    },
    thesisAlignment: "good",
    thesisNote:
      "TIME Ventures is Benioff's personal investment vehicle — 200+ investments since 2019. Invests in B2B, 'platform thinking' companies that become foundational layers for ecosystems. Benioff and wife Lynne gave $100M to UCSF Children's Hospital and $39M to public schools. Latest investment Oct 2025 (Sumble). The 'Plaid of child safety' positioning maps to his platform-thinking thesis.",
    coppaInterest: "portfolio-signal",
    fundSignal: "deploying",
    introPaths: [
      {
        type: "conference-event",
        description:
          "Salesforce Dreamforce conference — child safety compliance is relevant to the Salesforce ecosystem",
        strength: 2,
      },
      {
        type: "content-warmup",
        description:
          "Engage with Benioff on Twitter/X (very active) around children's hospital philanthropy and platform-building themes",
        strength: 2,
      },
      {
        type: "industry-association",
        description:
          "Salesforce AppExchange ecosystem — position Phosra as infrastructure for the Salesforce platform",
        strength: 2,
      },
    ],
    tier: 1,
    approachStrategy: {
      recommended:
        "Lead with Benioff's 'platform thinking' investment thesis — Phosra is the compliance platform layer for every company handling children's data",
      steps: [
        "Study Benioff's investment pattern — he backs companies that become foundational ecosystem layers (like Wiz for security)",
        "Engage on Twitter/X with his children's hospital and education philanthropy posts — build visibility",
        "Frame Phosra as 'the Salesforce of child safety compliance' — a platform that every company needs, just like CRM",
        "Approach through Salesforce ecosystem events or seek intro through B2B SaaS founder networks",
      ],
      openingAngle:
        "You invest in companies that become foundational layers for ecosystems — Wiz for security, Plaid for fintech. Phosra is that layer for child safety compliance: a single API mapping 67+ laws into 45 enforceable rules. Every platform handling children's data needs this.",
    },
    status: "identified",
    notes:
      "Marc Benioff scored a $600M windfall from Google-Wiz deal in 2025. Active angel investor with 209 investments. Children's hospital philanthropy shows personal commitment to child welfare. Platform-thinking thesis aligns well with Phosra's 'Plaid of child safety' positioning. Very high profile — may be difficult to reach directly but check size is flexible.",
  },

  {
    id: "revolution-case",
    name: "Steve Case",
    fundOrCompany: "Revolution / Rise of the Rest",
    role: "Chairman & CEO",
    website: "https://www.revolution.com",
    category: "family-office",
    type: "family-office",
    checkSizeRange: "$250K-$1M",
    stagePreference: "Seed",
    contact: {
      linkedin: "https://www.linkedin.com/in/stevecase/",
      twitter: "@SteveCase",
    },
    thesisAlignment: "good",
    thesisNote:
      "Revolution's Rise of the Rest Seed Fund specifically backs seed-stage startups outside Silicon Valley, with $300M+ across two funds. Backed by Bezos, Walton family, Sara Blakely, Ray Dalio. Case testified before Congress in March 2025 on entrepreneurship policy. Strong interest in regulated industries and policy-adjacent startups. If Phosra has any operations outside coastal tech hubs, this is a strong fit.",
    coppaInterest: "none",
    fundSignal: "active",
    introPaths: [
      {
        type: "conference-event",
        description:
          "Rise of the Rest bus tours and pitch competitions — apply directly ($500K+ investments on each tour)",
        strength: 3,
      },
      {
        type: "cold-application",
        description:
          "Rise of the Rest accepts direct applications for their seed fund — formal pipeline",
        strength: 3,
      },
      {
        type: "content-warmup",
        description:
          "Engage with Steve Case's policy-oriented content on Twitter/X — he's vocal about regulated industries and entrepreneurship",
        strength: 2,
      },
    ],
    tier: 2,
    approachStrategy: {
      recommended:
        "Apply to Rise of the Rest seed fund directly — they have a formal application process and back startups in regulated industries",
      steps: [
        "Check if Phosra qualifies for Rise of the Rest's geographic focus (outside Silicon Valley / coastal hubs)",
        "Apply through the official Rise of the Rest pipeline — they invest at least $500K per company",
        "Reference Case's March 2025 congressional testimony on entrepreneurship to show awareness of his policy interests",
        "Frame Phosra as a regulated-industry startup that turns regulatory complexity into competitive advantage — mirrors Case's thesis",
      ],
      openingAngle:
        "Rise of the Rest backs seed-stage startups in highly regulated industries. Phosra turns the complexity of 67+ child safety laws into a single API — exactly the kind of regulatory infrastructure play that creates massive economic value in underserved markets.",
    },
    status: "identified",
    notes:
      "AOL co-founder. $300M+ across two Rise of the Rest seed funds. 200+ startups invested across 100+ US cities. Strong policy connections (testified before Congress March 2025). Backed by Bezos, Walton family. Revolution also has Ventures (early-stage) and Growth funds. Geographic focus is key — may be less relevant if Phosra is purely coastal.",
  },

  {
    id: "pritzker-group",
    name: "Tony Pritzker",
    fundOrCompany: "Pritzker Group Venture Capital",
    role: "Managing Partner",
    website: "https://www.pritzkergroup.com",
    category: "family-office",
    type: "family-office",
    checkSizeRange: "$500K-$5M",
    stagePreference: "Seed to Series A",
    contact: {
      linkedin: "https://www.linkedin.com/company/pritzker-group-vc/",
    },
    thesisAlignment: "good",
    thesisNote:
      "Pritzker Group VC writes $500K-$5M checks at seed/Series A. 168 companies invested, 7 unicorns (including Coinbase, Bird, Pluto TV). Looks for experienced founding teams with demonstrated product-market fit. Deep marketplace and platform expertise. The Pritzker Organization also has a separate investment arm. Blue Haven Initiative (Liesel Pritzker Simmons) is a family member's separate fund focused on impact. Jake's 3-exit track record aligns with their experienced-founder preference.",
    coppaInterest: "none",
    fundSignal: "active",
    introPaths: [
      {
        type: "conference-event",
        description:
          "Chicago tech ecosystem events — Pritzker Group is Chicago-based and deeply embedded",
        strength: 2,
      },
      {
        type: "cold-application",
        description:
          "Apply through Pritzker Group's website — they review cold applications from experienced founders",
        strength: 2,
      },
      {
        type: "industry-association",
        description:
          "Pritzker family's broader network — Blue Haven (Liesel) could be a parallel approach",
        strength: 2,
      },
    ],
    tier: 2,
    approachStrategy: {
      recommended:
        "Lead with Jake's 3-exit track record — Pritzker Group explicitly invests in highly experienced founding teams",
      steps: [
        "Research Pritzker Group's current portfolio for compliance/regtech adjacencies",
        "Lead outreach with Jake's founding experience (3 exits, Mastercard infrastructure) — their #1 criterion is experienced founders",
        "Position Phosra as a platform play with marketplace dynamics — PGVC has deep marketplace investing expertise",
        "Apply through their website and simultaneously seek warm intro through Chicago tech or fintech networks",
      ],
      openingAngle:
        "Pritzker Group backs experienced founders building platform businesses. Jake Klinvex has 3 exits and built infrastructure at Mastercard. Phosra is the 'Plaid of child safety' — a platform API that every company needs as 67+ child safety laws create mandatory compliance, with the same network effects you saw in Coinbase and Pluto TV.",
    },
    status: "identified",
    notes:
      "Founded 1996. 168+ portfolio companies. $500K-$1M initial checks at seed, up to $5M. 7 unicorns including Coinbase. Chicago-based. The broader Pritzker family has multiple investment vehicles (Blue Haven, Pritzker Organization). Governor J.B. Pritzker is a family member — political connections could be relevant for regulatory-focused startups.",
  },

  {
    id: "bezos-expeditions",
    name: "Jeff Bezos",
    fundOrCompany: "Bezos Expeditions",
    role: "Founder",
    website: "https://www.bezosexpeditions.com",
    category: "family-office",
    type: "family-office",
    checkSizeRange: "$100K-$10M",
    stagePreference: "Seed to Series A",
    contact: {
      linkedin: "https://www.linkedin.com/in/jeffbezos/",
      twitter: "@JeffBezos",
    },
    thesisAlignment: "adjacent",
    thesisNote:
      "Bezos Expeditions focuses on transformative technology — AI, robotics, biotech. Made 7 investments in 2025. 70% of portfolio in technology. Also backs Rise of the Rest Seed Fund (Steve Case). Day One Fund focuses on homelessness and preschool education. Not a direct child safety thesis, but the Day One Fund's preschool education focus and the scale of AWS's compliance infrastructure (Phosra could be built on AWS) create strategic angles.",
    coppaInterest: "none",
    fundSignal: "deploying",
    introPaths: [
      {
        type: "industry-association",
        description:
          "Day One Fund / preschool education network — Bezos is personally invested in early childhood",
        strength: 1,
      },
      {
        type: "conference-event",
        description:
          "AWS re:Invent or startup events — position as AWS marketplace play for compliance",
        strength: 1,
      },
      {
        type: "cold-application",
        description:
          "Bezos Expeditions is very hard to reach cold — seek intro through Rise of the Rest or AWS Activate",
        strength: 1,
      },
    ],
    tier: 3,
    approachStrategy: {
      recommended:
        "Approach through Day One Fund or Rise of the Rest network rather than Bezos Expeditions directly — those channels are more accessible",
      steps: [
        "Apply to Rise of the Rest (which Bezos backs) — this gets you into the Bezos network indirectly",
        "Position Phosra as infrastructure for AWS — compliance-as-a-service in the AWS marketplace",
        "Reference Day One Fund's preschool education investments to show awareness of Bezos's personal interests",
        "This is a long-shot at seed stage — prioritize other family offices first and revisit at Series A",
      ],
      openingAngle:
        "Your Day One Fund invests in preschool education because you believe every child deserves a great start. Phosra ensures every digital platform those children encounter actually protects them — a single API mapping 67+ child safety laws into enforceable compliance rules.",
    },
    status: "identified",
    notes:
      "Very difficult to access at pre-seed stage. Bezos Expeditions manages Jeff Bezos's personal wealth. Mercer Island, WA based. 7 investments in 2025 (Archetype AI, Arrived). Day One Fund is separate — focuses on preschool education and homelessness. The strategic play is through Rise of the Rest or AWS Marketplace rather than a direct Bezos Expeditions check. Better as a Series A target.",
  },

  {
    id: "tusk-ventures",
    name: "Bradley Tusk",
    fundOrCompany: "Tusk Venture Partners",
    role: "Co-founder & Managing Partner",
    website: "https://www.tuskventurepartners.com",
    category: "family-office",
    type: "family-office",
    checkSizeRange: "$250K-$2M",
    stagePreference: "Pre-seed to Seed",
    contact: {
      linkedin: "https://www.linkedin.com/in/bradleytusk/",
      twitter: "@BradleyTusk",
    },
    thesisAlignment: "perfect",
    thesisNote:
      "Tusk Venture Partners is the world's ONLY VC fund investing solely in early-stage startups in highly regulated industries. They literally turn regulatory complexity into competitive advantage — which is exactly Phosra's value proposition. Portfolio includes Coinbase, Lemonade, FanDuel, Circle, Ro. The fund comes with a built-in political consulting firm (Tusk Strategies) and equity-for-service regulatory shop. Phosra in a highly regulated space + a VC that provides regulatory strategy = perfect match.",
    coppaInterest: "portfolio-signal",
    fundSignal: "active",
    introPaths: [
      {
        type: "cold-application",
        description:
          "Tusk accepts applications from startups in regulated industries — Phosra is a textbook fit",
        strength: 3,
      },
      {
        type: "content-warmup",
        description:
          "Bradley Tusk hosts 'Firewall' podcast and publishes frequently on regulated industries — engage with his content",
        strength: 3,
      },
      {
        type: "industry-association",
        description:
          "Regulatory technology conferences and policy advocacy events where Tusk Strategies is active",
        strength: 2,
      },
    ],
    tier: 1,
    approachStrategy: {
      recommended:
        "Apply directly — Tusk exists to invest in exactly this type of company. Regulated industry + regulatory competitive advantage = their entire thesis",
      steps: [
        "Apply through Tusk Venture Partners' website — make the regulated-industry angle the headline",
        "Listen to Bradley Tusk's 'Firewall' podcast and reference specific episodes in outreach",
        "Emphasize that Phosra's regulatory mapping across 67+ laws creates a defensible moat — Tusk's core thesis is that regulatory complexity = competitive advantage",
        "Highlight that Tusk Strategies (their in-house lobbying arm) could help Phosra shape child safety policy — offer to become a portfolio company that helps write the rules",
      ],
      openingAngle:
        "Tusk Venture Partners invests solely in regulated industries where regulatory complexity creates competitive advantage. Child safety compliance is one of the most complex regulatory landscapes on earth — 67+ laws, 45 rule categories, 50+ jurisdictions. Phosra's single API turns that complexity into our moat. This is exactly what you built your fund to invest in.",
    },
    status: "identified",
    notes:
      "Not technically a family office but a hybrid VC/advisory model uniquely aligned with Phosra. Bradley Tusk was Bloomberg's campaign manager and Uber's first political strategist. 50+ portfolio companies, 12 exits. Coinbase, Lemonade, FanDuel in portfolio. The equity-for-service model means Tusk Strategies provides regulatory/political strategy to portfolio companies. Could be transformative for shaping child safety policy. Founded 2016 by Bradley Tusk and Jordan Nof.",
  },

  {
    id: "obvious-ventures",
    name: "Evan Williams",
    fundOrCompany: "Obvious Ventures",
    role: "Co-founder & General Partner",
    website: "https://obvious.com",
    category: "family-office",
    type: "family-office",
    checkSizeRange: "$5M-$12M",
    stagePreference: "Seed to Series A",
    contact: {
      linkedin: "https://www.linkedin.com/in/evanwilliams/",
      twitter: "@ev",
    },
    thesisAlignment: "good",
    thesisNote:
      "Obvious Ventures invests in 'world positive' companies — purpose-driven entrepreneurs reimagining industries. Three pillars: Planetary Health, Human Health, Economic Health. Twitter co-founder who understands platform safety challenges firsthand. Fund V closed at $360M in January 2026, investing $5-12M in seed/Series A. 'We invest in companies we wish existed in the world' — child safety compliance infrastructure is that kind of company.",
    coppaInterest: "portfolio-signal",
    fundSignal: "deploying",
    introPaths: [
      {
        type: "cold-application",
        description:
          "Obvious Ventures accepts applications — focus on the 'world positive' framing",
        strength: 2,
      },
      {
        type: "content-warmup",
        description:
          "Evan Williams is active on LinkedIn and blogs about purpose-driven investing — engage with his content on social media safety",
        strength: 2,
      },
      {
        type: "conference-event",
        description:
          "SOCAP, Skoll World Forum, and other impact/purpose-driven venture events",
        strength: 2,
      },
    ],
    tier: 2,
    approachStrategy: {
      recommended:
        "Lead with the 'world positive' framing — Phosra is a company that should exist in the world to protect children online",
      steps: [
        "Apply through Obvious Ventures' pipeline with strong 'world positive' positioning",
        "Reference Evan Williams' experience at Twitter — he saw firsthand how platforms struggle with child safety",
        "Frame Phosra under 'Economic Health' pillar — compliance infrastructure that creates economic value while protecting children",
        "Note: Check size ($5-12M) is larger than Phosra's raise — they may not do $950K rounds unless it's a small allocation in a bigger round",
      ],
      openingAngle:
        "You co-founded Twitter and saw platforms struggle with child safety firsthand. Obvious Ventures invests in companies you wish existed — Phosra is exactly that: the compliance infrastructure ensuring every platform protects children across 67+ laws. A company that should exist.",
    },
    status: "identified",
    notes:
      "Check size concern: Obvious writes $5-12M checks, which is much larger than Phosra's $950K raise. May need to position as a small initial allocation or wait for a larger round. However, the 'world positive' thesis alignment is very strong. Fund V ($360M) just closed January 2026 — fresh capital to deploy. Evan Williams co-founded Twitter, Blogger, Medium — deeply understands platform safety challenges. San Francisco based.",
  },
]
const CORPORATE_VCS: WarmIntroTarget[] = [
  {
    id: "mastercard-start-path",
    name: "Johan Gerber",
    fundOrCompany: "Mastercard Start Path — Security Solutions",
    role: "EVP & Head of Security Solutions",
    website: "https://www.mastercard.com/us/en/innovation/partner-with-us/start-path/security-solutions.html",
    category: "corporate-vc",
    type: "cvc",
    checkSizeRange: "Program + strategic investment",
    stagePreference: "Growth-stage startups",
    contact: {
      linkedin: "https://www.linkedin.com/in/johangerber/",
      twitter: "@JohanGerber",
    },
    thesisAlignment: "perfect",
    thesisNote:
      "Mastercard launched a dedicated Start Path Security Solutions track in June 2025 focused on cybersecurity, fraud mitigation, digital identity, and payment resiliency. Jake's Mastercard infrastructure background is a direct network advantage. The program has onboarded 500+ companies from 60+ countries and alumni have raised $25B+ collectively. Security is Mastercard's 'cornerstone of trust' — child safety compliance maps directly to their digital trust thesis.",
    coppaInterest: "portfolio-signal",
    fundSignal: "deploying",
    introPaths: [
      {
        type: "direct-1st-degree",
        description:
          "Jake's Mastercard infrastructure background provides warm intro path; leverage former colleagues and the Start Path application process",
        strength: 5,
      },
      {
        type: "cold-application",
        description:
          "Apply directly to Start Path Security Solutions track — competitive global process with 4-5 startups per cohort",
        strength: 4,
      },
    ],
    tier: 1,
    approachStrategy: {
      recommended:
        "Leverage Jake's Mastercard network for warm intro to Johan Gerber or Start Path team, then apply to Security Solutions track",
      steps: [
        "Map Jake's former Mastercard colleagues who can intro to Start Path or Security Solutions leadership",
        "Apply to Start Path Security Solutions track emphasizing digital identity verification for minors and payment compliance",
        "Position Phosra as infrastructure-layer compliance (similar to Mastercard's infrastructure role in payments)",
        "Highlight COPPA parental consent verification as adjacent to Mastercard's identity verification capabilities",
      ],
      openingAngle:
        "Former Mastercard infrastructure engineer building the compliance infrastructure layer for child safety — the same way Mastercard built trust infrastructure for payments",
    },
    status: "identified",
    notes:
      "STRONGEST LEAD: Jake's Mastercard background is the single best warm intro path in the entire CVC target list. Start Path Security Solutions cohort includes companies like OneID (digital identity), Scamnetic (AI scam detection), and Shield-IoT (IoT compliance) — Phosra fits perfectly. Program offers mentorship, Mastercard API integration, and co-innovation opportunities.",
  },

  {
    id: "salesforce-ventures",
    name: "John Somorjai",
    fundOrCompany: "Salesforce Ventures",
    role: "EVP, Corporate Development & Salesforce Ventures",
    website: "https://salesforceventures.com/",
    category: "corporate-vc",
    type: "cvc",
    checkSizeRange: "$1-5M (seed), up to $50M+ (growth)",
    stagePreference: "Seed to Growth",
    contact: {
      linkedin: "https://www.linkedin.com/in/johnsomorjai/",
      twitter: "@johnsomorjai",
    },
    thesisAlignment: "perfect",
    thesisNote:
      "Salesforce Ventures has invested $6B+ across 630+ companies globally. They explicitly invest in Drata (compliance automation), demonstrating strong regtech thesis. Their $1B AI fund (85% deployed) prioritizes 'trust and responsibility.' Phosra's API-first compliance platform maps directly to Salesforce's ecosystem — platforms using Salesforce CRM need child safety compliance enforcement, and Phosra could integrate as an AppExchange partner.",
    coppaInterest: "portfolio-signal",
    fundSignal: "deploying",
    introPaths: [
      {
        type: "2nd-degree-weak",
        description:
          "Salesforce Ventures invested in Drata (compliance automation) — use Drata's team as a warm intro path since Phosra is complementary, not competitive",
        strength: 4,
      },
      {
        type: "industry-association",
        description:
          "Position as AppExchange integration partner; Salesforce's partner ecosystem team can facilitate introductions to Ventures",
        strength: 3,
      },
    ],
    tier: 1,
    approachStrategy: {
      recommended:
        "Lead with the Drata investment as proof of compliance thesis alignment, position Phosra as the child safety vertical complement",
      steps: [
        "Research Drata investment team at Salesforce Ventures for the specific partner who led that deal",
        "Build a 1-page brief showing Phosra as AppExchange-ready child safety compliance for Salesforce customers",
        "Reach out via Dreamforce or Salesforce community events (next Dreamforce: Sept 2026)",
        "Emphasize that 67+ child safety laws create the same fragmented compliance burden that Drata solves for SOC2/GDPR",
      ],
      openingAngle:
        "You backed Drata for compliance automation — we're building the equivalent for the fastest-growing regulatory category: child safety. 67 laws, 45 rule categories, one API.",
    },
    status: "identified",
    notes:
      "Salesforce Ventures is the most active CVC globally with 504 portfolio companies and 23 new investments in the past 12 months. Their Drata investment validates the compliance automation thesis. Check sizes start under $5M for seed — our $950K raise fits within their range. Team of 43 people including 15 partners.",
  },

  {
    id: "microsoft-m12",
    name: "Peter Lenke",
    fundOrCompany: "M12 (Microsoft's Venture Fund)",
    role: "Managing Partner, AI/Enterprise",
    website: "https://m12.vc/",
    category: "corporate-vc",
    type: "cvc",
    checkSizeRange: "$1-10M (Series A/B focus, some seed)",
    stagePreference: "Seed to Series B",
    contact: {
      linkedin: "https://www.linkedin.com/in/peterlenke/",
      twitter: "",
    },
    thesisAlignment: "perfect",
    thesisNote:
      "M12 invests from an evergreen fund off Microsoft's balance sheet in cybersecurity, AI, and enterprise infrastructure. They invested in Sola Security and Reach Security in 2025, showing active security/compliance deployment. Microsoft's own platforms (Xbox, Teams for Education, Minecraft) have massive COPPA exposure. Phosra's API could integrate with Azure/Microsoft ecosystem for child safety compliance.",
    coppaInterest: "portfolio-signal",
    fundSignal: "deploying",
    introPaths: [
      {
        type: "industry-association",
        description:
          "Microsoft's own COPPA exposure via Xbox, Minecraft, and Teams for Education creates strategic buyer interest — approach through Microsoft for Startups or M12 directly",
        strength: 3,
      },
      {
        type: "conference-event",
        description:
          "M12 team is active at enterprise/security conferences; target RSA Conference or Microsoft Ignite for face-to-face intro",
        strength: 3,
      },
    ],
    tier: 1,
    approachStrategy: {
      recommended:
        "Position Phosra as infrastructure-layer compliance for any platform with minor users — directly relevant to Microsoft's own compliance needs across Xbox, Minecraft, Teams for Education",
      steps: [
        "Apply to Microsoft for Startups program to establish relationship with Microsoft ecosystem team",
        "Build Azure integration narrative — Phosra as a compliance middleware in Azure Marketplace",
        "Target Peter Lenke (seed-to-B focus) or Michelle Gonzalez (Managing Partner) with a cold outreach referencing their Sola Security and Reach Security investments",
        "Frame the pitch around Microsoft's own $20M FTC fine for Xbox COPPA violations as proof that even Microsoft needs this",
      ],
      openingAngle:
        "Microsoft paid $20M in COPPA fines for Xbox. Every platform with minor users needs compliance infrastructure — we're building the API layer that prevents the next fine.",
    },
    status: "identified",
    notes:
      "M12 has 252 portfolio companies, 15 new investments in past 12 months. Evergreen fund from Microsoft balance sheet means no fund cycle pressure. Michelle Gonzalez (former Google Area 120 leader) is Managing Partner. Peter Lenke focuses on seed-to-B AI/enterprise investments. 17 team members total.",
  },

  {
    id: "cisco-investments",
    name: "Cisco Investments Team",
    fundOrCompany: "Cisco Investments",
    role: "Corporate Venture Capital",
    website: "https://www.ciscoinvestments.com/",
    category: "corporate-vc",
    type: "cvc",
    checkSizeRange: "$2-10M (early stage), $10-50M (growth)",
    stagePreference: "Seed to Growth",
    contact: {
      linkedin: "https://www.linkedin.com/company/cisco-investments/",
      twitter: "",
    },
    thesisAlignment: "good",
    thesisNote:
      "Cisco Investments has 339 portfolio companies with deep security/compliance portfolio including Theta Lake (compliance hub), BigID (data privacy), JupiterOne (compliance dashboards), StrongDM (zero-trust access), and Securiti (AI governance). They invest in seed through growth stage and have 40+ investment professionals globally. Child safety compliance maps to their broader security/compliance thesis.",
    coppaInterest: "portfolio-signal",
    fundSignal: "active",
    introPaths: [
      {
        type: "2nd-degree-weak",
        description:
          "Theta Lake (Cisco portfolio company) built a compliance hub for Webex — Phosra is the child safety equivalent; use Theta Lake team for warm intro",
        strength: 3,
      },
      {
        type: "industry-association",
        description:
          "Attend RSA Conference or Cisco partner events; Cisco Investments team is visible at security/compliance conferences",
        strength: 2,
      },
    ],
    tier: 2,
    approachStrategy: {
      recommended:
        "Lead with Cisco's compliance portfolio (Theta Lake, BigID, Securiti) and position Phosra as the child safety compliance layer that complements their existing investments",
      steps: [
        "Research which Cisco Investments partner led the Theta Lake and Securiti deals",
        "Position Phosra as complementary infrastructure — Cisco's portfolio covers data privacy, AI governance, and compliance dashboards but lacks child safety",
        "Emphasize API-first approach matches Cisco's platform philosophy",
        "Apply to Cisco LaunchPad accelerator as an entry point into the Cisco ecosystem",
      ],
      openingAngle:
        "Your portfolio covers data privacy (BigID), AI governance (Securiti), and compliance dashboards (JupiterOne) — but not the fastest-growing compliance category: child safety. We fill that gap.",
    },
    status: "identified",
    notes:
      "Cisco Investments has not made any 2026 investments yet as of February, but had 13 new investments in the past 12 months. Their compliance-focused portfolio companies (Theta Lake, BigID, JupiterOne, StrongDM, Securiti) show clear thesis alignment. Founded 1993, based in San Jose. Strong startup support program with monthly portfolio spotlights.",
  },

  {
    id: "roblox-strategic",
    name: "Roblox Corporate Development",
    fundOrCompany: "Roblox Corporation",
    role: "Strategic Investments & Partnerships",
    website: "https://about.roblox.com/",
    category: "corporate-vc",
    type: "cvc",
    checkSizeRange: "$500K-5M (strategic)",
    stagePreference: "Early to Growth",
    contact: {
      linkedin: "https://www.linkedin.com/company/roblox/",
      twitter: "@Roblox",
    },
    thesisAlignment: "perfect",
    thesisNote:
      "Roblox is the ultimate strategic buyer for child safety compliance. With $4.9B revenue (up 36% YoY) and $6.8B in bookings, they're spending hundreds of millions on safety infrastructure. They deploy 400+ AI models for moderation, partner with IARC for global age ratings, and face an SEC investigation and German USK 16+ rating. They spent $468M in Q4 capital expenditures specifically on 'safety and AI.' Phosra could be their compliance API vendor.",
    coppaInterest: "public-stance",
    fundSignal: "deploying",
    introPaths: [
      {
        type: "industry-association",
        description:
          "Roblox's Trust & Safety team and Safety Partners page lists organizations they work with — target those connections for warm intro",
        strength: 3,
      },
      {
        type: "cold-application",
        description:
          "Approach through Roblox Developer Conference (RDC) or their open safety partnerships program",
        strength: 3,
      },
    ],
    tier: 2,
    approachStrategy: {
      recommended:
        "Position Phosra as the external compliance layer Roblox needs — they're spending $468M on safety capex but building everything in-house; Phosra offers the regulatory mapping they can't build alone",
      steps: [
        "Research Roblox's Head of Trust & Safety and VP of Corporate Development on LinkedIn",
        "Reference their SEC investigation, German USK 16+ rating, and IARC partnership as proof they need multi-jurisdictional compliance mapping",
        "Propose a vendor relationship first (not investment) — become their compliance API, then discuss strategic investment",
        "Attend RDC 2026 or target Roblox's Safety Partners program for initial engagement",
      ],
      openingAngle:
        "You're spending $468M on safety infrastructure and navigating 67+ child safety laws across jurisdictions. We map all of them to a single API — saving your compliance team months of regulatory tracking.",
    },
    status: "identified",
    notes:
      "Roblox's massive COPPA exposure and regulatory pressure make them a top-3 strategic target. They face multi-jurisdictional compliance challenges (IARC ratings differ by region), an active SEC investigation, and expanding global regulation. Revenue: $4.9B (2025). They've open-sourced some safety tools and have a Parent Council with 200+ members. Key risk: they may prefer to build vs. buy compliance infrastructure.",
  },

  {
    id: "epic-games-strategic",
    name: "Epic Games Corporate Development",
    fundOrCompany: "Epic Games",
    role: "Strategic Investments",
    website: "https://www.epicgames.com/",
    category: "corporate-vc",
    type: "cvc",
    checkSizeRange: "$500K-5M (strategic)",
    stagePreference: "Growth-stage preferred",
    contact: {
      linkedin: "https://www.linkedin.com/company/epic-games/",
      twitter: "@EpicGames",
    },
    thesisAlignment: "perfect",
    thesisNote:
      "Epic Games paid a record $520M FTC settlement ($275M COPPA penalty + $245M consumer refunds) — the largest COPPA enforcement action in history. They raised $2B from Sony and KIRKBI (LEGO) specifically to build a 'kid-friendly metaverse' with child safety as a stated priority. Disney invested $1.5B in Epic in 2024. They have direct, painful experience with COPPA non-compliance costs and are committed to getting it right.",
    coppaInterest: "public-stance",
    fundSignal: "active",
    introPaths: [
      {
        type: "industry-association",
        description:
          "Epic's public commitment to child safety post-FTC settlement creates an opening for compliance vendors; approach through their Trust & Safety or Legal teams",
        strength: 3,
      },
      {
        type: "conference-event",
        description:
          "Target GDC (Game Developers Conference) or Epic's Unreal Fest for face-to-face engagement with their corporate development team",
        strength: 2,
      },
    ],
    tier: 2,
    approachStrategy: {
      recommended:
        "Lead with their $520M FTC pain — position Phosra as the compliance API that would have prevented it",
      steps: [
        "Research Epic's VP of Trust & Safety or Chief Privacy Officer on LinkedIn for warm outreach",
        "Frame the pitch: '$520M in COPPA fines could have been prevented with a $50K/year compliance API'",
        "Propose a vendor/partnership first — Epic building a kid-friendly metaverse with Sony/LEGO needs compliance infrastructure",
        "Reference their KIRKBI/LEGO partnership explicitly — LEGO's brand depends on child safety, they'd want Epic's compliance partners to be robust",
      ],
      openingAngle:
        "Epic paid $520M — the largest COPPA penalty ever. As you build the kid-friendly metaverse with LEGO and Sony, you need compliance infrastructure that scales across 67+ jurisdictions. That's exactly what Phosra does.",
    },
    status: "identified",
    notes:
      "Epic's $520M FTC settlement is the strongest 'pain point' signal of any target. $275M was specifically for COPPA violations. $2B raised from Sony + KIRKBI (LEGO) for kid-friendly metaverse. Disney invested $1.5B in 2024. Epic has made strategic investments as a corporate VC (portfolio includes companies via their Games investment arm). Key risk: Epic may want to build compliance in-house, but the multi-jurisdictional complexity favors a platform approach.",
  },

  {
    id: "gradient-ventures",
    name: "Anna Patterson",
    fundOrCompany: "Gradient Ventures (Google/Alphabet)",
    role: "Founder & Managing Partner",
    website: "https://www.gradient.com/",
    category: "corporate-vc",
    type: "cvc",
    checkSizeRange: "$1-5M (seed average ~$5.3M rounds)",
    stagePreference: "Seed to Series A",
    contact: {
      linkedin: "https://www.linkedin.com/in/anna-googler/",
      twitter: "",
    },
    thesisAlignment: "good",
    thesisNote:
      "Gradient Ventures is Google's AI-focused fund investing directly from Alphabet's balance sheet. They emphasize ethical AI including fairness, bias detection, and explainable AI. They made 27 investments in 2025, primarily at Seed and Series A. Phosra's AI-powered compliance mapping across 67+ laws aligns with their responsible AI thesis. Google/YouTube's own massive COPPA exposure ($170M FTC settlement in 2019) makes this strategically relevant.",
    coppaInterest: "portfolio-signal",
    fundSignal: "active",
    introPaths: [
      {
        type: "conference-event",
        description:
          "Gradient partners attend AI/ML conferences; target NeurIPS, ICML, or Google-hosted AI events for warm intro opportunities",
        strength: 2,
      },
      {
        type: "2nd-degree-weak",
        description:
          "Research Gradient's responsible AI portfolio companies for warm intro paths — companies working on AI safety/fairness may know the team",
        strength: 2,
      },
    ],
    tier: 2,
    approachStrategy: {
      recommended:
        "Position Phosra as responsible AI infrastructure for compliance — AI-powered mapping of child safety laws aligns with Gradient's ethical AI thesis",
      steps: [
        "Research Gradient's responsible AI investments and find portfolio founders who can make warm intros",
        "Frame Phosra as an AI-native compliance platform — the 45 rule categories mapped by ML across 67+ laws is a technical story that resonates with an AI-focused fund",
        "Reference YouTube's $170M COPPA settlement as proof that even Google needs this",
        "Target Darian Shirazi or Zach Bratun-Glennon (Partners) for initial outreach — seed stage is their sweet spot",
      ],
      openingAngle:
        "YouTube paid $170M in COPPA fines. We use AI to map 67+ child safety laws across 45 enforcement categories into a single API — responsible AI applied to the most important compliance category.",
    },
    status: "identified",
    notes:
      "Gradient is transitioning from Google-only backing to accepting outside LPs (raising $200M Fund V). 313 total investments, 99 at seed stage. Team of 15 with 7 partners. Invests directly from Alphabet balance sheet with longer timelines and less fund cycle pressure. Latest investment: Vijil (Nov 2025). Note: Gradient may be becoming more independent from Google, which could reduce the strategic 'Google needs this' angle.",
  },

  {
    id: "disney-accelerator",
    name: "Disney Accelerator Team",
    fundOrCompany: "Disney Accelerator / Walt Disney Company",
    role: "Accelerator Program + Strategic Investment",
    website: "https://sites.disney.com/accelerator/",
    category: "corporate-vc",
    type: "cvc",
    checkSizeRange: "Investment capital (accelerator program)",
    stagePreference: "Growth-stage startups",
    contact: {
      linkedin: "https://www.linkedin.com/company/the-walt-disney-company/",
      twitter: "@WaltDisneyCo",
    },
    thesisAlignment: "good",
    thesisNote:
      "Disney paid $10M in a COPPA settlement finalized in December 2025 for failing to properly designate kid-directed YouTube videos. The Disney Accelerator has supported 65+ companies including Epic Games and Kahoot. The 2025 program focuses on XR, AI/ML, sports tech, robotics, connected play, haptics, and 'Generation Alpha experiences.' Disney's massive children's content portfolio (Disney+, Pixar, Marvel, etc.) creates direct COPPA compliance need.",
    coppaInterest: "public-stance",
    fundSignal: "active",
    introPaths: [
      {
        type: "accelerator-alumni",
        description:
          "Apply directly to Disney Accelerator program — they accept growth-stage, venture-backed startups with technology/entertainment focus",
        strength: 3,
      },
      {
        type: "industry-association",
        description:
          "Disney's Safety & Content teams are active in children's media industry groups (kidSAFE, CARU, etc.)",
        strength: 2,
      },
    ],
    tier: 2,
    approachStrategy: {
      recommended:
        "Apply to Disney Accelerator emphasizing 'Generation Alpha experiences' focus area and Disney's own COPPA compliance needs",
      steps: [
        "Wait for Disney Accelerator 2026 application window (typically opens Q1-Q2)",
        "Frame Phosra under their 'Generation Alpha experiences' category — compliance infrastructure that protects kids",
        "Reference Disney's $10M COPPA settlement (Dec 2025) as proof of their compliance pain point",
        "Highlight that Disney+ Parental Controls, Disney Channel, and YouTube content all need multi-jurisdictional child safety compliance",
      ],
      openingAngle:
        "Disney just settled a $10M COPPA case. Your content reaches billions of children across platforms — you need a single compliance API that maps all 67+ child safety laws. That's Phosra.",
    },
    status: "identified",
    notes:
      "Disney's $10M COPPA settlement (finalized Dec 2025) was for YouTube videos not properly designated as kid-directed. The Disney Accelerator program runs annually with 4-5 companies per cohort, offering investment, co-working space, and executive mentorship. 2025 cohort included Animaj (kid-focused AI animation). The Accelerator has produced 65+ alumni over 10 years. Key risk: Disney may prefer enterprise-grade vendors over pre-seed startups.",
  },

  {
    id: "comcast-ventures",
    name: "Allison Goldberg",
    fundOrCompany: "Comcast Ventures",
    role: "Managing Partner",
    website: "https://comcastventures.com/",
    category: "corporate-vc",
    type: "cvc",
    checkSizeRange: "$1-10M",
    stagePreference: "Seed to Growth",
    contact: {
      linkedin: "https://www.linkedin.com/in/allisongoldberg/",
      twitter: "",
    },
    thesisAlignment: "good",
    thesisNote:
      "Comcast Ventures has invested in 275 companies with 4 new investments in the past 12 months. As parent company of NBCUniversal (now with Versant Media spinoff), Comcast operates Peacock streaming and family entertainment brands (Illumination, DreamWorks Animation). Their media platforms serving family audiences create direct COPPA compliance exposure. The Versant Media spinoff may create new investment opportunities in safety/compliance infrastructure.",
    coppaInterest: "portfolio-signal",
    fundSignal: "active",
    introPaths: [
      {
        type: "industry-association",
        description:
          "Target Comcast's family entertainment and media teams (Illumination, DreamWorks Animation) for internal champion who can intro to Ventures",
        strength: 2,
      },
      {
        type: "2nd-degree-weak",
        description:
          "Research Comcast Ventures' enterprise software portfolio for founders who can provide warm intros",
        strength: 2,
      },
    ],
    tier: 2,
    approachStrategy: {
      recommended:
        "Position Phosra as compliance infrastructure for media/streaming platforms with family audiences — directly relevant to Peacock and NBCUniversal properties",
      steps: [
        "Research Marc Silberman (Comcast Ventures emerging leader 2025) and Allison Goldberg for outreach",
        "Frame the pitch around media/streaming compliance — Peacock, DreamWorks Animation, and Illumination all serve kids",
        "Highlight the regulatory landscape: KOSA, COPPA 2.0, and state-level kids' safety laws all impact streaming platforms",
        "Propose a pilot with one Comcast/NBCU property to prove value before investment discussion",
      ],
      openingAngle:
        "Peacock and DreamWorks Animation serve millions of kids. With KOSA, COPPA 2.0, and 67+ child safety laws, your streaming platforms need a compliance API — not a 50-person legal team.",
    },
    status: "identified",
    notes:
      "Comcast just completed the Versant Media spinoff (Jan 2026), separating cable networks from NBCU's core film/TV/streaming business. This restructuring may affect Comcast Ventures' investment thesis. 275 portfolio companies, 16 team members. Marc Silberman was named emerging leader in 2025. Lower activity recently (4 new investments in 12 months) could mean more selective or pivoting thesis.",
  },

  {
    id: "t-mobile-ventures",
    name: "T-Mobile Ventures Team",
    fundOrCompany: "T-Mobile Ventures",
    role: "Corporate Venture Capital",
    website: "https://www.t-mobile.com/business/ventures",
    category: "corporate-vc",
    type: "cvc",
    checkSizeRange: "$2-10M",
    stagePreference: "Mid to Growth-stage",
    contact: {
      linkedin: "https://www.linkedin.com/company/t-mobile/",
      twitter: "@TMobile",
    },
    thesisAlignment: "good",
    thesisNote:
      "T-Mobile Ventures explicitly lists 'ensuring peace of mind for parents of digital natives' as a key investment focus in their second CVC fund. They operate FamilyMode (parental controls app), SyncUP KIDS Watch, and have a Children's Privacy Notice. Their family safety products create direct need for child safety compliance infrastructure. However, they typically invest in mid-to-growth stage, which may be too late for a pre-seed startup.",
    coppaInterest: "portfolio-signal",
    fundSignal: "active",
    introPaths: [
      {
        type: "industry-association",
        description:
          "T-Mobile's FamilyMode and SyncUP KIDS products teams are direct stakeholders for child safety compliance — approach through product team first",
        strength: 3,
      },
      {
        type: "accelerator-alumni",
        description:
          "T-Mobile Accelerator program in Kansas City could be an entry point before CVC investment",
        strength: 2,
      },
    ],
    tier: 3,
    approachStrategy: {
      recommended:
        "Approach through T-Mobile's family products division first, then leverage internal champion for Ventures introduction",
      steps: [
        "Research T-Mobile's FamilyMode and SyncUP KIDS product teams — they need COPPA compliance infrastructure",
        "Position Phosra as vendor first: 'Your FamilyMode app needs to comply with COPPA, KOSA, and 67+ state/federal laws'",
        "Apply to T-Mobile Accelerator program as alternative entry point",
        "Convert vendor/accelerator relationship into Ventures investment conversation",
      ],
      openingAngle:
        "Your FamilyMode app and SyncUP KIDS Watch serve children directly — you're subject to COPPA, KOSA, and 67+ child safety laws. Phosra's API handles compliance across all of them.",
    },
    status: "identified",
    notes:
      "T-Mobile Ventures launched second CVC fund specifically mentioning family safety. They operate FamilyMode (parental controls), SyncUP KIDS Watch 2, and have dedicated Children's Privacy Notice. Based in Bellevue, WA. Founded 2018. Typical check size may be too large for pre-seed ($2-10M in mid-to-growth companies), but the strategic alignment on family safety is strong. Omar Tazi is EVP & Chief Product Officer overseeing product innovation.",
  },

  {
    id: "pearson-ventures",
    name: "Pearson Ventures Team",
    fundOrCompany: "Pearson Ventures",
    role: "Corporate Venture Capital — Education",
    website: "https://plc.pearson.com/en-GB/company/pearson-ventures",
    category: "corporate-vc",
    type: "cvc",
    checkSizeRange: "$2-5M",
    stagePreference: "Early-stage (4-5 investments per year)",
    contact: {
      linkedin: "https://www.linkedin.com/company/pearson/",
      twitter: "@pearson",
    },
    thesisAlignment: "adjacent",
    thesisNote:
      "Pearson Ventures invests $2-5M per deal in 4-5 early-stage education technology companies annually, from a $50M fund launched in 2019. Focus areas include employability, lifelong learning, next-gen assessment, AI, mobile-first delivery, and social impact. While not directly focused on child safety compliance, Pearson's K-12 education platforms serve millions of students and face COPPA/FERPA compliance requirements. EdTech companies are a key Phosra customer segment.",
    coppaInterest: "none",
    fundSignal: "active",
    introPaths: [
      {
        type: "industry-association",
        description:
          "Approach through EdTech industry conferences (ASU+GSV, ISTE, SXSW EDU) where Pearson Ventures team is active",
        strength: 2,
      },
      {
        type: "2nd-degree-weak",
        description:
          "Research Pearson Ventures portfolio companies (Acadeum, HowNow, Nexford) for warm intros",
        strength: 2,
      },
    ],
    tier: 3,
    approachStrategy: {
      recommended:
        "Position Phosra as compliance infrastructure for the EdTech sector — every Pearson portfolio company serving K-12 students needs COPPA compliance",
      steps: [
        "Research Pearson Ventures Director (Pav) who leads investments for initial outreach",
        "Frame the pitch around EdTech compliance: 'Every portfolio company serving minors needs COPPA/FERPA compliance — Phosra handles it via API'",
        "Attend ASU+GSV Summit or ISTE Conference where Pearson team is present",
        "Position as value-add for Pearson's existing portfolio — Phosra as compliance layer for their EdTech investments",
      ],
      openingAngle:
        "Every EdTech company serving K-12 students faces COPPA and FERPA compliance. Your portfolio companies need this — and Phosra's API handles 67+ child safety laws in one integration.",
    },
    status: "identified",
    notes:
      "$50M fund launched in 2019 for early-stage EdTech. Check size ($2-5M) is larger than our $950K raise, so we'd be at the smaller end of their range. 4-5 investments per year. Adjacent thesis — they invest in education, not compliance directly. Strongest angle is as a value-add for their portfolio companies. Key risk: child safety compliance is not their core thesis, and the $950K raise may be too small for their typical deal size.",
  },
]
const IMPACT_INVESTORS: WarmIntroTarget[] = [
  {
    id: "draper-richards-kaplan",
    name: "Lara Metcalf",
    fundOrCompany: "Draper Richards Kaplan Foundation",
    role: "Senior Managing Director",
    website: "https://www.drkfoundation.org",
    category: "impact-investor",
    type: "impact-fund",
    checkSizeRange: "$100-300K",
    stagePreference: "Seed to Series A (pre $15M post-money valuation)",
    contact: {
      linkedin: "https://www.linkedin.com/in/lara-metcalf/",
      twitter: "",
    },
    thesisAlignment: "good",
    thesisNote:
      "DRK invests up to $300K in early-stage social enterprises with proven impact on underserved communities. Phosra's $6M cap is well within their $15M valuation ceiling. They provide 3-year unrestricted capital plus board-level support. Their focus on 'scalable, innovative, impact-first solutions' aligns with Phosra's compliance API model. They accept applications year-round and invest in for-profit ventures at Seed to Series A.",
    coppaInterest: "portfolio-signal",
    fundSignal: "deploying",
    introPaths: [
      {
        type: "cold-application",
        description:
          "DRK accepts applications year-round at drkfoundation.org/apply-for-funding/. They review 2,200+ applications annually and select ~20 organizations.",
        strength: 3,
      },
      {
        type: "2nd-degree-weak",
        description:
          "DRK has multiple Managing Directors across US regions — Holly Kuzmich covers Texas/Southwest. If Jake has any Dallas/Texas tech network connections, this could be a warm path.",
        strength: 2,
      },
    ],
    tier: 2,
    approachStrategy: {
      recommended: "Direct application with impact metrics focus",
      steps: [
        "Apply at drkfoundation.org — emphasize: (1) scalable API infrastructure, (2) protecting children across 67+ jurisdictions, (3) Jake's 3-exit track record",
        "Quantify impact: number of children protected per platform customer, compliance coverage across jurisdictions, regulatory enforcement enabled",
        "Highlight Phosra's 'Plaid of child safety' positioning — DRK loves clear analogies to proven business models applied to social impact",
        "Prepare for 3-year board partnership — DRK joins the board for the term of their grant, so frame this as valuable governance support during scale-up",
      ],
      openingAngle:
        "A single API that enables platforms to comply with 67+ child safety laws — protecting millions of children while building a venture-scale business. The 'Plaid of child safety compliance.'",
    },
    status: "identified",
    notes:
      "Highly competitive (20 selected from 2,200+ applications) but excellent fit: for-profit investment, $300K check, board-level engagement, 3-year commitment. Their valuation cap of $15M post-money means Phosra's $6M cap is comfortably within range. Geographic focus includes US which is Phosra's primary market. The board seat could be valuable for governance credibility.",
  },

  {
    id: "echoing-green",
    name: "Cheryl Dorsey",
    fundOrCompany: "Echoing Green",
    role: "Co-CEO",
    website: "https://echoinggreen.org",
    category: "impact-investor",
    type: "impact-fund",
    checkSizeRange: "$100K (recoverable grant for for-profits)",
    stagePreference: "Pre-Seed / Early Stage",
    contact: {
      linkedin: "https://www.linkedin.com/in/cheryl-dorsey/",
      twitter: "",
    },
    thesisAlignment: "good",
    thesisNote:
      "Echoing Green provides $100K over 18 months to early-stage social entrepreneurs. For for-profit organizations, funding is a recoverable grant — non-dilutive capital. They look for 'bold, community-driven ideas' from 'original founders' with organizations operating <5 years. Jake as a serial entrepreneur with a child safety mission fits their founder archetype. Fellowship includes pro-bono professional support and network access.",
    coppaInterest: "portfolio-signal",
    fundSignal: "active",
    introPaths: [
      {
        type: "cold-application",
        description:
          "Echoing Green fellowship applications open annually (typically fall). The 2026 cycle closed Oct 2025, so the 2027 cycle would be the next opportunity.",
        strength: 3,
      },
      {
        type: "conference-event",
        description:
          "Attend Echoing Green events and convenings — their fellows network is strong for warm introductions to other impact investors.",
        strength: 1,
      },
    ],
    tier: 2,
    approachStrategy: {
      recommended: "Apply in next fellowship cycle (2027); use network immediately",
      steps: [
        "Monitor echoinggreen.org/fellowship/apply for 2027 cycle opening (likely Sept 2026)",
        "Meanwhile, engage Echoing Green fellows working in adjacent child safety / digital rights space for warm introductions",
        "Prepare application emphasizing: original founder, <5 years operating, bold community-driven vision for child safety compliance",
        "Leverage 18-month fellowship timeline: $100K recoverable grant + professional support + impact investor network access",
      ],
      openingAngle:
        "Child safety compliance is the civil rights issue of the digital age. Phosra gives every platform — not just Big Tech — the tools to protect children under 67+ laws worldwide.",
    },
    status: "identified",
    notes:
      "Timing challenge: 2026 cycle already closed (Oct 2025 deadline). Next opportunity is 2027 cycle. However, the Echoing Green network is valuable even before formal application — their fellows and alumni include many impact-focused founders who could be connectors. Sharyanne McSwain (co-CEO, former investment banker) may be particularly receptive to Phosra's API business model.",
  },

  {
    id: "luminate-group",
    name: "Melanie Hui",
    fundOrCompany: "Luminate Group",
    role: "CEO (appointed Jan 2025)",
    website: "https://www.luminategroup.com",
    category: "impact-investor",
    type: "impact-fund",
    checkSizeRange: "Multi-year grants (varies)",
    stagePreference: "Any (mission-aligned)",
    contact: {
      linkedin: "https://www.linkedin.com/in/melanie-hui/",
      twitter: "",
    },
    thesisAlignment: "good",
    thesisNote:
      "Luminate focuses on ensuring Big Tech, social platforms, and AI companies respect human rights and social justice. By 2026, all their work will challenge unchecked harms of tech companies, especially for marginalized people. They provide multi-year unrestricted funding. Their portfolio includes Digital Freedom Fund, Open Rights Group, and other digital rights organizations. New CEO Melanie Hui (Jan 2025) represents fresh leadership open to new partnerships.",
    coppaInterest: "public-stance",
    fundSignal: "active",
    introPaths: [
      {
        type: "content-warmup",
        description:
          "Engage with Luminate's 'All Eyes on 2026' and 'Our Evolving Strategy' publications. Reference their tech accountability focus in outreach.",
        strength: 2,
      },
      {
        type: "cold-application",
        description:
          "Luminate accepts funding applications at luminategroup.com/funding. They provide multi-year unrestricted funding to mission-aligned organizations.",
        strength: 2,
      },
      {
        type: "industry-association",
        description:
          "Connect through shared digital rights ecosystem — Luminate funds organizations that Phosra's compliance work directly supports.",
        strength: 2,
      },
    ],
    tier: 2,
    approachStrategy: {
      recommended: "Digital rights angle — position Phosra as enforcement infrastructure for rights",
      steps: [
        "Review Luminate's partner database at luminategroup.com/portfolio to identify overlap with Phosra's compliance coverage",
        "Draft outreach to Melanie Hui framing Phosra as tech accountability infrastructure — making child safety laws actually enforceable",
        "Apply via luminategroup.com/funding with emphasis on: (1) holding tech companies accountable, (2) protecting marginalized children, (3) global regulatory coverage",
        "Propose pilot partnership: Phosra compliance data could support Luminate's advocacy work with concrete enforcement metrics",
      ],
      openingAngle:
        "Laws protecting children online exist across 67+ jurisdictions — but without compliance infrastructure, they are unenforceable. Phosra makes digital rights for children operational.",
    },
    status: "identified",
    notes:
      "Luminate (part of the Omidyar Group) provides grants rather than equity investment. Their multi-year unrestricted funding model is excellent for runway extension. New CEO Melanie Hui (replacing Stephen King after ~7 years) may be receptive to fresh partnerships. Key focus on tech accountability aligns perfectly with compliance enforcement. Risk: they may prefer advocacy organizations over for-profit infrastructure companies.",
  },

  {
    id: "macarthur-foundation",
    name: "Eric Sears",
    fundOrCompany: "MacArthur Foundation",
    role: "Director, Technology in the Public Interest",
    website: "https://www.macfound.org",
    category: "impact-investor",
    type: "impact-fund",
    checkSizeRange: "Grants (varies, typically $100K-500K+)",
    stagePreference: "Any (mission-aligned)",
    contact: {
      linkedin: "https://www.linkedin.com/in/eric-sears/",
      twitter: "",
    },
    thesisAlignment: "good",
    thesisNote:
      "MacArthur's Technology in the Public Interest program strengthens democratic oversight and accountability in technology governance, with emphasis on AI auditing and evaluation. Their 2025 increased payout (6%+) signals more capital deployment. They support the 'humane development of AI' and track social media algorithm impacts. Phosra's compliance infrastructure serves their goal of making technology governance actionable.",
    coppaInterest: "public-stance",
    fundSignal: "deploying",
    introPaths: [
      {
        type: "content-warmup",
        description:
          "Engage with MacArthur's 'What Our Directors Learned from the Field in 2025' publication and Eric Sears' public writing on tech accountability.",
        strength: 2,
      },
      {
        type: "industry-association",
        description:
          "Connect through Public Voices Fellowship on Technology in the Public Interest — MacArthur's flagship tech accountability program.",
        strength: 2,
      },
      {
        type: "cold-application",
        description:
          "MacArthur accepts grant proposals through their website. Technology in the Public Interest has active grant guidelines.",
        strength: 2,
      },
    ],
    tier: 2,
    approachStrategy: {
      recommended: "Position Phosra as technology governance infrastructure",
      steps: [
        "Research MacArthur's Technology in the Public Interest grant guidelines and recent grantees",
        "Frame Phosra as 'algorithmic accountability infrastructure' — our 45 rule categories include algorithmic_audit, which directly maps to MacArthur's AI governance focus",
        "Connect with Eric Sears via LinkedIn, referencing their tech accountability work and how compliance enforcement enables governance",
        "Submit grant proposal emphasizing: democratic oversight of platforms, child safety as tech governance imperative, auditable compliance infrastructure",
      ],
      openingAngle:
        "MacArthur is strengthening technology governance and AI accountability. Phosra provides the enforcement infrastructure — mapping 45 rule categories including algorithmic auditing across 67+ child safety laws.",
    },
    status: "identified",
    notes:
      "MacArthur increased its 2025 payout to 6%+ in response to federal grant freezes, signaling more capital available. Their Safety and Justice Challenge is winding down in 2025, potentially freeing resources for new technology-focused programs. $96M in annual grants with $1.5B+ in assets. The Technology in the Public Interest program is the right entry point. Risk: large foundations move slowly and may prefer larger, more established grantees.",
  },

  {
    id: "ford-foundation",
    name: "Technology and Society Program Team",
    fundOrCompany: "Ford Foundation",
    role: "Technology and Society Program",
    website: "https://www.fordfoundation.org",
    category: "impact-investor",
    type: "impact-fund",
    checkSizeRange: "Grants ($100K-1M+)",
    stagePreference: "Any (mission-aligned)",
    contact: {
      linkedin: "https://www.linkedin.com/company/ford-foundation/",
      twitter: "@FordFoundation",
    },
    thesisAlignment: "good",
    thesisNote:
      "Ford Foundation's Technology and Society program invests $50M+ annually (across 5 foundation coalition) in digital rights. They focus on reshaping technology governance to advance social justice, countering surveillance, and building public interest tech expertise. Their Spyware Accountability Initiative ($12M+ in grants) shows willingness to fund tech accountability infrastructure. Phosra's compliance API serves their goal of making digital rights enforceable.",
    coppaInterest: "portfolio-signal",
    fundSignal: "active",
    introPaths: [
      {
        type: "cold-application",
        description:
          "Ford Foundation's Technology and Society program accepts grant proposals. They are actively hiring program officers, suggesting expanding portfolio.",
        strength: 2,
      },
      {
        type: "industry-association",
        description:
          "Connect through public interest technology networks — Ford Foundation co-convened a 5-foundation digital rights coalition investing $50M+ annually.",
        strength: 2,
      },
      {
        type: "content-warmup",
        description:
          "Engage with Ford Foundation's digital rights publications and Technology and Society strategy documents.",
        strength: 1,
      },
    ],
    tier: 2,
    approachStrategy: {
      recommended: "Public interest technology angle with digital rights framing",
      steps: [
        "Review Ford Foundation's Technology and Society strategy document and recent grants at fordfoundation.org",
        "Frame Phosra as public interest technology infrastructure — making child safety laws enforceable serves digital rights and justice",
        "Submit grant inquiry emphasizing: (1) counter-surveillance through compliance enforcement, (2) protecting marginalized children online, (3) global coverage across 67+ jurisdictions",
        "Reference the 5-foundation digital rights coalition — position Phosra as infrastructure that serves multiple foundation priorities simultaneously",
      ],
      openingAngle:
        "You invest in digital rights. Child safety compliance is a digital rights issue — and right now, there is no infrastructure to enforce 67+ laws protecting children. Phosra is that infrastructure.",
    },
    status: "identified",
    notes:
      "Ford Foundation president Darren Walker announced departure in 2025, creating potential leadership transition dynamics. The Spyware Accountability Initiative ($12M+) demonstrates willingness to fund tech accountability infrastructure at scale. They are part of a 5-foundation coalition spending $50M+ annually on digital rights. Risk: large foundations have long grant cycles and may focus on nonprofit grantees rather than for-profit infrastructure. The hiring of new program officers suggests an expanding portfolio, which could create opportunity.",
  },

  {
    id: "skoll-foundation",
    name: "Marla Blow",
    fundOrCompany: "Skoll Foundation",
    role: "CEO (effective June 2025)",
    website: "https://skoll.org",
    category: "impact-investor",
    type: "impact-fund",
    checkSizeRange: "Grants ($500K-2M+)",
    stagePreference: "Growth (typically larger organizations)",
    contact: {
      linkedin: "https://www.linkedin.com/in/marlablow/",
      twitter: "",
    },
    thesisAlignment: "good",
    thesisNote:
      "Skoll Foundation deploys $96M annually in grants to social entrepreneurs, with $1.5B+ in assets. New CEO Marla Blow has Mastercard background (North America lead at Mastercard Center for Inclusive Growth) — direct overlap with Jake's Mastercard infrastructure experience. She was also founder/CEO of a fintech venture, making her uniquely positioned to appreciate Phosra's API-first business model. The Mastercard connection is a powerful personal angle.",
    coppaInterest: "portfolio-signal",
    fundSignal: "active",
    introPaths: [
      {
        type: "alumni-network",
        description:
          "Marla Blow led Mastercard Center for Inclusive Growth — Jake's Mastercard infrastructure background creates a direct professional network overlap. This is the strongest connection point.",
        strength: 4,
      },
      {
        type: "conference-event",
        description:
          "Attend Skoll World Forum (typically held at Oxford in spring). The premier gathering for social entrepreneurs and Skoll network.",
        strength: 2,
      },
    ],
    tier: 2,
    approachStrategy: {
      recommended: "Mastercard alumni network connection to Marla Blow",
      steps: [
        "Leverage Jake's Mastercard background to connect with Marla Blow via shared professional network — she led Mastercard Center for Inclusive Growth",
        "Frame Phosra through Mastercard lens: 'Just as Mastercard built infrastructure rails for payments, Phosra builds infrastructure rails for child safety compliance'",
        "Request meeting at Skoll World Forum or via LinkedIn, leading with shared Mastercard heritage and fintech-to-impact trajectory",
        "Acknowledge Skoll's nomination-only model — position initial outreach as relationship-building for future nomination, not cold application",
      ],
      openingAngle:
        "From one Mastercard infrastructure builder to another: I built the 'Plaid of child safety compliance' — a single API mapping 45 enforcement categories across 67+ laws. Your fintech background means you understand infrastructure plays.",
    },
    status: "identified",
    notes:
      "KEY CONNECTION: Marla Blow's Mastercard background is a direct overlap with Jake's. She was also a fintech founder (FS Card Inc., subprime credit card venture), so she understands API-first business models. Skoll does NOT accept unsolicited proposals — all grantees are identified through referrals and nominations. The Mastercard alumni angle is the strongest intro path. $96M annual grants, but typically larger organizations. May be better as a Series A+ relationship to cultivate now.",
  },

  {
    id: "new-profit",
    name: "Tulaine Montgomery",
    fundOrCompany: "New Profit",
    role: "Co-CEO",
    website: "https://newprofit.org",
    category: "impact-investor",
    type: "impact-fund",
    checkSizeRange: "$110K-1.5M",
    stagePreference: "Early Stage (Build portfolio)",
    contact: {
      linkedin: "https://www.linkedin.com/in/tulainemontgomery",
      twitter: "",
    },
    thesisAlignment: "adjacent",
    thesisNote:
      "New Profit has invested $350M+ in 250+ social impact organizations since 1998. Their Build portfolio provides $1.5M unrestricted funding over 4 years plus strategic advisory. Focus areas are Education, Economic Mobility, and Democracy. Child safety is adjacent to their Education focus, and digital rights connect to their Democracy work. However, they primarily invest in nonprofits and education-focused organizations.",
    coppaInterest: "none",
    fundSignal: "active",
    introPaths: [
      {
        type: "cold-application",
        description:
          "New Profit accepts applications through newprofit.org/get-funding-support/. Their Build portfolio and Catalyze Cohort are the relevant entry points.",
        strength: 2,
      },
      {
        type: "content-warmup",
        description:
          "Engage with Tulaine Montgomery on LinkedIn — she actively posts about social innovation and venture philanthropy.",
        strength: 1,
      },
    ],
    tier: 3,
    approachStrategy: {
      recommended: "Education safety angle — COPPA compliance for education platforms",
      steps: [
        "Frame Phosra through education lens: child safety compliance is essential for every edtech platform serving students",
        "Apply to Build portfolio or Catalyze Cohort with emphasis on protecting children in digital education environments",
        "Reference New Profit's $110K funding + advisory model (Global South Opportunities cohort) as accessible entry point",
        "Leverage Boston/education ecosystem connections — New Profit is Boston-based with deep education sector networks",
      ],
      openingAngle:
        "Every education platform must protect children under COPPA, FERPA, and 67+ child safety laws. Phosra provides the compliance infrastructure that the entire edtech ecosystem needs.",
    },
    status: "identified",
    notes:
      "New Profit's primary focus areas (Education, Economic Mobility, Democracy) are adjacent but not direct fits. They primarily fund nonprofits. However, their $1.5M Build portfolio grants are substantial and come with 4-year strategic advisory. The education angle is the strongest pitch vector. Boston-based, which could be relevant for network building. Co-founded by Vanessa Kirsch, who also co-leads as CEO.",
  },

  {
    id: "dtsp",
    name: "Digital Trust & Safety Partnership",
    fundOrCompany: "Digital Trust & Safety Partnership (DTSP)",
    role: "Industry Consortium",
    website: "https://dtspartnership.org",
    category: "impact-investor",
    type: "impact-fund",
    checkSizeRange: "Strategic partnership (not a fund)",
    stagePreference: "N/A (industry consortium)",
    contact: {
      linkedin: "https://www.linkedin.com/company/dtspartnership",
      twitter: "@dtspartnership",
    },
    thesisAlignment: "perfect",
    thesisNote:
      "DTSP is a consortium of major tech companies implementing trust and safety best practices. Their Safe Framework became ISO/IEC 25389 standard in Jan 2025. DTSP members need compliance infrastructure to implement the Safe Framework — Phosra's API maps directly to their best practices. This is a strategic partnership target, not a direct investor, but DTSP member companies are potential customers AND investors.",
    coppaInterest: "public-stance",
    fundSignal: "unknown",
    introPaths: [
      {
        type: "industry-association",
        description:
          "Engage with DTSP convenings and working groups. Their Safe Framework ISO standardization creates a compliance requirement that Phosra can serve.",
        strength: 3,
      },
      {
        type: "content-warmup",
        description:
          "Reference the ISO/IEC 25389 Safe Framework standard in Phosra materials. Position Phosra as implementation tooling for the standard.",
        strength: 2,
      },
      {
        type: "conference-event",
        description:
          "Attend DTSP events and Trust & Safety Professional Association (TSPA) conferences.",
        strength: 2,
      },
    ],
    tier: 2,
    approachStrategy: {
      recommended: "Position Phosra as Safe Framework implementation infrastructure",
      steps: [
        "Map Phosra's 45 rule categories to DTSP's Safe Framework (ISO/IEC 25389) requirements — create a compatibility matrix",
        "Engage with DTSP through their website and working groups to understand member company compliance needs",
        "Position Phosra as the implementation layer that makes the Safe Framework operationally achievable for member platforms",
        "Use DTSP relationship to access member companies' corporate venture arms and trust & safety procurement teams",
      ],
      openingAngle:
        "The Safe Framework is now ISO/IEC 25389. Your member platforms need infrastructure to implement it. Phosra maps 45 enforcement categories across 67+ laws — the compliance engine behind the standard.",
    },
    status: "identified",
    notes:
      "DTSP is not an investor but a critical strategic partner. Their ISO standardization (Jan 2025) creates compliance demand that Phosra can serve. Member companies include major tech platforms that could be both customers and corporate venture investors. The Trust & Safety ecosystem is the natural distribution channel for Phosra. Use DTSP as a credibility builder and customer acquisition channel, not as a direct fundraising target.",
  },
]
const CELEBRITY_ANGELS: WarmIntroTarget[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // TIER 1 — Perfect Alignment (demonstrated child safety commitment)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "ashton-kutcher",
    name: "Ashton Kutcher",
    fundOrCompany: "Sound Ventures / Thorn",
    role: "Co-Founder & GP",
    website: "https://www.soundventures.com/",
    category: "celebrity-angel" as const,
    type: "angel" as const,
    checkSizeRange: "$100K-$1M",
    stagePreference: "Seed",
    contact: {
      linkedin: "https://www.linkedin.com/in/ashton-kutcher/",
      twitter: "@aplusk",
    },
    thesisAlignment: "perfect" as const,
    thesisNote:
      "Co-founded Thorn: Digital Defenders of Children — built technology to identify 14,874 child victims and 16,927 traffickers. Thorn's Safer product helps platforms detect and report CSAM at scale. Kutcher literally built the child safety tech category. Phosra's compliance API is the infrastructure layer Thorn-like products need to ensure platform compliance across 67+ laws.",
    coppaInterest: "public-stance" as const,
    fundSignal: "active" as const,
    introPaths: [
      {
        type: "industry-association" as const,
        description:
          "Thorn partnership angle — Phosra enforces the laws that protect the children Thorn rescues. Complementary infrastructure play.",
        strength: 4,
      },
      {
        type: "content-warmup" as const,
        description:
          "Sound Ventures invests in platform infrastructure (Uber, Airbnb, Spotify). Phosra fits the 'picks and shovels' thesis.",
        strength: 3,
      },
    ],
    tier: 1 as const,
    approachStrategy: {
      recommended: "Thorn partnership + child safety infrastructure pitch",
      steps: [
        "Connect through Thorn team or child safety advocacy network — frame as complementary infrastructure",
        "Lead with: 'You built the tools to rescue kids. We're building the compliance layer that forces every platform to use tools like yours.'",
        "Highlight the 67+ laws creating mandatory compliance obligations that map to Thorn's mission",
        "Propose: angel check + Thorn/Phosra technical partnership for platform compliance workflows",
      ],
      openingAngle:
        "The laws you've fought for are passing. Phosra is the infrastructure that makes them enforceable at scale.",
    },
    status: "identified" as const,
    notes:
      "HIGHEST PRIORITY. Kutcher co-founded Thorn in 2009 (originally DNA Foundation with Demi Moore). Sound Ventures manages $1B+ AUM, portfolio includes 200+ early-stage companies. Thorn has helped identify 75,000+ child victims since 2012. His personal mission IS child safety technology. Check sizes through Sound Ventures range $100K-$10M with sweet spot around $1M. Most recent investment: Ephemera Series B (July 2025).",
  },

  {
    id: "jessica-alba",
    name: "Jessica Alba",
    fundOrCompany: "Personal Angel / The Honest Company",
    role: "Founder & Angel Investor",
    website: "https://www.honest.com/",
    category: "celebrity-angel" as const,
    type: "angel" as const,
    checkSizeRange: "$25-100K",
    stagePreference: "Seed",
    contact: {
      linkedin: "https://www.linkedin.com/in/jessicaalba/",
      twitter: "@JessicaAlba",
    },
    thesisAlignment: "perfect" as const,
    thesisNote:
      "Founded The Honest Company specifically because of child safety concerns — her own childhood illnesses and the birth of her first child in 2008 drove her to create safer baby products. She built a $1B+ company on the thesis that parents demand safety guarantees for their children. Phosra is the digital equivalent: safety guarantees for kids online.",
    coppaInterest: "public-stance" as const,
    fundSignal: "active" as const,
    introPaths: [
      {
        type: "cold-application" as const,
        description:
          "Parent-founder to parent-founder pitch. Jake (5 kids) + Alba (3 kids) share the 'I built this because my kids need it' motivation.",
        strength: 4,
      },
      {
        type: "content-warmup" as const,
        description:
          "Honest Company = child safety in physical products. Phosra = child safety in digital products. Same thesis, new frontier.",
        strength: 4,
      },
    ],
    tier: 1 as const,
    approachStrategy: {
      recommended: "Parent-founder connection + physical-to-digital safety parallel",
      steps: [
        "Reach out via LinkedIn or through LA startup community — emphasize the parent-founder angle",
        "Frame: 'You proved parents will pay for child safety in products. Now 67 laws are mandating it digitally — and platforms need Phosra to comply.'",
        "Highlight Jake's 5 kids as authentic motivation (mirrors her Honest Company origin story)",
        "Propose small angel check ($25-50K) + advisory role as 'child safety advocate'",
      ],
      openingAngle:
        "You made child safety a consumer brand. We're making it platform infrastructure.",
    },
    status: "identified" as const,
    notes:
      "Alba stepped down as Honest Company CCO in April 2024 but remains deeply connected to child safety brand. She has a smaller angel portfolio (3 companies) but her personal brand + child safety credibility are extremely valuable. The Honest Company IPO'd in 2021 (raised $100M+). Her endorsement would be a strong signal to other parent-focused investors.",
  },

  {
    id: "serena-williams",
    name: "Serena Williams",
    fundOrCompany: "Serena Ventures",
    role: "Founder & Managing Partner",
    website: "https://www.serenaventures.com/",
    category: "celebrity-angel" as const,
    type: "angel" as const,
    checkSizeRange: "$100K-$500K",
    stagePreference: "Seed",
    contact: {
      linkedin: "https://www.linkedin.com/in/serenawilliams/",
      twitter: "@seabornjp",
    },
    thesisAlignment: "perfect" as const,
    thesisNote:
      "Serena Ventures invested in Zigazoo, a safe social media platform for children (kidSAFE certified). This is a direct portfolio-signal for child safety tech. She was also named Reckitt's first entrepreneur-in-residence (2025) focused on maternal care and health equity. As a mother, she publicly advocates for child-safe digital environments.",
    coppaInterest: "portfolio-signal" as const,
    fundSignal: "deploying" as const,
    introPaths: [
      {
        type: "portfolio-founder" as const,
        description:
          "Zigazoo (Serena Ventures portfolio) is exactly the type of platform that needs Phosra's compliance API. Direct customer-investor alignment.",
        strength: 4,
      },
      {
        type: "industry-association" as const,
        description:
          "Serena Ventures focuses on diverse founders and underserved markets. Child safety compliance is a massively underserved infrastructure market.",
        strength: 3,
      },
    ],
    tier: 1 as const,
    approachStrategy: {
      recommended: "Zigazoo portfolio connection + child safety infrastructure thesis",
      steps: [
        "Connect through Zigazoo team or Serena Ventures associates — reference their child safety portfolio",
        "Lead with: 'Your portfolio company Zigazoo proves the market for child-safe platforms. Phosra is the compliance infrastructure every platform like Zigazoo needs.'",
        "Emphasize 14 unicorns in portfolio — Phosra has similar platform infrastructure DNA (like the early-stage versions of Plaid or Stripe)",
        "Highlight the 67-law landscape creating mandatory compliance demand",
      ],
      openingAngle:
        "You already invest in child-safe platforms. Phosra is the compliance API they all need.",
    },
    status: "identified" as const,
    notes:
      "Serena Ventures has backed 14 unicorns. Made 4 investments in 2025, 1 in 2026 so far. Actively deploying. Portfolio includes Zigazoo (children's social media), demonstrating direct child safety interest. Named Reckitt entrepreneur-in-residence (2025) for maternal care + health equity. Check sizes vary but seed investments typically $100K-$500K.",
  },

  {
    id: "dwyane-wade",
    name: "Dwyane Wade",
    fundOrCompany: "Personal Angel / Wade Family Foundation",
    role: "Angel Investor & Family Advocate",
    website: "https://dwyanewade.com/",
    category: "celebrity-angel" as const,
    type: "angel" as const,
    checkSizeRange: "$25-100K",
    stagePreference: "Seed",
    contact: {
      linkedin: "https://www.linkedin.com/in/dwyane-wade/",
      twitter: "@DwyaneWade",
    },
    thesisAlignment: "perfect" as const,
    thesisNote:
      "Co-founded Proudly (baby care for children of color) and invested in KiddieKredit (children's financial literacy app). Has 5 children including transgender daughter Zaya — is one of the most vocal celebrity advocates for protecting children from online harassment and bullying. Won NAACP President's Award (2023) for family advocacy. His personal mission aligns directly with child safety online.",
    coppaInterest: "public-stance" as const,
    fundSignal: "active" as const,
    introPaths: [
      {
        type: "cold-application" as const,
        description:
          "Both Jake (5 kids) and Wade (5 kids) are fathers of five. Wade's advocacy for Zaya's safety online creates deep personal alignment with child safety infrastructure.",
        strength: 4,
      },
      {
        type: "portfolio-founder" as const,
        description:
          "KiddieKredit (children's fintech) and Proudly (baby care) show Wade invests where his kids inspire him. Phosra protects all kids online.",
        strength: 3,
      },
    ],
    tier: 1 as const,
    approachStrategy: {
      recommended: "Father-to-father appeal + child safety advocacy angle",
      steps: [
        "Connect through Miami startup network or sports-tech community",
        "Lead with: 'You've publicly fought to protect your children. 67 laws are being written to protect all children online — Phosra makes them enforceable.'",
        "Reference his KiddieKredit and Proudly investments as proof he invests in children's wellbeing",
        "Emphasize: the same online platforms that have failed to protect kids like Zaya now face mandatory compliance obligations",
      ],
      openingAngle:
        "You protect your kids publicly. We're building the infrastructure to protect every kid digitally.",
    },
    status: "identified" as const,
    notes:
      "Wade has invested in seed through Series A across KiddieKredit, Jomboy Media, Goldin Auctions, Taft, Stance, and KICKS CREW. Co-founded Proudly baby care with Gabrielle Union. 2023 NAACP President's Award for advocacy. Wade Family Foundation focuses on racial justice and LGBTQ equality. His advocacy for daughter Zaya (transgender) against online harassment makes child safety deeply personal. Both he and Jake have 5 kids — strong personal connection angle.",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TIER 2 — Strong Alignment (impact-focused with family/children interest)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "gwyneth-paltrow",
    name: "Gwyneth Paltrow",
    fundOrCompany: "Kinship Ventures",
    role: "Co-Founder",
    website: "https://www.kinshipventures.co",
    category: "celebrity-angel" as const,
    type: "angel" as const,
    checkSizeRange: "$100K-$500K",
    stagePreference: "Seed",
    contact: {
      linkedin: "https://www.linkedin.com/in/gwynethpaltrow/",
      twitter: "@GwynethPaltrow",
    },
    thesisAlignment: "good" as const,
    thesisNote:
      "Kinship Ventures invests in 'companies shaping the future of consumer wellness, technology, and lifestyle.' Portfolio includes Kudos (diaper company), demonstrating child/family product interest. Paltrow is a mother of two and goop's brand is heavily family/wellness-oriented. Kinship Ventures is actively deploying from a $75M fund with $500K-$3M check sizes.",
    coppaInterest: "portfolio-signal" as const,
    fundSignal: "deploying" as const,
    introPaths: [
      {
        type: "content-warmup" as const,
        description:
          "Goop/Kinship thesis: consumers demand transparency and safety. Phosra delivers digital safety transparency for children's platforms.",
        strength: 3,
      },
      {
        type: "industry-association" as const,
        description:
          "Paltrow's investments in Kudos (diapers) and child-adjacent products show family product interest. Child safety compliance is the next frontier.",
        strength: 3,
      },
    ],
    tier: 2 as const,
    approachStrategy: {
      recommended: "Consumer wellness + family safety thesis alignment",
      steps: [
        "Connect through Kinship Ventures or LA startup community — reference the wellness-to-safety pipeline",
        "Frame: 'You invest in wellness for families. Digital child safety is the fastest-growing wellness category — 67 laws and counting.'",
        "Highlight Kinship's portfolio (OpenAI, Poppi, Olipop) — Phosra has similar infrastructure DNA at earlier stage",
        "Propose $100-250K check through Kinship Ventures at seed stage",
      ],
      openingAngle:
        "Wellness doesn't stop at what kids eat — it includes what platforms do with their data.",
    },
    status: "identified" as const,
    notes:
      "Kinship Ventures raising $75M fund (reported March 2023). Check sizes $500K-$3M for seed. Co-founded with Moj Mahdara (former BeautyCon CEO). Portfolio includes OpenAI, Poppi (acquired by PepsiCo for $1.95B), Olipop ($1.85B valuation). 25 personal angel investments total. Most recent: Forethought Series D (May 2025). Kudos (diaper company) investment is direct child/family signal. Paltrow has 2 children (Apple, Moses).",
  },

  {
    id: "robert-downey-jr",
    name: "Robert Downey Jr.",
    fundOrCompany: "FootPrint Coalition Ventures",
    role: "Founder",
    website: "https://www.footprintcoalition.com",
    category: "celebrity-angel" as const,
    type: "angel" as const,
    checkSizeRange: "$100K-$500K",
    stagePreference: "Seed",
    contact: {
      linkedin: "https://www.linkedin.com/in/robert-downey-jr-ab6703215/",
      twitter: "@RobertDowneyJr",
    },
    thesisAlignment: "good" as const,
    thesisNote:
      "FootPrint Coalition focuses on sustainability and impact — not child safety specifically, but the 'technology for good' thesis translates. Also co-founded Happy (wellness) and serves on the board of Aura (digital safety company). The Aura board seat is a STRONG signal — Aura provides online safety and identity protection, which overlaps directly with child safety infrastructure.",
    coppaInterest: "portfolio-signal" as const,
    fundSignal: "active" as const,
    introPaths: [
      {
        type: "portfolio-founder" as const,
        description:
          "RDJ is a board member at Aura (digital safety company). Phosra's child safety compliance API is adjacent to Aura's consumer safety mission.",
        strength: 4,
      },
      {
        type: "industry-association" as const,
        description:
          "FootPrint Coalition invests in 'technology to restore the planet.' Child safety compliance is 'technology to restore the internet for kids.'",
        strength: 3,
      },
    ],
    tier: 2 as const,
    approachStrategy: {
      recommended: "Aura board connection + impact technology thesis",
      steps: [
        "Connect through Aura team — RDJ's board role there creates a direct bridge to digital safety",
        "Frame: 'You invest in technology that protects people (Aura) and the planet (FootPrint). Phosra protects children online.'",
        "Highlight the regulatory tailwind: 67 laws creating $B+ compliance market, similar to how environmental regulation created the cleantech market FootPrint invests in",
        "Propose angel check + advisory through the digital safety lens",
      ],
      openingAngle:
        "You sit on Aura's board protecting adults online. Phosra does the same for children — with 67 laws mandating it.",
    },
    status: "identified" as const,
    notes:
      "FootPrint Coalition makes ~6 early-stage and ~4 later-stage investments per year. RDJ's board seat at Aura (digital safety/identity protection company) is the strongest connection to child safety. Also co-founded Happy (wellness brand). Father of 3 children. FootPrint Coalition's investment focus includes education sector alongside sustainability. Most impactful approach is through the Aura connection rather than FootPrint directly.",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TIER 3 — Adjacent Alignment (tech investors with social impact interest)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "will-smith",
    name: "Will Smith",
    fundOrCompany: "Dreamers VC",
    role: "Co-Founder",
    website: "https://www.dreamers.vc/",
    category: "celebrity-angel" as const,
    type: "angel" as const,
    checkSizeRange: "$250K-$1M",
    stagePreference: "Seed",
    contact: {
      linkedin: "https://www.linkedin.com/in/willsmith/",
      twitter: "@willsmith",
    },
    thesisAlignment: "adjacent" as const,
    thesisNote:
      "Dreamers VC bridges US startups with Japanese corporate investors. Will & Jada Smith Family Foundation focuses on youth empowerment, education, and storytelling. While Dreamers VC hasn't invested in child safety specifically, the foundation's youth mission and Smith's role as a father of 3 create personal alignment. Dreamers VC has 76 investments and 11 unicorns.",
    coppaInterest: "none" as const,
    fundSignal: "unknown" as const,
    introPaths: [
      {
        type: "industry-association" as const,
        description:
          "Will & Jada Smith Family Foundation mission ('uplifting the next generation') aligns with child safety infrastructure.",
        strength: 2,
      },
      {
        type: "conference-event" as const,
        description:
          "Dreamers VC connects US startups to Japanese corporates. Japan has aggressive child safety regulation — Phosra's global law mapping is relevant.",
        strength: 2,
      },
    ],
    tier: 2 as const,
    approachStrategy: {
      recommended: "Youth empowerment foundation angle + Japan regulatory bridge",
      steps: [
        "Connect through Dreamers VC team or LA entertainment-tech network",
        "Frame: 'Your foundation uplifts the next generation. Phosra ensures platforms protect them while you do.'",
        "Highlight the Japan angle: Dreamers VC bridges US-Japan, and Japan's child safety regulations create demand for Phosra's global compliance mapping",
        "Propose through Dreamers VC as an institutional investment rather than personal angel",
      ],
      openingAngle:
        "Your foundation protects children's futures. Phosra protects their present — online.",
    },
    status: "identified" as const,
    notes:
      "Dreamers VC has NOT made any investments in 2025 or 2026 (last was Karat Series B, July 2023) — fund may be between vintages or less active. The Will & Jada Smith Family Foundation closed in 2024 following the Chris Rock incident fallout. Average deal sizes are large ($10-50M range) which may not fit pre-seed. Lower priority due to inactivity and higher typical check sizes, but the Japan bridge angle for global compliance is unique.",
  },

  {
    id: "nas",
    name: "Nas (Nasir Jones)",
    fundOrCompany: "QueensBridge Venture Partners",
    role: "Co-Founder & Partner",
    website: "https://www.queensbridgevp.com/",
    category: "celebrity-angel" as const,
    type: "angel" as const,
    checkSizeRange: "$50-250K",
    stagePreference: "Seed",
    contact: {
      linkedin: "https://www.linkedin.com/in/nasir-jones/",
      twitter: "@Nas",
    },
    thesisAlignment: "adjacent" as const,
    thesisNote:
      "QueensBridge VP has a stellar early-stage track record: Coinbase, Ring, Robinhood, Lyft, Dropbox, PillPack, SeatGeek — 4 unicorns, 7 IPOs, 39 acquisitions. Invests in fintech, media, health tech, AI infrastructure, and consumer tech. While no direct child safety investments, the fintech/infrastructure thesis aligns with Phosra's 'Plaid of child safety' positioning. Nas also established the Harvard Hip-Hop Fellowship — showing commitment to education.",
    coppaInterest: "none" as const,
    fundSignal: "unknown" as const,
    introPaths: [
      {
        type: "industry-association" as const,
        description:
          "QueensBridge backed Coinbase, Robinhood, Ring — all infrastructure/platform plays. Phosra is compliance infrastructure with similar DNA.",
        strength: 3,
      },
      {
        type: "content-warmup" as const,
        description:
          "Nas established Harvard Hip-Hop Fellowship. Education commitment shows youth-focused values.",
        strength: 2,
      },
    ],
    tier: 3 as const,
    approachStrategy: {
      recommended: "Infrastructure thesis + fintech parallel",
      steps: [
        "Connect through QueensBridge VP team (Anthony Saleh) or fintech network",
        "Frame: 'You backed the infrastructure layers (Coinbase for crypto, Robinhood for trading). Phosra is the infrastructure layer for child safety compliance.'",
        "Highlight the 'Plaid of child safety' positioning — QueensBridge loves fintech infrastructure",
        "Reference the regulatory tailwind: 67 laws = massive demand, similar to how crypto regulation drove Coinbase",
      ],
      openingAngle:
        "You backed Coinbase before crypto regulation hit. Phosra is the compliance layer before child safety enforcement hits.",
    },
    status: "identified" as const,
    notes:
      "QueensBridge VP has been less active recently — no investments in 2025, last was Disco.xyz (June 2024). Latest exit: mParticle (January 2025). Co-founded with Anthony Saleh (Forbes 30 Under 30). The fintech infrastructure parallel is the strongest angle. Father of 2 children. QueensBridge's early-stage track record is exceptional but fund activity has slowed — may be between funds.",
  },

  {
    id: "jared-leto",
    name: "Jared Leto",
    fundOrCompany: "Personal Angel Investments",
    role: "Angel Investor",
    website: "https://www.jaredleto.com/",
    category: "celebrity-angel" as const,
    type: "angel" as const,
    checkSizeRange: "$25-100K",
    stagePreference: "Seed",
    contact: {
      linkedin: "https://www.linkedin.com/in/jaredleto/",
      twitter: "@JaredLeto",
    },
    thesisAlignment: "adjacent" as const,
    thesisNote:
      "Prolific angel investor with 41 investments across 23 companies including Uber, Robinhood, Reddit, Snap. Founded VyRT (live-streaming) and The Hive (social media management). His portfolio skews toward consumer tech and social platforms — the exact platforms that need child safety compliance. No direct child safety investments but strong pattern recognition for platform infrastructure.",
    coppaInterest: "none" as const,
    fundSignal: "active" as const,
    introPaths: [
      {
        type: "portfolio-founder" as const,
        description:
          "Leto's portfolio (Reddit, Snap, Robinhood) includes platforms directly impacted by child safety regulation. Phosra is the compliance API they need.",
        strength: 3,
      },
      {
        type: "industry-association" as const,
        description:
          "Founded VyRT (live-streaming) and The Hive (social media). He understands platform compliance challenges firsthand.",
        strength: 2,
      },
    ],
    tier: 3 as const,
    approachStrategy: {
      recommended: "Platform infrastructure thesis + portfolio companies as customers",
      steps: [
        "Connect through tech angel network or entertainment-tech community",
        "Frame: 'Your portfolio companies (Reddit, Snap) are spending millions on child safety compliance. Phosra automates it.'",
        "Emphasize the regulatory wave: 67 laws = every social platform in your portfolio needs this",
        "Propose small angel check ($25-50K) — Leto does high-volume, smaller checks",
      ],
      openingAngle:
        "Every social platform you've invested in faces child safety regulation. Phosra is the API that handles it.",
    },
    status: "identified" as const,
    notes:
      "Most recent investment: Moonlake AI Seed (October 2025). 18 portfolio exits. Investments span fintech, social media, AI, and crypto. Founded 3 companies. Smaller check sizes typical for his angel deals ($25-100K range). Lower priority for child safety alignment but high volume investor who is actively deploying. No children — the parent-founder angle doesn't apply here.",
  },
]
const POLICY_ANGELS: WarmIntroTarget[] = [
  // ─── TIER 1: Active investors with strong policy/regulatory backgrounds ─────

  {
    id: "ron-bouganim",
    name: "Ron Bouganim",
    fundOrCompany: "Govtech Fund",
    role: "Founder & Managing Partner",
    website: "https://govtechfund.com",
    category: "policy-angel",
    type: "angel",
    checkSizeRange: "$250-500K",
    stagePreference: "Seed",
    contact: {
      linkedin: "https://www.linkedin.com/in/ronbouganim/",
    },
    thesisAlignment: "perfect",
    thesisNote:
      "Founded the FIRST venture fund dedicated to govtech startups. Previously Accelerator Director at Code for America. Portfolio companies have worked with 35,000+ government agencies. Phosra's compliance API is exactly the type of infrastructure that powers government-mandated enforcement — a natural extension of his thesis.",
    coppaInterest: "portfolio-signal",
    fundSignal: "deploying",
    introPaths: [
      {
        type: "cold-application",
        description:
          "Govtech Fund accepts direct applications through their website. Strong thesis fit should get attention.",
        strength: 3,
      },
      {
        type: "industry-association",
        description:
          "Connect through Code for America network or govtech conference circuit where Bouganim is a regular speaker.",
        strength: 3,
      },
    ],
    tier: 1,
    approachStrategy: {
      recommended: "Direct pitch emphasizing regulatory infrastructure thesis",
      steps: [
        "Apply through Govtech Fund website with tailored deck emphasizing government compliance mandate",
        "Reference COPPA 2.0 April 2026 enforcement deadline creating platform-wide compliance demand",
        "Highlight how Phosra maps 45 enforcement categories across 67+ laws — exactly the infrastructure layer govtech needs",
        "Position as 'the compliance infrastructure layer' for the $130B regtech market",
      ],
      openingAngle:
        "COPPA 2.0 enforcement in April 2026 creates a government-mandated compliance market — Phosra is the infrastructure layer platforms need to comply.",
      timing: "Urgent — COPPA 2.0 deadline creates compelling near-term catalyst",
    },
    status: "identified",
    notes:
      "First-ever govtech VC fund ($50M across two funds). Writes $250-500K checks in early-stage companies focused on government operations. Serial entrepreneur with exits (Razz, CCI sold to British Telecom, Trymedia sold to Macrovision). Former angel investor in ShareThrough, HelloSign, PagerDuty. Check size may be slightly above Phosra's sweet spot but could anchor the round.",
  },

  {
    id: "dj-patil",
    name: "DJ Patil",
    fundOrCompany: "GreatPoint Ventures",
    role: "General Partner",
    website: "https://www.gpv.com/team/dj-patil",
    category: "policy-angel",
    type: "angel",
    checkSizeRange: "$250K-2M",
    stagePreference: "Seed / Series A",
    contact: {
      linkedin: "https://www.linkedin.com/in/dpatil/",
      twitter: "@daboraptor",
    },
    thesisAlignment: "good",
    thesisNote:
      "First US Chief Data Scientist under Obama. Wrote early check into Figma ($20B acquisition). GP at GreatPoint Ventures focusing on healthcare, enterprise tech, and national security. Data infrastructure and compliance automation are adjacent to his thesis. His government data background makes Phosra's structured approach to mapping 67+ laws to 45 rule categories particularly resonant.",
    coppaInterest: "portfolio-signal",
    fundSignal: "deploying",
    introPaths: [
      {
        type: "content-warmup",
        description:
          "Engage with his writing on data policy and AI ethics. Reference his work as Chief Data Scientist when framing Phosra's data-driven compliance approach.",
        strength: 2,
      },
      {
        type: "conference-event",
        description:
          "Patil speaks regularly at data and AI conferences. Approach at a relevant event with a concise pitch.",
        strength: 2,
      },
    ],
    tier: 1,
    approachStrategy: {
      recommended:
        "Frame Phosra as data infrastructure for compliance — resonates with his Chief Data Scientist background",
      steps: [
        "Engage with his LinkedIn/Twitter content on data policy and responsible AI",
        "Reference his government data background when framing Phosra's structured compliance data model",
        "Pitch as 'the data layer for child safety compliance' — maps to his enterprise infrastructure thesis",
        "Highlight that COPPA 2.0 creates a mandatory data compliance market similar to healthcare data standards he knows well",
      ],
      openingAngle:
        "As the first US Chief Data Scientist, you built the framework for open government data. Phosra is building the equivalent for child safety compliance — a structured data model across 67+ laws.",
    },
    status: "identified",
    notes:
      "GreatPoint Ventures invests $250K-$20M in Seed through Series B. Fund co-founded with Ray Lane (former Oracle President/COO). Notable early-stage portfolio: Figma, Confluent, Monte Carlo, Rebellion Defense. 157 total investments. His national security portfolio (Rebellion Defense) shows appetite for government-adjacent tech.",
  },

  {
    id: "nick-sinai",
    name: "Nick Sinai",
    fundOrCompany: "Insight Partners",
    role: "Managing Director",
    website: "https://www.insightpartners.com/team/nick-sinai/",
    category: "policy-angel",
    type: "angel",
    checkSizeRange: "$25-100K",
    stagePreference: "Seed / Series A",
    contact: {
      linkedin: "https://www.linkedin.com/in/nicksinai",
      twitter: "@nicksinai",
    },
    thesisAlignment: "perfect",
    thesisNote:
      "Former US Deputy CTO under Obama. Joined Insight Partners specifically to invest in govtech and public sector software. Led investment in Govly (govtech procurement). Board member at Rebellion Defense, BrightBytes (edtech). Teaches govtech at Harvard Kennedy School. His entire career arc — government CTO to govtech investor — makes Phosra's compliance infrastructure a perfect fit. Also makes personal angel investments in civic tech.",
    coppaInterest: "portfolio-signal",
    fundSignal: "active",
    introPaths: [
      {
        type: "content-warmup",
        description:
          "Engage with his Medium blog (nicksinai.medium.com) where he writes about govtech investing. Comment on his Insight Partners Government Advisory Board posts.",
        strength: 3,
      },
      {
        type: "alumni-network",
        description:
          "Harvard Kennedy School connection — he teaches a govtech class there. Reach out through HKS alumni or innovation lab networks.",
        strength: 2,
      },
      {
        type: "industry-association",
        description:
          "ACT-IAC and govtech conference circuit where Sinai is active.",
        strength: 2,
      },
    ],
    tier: 1,
    approachStrategy: {
      recommended:
        "Approach through govtech community with emphasis on government-mandated compliance creating new software category",
      steps: [
        "Engage with his Medium posts about govtech and government technology transformation",
        "Reference his work creating the US Digital Service and Open Data Initiative when framing Phosra's mission",
        "Pitch Phosra as the compliance infrastructure layer that government regulation is forcing platforms to adopt",
        "Highlight BrightBytes (edtech) parallel — he understands K-12/child-adjacent markets",
      ],
      openingAngle:
        "You helped build the government's digital infrastructure as US Deputy CTO. Now COPPA 2.0 is creating mandatory compliance infrastructure that every platform needs — Phosra is building it.",
      timing:
        "Insight Partners is a large fund ($30B+) but Sinai may make personal angel investments in pre-seed govtech or connect to right people at Insight.",
    },
    status: "identified",
    notes:
      "Insight Partners manages $30B+ but Sinai's personal brand is deeply govtech-focused. He co-founded the US Digital Corps and launched Insight's Government Advisory Board. His govtech network is unmatched. Even if Insight Partners' check size is too large for a $950K raise, Sinai himself may angel invest or provide invaluable warm intros to other govtech investors. Board seats at BrightBytes (edtech safety) and Rebellion Defense (government tech) show relevant pattern.",
  },

  {
    id: "aneesh-chopra",
    name: "Aneesh Chopra",
    fundOrCompany: "Arcadia / DGA-Albright Stonebridge Group",
    role: "Chief Strategy Officer / Senior Advisor",
    website: "https://arcadia.io/leadership/aneesh-chopra",
    category: "policy-angel",
    type: "angel",
    checkSizeRange: "$25-100K",
    stagePreference: "Seed",
    contact: {
      linkedin: "https://www.linkedin.com/in/apchopra",
    },
    thesisAlignment: "good",
    thesisNote:
      "First US Chief Technology Officer under Obama. Active angel investor with portfolio including Abridge (unicorn), Stride Health, and Marit Health. Co-founded CareJourney (acquired by Arcadia). His entire career is about using technology to improve government-mandated services. He championed open data and interoperability standards — Phosra's structured compliance API is exactly this pattern applied to child safety.",
    coppaInterest: "portfolio-signal",
    fundSignal: "active",
    introPaths: [
      {
        type: "content-warmup",
        description:
          "Engage through his Aspen Institute and DGA-Albright Stonebridge networks. Reference his open data and interoperability work when pitching.",
        strength: 2,
      },
      {
        type: "2nd-degree-strong",
        description:
          "DGA-Albright Stonebridge Group connection — advisory firm with deep government tech policy network. Nicole Wong is also an advisor there.",
        strength: 3,
      },
    ],
    tier: 1,
    approachStrategy: {
      recommended:
        "Frame Phosra as 'open data standards for child safety compliance' — maps directly to his life's work",
      steps: [
        "Connect through DGA-Albright Stonebridge Group advisory network",
        "Frame Phosra's 45 rule categories mapped across 67+ laws as an interoperability standard — mirrors his healthcare data work at CareJourney/Arcadia",
        "Emphasize that COPPA 2.0 creates the same kind of regulatory mandate that drove healthcare data standards adoption",
        "Reference his open government data initiatives and how Phosra extends that mission to child safety",
      ],
      openingAngle:
        "You championed open data and interoperability standards as the first US CTO. COPPA 2.0 is creating the same mandate for child safety — Phosra is building the interoperability layer.",
    },
    status: "identified",
    notes:
      "First US CTO (2009-2012). Latest angel investment: Marit Health (Seed, March 2025). Portfolio of 3 companies focused on healthcare and insurance. His CareJourney exit (acquired by Arcadia) shows he builds data infrastructure companies. DGA-Albright Stonebridge advisory role means he counsels tech companies on policy — natural overlap with Phosra's compliance mission. Check size likely $25-100K based on portfolio pattern.",
  },

  // ─── TIER 2: Strong policy backgrounds, adjacent thesis ────────────────────

  {
    id: "tom-wheeler",
    name: "Tom Wheeler",
    fundOrCompany: "Brookings Institution / Core Capital Partners (former)",
    role: "Visiting Fellow / Former FCC Chairman & VC",
    website: "https://www.brookings.edu/people/tom-wheeler/",
    category: "policy-angel",
    type: "angel",
    checkSizeRange: "$50-250K",
    stagePreference: "Seed / Series A",
    contact: {
      linkedin: "https://www.linkedin.com/in/tom-wheeler-fcc/",
      twitter: "@TomWheelerFCC",
    },
    thesisAlignment: "good",
    thesisNote:
      "Former FCC Chairman (2013-2017) and former VC at Core Capital Partners ($350M fund, early-stage IP-based companies). Serial entrepreneur who co-founded SmartBrief and launched multiple telecom companies. Author of 'Techlash' about tech regulation. Deep understanding of both regulation AND venture investing. His regulatory experience at FCC and venture background at Core Capital make him uniquely positioned to understand Phosra's compliance-as-infrastructure thesis.",
    coppaInterest: "public-stance",
    fundSignal: "unknown",
    introPaths: [
      {
        type: "content-warmup",
        description:
          "Engage with his Brookings publications on tech regulation. His 'Techlash' book is directly relevant to Phosra's mission.",
        strength: 2,
      },
      {
        type: "conference-event",
        description:
          "Wheeler speaks at major tech policy events. Approach at Brookings events or tech regulation conferences.",
        strength: 2,
      },
    ],
    tier: 2,
    approachStrategy: {
      recommended:
        "Approach through Brookings tech policy network emphasizing regulatory enforcement creating market opportunity",
      steps: [
        "Engage with his Brookings writing and 'Techlash' themes about tech accountability",
        "Reference his dual experience as FCC Chairman AND venture capitalist to frame the compliance-as-investment thesis",
        "Position COPPA 2.0 as the kind of regulatory inflection point he wrote about in 'Techlash'",
        "Pitch Phosra as the infrastructure that makes compliance feasible — the bridge between regulation and implementation",
      ],
      openingAngle:
        "You wrote 'Techlash' about the need for tech accountability. COPPA 2.0 enforcement in April 2026 is exactly that inflection — Phosra is the infrastructure that makes compliance possible.",
      timing:
        "His current focus is on AI regulation at Brookings, but child safety regulation is equally in his wheelhouse.",
    },
    status: "identified",
    notes:
      "31st FCC Chairman under Obama (2013-2017). Former MD at Core Capital Partners ($350M, early-stage VC, 2005-2013). Co-founded SmartBrief, launched multiple cable/wireless/video companies. Now Visiting Fellow at Brookings Governance Studies and Senior Fellow at Harvard Kennedy School. Investment activity status unknown post-FCC, but his VC background and regulatory expertise make him a high-value advisor/investor for compliance infrastructure. May be more valuable as advisor + small check than large investor.",
  },

  {
    id: "nicole-wong",
    name: "Nicole Wong",
    fundOrCompany: "NWong Strategies",
    role: "Principal / Former White House Deputy CTO",
    website: "https://about.me/nwong",
    category: "policy-angel",
    type: "angel",
    checkSizeRange: "$10-50K",
    stagePreference: "Pre-Seed / Seed",
    contact: {
      linkedin: "https://www.linkedin.com/in/nicole-wong-96b4335/",
      twitter: "@nicolewong",
    },
    thesisAlignment: "perfect",
    thesisNote:
      "Former White House Deputy CTO (2013-2014) focused on internet, privacy, and innovation policy. Former VP & Deputy General Counsel at Google, Legal Director of Products at Twitter. Advisor to Refactor Capital (VC fund) and Albright Stonebridge Group. Board member at Mozilla Foundation and Filecoin Foundation. Her entire career is at the intersection of tech platforms, privacy law, and content regulation — exactly Phosra's domain. She helped Google and Twitter navigate the same content and privacy regulations Phosra automates.",
    coppaInterest: "public-stance",
    fundSignal: "active",
    introPaths: [
      {
        type: "2nd-degree-strong",
        description:
          "Through Albright Stonebridge Group network — she advises there alongside Aneesh Chopra. If you connect with Chopra first, she's a natural second intro.",
        strength: 3,
      },
      {
        type: "content-warmup",
        description:
          "Engage with her privacy and platform regulation work. Reference her Google/Twitter experience navigating COPPA when pitching.",
        strength: 2,
      },
    ],
    tier: 2,
    approachStrategy: {
      recommended:
        "Approach through Albright Stonebridge or Refactor Capital networks, emphasizing platform compliance challenges she knows intimately",
      steps: [
        "Connect through Aneesh Chopra or Albright Stonebridge Group advisory network",
        "Reference her Google and Twitter experience navigating child safety and privacy regulations",
        "Frame Phosra as the tool she wished existed when she was Deputy General Counsel at Google dealing with COPPA",
        "Emphasize Phosra's advisory role at Refactor Capital means she's already evaluating startups in this space",
      ],
      openingAngle:
        "At Google and Twitter, you navigated child safety and privacy regulations from the inside. Phosra builds the compliance API that would have saved your legal team thousands of hours.",
    },
    status: "identified",
    notes:
      "Deputy CTO (2013-2014), Google VP & Deputy GC, Twitter Legal Director. Advisor to Refactor Capital (VC), Albright Stonebridge Group, AI Now Institute, Alliance for Securing Democracy. Board: Mozilla Foundation, Filecoin Foundation, Open Technology Fund. Her advisory role at Refactor Capital suggests she evaluates and likely co-invests in startups. Check size estimate is conservative but her network value and advisory credibility are very high. Potential advisor + small check combination.",
  },

  {
    id: "vivek-kundra",
    name: "Vivek Kundra",
    fundOrCompany: "The Trade Desk",
    role: "COO / Former Federal CIO",
    website: "https://www.thetradedesk.com",
    category: "policy-angel",
    type: "angel",
    checkSizeRange: "$25-100K",
    stagePreference: "Seed",
    contact: {
      linkedin: "https://www.linkedin.com/in/vivekkundra/",
    },
    thesisAlignment: "good",
    thesisNote:
      "First Federal CIO under Obama (2009-2011). Managed $80B in federal technology investments, led government's transition to cloud, and launched the open government movement. Now COO at The Trade Desk — an advertising technology company that must comply with data privacy regulations including COPPA. His dual perspective — government IT leader AND adtech executive — makes Phosra's compliance API directly relevant to his current work and investment thesis.",
    coppaInterest: "portfolio-signal",
    fundSignal: "unknown",
    introPaths: [
      {
        type: "content-warmup",
        description:
          "Reference his work at The Trade Desk navigating advertising data privacy regulations. COPPA compliance is directly relevant to adtech.",
        strength: 2,
      },
      {
        type: "2nd-degree-strong",
        description:
          "Through the Obama tech alumni network — Chopra, Sinai, Patil, Wong are all connected.",
        strength: 3,
      },
    ],
    tier: 2,
    approachStrategy: {
      recommended:
        "Approach through Obama administration tech alumni network, emphasizing The Trade Desk's own COPPA compliance needs",
      steps: [
        "Connect through Obama tech alumni network (Chopra, Sinai, Patil are all 1st-degree connections)",
        "Reference The Trade Desk's advertising data privacy challenges — they directly need COPPA compliance",
        "Frame Phosra as both a potential investment AND a strategic tool for The Trade Desk's compliance",
        "Highlight his federal CIO background managing government technology standards",
      ],
      openingAngle:
        "As Federal CIO, you managed government technology standards. At The Trade Desk, you navigate COPPA compliance daily. Phosra is the API bridge between both worlds.",
    },
    status: "identified",
    notes:
      "First Federal CIO (2009-2011). Managed $80B in tech investments, led government cloud transition. Post-government: EVP at Salesforce, COO at Sprinklr, COO at project44, now COO at The Trade Desk. Angel investment in Gospel Technology. The Trade Desk ($50B+ market cap) is directly affected by COPPA — advertising to children is heavily regulated. Small angel portfolio but high-value network connection and potential strategic angle.",
  },

  {
    id: "jennifer-pahlka",
    name: "Jennifer Pahlka",
    fundOrCompany: "Niskanen Center / Recoding America Fund",
    role: "Senior Fellow / Former White House Deputy CTO",
    website: "https://www.jenniferpahlka.com",
    category: "policy-angel",
    type: "angel",
    checkSizeRange: "$10-50K",
    stagePreference: "Pre-Seed / Seed",
    contact: {
      linkedin: "https://www.linkedin.com/in/jpahlka/",
      twitter: "@paaboraptor",
    },
    thesisAlignment: "good",
    thesisNote:
      "Founded Code for America — the flagship civic tech nonprofit. Former White House Deputy CTO. Now chairs the $120M Recoding America Fund to reform government at all levels. Author of 'Recoding America.' She defines the civic tech/govtech ecosystem and her endorsement carries enormous weight. Co-founded the US Digital Service (now DOGE's predecessor). Her $120M Recoding America Fund may also be a funding source.",
    coppaInterest: "portfolio-signal",
    fundSignal: "active",
    introPaths: [
      {
        type: "industry-association",
        description:
          "Code for America network and civic tech ecosystem are natural connection points. She's deeply embedded in the govtech community.",
        strength: 3,
      },
      {
        type: "content-warmup",
        description:
          "Engage with her 'Recoding America' book themes and Niskanen Center writing. Frame Phosra as implementing her vision of technology-enabled government compliance.",
        strength: 3,
      },
    ],
    tier: 2,
    approachStrategy: {
      recommended:
        "Approach through civic tech community, framing Phosra as implementing her 'Recoding America' vision for compliance",
      steps: [
        "Engage with her 'Recoding America' content — Phosra literally recodes compliance processes",
        "Connect through Code for America alumni network or Niskanen Center",
        "Frame COPPA 2.0 enforcement as an example of government mandates that need modern technology solutions",
        "Position the $120M Recoding America Fund as a potential funding or partnership channel",
      ],
      openingAngle:
        "You wrote 'Recoding America' about modernizing government processes. COPPA 2.0 enforcement in April 2026 needs exactly this — Phosra recodes child safety compliance from 67 laws into one API.",
    },
    status: "identified",
    notes:
      "Founded Code for America (2009), White House Deputy CTO, co-founded US Digital Service. Now chairs $120M Recoding America Fund and is senior fellow at Niskanen Center and Federation of American Scientists. Not confirmed as active angel investor, but her network, credibility, and the Recoding America Fund make her high-value. Even a $10K check + endorsement would be worth more than many larger investments. The Recoding America Fund itself could potentially invest in or partner with Phosra.",
  },

  {
    id: "nuala-oconnor",
    name: "Nuala O'Connor",
    fundOrCompany: "Walmart / EqualAI",
    role: "SVP & Chief Counsel, Digital Citizenship / Former DHS Chief Privacy Officer",
    website: "https://cdt.org/staff/nuala-oconnor/",
    category: "policy-angel",
    type: "angel",
    checkSizeRange: "$25-100K",
    stagePreference: "Pre-Seed / Seed",
    contact: {
      linkedin: "https://www.linkedin.com/in/nualao/",
      twitter: "@privacymama",
    },
    thesisAlignment: "perfect",
    thesisNote:
      "First Chief Privacy Officer at DHS. Former President & CEO of the Center for Democracy and Technology (CDT). Now SVP & Chief Counsel for Digital Citizenship at Walmart. Previously at Amazon (VP, Compliance & Consumer Trust) and GE (Global Privacy Leader). Her ENTIRE career is child safety, privacy compliance, and digital trust. Her Twitter handle is literally @privacymama. She managed COPPA-adjacent compliance at DoubleClick, Amazon, and now Walmart. She is the dream advisor-investor for Phosra.",
    coppaInterest: "public-stance",
    fundSignal: "unknown",
    introPaths: [
      {
        type: "content-warmup",
        description:
          "Engage with her privacy and digital citizenship work. Reference CDT's positions on children's privacy and COPPA reform.",
        strength: 3,
      },
      {
        type: "industry-association",
        description:
          "IAPP (International Association of Privacy Professionals) connections — she's a prominent member. Also connect through Future of Privacy Forum, Kekst CNC advisory board.",
        strength: 3,
      },
    ],
    tier: 1,
    approachStrategy: {
      recommended:
        "Approach through privacy professional networks (IAPP, FPF) emphasizing her unique perspective spanning government AND corporate compliance",
      steps: [
        "Connect through IAPP or Future of Privacy Forum where she's a recognized leader",
        "Reference her career spanning DHS privacy, CDT advocacy, Amazon compliance, and Walmart digital citizenship",
        "Frame Phosra as the tool that unifies the fragmented compliance landscape she's navigated across government and corporate roles",
        "Emphasize Walmart's own child safety compliance challenges — she may see strategic value beyond personal investment",
      ],
      openingAngle:
        "You've been the Chief Privacy Officer at DHS, led CDT, and now oversee digital citizenship at Walmart. You know better than anyone how fragmented child safety compliance is — Phosra unifies it into one API.",
    },
    status: "identified",
    notes:
      "First DHS CPO (2003-2005). CEO of CDT (2014-2019). Amazon VP Compliance & Consumer Trust. Now Walmart SVP Digital Citizenship. Twitter: @privacymama. Advisor to EqualAI, Kekst CNC, National Cyber Security Alliance. Not confirmed as active angel investor, but her career is perfectly aligned with Phosra's mission. At Walmart, she directly manages COPPA compliance for one of the world's largest retailers. Could be both investor AND customer/strategic advisor. Her endorsement in the child safety privacy community would be invaluable.",
  },

  // ─── TIER 3: Valuable for network and credibility ──────────────────────────

  {
    id: "sonal-shah",
    name: "Sonal Shah",
    fundOrCompany: "Georgetown Beeck Center / Case Foundation",
    role: "Professor & Founding Executive Director / Former White House Director of Social Innovation",
    website: "https://beeckcenter.georgetown.edu",
    category: "policy-angel",
    type: "angel",
    checkSizeRange: "$10-25K",
    stagePreference: "Pre-Seed / Seed",
    contact: {
      linkedin: "https://www.linkedin.com/in/sonalshah/",
    },
    thesisAlignment: "adjacent",
    thesisNote:
      "First Director of the White House Office of Social Innovation and Civic Participation under Obama. Senior Fellow at Case Foundation focused on impact investing. Founded Georgetown's Beeck Center for Social Impact & Innovation. Former Goldman Sachs VP and Google.org executive. Leads the G7 Impact Investing Working Group. Phosra's child safety mission aligns with her social innovation thesis, and her impact investing network could unlock philanthropic and impact-first capital sources.",
    coppaInterest: "none",
    fundSignal: "unknown",
    introPaths: [
      {
        type: "industry-association",
        description:
          "Georgetown Beeck Center hosts civic innovation events. Also accessible through Case Foundation impact investing network.",
        strength: 2,
      },
      {
        type: "2nd-degree-strong",
        description:
          "Obama administration alumni network connects to Chopra, Sinai, Wong, Kundra, and Patil.",
        strength: 3,
      },
    ],
    tier: 3,
    approachStrategy: {
      recommended:
        "Approach through impact investing angle and Georgetown social innovation community",
      steps: [
        "Connect through Georgetown Beeck Center or Case Foundation impact investing network",
        "Frame Phosra's child safety mission as social innovation with a venture-scale business model",
        "Reference her G7 Impact Investing work — Phosra generates measurable social impact (children protected) alongside financial returns",
        "Position Phosra as a model for the 'innovative models in the social sector' her White House office championed",
      ],
      openingAngle:
        "You founded the White House Office of Social Innovation to invest in scalable social impact models. Phosra protects children online while building venture-scale compliance infrastructure.",
    },
    status: "identified",
    notes:
      "Former White House Director of Social Innovation. Goldman Sachs VP, Google.org head of Global Development, Case Foundation Senior Fellow, Georgetown Beeck Center founder. Impact investing focus via G7 working group. Not a typical angel investor, but her impact investing network and social innovation credibility are valuable. Could unlock philanthropic capital sources (Case Foundation, Omidyar Network, etc.) and provide credibility with impact-focused LPs.",
  },
]
const PARENT_ANGELS: WarmIntroTarget[] = [
  {
    id: "tim-kendall",
    name: "Tim Kendall",
    fundOrCompany: "Common Metal",
    role: "Co-Founder & Partner",
    website: "https://www.commonmetal.com",
    category: "parent-angel",
    type: "angel",
    checkSizeRange: "$25-100K",
    stagePreference: "Seed",
    contact: {
      linkedin: "https://www.linkedin.com/in/tim-kendall-6572/",
    },
    thesisAlignment: "perfect",
    thesisNote:
      "Former Facebook monetization director and Pinterest president who had a personal awakening about tech's harm on his own kids — found himself 'holed up in the pantry' watching videos instead of being with his children. Built Moment app to combat screen addiction (9M downloads). Featured in The Social Dilemma. Sits on UCSF Benioff Children's Hospitals board focusing on children's mental health strategy. Invests in 'tech for good' with focus on consumer tech, preventative health, and mental health. Has made 20+ angel investments. Phosra's compliance infrastructure directly enables the regulatory framework he publicly champions.",
    coppaInterest: "public-stance",
    fundSignal: "active",
    introPaths: [
      {
        type: "content-warmup",
        description:
          "Engage with his Social Dilemma commentary and children's mental health board work at UCSF Benioff — position Phosra as the compliance layer that makes child protection enforceable, not just aspirational",
        strength: 2,
      },
      {
        type: "alumni-network",
        description:
          "Stanford GSB alumni network (class of '06) — check if Jake has Stanford connections who overlap",
        strength: 2,
      },
    ],
    tier: 1,
    approachStrategy: {
      recommended: "Lead with his personal story arc — Facebook monetization to Moment to children's hospital board. Phosra is the infrastructure layer for the movement he's been building toward.",
      steps: [
        "Research his Common Metal portfolio for overlapping investments in compliance/safety tech",
        "Engage with his children's mental health content on LinkedIn and social",
        "Reference his Congressional testimony on tech's impact on children",
        "Frame Phosra as the enforcement infrastructure that makes his UCSF Benioff work actionable at the platform level",
      ],
      openingAngle:
        "You've seen the problem from the inside (Facebook/Pinterest), built the consumer solution (Moment), and now advise the hospital system treating the fallout. Phosra is the missing compliance infrastructure layer — the 'Plaid of child safety' that gives your entire arc a regulatory backbone.",
    },
    status: "identified",
    notes:
      "Stanford GSB '06. Father of two. Previously Facebook's first monetization strategy lead, President of Pinterest. Built Moment (screen-time tracker, 9M downloads, closed 2021 after Apple/Google built native tools). Featured in Netflix's The Social Dilemma. Venture Partner at Tidemark. Board member at UCSF Benioff Children's Hospitals. Invests via Common Metal in early-stage 'tech for good.' Extremely strong thesis fit — one of the few angels who has literally built consumer child-safety products AND has a 20+ deal angel track record.",
  },

  {
    id: "chris-hulls",
    name: "Chris Hulls",
    fundOrCompany: "Life360 (Personal Investments)",
    role: "Co-Founder & Executive Chairman, Life360",
    website: "https://www.life360.com",
    category: "parent-angel",
    type: "angel",
    checkSizeRange: "$25-100K",
    stagePreference: "Seed",
    contact: {
      linkedin: "https://www.linkedin.com/in/chrishulls/",
    },
    thesisAlignment: "perfect",
    thesisNote:
      "Built the world's leading family safety platform (Life360, 70M+ users, $3B+ market cap, ASX-listed). Has made 26 angel investments including early bets on Ring and Tile (both acquired — Tile later by Life360 itself). As the founder of the category-defining family safety company, he deeply understands the regulatory compliance burden platforms face. Phosra solves a problem he's lived — making child safety compliance automatable for platforms that serve families.",
    coppaInterest: "public-stance",
    fundSignal: "active",
    introPaths: [
      {
        type: "industry-association",
        description:
          "Family safety tech ecosystem overlap — Life360 deals with COPPA/child safety compliance directly. Phosra's API would be relevant to Life360's compliance stack.",
        strength: 3,
      },
      {
        type: "content-warmup",
        description:
          "Engage through his podcast appearances and writing about family safety tech, then position Phosra as infrastructure that Life360 and similar platforms need",
        strength: 2,
      },
    ],
    tier: 1,
    approachStrategy: {
      recommended: "Position Phosra as solving the compliance problem Life360 faces — he knows firsthand how complex multi-jurisdiction child safety law is. Lead with the platform use case, then pivot to the angel opportunity.",
      steps: [
        "Map which child safety laws apply to Life360 using Phosra's registry — create a mini-audit as an outreach artifact",
        "Reach out on LinkedIn noting the shared family-safety mission and his angel track record",
        "Reference his 26 angel investments and position Phosra alongside his Ring/Tile pattern of investing in safety/tracking infrastructure",
        "Ask for both investment and strategic partnership consideration (Life360 as a potential Phosra customer)",
      ],
      openingAngle:
        "You've built the category-defining family safety platform. The regulatory landscape protecting those families is exploding — 67+ laws across jurisdictions. Phosra is the compliance infrastructure layer for every platform that serves families, including Life360.",
    },
    status: "identified",
    notes:
      "UC Berkeley Haas alum. Started Life360 with $30K from his mom and a community college professor. Company now valued at $3B+, publicly listed on ASX and NASDAQ. Transitioned to Executive Chairman in 2025 (Lauren Antonoff now CEO), freeing up bandwidth for angel investing. 26 angel investments including Ring (acquired by Amazon), Tile (acquired by Life360), Credible, Automatic, Honk, and Zendrive. Strong pattern of investing in safety/location infrastructure. Recently stepped back from day-to-day CEO role — likely has more time for angel investing.",
  },

  {
    id: "tony-fadell",
    name: "Tony Fadell",
    fundOrCompany: "Build Collective",
    role: "Principal",
    website: "https://www.buildc.com",
    category: "parent-angel",
    type: "angel",
    checkSizeRange: "$50-250K",
    stagePreference: "Pre-seed to Seed",
    contact: {
      linkedin: "https://www.linkedin.com/in/tfadell/",
      twitter: "@tfadell",
    },
    thesisAlignment: "perfect",
    thesisNote:
      "iPod inventor and iPhone co-designer who publicly agonizes about tech's impact on his kids — says he wakes up in 'cold sweats every so often thinking what did we bring to the world.' Founded Build Collective to invest in startups making the world 'greener, healthier, and safer.' Currently advising/investing in 200+ startups. His personal guilt about the devices he created, combined with his investment thesis of 'safer world' tech, makes Phosra a thesis-perfect investment.",
    coppaInterest: "public-stance",
    fundSignal: "deploying",
    introPaths: [
      {
        type: "content-warmup",
        description:
          "Engage through his 'Build' book community and Time Sensitive podcast appearances where he discusses building healthier technology for society",
        strength: 2,
      },
      {
        type: "conference-event",
        description:
          "Build Collective operates out of Station F in Paris — potential to connect at European tech events or through Station F ecosystem",
        strength: 1,
      },
    ],
    tier: 1,
    approachStrategy: {
      recommended: "Lead with his public 'cold sweats' admission about tech's impact on kids. Phosra is the compliance infrastructure that enforces the child safety regulations his devices helped necessitate — a direct way to address his stated concern.",
      steps: [
        "Reference his Build book and interviews about making technology safer",
        "Frame Phosra as the 'infrastructure play' he gravitates toward (iPod/Nest were both infrastructure-level bets)",
        "Highlight the 45 rule categories and 67+ laws — appeal to his engineering mindset about systematizing complexity",
        "Position as 'making the world safer' — directly aligned with Build Collective's stated mission",
      ],
      openingAngle:
        "You built the devices that changed childhood. You've said you wake up in cold sweats thinking about it. Phosra is the compliance infrastructure that makes child safety laws actually enforceable — 45 rule categories, 67+ laws, one API. This is the 'safer' in Build Collective's 'greener, healthier, safer.'",
    },
    status: "identified",
    notes:
      "Father of two. Created the iPod, co-created the iPhone, founded Nest Labs (acquired by Google for $3.2B). Now runs Build Collective (formerly Future Shape) from Paris's Station F. Advises/invests in 200+ startups. Portfolio includes Nothing, Turvo, Nabla. Deeply publicly remorseful about devices' impact on children. Advocates screen-free meals, tech-free family days, analog books. Check size likely larger than typical angel given his net worth. Paris-based but globally connected.",
  },

  {
    id: "brian-bason",
    name: "Brian Bason",
    fundOrCompany: "Bark Technologies",
    role: "CEO & Founder",
    website: "https://www.bark.us",
    category: "parent-angel",
    type: "angel",
    checkSizeRange: "$25-100K",
    stagePreference: "Seed",
    contact: {
      linkedin: "https://www.linkedin.com/in/brianbason/",
    },
    thesisAlignment: "perfect",
    thesisNote:
      "Founded Bark specifically as a parent who saw a 'critical void' in internet safety solutions for children. Bark now protects 6M+ children and serves 3,200+ school districts. As a serial entrepreneur (3 exits to Twitter, RadioIO, and SocialChorus), he has the background and liquidity for angel investing. Phosra's compliance API is directly complementary to Bark's monitoring product — Bark needs to comply with the laws Phosra tracks. Strong potential as both an angel investor and strategic partner.",
    coppaInterest: "public-stance",
    fundSignal: "unknown",
    introPaths: [
      {
        type: "industry-association",
        description:
          "Direct child safety tech ecosystem peer — Bark and Phosra are complementary products, not competitors. Bark monitors content; Phosra maps compliance requirements.",
        strength: 3,
      },
      {
        type: "content-warmup",
        description:
          "Engage through child safety tech conferences and Bark's public advocacy for online child protection",
        strength: 2,
      },
    ],
    tier: 1,
    approachStrategy: {
      recommended: "Position Phosra as directly complementary to Bark — Bark does content monitoring, Phosra maps the regulatory requirements that dictate what monitoring is needed. Lead with a 'compliance audit' showing how Phosra tracks the laws Bark must comply with.",
      steps: [
        "Create a Phosra compliance map specific to Bark's product (which laws apply, which rule categories overlap)",
        "Reach out via LinkedIn highlighting the complementary nature of both companies",
        "Propose both an angel investment and an exploration of Phosra as a Bark integration partner",
        "Reference Jake's parallel path as a parent-founder with multiple exits",
      ],
      openingAngle:
        "You built Bark because you saw a critical void in child safety as a parent. Phosra maps the 67+ laws and 45 rule categories that define what Bark needs to enforce — we're the compliance layer for the child safety ecosystem you're building.",
    },
    status: "identified",
    notes:
      "Father and parent-first founder. Physics degree from University of Colorado. Serial entrepreneur: CTO at Niche (acquired by Twitter), CEO of CrowdStream (acquired by RadioIO), CTO at YouCast Corp (acquired by SocialChorus). Founded Bark in 2015. Bark protects 6M+ children, serves 3,200+ school districts, raised $30M+ (Series C in 2022). Bark Phone named TIME Best Invention 2023. Angel investing track record unknown — but serial exit history and child safety focus make him ideal. Strong strategic investor potential.",
  },

  {
    id: "esther-wojcicki",
    name: "Esther Wojcicki",
    fundOrCompany: "Tract (Co-Founder) / Personal Investments",
    role: "Co-Founder of Tract; Educator & Author",
    website: "https://www.estherwojcicki.com",
    category: "parent-angel",
    type: "angel",
    checkSizeRange: "$25-50K",
    stagePreference: "Seed",
    contact: {
      linkedin: "https://www.linkedin.com/in/estherwojcicki/",
      twitter: "@EstherWojcicki",
    },
    thesisAlignment: "good",
    thesisNote:
      "Called the 'Godmother of Silicon Valley' — mother of YouTube CEO Susan Wojcicki, 23andMe founder Anne Wojcicki, and anthropologist Janet Wojcicki. Co-founded Tract (raised $7M from NEA), a platform where kids teach kids. Legendary educator who built the largest high school journalism program in the US. Deeply connected to Google/YouTube ecosystem through family and her role founding GoogleEdu. Her daughter Susan ran YouTube, which has faced significant COPPA enforcement — she understands this compliance challenge intimately through family context.",
    coppaInterest: "portfolio-signal",
    fundSignal: "active",
    introPaths: [
      {
        type: "content-warmup",
        description:
          "Engage through her education and parenting thought leadership — she's active on social media and at education conferences",
        strength: 2,
      },
      {
        type: "conference-event",
        description:
          "Frequent speaker at education and tech conferences — could connect at events like ASU GSV, SXSW Edu, or TechEmotion Summit",
        strength: 2,
      },
    ],
    tier: 2,
    approachStrategy: {
      recommended: "Lead with the education-to-compliance connection. Her daughter ran YouTube (which paid $170M in COPPA fines). Her Tract platform serves kids directly and needs compliance. Phosra maps the regulatory landscape for every platform serving children.",
      steps: [
        "Reference Tract's mission and how Phosra's compliance mapping would help any edtech platform serving children",
        "Note the YouTube/COPPA connection through her daughter Susan — she's aware of the stakes",
        "Attend an education technology conference where she's speaking and approach in person",
        "Frame Phosra as enabling safe, compliant innovation in the edtech space she champions",
      ],
      openingAngle:
        "You've built your life around empowering children through education and technology. Your daughter's platform paid $170M in COPPA fines. Your own platform, Tract, serves kids directly. Phosra ensures every edtech platform can navigate 67+ child safety laws confidently.",
    },
    status: "identified",
    notes:
      "Mother of three (Susan Wojcicki — YouTube CEO, Anne Wojcicki — 23andMe founder, Janet Wojcicki — epidemiologist). Co-founded Tract with former Uber exec Ari Memar (raised $7M seed from NEA). Founded Palo Alto High School media arts program (600+ students, 9 publications). CA Teacher of the Year 2002. Author of 'How to Raise Successful People.' Google/YouTube family connections provide unique insight into child safety compliance challenges. Check size likely smaller but comes with extraordinary Silicon Valley network and credibility.",
  },

  {
    id: "mike-lowe",
    name: "Mike Lowe",
    fundOrCompany: "A Parent Media Co. (Kidoodle.TV)",
    role: "Co-Founder & CEO",
    website: "https://www.kidoodle.tv",
    category: "parent-angel",
    type: "angel",
    checkSizeRange: "$25-100K",
    stagePreference: "Seed",
    contact: {
      linkedin: "https://www.linkedin.com/in/michael-lowe-08972566/",
    },
    thesisAlignment: "good",
    thesisNote:
      "Built A Parent Media Co. and Kidoodle.TV explicitly 'to make the digital media world a safer place for kids.' Pioneered 'Safe Streaming' — both a content platform (Kidoodle.TV, valued at CDN $600M+ after TriWest investment) and an ad-moderation service (Safe Exchange). As a platform that serves children directly, he faces the exact compliance challenges Phosra solves. Journalism background gives him a communication-first mindset. His company has raised $62M+ and achieved $11.5M revenue — he has the liquidity and network for angel investing in complementary child safety infrastructure.",
    coppaInterest: "public-stance",
    fundSignal: "unknown",
    introPaths: [
      {
        type: "industry-association",
        description:
          "Direct child safety streaming platform founder — Kidoodle.TV faces COPPA, KOSA, and international child safety compliance challenges that Phosra maps",
        strength: 3,
      },
      {
        type: "conference-event",
        description:
          "Active at Kidscreen Summit and children's media conferences — networking overlap opportunity",
        strength: 2,
      },
    ],
    tier: 1,
    approachStrategy: {
      recommended: "Position Phosra as the compliance infrastructure Kidoodle.TV needs — he's built a Safe Streaming platform but managing compliance across 67+ laws manually is unsustainable.",
      steps: [
        "Create a compliance audit showing which laws apply to Kidoodle.TV using Phosra's registry",
        "Reach out through child safety media industry connections or Kidscreen Summit networking",
        "Position both as angel investment opportunity AND potential Phosra customer/integration partner",
        "Highlight the parallel parent-founder story — Jake has 5 kids, Mike founded 'A Parent Media Co.'",
      ],
      openingAngle:
        "You literally named your company 'A Parent Media Co.' and invented Safe Streaming. The regulatory landscape protecting those kids is now 67+ laws and growing. Phosra maps all of them — we're the compliance API that makes Safe Streaming legally bulletproof across every jurisdiction.",
    },
    status: "identified",
    notes:
      "Father. Co-founded Kidoodle.TV with Neil Gruninger in 2012. Calgary, Canada-based. A Parent Media Co. valued at CDN $600M+ after TriWest Capital Partners investment ($62M+ total raised). $11.5M revenue in 2024. 118-person team. Journalism background. Pioneered Safe Streaming and Safe Exchange (ad moderation). Titles himself 'Dad, Co-Founder & CEO' on Crunchbase. Strong strategic investor potential — Kidoodle.TV would be an ideal Phosra customer. Check size and angel track record unconfirmed, but the CDN $600M valuation and multiple funding rounds suggest significant personal liquidity.",
  },
]
const FINTECH_ANGELS: WarmIntroTarget[] = [
  {
    id: "zach-perret",
    name: "Zach Perret",
    fundOrCompany: "Plaid / Mischief Ventures",
    role: "CEO & Co-Founder, Plaid; GP, Mischief Ventures",
    website: "https://zachperret.com",
    category: "fintech-angel",
    type: "angel",
    checkSizeRange: "$25-100K",
    stagePreference: "Pre-Seed / Seed",
    contact: {
      linkedin: "https://linkedin.com/in/zperret",
      twitter: "@zachperret",
    },
    thesisAlignment: "perfect",
    thesisNote:
      "Phosra is literally 'the Plaid of child safety' — Zach built the API-first infrastructure playbook for financial data. He understands exactly what a compliance API layer looks like at scale. Mischief Ventures ($30M fund with Lauren Farleigh) is hyper people-driven and invests $1.5-3M checks in pre-seed/seed software. His personal angels are smaller ($25-100K). He recently invested in Fragment (2024) and Comulate (Feb 2025), showing active deployment. The 'Plaid of X' framing is both flattering and immediately legible to him.",
    coppaInterest: "portfolio-signal",
    fundSignal: "deploying",
    introPaths: [
      {
        type: "cold-application",
        description:
          "The 'Plaid of child safety' metaphor is the ultimate warm opener. Reference his Acquired.fm episode and how Plaid's infrastructure-layer thesis maps perfectly to compliance. Reach via zachperret.com or X DM.",
        strength: 3,
      },
      {
        type: "alumni-network",
        description:
          "Mastercard network — Plaid partners deeply with Mastercard Open Banking. Jake's MC background creates a shared language.",
        strength: 3,
      },
    ],
    tier: 1,
    approachStrategy: {
      recommended: "Personal email via zachperret.com + X DM",
      steps: [
        "Lead with 'I built the Plaid of child safety compliance' — one sentence that maps to his entire worldview",
        "Reference how Plaid standardized 12,000+ FI connections the same way Phosra standardizes 67+ child safety laws into 45 rule categories",
        "Mention Jake's Mastercard infrastructure background — Plaid partners with MC Open Banking",
        "Ask for 30 min to demo the API and discuss infrastructure-layer compliance",
      ],
      openingAngle:
        "Plaid proved that messy, fragmented regulatory data (bank APIs) could be unified into a single developer-friendly layer. Phosra does the same for the child safety compliance landscape — 67 laws, 45 rule categories, one API.",
    },
    status: "identified",
    notes:
      "Mischief fund does $1.5-3M checks (too large for a $950K round unless leading). Better angle may be personal angel check ($25-100K). Mischief is generalist software, founder-driven, not thesis-driven — so the pitch must be about Jake as a founder, not just the market.",
  },

  {
    id: "william-hockey",
    name: "William Hockey",
    fundOrCompany: "Column / Plaid",
    role: "Co-Founder, Plaid; Co-CEO, Column",
    website: "https://column.com",
    category: "fintech-angel",
    type: "angel",
    checkSizeRange: "$5-50K",
    stagePreference: "Pre-Seed / Seed",
    contact: {
      linkedin: "https://linkedin.com/in/william-hockey-04536710",
      twitter: "@wrhockey",
    },
    thesisAlignment: "perfect",
    thesisNote:
      "Co-founded Plaid and now building Column (the only nationally chartered bank built for developers). He is among the most prolific fintech angel investors with 38-49 documented investments including Stytch ($1B valuation), Spenmo, Goldsky, Ethena, and Zero Hash. His latest investment was Town (Seed, March 2025) — so actively deploying. He deeply understands API-first infrastructure in regulated industries. Column itself operates in the most regulated layer of fintech (banking charter), so compliance infrastructure resonates at a DNA level.",
    coppaInterest: "portfolio-signal",
    fundSignal: "deploying",
    introPaths: [
      {
        type: "cold-application",
        description:
          "Same 'Plaid of child safety' hook. Column's regulated-infrastructure thesis makes compliance API even more resonant.",
        strength: 3,
      },
      {
        type: "2nd-degree-weak",
        description:
          "Through Mastercard/Plaid partnership channels. Also potential intro via any mutual connections in the Stytch or Column ecosystem.",
        strength: 2,
      },
    ],
    tier: 1,
    approachStrategy: {
      recommended: "LinkedIn message + X DM, reference Column's regulated-infra thesis",
      steps: [
        "Open with 'Plaid of child safety' metaphor — he co-built the original Plaid",
        "Draw parallel between Column's 'bank built for developers' and Phosra's 'compliance API built for platforms'",
        "Emphasize that child safety compliance is the next wave of regulation that needs an infrastructure layer (like banking needed Column)",
        "Reference Jake's Mastercard background — he understands payment infrastructure deeply",
      ],
      openingAngle:
        "You built the infrastructure layer for financial data (Plaid) and banking (Column). I'm building it for child safety compliance — 67 laws, 45 rule categories, one API. Same thesis, different vertical.",
    },
    status: "identified",
    notes:
      "Check size ($5-50K sweet spot $25K) fits perfectly in a $950K round. Extremely prolific — 38+ investments means he moves fast and does volume. Column's regulated-infra DNA makes this a natural fit.",
  },

  {
    id: "jean-denis-greze",
    name: "Jean-Denis Greze",
    fundOrCompany: "Plaid / ASDF Ventures",
    role: "CTO, Plaid; Co-Investor, ASDF Ventures",
    website: "https://greze.com",
    category: "fintech-angel",
    type: "angel",
    checkSizeRange: "$25-100K",
    stagePreference: "Seed / Series A",
    contact: {
      linkedin: "https://linkedin.com/in/jeandenisgreze",
      twitter: "@jdgreze",
    },
    thesisAlignment: "perfect",
    thesisNote:
      "As Plaid's CTO, Jean-Denis literally built the technical infrastructure that Phosra's 'Plaid of child safety' metaphor references. He has 17 angel investments focused on AI, fintech, and developer tools — all of which describe Phosra. His ASDF Ventures co-investor role shows formalized angel activity. Investment range reported at $100K-5M (with ASDF), but personal angel checks likely $25-100K. Recent investments include Harmony Intelligence, Formal, Frigade, and Loops — all developer-focused tools.",
    coppaInterest: "portfolio-signal",
    fundSignal: "active",
    introPaths: [
      {
        type: "cold-application",
        description:
          "As Plaid CTO, the 'Plaid of child safety' metaphor resonates even more technically. Can speak to API architecture and data standardization challenges.",
        strength: 3,
      },
      {
        type: "2nd-degree-weak",
        description:
          "Through Plaid's developer ecosystem or Mastercard Open Banking partnership channels.",
        strength: 2,
      },
    ],
    tier: 1,
    approachStrategy: {
      recommended: "Email via greze.com + LinkedIn DM with technical depth",
      steps: [
        "Lead with technical framing: 'I built the Plaid of child safety — here's how the API architecture maps 67 laws to 45 rule categories'",
        "Emphasize the developer-tool angle — Phosra is a developer-first API, same as Plaid",
        "Reference his investments in developer tools (Formal, Frigade, Loops) and how Phosra fits that portfolio",
        "Offer a technical deep-dive on the API architecture — CTO-to-CTO credibility",
      ],
      openingAngle:
        "You built Plaid's technical infrastructure. I built the same thing for child safety compliance — a single API that standardizes 67 laws into 45 enforceable rule categories. I'd love to walk you through the architecture.",
    },
    status: "identified",
    notes:
      "The CTO angle is powerful — he can evaluate the technical architecture and provide signal. Getting both Zach Perret AND Jean-Denis Greze would be the ultimate validation of the 'Plaid of child safety' positioning. His 20VC appearance shows he's publicly engaged in the ecosystem.",
  },

  {
    id: "jason-gardner",
    name: "Jason Gardner",
    fundOrCompany: "Marqeta",
    role: "Founder, Marqeta (3x Founder, IPO exit)",
    website: "https://marqeta.com",
    category: "fintech-angel",
    type: "angel",
    checkSizeRange: "$5-50K",
    stagePreference: "Pre-Seed / Seed",
    contact: {
      linkedin: "https://linkedin.com/in/jasonmatthewgardner",
      twitter: "@jasonmgardner",
    },
    thesisAlignment: "good",
    thesisNote:
      "Jason Gardner founded Marqeta (card issuing infrastructure — think 'Plaid for card programs') and took it through IPO in 2021. He's a 3x founder like Jake (PropertyBridge acquired by MoneyGram, Vertical Think, then Marqeta). His angel portfolio of 12 companies includes Zilch and Zero Hash (both unicorns). His $5-50K check size with $25K sweet spot fits perfectly in a $950K round. Marqeta itself provides compliance tools (spend controls, fraud detection) — so compliance infrastructure resonates. Currently guides Marqeta's Payments Innovation Committee.",
    coppaInterest: "portfolio-signal",
    fundSignal: "active",
    introPaths: [
      {
        type: "2nd-degree-strong",
        description:
          "Both are 3x founders who built payment infrastructure. Jake (3 exits, Mastercard) and Jason (3 companies, Marqeta IPO) share the serial-founder DNA.",
        strength: 3,
      },
      {
        type: "2nd-degree-weak",
        description:
          "Mastercard invested in Marqeta ecosystem companies (Synctera). MC alumni network could surface direct connection.",
        strength: 2,
      },
    ],
    tier: 1,
    approachStrategy: {
      recommended: "Founder-to-founder cold email via LinkedIn",
      steps: [
        "Lead with shared DNA: both 3x founders who built payment/compliance infrastructure",
        "Reference how Marqeta's card-issuing infrastructure playbook maps to Phosra's compliance API infrastructure",
        "Emphasize the 'infrastructure layer for a fragmented market' thesis — card issuing was fragmented like child safety compliance is now",
        "Mention Mastercard connection — MC invested in Marqeta's ecosystem (Synctera)",
      ],
      openingAngle:
        "Fellow 3x founder here. You built the infrastructure layer for card issuing. I'm building it for child safety compliance — same fragmented-market-needs-an-API thesis, powered by my Mastercard infrastructure background.",
    },
    status: "identified",
    notes:
      "Perfect check size for the round ($25K sweet spot). 3x founder parallel creates immediate rapport. His post-Marqeta phase (stepped down as CEO 2023, then Executive Chairman through 2024) means he has time and capital to deploy. Currently on Innovation Committee so still thinking about payments/compliance infrastructure.",
  },

  {
    id: "claire-hughes-johnson",
    name: "Claire Hughes Johnson",
    fundOrCompany: "Stripe (Former COO)",
    role: "Former COO, Stripe; Author, 'Scaling People'; Angel Investor",
    website: "https://linkedin.com/in/claire-hughes-johnson-7058",
    category: "fintech-angel",
    type: "angel",
    checkSizeRange: "$25-100K",
    stagePreference: "Seed / Series A",
    contact: {
      linkedin: "https://linkedin.com/in/claire-hughes-johnson-7058",
      twitter: "@chabornevik",
    },
    thesisAlignment: "good",
    thesisNote:
      "Former Stripe COO (2014-2021) who helped scale Stripe from a payments startup to a $95B infrastructure company. Now an active angel investor with 20+ portfolio companies across enterprise apps, fintech, and developer tools. Recent investments include Stainless (Dec 2024) and Quanta (Dec 2025) — actively deploying. She also invested in Duna (identity verification) alongside other Stripe execs, showing interest in compliance-adjacent infrastructure. Her Stripe experience means she deeply understands API-first infrastructure businesses and platform compliance challenges.",
    coppaInterest: "portfolio-signal",
    fundSignal: "deploying",
    introPaths: [
      {
        type: "cold-application",
        description:
          "Stripe's compliance challenges (KYC, AML, payment regulations) parallel child safety compliance. Her operational lens would appreciate Phosra's infrastructure approach.",
        strength: 2,
      },
      {
        type: "2nd-degree-strong",
        description:
          "Xtripe (Stripe alumni angel syndicate) or Stripe alumni network could provide warm intro. Also Yale SOM alumni network.",
        strength: 3,
      },
    ],
    tier: 2,
    approachStrategy: {
      recommended: "LinkedIn DM + warm intro through Stripe alumni / Xtripe syndicate",
      steps: [
        "Reference Stripe's own compliance infrastructure journey — she lived it as COO",
        "Position Phosra as 'Stripe for child safety compliance' — she built the ops that made Stripe's API-first model work",
        "Highlight that child safety is where payment compliance was 10 years ago — fragmented, manual, about to be automated",
        "Mention her Duna investment (identity verification) as a compliance-adjacent analog",
      ],
      openingAngle:
        "You scaled Stripe's compliance and API infrastructure as COO. Child safety compliance is at the same inflection point payment regulations were when you joined Stripe — fragmented across 67 laws, ripe for an API-first solution.",
    },
    status: "identified",
    notes:
      "Her book 'Scaling People' and public presence (Yale SOM, speaking circuit) make her accessible. The Stripe compliance angle is strong — she understood first-hand how regulatory complexity creates demand for infrastructure. Her Duna investment signals interest in compliance/identity infrastructure.",
  },

  {
    id: "jim-mckelvey",
    name: "Jim McKelvey",
    fundOrCompany: "Square (Co-Founder) / FINTOP Capital / Cultivation Capital",
    role: "Co-Founder, Square; Co-Founder, FINTOP Capital; Author, 'The Innovation Stack'",
    website: "https://linkedin.com/in/mckelveyjim",
    category: "fintech-angel",
    type: "angel",
    checkSizeRange: "$25-100K",
    stagePreference: "Seed",
    contact: {
      linkedin: "https://linkedin.com/in/mckelveyjim",
      twitter: "@jimmckelvey",
    },
    thesisAlignment: "good",
    thesisNote:
      "Co-founded Square with Jack Dorsey — built the payment infrastructure that democratized card acceptance. Now runs FINTOP Capital (fintech-focused VC co-founded ~2016) and co-founded Cultivation Capital (ranked 7th most active VC since 2009). His book 'The Innovation Stack' details how Square created an innovation stack in payments — Phosra is creating one for child safety compliance. Serial founder (8+ companies) like Jake. Angel portfolio of ~10 companies spans fintech, healthtech, and consumer. He's based in St. Louis, not SF, which broadens the network.",
    coppaInterest: "none",
    fundSignal: "active",
    introPaths: [
      {
        type: "2nd-degree-strong",
        description:
          "Both are serial founders who built payment infrastructure. His Innovation Stack thesis maps perfectly to Phosra's approach.",
        strength: 3,
      },
      {
        type: "industry-association",
        description:
          "FINTOP Capital specifically focuses on fintech — could be a fund-level investment path as well as personal angel.",
        strength: 3,
      },
    ],
    tier: 2,
    approachStrategy: {
      recommended: "Approach through FINTOP Capital or direct LinkedIn outreach",
      steps: [
        "Reference 'The Innovation Stack' — Phosra is building an innovation stack for child safety compliance",
        "Draw parallel between Square democratizing payments and Phosra democratizing compliance",
        "Mention FINTOP's fintech focus — this is fintech-adjacent infrastructure (compliance for platforms that handle payments/data)",
        "Highlight Jake's Mastercard background — shared payments infrastructure DNA",
      ],
      openingAngle:
        "Your Innovation Stack thesis at Square — creating multiple interlocking innovations to solve a problem no one else can — is exactly what we're building for child safety compliance. 67 laws, 45 rule categories, one API.",
    },
    status: "identified",
    notes:
      "FINTOP Capital path could yield either a personal angel check or fund-level investment. His St. Louis base means he's less inundated with SF deal flow. The Innovation Stack framing is a compelling hook. Cultivation Capital co-founding shows he actively builds investor networks.",
  },

  {
    id: "omri-dahan",
    name: "Omri Dahan",
    fundOrCompany: "Marqeta / Stage 2 Capital",
    role: "Former CRO, Marqeta (employee #1 to IPO); Partner, Stage 2 Capital",
    website: "https://stage2.capital/team/omri-dahan",
    category: "fintech-angel",
    type: "angel",
    checkSizeRange: "$5-50K",
    stagePreference: "Seed / Series A",
    contact: {
      linkedin: "https://linkedin.com/in/omridahan",
      twitter: "@omaborana",
    },
    thesisAlignment: "good",
    thesisNote:
      "Led Marqeta's commercial organization from first dollar of revenue to IPO filing. Now a Partner at Stage 2 Capital and active angel with 10+ investments ($5-50K range, $25K sweet spot). Invested in Synctera alongside Mastercard and in Vertice (SaaS optimization). His career arc (White House > Trium Group consulting > Marqeta CRO) shows interest in regulated industries and institutional relationships. Ranked on payments, SaaS, and Web3 investor lists. His Mastercard co-investment in Synctera creates a direct connection to Jake's MC background.",
    coppaInterest: "none",
    fundSignal: "active",
    introPaths: [
      {
        type: "alumni-network",
        description:
          "Omri co-invested with Mastercard in Synctera's Series A. Jake's Mastercard background creates immediate common ground.",
        strength: 4,
      },
      {
        type: "2nd-degree-strong",
        description:
          "Jason Gardner (Marqeta founder) could intro if we connect with him first.",
        strength: 3,
      },
    ],
    tier: 2,
    approachStrategy: {
      recommended: "LinkedIn DM referencing Mastercard + Marqeta overlap",
      steps: [
        "Open with the Mastercard connection — he co-invested with MC in Synctera, Jake built on MC infrastructure",
        "Reference his Marqeta journey: building payment infrastructure from zero to IPO parallels Phosra's compliance infrastructure play",
        "Highlight that Phosra serves the same platforms Marqeta serves (fintechs, neobanks, tech companies) with compliance infrastructure",
        "Mention his White House background — government/regulation connection adds relevance",
      ],
      openingAngle:
        "You built Marqeta's go-to-market from first dollar to IPO, and co-invested with Mastercard in Synctera. I'm a Mastercard alum building the compliance infrastructure layer for child safety — serving the same platforms you helped scale at Marqeta.",
    },
    status: "identified",
    notes:
      "His White House background adds an interesting regulatory awareness dimension. Stage 2 Capital partnership could amplify beyond personal angel check. The Mastercard/Synctera co-investment is the strongest intro path on this entire list — a direct, concrete connection. Check size fits perfectly in $950K round.",
  },

  {
    id: "renaud-laplanche",
    name: "Renaud Laplanche",
    fundOrCompany: "Upgrade / LendingClub (Founder)",
    role: "Co-Founder & CEO, Upgrade; Founder, LendingClub",
    website: "https://renaudlaplanche.com",
    category: "fintech-angel",
    type: "angel",
    checkSizeRange: "$25-100K",
    stagePreference: "Seed",
    contact: {
      linkedin: "https://linkedin.com/in/renaudlaplanche",
      twitter: "@RLaplanche",
    },
    thesisAlignment: "adjacent",
    thesisNote:
      "Founded LendingClub (IPO in 2014, $870M raised) and now leads Upgrade (valued at $6.3B), both in regulated fintech. As a fintech founder who's navigated SEC enforcement and heavy lending regulation, he intimately understands the compliance burden platforms face. His 5 angel investments are smaller volume but high conviction. LendingClub's SEC issues actually reinforce why compliance infrastructure matters — he learned this lesson the hard way. Upgrade provides credit and mobile banking products that must comply with extensive consumer protection regulations.",
    coppaInterest: "none",
    fundSignal: "unknown",
    introPaths: [
      {
        type: "cold-application",
        description:
          "The regulated-fintech founder angle. He's lived through compliance challenges at both LendingClub and Upgrade. Reach via renaudlaplanche.com.",
        strength: 2,
      },
      {
        type: "2nd-degree-weak",
        description:
          "French-American fintech community is tight-knit. SF fintech ecosystem overlap with Mastercard network.",
        strength: 2,
      },
    ],
    tier: 2,
    approachStrategy: {
      recommended: "Personal email via renaudlaplanche.com, compliance-cost angle",
      steps: [
        "Lead with the compliance burden angle — he's lived it at LendingClub and Upgrade",
        "Position child safety compliance as the next major regulatory wave that will hit every platform (including consumer fintech like Upgrade)",
        "Reference the cost of non-compliance — LendingClub's SEC experience makes this visceral",
        "Ask for introductions to his fintech network even if he doesn't invest personally",
      ],
      openingAngle:
        "You've built two companies in heavily regulated fintech and know the compliance burden firsthand. Child safety is the next regulatory wave — 67 laws and counting. I'm building the infrastructure to automate it.",
    },
    status: "identified",
    notes:
      "Lower angel volume (5 investments) means he's more selective — needs a compelling pitch. The SEC/LendingClub history actually makes compliance infrastructure MORE resonant, not less. Upgrade's $6.3B valuation means he has significant capital. As CEO of Upgrade, he's busy — may be harder to reach. The compliance-cost angle is the best hook.",
  },
]

// ─── Faith & Family-Aligned Investors ────────────────────────────────────────

const FAITH_FAMILY: WarmIntroTarget[] = [
  // ─── Tier 1 ───────────────────────────────────────────────────────────────

  {
    id: "sovereigns-capital",
    name: "Phil Jung",
    fundOrCompany: "Sovereign's Capital",
    role: "Co-Founder & Managing Partner",
    category: "faith-family" as const,
    type: "vc" as const,
    checkSizeRange: "$300K–$4M",
    stagePreference: "Seed / Series A",
    contact: {
      linkedin: "https://www.linkedin.com/in/philjung/",
      website: "https://www.sovereignscapital.com",
    },
    thesisAlignment: "perfect" as const,
    thesisNote:
      "Explicitly faith-driven fund whose LP base views child protection as Christian stewardship; B2B software focus maps directly to Phosra's compliance infrastructure play.",
    coppaInterest: "portfolio-signal" as const,
    fundSignal: "deploying" as const,
    introPaths: [
      {
        type: "conference-event" as const,
        description:
          "Faith Driven Investor annual conference — Phil Jung is a regular speaker and panelist; warm room for direct conversation.",
        strength: 4 as 1 | 2 | 3 | 4 | 5,
      },
      {
        type: "conference-event" as const,
        description:
          "SENT Summit at Notre Dame — Sovereign's Capital is a featured investor; pitch competition and investor-founder mixers provide natural intro moments.",
        strength: 4 as 1 | 2 | 3 | 4 | 5,
      },
      {
        type: "industry-association" as const,
        description:
          "Faith Driven Entrepreneur online community (Slack + forum) — post content on child-safety regulation to establish presence before direct outreach.",
        strength: 3 as 1 | 2 | 3 | 4 | 5,
      },
    ],
    tier: 1 as 1 | 2 | 3,
    approachStrategy: {
      recommended: "Faith Driven Investor conference warm intro",
      steps: [
        "Join the Faith Driven Investor community and engage authentically in the forums for 2–3 weeks before outreach.",
        "Attend (or secure a speaker slot at) the annual Faith Driven Investor conference; Phil Jung is typically on stage.",
        "Request a 20-minute coffee at the conference by citing shared stewardship values and the LP interest in child protection.",
        "Follow up with a one-pager framing Phosra as 'infrastructure for Biblical stewardship of digital spaces for children.'",
      ],
      openingAngle:
        "Your LPs believe protecting children online is an act of Christian stewardship — Phosra is the B2B compliance layer that makes that protection enforceable at scale.",
    },
    status: "identified" as const,
    notes:
      "Sovereign's Capital Fund IV ($60M) is actively deploying into B2B software at Seed/Series A, which is an exact stage and sector match. The LP base's faith framing around child protection is unusually direct alignment for a compliance infrastructure pitch.",
    relevantPortfolio: ["Level3 AI", "Fakespot"],
  },

  {
    id: "waterstone-tebow",
    name: "Tommy Martin / Tim Tebow",
    fundOrCompany: "WaterStone Impact Fund",
    role: "Managing Partner / Co-Founder",
    category: "faith-family" as const,
    type: "impact-fund" as const,
    checkSizeRange: "$500K–$3M",
    stagePreference: "Seed / Series A",
    contact: {
      website: "https://www.waterstoneimpactfund.com",
    },
    thesisAlignment: "perfect" as const,
    thesisNote:
      "Carried interest flows directly to Tim Tebow Foundation anti-child-trafficking operations across 95+ countries; Tebow testified before Congress on child exploitation in March 2024 — mission alignment is foundational, not incidental.",
    coppaInterest: "public-stance" as const,
    fundSignal: "deploying" as const,
    introPaths: [
      {
        type: "conference-event" as const,
        description:
          "Tim Tebow Foundation events (Night to Shine gala network, annual fundraiser circuit) — Tommy Martin and Tebow regularly appear together; sponsor or attend to get a warm room introduction.",
        strength: 4 as 1 | 2 | 3 | 4 | 5,
      },
      {
        type: "cold-application" as const,
        description:
          "WaterStone Impact Fund accepts inbound applications via waterstoneimpactfund.com; lead with the anti-exploitation angle in the subject line.",
        strength: 3 as 1 | 2 | 3 | 4 | 5,
      },
      {
        type: "industry-association" as const,
        description:
          "Connect through National Center for Missing & Exploited Children (NCMEC) or Thorn network events where Tebow Foundation staff are regularly present.",
        strength: 3 as 1 | 2 | 3 | 4 | 5,
      },
    ],
    tier: 1 as 1 | 2 | 3,
    approachStrategy: {
      recommended: "Tim Tebow Foundation event sponsorship / attendance",
      steps: [
        "Identify the next Tim Tebow Foundation Night to Shine or regional fundraiser and sponsor at the lowest tier that includes a table.",
        "Prepare a one-slide impact statement showing how Phosra reduces child exploitation surface area on digital platforms.",
        "Request 10 minutes with Tommy Martin framing Phosra as 'the compliance infrastructure that makes the platforms TTF already pressures actually enforce child safety law.'",
        "Offer a co-branded impact report for the fund's LPs showing COPPA/KOSA enforcement metrics Phosra generates.",
      ],
      openingAngle:
        "Every dollar your fund invests in Phosra generates enforceable child safety compliance across the platforms Tim Tebow Foundation already targets — turning advocacy into auditable infrastructure.",
    },
    status: "identified" as const,
    notes:
      "WaterStone is one of the only funds in existence whose GP carry is explicitly redirected to anti-child-exploitation operations; Phosra's product is a direct force-multiplier for that mission and the pitch almost writes itself. Fund launched October 2024 so deployment is early-stage.",
    relevantPortfolio: ["eFuse"],
  },

  {
    id: "halogen-ventures",
    name: "Jesse Draper",
    fundOrCompany: "Halogen Ventures",
    role: "Founding Partner",
    category: "faith-family" as const,
    type: "vc" as const,
    checkSizeRange: "$500K–$2M",
    stagePreference: "Pre-Seed / Seed",
    contact: {
      linkedin: "https://www.linkedin.com/in/jessedraper/",
      twitter: "https://twitter.com/jessedraper",
      website: "https://www.halogenvc.com",
    },
    thesisAlignment: "perfect" as const,
    thesisNote:
      "Fund III mandate explicitly covers Childcare, EdTech, FamTech, and Child & Youth Services — Phosra sits at the intersection of all four. Jesse is a mother of three boys with personal skin in the child-safety space.",
    coppaInterest: "portfolio-signal" as const,
    fundSignal: "deploying" as const,
    introPaths: [
      {
        type: "conference-event" as const,
        description:
          "TechCrunch Disrupt and TechCrunch events — Jesse Draper is a frequent speaker and judge; natural warm conversation setting.",
        strength: 4 as 1 | 2 | 3 | 4 | 5,
      },
      {
        type: "2nd-degree-strong" as const,
        description:
          "Draper VC dynasty network — Tim Draper (grandfather fund) and Draper Associates portfolio founders are reachable connectors to Jesse.",
        strength: 3 as 1 | 2 | 3 | 4 | 5,
      },
      {
        type: "content-warmup" as const,
        description:
          "Jesse is active on Twitter/X commenting on FamTech and child safety regulation; engage thoughtfully on KOSA and COPPA threads before cold outreach.",
        strength: 3 as 1 | 2 | 3 | 4 | 5,
      },
    ],
    tier: 1 as 1 | 2 | 3,
    approachStrategy: {
      recommended: "Twitter/X content engagement followed by conference intro",
      steps: [
        "Follow Jesse Draper on Twitter/X and contribute substantive replies on 3–4 of her child safety or FamTech posts over two weeks.",
        "Publish a short-form piece (Substack or LinkedIn) on COPPA 2.0 enforcement gaps and tag Halogen Ventures — Jesse regularly amplifies aligned content.",
        "Pitch via halogenvc.com inbound form citing Fund III's explicit FamTech mandate, referencing your content she engaged with.",
        "If attending TechCrunch Disrupt, request a 15-minute hallway meeting citing the content thread as the warm signal.",
      ],
      openingAngle:
        "As a mother of three boys and a FamTech investor, you know the regulatory gap is the product risk — Phosra is the B2B compliance layer that closes it for every platform your portfolio companies touch.",
    },
    status: "identified" as const,
    notes:
      "Halogen Fund III closed at $30M in June 2025 with an explicit 'Future of Family' mandate, making this the most thesis-matched VC fund for Phosra currently deploying. Jesse's personal identity as a parent of young boys creates authentic resonance beyond a pure investment thesis.",
    relevantPortfolio: [],
  },

  {
    id: "pivotnorth",
    name: "Tim Connors",
    fundOrCompany: "PivotNorth Capital",
    role: "Founding General Partner",
    category: "faith-family" as const,
    type: "vc" as const,
    checkSizeRange: "$1M–$5M",
    stagePreference: "Seed / Series A",
    contact: {
      linkedin: "https://www.linkedin.com/in/timconnors/",
      website: "https://www.pivotnorth.com",
    },
    thesisAlignment: "perfect" as const,
    thesisNote:
      "4x Forbes Midas List GP who is a devout Catholic co-founder of the Connors Foundation for vulnerable families; Catholic values framework means child protection resonates at a personal stewardship level even absent prior portfolio signal.",
    coppaInterest: "none" as const,
    fundSignal: "active" as const,
    introPaths: [
      {
        type: "alumni-network" as const,
        description:
          "Notre Dame alumni events — Tim Connors actively engages the ND Catholic community; any ND-connected founder or advisor on the cap table is a warm path.",
        strength: 4 as 1 | 2 | 3 | 4 | 5,
      },
      {
        type: "podcast" as const,
        description:
          "Catholic Founders podcast and Catholic business leader circuit — Tim has appeared on these shows; reach out to shared guests as connectors.",
        strength: 3 as 1 | 2 | 3 | 4 | 5,
      },
      {
        type: "2nd-degree-strong" as const,
        description:
          "Google/Looker alumni network — Looker was acquired by Google and Tim was an early investor; Looker alumni who know Tim can provide credible introductions.",
        strength: 3 as 1 | 2 | 3 | 4 | 5,
      },
    ],
    tier: 1 as 1 | 2 | 3,
    approachStrategy: {
      recommended: "Notre Dame Catholic community warm intro",
      steps: [
        "Identify any Notre Dame alumni, Catholic Founders podcast guests, or Connors Foundation board members in Phosra's existing network.",
        "Ask a connector to make an email intro citing Tim's family-values investing philosophy and Phosra's child protection mission.",
        "Open the conversation with the Connors Foundation's vulnerable families focus before mentioning the investment opportunity.",
        "Frame Phosra as 'infrastructure the platforms that reach every Catholic family's children are legally required to adopt' — makes the investment feel like applied stewardship.",
      ],
      openingAngle:
        "Your foundation protects vulnerable families offline — Phosra protects them in the digital spaces their children inhabit every day, and the law now requires every platform to comply.",
    },
    status: "identified" as const,
    notes:
      "Tim Connors has 90+ investments and 24 exits with a Midas List track record, so this is a high-credibility signal-amplifier investor beyond the check itself. His Catholic family-values framework makes the Phosra pitch a values story first and a market story second, which is the right order for him.",
    relevantPortfolio: ["Looker", "Chime"],
  },

  {
    id: "lubetzky-camino",
    name: "Daniel Lubetzky",
    fundOrCompany: "Camino Partners",
    role: "Founder & Managing Partner",
    category: "faith-family" as const,
    type: "angel" as const,
    checkSizeRange: "$500K–$5M",
    stagePreference: "Series A / Growth",
    contact: {
      linkedin: "https://www.linkedin.com/in/daniellubetzky/",
      twitter: "https://twitter.com/daniellubetzky",
      website: "https://www.caminopartners.com",
    },
    thesisAlignment: "perfect" as const,
    thesisNote:
      "Invested $20M into Empatico — a safe digital connection platform for children — demonstrating direct prior conviction in child-safe technology; Holocaust survivor family background gives authentic urgency to protecting the vulnerable.",
    coppaInterest: "public-stance" as const,
    fundSignal: "active" as const,
    introPaths: [
      {
        type: "industry-association" as const,
        description:
          "Jewish Funders Network annual conference — Daniel Lubetzky is a known participant; tikkun olam (repairing the world) framing for child safety resonates deeply in this community.",
        strength: 4 as 1 | 2 | 3 | 4 | 5,
      },
      {
        type: "conference-event" as const,
        description:
          "Aspen Ideas Festival — Lubetzky is a recurring speaker on social entrepreneurship and values-based business; warm room for peer conversations.",
        strength: 3 as 1 | 2 | 3 | 4 | 5,
      },
      {
        type: "2nd-degree-strong" as const,
        description:
          "Shark Tank alumni and co-investor network — Lubetzky's Shark Tank profile and KIND Snacks retail network create a broad second-degree reach via any founder who pitched the show.",
        strength: 3 as 1 | 2 | 3 | 4 | 5,
      },
    ],
    tier: 1 as 1 | 2 | 3,
    approachStrategy: {
      recommended: "Jewish Funders Network tikkun olam framing",
      steps: [
        "Connect with a Jewish Funders Network member who has interacted with Lubetzky and can make a warm email introduction.",
        "Frame the introduction around tikkun olam and the moral obligation to protect children in digital spaces — lead with values, not valuation.",
        "Reference the Empatico investment explicitly: 'You already believe in safe digital spaces for children — Phosra is the compliance infrastructure that makes that promise legally enforceable.'",
        "Offer a demo session focused on how Phosra would have protected Empatico's users from regulatory risk.",
      ],
      openingAngle:
        "You invested in Empatico because you believe children deserve safe digital connection — Phosra is the B2B infrastructure that makes every platform legally obligated to provide it.",
    },
    status: "identified" as const,
    notes:
      "The $20M Empatico investment is a direct proof point that Lubetzky invests conviction capital into child-safe digital platforms; Phosra is the B2B compliance layer underneath every product like Empatico and is thus a natural portfolio complement. Camino Partners' $350M fund gives him meaningful check-writing capacity.",
    relevantPortfolio: ["Empatico", "KIND Snacks"],
  },

  // ─── Tier 2 ───────────────────────────────────────────────────────────────

  {
    id: "11-tribes",
    name: "Mark Phillips",
    fundOrCompany: "11 Tribes Ventures",
    role: "Managing Partner",
    category: "faith-family" as const,
    type: "vc" as const,
    checkSizeRange: "$250K–$2M",
    stagePreference: "Pre-Seed / Seed",
    contact: {
      website: "https://www.11tribes.vc",
    },
    thesisAlignment: "good" as const,
    thesisNote:
      "Fund II ($46M, April 2025) invests through Biblical principles with cybersecurity as an explicit sector — Phosra's compliance infrastructure sits at the intersection of cybersecurity and faith-aligned child protection values.",
    coppaInterest: "none" as const,
    fundSignal: "deploying" as const,
    introPaths: [
      {
        type: "conference-event" as const,
        description:
          "SENT Summit at Notre Dame — 11 Tribes Ventures participates regularly; natural warm intro through the shared faith-entrepreneur ecosystem.",
        strength: 4 as 1 | 2 | 3 | 4 | 5,
      },
      {
        type: "cold-application" as const,
        description:
          "11tribes.vc inbound form — the fund actively reviews applications from faith-aligned founders; cite cybersecurity + child protection angle in the subject.",
        strength: 3 as 1 | 2 | 3 | 4 | 5,
      },
      {
        type: "industry-association" as const,
        description:
          "Faith Driven Investor community overlap — 11 Tribes and Sovereign's Capital share events and LP relationships; a Sovereign's intro would carry significant weight.",
        strength: 4 as 1 | 2 | 3 | 4 | 5,
      },
    ],
    tier: 2 as 1 | 2 | 3,
    approachStrategy: {
      recommended: "SENT Summit warm intro + Sovereign's Capital cross-referral",
      steps: [
        "If pursuing Sovereign's Capital in parallel, ask Phil Jung for a warm cross-referral to 11 Tribes given the shared fund community.",
        "Attend SENT Summit and engage Mark Phillips directly in the context of Biblical stewardship applied to digital child protection.",
        "Submit an application via 11tribes.vc citing the cybersecurity mandate and the faith framing around protecting children online.",
        "Include a brief note on how Phosra's rule-engine architecture reflects Biblical principles of structured accountability.",
      ],
      openingAngle:
        "You invest in cybersecurity through Biblical principles — Phosra applies that same framework to the regulatory infrastructure protecting children from digital harm.",
    },
    status: "identified" as const,
    notes:
      "Fund II closed at $46M in April 2025 meaning 11 Tribes is in active deployment mode with fresh capital; the explicit cybersecurity sector mandate and faith-driven thesis create a credible dual hook for Phosra's compliance infrastructure story.",
    relevantPortfolio: ["NuTrād", "Circadian Risk"],
  },

  {
    id: "m25",
    name: "Victor Gutwein",
    fundOrCompany: "M25",
    role: "Co-Founder & Managing Partner",
    category: "faith-family" as const,
    type: "vc" as const,
    checkSizeRange: "$250K–$1.5M",
    stagePreference: "Pre-Seed / Seed",
    contact: {
      linkedin: "https://www.linkedin.com/in/victorgutwein/",
      website: "https://www.m25vc.com",
    },
    thesisAlignment: "good" as const,
    thesisNote:
      "Named after Matthew 25 (Parable of Talents) with an explicit Biblical stewardship thesis; most active Midwest early-stage VC with 90+ companies, making M25 a high-volume signal for follow-on investors.",
    coppaInterest: "none" as const,
    fundSignal: "active" as const,
    introPaths: [
      {
        type: "conference-event" as const,
        description:
          "Faith Driven Investor events — Victor Gutwein participates in the faith-entrepreneur circuit and is accessible at these gatherings.",
        strength: 3 as 1 | 2 | 3 | 4 | 5,
      },
      {
        type: "cold-application" as const,
        description:
          "M25 has a transparent inbound process at m25vc.com; as the most active Midwest VC they review a high volume of applications with fast turnaround.",
        strength: 3 as 1 | 2 | 3 | 4 | 5,
      },
      {
        type: "portfolio-founder" as const,
        description:
          "M25's 90+ portfolio companies include Kin Insurance and Branch — any founder in that portfolio who knows Phosra's team is a credible warm path.",
        strength: 4 as 1 | 2 | 3 | 4 | 5,
      },
    ],
    tier: 2 as 1 | 2 | 3,
    approachStrategy: {
      recommended: "Portfolio founder warm intro + Faith Driven Investor conference follow-up",
      steps: [
        "Map M25's 90+ portfolio companies and identify any founder with a 1st or 2nd-degree connection to Phosra's team.",
        "Ask that founder for a warm email intro to Victor Gutwein citing Phosra's compliance-infrastructure category.",
        "If no portfolio founder path exists, submit via m25vc.com with a Biblical stewardship framing for child safety regulation.",
        "Follow up at Faith Driven Investor events where Victor is reachable for a 10-minute in-person conversation.",
      ],
      openingAngle:
        "The Parable of Talents is about faithful stewardship of what you're entrusted with — every platform entrusted with a child's data has a legal and moral obligation Phosra makes enforceable.",
    },
    status: "identified" as const,
    notes:
      "M25 is strategically valuable as a Midwest market-maker with 90+ portfolio companies — an M25 investment signals credibility to the entire Midwest tech ecosystem and creates warm paths to dozens of follow-on investors. The Matthew 25 Biblical naming is not cosmetic; Victor Gutwein has spoken extensively about stewardship as investment thesis.",
    relevantPortfolio: ["Kin Insurance", "Branch"],
  },

  {
    id: "praxis-ventures",
    name: "Dave Blanchard",
    fundOrCompany: "Praxis Labs",
    role: "CEO & Co-Founder",
    category: "faith-family" as const,
    type: "micro-fund" as const,
    checkSizeRange: "$50K SAFE per Fellow",
    stagePreference: "Pre-Seed / Seed (via Praxis accelerator)",
    contact: {
      website: "https://www.praxis.co",
    },
    thesisAlignment: "perfect" as const,
    thesisNote:
      "Co-filed shareholder proposals at Apple regarding child exploitation risk — Praxis is publicly on record as an activist for child protection in digital spaces, making this the highest mission-conviction aligned investor group in the portfolio.",
    coppaInterest: "public-stance" as const,
    fundSignal: "active" as const,
    introPaths: [
      {
        type: "conference-event" as const,
        description:
          "Praxis Forum — annual gathering of 'redemptive venture' founders and investors; Phosra's child safety mission is natural programming content and creates warm access to the investor panel.",
        strength: 4 as 1 | 2 | 3 | 4 | 5,
      },
      {
        type: "accelerator-alumni" as const,
        description:
          "Apply to Praxis Labs accelerator cohort — the $50K SAFE investment comes with the investor network of 200+ ventures and direct access to the aligned investor group.",
        strength: 4 as 1 | 2 | 3 | 4 | 5,
      },
      {
        type: "industry-association" as const,
        description:
          "Engage Praxis via their shareholder advocacy work — connect through NCMEC or Thorn where Praxis also has relationships to open a backdoor introduction.",
        strength: 3 as 1 | 2 | 3 | 4 | 5,
      },
    ],
    tier: 2 as 1 | 2 | 3,
    approachStrategy: {
      recommended: "Apply to Praxis Labs accelerator cohort",
      steps: [
        "Apply to the next Praxis Labs Fellow cohort — the accelerator is the cleanest entry point into the full Praxis investor network.",
        "In the application, reference the Apple shareholder proposal co-filing as evidence of mission alignment: 'Praxis already demanded Apple enforce child safety — Phosra is the infrastructure that makes it technically possible.'",
        "If accepted, leverage the $50K SAFE and the 12-year network of 200+ redemptive ventures to unlock warm intros to Sovereign's Capital, IrishAngels, and other faith-aligned co-investors in Praxis's ecosystem.",
        "If not applying to accelerator, attend Praxis Forum and request a meeting with Dave Blanchard framed around the Apple shareholder proposal common ground.",
      ],
      openingAngle:
        "You co-filed shareholder proposals demanding Apple protect children — Phosra is what happens when that demand is translated into enforceable B2B compliance infrastructure.",
    },
    status: "identified" as const,
    notes:
      "Praxis is uniquely valuable beyond the check size: 12 years and 200+ redemptive ventures means the Praxis stamp of approval is a powerful signal to the entire faith-driven investor ecosystem. The Apple shareholder proposal co-filing makes this the only investor in this list with a public on-record activist stance for child protection online.",
    relevantPortfolio: [],
  },

  {
    id: "irish-angels",
    name: "Caroline Gash",
    fundOrCompany: "IrishAngels",
    role: "Executive Director",
    category: "faith-family" as const,
    type: "syndicate" as const,
    checkSizeRange: "$500K–$2M syndicated",
    stagePreference: "Seed / Series A",
    contact: {
      website: "https://www.irishangels.com",
    },
    thesisAlignment: "good" as const,
    thesisNote:
      "250+ Notre Dame alumni angel investors with $45M+ deployed — the Catholic institutional network and family-values ethos make this syndicate receptive to child safety framing; SENT Summit overlap with Sovereign's Capital creates ecosystem synergy.",
    coppaInterest: "none" as const,
    fundSignal: "active" as const,
    introPaths: [
      {
        type: "alumni-network" as const,
        description:
          "Notre Dame alumni network — any ND-connected advisor, investor, or founder on Phosra's cap table can provide a warm introduction to Caroline Gash and the IrishAngels network.",
        strength: 5 as 1 | 2 | 3 | 4 | 5,
      },
      {
        type: "conference-event" as const,
        description:
          "SENT Summit at Notre Dame — IrishAngels co-appears with Sovereign's Capital and SENT Ventures; a single SENT Summit attendance can open warm paths to all three simultaneously.",
        strength: 4 as 1 | 2 | 3 | 4 | 5,
      },
      {
        type: "cold-application" as const,
        description:
          "IrishAngels accepts inbound applications from non-ND founders when the deal is strong; apply via irishangels.com with a Catholic values and child protection framing.",
        strength: 2 as 1 | 2 | 3 | 4 | 5,
      },
    ],
    tier: 2 as 1 | 2 | 3,
    approachStrategy: {
      recommended: "Notre Dame alumni warm intro at SENT Summit",
      steps: [
        "Identify any Notre Dame alumni in Phosra's existing investor, advisor, or customer network.",
        "Ask that person to make an email introduction to Caroline Gash citing Phosra's child safety mission and the Catholic family-values alignment.",
        "Attend SENT Summit where IrishAngels and SENT Ventures both appear — one event can open multiple warm paths simultaneously.",
        "Prepare a syndicate-friendly deck with a clear $500K–$2M ask that the IrishAngels 250-member network can rally behind collectively.",
      ],
      openingAngle:
        "Notre Dame built its mission around care for the common good — protecting every child's digital safety is the defining common-good challenge of this generation, and Phosra makes it commercially enforceable.",
    },
    status: "identified" as const,
    notes:
      "IrishAngels' 250-member Catholic alumni syndicate is a high-leverage target because a single presentation can reach hundreds of qualified angels simultaneously; the $45M+ deployment track record signals a sophisticated, active group rather than a passive network.",
    relevantPortfolio: [],
  },

  {
    id: "telos-ventures",
    name: "Eric Quan & David Kim",
    fundOrCompany: "Telos Ventures",
    role: "General Partners",
    category: "faith-family" as const,
    type: "vc" as const,
    checkSizeRange: "$50K–$250K",
    stagePreference: "Pre-Seed / Seed",
    contact: {
      website: "https://www.telosventures.com",
    },
    thesisAlignment: "good" as const,
    thesisNote:
      "Silicon Valley faith-driven fund established 2013 with a 'Gospel-centered ventures' thesis — child safety regulation creates a discipleship and stewardship narrative that resonates with Telos's founding mission.",
    coppaInterest: "none" as const,
    fundSignal: "active" as const,
    introPaths: [
      {
        type: "industry-association" as const,
        description:
          "Silicon Valley Christian community networks (The Well, Christian tech founders groups) — Eric Quan and David Kim are embedded in this community and are reachable through any mutual faith-tech connection.",
        strength: 4 as 1 | 2 | 3 | 4 | 5,
      },
      {
        type: "portfolio-founder" as const,
        description:
          "FaithStreet or Cladwell founders — Telos portfolio founders who are active in the faith-tech ecosystem can make warm introductions to the GPs.",
        strength: 3 as 1 | 2 | 3 | 4 | 5,
      },
      {
        type: "cold-application" as const,
        description:
          "Telos Ventures reviews inbound applications from faith-aligned founders via telosventures.com; check size is small but the network effect and signal value are significant.",
        strength: 3 as 1 | 2 | 3 | 4 | 5,
      },
    ],
    tier: 2 as 1 | 2 | 3,
    approachStrategy: {
      recommended: "Silicon Valley Christian community warm intro",
      steps: [
        "Map any connections in the Silicon Valley Christian founder and investor community (The Well, SF Bay Area faith-tech Slack groups).",
        "Request a warm introduction to Eric Quan or David Kim via a mutual community member.",
        "Frame Phosra as infrastructure that enables 'Gospel-centered ventures' to operate in regulated digital spaces without compliance risk.",
        "Given the $50K–$250K check range, position Telos as an ecosystem entry point that opens the Silicon Valley faith-tech network for future rounds.",
      ],
      openingAngle:
        "Gospel-centered ventures need Gospel-safe digital infrastructure — Phosra ensures every platform your portfolio touches is legally compliant with the laws protecting children online.",
    },
    status: "identified" as const,
    notes:
      "Telos's small check size ($50K–$250K) is less about capital than about ecosystem access — an investment from Telos opens doors to 10+ years of Silicon Valley faith-tech relationships and co-investor networks. FaithStreet portfolio company is a direct community overlap with Phosra's potential faith-sector customers.",
    relevantPortfolio: ["FaithStreet", "Cladwell", "Wasoko"],
  },

  {
    id: "lauder-partners",
    name: "Gary & Laura Lauder",
    fundOrCompany: "Lauder Partners",
    role: "Managing Partners",
    category: "faith-family" as const,
    type: "family-office" as const,
    checkSizeRange: "$500K–$3M",
    stagePreference: "Seed / Series A",
    contact: {
      website: "https://www.lauderpartners.com",
    },
    thesisAlignment: "good" as const,
    thesisNote:
      "150+ private investments since 1985 with Jewish philanthropic tikkun olam framework; Laura's family fund seeds education and community resilience — child safety technology maps to both the philanthropic values and the investment history.",
    coppaInterest: "none" as const,
    fundSignal: "active" as const,
    introPaths: [
      {
        type: "industry-association" as const,
        description:
          "Band of Angels membership — Gary Lauder is a Band of Angels member; this Silicon Valley angel group provides a structured warm intro pathway for qualified startups.",
        strength: 4 as 1 | 2 | 3 | 4 | 5,
      },
      {
        type: "industry-association" as const,
        description:
          "Jewish Funders Network — the Lauder family is connected to the broader Jewish philanthropic network; a JFN referral carries strong credibility for tikkun olam-framed pitches.",
        strength: 4 as 1 | 2 | 3 | 4 | 5,
      },
      {
        type: "2nd-degree-strong" as const,
        description:
          "Estée Lauder Companies corporate network — the Lauder family's deep corporate connections create second-degree paths through any executive in their portfolio or professional network.",
        strength: 3 as 1 | 2 | 3 | 4 | 5,
      },
    ],
    tier: 2 as 1 | 2 | 3,
    approachStrategy: {
      recommended: "Band of Angels presentation + Jewish Funders Network referral",
      steps: [
        "Apply to present at a Band of Angels meeting — Gary Lauder's membership means a Band of Angels presentation reaches him directly in a structured setting.",
        "In parallel, pursue a Jewish Funders Network warm introduction using tikkun olam framing for child digital safety.",
        "Reference Laura's family fund focus on education and community resilience — Phosra's compliance infrastructure protects children in educational platforms and community spaces.",
        "Prepare a family-office-friendly memo emphasizing the 150+ investment track record alignment: Phosra fits the Lauder pattern of long-horizon impact investments with strong market fundamentals.",
      ],
      openingAngle:
        "Tikkun olam begins with protecting the most vulnerable — Phosra makes child digital safety legally enforceable for every platform your grandchildren and great-grandchildren will use.",
    },
    status: "identified" as const,
    notes:
      "Gary Lauder's 40-year track record of 150+ private investments signals patient, conviction-based capital that suits Phosra's long-horizon compliance infrastructure play. Band of Angels membership provides a structured, low-friction pathway to a warm meeting without relying on personal network access.",
    relevantPortfolio: [],
  },

  {
    id: "cathy-family",
    name: "Dan T. Cathy",
    fundOrCompany: "Cathy Family Office (Chick-fil-A)",
    role: "Chairman, Chick-fil-A / Family Office Principal",
    category: "faith-family" as const,
    type: "family-office" as const,
    checkSizeRange: "$1M–$10M",
    stagePreference: "Series A / Growth",
    contact: {},
    thesisAlignment: "good" as const,
    thesisNote:
      "Evangelical Christian family office with WinShape Foundation 'shaping winners' for youth and Chick-fil-A Foundation mandate to 'nourish potential in every child' — child protection technology is a natural stewardship extension of both foundation missions.",
    coppaInterest: "none" as const,
    fundSignal: "unknown" as const,
    introPaths: [
      {
        type: "conference-event" as const,
        description:
          "Engage VC Atlanta network — Dan T. Cathy is embedded in the Atlanta tech and faith-business community; Engage VC events provide warm room access.",
        strength: 3 as 1 | 2 | 3 | 4 | 5,
      },
      {
        type: "industry-association" as const,
        description:
          "Faith Driven Entrepreneur Atlanta chapter — Dan T. Cathy is a known participant in Atlanta's faith-business community; chapter events create warm relationship-building opportunities.",
        strength: 3 as 1 | 2 | 3 | 4 | 5,
      },
      {
        type: "2nd-degree-strong" as const,
        description:
          "WinShape Foundation board and Chick-fil-A Foundation staff — any advisor or consultant connected to either foundation can provide an internal referral to the family office.",
        strength: 3 as 1 | 2 | 3 | 4 | 5,
      },
    ],
    tier: 2 as 1 | 2 | 3,
    approachStrategy: {
      recommended: "Faith Driven Entrepreneur Atlanta chapter community-building",
      steps: [
        "Engage consistently in the Faith Driven Entrepreneur Atlanta chapter over 4–6 weeks before any direct outreach to Dan T. Cathy's office.",
        "Identify a WinShape Foundation board member or Chick-fil-A Foundation staff member who can provide an internal family office referral.",
        "Frame Phosra around the 'nourish potential in every child' mandate: 'Every digital platform that touches a child should have the same commitment to their wellbeing that Chick-fil-A's foundation has.'",
        "Request a 30-minute introductory call with the family office investment team rather than Dan T. Cathy directly — family offices typically screen through a professional staff layer.",
      ],
      openingAngle:
        "Your foundation's mission is to nourish potential in every child — Phosra ensures every digital platform those children use is legally required to protect that potential.",
    },
    status: "identified" as const,
    notes:
      "The Cathy family office is a longer-horizon cultivation target given the unknown fund signal, but the WinShape and Chick-fil-A Foundation dual mandate around youth creates unusually strong mission alignment. Net worth of ~$10.6B means check capacity is not a constraint once the relationship is established.",
    relevantPortfolio: [],
  },

  // ─── Tier 3 ───────────────────────────────────────────────────────────────

  {
    id: "1flourish",
    name: "Tom Tognoli",
    fundOrCompany: "1Flourish Capital",
    role: "Founder & Managing Partner",
    category: "faith-family" as const,
    type: "vc" as const,
    checkSizeRange: "$250K–$1M",
    stagePreference: "Pre-Seed / Seed",
    contact: {
      website: "https://www.1flourish.com",
    },
    thesisAlignment: "good" as const,
    thesisNote:
      "'High character founders on missions that advance human flourishing' with Biblical values culture — Phosra's child protection mission and regulatory compliance focus align with both the character criterion and the flourishing mandate.",
    coppaInterest: "none" as const,
    fundSignal: "active" as const,
    introPaths: [
      {
        type: "industry-association" as const,
        description:
          "Connect Silicon Valley network — Tom Tognoli is engaged in the Silicon Valley faith-tech and entrepreneur community through Connect Silicon Valley.",
        strength: 3 as 1 | 2 | 3 | 4 | 5,
      },
      {
        type: "cold-application" as const,
        description:
          "1Flourish Capital accepts inbound applications via 1flourish.com; lead with the 'human flourishing' thesis alignment and the character-mission framing.",
        strength: 3 as 1 | 2 | 3 | 4 | 5,
      },
      {
        type: "2nd-degree-strong" as const,
        description:
          "WeatherPromise or Lemurian Labs founders — direct portfolio founder outreach can surface a warm GP introduction.",
        strength: 3 as 1 | 2 | 3 | 4 | 5,
      },
    ],
    tier: 3 as 1 | 2 | 3,
    approachStrategy: {
      recommended: "Cold application with human flourishing thesis framing",
      steps: [
        "Apply via 1flourish.com with a founder letter that explicitly addresses the 'high character founders on missions that advance human flourishing' thesis.",
        "Reference 1Flourish's Biblical values culture in the application — demonstrate that Phosra's team shares those foundational principles.",
        "If any Connect Silicon Valley network members have a relationship with Tom Tognoli, request a warm intro before or alongside the application.",
        "Frame the pitch around how enforceable child safety compliance is a prerequisite for genuine human flourishing in the digital age.",
      ],
      openingAngle:
        "Human flourishing in the digital age requires that the spaces children inhabit online are safe by law, not just by policy — Phosra makes that enforceable for every platform.",
    },
    status: "identified" as const,
    notes:
      "1Flourish is a Tier 3 target primarily because the fund signal and check size are modest, but the thesis language ('human flourishing,' 'Biblical values,' 'high character founders') is an unusually precise match for Phosra's positioning and Tom Tognoli's Mountain View presence keeps him accessible.",
    relevantPortfolio: ["WeatherPromise", "Lemurian Labs"],
  },

  {
    id: "ncf-impact",
    name: "David Wills",
    fundOrCompany: "National Christian Foundation Impact Investing",
    role: "President Emeritus",
    category: "faith-family" as const,
    type: "impact-fund" as const,
    checkSizeRange: "$500K–$5M (DAF capital)",
    stagePreference: "Seed / Series A",
    contact: {
      website: "https://www.ncfgiving.com",
    },
    thesisAlignment: "good" as const,
    thesisNote:
      "Largest US Christian grantmaking organization ($18B+ granted) with an impact investing program deploying donor-advised fund capital into mission-aligned ventures — child protection technology is a natural fit for DAF investors seeking faith-mission alignment.",
    coppaInterest: "none" as const,
    fundSignal: "unknown" as const,
    introPaths: [
      {
        type: "conference-event" as const,
        description:
          "The Gathering — NCF's annual 500-attendee Christian philanthropist event; David Wills and NCF leadership are core organizers and accessible for warm conversations.",
        strength: 4 as 1 | 2 | 3 | 4 | 5,
      },
      {
        type: "industry-association" as const,
        description:
          "NCF donor-advised fund holder network — any NCF DAF holder who is a Phosra investor or advisor can request an internal introduction to the impact investing team.",
        strength: 4 as 1 | 2 | 3 | 4 | 5,
      },
      {
        type: "cold-application" as const,
        description:
          "NCF impact investing program reviews mission-aligned venture applications via ncfgiving.com; submit with a clear child protection mission statement.",
        strength: 2 as 1 | 2 | 3 | 4 | 5,
      },
    ],
    tier: 3 as 1 | 2 | 3,
    approachStrategy: {
      recommended: "The Gathering conference attendance + NCF DAF network referral",
      steps: [
        "Identify any NCF DAF holders in Phosra's existing investor, advisor, or customer network and ask for an internal NCF impact investing referral.",
        "Apply for attendance at The Gathering annual event — 500 Christian philanthropists in one room creates high-density warm intro opportunities.",
        "Request a meeting with NCF's impact investing team (not David Wills directly) framing Phosra as a mission-aligned venture for DAF capital deployment.",
        "Prepare an impact measurement framework showing child safety outcomes Phosra generates — NCF's impact investing program requires measurable mission returns alongside financial returns.",
      ],
      openingAngle:
        "NCF's $18B in Christian grantmaking proves the conviction — Phosra offers DAF holders a way to deploy capital that generates both financial returns and measurable child protection outcomes.",
    },
    status: "identified" as const,
    notes:
      "NCF Impact is a Tier 3 target due to unknown fund signal, but the $18B grantmaking track record means the donor base has significant capital and the impact investing program is a natural evolution of existing giving mandates. The DAF capital structure means donors can invest Phosra through their existing charitable giving vehicles.",
    relevantPortfolio: [],
  },

  {
    id: "sent-ventures",
    name: "Nick Madden",
    fundOrCompany: "SENT Ventures",
    role: "Executive Director",
    category: "faith-family" as const,
    type: "syndicate" as const,
    checkSizeRange: "$10K pitch prize + investor intros",
    stagePreference: "Pre-Seed / Seed",
    contact: {
      website: "https://www.sentventures.com",
    },
    thesisAlignment: "adjacent" as const,
    thesisNote:
      "Catholic entrepreneurship network with annual SENT Summit at Notre Dame featuring investor panels from Sovereign's Capital and IrishAngels — SENT is less a capital source than a warm-intro gateway to the entire Catholic faith-investor ecosystem.",
    coppaInterest: "none" as const,
    fundSignal: "unknown" as const,
    introPaths: [
      {
        type: "conference-event" as const,
        description:
          "SENT Summit pitch competition at Notre Dame — $10K prize and direct investor panel introductions to Sovereign's Capital and IrishAngels; competing is the fastest warm-intro path to multiple Tier 1 and Tier 2 targets simultaneously.",
        strength: 5 as 1 | 2 | 3 | 4 | 5,
      },
      {
        type: "cold-application" as const,
        description:
          "Apply to the SENT Summit pitch competition via sentventures.com — the application process itself surfaces Phosra to Nick Madden and the organizing committee who have investor relationships.",
        strength: 4 as 1 | 2 | 3 | 4 | 5,
      },
      {
        type: "industry-association" as const,
        description:
          "Catholic entrepreneurship community overlap with IrishAngels and Notre Dame alumni network — any ND-connected founder can intro Phosra to the SENT network.",
        strength: 3 as 1 | 2 | 3 | 4 | 5,
      },
    ],
    tier: 3 as 1 | 2 | 3,
    approachStrategy: {
      recommended: "SENT Summit pitch competition application",
      steps: [
        "Apply to the next SENT Summit pitch competition at Notre Dame — this is a strategic ecosystem play, not primarily a capital play.",
        "Frame the application around Catholic social teaching on protecting the vulnerable and the dignity of children in digital spaces.",
        "Prepare a pitch that speaks to the investor panel (Sovereign's Capital, IrishAngels) as the primary audience — win or lose the competition, the panel exposure is the prize.",
        "Follow up directly with Nick Madden after the event to request warm introductions to the investor panelists who expressed interest.",
      ],
      openingAngle:
        "Catholic social teaching demands we protect the most vulnerable — Phosra translates that moral imperative into enforceable compliance infrastructure for every digital platform that touches a child.",
    },
    status: "identified" as const,
    notes:
      "SENT Ventures is categorized as 'adjacent' thesis alignment because it is primarily an accelerator and community platform rather than a capital source, but it is the single highest-leverage ecosystem event for simultaneously reaching Sovereign's Capital, IrishAngels, PivotNorth, and the broader Catholic faith-investor community in one venue.",
    relevantPortfolio: [],
  },
]


// ─── Faith & Family Gatekeepers (Operational Decision-Makers) ────────────────

const FAITH_GATEKEEPERS: WarmIntroTarget[] = [
  // ─── Tier 1 ───────────────────────────────────────────────────────────────

  {
    id: "ryan-haning",
    name: "Ryan Haning",
    fundOrCompany: "Chick-fil-A / Cathy Family Office",
    role: "Executive Director & Head of Family Office",
    category: "faith-family" as const,
    type: "family-office" as const,
    checkSizeRange: "$1M–$10M",
    stagePreference: "Series A / Growth",
    contact: {
      linkedin: "https://www.linkedin.com/in/ryan-haning-c-p-a-56710748/",
    },
    thesisAlignment: "good" as const,
    thesisNote: "Ryan Haning is the operational brain of the Cathy family's $33.6B wealth — a CPA-trained investment director who evaluates every VC and PE deal before it reaches Dan Cathy. Pitching Phosra to Ryan means pitching to the person who actually approves checks, not a symbolic patriarch. The Cathy family's deep Southern Baptist faith and public commitment to family values makes child safety compliance infrastructure a culturally coherent ask. His CPA background means he will immediately grasp the regulatory liability angle and enterprise ARR model.",
    coppaInterest: "none" as const,
    fundSignal: "unknown" as const,
    introPaths: [
      {
        type: "industry-association" as const,
        description: "Engage VC Atlanta is the premier Southeast tech investor community — Ryan is reachable through Atlanta VC dinners and LP events hosted by Engage, where Cathy family presence is known.",
        strength: 3 as 1|2|3|4|5,
      },
      {
        type: "alumni-network" as const,
        description: "Atlanta-area CPA professional networks (GSCPA chapter, AICPA SFO section) overlap directly with Ryan's credentialed background. An intro through a mutual CPA contact carries immediate professional credibility.",
        strength: 3 as 1|2|3|4|5,
      },
      {
        type: "conference-event" as const,
        description: "Family Office Exchange (FOX) and UHNW Institute conferences attract exactly this profile — senior family office operational directors. A warm hallway intro at FOX Annual Forum could open the door.",
        strength: 2 as 1|2|3|4|5,
      },
    ],
    tier: 1 as 1|2|3,
    approachStrategy: {
      recommended: "Warm intro through Engage VC Atlanta network or Atlanta CPA professional circle",
      steps: [
        "Identify a mutual contact in the Engage VC Atlanta ecosystem who has dealt with Cathy Family Office and can make a credible peer introduction.",
        "Frame the initial ask as a 20-minute call about child safety compliance liability in the digital product landscape — not a fundraise call.",
        "Lead with the regulatory risk angle: COPPA 2.0, state AADC laws, and the FTC enforcement wave create enterprise-grade demand that maps directly to the Cathy family's values and commercial instincts.",
        "If direct intro fails, attend GSCPA Family Office SIG events and build rapport over multiple touchpoints before requesting a meeting.",
      ],
      openingAngle: "The Cathy family built a brand on family values — but the next generation of that brand lives online, and COPPA enforcement is hitting platform companies with eight-figure fines. Phosra is the compliance infrastructure that makes digital family safety commercially scalable.",
    },
    status: "identified" as const,
    notes: "The actual decision-maker for the Cathy Family Office — while Dan Cathy is the patriarch, Ryan evaluates and recommends all investment opportunities. His CPA discipline means he will want to see clean cap table, clear ARR metrics, and a defensible regulatory moat before bringing anything to the family. Do not cold-approach — this relationship requires a warm path through Atlanta's tightly networked evangelical business community.",
  },

  {
    id: "finny-kuruvilla",
    name: "Finny Kuruvilla MD PhD",
    fundOrCompany: "Eventide Asset Management",
    role: "Co-CIO & Managing Director (Ventures)",
    category: "faith-family" as const,
    type: "vc" as const,
    checkSizeRange: "$500K–$5M",
    stagePreference: "Seed / Series A",
    contact: {
      linkedin: "https://www.linkedin.com/in/finny-kuruvilla-7a1796/",
      website: "https://www.eventideinvestments.com",
    },
    thesisAlignment: "perfect" as const,
    thesisNote: "Finny Kuruvilla is not simply a faith-aligned allocator — he is the founding architect of Eventide's 'business as a force for good' investment theology, holds 50%+ of the firm, and personally closed Eventide Ventures at $83M in April 2024 with an explicit 'redemptive technology' mandate. Phosra is textbook Eventide Ventures material: it is infrastructure that makes the internet structurally safer for children, generates enterprise SaaS revenue, and addresses a legal compliance wave (COPPA 2.0, AADC) that creates durable demand. Finny's MD/PhD background means he understands complex technical and regulatory systems — the pitch should be precise, not vague.",
    coppaInterest: "portfolio-signal" as const,
    fundSignal: "deploying" as const,
    introPaths: [
      {
        type: "conference-event" as const,
        description: "Eventide regularly participates in faith-and-finance conferences (e.g., Praxis Academy, Kingdom Advisors Annual Conference). Finny or his team appear at events where redemptive business is the organizing theme.",
        strength: 4 as 1|2|3|4|5,
      },
      {
        type: "portfolio-founder" as const,
        description: "Eventide Ventures' portfolio companies include redemptive tech founders who can speak to the thesis fit and provide a warm peer introduction from within the existing portfolio.",
        strength: 4 as 1|2|3|4|5,
      },
      {
        type: "content-warmup" as const,
        description: "Finny engages publicly with ideas around technology ethics and human flourishing. Publishing substantive content (blog post, substack, or LinkedIn article) on child safety as redemptive infrastructure creates an organic warm touchpoint.",
        strength: 2 as 1|2|3|4|5,
      },
    ],
    tier: 1 as 1|2|3,
    approachStrategy: {
      recommended: "Portfolio-founder warm intro or Kingdom Advisors / Praxis Academy conference approach",
      steps: [
        "Map Eventide Ventures' current portfolio to identify a founder who has worked with Finny directly and can vouch for the quality of the opportunity.",
        "Request a 15-minute call framed around 'redemptive technology infrastructure' — specifically how API-layer compliance tooling changes the economics of child safety at scale.",
        "Prepare a two-page brief using Eventide's own 'business as a force for good' framework, showing how Phosra scores on their stakeholder impact matrix.",
        "Follow up with the specific COPPA 2.0 and state AADC legislative pipeline as evidence that regulatory tailwinds will drive sustained enterprise demand.",
      ],
      openingAngle: "Eventide Ventures deployed $83M to back companies that do good and do well. Phosra is the compliance API that makes child safety profitable for platforms and mandatory under federal law — a redemptive technology investment with a regulatory moat.",
    },
    status: "identified" as const,
    notes: "Eventide Ventures ($83M fund, April 2024) actively deploys into 'redemptive technology' startups — a child safety compliance API is a textbook fit for their faith-driven venture mandate. Finny is both the ideological architect and the operational decision-maker; getting his intellectual conviction is equivalent to getting the check. Priority Tier 1 with highest thesis alignment of any faith-aligned VC.",
  },

  {
    id: "thomas-lowe-maclellan",
    name: "Thomas Lowe",
    fundOrCompany: "Maclellan Foundation",
    role: "CIO",
    category: "faith-family" as const,
    type: "impact-fund" as const,
    checkSizeRange: "$500K–$3M",
    stagePreference: "Seed / Series A (via MRI fund)",
    contact: {
      linkedin: "https://www.linkedin.com/in/thomas-lowe-61323316/",
    },
    thesisAlignment: "perfect" as const,
    thesisNote: "Thomas Lowe manages Maclellan's Mission Related Investment fund — one of the very few evangelical foundations that has built a direct investment vehicle sized for pre-seed and seed deals, explicitly seeking market-rate returns alongside mission alignment in child and family protection. He is the professional evaluator, not a ceremonial title: he underwrites the MRI fund's deals independently of the grants team. Phosra hits both the mission pillar (child/family safety) and the return requirement (enterprise SaaS with regulatory moat) that MRI mandates demand.",
    coppaInterest: "none" as const,
    fundSignal: "active" as const,
    introPaths: [
      {
        type: "industry-association" as const,
        description: "Mission Investors Exchange (MIE) and the Council on Foundations are the primary professional networks for foundation investment officers. Thomas participates in these circles as a practitioner in MRI/PRI structuring.",
        strength: 4 as 1|2|3|4|5,
      },
      {
        type: "conference-event" as const,
        description: "Chattanooga's Christian philanthropic community is tightly networked. Regional faith-and-business forums (e.g., Chattanooga Christian Community Foundation events) are natural venues to build a relationship before a direct ask.",
        strength: 3 as 1|2|3|4|5,
      },
      {
        type: "attorney-intro" as const,
        description: "Foundation legal counsel and impact investment attorneys who structure MRI/PRI deals often know every active foundation CIO in a given region. A mutual attorney who has structured Maclellan instruments could make a credible introduction.",
        strength: 3 as 1|2|3|4|5,
      },
    ],
    tier: 1 as 1|2|3,
    approachStrategy: {
      recommended: "Mission Investors Exchange professional network introduction",
      steps: [
        "Identify a mutual contact in the MIE network or impact investing legal community who knows Thomas and can frame Phosra as a mission-aligned, market-rate opportunity.",
        "Lead with the MRI mandate: explicitly position Phosra as designed for mission-first investors who require market-rate returns — not a grant or a below-market PRI.",
        "Provide a one-page MRI brief showing how Phosra maps to Maclellan's child/family protection mission pillar alongside a financial summary showing the path to enterprise ARR.",
        "Offer to present to the MRI investment committee as part of their standard diligence process.",
      ],
      openingAngle: "Maclellan's MRI fund was built for exactly this moment: a market-rate investment that also makes the internet structurally safer for children — enterprise compliance infrastructure addressing a federal regulatory wave.",
    },
    status: "identified" as const,
    notes: "Maclellan's MRI fund actively seeks market-rate investments in child/family protection — one of the few evangelical foundations with a direct investment vehicle sized for pre-seed/seed deals. Thomas Lowe is the professional gatekeeper for all MRI decisions, operating with genuine investment autonomy. This is a rare combination of perfect mission alignment and genuine check-writing capacity at the seed stage.",
  },

  {
    id: "randall-damstra",
    name: "Randall Damstra",
    fundOrCompany: "Ottawa Avenue Private Capital (DeVos Family Office)",
    role: "CEO & CIO",
    category: "faith-family" as const,
    type: "family-office" as const,
    checkSizeRange: "$5M–$50M",
    stagePreference: "Growth / PE",
    contact: {
      linkedin: "https://www.linkedin.com/in/randall-damstra-a8b3b7/",
    },
    thesisAlignment: "good" as const,
    thesisNote: "Randall Damstra is the professional CIO of one of America's largest evangelical family offices, having just closed a $3.42B PE fund (9th largest US PE raise in late 2024). He operates with 23 investment advisory staff and 35+ co-investors, which means he runs an institutional-grade process despite being a family office. The DeVos family's evangelical values, Betsy DeVos's tenure as Education Secretary, and the family's decades-long focus on school choice and family formation make child safety compliance technology a natural values-aligned conversation — Damstra is the professional who evaluates whether that conversation becomes a check.",
    coppaInterest: "none" as const,
    fundSignal: "deploying" as const,
    introPaths: [
      {
        type: "industry-association" as const,
        description: "Grand Rapids' West Michigan business community is tight-knit and evangelical-dominated. The West Michigan Policy Forum and local YPO/EO chapters include Ottawa Avenue contacts who can make a warm intro.",
        strength: 3 as 1|2|3|4|5,
      },
      {
        type: "conference-event" as const,
        description: "Family Office Networks (FOX, iConnections) and ILPA events attract senior family office CIOs. Randall's institutional scale means he participates in LP-facing conferences where introductions happen naturally.",
        strength: 3 as 1|2|3|4|5,
      },
      {
        type: "2nd-degree-weak" as const,
        description: "Ottawa Avenue's 35+ co-investors across PE deals include institutional GPs who have worked with Randall on fund commitments — a GP who can intro Phosra as a co-investment opportunity carries weight.",
        strength: 2 as 1|2|3|4|5,
      },
    ],
    tier: 1 as 1|2|3,
    approachStrategy: {
      recommended: "West Michigan evangelical business network introduction, framing Phosra as a values-aligned technology co-investment",
      steps: [
        "Map Ottawa Avenue's PE co-investors to identify a GP or fund manager who has a relationship with Randall and can introduce Phosra as a portfolio-adjacent opportunity.",
        "Frame the conversation around the values alignment first — DeVos family legacy in education and family formation maps directly to child safety infrastructure.",
        "Acknowledge the check size mismatch upfront: position as a strategic minority stake or co-investment alongside other faith-aligned family offices rather than a standalone PE-sized check.",
        "Prepare institutional-grade materials: Ottawa Avenue runs a professional investment committee process, not an informal family decision.",
      ],
      openingAngle: "The DeVos family spent decades fighting for children's educational rights — Phosra fights for children's digital rights with the same conviction, now backed by federal law.",
    },
    status: "identified" as const,
    notes: "The DeVos family's evangelical values and education focus (Betsy DeVos was Education Secretary) make child safety compliance tech a natural conversation — Damstra is the professional gatekeeper for all alternative investments. Note the check size preference is larger than Phosra's current raise; position as a strategic introduction for future rounds or as a smaller co-investment alongside other faith-aligned family offices.",
  },

  {
    id: "mart-green",
    name: "Mart Green",
    fundOrCompany: "Hobby Lobby / Green Family",
    role: "Ministry Investment Officer",
    category: "faith-family" as const,
    type: "family-office" as const,
    checkSizeRange: "$1M–$10M",
    stagePreference: "Seed / Growth",
    contact: {
      website: "https://illuminations.bible",
    },
    thesisAlignment: "good" as const,
    thesisNote: "Mart Green holds the explicit title of Ministry Investment Officer for America's most prominent evangelical family — a role created specifically to evaluate and deploy the Green family's impact and ministry capital. He co-founded IllumiNations (Bible translation coalition) and David Green transferred all Hobby Lobby voting stock to a charitable trust in 2022, meaning the family's capital is now structurally committed to mission alignment. Anti-trafficking and child protection are explicit Green family priorities. Mart is the designated decision-maker for this capital channel — not an heir, not a trustee committee, but a named operational officer.",
    coppaInterest: "none" as const,
    fundSignal: "active" as const,
    introPaths: [
      {
        type: "industry-association" as const,
        description: "IllumiNations coalition includes major evangelical organizations (American Bible Society, Wycliffe, Biblica) whose leadership overlaps with Mart's professional network. A contact through the Bible translation or anti-trafficking coalition space creates natural common ground.",
        strength: 3 as 1|2|3|4|5,
      },
      {
        type: "conference-event" as const,
        description: "The Gathering (faith-based philanthropists), National Christian Foundation events, and Praxis Academy are venues where Mart's network is active. These conferences are the watering hole for evangelical impact capital.",
        strength: 3 as 1|2|3|4|5,
      },
      {
        type: "content-warmup" as const,
        description: "Mart engages publicly on child protection and Bible access. A thoughtful LinkedIn or email outreach connecting Phosra's mission to his anti-trafficking public statements could open a direct conversation.",
        strength: 2 as 1|2|3|4|5,
      },
    ],
    tier: 1 as 1|2|3,
    approachStrategy: {
      recommended: "Introduction through anti-trafficking or child protection coalition contacts who intersect with IllumiNations or Green family ministry work",
      steps: [
        "Identify an anti-trafficking or child protection nonprofit leader who has received Green family funding and can introduce Phosra as the technology complement to their programmatic work.",
        "Lead with mission, not returns: frame Phosra as infrastructure that makes the digital enforcement of child protection laws scalable — connecting legislative mandates to real-world protection.",
        "Reference the Green family's explicit child protection priority and how Phosra's compliance API accelerates the enforcement of laws like COPPA 2.0 and state AADC legislation.",
        "Have a term sheet-ready materials package prepared for a fast conversion — Mart makes decisions with family authority, not through a slow investment committee.",
      ],
      openingAngle: "America's most committed evangelical family has made child protection an explicit priority — Phosra is the technology that makes that protection legally enforceable at internet scale.",
    },
    status: "identified" as const,
    notes: "Mart is the designated 'Ministry Investment Officer' for America's most prominent evangelical family — he decides where the Green family deploys impact capital, and anti-trafficking/child-protection is an explicit priority. The 2022 trust structure means this capital now operates with a formal governance mandate toward mission, making Mart's role more formalized and his authority clearer than most family office gatekeepers.",
  },

  // ─── Tier 2 ───────────────────────────────────────────────────────────────

  {
    id: "michael-shields-ncf",
    name: "Michael Shields CFA",
    fundOrCompany: "National Christian Foundation",
    role: "CIO",
    category: "faith-family" as const,
    type: "impact-fund" as const,
    checkSizeRange: "$500K–$5M",
    stagePreference: "Seed / Series A (DAF impact)",
    contact: {
      linkedin: "https://www.linkedin.com/in/michael-shields-a7b44a16/",
      website: "https://www.ncfgiving.com",
    },
    thesisAlignment: "good" as const,
    thesisNote: "Michael Shields is the investment gatekeeper for $4B+ in DAF assets and the professional who recommends investment vehicles to over 100,000 evangelical donors. His authority is not ceremonial: he runs NCF's investment team, oversees impact investing vehicles, and has direct influence over which opportunities reach NCF's massive donor base. A Phosra allocation recommendation from Shields could trigger follow-on capital from evangelical donors who trust NCF's investment judgment. He is a CFA charterholder operating at institutional scale within a faith-driven mandate.",
    coppaInterest: "none" as const,
    fundSignal: "active" as const,
    introPaths: [
      {
        type: "industry-association" as const,
        description: "NCF is a founding institution in the faith-and-finance ecosystem. Shields participates in Christian financial professional networks (Kingdom Advisors, CAMA) where his peer relationships run deep.",
        strength: 4 as 1|2|3|4|5,
      },
      {
        type: "conference-event" as const,
        description: "The Gathering and Outcomes Conference (National Association of Evangelicals) are attended by NCF leadership. Shields or his team are accessible at these faith-philanthropy intersections.",
        strength: 3 as 1|2|3|4|5,
      },
      {
        type: "content-warmup" as const,
        description: "NCF publishes extensively on impact investing and donor education. Contributing a thought piece on child safety technology as a biblical stewardship investment creates intellectual credibility before a direct approach.",
        strength: 2 as 1|2|3|4|5,
      },
    ],
    tier: 2 as 1|2|3,
    approachStrategy: {
      recommended: "Kingdom Advisors or NCF donor network introduction through a shared evangelical finance professional",
      steps: [
        "Identify a mutual contact in the Kingdom Advisors network or a financial advisor who channels clients to NCF and can make a peer introduction to Shields.",
        "Frame Phosra as a new impact vehicle that NCF's investment team could evaluate for the DAF impact program — not as a cold fundraise pitch.",
        "Emphasize the distribution multiplier: a Shields recommendation reaches 100,000+ NCF donors who are already primed for faith-aligned investing.",
        "Prepare a one-page impact brief showing how Phosra scores on NCF's stated values framework, alongside standard financial diligence materials.",
      ],
      openingAngle: "NCF's 100,000 donors are already committed to child welfare — Phosra gives them a way to invest in the technology infrastructure that makes that welfare legally enforceable.",
    },
    status: "identified" as const,
    notes: "NCF's CIO has direct authority over impact investment recommendations reaching 100,000+ evangelical donors — a Phosra allocation could trigger significant follow-on from the donor base. The DAF structure means NCF doesn't write checks from its own balance sheet in the traditional VC sense; the play here is getting Phosra listed as a recommended impact vehicle for NCF donor capital.",
  },

  {
    id: "dave-morehead-baylor",
    name: "Dave Morehead CFA",
    fundOrCompany: "Baylor University",
    role: "CIO",
    category: "faith-family" as const,
    type: "impact-fund" as const,
    checkSizeRange: "$1M–$5M",
    stagePreference: "Seed / Series A (emerging managers)",
    contact: {
      linkedin: "https://www.linkedin.com/in/davidmorehead/",
      twitter: "https://twitter.com/CIO_Baylor",
    },
    thesisAlignment: "good" as const,
    thesisNote: "Dave Morehead is the 2025 Endowment/Foundation CIO of the Year (Institutional Investor) — a peer-validated signal that he runs one of the most respected emerging manager programs in faith-aligned endowment investing. His active presence on X (@CIO_Baylor) makes him uniquely accessible for thoughtful cold outreach among institutional allocators. Baylor's Baptist heritage and its 12.2% annualized returns demonstrate that Morehead balances mission and performance without compromise. The emerging manager program actively seeks differentiated venture allocations that larger endowments overlook.",
    coppaInterest: "none" as const,
    fundSignal: "active" as const,
    introPaths: [
      {
        type: "content-warmup" as const,
        description: "Dave is unusually active on X (@CIO_Baylor) for an endowment CIO. Engaging substantively with his posts on emerging managers, venture allocation, and endowment strategy creates a warm digital relationship before a direct ask.",
        strength: 4 as 1|2|3|4|5,
      },
      {
        type: "alumni-network" as const,
        description: "Baylor alumni in the tech and venture ecosystem provide natural warm intro paths — a Baylor alum who can speak to both the institutional fit and the product creates a credible peer bridge.",
        strength: 3 as 1|2|3|4|5,
      },
      {
        type: "conference-event" as const,
        description: "Institutional Investor's CIO Summit and NACUBO (National Association of College and University Business Officers) conferences are where Morehead participates as a recognized peer leader after his CIO of the Year award.",
        strength: 3 as 1|2|3|4|5,
      },
    ],
    tier: 2 as 1|2|3,
    approachStrategy: {
      recommended: "Content engagement on X followed by a direct LinkedIn message from a Baylor-connected founder or investor",
      steps: [
        "Engage genuinely with Dave's X (@CIO_Baylor) content on emerging managers and venture strategy for 2-3 weeks before any direct outreach.",
        "Identify a Baylor alum in the tech/venture ecosystem who can provide a warm intro with direct personal context.",
        "Frame the pitch around his emerging manager mandate: Phosra is a pre-institutional venture allocation that offers differentiated exposure to regulatory compliance infrastructure — an uncorrelated category.",
        "Reference his CIO of the Year recognition and the intelligence it signals: this is a peer-to-peer conversation about a category opportunity most allocators are missing.",
      ],
      openingAngle: "You built one of the best emerging manager programs in faith-aligned endowment investing — Phosra is the kind of differentiated regulatory compliance infrastructure that most endowments will discover two years too late.",
    },
    status: "identified" as const,
    notes: "CIO of the Year for 2025 with an active emerging manager program — one of the few university endowments both faith-aligned and actively seeking differentiated venture allocations. His X activity makes him the most digitally warm-able institutional allocator in the faith-aligned endowment universe. Pursue the content-warmup path aggressively before any direct meeting request.",
  },

  {
    id: "brandon-pizzurro",
    name: "Brandon Pizzurro CFP CFA",
    fundOrCompany: "GuideStone Capital Management",
    role: "President & CIO",
    category: "faith-family" as const,
    type: "strategic" as const,
    checkSizeRange: "$5M–$25M",
    stagePreference: "Growth / Strategic",
    contact: {
      website: "https://www.guidestonefunds.com",
    },
    thesisAlignment: "good" as const,
    thesisNote: "Brandon Pizzurro manages $22.5B AUM including the largest faith-based mutual fund family ($18.9B) with Southern Baptist values screens. The strategic value of a GuideStone relationship is not primarily about the check size — it is about distribution to thousands of SBC churches and institutions who are themselves responsible for minor-heavy programming and who face the same digital child safety compliance obligations. Pizzurro is the professional who runs this asset management operation with institutional rigor; reaching him is a distribution and strategic partnership conversation as much as an investment conversation.",
    coppaInterest: "none" as const,
    fundSignal: "active" as const,
    introPaths: [
      {
        type: "industry-association" as const,
        description: "GuideStone serves the SBC institutional ecosystem — the Executive Committee of the SBC, Lifeway Christian Resources, and related entities are natural introduction channels through shared Baptist institutional relationships.",
        strength: 4 as 1|2|3|4|5,
      },
      {
        type: "alumni-network" as const,
        description: "Brandon is a Baylor alum — the same Baylor network that connects to Dave Morehead at Baylor endowment also provides a warm path to Pizzurro through shared institutional identity.",
        strength: 3 as 1|2|3|4|5,
      },
      {
        type: "conference-event" as const,
        description: "GuideStone and CNBC/Fox Business are Brandon's media channels. Appearing on faith-and-finance media or at SBC Annual Meeting events (where GuideStone is a named participant) creates visibility before a direct approach.",
        strength: 2 as 1|2|3|4|5,
      },
    ],
    tier: 2 as 1|2|3,
    approachStrategy: {
      recommended: "SBC institutional introduction through Lifeway or another GuideStone institutional client",
      steps: [
        "Identify a GuideStone institutional client (SBC entity, Baptist university, or SBC-affiliated nonprofit) whose leadership knows Brandon and can frame Phosra as mission-aligned technology.",
        "Frame the conversation as a strategic distribution partnership first: GuideStone's 10,000+ institutional clients include churches and schools who need child safety compliance technology.",
        "Secondary frame: a strategic investment that aligns GuideStone's SBC mission with the fastest-growing category in regulatory compliance technology.",
        "Prepare a GuideStone-specific one-pager showing how Phosra's technology serves the SBC institutional ecosystem — not just a generic fintech pitch.",
      ],
      openingAngle: "GuideStone serves thousands of SBC institutions — many of them run youth programs, apps, and digital platforms that face the same COPPA compliance liability Phosra is built to solve.",
    },
    status: "identified" as const,
    notes: "The largest faith-based asset manager in the US — a GuideStone relationship is less about check size and more about distribution to thousands of SBC churches and institutions who need child safety compliance. Brandon is the operational CIO of a $22.5B institution; treat this as a strategic partnership conversation with an investment component, not a pure VC pitch.",
  },

  {
    id: "brian-crawford-templeton",
    name: "Brian Crawford CFA",
    fundOrCompany: "John Templeton Foundation",
    role: "Director of Investments",
    category: "faith-family" as const,
    type: "impact-fund" as const,
    checkSizeRange: "$1M–$10M",
    stagePreference: "Series A / Growth",
    contact: {
      linkedin: "https://www.linkedin.com/in/brianfcrawfordcfa/",
      website: "https://www.templeton.org",
    },
    thesisAlignment: "good" as const,
    thesisNote: "Brian Crawford manages the investment function for Templeton's ~$3.5B portfolio alongside its grant-making in science, religion, and human flourishing. Templeton is unusual among faith-aligned foundations in that it funds PRIs and impact investments that complement its research mission — and 'human flourishing' is the operative concept that links Templeton's mandate to child safety infrastructure. Crawford evaluates both PRIs and traditional investments, meaning he has two separate potential vehicles through which Phosra could enter the relationship. His CFA discipline brings the same institutional rigor as any professional endowment investor.",
    coppaInterest: "none" as const,
    fundSignal: "active" as const,
    introPaths: [
      {
        type: "industry-association" as const,
        description: "Mission Investors Exchange and Council on Foundations attract Templeton's investment team. Crawford participates in impact investing professional networks where PRI structuring and mission-aligned direct investments are discussed.",
        strength: 3 as 1|2|3|4|5,
      },
      {
        type: "conference-event" as const,
        description: "Templeton-sponsored conferences on science, religion, and human flourishing (including their own Big Questions events) offer direct access to the Templeton investment and program team.",
        strength: 3 as 1|2|3|4|5,
      },
      {
        type: "content-warmup" as const,
        description: "Templeton publishes extensively on human flourishing research. A white paper or blog post connecting digital child safety to human flourishing metrics (using Templeton's own intellectual framework) creates a credible warm touchpoint.",
        strength: 2 as 1|2|3|4|5,
      },
    ],
    tier: 2 as 1|2|3,
    approachStrategy: {
      recommended: "Mission Investors Exchange professional introduction combined with a Templeton-framed human flourishing pitch document",
      steps: [
        "Identify a mutual contact through the Mission Investors Exchange or PRI legal community who knows Crawford and can make a credible introduction.",
        "Frame Phosra explicitly in Templeton's 'human flourishing' vocabulary: child safety compliance infrastructure enables digital environments that support rather than harm flourishing.",
        "Offer a PRI structure as an alternative to equity investment — Templeton's comfort with program-related investments could accelerate the process.",
        "Reference Templeton's track record funding research on technology and human behavior as intellectual common ground before making the investment ask.",
      ],
      openingAngle: "Templeton funds research on human flourishing — Phosra is the infrastructure that makes digital spaces structurally capable of supporting it.",
    },
    status: "identified" as const,
    notes: "Templeton's mission to fund 'human flourishing' research creates natural alignment — a child safety compliance platform is infrastructure for digital flourishing, and Crawford evaluates both PRIs and traditional investments. The two-track approach (PRI + equity) gives more flexibility than a pure equity pitch to most institutional investors. Templeton has more secular institutional credibility than most faith-aligned foundations, which means Brian applies rigorous investment discipline.",
  },

  {
    id: "michael-buchman-hilton",
    name: "Michael Buchman",
    fundOrCompany: "Conrad N. Hilton Foundation",
    role: "VP & CIO",
    category: "faith-family" as const,
    type: "impact-fund" as const,
    checkSizeRange: "$5M–$25M",
    stagePreference: "Growth / PE",
    contact: {
      linkedin: "https://www.linkedin.com/in/michael-buchman-4984156/",
      website: "https://www.hiltonfoundation.org",
    },
    thesisAlignment: "good" as const,
    thesisNote: "Michael Buchman has been the sole CIO of the Conrad N. Hilton Foundation since 2009, managing an $8B Catholic-identity portfolio that includes a major child welfare grantmaking pillar. He has operated with institutional continuity and independence for 15+ years — a profile that means he has deep relationships and significant investment authority. The Hilton Foundation's Catholic identity and explicit child welfare mission create genuine alignment with Phosra's compliance infrastructure. Buchman evaluates both traditional endowment investments and impact/PRIs within the same portfolio framework.",
    coppaInterest: "none" as const,
    fundSignal: "active" as const,
    introPaths: [
      {
        type: "industry-association" as const,
        description: "Hilton Foundation participates in Catholic philanthropic networks (Catholic Charities USA, FADICA — Foundations and Donors Interested in Catholic Activities) where Buchman's peers can make credible introductions.",
        strength: 3 as 1|2|3|4|5,
      },
      {
        type: "conference-event" as const,
        description: "Council on Foundations, Mission Investors Exchange, and Los Angeles philanthropic community events are natural venues. Buchman's 15-year tenure means he is a senior figure at these gatherings.",
        strength: 3 as 1|2|3|4|5,
      },
      {
        type: "2nd-degree-weak" as const,
        description: "Hilton Foundation's child welfare grantees (including anti-trafficking and child protection nonprofits) have direct relationships with Buchman's program team — a nonprofit executive can bridge to the investment side.",
        strength: 2 as 1|2|3|4|5,
      },
    ],
    tier: 2 as 1|2|3,
    approachStrategy: {
      recommended: "Catholic philanthropic network introduction through FADICA or a shared child welfare grantee",
      steps: [
        "Identify a Hilton Foundation child welfare grantee whose executive director knows the investment team and can bridge the program-to-investment relationship.",
        "Frame Phosra in Catholic social teaching vocabulary: the dignity of the child, protection of the vulnerable, and the responsibility of technology platforms to prevent harm.",
        "Position as a growth-stage impact investment that complements Hilton's existing child welfare grant portfolio with a market-rate return.",
        "Prepare an $8B endowment-appropriate materials package — Buchman runs an institutional-grade process and will expect professional diligence documentation.",
      ],
      openingAngle: "The Hilton Foundation has spent decades protecting vulnerable children through grantmaking — Phosra is the technology that makes that protection legally mandatory for every digital platform.",
    },
    status: "identified" as const,
    notes: "The Hilton Foundation's Catholic identity and child welfare grantmaking pillar make child safety compliance tech a natural conversation — Buchman manages one of the largest Catholic-aligned endowments in the US. Note that at $8B, Hilton is likely to write checks larger than Phosra's current round; position as a strategic minority investment or future-round relationship.",
  },

  {
    id: "mark-regier-praxis",
    name: "Mark Regier",
    fundOrCompany: "Praxis Investment Management / Everence Financial",
    role: "VP of Stewardship Investing",
    category: "faith-family" as const,
    type: "impact-fund" as const,
    checkSizeRange: "$500K–$2M",
    stagePreference: "Seed / Series A",
    contact: {
      linkedin: "https://www.linkedin.com/in/mark-regier-703346a3/",
      website: "https://www.praxismutualfunds.com",
    },
    thesisAlignment: "perfect" as const,
    thesisNote: "Mark Regier has 20+ years overseeing socially responsible investing within the Mennonite/Anabaptist tradition — a faith community with especially strong convictions about nonviolence, protection of the vulnerable, and corporate accountability. His role as VP of Stewardship Investing gives him direct authority over which companies pass Praxis's moral screen, proxy voting posture, and investment recommendations. Praxis explicitly screens for companies protecting the vulnerable and avoiding harm to children — this is not a general ESG screen but a specific moral conviction that directly maps to Phosra's product. Regier's coppaInterest is 'public-stance' because Praxis has publicly engaged on technology harm to children.",
    coppaInterest: "public-stance" as const,
    fundSignal: "active" as const,
    introPaths: [
      {
        type: "industry-association" as const,
        description: "Praxis/Everence operates within the Mennonite Church USA and related Anabaptist institutional networks. Mennonite economic development organizations (MCC, Mennonite Economic Development Associates) provide natural warm intro paths.",
        strength: 4 as 1|2|3|4|5,
      },
      {
        type: "conference-event" as const,
        description: "Praxis participates in socially responsible investing conferences (US SIF Forum, Ceres Conference) where Mark's public positions on faith-based screening make him a known voice. A conference introduction carries peer credibility.",
        strength: 3 as 1|2|3|4|5,
      },
      {
        type: "content-warmup" as const,
        description: "Mark publishes and speaks on faith-based investment screening and corporate accountability. A direct LinkedIn engagement or response to his public writing on technology harm creates a warm connection before a meeting request.",
        strength: 3 as 1|2|3|4|5,
      },
    ],
    tier: 2 as 1|2|3,
    approachStrategy: {
      recommended: "Direct engagement through Mennonite institutional network or US SIF responsible investing community",
      steps: [
        "Identify a Mennonite Church USA institutional contact (MCC, Goshen College, or MEDA) who knows Mark and can frame Phosra as a compliance technology that operationalizes their children's protection values.",
        "Lead with Praxis's explicit moral screen: demonstrate specifically how Phosra would score on their published criteria for 'protecting the vulnerable' and 'avoiding harm to children'.",
        "Prepare a Praxis-format ESG/moral screening brief alongside standard financial documentation — Regier will want to see the thesis in his framework, not a generic impact pitch.",
        "Offer to engage with Praxis's proxy voting and corporate engagement team as a thought partner on digital child safety standards before making a direct investment ask.",
      ],
      openingAngle: "Praxis screens for companies that protect the vulnerable — Phosra is the API infrastructure that makes child protection legally enforceable for every digital platform at scale.",
    },
    status: "identified" as const,
    notes: "Praxis explicitly screens for companies protecting the vulnerable and avoiding harm to children — Regier has direct authority over which companies pass their moral screen, making this a high-conviction match. The Mennonite tradition's emphasis on corporate accountability and nonviolence toward the vulnerable creates unusually deep alignment. At $1B+ mutual fund AUM, Praxis operates at a scale that can accommodate meaningful early-stage allocations through their stewardship investing vehicles.",
  },

  {
    id: "ying-hosler-liberty",
    name: "Ying Hosler CFA",
    fundOrCompany: "Liberty University",
    role: "Senior Director of Investments",
    category: "faith-family" as const,
    type: "impact-fund" as const,
    checkSizeRange: "$1M–$5M",
    stagePreference: "Seed / Series A (building new portfolio)",
    contact: {
      linkedin: "https://www.linkedin.com/in/ying-hosler-cfa-22ba89b/",
    },
    thesisAlignment: "good" as const,
    thesisNote: "Ying Hosler joined Liberty in November 2023 to build its venture allocation from scratch after growing Penn State's endowment from $1B to $6.5B over 13 years and managing all PE/VC at that institution. She is in pure discovery mode — actively sourcing emerging managers and direct investments with fresh mandate and institutional backing. Her Yale SOM MBA and institutional pedigree mean she applies rigorous investment standards, but her current portfolio construction phase means she is actively seeking differentiated allocations. Liberty's 100,000+ online students (many minors) make child safety directly mission-relevant to the university's own operations.",
    coppaInterest: "none" as const,
    fundSignal: "deploying" as const,
    introPaths: [
      {
        type: "alumni-network" as const,
        description: "Ying's Penn State and Yale SOM networks are large and active. A peer introduction from a Penn State endowment colleague or Yale SOM alum in venture carries institutional credibility.",
        strength: 4 as 1|2|3|4|5,
      },
      {
        type: "conference-event" as const,
        description: "NACUBO and Institutional Investor university endowment conferences are where Ying would be building her institutional network in her first year at Liberty. A conference introduction in 2024–2025 creates a natural warm touchpoint.",
        strength: 3 as 1|2|3|4|5,
      },
      {
        type: "industry-association" as const,
        description: "Women in endowment investing networks (Toigo Foundation, WCEA) provide peer introduction paths to Ying through her professional community as a female CIO at a major university.",
        strength: 2 as 1|2|3|4|5,
      },
    ],
    tier: 2 as 1|2|3,
    approachStrategy: {
      recommended: "Penn State or Yale SOM alumni warm introduction from a mutual institutional investing contact",
      steps: [
        "Identify a Penn State endowment or Yale SOM alum who knows Ying professionally and can make a credible peer introduction to a promising emerging allocation.",
        "Frame Phosra around Liberty's own operational stake: 100,000+ online students including minors means Liberty itself faces COPPA and AADC compliance obligations that Phosra's API directly addresses.",
        "Position as an early emerging manager allocation for a portfolio being built from scratch — Ying is in exactly the moment where differentiated early-stage VC makes sense to establish.",
        "Prepare institutional-quality materials: her Penn State background means she has seen world-class diligence documentation and will hold Phosra to the same standard.",
      ],
      openingAngle: "You're building Liberty's venture portfolio from scratch — Phosra is the kind of regulatory compliance infrastructure that most endowments wish they'd backed two years before the COPPA enforcement wave.",
    },
    status: "identified" as const,
    notes: "Actively building Liberty's venture allocation from scratch — one of the few endowment allocators currently in pure discovery mode. Liberty's 100K+ online students (many minors) make child safety directly mission-relevant. Her institutional pedigree (Penn State $1B→$6.5B, Yale SOM) means she applies rigorous standards — do not treat this as an easy faith-aligned pitch. She is a professional institutional investor who happens to work at a faith institution.",
  },

  {
    id: "dolores-bamford-eventide",
    name: "Dolores Bamford CFA",
    fundOrCompany: "Eventide Asset Management",
    role: "Co-CIO & Senior Portfolio Manager",
    category: "faith-family" as const,
    type: "impact-fund" as const,
    checkSizeRange: "$1M–$5M",
    stagePreference: "Growth",
    contact: {
      linkedin: "https://www.linkedin.com/in/doloresbamford/",
    },
    thesisAlignment: "perfect" as const,
    thesisNote: "Dolores Bamford is a literal theologian-investor: SM from MIT Sloan, dual-MA in Theology and Church History from Gordon-Conwell, 13 years as a Goldman Sachs AM Managing Director, and 10 years at Putnam as SVP before joining Eventide. She evaluates investments through both Goldman-grade institutional rigor and deep Christian ethical conviction — a combination that makes her one of the most credible internal advocates for a faith-aligned investment case within any firm. As Co-CIO alongside Finny Kuruvilla, her endorsement is effectively a second vote for conviction investments at Eventide's growth equity strategy. She is not Finny's deputy; she is his co-equal partner on the portfolio.",
    coppaInterest: "none" as const,
    fundSignal: "active" as const,
    introPaths: [
      {
        type: "alumni-network" as const,
        description: "Gordon-Conwell Theological Seminary alumni network is a distinctive and tight-knit community — a mutual contact from her theology program creates an unusual and memorable warm intro angle.",
        strength: 4 as 1|2|3|4|5,
      },
      {
        type: "conference-event" as const,
        description: "Praxis Academy, Faith & Work Movement events, and Eventide's own Business as a Force for Good conferences are venues where Dolores participates as a thought leader in faith-integrated investing.",
        strength: 3 as 1|2|3|4|5,
      },
      {
        type: "portfolio-founder" as const,
        description: "Eventide's existing portfolio founders who have worked with both Finny and Dolores on portfolio governance and ESG engagement can provide a warm introduction that emphasizes her dual-lens evaluation process.",
        strength: 3 as 1|2|3|4|5,
      },
    ],
    tier: 2 as 1|2|3,
    approachStrategy: {
      recommended: "Gordon-Conwell alumni introduction or Eventide portfolio founder warm intro",
      steps: [
        "Identify a mutual contact from Gordon-Conwell, MIT Sloan, or Goldman Sachs AM who knows Dolores and can introduce Phosra with peer-level credibility.",
        "Frame the theological case explicitly: digital spaces that harm children are a structural injustice that investment capital can help correct — Phosra is the instrument.",
        "Prepare materials that speak to both institutional investment standards (Goldman-grade financial rigor) and Christian ethical framework (Eventide's stakeholder impact matrix).",
        "Recognize that winning Dolores's conviction may be the path to Finny's allocation — they are Co-CIOs and her theological endorsement carries weight in Eventide's internal deliberation.",
      ],
      openingAngle: "You built ESG strategies at Goldman and now evaluate investments through both institutional rigor and Christian conviction — Phosra needs both lenses to understand why this is the defining compliance infrastructure of the next decade.",
    },
    status: "identified" as const,
    notes: "A Goldman Sachs MD turned theologian-investor who ran ESG/responsible equity strategies — she evaluates investments through both institutional rigor and Christian ethical conviction, making her an unusually credible advocate for Phosra within Eventide. As Co-CIO, reaching Dolores is effectively a parallel path to reaching Finny Kuruvilla — two separate but mutually reinforcing conviction vectors within the same firm.",
  },

  // ─── Tier 3 ───────────────────────────────────────────────────────────────

  {
    id: "greg-mcneilly-windquest",
    name: "Greg McNeilly",
    fundOrCompany: "Windquest Group (Dick & Betsy DeVos)",
    role: "President & CEO",
    category: "faith-family" as const,
    type: "family-office" as const,
    checkSizeRange: "$1M–$10M",
    stagePreference: "Growth / Strategic",
    contact: {
      linkedin: "https://www.linkedin.com/in/gregmcneilly/",
    },
    thesisAlignment: "adjacent" as const,
    thesisNote: "Greg McNeilly is the operational gatekeeper for the Windquest channel of DeVos family investment — distinct from Randall Damstra's Ottawa Avenue Private Capital. Windquest handles the operating company and strategic technology investment side of the DeVos portfolio, while Ottawa Avenue handles PE fund commitments. McNeilly grew Windquest sixfold to 1,700+ employees across 24 states, evaluating all strategic and technology investments that come through this channel. The DeVos family's evangelical values and Betsy DeVos's Education Secretary tenure create adjacent alignment with child safety — but Windquest's primary mandate is operational/strategic rather than impact, making this a harder thesis conversation.",
    coppaInterest: "none" as const,
    fundSignal: "active" as const,
    introPaths: [
      {
        type: "industry-association" as const,
        description: "Grand Rapids West Michigan business community — the same evangelical business network that reaches Ottawa Avenue Private Capital also reaches Windquest through DeVos family shared institutional presence.",
        strength: 3 as 1|2|3|4|5,
      },
      {
        type: "conference-event" as const,
        description: "Michigan entrepreneurship and technology conferences (Detroit Venture Partners events, Michigan Rise) where Windquest participates as a regional strategic investor.",
        strength: 2 as 1|2|3|4|5,
      },
      {
        type: "2nd-degree-weak" as const,
        description: "Windquest portfolio company executives who have worked with Greg on strategic technology integrations can make a peer introduction to a new technology investment opportunity.",
        strength: 2 as 1|2|3|4|5,
      },
    ],
    tier: 3 as 1|2|3,
    approachStrategy: {
      recommended: "West Michigan evangelical business network introduction, framing as strategic technology investment complementary to Windquest's operating portfolio",
      steps: [
        "Identify a Windquest portfolio executive or West Michigan business contact who has worked with Greg directly and can make a credible warm introduction.",
        "Frame Phosra as a strategic technology investment with potential distribution through Windquest's operating company network — not a pure financial investment.",
        "Reference the DeVos family's education and family focus as the values bridge to child safety compliance technology.",
        "Be prepared for a longer relationship-building arc: Windquest's strategic focus means they need to see operational fit, not just thesis alignment.",
      ],
      openingAngle: "Windquest's operating companies interact with families and children across 24 states — Phosra's compliance infrastructure protects those relationships from regulatory liability.",
    },
    status: "identified" as const,
    notes: "Windquest is the DeVos family's operating/investment company — McNeilly is the operational gatekeeper for deals that flow through this channel rather than Ottawa Avenue Private Capital. The adjacent thesis alignment and operational rather than impact mandate make this a longer-cycle relationship. Pursue Ottawa Avenue (Randall Damstra) as the primary DeVos family path; Windquest is a secondary channel.",
  },

  {
    id: "ken-larson-wheaton",
    name: "Ken Larson",
    fundOrCompany: "Wheaton College",
    role: "Investment Manager & Chief Trust Officer",
    category: "faith-family" as const,
    type: "impact-fund" as const,
    checkSizeRange: "$500K–$3M",
    stagePreference: "Growth",
    contact: {
      linkedin: "https://www.linkedin.com/in/ken-larson-9b612531/",
      website: "https://www.wheaton.edu",
    },
    thesisAlignment: "good" as const,
    thesisNote: "Ken Larson has managed Wheaton's endowment for 30+ years, making him one of the most deeply networked investment professionals in the evangelical academic ecosystem. Wheaton is the most academically rigorous evangelical liberal arts college — the institution that produced Billy Graham and hosts the Billy Graham Center. Larson's 30-year tenure means his relationships span the entire evangelical investment and philanthropic community, making him as valuable as a warm intro hub as he is as a direct allocator. His Chief Trust Officer role also means he manages planned giving and charitable trust vehicles alongside the endowment.",
    coppaInterest: "none" as const,
    fundSignal: "unknown" as const,
    introPaths: [
      {
        type: "alumni-network" as const,
        description: "Wheaton College alumni network is one of the most active evangelical professional networks in the country — a Wheaton alum in the tech or venture space creates a natural and highly credible warm path.",
        strength: 4 as 1|2|3|4|5,
      },
      {
        type: "industry-association" as const,
        description: "NACUBO and Christian higher education investment networks (CCCU — Council for Christian Colleges and Universities) are where Ken's 30-year network makes him a senior peer. An introduction through a fellow Christian higher education CIO carries institutional weight.",
        strength: 3 as 1|2|3|4|5,
      },
      {
        type: "conference-event" as const,
        description: "The Gathering, Evangelical Council for Financial Accountability (ECFA) events, and Wheaton-hosted academic conferences create direct access to Ken's community without a formal intro requirement.",
        strength: 2 as 1|2|3|4|5,
      },
    ],
    tier: 3 as 1|2|3,
    approachStrategy: {
      recommended: "Wheaton College alumni warm introduction from a tech or venture-connected Wheaton grad",
      steps: [
        "Identify a Wheaton College alumnus in the technology or venture ecosystem who knows Ken personally and can make a credible peer introduction.",
        "Frame the ask around Ken's dual role: endowment allocation and trust/planned giving vehicles both offer potential pathways for a Phosra relationship.",
        "Lead with the warm intro hub angle: even if Ken cannot write a meaningful check, his 30-year evangelical investment network is itself the prize — request an introduction conversation, not an investment meeting.",
        "Treat Ken as a relationship multiplier: his endorsement of Phosra within the evangelical endowment community could open five more doors worth more than his direct allocation.",
      ],
      openingAngle: "Thirty years managing Wheaton's endowment means you know every faith-aligned allocator worth knowing — we're looking for 20 minutes and your honest assessment of fit, not just a check.",
    },
    status: "identified" as const,
    notes: "30+ years managing Wheaton's endowment means deep relationships across the evangelical investment community — a warm intro hub even if the direct allocation is modest. The fundSignal is 'unknown' because Wheaton's venture appetite is not publicly established; the strategic value here is Ken's network breadth more than his direct check. Prioritize accordingly: treat this as a relationship-building and referral-network play.",
  },

  {
    id: "adriana-ballard-presbyterian",
    name: "Adriana Ballard",
    fundOrCompany: "Presbyterian Foundation",
    role: "Director of Investments & AVP",
    category: "faith-family" as const,
    type: "impact-fund" as const,
    checkSizeRange: "$1M–$5M",
    stagePreference: "Growth",
    contact: {
      website: "https://www.presbyterianfoundation.org",
    },
    thesisAlignment: "adjacent" as const,
    thesisNote: "Adriana Ballard was newly installed as Director of Investments in 2024 after 14+ years at the Employees Retirement System of Texas ($34B) and a Director role at Nasdaq — she brings institutional-grade investment rigor to a foundation that has historically lagged in investment sophistication. The Presbyterian Foundation manages $2.6B and serves PCUSA churches and institutions. PCUSA has been publicly active on child digital safety and online exploitation through denominational resolutions. Ballard is in pure discovery mode, actively rebuilding the portfolio with new managers and asset classes. Her adjacent thesis alignment reflects the Presbyterian Foundation's broader mandate rather than a specific child safety mission pillar.",
    coppaInterest: "none" as const,
    fundSignal: "active" as const,
    introPaths: [
      {
        type: "conference-event" as const,
        description: "NACUBO, Mission Investors Exchange, and Council on Foundations conferences are where Adriana is actively building her institutional network in her first two years. A 2025-2026 conference introduction catches her in her most receptive discovery window.",
        strength: 3 as 1|2|3|4|5,
      },
      {
        type: "alumni-network" as const,
        description: "Employees Retirement System of Texas alumni network and Nasdaq finance professional networks provide a peer introduction path through shared institutional investing identity.",
        strength: 3 as 1|2|3|4|5,
      },
      {
        type: "industry-association" as const,
        description: "PCUSA denominational networks (Office of the General Assembly, Presbyterian Mission Agency) provide a church-side introduction path to the Foundation's investment team through shared Presbyterian institutional identity.",
        strength: 2 as 1|2|3|4|5,
      },
    ],
    tier: 3 as 1|2|3,
    approachStrategy: {
      recommended: "Conference introduction at NACUBO or Mission Investors Exchange during her active portfolio-building discovery phase",
      steps: [
        "Target a 2025-2026 NACUBO Annual Meeting or Mission Investors Exchange conference where Adriana is actively building her institutional network — a direct peer introduction in this context is natural and low-friction.",
        "Lead with her portfolio construction mandate: Phosra represents a differentiated emerging manager allocation in regulatory compliance technology — a category underrepresented in most institutional portfolios.",
        "Connect to PCUSA's public denominational stance on child digital safety as the mission bridge to what would otherwise be a purely financial conversation.",
        "Acknowledge the adjacent alignment honestly: position Phosra as a values-compatible financial investment rather than a mission-first impact play.",
      ],
      openingAngle: "You're rebuilding the Presbyterian Foundation's portfolio with fresh eyes — Phosra is the kind of differentiated regulatory compliance investment that most institutional allocators haven't discovered yet.",
    },
    status: "identified" as const,
    notes: "Newly installed and actively rebuilding the portfolio — in discovery mode with managers and new opportunities. PCUSA has been active on child digital safety and online exploitation. Adriana's Nasdaq and Texas ERS background means she applies rigorous institutional standards; do not oversell the faith alignment at the expense of investment thesis clarity. The adjacent alignment means the financial case must stand on its own.",
  },
]

// ─── Master List ──────────────────────────────────────────────────────────────

export const WARM_INTRO_TARGETS: WarmIntroTarget[] = [
  ...REGTECH_VCS,
  ...EDTECH_FUNDS,
  ...SOLO_FOUNDER_FUNDS,
  ...TS_LEADERS,
  ...FTC_ALUMNI,
  ...NONPROFIT_LEADERS,
  ...REGTECH_FOUNDERS,
  ...SYNDICATES,
  ...HNW_ANGELS,
  ...FAMILY_OFFICES,
  ...CORPORATE_VCS,
  ...IMPACT_INVESTORS,
  ...CELEBRITY_ANGELS,
  ...POLICY_ANGELS,
  ...PARENT_ANGELS,
  ...FINTECH_ANGELS,
  ...FAITH_FAMILY,
  ...FAITH_GATEKEEPERS,
]

// ─── Super Connectors ─────────────────────────────────────────────────────────

export const SUPER_CONNECTORS: SuperConnector[] = [
  {
    id: "fosi",
    name: "FOSI (Family Online Safety Institute)",
    type: "Industry Association",
    description: "Connects to nearly all T&S leaders. Annual conference + working groups. Stephen Balkam (founder) is a super-connector himself.",
    reachableTargets: ["antigone-davis", "adam-presser", "cormac-keenan", "clint-smith", "tami-bhaumik", "eric-ebenstein", "stephen-balkam", "julie-cordua", "sean-litton"],
    estimatedIntros: 10,
    website: "https://www.fosi.org",
    contactNote: "Apply for membership. Attend annual conference + join working groups.",
  },
  {
    id: "technology-coalition",
    name: "Technology Coalition",
    type: "Industry Body",
    description: "59 member companies committed to child safety. Events draw T&S professionals and investors.",
    reachableTargets: ["cormac-keenan", "adam-presser", "angela-hession", "sean-litton", "julie-cordua"],
    estimatedIntros: 8,
    website: "https://www.technologycoalition.org",
    contactNote: "Attend member events and Project Protect convenings.",
  },
  {
    id: "iapp",
    name: "IAPP (International Association of Privacy Professionals)",
    type: "Professional Association",
    description: "Connects to all privacy/regulatory targets. Conferences, convenings, and member directory.",
    reachableTargets: ["jules-polonetsky", "dimitri-sirota", "rehan-jalil", "mamie-kresses", "chris-babel", "cillian-kieran"],
    estimatedIntros: 8,
    website: "https://iapp.org",
    contactNote: "Join as member. Attend GPS and PSR conferences.",
  },
  {
    id: "roost",
    name: "ROOST ($27M child safety nonprofit)",
    type: "Nonprofit / Coalition",
    description: "New $27M initiative connecting Google, Discord, Roblox, OpenAI safety teams. Clint Smith is Board Chair.",
    reachableTargets: ["clint-smith", "tami-bhaumik", "angela-hession"],
    estimatedIntros: 5,
    website: "https://roost.org",
    contactNote: "Apply for partner program.",
  },
  {
    id: "kid-ecosystem",
    name: "k-ID / OpenAge Ecosystem",
    type: "Portfolio Network",
    description: "k-ID investors (a16z, Konvoy, Okta) + supervisory board (Baroness Shields) form a tight network.",
    reachableTargets: ["konvoy", "okta-ventures", "a16z-speedrun", "joanna-shields", "julian-corbett"],
    estimatedIntros: 6,
    website: "https://www.k-id.com",
    contactNote: "Request intros through portfolio network connections.",
  },
  {
    id: "startup-attorneys",
    name: "Pre-Seed Startup Attorneys",
    type: "Professional Network",
    description: "Cooley, Goodwin, Wilson Sonsini, Gunderson Dettmer, Orrick. Each attorney knows 50+ VCs. 3-5 intros per relationship.",
    reachableTargets: ["precursor", "hustle-fund", "amplify", "flybridge", "backstage"],
    estimatedIntros: 15,
    contactNote: "Engage Cooley, Goodwin, Wilson Sonsini, Gunderson, or Orrick for legal + investor intros.",
  },
  {
    id: "asu-gsv",
    name: "ASU+GSV Summit",
    type: "Conference",
    description: "Premier EdTech investor conference. 600+ investors attend. 15,000+ leaders.",
    reachableTargets: ["reach-capital", "magnify", "emerge", "brighteye", "rethink-ed"],
    estimatedIntros: 10,
    website: "https://www.asugsvsummit.com",
    contactNote: "Register for annual summit (typically April). Apply for startup pitch competition.",
  },
  {
    id: "faith-driven-investor",
    name: "Faith Driven Investor Network",
    type: "Faith & Values Network",
    description: "Umbrella community connecting Sovereign's Capital, 11 Tribes, M25, Praxis, Telos, PivotNorth, IrishAngels, and SENT Ventures. Annual Gathering + conferences. Single entry point to the entire faith-aligned investor ecosystem.",
    reachableTargets: ["sovereigns-capital", "11-tribes", "m25", "praxis-ventures", "telos-ventures", "pivotnorth", "irish-angels", "sent-ventures", "1flourish", "cathy-family"],
    estimatedIntros: 20,
    website: "https://www.faithdriveninvestor.org",
    contactNote: "Attend the annual Gathering. Join online community for introductions.",
  },
]

// ─── Summary Stats ────────────────────────────────────────────────────────────

export function getNetworkStats() {
  const targets = WARM_INTRO_TARGETS
  const tier1 = targets.filter((t) => t.tier === 1)
  const tier2 = targets.filter((t) => t.tier === 2)
  const tier3 = targets.filter((t) => t.tier === 3)

  const totalPaths = targets.reduce((sum, t) => sum + t.introPaths.length, 0)

  const byCategory = targets.reduce(
    (acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const byType = targets.reduce(
    (acc, t) => {
      acc[t.type] = (acc[t.type] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  return {
    totalTargets: targets.length,
    totalPaths,
    tier1Count: tier1.length,
    tier2Count: tier2.length,
    tier3Count: tier3.length,
    byCategory,
    byType,
    superConnectors: SUPER_CONNECTORS.length,
    estimatedReach: SUPER_CONNECTORS.reduce((sum, c) => sum + c.estimatedIntros, 0),
  }
}
