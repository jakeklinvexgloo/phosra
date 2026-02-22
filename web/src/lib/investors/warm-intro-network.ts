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

export type InvestorType = "vc" | "angel" | "syndicate" | "strategic" | "micro-fund" | "cvc"

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
    tier: 2,
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
    tier: 2,
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
    tier: 2,
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
  },
  {
    id: "technology-coalition",
    name: "Technology Coalition",
    type: "Industry Body",
    description: "59 member companies committed to child safety. Events draw T&S professionals and investors.",
    reachableTargets: ["cormac-keenan", "adam-presser", "angela-hession", "sean-litton", "julie-cordua"],
    estimatedIntros: 8,
  },
  {
    id: "iapp",
    name: "IAPP (International Association of Privacy Professionals)",
    type: "Professional Association",
    description: "Connects to all privacy/regulatory targets. Conferences, convenings, and member directory.",
    reachableTargets: ["jules-polonetsky", "dimitri-sirota", "rehan-jalil", "mamie-kresses", "chris-babel", "cillian-kieran"],
    estimatedIntros: 8,
  },
  {
    id: "roost",
    name: "ROOST ($27M child safety nonprofit)",
    type: "Nonprofit / Coalition",
    description: "New $27M initiative connecting Google, Discord, Roblox, OpenAI safety teams. Clint Smith is Board Chair.",
    reachableTargets: ["clint-smith", "tami-bhaumik", "angela-hession"],
    estimatedIntros: 5,
  },
  {
    id: "kid-ecosystem",
    name: "k-ID / OpenAge Ecosystem",
    type: "Portfolio Network",
    description: "k-ID investors (a16z, Konvoy, Okta) + supervisory board (Baroness Shields) form a tight network.",
    reachableTargets: ["konvoy", "okta-ventures", "a16z-speedrun", "joanna-shields", "julian-corbett"],
    estimatedIntros: 6,
  },
  {
    id: "startup-attorneys",
    name: "Pre-Seed Startup Attorneys",
    type: "Professional Network",
    description: "Cooley, Goodwin, Wilson Sonsini, Gunderson Dettmer, Orrick. Each attorney knows 50+ VCs. 3-5 intros per relationship.",
    reachableTargets: ["precursor", "hustle-fund", "amplify", "flybridge", "backstage"],
    estimatedIntros: 15,
  },
  {
    id: "asu-gsv",
    name: "ASU+GSV Summit",
    type: "Conference",
    description: "Premier EdTech investor conference. 600+ investors attend. 15,000+ leaders.",
    reachableTargets: ["reach-capital", "magnify", "emerge", "brighteye", "rethink-ed"],
    estimatedIntros: 10,
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
