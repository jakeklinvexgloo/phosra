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

  // Scoring
  thesisAlignment: "perfect" | "good" | "adjacent"
  thesisNote: string
  coppaInterest: "public-stance" | "portfolio-signal" | "none"
  fundSignal: "deploying" | "active" | "unknown"

  // Warm intro path
  introPaths: IntroPath[]
  tier: PriorityTier

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
    thesisAlignment: "perfect",
    thesisNote: "$258M AUM gaming-focused. Invested in k-ID for child safety compliance. Strong thesis on safety infrastructure.",
    coppaInterest: "portfolio-signal",
    fundSignal: "deploying",
    introPaths: [
      { type: "portfolio-founder", description: "Intro via k-ID founder (Julian Corbett)", strength: 4 },
      { type: "industry-association", description: "Gaming industry events / GDC", strength: 2 },
    ],
    tier: 1,
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
    thesisAlignment: "perfect",
    thesisNote: "Invested in k-ID. Portfolio includes DataGrail (privacy), Drata (compliance). Identity-first thesis.",
    coppaInterest: "portfolio-signal",
    fundSignal: "deploying",
    introPaths: [
      { type: "portfolio-founder", description: "Intro via k-ID or DataGrail founders", strength: 3 },
      { type: "industry-association", description: "IAPP conferences, identity verification events", strength: 2 },
    ],
    tier: 1,
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
    thesisAlignment: "perfect",
    thesisNote: "World's largest early-stage fintech fund. 191 portfolio cos. Dedicated RegTech practice for digital compliance infra.",
    coppaInterest: "portfolio-signal",
    fundSignal: "active",
    introPaths: [
      { type: "industry-association", description: "Fintech/regtech conferences", strength: 2 },
      { type: "content-warmup", description: "Engage with regtech content on LinkedIn", strength: 1 },
    ],
    tier: 1,
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
    thesisAlignment: "perfect",
    thesisNote: "Leading EU pre-seed/seed. 400+ portfolio cos. Invested in Alinia (AI compliance). Compliance-first approach.",
    coppaInterest: "portfolio-signal",
    fundSignal: "deploying",
    introPaths: [
      { type: "portfolio-founder", description: "Intro via Alinia founders", strength: 3 },
      { type: "cold-application", description: "Accepts applications on website", strength: 1 },
    ],
    tier: 1,
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
    thesisAlignment: "perfect",
    thesisNote: "Co-led L1ght's $15M seed. NYC-based. Focus on AI/ML, education, security. Direct child safety track record.",
    coppaInterest: "portfolio-signal",
    fundSignal: "active",
    introPaths: [
      { type: "portfolio-founder", description: "Intro via L1ght founders", strength: 3 },
      { type: "industry-association", description: "NYC tech/VC events", strength: 2 },
    ],
    tier: 1,
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
    thesisAlignment: "perfect",
    thesisNote: "Co-led $15M seed in L1ght (AI child protection). Luxembourg-based. Strong European network.",
    coppaInterest: "portfolio-signal",
    fundSignal: "active",
    introPaths: [
      { type: "portfolio-founder", description: "Intro via L1ght team", strength: 3 },
    ],
    tier: 1,
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
    thesisAlignment: "good",
    thesisNote: "Invested in Bark Technologies ($9M Series A). ML-powered safety thesis. Quantitative approach.",
    coppaInterest: "portfolio-signal",
    fundSignal: "active",
    introPaths: [
      { type: "portfolio-founder", description: "Intro via Bark founders", strength: 3 },
    ],
    tier: 2,
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
    thesisAlignment: "good",
    thesisNote: "Led Veriff's $7.7M Series A. European early-stage. 5 unicorns. Identity verification thesis.",
    coppaInterest: "portfolio-signal",
    fundSignal: "active",
    introPaths: [
      { type: "portfolio-founder", description: "Intro via Veriff team", strength: 3 },
    ],
    tier: 2,
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
    thesisAlignment: "good",
    thesisNote: "Impact-focused, top-quartile returns. 170+ portfolio cos. Justice & equity thesis. Child protection fits.",
    coppaInterest: "none",
    fundSignal: "active",
    introPaths: [
      { type: "cold-application", description: "Apply on website", strength: 1 },
      { type: "content-warmup", description: "Impact/child safety angle on LinkedIn", strength: 2 },
    ],
    tier: 2,
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
    thesisAlignment: "good",
    thesisNote: "Led Bark's $9M Series A. $550M committed capital. Family safety thesis.",
    coppaInterest: "portfolio-signal",
    fundSignal: "active",
    introPaths: [
      { type: "portfolio-founder", description: "Intro via Bark team", strength: 3 },
    ],
    tier: 2,
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
    thesisAlignment: "good",
    thesisNote: "Invested in Qustodio (parental controls). Spanish early-stage VC. 79 companies, 4 unicorns.",
    coppaInterest: "portfolio-signal",
    fundSignal: "active",
    introPaths: [
      { type: "portfolio-founder", description: "Intro via Qustodio founders", strength: 3 },
    ],
    tier: 2,
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
    thesisAlignment: "good",
    thesisNote: "367 portfolio cos. Publicly praised KOSA. Active thesis on responsible tech & child digital wellbeing.",
    coppaInterest: "public-stance",
    fundSignal: "active",
    introPaths: [
      { type: "industry-association", description: "Responsible tech / digital wellbeing communities", strength: 2 },
    ],
    tier: 2,
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
    thesisAlignment: "good",
    thesisNote: "Invested in SuperAwesome. European early-stage focus. 89 portfolio cos including Deliveroo.",
    coppaInterest: "portfolio-signal",
    fundSignal: "active",
    introPaths: [
      { type: "portfolio-founder", description: "Via SuperAwesome/Epic Games contacts", strength: 2 },
    ],
    tier: 2,
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
    thesisAlignment: "good",
    thesisNote: "$400M AUM backed by Santander. Fintech-focused. Portfolio includes Skyflow (data protection). API-first thesis.",
    coppaInterest: "portfolio-signal",
    fundSignal: "active",
    introPaths: [
      { type: "content-warmup", description: "API/compliance content engagement", strength: 1 },
    ],
    tier: 2,
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
    thesisAlignment: "good",
    thesisNote: "Applied AI, data infra, fintech, cyber. Portfolio includes Passbase (identity verification, AML, KYC).",
    coppaInterest: "portfolio-signal",
    fundSignal: "active",
    introPaths: [
      { type: "portfolio-founder", description: "Intro via Passbase team", strength: 2 },
    ],
    tier: 2,
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
    thesisAlignment: "good",
    thesisNote: "$150M fund focused on AI/ML, SaaS, cybersecurity. Pre-seed and seed specialist. Developer tools thesis.",
    coppaInterest: "none",
    fundSignal: "active",
    introPaths: [
      { type: "content-warmup", description: "Developer tools / API content", strength: 1 },
    ],
    tier: 3,
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
    thesisAlignment: "good",
    thesisNote: "$1B+ AUM. AI Native Vertical SaaS thesis. Developer platforms. East Coast network.",
    coppaInterest: "none",
    fundSignal: "active",
    introPaths: [
      { type: "content-warmup", description: "Vertical SaaS / compliance content", strength: 1 },
    ],
    tier: 3,
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
    thesisAlignment: "perfect",
    thesisNote: "Makes equity-free investments in child online safety tech. Dedicated Child Online Safety cohort.",
    coppaInterest: "public-stance",
    fundSignal: "deploying",
    introPaths: [
      { type: "cold-application", description: "Apply directly to UNICEF Venture Fund", strength: 2 },
    ],
    tier: 2,
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
    thesisAlignment: "good",
    thesisNote: "Leading edtech investor. Portfolio includes Outschool, Seesaw, ClassTag — all COPPA-subject platforms. They understand the pain.",
    coppaInterest: "portfolio-signal",
    fundSignal: "deploying",
    introPaths: [
      { type: "portfolio-founder", description: "Intro via Outschool or Seesaw founders", strength: 3 },
      { type: "conference-event", description: "ASU+GSV Summit (Apr 2026)", strength: 2 },
    ],
    tier: 1,
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
    thesisAlignment: "perfect",
    thesisNote: "Transform how families live, work, care. Family tech focus. Backed by Pivotal Ventures (Melinda French Gates). Child safety IS their concern.",
    coppaInterest: "public-stance",
    fundSignal: "deploying",
    introPaths: [
      { type: "cold-application", description: "Apply via website", strength: 1 },
      { type: "content-warmup", description: "Family tech / child safety content engagement", strength: 2 },
    ],
    tier: 1,
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
    thesisAlignment: "good",
    thesisNote: "UK edtech accelerator. AI-first lens. Portfolio serves young learners needing compliance.",
    coppaInterest: "none",
    fundSignal: "deploying",
    introPaths: [
      { type: "cold-application", description: "Accelerator application", strength: 2 },
    ],
    tier: 2,
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
    thesisAlignment: "good",
    thesisNote: "Europe's first edtech-only VC. EU focus means DSA/GDPR-K compliance is core to portfolio needs.",
    coppaInterest: "none",
    fundSignal: "active",
    introPaths: [
      { type: "cold-application", description: "Direct application on website", strength: 1 },
    ],
    tier: 2,
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
    thesisAlignment: "good",
    thesisNote: "TIME Top VC 2025. 25+ years edtech. Co-founded Rethink First ($100M ARR, neurodivergent learners). Deep child-serving portfolio.",
    coppaInterest: "portfolio-signal",
    fundSignal: "active",
    introPaths: [
      { type: "content-warmup", description: "EdTech / child-serving platform content", strength: 2 },
    ],
    tier: 2,
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
    thesisAlignment: "good",
    thesisNote: "70% founder / 30% market weighting. Backs 30-40 pre-launch founders/year. Invested in Alinia (AI compliance). Serial founder with 3 exits = ideal candidate.",
    coppaInterest: "portfolio-signal",
    fundSignal: "deploying",
    introPaths: [
      { type: "cold-application", description: "Reads every cold submission on website", strength: 3 },
      { type: "portfolio-founder", description: "Intro via Alinia founders", strength: 4 },
    ],
    tier: 1,
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
    thesisAlignment: "good",
    thesisNote: "Explicitly backs solo founders. Execution > pedigree. B2B/SaaS focus. Reviews 1,000+ decks/month.",
    coppaInterest: "none",
    fundSignal: "deploying",
    introPaths: [
      { type: "cold-application", description: "Cold applications welcome on website", strength: 3 },
    ],
    tier: 1,
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
    thesisAlignment: "perfect",
    thesisNote: "B2B/API/AI only. 'Don't require co-investors.' Want founder-CEO forever. Perfect thesis match for compliance API.",
    coppaInterest: "none",
    fundSignal: "active",
    introPaths: [
      { type: "cold-application", description: "Apply on saastrfund.com", strength: 2 },
      { type: "content-warmup", description: "Engage with Jason Lemkin's LinkedIn content", strength: 2 },
    ],
    tier: 1,
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
    thesisAlignment: "good",
    thesisNote: "12-week accelerator. Led k-ID's pre-seed. $180M+ deployed. $5M+ in cloud/AI credits. Brand halo effect.",
    coppaInterest: "portfolio-signal",
    fundSignal: "deploying",
    introPaths: [
      { type: "cold-application", description: "Application on speedrun.a16z.com", strength: 2 },
      { type: "portfolio-founder", description: "Intro via k-ID (went through Speedrun)", strength: 4 },
    ],
    tier: 1,
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
    thesisAlignment: "adjacent",
    thesisNote: "SEAL structure for capital-efficient businesses. Built for solo/small-team founders. Phosra's API model fits.",
    coppaInterest: "none",
    fundSignal: "active",
    introPaths: [
      { type: "cold-application", description: "Application on calmfund.com", strength: 2 },
    ],
    tier: 3,
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
    thesisAlignment: "adjacent",
    thesisNote: "Backs underrepresented founders. 35 pre-seed investments in 2025. Solo founder accepted.",
    coppaInterest: "none",
    fundSignal: "deploying",
    introPaths: [
      { type: "cold-application", description: "Apply on backstagecapital.com", strength: 2 },
    ],
    tier: 3,
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
    thesisAlignment: "adjacent",
    thesisNote: "Year-long remote accelerator for B2B SaaS. Capital-efficient focus. Solo founder gets $120K base.",
    coppaInterest: "none",
    fundSignal: "active",
    introPaths: [
      { type: "cold-application", description: "Apply on tinyseed.com (needs revenue)", strength: 2 },
    ],
    tier: 3,
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
    thesisAlignment: "perfect",
    thesisNote: "Directly oversees Meta's COPPA compliance. 10 years in State AG office. Serves on FOSI board. Phosra solves her team's problem.",
    coppaInterest: "public-stance",
    fundSignal: "unknown",
    introPaths: [
      { type: "industry-association", description: "FOSI network, TSPA", strength: 3 },
      { type: "alumni-network", description: "State AG alumni networks", strength: 2 },
    ],
    tier: 1,
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
    thesisAlignment: "perfect",
    thesisNote: "Led TikTok T&S 2020+. Built teen screen time limits, parental controls. Now advisory — has time for angel investing.",
    coppaInterest: "public-stance",
    fundSignal: "unknown",
    introPaths: [
      { type: "industry-association", description: "FOSI network, Technology Coalition", strength: 3 },
    ],
    tier: 1,
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
    thesisAlignment: "perfect",
    thesisNote: "Oversees Discord's T&S. Board Chair of ROOST ($27M child safety nonprofit). Discord under state AG scrutiny for child safety.",
    coppaInterest: "public-stance",
    fundSignal: "unknown",
    introPaths: [
      { type: "industry-association", description: "ROOST founding network, FOSI, TSPA", strength: 3 },
    ],
    tier: 1,
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
    thesisAlignment: "perfect",
    thesisNote: "Founded WeProtect. Senior Facebook exec. On k-ID/OpenAge supervisory board. Deep network across platforms and governments.",
    coppaInterest: "public-stance",
    fundSignal: "unknown",
    introPaths: [
      { type: "industry-association", description: "WeProtect network, k-ID/OpenAge board", strength: 3 },
    ],
    tier: 1,
    status: "identified",
    notes: "Founded the leading global child safety alliance. Active in k-ID ecosystem.",
  },
  {
    id: "adam-presser",
    name: "Adam Presser",
    fundOrCompany: "TikTok",
    role: "Head of Operations / Global T&S",
    category: "ts-leader",
    type: "angel",
    checkSizeRange: "$25K-$50K",
    stagePreference: "Strategic",
    thesisAlignment: "perfect",
    thesisNote: "Took over TikTok global T&S. TikTok under intense COPPA scrutiny. Phosra's law-mapping solves their multi-jurisdiction problem.",
    coppaInterest: "public-stance",
    fundSignal: "unknown",
    introPaths: [
      { type: "industry-association", description: "FOSI, Technology Coalition", strength: 2 },
    ],
    tier: 1,
    status: "identified",
    notes: "TikTok's regulatory exposure = high urgency for compliance tooling.",
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
    thesisAlignment: "good",
    thesisNote: "Former Twitter Head of T&S. Now Match Group (Tinder/Hinge). Carnegie Endowment scholar. UC Berkeley policy fellow.",
    coppaInterest: "public-stance",
    fundSignal: "unknown",
    introPaths: [
      { type: "industry-association", description: "Carnegie Endowment, UC Berkeley, TSPA, Aspen Institute", strength: 2 },
    ],
    tier: 2,
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
    thesisAlignment: "good",
    thesisNote: "Founded Twitter's T&S function. Before Twitter, ran sting operations for child predator investigations. Deep personal commitment.",
    coppaInterest: "public-stance",
    fundSignal: "unknown",
    introPaths: [
      { type: "industry-association", description: "TSPA, TED network, Twitter T&S alumni", strength: 2 },
    ],
    tier: 2,
    status: "identified",
    notes: "Legendary T&S figure. TED speaker. Now independent — available for advisory/angel.",
  },
  {
    id: "angela-hession",
    name: "Angela Hession",
    fundOrCompany: "Twitch",
    role: "Global VP Trust & Safety (former Microsoft Xbox)",
    category: "ts-leader",
    type: "angel",
    checkSizeRange: "$15K-$25K",
    stagePreference: "Strategic",
    thesisAlignment: "good",
    thesisNote: "Created Xbox's Project Artemis grooming detection. ~1,200 NCMEC reports in H1 2025 alone. 20yr Microsoft veteran. Enterprise compliance background.",
    coppaInterest: "public-stance",
    fundSignal: "unknown",
    introPaths: [
      { type: "industry-association", description: "Technology Coalition, NCMEC, Microsoft/Xbox alumni", strength: 2 },
    ],
    tier: 2,
    status: "identified",
    notes: "Enterprise compliance background from Microsoft. Operational perspective.",
  },
  {
    id: "tami-bhaumik",
    name: "Tami Bhaumik",
    fundOrCompany: "Roblox",
    role: "VP Civility & Partnerships (former FOSI Board Chair)",
    category: "ts-leader",
    type: "angel",
    checkSizeRange: "$15K-$25K",
    stagePreference: "Strategic",
    thesisAlignment: "good",
    thesisNote: "Leads Roblox civility/safety partnerships. Former FOSI Board Chair. Roblox faces ~80 child exploitation lawsuits.",
    coppaInterest: "public-stance",
    fundSignal: "unknown",
    introPaths: [
      { type: "industry-association", description: "FOSI board network, Roblox safety partners", strength: 3 },
    ],
    tier: 2,
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
    thesisAlignment: "good",
    thesisNote: "Just became FOSI Chair (Jan 2026). TikTok's policy lead dealing with COPPA 2.0. Nexus of policy and platform.",
    coppaInterest: "public-stance",
    fundSignal: "unknown",
    introPaths: [
      { type: "industry-association", description: "FOSI network (he IS the chair)", strength: 4 },
    ],
    tier: 2,
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
    thesisAlignment: "perfect",
    thesisNote: "Leads preeminent privacy think tank. Former CPO at AOL/DoubleClick. Advises on children's privacy. Angel investor in privacy tech.",
    coppaInterest: "public-stance",
    fundSignal: "unknown",
    introPaths: [
      { type: "industry-association", description: "IAPP, FPF convenings, privacy bar", strength: 3 },
    ],
    tier: 1,
    status: "identified",
    notes: "Active in privacy startup ecosystem. Deep regulatory knowledge. Known angel investor.",
  },
  {
    id: "lina-khan",
    name: "Lina Khan",
    fundOrCompany: "Former FTC Chair (2021-2025)",
    role: "Former FTC Chair",
    category: "ftc-alumni",
    type: "angel",
    checkSizeRange: "$10K-$25K",
    stagePreference: "Advisory",
    thesisAlignment: "perfect",
    thesisNote: "Oversaw COPPA enforcement as FTC Chair. Spoke at YC. Enormous credibility signal. Advisory value >> check size.",
    coppaInterest: "public-stance",
    fundSignal: "unknown",
    introPaths: [
      { type: "alumni-network", description: "YC network, Columbia Law, NYC policy circles", strength: 2 },
    ],
    tier: 2,
    status: "identified",
    notes: "Enormous credibility signal. Unclear investment appetite post-FTC. Worth pursuing for advisory.",
  },
  {
    id: "rebecca-slaughter",
    name: "Rebecca Kelly Slaughter",
    fundOrCompany: "Former FTC Commissioner",
    role: "Former Commissioner",
    category: "ftc-alumni",
    type: "angel",
    checkSizeRange: "$10K-$25K",
    stagePreference: "Advisory",
    thesisAlignment: "good",
    thesisNote: "Strong child privacy advocate at FTC. Deep expertise in children's data protection and COPPA enforcement.",
    coppaInterest: "public-stance",
    fundSignal: "unknown",
    introPaths: [
      { type: "industry-association", description: "FTC alumni network, Georgetown Law, privacy bar", strength: 2 },
    ],
    tier: 2,
    status: "identified",
    notes: "Strong COPPA advocate. Currently in legal battle over FTC firing.",
  },
  {
    id: "alvaro-bedoya",
    name: "Alvaro Bedoya",
    fundOrCompany: "Former FTC Commissioner",
    role: "Former Commissioner, Georgetown Privacy Center founder",
    category: "ftc-alumni",
    type: "angel",
    checkSizeRange: "$10K-$25K",
    stagePreference: "Advisory",
    thesisAlignment: "good",
    thesisNote: "Founded Georgetown Center on Privacy & Technology. Expert on surveillance and children's privacy. Now seeking new roles.",
    coppaInterest: "public-stance",
    fundSignal: "unknown",
    introPaths: [
      { type: "alumni-network", description: "Georgetown Law network, privacy advocacy community", strength: 2 },
    ],
    tier: 2,
    status: "identified",
    notes: "Recently freed up. Looking for next chapter. Privacy + child safety expertise.",
  },
  {
    id: "mamie-kresses",
    name: "Mamie Kresses",
    fundOrCompany: "Former FTC",
    role: "Former Associate Director, Division of Marketing Practices",
    category: "ftc-alumni",
    type: "angel",
    checkSizeRange: "$10K-$25K",
    stagePreference: "Advisory",
    thesisAlignment: "perfect",
    thesisNote: "Led COPPA enforcement at FTC for years. Knows every COPPA case. Now likely in private practice/advisory.",
    coppaInterest: "public-stance",
    fundSignal: "unknown",
    introPaths: [
      { type: "industry-association", description: "FTC alumni, IAPP", strength: 2 },
    ],
    tier: 2,
    status: "identified",
    notes: "Deep COPPA enforcement expertise. Credibility signal for investor conversations.",
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
    thesisAlignment: "perfect",
    thesisNote: "Founded leading children's media advocacy org. Stanford faculty. Partnered with OpenAI on Parents & Kids Safe AI Act. Massive legislative influence.",
    coppaInterest: "public-stance",
    fundSignal: "unknown",
    introPaths: [
      { type: "alumni-network", description: "Stanford faculty network, Aspen Ideas", strength: 2 },
      { type: "industry-association", description: "Common Sense advisory board", strength: 2 },
    ],
    tier: 1,
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
    thesisAlignment: "perfect",
    thesisNote: "Created UK's Age Appropriate Design Code (AADC) which influenced global legislation. UN Broadband Commissioner. Her work literally created the laws Phosra maps.",
    coppaInterest: "public-stance",
    fundSignal: "unknown",
    introPaths: [
      { type: "industry-association", description: "5Rights network, UK House of Lords, IEEE, Oxford AI Ethics", strength: 2 },
    ],
    tier: 1,
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
    thesisAlignment: "perfect",
    thesisNote: "Founded Family Online Safety Institute. Convener of major platforms. Direct connection to every T&S leader.",
    coppaInterest: "public-stance",
    fundSignal: "unknown",
    introPaths: [
      { type: "industry-association", description: "FOSI events/convenings", strength: 3 },
    ],
    tier: 1,
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
    thesisAlignment: "perfect",
    thesisNote: "Leads the leading child safety tech nonprofit. Thorn's Safer product detects CSAM. Complementary to Phosra. Technology-first approach.",
    coppaInterest: "public-stance",
    fundSignal: "unknown",
    introPaths: [
      { type: "industry-association", description: "Thorn board, Technology Coalition", strength: 3 },
    ],
    tier: 1,
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
    thesisAlignment: "good",
    thesisNote: "Leads 59-member coalition of companies committed to child safety. Phosra directly supports member compliance needs.",
    coppaInterest: "public-stance",
    fundSignal: "unknown",
    introPaths: [
      { type: "industry-association", description: "Technology Coalition events, TrustCon", strength: 3 },
    ],
    tier: 2,
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
    thesisAlignment: "good",
    thesisNote: "Leads the national clearinghouse for missing/exploited children. Knows which platforms are and aren't compliant.",
    coppaInterest: "public-stance",
    fundSignal: "unknown",
    introPaths: [
      { type: "industry-association", description: "Technology Coalition, NCMEC board, Congressional allies", strength: 2 },
    ],
    tier: 2,
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
    thesisAlignment: "perfect",
    thesisNote: "Serial entrepreneur ($200M exit pre-BigID). Active angel in 9 startups (Snyk, Protect AI). BigID ($1.25B) does data privacy discovery. Complementary.",
    coppaInterest: "portfolio-signal",
    fundSignal: "unknown",
    introPaths: [
      { type: "industry-association", description: "IAPP conferences, NYC privacy tech community, Boldstart Ventures network", strength: 2 },
    ],
    tier: 1,
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
    thesisAlignment: "perfect",
    thesisNote: "Three massive exits. Venture Advisor at Mayfield Fund. Mentors Silicon Valley startups. Deeply understands compliance.",
    coppaInterest: "public-stance",
    fundSignal: "unknown",
    introPaths: [
      { type: "industry-association", description: "Mayfield Fund, IAPP, Silicon Valley tech community", strength: 2 },
    ],
    tier: 1,
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
    thesisAlignment: "perfect",
    thesisNote: "Founded the dominant privacy compliance platform. Active angel. TiE Atlanta charter. Understands compliance tooling market better than anyone.",
    coppaInterest: "portfolio-signal",
    fundSignal: "unknown",
    introPaths: [
      { type: "industry-association", description: "TiE Atlanta, Insight Partners network, IAPP", strength: 2 },
    ],
    tier: 1,
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
    thesisAlignment: "perfect",
    thesisNote: "Led TrustArc (ex-TRUSTe) through transformation. Fresh exit to Main Capital Partners Oct 2025. Has capital and time.",
    coppaInterest: "portfolio-signal",
    fundSignal: "unknown",
    introPaths: [
      { type: "industry-association", description: "IAPP, Silicon Valley privacy community", strength: 2 },
    ],
    tier: 2,
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
    thesisAlignment: "good",
    thesisNote: "Serial entrepreneur. Built Ethyca as privacy engineering platform. Open-source privacy tooling (Fides). Developer-first compliance.",
    coppaInterest: "portfolio-signal",
    fundSignal: "unknown",
    introPaths: [
      { type: "industry-association", description: "NYC privacy tech, IA Ventures/Founder Collective, Irish tech diaspora", strength: 2 },
    ],
    tier: 2,
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
    thesisAlignment: "good",
    thesisNote: "Built the age verification system Meta adopted (AgeKey, Dec 2025). Supervisory board includes Baroness Shields.",
    coppaInterest: "public-stance",
    fundSignal: "unknown",
    introPaths: [
      { type: "industry-association", description: "Baroness Shields connection, Meta safety team", strength: 3 },
    ],
    tier: 2,
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
    thesisAlignment: "good",
    thesisNote: "Global network, $3M+/year from NY chapter alone. $31M+ invested. 14 chapters means one deal reaches all.",
    coppaInterest: "none",
    fundSignal: "active",
    introPaths: [
      { type: "alumni-network", description: "HBS alumni connections", strength: 2 },
      { type: "cold-application", description: "Apply through local chapter", strength: 2 },
    ],
    tier: 1,
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
    thesisAlignment: "good",
    thesisNote: "Impact-focused. 500+ members. Child safety has massive social impact angle.",
    coppaInterest: "none",
    fundSignal: "active",
    introPaths: [
      { type: "cold-application", description: "Apply for Pitch Summit", strength: 2 },
    ],
    tier: 2,
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
    thesisAlignment: "adjacent",
    thesisNote: "$900M+ invested across 2,600+ rounds. Diversity & social impact focus.",
    coppaInterest: "none",
    fundSignal: "active",
    introPaths: [
      { type: "cold-application", description: "Apply through gaingels.com", strength: 1 },
    ],
    tier: 2,
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
    thesisAlignment: "good",
    thesisNote: "Only angel syndicate for security practitioners. Cybersecurity + compliance overlap. Members understand the pain.",
    coppaInterest: "none",
    fundSignal: "active",
    introPaths: [
      { type: "cold-application", description: "Apply through ventureinsecurity.net", strength: 2 },
    ],
    tier: 2,
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
    thesisAlignment: "good",
    thesisNote: "Pan-European network with family offices. Explicit RegTech thesis (invested in Blockpit, 360kompany). President calls RegTech a 'painkiller.'",
    coppaInterest: "portfolio-signal",
    fundSignal: "active",
    introPaths: [
      { type: "cold-application", description: "ESAC application", strength: 1 },
    ],
    tier: 2,
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
    thesisAlignment: "adjacent",
    thesisNote: "Jim Steyer (Common Sense Media) is Stanford faculty. Silicon Valley proximity. Joint events with HBS Angels.",
    coppaInterest: "none",
    fundSignal: "active",
    introPaths: [
      { type: "alumni-network", description: "Stanford alumni network", strength: 2 },
    ],
    tier: 2,
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
