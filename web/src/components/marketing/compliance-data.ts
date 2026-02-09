export interface ComplianceLaw {
  id: string
  name: string
  fullName: string
  jurisdiction: string
  stage: string
  stageColor: "enacted" | "passed" | "pending"
  summary: string
  categories: { id: string; name: string; group: string }[]
  platforms: string[]
  mcpSnippet: string
}

export const COMPLIANCE_LAWS: ComplianceLaw[] = [
  {
    id: "kosa",
    name: "KOSA",
    fullName: "Kids Online Safety Act",
    jurisdiction: "United States (Federal)",
    stage: "Passed Senate (Jul 2024)",
    stageColor: "passed",
    summary:
      "Establishes a duty of care for platforms, requiring them to disable addictive features and algorithmic feeds for minors by default.",
    categories: [
      { id: "algo_feed_control", name: "Algorithm Feed Control", group: "algorithmic" },
      { id: "addictive_design_control", name: "Addictive Design Control", group: "algorithmic" },
      { id: "targeted_ad_block", name: "Targeted Ad Block", group: "advertising" },
    ],
    platforms: ["Netflix", "YouTube", "TikTok", "Instagram"],
    mcpSnippet: `// Enforce KOSA compliance for Emma
tool: trigger_child_enforcement
input: {
  child_id: "ch_emma_01",
  law: "KOSA",
  rules: ["algo_feed_control",
          "addictive_design_control",
          "targeted_ad_block"]
}

→ Netflix    feed disabled, no ads     ✓
→ YouTube    chronological feed        ✓
→ TikTok     autoplay off, no streaks  ✓
→ Instagram  likes hidden, no ads      ✓`,
  },
  {
    id: "coppa-2",
    name: "COPPA 2.0",
    fullName: "Children's Online Privacy Protection Act 2.0",
    jurisdiction: "United States (Federal)",
    stage: "Passed Senate (Jul 2024)",
    stageColor: "passed",
    summary:
      "Extends COPPA to teens under 17, bans all targeted advertising to minors, and creates an Eraser Button for data deletion.",
    categories: [
      { id: "targeted_ad_block", name: "Targeted Ad Block", group: "advertising" },
      { id: "data_deletion_request", name: "Data Deletion Request", group: "privacy" },
      { id: "geolocation_opt_in", name: "Geolocation Opt-In", group: "privacy" },
    ],
    platforms: ["YouTube", "Instagram", "TikTok", "Snapchat", "Roblox"],
    mcpSnippet: `// Enforce COPPA 2.0 — block ads + enable eraser
tool: trigger_child_enforcement
input: {
  child_id: "ch_emma_01",
  law: "COPPA_2",
  rules: ["targeted_ad_block",
          "data_deletion_request",
          "geolocation_opt_in"]
}

→ YouTube    behavioral ads blocked    ✓
→ Instagram  ad targeting disabled     ✓
→ TikTok     geolocation off           ✓
→ Snapchat   data deletion enabled     ✓`,
  },
  {
    id: "eu-dsa",
    name: "EU DSA",
    fullName: "Digital Services Act",
    jurisdiction: "European Union",
    stage: "In force (Feb 2024)",
    stageColor: "enacted",
    summary:
      "Comprehensive EU regulation banning targeted ads to minors and requiring risk assessments for algorithmic systems.",
    categories: [
      { id: "algo_feed_control", name: "Algorithm Feed Control", group: "algorithmic" },
      { id: "addictive_design_control", name: "Addictive Design Control", group: "algorithmic" },
      { id: "targeted_ad_block", name: "Targeted Ad Block", group: "advertising" },
    ],
    platforms: ["YouTube", "TikTok", "Instagram", "Netflix", "Spotify"],
    mcpSnippet: `// Enforce EU DSA across all platforms
tool: trigger_child_enforcement
input: {
  child_id: "ch_emma_01",
  law: "EU_DSA",
  rules: ["algo_feed_control",
          "addictive_design_control",
          "targeted_ad_block"]
}

→ YouTube    non-profiled feed         ✓
→ TikTok     autoplay disabled         ✓
→ Instagram  no behavioral ads         ✓
→ Spotify    algorithmic recs off      ✓`,
  },
  {
    id: "ca-sb-976",
    name: "CA SB 976",
    fullName: "California Age-Appropriate Design Code",
    jurisdiction: "California, United States",
    stage: "Signed into law (Sep 2024)",
    stageColor: "enacted",
    summary:
      "Bans addictive feeds and notifications during school hours for minors. Platforms must default to chronological feeds.",
    categories: [
      { id: "algo_feed_control", name: "Algorithm Feed Control", group: "algorithmic" },
      { id: "addictive_design_control", name: "Addictive Design Control", group: "algorithmic" },
    ],
    platforms: ["Instagram", "TikTok", "YouTube", "Snapchat"],
    mcpSnippet: `// Enforce CA SB 976 — addictive patterns
tool: trigger_child_enforcement
input: {
  child_id: "ch_emma_01",
  law: "CA_SB_976",
  rules: ["algo_feed_control",
          "addictive_design_control"]
}

→ Instagram  chronological feed        ✓
→ TikTok     infinite scroll off       ✓
→ YouTube    autoplay disabled         ✓
→ Snapchat   streaks disabled          ✓`,
  },
  {
    id: "va-sb-854",
    name: "VA SB 854",
    fullName: "Virginia Child Safety Act",
    jurisdiction: "Virginia, United States",
    stage: "Signed into law (Apr 2024)",
    stageColor: "enacted",
    summary:
      "Requires platforms to suppress non-essential notifications during nighttime and provide configurable screen time limits.",
    categories: [
      { id: "notification_curfew", name: "Notification Curfew", group: "notifications" },
    ],
    platforms: ["Instagram", "TikTok", "YouTube", "Snapchat"],
    mcpSnippet: `// Enforce VA SB 854 — notification curfew
tool: trigger_child_enforcement
input: {
  child_id: "ch_emma_01",
  law: "VA_SB_854",
  rules: ["notification_curfew"]
}

→ Instagram  quiet 9pm–7am            ✓
→ TikTok     notifications paused      ✓
→ YouTube    alerts suppressed         ✓
→ Snapchat   no overnight pings        ✓`,
  },
  {
    id: "ny-safe",
    name: "NY SAFE for Kids",
    fullName: "New York SAFE for Kids Act",
    jurisdiction: "New York, United States",
    stage: "Signed into law (Jun 2024)",
    stageColor: "enacted",
    summary:
      "Prohibits addictive algorithmic feeds for minors without parental consent and mandates notification-free quiet hours.",
    categories: [
      { id: "notification_curfew", name: "Notification Curfew", group: "notifications" },
    ],
    platforms: ["Instagram", "TikTok", "YouTube", "Snapchat"],
    mcpSnippet: `// Enforce NY SAFE — quiet hours + feed control
tool: trigger_child_enforcement
input: {
  child_id: "ch_emma_01",
  law: "NY_SAFE",
  rules: ["notification_curfew"]
}

→ Instagram  overnight quiet hours     ✓
→ TikTok     push notifications off    ✓
→ YouTube    no nighttime alerts       ✓
→ Snapchat   notifications paused      ✓`,
  },
  {
    id: "uk-aadc",
    name: "UK AADC",
    fullName: "UK Age Appropriate Design Code",
    jurisdiction: "United Kingdom",
    stage: "Enacted (Oct 2023)",
    stageColor: "enacted",
    summary:
      "Duty of care requiring platforms to protect children from harmful content, restrict adult-child DMs, and implement age verification.",
    categories: [
      { id: "addictive_design_control", name: "Addictive Design Control", group: "algorithmic" },
      { id: "dm_restriction", name: "DM Restriction", group: "access_control" },
    ],
    platforms: ["Instagram", "TikTok", "Discord", "Snapchat"],
    mcpSnippet: `// Enforce UK AADC — DMs + design patterns
tool: trigger_child_enforcement
input: {
  child_id: "ch_emma_01",
  law: "UK_AADC",
  rules: ["addictive_design_control",
          "dm_restriction"]
}

→ Instagram  DMs contacts-only         ✓
→ TikTok     autoplay off              ✓
→ Discord    DMs from friends only     ✓
→ Snapchat   stranger DMs blocked      ✓`,
  },
  {
    id: "india-dpdpa",
    name: "India DPDPA",
    fullName: "Digital Personal Data Protection Act",
    jurisdiction: "India",
    stage: "Enacted (Aug 2023)",
    stageColor: "enacted",
    summary:
      "Complete ban on behavioral monitoring and targeted advertising directed at children. Verifiable parental consent required.",
    categories: [
      { id: "targeted_ad_block", name: "Targeted Ad Block", group: "advertising" },
    ],
    platforms: ["YouTube", "Instagram", "TikTok"],
    mcpSnippet: `// Enforce India DPDPA — ad blocking
tool: trigger_child_enforcement
input: {
  child_id: "ch_emma_01",
  law: "INDIA_DPDPA",
  rules: ["targeted_ad_block"]
}

→ YouTube    behavioral ads blocked    ✓
→ Instagram  ad profiling disabled     ✓
→ TikTok     targeted ads off          ✓`,
  },
  {
    id: "au-osa",
    name: "AU OSA",
    fullName: "Australia Online Safety Act",
    jurisdiction: "Australia",
    stage: "In force (age verification trial)",
    stageColor: "enacted",
    summary:
      "Establishes the eSafety Commissioner with powers to enforce age verification and removal of content harmful to children.",
    categories: [
      { id: "age_gate", name: "Age Gate", group: "access_control" },
    ],
    platforms: ["YouTube", "Instagram", "Roblox", "TikTok"],
    mcpSnippet: `// Enforce AU OSA — age verification
tool: trigger_child_enforcement
input: {
  child_id: "ch_emma_01",
  law: "AU_OSA",
  rules: ["age_gate"]
}

→ YouTube    age-verified account      ✓
→ Instagram  minor account flagged     ✓
→ Roblox     age gate enforced         ✓
→ TikTok     restricted mode on        ✓`,
  },
  {
    id: "kosma",
    name: "KOSMA",
    fullName: "Kids Online Safety & Media Act",
    jurisdiction: "United States (Federal)",
    stage: "Passed Senate (Jul 2024)",
    stageColor: "passed",
    summary:
      "Combined KOSA + COPPA 2.0 package extending protections to all minors under 17, with mandatory age verification.",
    categories: [
      { id: "algo_feed_control", name: "Algorithm Feed Control", group: "algorithmic" },
      { id: "age_gate", name: "Age Gate", group: "access_control" },
    ],
    platforms: ["YouTube", "Instagram", "TikTok", "Roblox"],
    mcpSnippet: `// Enforce KOSMA — full minor protections
tool: trigger_child_enforcement
input: {
  child_id: "ch_emma_01",
  law: "KOSMA",
  rules: ["algo_feed_control",
          "age_gate"]
}

→ YouTube    chronological + verified  ✓
→ Instagram  age gate + safe feed      ✓
→ TikTok     algo off + age check      ✓
→ Roblox     verified minor account    ✓`,
  },
  {
    id: "ftc-coppa",
    name: "FTC COPPA Rule",
    fullName: "Federal Trade Commission COPPA Rule",
    jurisdiction: "United States (Federal)",
    stage: "In force (updated 2024)",
    stageColor: "enacted",
    summary:
      "The original COPPA enforcement rule requiring verifiable parental consent for data collection on children under 13.",
    categories: [
      { id: "targeted_ad_block", name: "Targeted Ad Block", group: "advertising" },
      { id: "data_deletion_request", name: "Data Deletion Request", group: "privacy" },
    ],
    platforms: ["YouTube", "Roblox", "Instagram", "TikTok"],
    mcpSnippet: `// Enforce FTC COPPA Rule
tool: trigger_child_enforcement
input: {
  child_id: "ch_emma_01",
  law: "FTC_COPPA",
  rules: ["targeted_ad_block",
          "data_deletion_request"]
}

→ YouTube    COPPA-compliant mode      ✓
→ Roblox     under-13 protections      ✓
→ Instagram  data collection blocked   ✓
→ TikTok     ad tracking disabled      ✓`,
  },
]

export const GROUP_COLORS: Record<string, { bg: string; text: string }> = {
  algorithmic: { bg: "bg-purple-50", text: "text-purple-700" },
  notifications: { bg: "bg-rose-50", text: "text-rose-700" },
  advertising: { bg: "bg-green-50", text: "text-green-700" },
  access_control: { bg: "bg-orange-50", text: "text-orange-700" },
  content: { bg: "bg-blue-50", text: "text-blue-700" },
  privacy: { bg: "bg-teal-50", text: "text-teal-700" },
}
