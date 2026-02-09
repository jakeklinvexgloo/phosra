import type { LawEntry } from "./types"
import { generateMcpSnippet } from "./snippet-generator"

// Helper for auto-generated snippets on new laws
function autoSnippet(law: Omit<LawEntry, "mcpSnippet"> & { mcpSnippet?: string }): LawEntry {
  return {
    ...law,
    mcpSnippet: law.mcpSnippet || generateMcpSnippet(law as LawEntry),
  } as LawEntry
}

export const LAW_REGISTRY: LawEntry[] = [
  // ============================================================
  // === US FEDERAL ===
  // ============================================================
  {
    id: "kosa",
    shortName: "KOSA",
    fullName: "Kids Online Safety Act",
    jurisdiction: "United States (Federal)",
    jurisdictionGroup: "us-federal",
    country: "US",
    status: "passed",
    statusLabel: "Passed Senate (Jul 2024)",
    introduced: "2023 (S. 1409, 118th Congress)",
    summary:
      "Establishes a duty of care for platforms, requiring them to disable addictive features and algorithmic feeds for minors by default.",
    keyProvisions: [
      "Duty of care requiring platforms to prevent and mitigate harms to minors",
      "Strongest default privacy settings for minors must be enabled by default",
      "Minors must be able to opt out of algorithmic recommendations",
      "Platforms must disable addictive design features (autoplay, notifications, rewards) by default for minors",
      "FTC enforcement authority with civil penalties up to $50,000 per violation",
      "Annual independent audits of platform compliance required",
    ],
    ruleCategories: ["algo_feed_control", "addictive_design_control", "targeted_ad_block"],
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

\u2192 Netflix    feed disabled, no ads     \u2713
\u2192 YouTube    chronological feed        \u2713
\u2192 TikTok     autoplay off, no streaks  \u2713
\u2192 Instagram  likes hidden, no ads      \u2713`,
    ageThreshold: "All minors",
    penaltyRange: "Up to $50,000 per violation",
    detailedPage: {
      provisions: [
        {
          title: "Duty of Care",
          description:
            "Platforms must exercise reasonable care in designing and operating their services to prevent and mitigate harm to minors, including mental health harms, bullying, exploitation, and substance abuse promotion.",
        },
        {
          title: "Default Privacy for Minors",
          description:
            "All privacy settings for minor users must default to the most restrictive options available. Platforms cannot require minors to opt out of data collection or content personalization.",
        },
        {
          title: "Opt-Out of Algorithmic Recommendations",
          description:
            "Minors must be provided with a clear, accessible mechanism to opt out of personalized algorithmic recommendations. Chronological or non-personalized feeds must be available as the default experience.",
        },
        {
          title: "Disable Addictive Design Features",
          description:
            "Platforms must disable or limit features known to drive compulsive usage among minors, including infinite scroll, autoplay, push notification streaks, and variable-reward engagement patterns.",
        },
        {
          title: "FTC Enforcement Authority",
          description:
            "The Federal Trade Commission is granted authority to enforce KOSA provisions, investigate violations, and impose civil penalties. State attorneys general may also bring enforcement actions.",
        },
        {
          title: "Annual Independent Audits",
          description:
            "Covered platforms must conduct annual independent audits to assess compliance with duty-of-care obligations, report findings to the FTC, and make audit summaries publicly available.",
        },
      ],
      phosraFeatures: [
        {
          regulation: "Duty of care for minors",
          phosraFeature: "PCSS Policy Engine",
          ruleCategory: "addictive_design_control",
          description:
            "Phosra's 40-category rule system covers the full scope of KOSA's duty-of-care requirements, enforcing protective defaults across all connected platforms in a single API call.",
        },
        {
          regulation: "Default privacy settings",
          phosraFeature: "Age-Based Defaults",
          ruleCategory: "targeted_ad_block",
          description:
            "Phosra automatically maps child age groups to the most restrictive privacy defaults across each connected platform, ensuring compliance without manual configuration.",
        },
        {
          regulation: "Algorithmic feed opt-out",
          phosraFeature: "Algorithm Feed Control",
          ruleCategory: "algo_feed_control",
          description:
            "The algo_feed_control rule category disables personalized recommendations and switches feeds to chronological mode on YouTube, TikTok, Instagram, and other supported platforms.",
        },
        {
          regulation: "Disable addictive features",
          phosraFeature: "Addictive Design Control",
          ruleCategory: "addictive_design_control",
          description:
            "The addictive_design_control rule disables autoplay, infinite scroll, notification streaks, and other compulsive-use patterns across all connected platforms.",
        },
        {
          regulation: "FTC enforcement readiness",
          phosraFeature: "Enforcement Audit Trail",
          description:
            "Every enforcement action is logged with timestamps, platform responses, and rule snapshots, producing a complete audit trail for regulatory review and FTC compliance documentation.",
        },
        {
          regulation: "Annual compliance audits",
          phosraFeature: "Compliance Dashboard",
          description:
            "The Phosra dashboard provides real-time visibility into enforcement status across platforms, enabling platforms to demonstrate continuous compliance during audit cycles.",
        },
      ],
      checklist: [
        {
          requirement: "Duty of care implemented for all minor users",
          covered: true,
          feature: "PCSS Policy Engine with 40 rule categories",
        },
        {
          requirement: "Privacy settings default to most restrictive",
          covered: true,
          feature: "Age-based default rule mapping",
        },
        {
          requirement: "Algorithmic feed opt-out available",
          covered: true,
          feature: "algo_feed_control rule category",
        },
        {
          requirement: "Addictive design features disabled by default",
          covered: true,
          feature: "addictive_design_control rule category",
        },
        {
          requirement: "Targeted advertising blocked for minors",
          covered: true,
          feature: "targeted_ad_block rule category",
        },
        {
          requirement: "Parental tools for controlling child experience",
          covered: true,
          feature: "Dashboard + API parental controls",
        },
        {
          requirement: "Audit trail for enforcement actions",
          covered: true,
          feature: "Enforcement job logging with 1-year retention",
        },
        {
          requirement: "Age verification integration",
          covered: false,
          feature: "Platform-native age verification (not yet supported)",
        },
      ],
    },
    relatedLawIds: ["coppa-2", "eu-dsa", "kosma"],
    tags: ["duty-of-care", "algorithmic-feeds", "addictive-design", "targeted-ads", "ftc"],
  },
  {
    id: "coppa-2",
    shortName: "COPPA 2.0",
    fullName: "Children's Online Privacy Protection Act 2.0",
    jurisdiction: "United States (Federal)",
    jurisdictionGroup: "us-federal",
    country: "US",
    status: "passed",
    statusLabel: "Passed Senate as part of KOSMA (Jul 2024)",
    introduced: "2024 (S. 1418, 118th Congress)",
    summary:
      "Extends COPPA to teens under 17, bans all targeted advertising to minors, and creates an Eraser Button for data deletion.",
    keyProvisions: [
      "Extends COPPA from children under 13 to all minors under 17",
      "Complete ban on targeted advertising directed at minors",
      "Creates Eraser Button \u2014 minors and parents can request deletion of all personal data",
      "Prohibits conditioning service access on a minor providing more data than necessary",
      "Establishes Youth Privacy and Marketing Division within the FTC",
      "Increased penalties: up to $50,000 per violation (up from $46,517)",
    ],
    ruleCategories: ["targeted_ad_block", "data_deletion_request", "geolocation_opt_in"],
    platforms: ["YouTube", "Instagram", "TikTok", "Snapchat", "Roblox"],
    mcpSnippet: `// Enforce COPPA 2.0 \u2014 block ads + enable eraser
tool: trigger_child_enforcement
input: {
  child_id: "ch_emma_01",
  law: "COPPA_2",
  rules: ["targeted_ad_block",
          "data_deletion_request",
          "geolocation_opt_in"]
}

\u2192 YouTube    behavioral ads blocked    \u2713
\u2192 Instagram  ad targeting disabled     \u2713
\u2192 TikTok     geolocation off           \u2713
\u2192 Snapchat   data deletion enabled     \u2713`,
    ageThreshold: "Under 17",
    penaltyRange: "Up to $50,000 per violation",
    detailedPage: {
      provisions: [
        {
          title: "Extended Age Coverage to 17",
          description:
            "COPPA 2.0 extends the original COPPA protections from children under 13 to all minors under 17, significantly broadening the scope of covered users and the platforms subject to compliance obligations.",
        },
        {
          title: "Ban on Targeted Advertising to Minors",
          description:
            "All forms of behavioral and targeted advertising directed at users known to be under 17 are prohibited. Platforms may not use personal data collected from minors for advertising profiling or retargeting purposes.",
        },
        {
          title: "Eraser Button for Data Deletion",
          description:
            "Minors and their parents must be provided with a clear, accessible mechanism to request the deletion of all personal data collected by a platform. Platforms must honor deletion requests within a reasonable timeframe.",
        },
        {
          title: "Data Minimization Requirements",
          description:
            "Platforms must limit the collection of minors' personal data to what is strictly necessary for the service being provided. Excessive data collection, including behavioral tracking beyond core functionality, is prohibited.",
        },
        {
          title: "Dedicated FTC Enforcement Division",
          description:
            "A new division within the FTC is established specifically to enforce children's privacy protections, investigate violations, and coordinate with state attorneys general on enforcement actions.",
        },
        {
          title: "Increased Civil Penalties",
          description:
            "The maximum civil penalty per violation is substantially increased to create meaningful deterrence for large platforms. Penalties are assessed per affected child and can escalate for repeat offenders.",
        },
      ],
      phosraFeatures: [
        {
          regulation: "Extended protection to age 17",
          phosraFeature: "Age Group Mapping",
          description:
            "Phosra's age-to-rating mapping covers five rating systems (MPAA, TV, ESRB, PEGI, CSM) and applies appropriate restrictions for all minors from birth through 17 years of age.",
        },
        {
          regulation: "Ban on targeted advertising",
          phosraFeature: "Targeted Ad Block",
          ruleCategory: "targeted_ad_block",
          description:
            "The targeted_ad_block rule category disables behavioral advertising, ad profiling, and retargeting across all connected platforms in a single enforcement action.",
        },
        {
          regulation: "Eraser button / data deletion",
          phosraFeature: "Data Deletion Request",
          ruleCategory: "data_deletion_request",
          description:
            "The data_deletion_request rule triggers deletion workflows on connected platforms, and child profiles can be fully removed from Phosra within 7 days via dashboard or API.",
        },
        {
          regulation: "Data minimization",
          phosraFeature: "Minimal Child Profiles",
          description:
            "Phosra stores only first name, birth date, and age group for child profiles. No email, phone, photos, biometrics, or social identifiers are collected or transmitted to platforms.",
        },
        {
          regulation: "FTC enforcement readiness",
          phosraFeature: "Compliance Audit Trail",
          description:
            "Full enforcement logging with timestamped records of every policy push, platform response, and rule change provides documentary evidence for FTC review and audit.",
        },
        {
          regulation: "Geolocation data protection",
          phosraFeature: "Geolocation Opt-In",
          ruleCategory: "geolocation_opt_in",
          description:
            "The geolocation_opt_in rule ensures that location tracking is disabled by default on connected platforms, requiring explicit parental authorization before any location data is collected.",
        },
      ],
      checklist: [
        {
          requirement: "Protections extended to minors under 17",
          covered: true,
          feature: "Age group mapping across 5 rating systems",
        },
        {
          requirement: "Targeted advertising blocked for all minors",
          covered: true,
          feature: "targeted_ad_block rule category",
        },
        {
          requirement: "Data deletion mechanism available",
          covered: true,
          feature: "data_deletion_request + profile deletion API",
        },
        {
          requirement: "Data minimization in child profiles",
          covered: true,
          feature: "Minimal profile schema (name, DOB, age group only)",
        },
        {
          requirement: "Geolocation tracking disabled by default",
          covered: true,
          feature: "geolocation_opt_in rule category",
        },
        {
          requirement: "Verifiable parental consent flow",
          covered: true,
          feature: "Parent/guardian account ownership verification",
        },
        {
          requirement: "Audit trail for regulatory review",
          covered: true,
          feature: "Enforcement job logging with 1-year retention",
        },
        {
          requirement: "Real-time penalty risk monitoring",
          covered: false,
          feature: "Compliance risk scoring (planned)",
        },
      ],
    },
    relatedLawIds: ["kosa", "eu-dsa", "kosma", "ftc-coppa"],
    tags: ["privacy", "targeted-ads", "data-deletion", "eraser-button", "ftc", "under-17"],
  },
  {
    id: "kosma",
    shortName: "KOSMA",
    fullName: "Kids Online Safety & Media Act",
    jurisdiction: "United States (Federal)",
    jurisdictionGroup: "us-federal",
    country: "US",
    status: "passed",
    statusLabel: "Passed Senate (Jul 2024)",
    introduced: "2024 (S. 1409 + S. 1418, 118th Congress)",
    summary:
      "Combined KOSA + COPPA 2.0 package extending protections to all minors under 17, with mandatory age verification.",
    keyProvisions: [
      "Extends COPPA protections from under-13 to all minors under 17",
      "Requires platforms to obtain verifiable parental consent for data collection on minors",
      "Mandates age verification mechanisms on platforms likely to be used by children",
      "Prohibits targeted advertising to minors under 17",
      "Creates an Eraser Button \u2014 right for minors to delete personal data",
      "Establishes Kids Online Safety Council within the FTC",
    ],
    ruleCategories: ["algo_feed_control", "age_gate"],
    platforms: ["YouTube", "Instagram", "TikTok", "Roblox"],
    mcpSnippet: `// Enforce KOSMA \u2014 full minor protections
tool: trigger_child_enforcement
input: {
  child_id: "ch_emma_01",
  law: "KOSMA",
  rules: ["algo_feed_control",
          "age_gate"]
}

\u2192 YouTube    chronological + verified  \u2713
\u2192 Instagram  age gate + safe feed      \u2713
\u2192 TikTok     algo off + age check      \u2713
\u2192 Roblox     verified minor account    \u2713`,
    ageThreshold: "Under 17",
    penaltyRange: "Up to $50,000 per violation",
    relatedLawIds: ["kosa", "coppa-2", "ftc-coppa"],
    tags: ["combined-bill", "age-verification", "algorithmic-feeds", "parental-consent"],
  },
  {
    id: "ftc-coppa",
    shortName: "FTC COPPA Rule",
    fullName: "Federal Trade Commission COPPA Rule",
    jurisdiction: "United States (Federal)",
    jurisdictionGroup: "us-federal",
    country: "US",
    status: "enacted",
    statusLabel: "In force (updated 2024)",
    introduced: "1998 (16 CFR Part 312)",
    summary:
      "The original COPPA enforcement rule requiring verifiable parental consent for data collection on children under 13.",
    keyProvisions: [
      "Verifiable parental consent required before collecting personal information from children under 13",
      "Operators must post clear privacy policies describing data practices for children",
      "Parents have the right to review, delete, and refuse further collection of their child's data",
      "Operators must maintain confidentiality, security, and integrity of collected children's data",
      "FTC enforcement with civil penalties per violation",
    ],
    ruleCategories: ["targeted_ad_block", "data_deletion_request"],
    platforms: ["YouTube", "Roblox", "Instagram", "TikTok"],
    mcpSnippet: `// Enforce FTC COPPA Rule
tool: trigger_child_enforcement
input: {
  child_id: "ch_emma_01",
  law: "FTC_COPPA",
  rules: ["targeted_ad_block",
          "data_deletion_request"]
}

\u2192 YouTube    COPPA-compliant mode      \u2713
\u2192 Roblox     under-13 protections      \u2713
\u2192 Instagram  data collection blocked   \u2713
\u2192 TikTok     ad tracking disabled      \u2713`,
    ageThreshold: "Under 13",
    penaltyRange: "Up to $50,120 per violation",
    detailedPage: {
      provisions: [
        {
          title: "Verifiable Parental Consent (VPC)",
          description:
            "Operators must obtain verifiable parental consent before collecting, using, or disclosing personal information from children under 13. Acceptable methods include signed consent forms, credit card verification, government ID checks, and knowledge-based authentication.",
        },
        {
          title: "Clear Privacy Policy for Children",
          description:
            "Operators must post clear, comprehensive, and prominently linked privacy policies describing their data practices for children, including what information is collected, how it is used, and with whom it is shared.",
        },
        {
          title: "Parental Review and Deletion Rights",
          description:
            "Parents have the right to review all personal information collected from their child, request its deletion, and refuse further collection. Operators must honor these requests in a timely manner.",
        },
        {
          title: "Data Security Requirements",
          description:
            "Operators must maintain reasonable procedures to protect the confidentiality, security, and integrity of personal information collected from children, including encryption and access controls.",
        },
        {
          title: "Data Minimization",
          description:
            "Operators may not condition a child's participation in an activity on the child providing more personal information than is reasonably necessary for that activity.",
        },
        {
          title: "FTC Enforcement and Safe Harbor",
          description:
            "The FTC enforces COPPA with civil penalties per violation. Industry self-regulatory programs can apply for safe harbor status, providing guidelines that participating operators follow in lieu of direct FTC oversight.",
        },
      ],
      phosraFeatures: [
        {
          regulation: "Verifiable parental consent",
          phosraFeature: "Parent Account Ownership",
          description:
            "Phosra's parent/guardian account model ensures that all child profiles are created and managed by a verified adult, satisfying VPC requirements through account ownership verification.",
        },
        {
          regulation: "Privacy policy compliance",
          phosraFeature: "Minimal Data Collection",
          description:
            "Phosra collects only first name, birth date, and age group for child profiles — no email, phone, photos, or biometrics — making privacy disclosures simple and compliant.",
        },
        {
          regulation: "Parental review and deletion",
          phosraFeature: "Data Deletion Request",
          ruleCategory: "data_deletion_request",
          description:
            "The data_deletion_request rule category triggers deletion workflows on connected platforms. Parents can also fully delete child profiles from Phosra via the dashboard or API.",
        },
        {
          regulation: "Targeted ad protection",
          phosraFeature: "Targeted Ad Block",
          ruleCategory: "targeted_ad_block",
          description:
            "The targeted_ad_block rule disables all behavioral advertising and ad profiling for children under 13 across connected platforms, preventing COPPA-prohibited commercial data use.",
        },
        {
          regulation: "Data security",
          phosraFeature: "AES-256-GCM Encryption",
          description:
            "All sensitive data is encrypted at rest using AES-256-GCM. Platform credentials are encrypted with per-family keys, and all API communication uses TLS 1.3.",
        },
        {
          regulation: "Enforcement documentation",
          phosraFeature: "Compliance Audit Trail",
          description:
            "Every enforcement action is logged with timestamps, platform responses, and rule snapshots, providing documentary evidence for FTC safe harbor and compliance reviews.",
        },
      ],
      checklist: [
        {
          requirement: "Verifiable parental consent obtained",
          covered: true,
          feature: "Parent account ownership verification",
        },
        {
          requirement: "Clear privacy policy posted",
          covered: true,
          feature: "Minimal data collection with transparent disclosures",
        },
        {
          requirement: "Parental review and deletion rights",
          covered: true,
          feature: "data_deletion_request + dashboard profile management",
        },
        {
          requirement: "Targeted advertising blocked for under-13",
          covered: true,
          feature: "targeted_ad_block rule category",
        },
        {
          requirement: "Data security measures in place",
          covered: true,
          feature: "AES-256-GCM encryption, TLS 1.3, per-family keys",
        },
        {
          requirement: "Data minimization enforced",
          covered: true,
          feature: "Minimal child profile schema (name, DOB, age group only)",
        },
        {
          requirement: "Third-party data sharing restricted",
          covered: true,
          feature: "No child data shared with third parties",
        },
        {
          requirement: "Safe harbor program participation",
          covered: false,
          feature: "FTC safe harbor application (planned)",
        },
      ],
    },
    relatedLawIds: ["coppa-2", "kosma"],
    tags: ["privacy", "parental-consent", "data-collection", "under-13", "ftc"],
  },
  autoSnippet({
    id: "cipa",
    shortName: "CIPA",
    fullName: "Children's Internet Protection Act",
    jurisdiction: "United States (Federal)",
    jurisdictionGroup: "us-federal",
    country: "US",
    status: "enacted",
    statusLabel: "In force (enacted 2000)",
    introduced: "2000 (Pub. L. 106-554)",
    summary:
      "Requires schools and libraries receiving E-Rate funding to implement internet safety policies and content filters to protect children from harmful online content.",
    keyProvisions: [
      "Schools and libraries must adopt internet safety policies to receive E-Rate discounts",
      "Technology protection measures must block or filter access to obscene or harmful content",
      "Internet safety policies must address monitoring online activities of minors",
      "Policies must include provisions for educating minors about appropriate online behavior",
      "Schools must restrict minors' access to materials harmful to them",
    ],
    ruleCategories: ["web_category_block", "web_safesearch", "web_filter_level"],
    platforms: ["Schools", "Libraries"],
    ageThreshold: "All minors",
    relatedLawIds: ["ftc-coppa", "kosa"],
    tags: ["content-filtering", "schools", "libraries", "e-rate"],
  }),
  autoSnippet({
    id: "earn-it",
    shortName: "EARN IT Act",
    fullName: "Eliminating Abusive and Rampant Neglect of Interactive Technologies Act",
    jurisdiction: "United States (Federal)",
    jurisdictionGroup: "us-federal",
    country: "US",
    status: "proposed",
    statusLabel: "Proposed (reintroduced 2023)",
    introduced: "2023 (S. 1207, 118th Congress)",
    summary:
      "Proposes to hold platforms accountable for CSAM by modifying Section 230 protections and establishing best practices for preventing child exploitation.",
    keyProvisions: [
      "Establishes National Commission on Online Child Exploitation Prevention",
      "Platforms must follow best practices to detect and report CSAM",
      "Modifies Section 230 immunity for platforms failing to address CSAM",
      "State attorneys general empowered to bring civil actions for violations",
      "Requires platforms to preserve evidence related to child exploitation",
    ],
    ruleCategories: ["csam_reporting"],
    platforms: ["Instagram", "TikTok", "Snapchat", "Discord", "YouTube"],
    ageThreshold: "All minors",
    relatedLawIds: ["kosa", "ftc-coppa"],
    tags: ["csam", "section-230", "exploitation"],
  }),
  autoSnippet({
    id: "fosta-sesta",
    shortName: "FOSTA-SESTA",
    fullName: "Allow States and Victims to Fight Online Sex Trafficking Act",
    jurisdiction: "United States (Federal)",
    jurisdictionGroup: "us-federal",
    country: "US",
    status: "enacted",
    statusLabel: "Signed into law (Apr 2018)",
    introduced: "2018 (H.R. 1865, 115th Congress)",
    summary:
      "Amends Section 230 to hold platforms liable for facilitating sex trafficking. Requires platforms to actively monitor for and remove trafficking content involving minors.",
    keyProvisions: [
      "Amends Section 230 of the Communications Decency Act to exclude sex trafficking from platform immunity",
      "Platforms can be held civilly and criminally liable for knowingly facilitating sex trafficking",
      "State attorneys general empowered to bring criminal actions against platforms",
      "Victims of trafficking can sue platforms that knowingly benefited from trafficking activity",
      "Platforms must implement measures to detect and report trafficking content",
    ],
    ruleCategories: ["csam_reporting", "dm_restriction"],
    platforms: ["Instagram", "TikTok", "Snapchat", "Discord", "YouTube"],
    ageThreshold: "All minors",
    relatedLawIds: ["earn-it", "kosa", "uk-osa"],
    tags: ["sex-trafficking", "section-230", "platform-liability"],
  }),

  // ============================================================
  // === US STATE ===
  // ============================================================
  {
    id: "ca-sb-976",
    shortName: "CA SB 976",
    fullName: "California Age-Appropriate Design Code",
    jurisdiction: "California, United States",
    jurisdictionGroup: "us-state",
    country: "US",
    stateOrRegion: "California",
    status: "enacted",
    statusLabel: "Signed into law (Sep 2024)",
    introduced: "2024 (SB 976, California Legislature)",
    effectiveDate: "Jan 2027",
    summary:
      "Bans addictive feeds and notifications during school hours for minors. Platforms must default to chronological feeds.",
    keyProvisions: [
      "Prohibits platforms from providing addictive feeds to minors without parental consent",
      "Bans sending notifications to minors during school hours (7am-3pm) and overnight (9pm-6am)",
      "Requires platforms to default minors to chronological feeds instead of algorithmic recommendations",
      "Restricts autoplay, infinite scroll, and engagement-maximizing features for minor accounts",
      "California AG enforcement with penalties up to $2,500 per affected minor per violation",
    ],
    ruleCategories: ["algo_feed_control", "addictive_design_control"],
    platforms: ["Instagram", "TikTok", "YouTube", "Snapchat"],
    mcpSnippet: `// Enforce CA SB 976 \u2014 addictive patterns
tool: trigger_child_enforcement
input: {
  child_id: "ch_emma_01",
  law: "CA_SB_976",
  rules: ["algo_feed_control",
          "addictive_design_control"]
}

\u2192 Instagram  chronological feed        \u2713
\u2192 TikTok     infinite scroll off       \u2713
\u2192 YouTube    autoplay disabled         \u2713
\u2192 Snapchat   streaks disabled          \u2713`,
    ageThreshold: "Under 18",
    penaltyRange: "Up to $2,500 per affected minor per violation",
    detailedPage: {
      provisions: [
        {
          title: "Addictive Feed Prohibition",
          description:
            "Platforms are prohibited from providing addictive feeds to minors without verifiable parental consent. Algorithmic recommendation systems that maximize engagement must be disabled by default for users under 18.",
        },
        {
          title: "Notification Restrictions During School Hours",
          description:
            "Platforms must not send notifications to minors during school hours (7am–3pm on school days) and overnight (9pm–6am). Only essential account security notifications are exempt.",
        },
        {
          title: "Chronological Feed Default",
          description:
            "Platforms must default minor accounts to chronological or non-personalized feeds. Algorithmic feeds may only be enabled with explicit, verifiable parental consent.",
        },
        {
          title: "Addictive Design Feature Restrictions",
          description:
            "Autoplay, infinite scroll, engagement-maximizing notifications, and variable-reward mechanics must be restricted or disabled for minor accounts by default.",
        },
        {
          title: "California AG Enforcement",
          description:
            "The California Attorney General has exclusive enforcement authority. Violations carry penalties of up to $2,500 per affected minor per violation, creating significant liability for platforms with large California user bases.",
        },
      ],
      phosraFeatures: [
        {
          regulation: "Addictive feed prohibition",
          phosraFeature: "Algorithm Feed Control",
          ruleCategory: "algo_feed_control",
          description:
            "The algo_feed_control rule switches feeds to chronological mode on Instagram, TikTok, YouTube, and Snapchat, directly satisfying SB 976's requirement to disable addictive algorithmic feeds.",
        },
        {
          regulation: "Notification restrictions",
          phosraFeature: "Notification Curfew",
          ruleCategory: "notification_curfew",
          description:
            "The notification_curfew rule suppresses non-essential notifications during school hours and overnight, matching SB 976's specific time windows.",
        },
        {
          regulation: "Addictive design restrictions",
          phosraFeature: "Addictive Design Control",
          ruleCategory: "addictive_design_control",
          description:
            "The addictive_design_control rule disables autoplay, infinite scroll, streaks, and daily rewards across all connected platforms in a single policy push.",
        },
        {
          regulation: "Parental consent verification",
          phosraFeature: "Parent Account Model",
          description:
            "Phosra's parent-controlled account model provides verifiable parental consent for any feed or notification settings changes, satisfying SB 976's consent requirements.",
        },
        {
          regulation: "Cross-platform enforcement",
          phosraFeature: "Multi-Platform Policy Engine",
          description:
            "A single SB 976 compliance policy in Phosra enforces restrictions simultaneously across Instagram, TikTok, YouTube, and Snapchat — ensuring no platform is missed.",
        },
      ],
      checklist: [
        {
          requirement: "Algorithmic feeds disabled by default for minors",
          covered: true,
          feature: "algo_feed_control rule category",
        },
        {
          requirement: "Notifications suppressed during school hours",
          covered: true,
          feature: "notification_curfew configurable time windows",
        },
        {
          requirement: "Notifications suppressed overnight",
          covered: true,
          feature: "notification_curfew rule category",
        },
        {
          requirement: "Autoplay disabled for minors",
          covered: true,
          feature: "addictive_design_control (disable_autoplay)",
        },
        {
          requirement: "Infinite scroll disabled for minors",
          covered: true,
          feature: "addictive_design_control (disable_infinite_scroll)",
        },
        {
          requirement: "Parental consent for algorithmic feed opt-in",
          covered: true,
          feature: "Parent-controlled policy dashboard",
        },
        {
          requirement: "Compliance audit trail for AG review",
          covered: true,
          feature: "Enforcement job logging with timestamps",
        },
      ],
    },
    relatedLawIds: ["kosa", "ny-safe", "va-sb-854"],
    tags: ["addictive-design", "algorithmic-feeds", "school-hours", "notifications"],
  },
  {
    id: "va-sb-854",
    shortName: "VA SB 854",
    fullName: "Virginia Child Safety Act",
    jurisdiction: "Virginia, United States",
    jurisdictionGroup: "us-state",
    country: "US",
    stateOrRegion: "Virginia",
    status: "enacted",
    statusLabel: "Signed into law (Apr 2024)",
    introduced: "2024 (SB 854, Virginia General Assembly)",
    effectiveDate: "Jul 2025",
    summary:
      "Requires platforms to suppress non-essential notifications during nighttime and provide configurable screen time limits.",
    keyProvisions: [
      "Platforms must suppress non-essential notifications to minors during nighttime hours",
      "Requires platforms to implement configurable screen time limits for minor accounts",
      "Parents must be provided tools to set notification schedules",
      "Platforms must provide activity reports to parents on request",
      "Virginia AG enforcement with civil penalties",
    ],
    ruleCategories: ["notification_curfew"],
    platforms: ["Instagram", "TikTok", "YouTube", "Snapchat"],
    mcpSnippet: `// Enforce VA SB 854 \u2014 notification curfew
tool: trigger_child_enforcement
input: {
  child_id: "ch_emma_01",
  law: "VA_SB_854",
  rules: ["notification_curfew"]
}

\u2192 Instagram  quiet 9pm\u20137am            \u2713
\u2192 TikTok     notifications paused      \u2713
\u2192 YouTube    alerts suppressed         \u2713
\u2192 Snapchat   no overnight pings        \u2713`,
    ageThreshold: "All minors",
    relatedLawIds: ["ny-safe", "ca-sb-976", "ct-sb-3"],
    tags: ["notification-curfew", "screen-time", "parental-tools"],
  },
  {
    id: "ny-safe",
    shortName: "NY SAFE for Kids",
    fullName: "New York SAFE for Kids Act",
    jurisdiction: "New York, United States",
    jurisdictionGroup: "us-state",
    country: "US",
    stateOrRegion: "New York",
    status: "enacted",
    statusLabel: "Signed into law (Jun 2024)",
    introduced: "2024 (S. 7694 / A. 8148, New York Legislature)",
    effectiveDate: "2025",
    summary:
      "Prohibits addictive algorithmic feeds for minors without parental consent and mandates notification-free quiet hours.",
    keyProvisions: [
      "Prohibits addictive algorithmic feeds for minors without verifiable parental consent",
      "Mandates notification-free quiet hours for minor accounts (default overnight)",
      "Platforms must verify age of users before serving algorithmic content",
      "Restricts platforms from sending push notifications to minors during nighttime hours",
      "New York AG enforcement authority",
    ],
    ruleCategories: ["notification_curfew"],
    platforms: ["Instagram", "TikTok", "YouTube", "Snapchat"],
    mcpSnippet: `// Enforce NY SAFE \u2014 quiet hours + feed control
tool: trigger_child_enforcement
input: {
  child_id: "ch_emma_01",
  law: "NY_SAFE",
  rules: ["notification_curfew"]
}

\u2192 Instagram  overnight quiet hours     \u2713
\u2192 TikTok     push notifications off    \u2713
\u2192 YouTube    no nighttime alerts       \u2713
\u2192 Snapchat   notifications paused      \u2713`,
    ageThreshold: "All minors",
    relatedLawIds: ["va-sb-854", "ca-sb-976", "ny-nycdpa"],
    tags: ["notification-curfew", "algorithmic-feeds", "parental-consent"],
  },
  autoSnippet({
    id: "ct-sb-3",
    shortName: "CT SB 3",
    fullName: "Connecticut SB 3",
    jurisdiction: "Connecticut, United States",
    jurisdictionGroup: "us-state",
    country: "US",
    stateOrRegion: "Connecticut",
    status: "enacted",
    statusLabel: "Signed into law (Jun 2023)",
    introduced: "2023 (SB 3, Connecticut General Assembly)",
    effectiveDate: "Oct 2024",
    summary:
      "Connecticut law protecting minors from addictive platform features and restricting unsolicited contact. Requires platforms to default to safest settings for accounts identified as minors.",
    keyProvisions: [
      "Platforms must default to highest privacy and safety settings for minor accounts",
      "Prohibits sending unsolicited communications (DMs) from adults to unconnected minors",
      "Restricts addictive features: autoplay, infinite scroll, notifications designed to increase engagement",
      "Geolocation data collection from minors prohibited without explicit informed consent",
      "Platforms must provide parents with tools to supervise minor accounts",
      "Connecticut AG enforcement authority; penalties under CUTPA (unfair trade practices)",
    ],
    ruleCategories: ["addictive_design_control", "dm_restriction", "geolocation_opt_in"],
    platforms: ["Instagram", "TikTok", "Snapchat", "Discord", "YouTube"],
    ageThreshold: "All minors",
    relatedLawIds: ["va-sb-854", "ny-safe", "md-kids-code"],
    tags: ["addictive-design", "dm-restriction", "geolocation", "privacy-defaults"],
  }),
  autoSnippet({
    id: "fl-hb-3",
    shortName: "FL HB 3",
    fullName: "Florida Social Media Act",
    jurisdiction: "Florida, United States",
    jurisdictionGroup: "us-state",
    country: "US",
    stateOrRegion: "Florida",
    status: "injunction",
    statusLabel: "Signed into law (Mar 2024); enforcement paused (federal court injunction)",
    introduced: "2024 (HB 3, Florida Legislature)",
    summary:
      "Florida law requiring age verification for social media platforms and prohibiting minors under 14 from holding accounts. Minors 14-15 need parental consent.",
    keyProvisions: [
      "Prohibits social media accounts for children under 14",
      "Minors aged 14-15 require verifiable parental consent to create accounts",
      "Platforms must implement age verification using government-issued ID or equivalent",
      "Existing accounts for minors under 14 must be terminated within prescribed period",
      "Platforms must delete all personal information of terminated minor accounts",
      "Private right of action for parents; statutory damages of $10,000 per violation",
    ],
    ruleCategories: ["age_gate"],
    platforms: ["Instagram", "TikTok", "Snapchat", "YouTube", "Discord"],
    ageThreshold: "Under 14 (ban), 14-15 (parental consent)",
    penaltyRange: "Up to $10,000 per violation (private right of action)",
    relatedLawIds: ["ar-age-verify", "la-act-456", "oh-hb-33"],
    tags: ["age-verification", "minimum-age", "parental-consent", "social-media-ban"],
  }),
  autoSnippet({
    id: "mn-hf-2",
    shortName: "MN HF 2",
    fullName: "Minnesota Usage Awareness",
    jurisdiction: "Minnesota, United States",
    jurisdictionGroup: "us-state",
    country: "US",
    stateOrRegion: "Minnesota",
    status: "proposed",
    statusLabel: "Introduced; committee review",
    introduced: "2024 (HF 2, Minnesota Legislature)",
    summary:
      "Minnesota bill requiring platforms to implement usage awareness tools for minor users, including periodic screen time reminders and usage dashboards.",
    keyProvisions: [
      "Platforms must provide periodic usage time reminders at intervals no greater than 60 minutes",
      "Requires platforms to offer a usage dashboard visible to both the minor and their parent",
      "Platforms must allow parents to configure reminder intervals",
      "Usage data must be presented in age-appropriate format for the minor",
    ],
    ruleCategories: ["usage_timer_notification"],
    platforms: ["Instagram", "TikTok", "YouTube", "Snapchat"],
    ageThreshold: "All minors",
    relatedLawIds: ["tn-hb-1891", "va-sb-854"],
    tags: ["screen-time", "usage-awareness", "parental-tools"],
  }),
  autoSnippet({
    id: "tn-hb-1891",
    shortName: "TN HB 1891",
    fullName: "Tennessee Screen Time Act",
    jurisdiction: "Tennessee, United States",
    jurisdictionGroup: "us-state",
    country: "US",
    stateOrRegion: "Tennessee",
    status: "enacted",
    statusLabel: "Signed into law (May 2024)",
    introduced: "2024 (HB 1891, Tennessee General Assembly)",
    effectiveDate: "Jan 2025",
    summary:
      "Tennessee law requiring social media platforms to implement screen time awareness features for minor users, including configurable usage timer notifications.",
    keyProvisions: [
      "Platforms must notify minor users of cumulative usage time at regular intervals",
      "Default usage reminder interval of 30 minutes; configurable by parent or minor",
      "Platforms must provide parents with weekly screen time reports",
      "Parental consent required for minors under 13 to create accounts",
      "Tennessee AG enforcement with civil penalties up to $10,000 per violation",
    ],
    ruleCategories: ["usage_timer_notification"],
    platforms: ["Instagram", "TikTok", "YouTube", "Snapchat"],
    ageThreshold: "All minors",
    penaltyRange: "Up to $10,000 per violation",
    relatedLawIds: ["mn-hf-2", "va-sb-854"],
    tags: ["screen-time", "usage-timer", "parental-consent"],
  }),
  autoSnippet({
    id: "ny-nycdpa",
    shortName: "NY NYCDPA",
    fullName: "New York Child Data Protection Act",
    jurisdiction: "New York, United States",
    jurisdictionGroup: "us-state",
    country: "US",
    stateOrRegion: "New York",
    status: "proposed",
    statusLabel: "Introduced; committee review",
    introduced: "2024 (New York Legislature)",
    summary:
      "New York Child Data Protection Act focusing on commercial data collection from minors, with strong data minimization and deletion rights for child accounts.",
    keyProvisions: [
      "Platforms must provide a clear, accessible mechanism for parents to request deletion of a minor's data",
      "Data deletion requests must be honored within 30 days",
      "Prohibits selling or sharing personal data of minors for commercial purposes",
      "Data minimization requirement \u2014 platforms may only collect data necessary for the service",
      "New York AG enforcement authority with enhanced penalties for violations involving minors",
    ],
    ruleCategories: ["data_deletion_request"],
    platforms: ["Instagram", "TikTok", "YouTube", "Snapchat", "Roblox"],
    ageThreshold: "All minors",
    relatedLawIds: ["ny-safe", "coppa-2"],
    tags: ["data-deletion", "data-minimization", "privacy", "commercial-data"],
  }),
  autoSnippet({
    id: "md-kids-code",
    shortName: "MD Kids Code",
    fullName: "Maryland Kids Code",
    jurisdiction: "Maryland, United States",
    jurisdictionGroup: "us-state",
    country: "US",
    stateOrRegion: "Maryland",
    status: "enacted",
    statusLabel: "Signed into law (May 2024)",
    introduced: "2024 (Maryland Kids Code, Maryland General Assembly)",
    effectiveDate: "Oct 2025",
    summary:
      "Maryland Age-Appropriate Design Code requiring platforms to default to maximum privacy settings for minors, including geolocation disabled by default and data protection impact assessments.",
    keyProvisions: [
      "Geolocation and precise location services must be disabled by default for minors",
      "Platforms must complete a Data Protection Impact Assessment (DPIA) for features used by minors",
      "Highest privacy settings must be the default for accounts identified as belonging to minors",
      "Prohibits using geolocation data to serve targeted content or advertising to minors",
      "Platforms must provide clear, child-friendly explanations of how location data is used",
      "Maryland AG enforcement; penalties under Maryland Consumer Protection Act",
    ],
    ruleCategories: ["geolocation_opt_in"],
    platforms: ["Instagram", "TikTok", "Snapchat", "YouTube", "Discord"],
    ageThreshold: "All minors",
    relatedLawIds: ["ct-sb-3", "uk-aadc", "ca-sb-976"],
    tags: ["geolocation", "privacy-by-default", "dpia", "age-appropriate-design"],
  }),
  autoSnippet({
    id: "tx-scope",
    shortName: "TX SCOPE Act",
    fullName: "Texas Securing Children Online through Parental Empowerment Act",
    jurisdiction: "Texas, United States",
    jurisdictionGroup: "us-state",
    country: "US",
    stateOrRegion: "Texas",
    status: "injunction",
    statusLabel: "Enacted (2023); enforcement paused (injunction)",
    introduced: "2023 (HB 18, Texas Legislature)",
    summary:
      "Texas law requiring parental consent for minors to access social media, with age verification requirements and monitoring provisions for platforms serving minors.",
    keyProvisions: [
      "Platforms must obtain verifiable parental consent before allowing minors to create accounts",
      "Age verification required for all users on covered platforms",
      "Parents must be given tools to monitor their child's platform activity",
      "Platforms must implement content filtering for minor accounts",
      "Texas AG enforcement authority",
    ],
    ruleCategories: ["age_gate", "monitoring_activity", "web_filter_level"],
    platforms: ["Instagram", "TikTok", "Snapchat", "YouTube", "Discord"],
    ageThreshold: "Under 18",
    detailedPage: {
      provisions: [
        {
          title: "Verifiable Parental Consent",
          description:
            "Social media platforms must obtain verifiable parental consent before allowing any minor under 18 to create or maintain an account. Consent must be obtained through commercially reasonable methods.",
        },
        {
          title: "Age Verification Requirement",
          description:
            "Platforms must implement age verification mechanisms for all users. Methods may include government ID verification, database checks, or other commercially reasonable means.",
        },
        {
          title: "Parental Monitoring Tools",
          description:
            "Platforms must provide parents and guardians with tools to monitor their child's activity on the platform, including content viewed, contacts, and time spent.",
        },
        {
          title: "Content Filtering for Minors",
          description:
            "Platforms must implement content filtering systems that prevent minors from accessing content that is harmful, obscene, or otherwise inappropriate for their age group.",
        },
        {
          title: "Texas AG Enforcement",
          description:
            "The Texas Attorney General has exclusive enforcement authority. The law currently faces a federal court injunction on First Amendment grounds, with enforcement paused pending appeal.",
        },
      ],
      phosraFeatures: [
        {
          regulation: "Age verification",
          phosraFeature: "Age Gate",
          ruleCategory: "age_gate",
          description:
            "The age_gate rule enforces age verification on connected platforms, ensuring minor accounts are properly identified and subject to appropriate restrictions.",
        },
        {
          regulation: "Parental monitoring tools",
          phosraFeature: "Activity Monitoring",
          ruleCategory: "monitoring_activity",
          description:
            "The monitoring_activity rule enables platform-level activity tracking with reports visible to parents through the Phosra dashboard, satisfying SCOPE's monitoring requirements.",
        },
        {
          regulation: "Content filtering",
          phosraFeature: "Web Filter Level",
          ruleCategory: "web_filter_level",
          description:
            "The web_filter_level rule sets age-appropriate filtering strictness across connected platforms, preventing minors from encountering harmful content.",
        },
        {
          regulation: "Parental consent model",
          phosraFeature: "Parent Account Ownership",
          description:
            "Phosra's parent-managed account model ensures all child profiles are created by a verified parent, providing verifiable parental consent for platform access.",
        },
        {
          regulation: "Cross-platform enforcement",
          phosraFeature: "Multi-Platform Policy Engine",
          description:
            "A single SCOPE compliance policy enforces age verification, monitoring, and content filtering simultaneously across Instagram, TikTok, Snapchat, YouTube, and Discord.",
        },
      ],
      checklist: [
        {
          requirement: "Verifiable parental consent for minor accounts",
          covered: true,
          feature: "Parent account ownership verification",
        },
        {
          requirement: "Age verification implemented",
          covered: true,
          feature: "age_gate rule category",
        },
        {
          requirement: "Parental monitoring tools available",
          covered: true,
          feature: "monitoring_activity + dashboard reports",
        },
        {
          requirement: "Content filtering for minor accounts",
          covered: true,
          feature: "web_filter_level rule category",
        },
        {
          requirement: "Enforcement audit trail",
          covered: true,
          feature: "Enforcement job logging with timestamps",
        },
        {
          requirement: "Platform-specific compliance documentation",
          covered: false,
          feature: "Per-platform compliance reports (planned)",
        },
      ],
    },
    relatedLawIds: ["fl-hb-3", "ar-age-verify", "ut-smra"],
    tags: ["age-verification", "parental-consent", "monitoring"],
  }),
  autoSnippet({
    id: "ut-smra",
    shortName: "UT SMRA",
    fullName: "Utah Social Media Regulation Act",
    jurisdiction: "Utah, United States",
    jurisdictionGroup: "us-state",
    country: "US",
    stateOrRegion: "Utah",
    status: "enacted",
    statusLabel: "Passed (2023)",
    introduced: "2023 (SB 152, Utah Legislature)",
    summary:
      "Utah law imposing curfews on minor social media use, requiring age verification, and banning addictive design features targeting minors.",
    keyProvisions: [
      "Social media platforms must verify age of all Utah users",
      "Default curfew on minor accounts from 10:30 PM to 6:30 AM",
      "Parents given full access to child's social media account",
      "Bans addictive design features for minor accounts",
      "Platforms prohibited from collecting minor data without parental consent",
    ],
    ruleCategories: ["social_media_min_age", "time_scheduled_hours", "addictive_design_control"],
    platforms: ["Instagram", "TikTok", "Snapchat", "YouTube", "X"],
    ageThreshold: "All minors",
    relatedLawIds: ["tx-scope", "fl-hb-3", "ar-age-verify"],
    tags: ["social-media", "time-limits", "age-verification"],
  }),
  autoSnippet({
    id: "la-act-456",
    shortName: "LA Act 456",
    fullName: "Louisiana Act 456",
    jurisdiction: "Louisiana, United States",
    jurisdictionGroup: "us-state",
    country: "US",
    stateOrRegion: "Louisiana",
    status: "injunction",
    statusLabel: "Enacted (2024); enforcement paused (injunction)",
    introduced: "2024 (Act 456, Louisiana Legislature)",
    summary:
      "Louisiana law requiring age verification for social media platforms and restricting minor access without parental consent.",
    keyProvisions: [
      "Platforms must implement age verification for all Louisiana users",
      "Minors require verifiable parental consent to create or maintain accounts",
      "Platforms must provide parental notification when a minor creates an account",
      "Private right of action for parents of affected minors",
    ],
    ruleCategories: ["age_gate"],
    platforms: ["Instagram", "TikTok", "Snapchat", "YouTube", "X"],
    ageThreshold: "All minors",
    relatedLawIds: ["fl-hb-3", "ar-age-verify", "tx-scope"],
    tags: ["age-verification", "parental-consent"],
  }),
  autoSnippet({
    id: "oh-hb-33",
    shortName: "OH HB 33",
    fullName: "Ohio Social Media Parental Notification Act",
    jurisdiction: "Ohio, United States",
    jurisdictionGroup: "us-state",
    country: "US",
    stateOrRegion: "Ohio",
    status: "injunction",
    statusLabel: "Enacted (2024); enforcement paused (injunction)",
    introduced: "2024 (HB 33, Ohio Legislature)",
    summary:
      "Ohio law requiring platforms to obtain parental consent for users under 16, with restrictions on direct messaging to minor accounts.",
    keyProvisions: [
      "Platforms must obtain verifiable parental consent for users under 16",
      "Restricts direct messaging capabilities for minor accounts",
      "Platforms must provide parental notification upon minor account creation",
      "AG enforcement authority with civil penalties",
    ],
    ruleCategories: ["age_gate", "dm_restriction"],
    platforms: ["Instagram", "TikTok", "Snapchat", "Discord", "YouTube"],
    ageThreshold: "Under 16",
    relatedLawIds: ["fl-hb-3", "la-act-456", "ct-sb-3"],
    tags: ["parental-consent", "notifications"],
  }),
  autoSnippet({
    id: "vt-s69",
    shortName: "VT S69",
    fullName: "Vermont Age-Appropriate Design Code",
    jurisdiction: "Vermont, United States",
    jurisdictionGroup: "us-state",
    country: "US",
    stateOrRegion: "Vermont",
    status: "enacted",
    statusLabel: "Enacted (2024); effective Jan 2027",
    introduced: "2024 (S.69, Vermont Legislature)",
    effectiveDate: "Jan 2027",
    summary:
      "Vermont age-appropriate design code requiring platforms to disable addictive design features, ban targeted ads, and default geolocation to off for minors.",
    keyProvisions: [
      "Platforms must disable addictive design features for minor accounts by default",
      "Bans targeted advertising directed at minors",
      "Geolocation must be disabled by default for minor accounts",
      "Data protection impact assessments required for services likely used by minors",
      "Vermont AG enforcement authority",
    ],
    ruleCategories: ["addictive_design_control", "targeted_ad_block", "geolocation_opt_in"],
    platforms: ["Instagram", "TikTok", "Snapchat", "YouTube", "Discord"],
    ageThreshold: "Under 18",
    relatedLawIds: ["md-kids-code", "ca-sb-976", "uk-aadc"],
    tags: ["age-appropriate-design", "privacy-by-default"],
  }),
  autoSnippet({
    id: "ma-s2619",
    shortName: "MA S2619",
    fullName: "Massachusetts S2619",
    jurisdiction: "Massachusetts, United States",
    jurisdictionGroup: "us-state",
    country: "US",
    stateOrRegion: "Massachusetts",
    status: "passed",
    statusLabel: "Passed Senate (2025)",
    introduced: "2025 (S.2619, Massachusetts Legislature)",
    summary:
      "Massachusetts bill targeting dark patterns and addictive design in platforms used by minors, with bans on targeted advertising to children.",
    keyProvisions: [
      "Bans targeted advertising directed at minors",
      "Prohibits dark patterns designed to manipulate minors into providing data or engagement",
      "Requires data minimization for minor user data",
      "Platforms must disable addictive design features for minor accounts",
      "AG enforcement authority with civil penalties",
    ],
    ruleCategories: ["targeted_ad_block", "addictive_design_control"],
    platforms: ["Instagram", "TikTok", "Snapchat", "YouTube", "Discord"],
    ageThreshold: "All minors",
    relatedLawIds: ["ca-sb-976", "vt-s69", "ct-sb-3"],
    tags: ["data-minimization", "dark-patterns"],
  }),
  autoSnippet({
    id: "ar-age-verify",
    shortName: "AR Age Verify",
    fullName: "Arkansas Social Media Safety Act",
    jurisdiction: "Arkansas, United States",
    jurisdictionGroup: "us-state",
    country: "US",
    stateOrRegion: "Arkansas",
    status: "injunction",
    statusLabel: "Enacted (2023); enforcement paused (injunction)",
    introduced: "2023 (HB 1029, Arkansas Legislature)",
    summary:
      "Arkansas law requiring age verification for social media platforms and prohibiting minors under 18 from creating accounts without parental consent.",
    keyProvisions: [
      "Platforms must verify age of all users before allowing account creation",
      "Minors under 18 require verifiable parental consent for social media accounts",
      "Platforms must implement commercially reasonable age verification methods",
      "Private right of action for parents with statutory damages",
    ],
    ruleCategories: ["age_gate", "social_media_min_age"],
    platforms: ["Instagram", "TikTok", "Snapchat", "YouTube", "X"],
    ageThreshold: "Under 18",
    relatedLawIds: ["fl-hb-3", "la-act-456", "tx-scope"],
    tags: ["age-verification"],
  }),
  autoSnippet({
    id: "ca-social-media-addiction",
    shortName: "CA Addiction Act",
    fullName: "California Social Media Addiction Act",
    jurisdiction: "California, United States",
    jurisdictionGroup: "us-state",
    country: "US",
    stateOrRegion: "California",
    status: "enacted",
    statusLabel: "Enacted (Sep 2024)",
    introduced: "2024 (AB 3172, California Legislature)",
    summary:
      "California law restricting notification delivery to minors during school hours and banning addictive design features that target children.",
    keyProvisions: [
      "Prohibits platforms from sending notifications to minors during school hours",
      "Bans addictive design features targeting minors including autoplay and infinite scroll",
      "Platforms must provide parents with tools to manage notification settings",
      "California AG enforcement with civil penalties",
    ],
    ruleCategories: ["notification_curfew", "addictive_design_control"],
    platforms: ["Instagram", "TikTok", "Snapchat", "YouTube", "Discord"],
    ageThreshold: "Under 18",
    relatedLawIds: ["ca-sb-976", "ny-safe", "va-sb-854"],
    tags: ["notifications", "school-hours", "addiction"],
  }),

  // ============================================================
  // === EU ===
  // ============================================================
  {
    id: "eu-dsa",
    shortName: "EU DSA",
    fullName: "Digital Services Act",
    jurisdiction: "European Union (27 member states)",
    jurisdictionGroup: "eu",
    country: "EU",
    status: "enacted",
    statusLabel: "In force (Feb 2024)",
    introduced: "2022 (Regulation (EU) 2022/2065)",
    summary:
      "Comprehensive EU regulation banning targeted ads to minors and requiring risk assessments for algorithmic systems.",
    keyProvisions: [
      "Complete ban on targeted advertising based on profiling of minors",
      "Very large online platforms (VLOPs) must assess and mitigate systemic risks to minors",
      "Platforms must provide clear, age-appropriate terms of service for minors",
      "Recommender systems must offer at least one option not based on profiling",
      "Mandatory transparency reporting on content moderation and algorithmic systems",
      "Fines up to 6% of global annual turnover for non-compliance",
    ],
    ruleCategories: ["algo_feed_control", "addictive_design_control", "targeted_ad_block"],
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

\u2192 YouTube    non-profiled feed         \u2713
\u2192 TikTok     autoplay disabled         \u2713
\u2192 Instagram  no behavioral ads         \u2713
\u2192 Spotify    algorithmic recs off      \u2713`,
    ageThreshold: "Under 18",
    penaltyRange: "Up to 6% of global annual turnover",
    detailedPage: {
      provisions: [
        {
          title: "Ban on Ad Profiling of Minors",
          description:
            "Very large online platforms are prohibited from using personal data of minors for advertising profiling. This applies to all forms of behavioral, contextual-behavioral, and interest-based ad targeting directed at users known to be under 18.",
        },
        {
          title: "Systemic Risk Assessments",
          description:
            "Platforms must conduct regular risk assessments evaluating the impact of their algorithmic systems on minors, including risks to mental health, exploitation, and exposure to harmful content. Risk reports must be submitted to the relevant Digital Services Coordinator.",
        },
        {
          title: "Age-Appropriate Terms and Design",
          description:
            "Terms of service and privacy policies directed at minors must be written in clear, age-appropriate language. Interface design must account for the developmental needs of young users and avoid manipulative patterns.",
        },
        {
          title: "Recommender System Transparency",
          description:
            "Users, including minors, must be offered at least one recommender system option that is not based on personal data profiling. Platforms must clearly explain how their recommendation algorithms work and provide opt-out mechanisms.",
        },
        {
          title: "Transparency Reporting",
          description:
            "Very large platforms must publish transparency reports at least annually detailing content moderation decisions, algorithmic system audits, risk assessments, and the measures taken to protect minors on the platform.",
        },
        {
          title: "Fines up to 6% of Global Revenue",
          description:
            "Non-compliant platforms face fines of up to 6% of annual global turnover. The European Commission and national Digital Services Coordinators share enforcement authority, with escalating penalties for repeated violations.",
        },
      ],
      phosraFeatures: [
        {
          regulation: "Ban on ad profiling of minors",
          phosraFeature: "Targeted Ad Block",
          ruleCategory: "targeted_ad_block",
          description:
            "The targeted_ad_block rule disables all forms of behavioral advertising and ad profiling for minor users across EU-regulated platforms including YouTube, TikTok, Instagram, and Spotify.",
        },
        {
          regulation: "Algorithmic risk mitigation",
          phosraFeature: "Algorithm Feed Control",
          ruleCategory: "algo_feed_control",
          description:
            "The algo_feed_control rule switches feeds to non-profiled or chronological mode, directly addressing the DSA requirement to offer recommender options not based on personal data profiling.",
        },
        {
          regulation: "Addictive design prevention",
          phosraFeature: "Addictive Design Control",
          ruleCategory: "addictive_design_control",
          description:
            "The addictive_design_control rule disables autoplay, infinite scroll, and engagement-maximizing patterns, reducing the systemic risks identified in DSA risk assessments.",
        },
        {
          regulation: "Recommender system opt-out",
          phosraFeature: "Non-Profiled Feed Default",
          ruleCategory: "algo_feed_control",
          description:
            "Phosra enforces a non-profiled feed as the default experience for minors, satisfying the DSA requirement to offer at least one recommendation option not based on personal data.",
        },
        {
          regulation: "Transparency and audit readiness",
          phosraFeature: "Enforcement Audit Trail",
          description:
            "Detailed logs of every enforcement action, including rule configurations, platform responses, and timestamps, support platforms in producing DSA-mandated transparency reports.",
        },
        {
          regulation: "Cross-platform compliance at scale",
          phosraFeature: "Multi-Platform Enforcement",
          description:
            "Phosra's universal adapter architecture enables simultaneous DSA compliance across all connected EU-regulated platforms from a single policy definition, reducing implementation cost and risk.",
        },
      ],
      checklist: [
        {
          requirement: "Ad profiling banned for minors under 18",
          covered: true,
          feature: "targeted_ad_block rule category",
        },
        {
          requirement: "Non-profiled recommender option available",
          covered: true,
          feature: "algo_feed_control enforces chronological feeds",
        },
        {
          requirement: "Addictive design patterns mitigated",
          covered: true,
          feature: "addictive_design_control rule category",
        },
        {
          requirement: "Systemic risk assessment documentation",
          covered: true,
          feature: "Enforcement audit trail and compliance dashboard",
        },
        {
          requirement: "Cross-platform enforcement in EU markets",
          covered: true,
          feature: "Platform adapters for YouTube, TikTok, Instagram, Spotify",
        },
        {
          requirement: "GDPR-compliant data processing",
          covered: true,
          feature: "AES-256-GCM encryption, SCCs, data minimization",
        },
        {
          requirement: "Age-appropriate interface design",
          covered: false,
          feature: "Platform-side responsibility (outside Phosra scope)",
        },
        {
          requirement: "Annual transparency report generation",
          covered: false,
          feature: "Automated report generation (planned)",
        },
      ],
    },
    relatedLawIds: ["kosa", "coppa-2", "gdpr-art-8", "uk-osa"],
    tags: ["targeted-ads", "algorithmic-feeds", "risk-assessment", "transparency", "vlop"],
  },
  autoSnippet({
    id: "gdpr-art-8",
    shortName: "GDPR Art. 8",
    fullName: "GDPR Article 8 Child Consent",
    jurisdiction: "European Union (27 member states)",
    jurisdictionGroup: "eu",
    country: "EU",
    status: "enacted",
    statusLabel: "In force (enacted May 2018)",
    introduced: "2016 (Regulation (EU) 2016/679)",
    effectiveDate: "May 2018",
    summary:
      "GDPR Article 8 establishes conditions for child consent to data processing, requiring parental consent for children under 16 (or 13, depending on member state).",
    keyProvisions: [
      "Parental consent required for data processing of children under 16 (member states may lower to 13)",
      "Controllers must make reasonable efforts to verify parental consent",
      "Children's data subject to full GDPR protections including right to erasure",
      "Data protection by design and by default required for services directed at children",
      "Data Protection Impact Assessments required for high-risk processing of children's data",
    ],
    ruleCategories: ["targeted_ad_block", "data_deletion_request", "privacy_data_sharing"],
    platforms: ["YouTube", "Instagram", "TikTok", "Snapchat", "Roblox", "Discord"],
    ageThreshold: "Under 16 (can be 13 by member state)",
    penaltyRange: "Up to \u20ac20M or 4% of global turnover",
    detailedPage: {
      provisions: [
        {
          title: "Parental Consent for Children's Data",
          description:
            "Data processing relating to children under 16 (or 13 where member states have set a lower age) requires verifiable parental or guardian consent. Consent must be freely given, specific, informed, and unambiguous.",
        },
        {
          title: "Verification of Parental Consent",
          description:
            "Data controllers must make reasonable efforts to verify that consent is given or authorised by the holder of parental responsibility, taking into account available technology.",
        },
        {
          title: "Right to Erasure for Children",
          description:
            "Children's data is subject to the full GDPR right to erasure (Article 17). Data collected during childhood can be deleted at any time, and controllers must act on erasure requests without undue delay.",
        },
        {
          title: "Data Protection by Design and Default",
          description:
            "Services directed at or likely used by children must implement data protection by design and by default, minimizing data collection and ensuring the highest privacy settings are applied automatically.",
        },
        {
          title: "Data Protection Impact Assessments",
          description:
            "High-risk processing of children's data requires a Data Protection Impact Assessment (DPIA) before processing begins, evaluating risks and identifying mitigation measures.",
        },
        {
          title: "Supervisory Authority Enforcement",
          description:
            "National Data Protection Authorities enforce GDPR with fines up to \u20ac20 million or 4% of global annual turnover, whichever is higher. Children's data violations are treated with heightened seriousness.",
        },
      ],
      phosraFeatures: [
        {
          regulation: "Parental consent requirement",
          phosraFeature: "Parent Account Ownership",
          description:
            "Phosra's parent-managed account model ensures all child profiles are created and controlled by a verified adult, satisfying Article 8's consent requirements through account ownership.",
        },
        {
          regulation: "Right to erasure",
          phosraFeature: "Data Deletion Request",
          ruleCategory: "data_deletion_request",
          description:
            "The data_deletion_request rule triggers deletion workflows on connected platforms. Child profiles can be fully removed from Phosra within 7 days via the dashboard or API.",
        },
        {
          regulation: "Targeted ad ban for minors",
          phosraFeature: "Targeted Ad Block",
          ruleCategory: "targeted_ad_block",
          description:
            "The targeted_ad_block rule disables all behavioral advertising and ad profiling for minor users, ensuring GDPR-compliant data processing across connected platforms.",
        },
        {
          regulation: "Data protection by default",
          phosraFeature: "Privacy Data Sharing Controls",
          ruleCategory: "privacy_data_sharing",
          description:
            "The privacy_data_sharing rule blocks third-party data sharing and analytics by default for child accounts, implementing data protection by default.",
        },
        {
          regulation: "Data minimization",
          phosraFeature: "Minimal Child Profiles",
          description:
            "Phosra stores only first name, birth date, and age group. No email, phone, photos, or biometrics are collected, ensuring GDPR data minimization principles are upheld.",
        },
        {
          regulation: "Security measures",
          phosraFeature: "AES-256-GCM Encryption",
          description:
            "All sensitive data is encrypted at rest with AES-256-GCM. Platform credentials use per-family keys, and all transfers use TLS 1.3, satisfying GDPR Article 32 security requirements.",
        },
      ],
      checklist: [
        {
          requirement: "Verifiable parental consent obtained",
          covered: true,
          feature: "Parent account ownership verification",
        },
        {
          requirement: "Right to erasure implemented",
          covered: true,
          feature: "data_deletion_request + profile deletion API",
        },
        {
          requirement: "Targeted advertising blocked",
          covered: true,
          feature: "targeted_ad_block rule category",
        },
        {
          requirement: "Data protection by default",
          covered: true,
          feature: "privacy_data_sharing defaults to blocked",
        },
        {
          requirement: "Data minimization enforced",
          covered: true,
          feature: "Minimal child profile schema",
        },
        {
          requirement: "Encryption at rest and in transit",
          covered: true,
          feature: "AES-256-GCM + TLS 1.3",
        },
        {
          requirement: "Cross-border transfer safeguards",
          covered: true,
          feature: "Standard Contractual Clauses (SCCs) supported",
        },
        {
          requirement: "DPIA documentation",
          covered: false,
          feature: "Automated DPIA generation (planned)",
        },
      ],
    },
    relatedLawIds: ["eu-dsa", "uk-aadc", "coppa-2"],
    tags: ["consent", "data-protection", "privacy"],
  }),
  autoSnippet({
    id: "eu-ai-act",
    shortName: "EU AI Act",
    fullName: "EU AI Act Minor Provisions",
    jurisdiction: "European Union (27 member states)",
    jurisdictionGroup: "eu",
    country: "EU",
    status: "enacted",
    statusLabel: "Enacted (Dec 2023); phased enforcement",
    introduced: "2023 (Regulation (EU) 2024/1689)",
    summary:
      "The EU AI Act includes specific provisions protecting minors from AI systems that exploit vulnerabilities, manipulate behavior, or use subliminal techniques harmful to children.",
    keyProvisions: [
      "Prohibits AI systems that exploit vulnerabilities of children due to age or social situation",
      "Bans AI that uses subliminal techniques to materially distort children's behavior",
      "AI systems in education classified as high-risk requiring conformity assessments",
      "Transparency requirements for AI systems interacting with minors",
      "Penalties up to \u20ac30M or 6% of global turnover for prohibited AI practices",
    ],
    ruleCategories: ["ai_minor_interaction", "addictive_design_control"],
    platforms: ["YouTube", "TikTok", "Instagram", "Roblox", "Discord"],
    ageThreshold: "All minors",
    penaltyRange: "Up to \u20ac30M or 6% of global turnover",
    detailedPage: {
      provisions: [
        {
          title: "Prohibition on Exploiting Children's Vulnerabilities",
          description:
            "AI systems that exploit the vulnerabilities of children due to their age, disability, or social or economic situation are classified as prohibited practices. Such systems may not be placed on the market or used within the EU.",
        },
        {
          title: "Ban on Subliminal Manipulation of Minors",
          description:
            "AI systems that deploy subliminal techniques beyond a person's consciousness to materially distort a child's behavior in a manner likely to cause physical or psychological harm are prohibited.",
        },
        {
          title: "High-Risk Classification for Education AI",
          description:
            "AI systems used in educational contexts for children are classified as high-risk, requiring conformity assessments, quality management systems, and ongoing monitoring before deployment.",
        },
        {
          title: "Transparency for AI Interacting with Minors",
          description:
            "AI systems that interact with children must be transparent about their AI nature. Chatbots, recommendation engines, and content generation systems must clearly disclose they are AI-powered.",
        },
        {
          title: "Severe Penalties for Prohibited Practices",
          description:
            "Violations involving prohibited AI practices (including exploitation of children) carry fines up to \u20ac35 million or 7% of global annual turnover for the most serious offenses.",
        },
      ],
      phosraFeatures: [
        {
          regulation: "Preventing AI exploitation of minors",
          phosraFeature: "AI Minor Interaction Control",
          ruleCategory: "ai_minor_interaction",
          description:
            "The ai_minor_interaction rule restricts AI-powered features that could exploit children's vulnerabilities, including manipulative recommendation algorithms and persuasive design patterns.",
        },
        {
          regulation: "Blocking subliminal manipulation",
          phosraFeature: "Addictive Design Control",
          ruleCategory: "addictive_design_control",
          description:
            "The addictive_design_control rule disables engagement-maximizing features like infinite scroll, autoplay, and variable rewards that use AI-driven techniques to manipulate behavior.",
        },
        {
          regulation: "Algorithmic feed control",
          phosraFeature: "Algorithm Feed Control",
          ruleCategory: "algo_feed_control",
          description:
            "The algo_feed_control rule switches AI-powered recommendation feeds to chronological mode, preventing AI systems from profiling and targeting children with engagement-optimized content.",
        },
        {
          regulation: "Cross-platform AI restriction",
          phosraFeature: "Multi-Platform Policy Engine",
          description:
            "A single EU AI Act compliance policy in Phosra disables AI-driven manipulation features simultaneously across YouTube, TikTok, Instagram, Roblox, and Discord.",
        },
        {
          regulation: "Audit and transparency",
          phosraFeature: "Enforcement Audit Trail",
          description:
            "Complete enforcement logging documents which AI-powered features were restricted for each child, supporting conformity assessments and regulatory transparency requirements.",
        },
      ],
      checklist: [
        {
          requirement: "AI exploitation of children prevented",
          covered: true,
          feature: "ai_minor_interaction rule category",
        },
        {
          requirement: "Subliminal manipulation techniques blocked",
          covered: true,
          feature: "addictive_design_control disables manipulative patterns",
        },
        {
          requirement: "AI-powered feeds restricted for minors",
          covered: true,
          feature: "algo_feed_control enforces chronological mode",
        },
        {
          requirement: "Enforcement actions documented",
          covered: true,
          feature: "Enforcement audit trail with timestamps",
        },
        {
          requirement: "Cross-platform AI restrictions enforced",
          covered: true,
          feature: "Multi-platform policy engine",
        },
        {
          requirement: "Educational AI conformity assessment",
          covered: false,
          feature: "Education AI assessment support (platform-side responsibility)",
        },
      ],
    },
    relatedLawIds: ["eu-dsa", "gdpr-art-8"],
    tags: ["ai", "cognitive-manipulation", "deepfakes", "education"],
  }),
  autoSnippet({
    id: "fr-sren",
    shortName: "FR SREN",
    fullName: "France SREN + Image Rights Law",
    jurisdiction: "France",
    jurisdictionGroup: "eu",
    country: "FR",
    status: "enacted",
    statusLabel: "Enacted (2024)",
    introduced: "2024 (SREN Law, French Parliament)",
    summary:
      "French law requiring age verification for accessing certain online content and establishing image rights protections for minors, including provisions against sharenting.",
    keyProvisions: [
      "Mandatory age verification for platforms hosting adult or harmful content",
      "Establishes image rights for minors protecting against unauthorized sharing by parents",
      "Platforms must implement technical measures to prevent minor access to restricted content",
      "Parents can be sanctioned for excessive sharing of children's images online",
      "CNIL enforcement authority for data protection aspects",
    ],
    ruleCategories: ["age_gate", "image_rights_minor"],
    platforms: ["Instagram", "TikTok", "YouTube", "Snapchat", "Facebook"],
    ageThreshold: "All minors",
    detailedPage: {
      provisions: [
        {
          title: "Mandatory Age Verification",
          description:
            "Platforms hosting adult or harmful content must implement robust age verification mechanisms. ARCOM (now part of Coimisiún na Meán equivalent) oversees compliance with age verification requirements.",
        },
        {
          title: "Image Rights for Minors",
          description:
            "The law establishes a right to image for minors, protecting them from unauthorized sharing of their photographs and videos. This applies to both third parties and parents engaging in excessive sharing (sharenting).",
        },
        {
          title: "Anti-Sharenting Provisions",
          description:
            "Parents can be sanctioned for excessive sharing of their children's images online. In cases of dispute, a family judge can prohibit further publication of a child's image.",
        },
        {
          title: "Platform Technical Obligations",
          description:
            "Platforms must implement technical measures to prevent minors from accessing restricted content. This includes both age-gating and content filtering technologies.",
        },
        {
          title: "CNIL and ARCOM Enforcement",
          description:
            "The CNIL (data protection) and ARCOM (content regulation) share enforcement authority. Non-compliant platforms face significant administrative fines.",
        },
      ],
      phosraFeatures: [
        {
          regulation: "Age verification",
          phosraFeature: "Age Gate",
          ruleCategory: "age_gate",
          description:
            "The age_gate rule enforces age verification on connected platforms, preventing minors from accessing age-restricted content as required by the SREN law.",
        },
        {
          regulation: "Image rights protection",
          phosraFeature: "Image Rights Minor",
          ruleCategory: "image_rights_minor",
          description:
            "The image_rights_minor rule restricts image-sharing capabilities for minor accounts, supporting compliance with France's image rights protections.",
        },
        {
          regulation: "Content filtering",
          phosraFeature: "Web Filter Level",
          ruleCategory: "web_filter_level",
          description:
            "The web_filter_level rule sets age-appropriate filtering on connected platforms, preventing minor access to restricted content categories.",
        },
        {
          regulation: "Privacy protections",
          phosraFeature: "Privacy Data Sharing",
          ruleCategory: "privacy_data_sharing",
          description:
            "The privacy_data_sharing rule blocks third-party data sharing for child accounts, ensuring compliance with the SREN's data protection requirements enforced by the CNIL.",
        },
        {
          regulation: "Cross-platform enforcement",
          phosraFeature: "Multi-Platform Policy Engine",
          description:
            "A single SREN compliance policy enforces age verification and image rights simultaneously across Instagram, TikTok, YouTube, Snapchat, and Facebook.",
        },
      ],
      checklist: [
        {
          requirement: "Age verification implemented",
          covered: true,
          feature: "age_gate rule category",
        },
        {
          requirement: "Image rights protections for minors",
          covered: true,
          feature: "image_rights_minor rule category",
        },
        {
          requirement: "Content filtering for restricted content",
          covered: true,
          feature: "web_filter_level + web_category_block",
        },
        {
          requirement: "Data protection compliance (CNIL)",
          covered: true,
          feature: "privacy_data_sharing + data minimization",
        },
        {
          requirement: "Cross-platform enforcement",
          covered: true,
          feature: "Multi-platform policy engine",
        },
        {
          requirement: "Sharenting monitoring tools",
          covered: false,
          feature: "Parental posting monitoring (planned)",
        },
      ],
    },
    relatedLawIds: ["eu-dsa", "gdpr-art-8", "de-jmstv"],
    tags: ["age-verification", "image-rights", "sharenting"],
  }),

  // ============================================================
  // === UK ===
  // ============================================================
  {
    id: "uk-aadc",
    shortName: "UK AADC",
    fullName: "UK Age Appropriate Design Code",
    jurisdiction: "United Kingdom",
    jurisdictionGroup: "uk",
    country: "GB",
    status: "enacted",
    statusLabel: "Enacted (Sep 2021)",
    introduced: "2021 (UK Information Commissioner's Office)",
    summary:
      "Duty of care requiring platforms to protect children from harmful content, restrict adult-child DMs, and implement age verification.",
    keyProvisions: [
      "15 standards of age-appropriate design that online services must conform to",
      "Best interests of the child must be a primary consideration in design",
      "High privacy settings must be the default for child users",
      "Data collection and sharing must be minimized for children",
      "Profiling of children is switched off by default",
      "ICO enforcement with GDPR-level penalties",
    ],
    ruleCategories: ["addictive_design_control", "dm_restriction"],
    platforms: ["Instagram", "TikTok", "Discord", "Snapchat"],
    mcpSnippet: `// Enforce UK AADC \u2014 DMs + design patterns
tool: trigger_child_enforcement
input: {
  child_id: "ch_emma_01",
  law: "UK_AADC",
  rules: ["addictive_design_control",
          "dm_restriction"]
}

\u2192 Instagram  DMs contacts-only         \u2713
\u2192 TikTok     autoplay off              \u2713
\u2192 Discord    DMs from friends only     \u2713
\u2192 Snapchat   stranger DMs blocked      \u2713`,
    ageThreshold: "Under 18",
    penaltyRange: "Up to \u00a317.5M or 4% of global turnover",
    relatedLawIds: ["uk-osa", "gdpr-art-8", "ca-sb-976"],
    tags: ["age-appropriate-design", "privacy-by-default", "dm-restriction", "ico"],
  },
  autoSnippet({
    id: "uk-osa",
    shortName: "UK OSA",
    fullName: "UK Online Safety Act 2023",
    jurisdiction: "United Kingdom",
    jurisdictionGroup: "uk",
    country: "GB",
    status: "enacted",
    statusLabel: "Enacted (Oct 2023); Ofcom codes in phased rollout",
    introduced: "2023 (UK Parliament)",
    summary:
      "UK law imposing a duty of care on platforms to protect children from harmful content online. Requires age verification and proactive measures to prevent children encountering harmful material.",
    keyProvisions: [
      "Duty of care requiring platforms to protect children from harmful content",
      "Mandatory age verification or age estimation for platforms likely accessed by children",
      "Platforms must prevent children from encountering priority harmful content (self-harm, eating disorders, pornography)",
      "Restrictions on direct messaging between adults and children they don't know",
      "Ofcom as regulator with power to fine up to 10% of global revenue or \u00a318 million",
      "Criminal liability for senior managers who fail to comply with information requests",
    ],
    ruleCategories: ["addictive_design_control", "dm_restriction", "age_gate", "csam_reporting"],
    platforms: ["Instagram", "TikTok", "Discord", "Snapchat", "YouTube", "Roblox"],
    ageThreshold: "All minors",
    penaltyRange: "Up to 10% of global revenue or \u00a318M",
    detailedPage: {
      provisions: [
        {
          title: "Duty of Care for Children",
          description:
            "Platforms have a statutory duty of care to protect children from harmful content. This includes proactive measures to prevent children from encountering content relating to self-harm, eating disorders, pornography, and violence.",
        },
        {
          title: "Mandatory Age Verification",
          description:
            "Platforms likely to be accessed by children must implement age verification or age estimation technology. Services must use highly effective age assurance measures to prevent children from accessing age-restricted content.",
        },
        {
          title: "Priority Harmful Content Categories",
          description:
            "The Act defines priority categories of content harmful to children, including suicide/self-harm promotion, eating disorder content, pornography, and content promoting violence. Platforms must actively prevent children from encountering such content.",
        },
        {
          title: "Adult-Child DM Restrictions",
          description:
            "Platforms must implement measures to prevent adults from sending direct messages to children they do not know. This includes restricting contact discovery and limiting messaging to existing connections.",
        },
        {
          title: "CSAM Detection and Reporting",
          description:
            "Platforms must implement systems to detect and report child sexual abuse material (CSAM). This includes proactive scanning obligations and mandatory reporting to the National Crime Agency.",
        },
        {
          title: "Ofcom Regulatory Powers",
          description:
            "Ofcom serves as the regulator with power to fine up to 10% of global revenue or \u00a318 million (whichever is greater). Senior managers face criminal liability for failing to comply with information requests.",
        },
      ],
      phosraFeatures: [
        {
          regulation: "Duty of care for children",
          phosraFeature: "PCSS Policy Engine",
          ruleCategory: "addictive_design_control",
          description:
            "Phosra's comprehensive policy engine covers the full scope of the OSA's duty of care, enforcing protective defaults across all connected platforms in a single API call.",
        },
        {
          regulation: "Age verification",
          phosraFeature: "Age Gate",
          ruleCategory: "age_gate",
          description:
            "The age_gate rule enforces age verification requirements on connected platforms, ensuring minor accounts are properly identified and protected.",
        },
        {
          regulation: "DM restrictions",
          phosraFeature: "DM Restriction",
          ruleCategory: "dm_restriction",
          description:
            "The dm_restriction rule limits direct messaging to contacts-only or disables DMs entirely, preventing unsolicited adult-to-child contact on Instagram, TikTok, Discord, and Snapchat.",
        },
        {
          regulation: "CSAM reporting compliance",
          phosraFeature: "CSAM Reporting",
          ruleCategory: "csam_reporting",
          description:
            "The csam_reporting rule ensures platforms have detection and reporting mechanisms enabled, supporting compliance with the OSA's mandatory CSAM reporting obligations.",
        },
        {
          regulation: "Addictive design mitigation",
          phosraFeature: "Addictive Design Control",
          ruleCategory: "addictive_design_control",
          description:
            "The addictive_design_control rule disables autoplay, infinite scroll, and engagement-maximizing features, reducing exposure to harmful content amplification.",
        },
        {
          regulation: "Regulatory audit readiness",
          phosraFeature: "Enforcement Audit Trail",
          description:
            "Complete enforcement logging with timestamped records provides documentary evidence for Ofcom regulatory reviews and compliance demonstrations.",
        },
      ],
      checklist: [
        {
          requirement: "Duty of care measures implemented",
          covered: true,
          feature: "PCSS Policy Engine with 40 rule categories",
        },
        {
          requirement: "Age verification enforced",
          covered: true,
          feature: "age_gate rule category",
        },
        {
          requirement: "Adult-child DM restrictions in place",
          covered: true,
          feature: "dm_restriction rule category",
        },
        {
          requirement: "CSAM detection and reporting enabled",
          covered: true,
          feature: "csam_reporting rule category",
        },
        {
          requirement: "Addictive design features disabled",
          covered: true,
          feature: "addictive_design_control rule category",
        },
        {
          requirement: "Cross-platform enforcement active",
          covered: true,
          feature: "Platform adapters for 6+ regulated platforms",
        },
        {
          requirement: "Ofcom compliance documentation",
          covered: true,
          feature: "Enforcement audit trail and compliance dashboard",
        },
        {
          requirement: "Proactive content scanning",
          covered: false,
          feature: "Content scanning integration (platform-side responsibility)",
        },
      ],
    },
    relatedLawIds: ["uk-aadc", "eu-dsa", "au-osa"],
    tags: ["duty-of-care", "age-verification", "harmful-content"],
  }),

  // ============================================================
  // === GERMANY ===
  // ============================================================
  autoSnippet({
    id: "de-jmstv",
    shortName: "DE JMStV",
    fullName: "Germany Youth Media State Treaty",
    jurisdiction: "Germany",
    jurisdictionGroup: "eu",
    country: "DE",
    status: "enacted",
    statusLabel: "In force (ongoing amendments)",
    introduced: "2003 (Jugendmedienschutz-Staatsvertrag)",
    summary:
      "German interstate treaty governing youth protection in media, requiring content classification, age verification, and filtering for online services accessible by minors.",
    keyProvisions: [
      "Content must be classified according to German age rating system (FSK/USK)",
      "Platforms must implement age verification for content rated 16+ or 18+",
      "Technical measures required to prevent minor access to age-restricted content",
      "Youth protection officers must be appointed by platforms serving German users",
      "KJM (Commission for Youth Media Protection) enforcement authority",
    ],
    ruleCategories: ["age_gate", "content_rating", "web_filter_level"],
    platforms: ["YouTube", "TikTok", "Instagram", "Netflix", "Twitch"],
    ageThreshold: "Under 18",
    relatedLawIds: ["eu-dsa", "fr-sren", "uk-osa"],
    tags: ["content-classification", "age-verification", "labeling"],
  }),
  autoSnippet({
    id: "ie-osmra",
    shortName: "IE OSMRA",
    fullName: "Ireland Online Safety and Media Regulation Act 2022",
    jurisdiction: "Ireland",
    jurisdictionGroup: "eu",
    country: "IE",
    status: "enacted",
    statusLabel: "Enacted (2022); Coimisiún na Meán established",
    introduced: "2022 (Online Safety and Media Regulation Act, Oireachtas)",
    summary:
      "Irish law establishing Coimisiún na Meán as online safety regulator, with powers to issue binding online safety codes and designate platforms for compliance obligations protecting children.",
    keyProvisions: [
      "Establishes Coimisiún na Meán as independent online safety regulator",
      "Power to issue binding online safety codes for designated platforms",
      "Platforms must conduct risk assessments for content harmful to children",
      "Mandatory complaints-handling processes for harmful content",
      "Fines up to €20M or 10% of global turnover for non-compliance",
      "Platforms must take measures to protect children from age-inappropriate content",
    ],
    ruleCategories: ["age_gate", "addictive_design_control", "web_filter_level"],
    platforms: ["YouTube", "TikTok", "Instagram", "Snapchat", "Discord"],
    ageThreshold: "All minors",
    penaltyRange: "Up to €20M or 10% of global turnover",
    relatedLawIds: ["eu-dsa", "uk-osa", "de-jmstv"],
    tags: ["online-safety", "regulator", "codes-of-practice"],
  }),

  // ============================================================
  // === ASIA-PACIFIC ===
  // ============================================================
  {
    id: "au-osa",
    shortName: "AU OSA",
    fullName: "Australia Online Safety Act",
    jurisdiction: "Australia",
    jurisdictionGroup: "asia-pacific",
    country: "AU",
    status: "enacted",
    statusLabel: "In force (age verification trial)",
    introduced: "2021 (Online Safety Act 2021, Australian Parliament)",
    summary:
      "Establishes the eSafety Commissioner with powers to enforce age verification and removal of content harmful to children.",
    keyProvisions: [
      "Establishes eSafety Commissioner as independent regulator",
      "Mandatory age verification for platforms hosting age-restricted content",
      "Powers to issue removal notices for cyber-abuse material targeting children",
      "Basic Online Safety Expectations (BOSE) that platforms must report against",
      "Industry codes of practice for platform categories (social media, messaging, gaming, etc.)",
      "Civil penalties up to AUD $555,000 per day for non-compliance",
    ],
    ruleCategories: ["age_gate"],
    platforms: ["YouTube", "Instagram", "Roblox", "TikTok"],
    mcpSnippet: `// Enforce AU OSA \u2014 age verification
tool: trigger_child_enforcement
input: {
  child_id: "ch_emma_01",
  law: "AU_OSA",
  rules: ["age_gate"]
}

\u2192 YouTube    age-verified account      \u2713
\u2192 Instagram  minor account flagged     \u2713
\u2192 Roblox     age gate enforced         \u2713
\u2192 TikTok     restricted mode on        \u2713`,
    ageThreshold: "All minors",
    penaltyRange: "Up to AUD $555,000 per day",
    detailedPage: {
      provisions: [
        {
          title: "eSafety Commissioner",
          description:
            "Establishes the eSafety Commissioner as an independent statutory office with regulatory powers over online safety. The Commissioner can issue notices, investigate complaints, and impose penalties.",
        },
        {
          title: "Mandatory Age Verification",
          description:
            "Platforms hosting age-restricted content must implement age verification measures. The government is conducting an age verification technology trial to identify commercially viable solutions.",
        },
        {
          title: "Cyber-Abuse Removal Notices",
          description:
            "The eSafety Commissioner can issue removal notices requiring platforms to take down cyber-abuse material targeting children within 24 hours. Non-compliance carries daily penalties.",
        },
        {
          title: "Basic Online Safety Expectations (BOSE)",
          description:
            "All regulated platforms must meet Basic Online Safety Expectations, including maintaining systems to detect and remove harmful content, and providing transparency about content moderation.",
        },
        {
          title: "Industry Codes of Practice",
          description:
            "Platform categories (social media, messaging, gaming, etc.) must develop and comply with industry codes of practice addressing user safety, content moderation, and child protection.",
        },
        {
          title: "Civil Penalties and Enforcement",
          description:
            "Non-compliance carries civil penalties of up to AUD $555,000 per day for individuals and significantly more for corporations. The eSafety Commissioner can also seek injunctions.",
        },
      ],
      phosraFeatures: [
        {
          regulation: "Age verification",
          phosraFeature: "Age Gate",
          ruleCategory: "age_gate",
          description:
            "The age_gate rule enforces age verification requirements across YouTube, Instagram, Roblox, and TikTok, supporting compliance with Australia's mandatory age verification provisions.",
        },
        {
          regulation: "Content filtering",
          phosraFeature: "Web Filter Level",
          ruleCategory: "web_filter_level",
          description:
            "The web_filter_level rule sets age-appropriate filtering strictness on connected platforms, helping platforms meet their Basic Online Safety Expectations for minor users.",
        },
        {
          regulation: "Privacy protections",
          phosraFeature: "Privacy Data Sharing Controls",
          ruleCategory: "privacy_data_sharing",
          description:
            "The privacy_data_sharing rule blocks unauthorized third-party data sharing for child accounts, supporting compliance with Australia's data protection expectations.",
        },
        {
          regulation: "Addictive design restrictions",
          phosraFeature: "Addictive Design Control",
          ruleCategory: "addictive_design_control",
          description:
            "The addictive_design_control rule disables engagement-maximizing features, supporting platforms in meeting their industry code obligations for child safety.",
        },
        {
          regulation: "Enforcement documentation",
          phosraFeature: "Compliance Audit Trail",
          description:
            "Complete enforcement logging provides evidence for eSafety Commissioner inquiries and demonstrates proactive compliance with Basic Online Safety Expectations.",
        },
      ],
      checklist: [
        {
          requirement: "Age verification implemented",
          covered: true,
          feature: "age_gate rule category",
        },
        {
          requirement: "Content filtering for minors",
          covered: true,
          feature: "web_filter_level + web_category_block",
        },
        {
          requirement: "Privacy protections for children",
          covered: true,
          feature: "privacy_data_sharing defaults to blocked",
        },
        {
          requirement: "Addictive design features restricted",
          covered: true,
          feature: "addictive_design_control rule category",
        },
        {
          requirement: "Cross-platform enforcement",
          covered: true,
          feature: "Platform adapters for YouTube, Instagram, Roblox, TikTok",
        },
        {
          requirement: "Compliance audit trail for eSafety review",
          covered: true,
          feature: "Enforcement job logging with timestamps",
        },
        {
          requirement: "BOSE reporting capability",
          covered: false,
          feature: "Automated BOSE reporting (planned)",
        },
      ],
    },
    relatedLawIds: ["au-smma", "uk-osa", "nz-sm-proposal"],
    tags: ["age-verification", "esafety-commissioner", "content-removal"],
  },
  {
    id: "india-dpdpa",
    shortName: "India DPDPA",
    fullName: "Digital Personal Data Protection Act",
    jurisdiction: "India",
    jurisdictionGroup: "asia-pacific",
    country: "IN",
    status: "enacted",
    statusLabel: "Enacted (Aug 2023)",
    introduced: "2023 (Digital Personal Data Protection Act, Indian Parliament)",
    summary:
      "Complete ban on behavioral monitoring and targeted advertising directed at children. Verifiable parental consent required.",
    keyProvisions: [
      "Complete ban on behavioral monitoring and targeted advertising directed at children",
      "Verifiable parental consent required before processing any child's data",
      "Prohibits processing of children's data that could cause detrimental effect",
      "Data fiduciaries must not undertake tracking or profiling of children",
      "Penalties up to INR 250 crore (approx. $30 million) for violations",
    ],
    ruleCategories: ["targeted_ad_block"],
    platforms: ["YouTube", "Instagram", "TikTok"],
    mcpSnippet: `// Enforce India DPDPA \u2014 ad blocking
tool: trigger_child_enforcement
input: {
  child_id: "ch_emma_01",
  law: "INDIA_DPDPA",
  rules: ["targeted_ad_block"]
}

\u2192 YouTube    behavioral ads blocked    \u2713
\u2192 Instagram  ad profiling disabled     \u2713
\u2192 TikTok     targeted ads off          \u2713`,
    ageThreshold: "All minors",
    penaltyRange: "Up to INR 250 crore (~$30M)",
    detailedPage: {
      provisions: [
        {
          title: "Complete Ban on Behavioral Monitoring",
          description:
            "Data fiduciaries must not undertake tracking, behavioral monitoring, or targeted advertising directed at children. This is one of the most comprehensive behavioral advertising bans globally.",
        },
        {
          title: "Verifiable Parental Consent",
          description:
            "Processing any personal data of a child requires verifiable consent from the parent or lawful guardian. The data fiduciary must make reasonable efforts to verify that consent is given by an authorized adult.",
        },
        {
          title: "Best Interest Principle",
          description:
            "Processing of children's data must not be likely to cause any detrimental effect on the well-being of a child. The best interests of the child must be the primary consideration.",
        },
        {
          title: "Prohibition on Profiling Children",
          description:
            "Data fiduciaries must not profile children or track their online behavior. Any form of personalized content delivery based on behavioral data is prohibited for minor users.",
        },
        {
          title: "Significant Financial Penalties",
          description:
            "Violations carry penalties up to INR 250 crore (approximately $30 million USD). The Data Protection Board of India has enforcement authority with powers to investigate and impose penalties.",
        },
      ],
      phosraFeatures: [
        {
          regulation: "Ban on behavioral advertising",
          phosraFeature: "Targeted Ad Block",
          ruleCategory: "targeted_ad_block",
          description:
            "The targeted_ad_block rule disables all behavioral advertising and ad profiling for minor users across YouTube, Instagram, and TikTok, directly satisfying the DPDPA's advertising ban.",
        },
        {
          regulation: "Parental consent model",
          phosraFeature: "Parent Account Ownership",
          description:
            "Phosra's parent-managed account model ensures all child profiles are created by a verified adult, providing verifiable parental consent as required by the DPDPA.",
        },
        {
          regulation: "Prohibition on profiling",
          phosraFeature: "Algorithm Feed Control",
          ruleCategory: "algo_feed_control",
          description:
            "The algo_feed_control rule switches feeds to chronological mode, preventing platforms from profiling children through AI-driven content recommendations.",
        },
        {
          regulation: "Data minimization",
          phosraFeature: "Minimal Child Profiles",
          description:
            "Phosra stores only first name, birth date, and age group — no behavioral data, browsing history, or activity profiles are retained, supporting the DPDPA's data minimization requirements.",
        },
        {
          regulation: "Enforcement documentation",
          phosraFeature: "Compliance Audit Trail",
          description:
            "Complete enforcement logging with timestamped records provides documentary evidence for Data Protection Board reviews and compliance demonstrations.",
        },
      ],
      checklist: [
        {
          requirement: "Behavioral monitoring banned",
          covered: true,
          feature: "targeted_ad_block + algo_feed_control",
        },
        {
          requirement: "Verifiable parental consent obtained",
          covered: true,
          feature: "Parent account ownership verification",
        },
        {
          requirement: "Targeted advertising blocked",
          covered: true,
          feature: "targeted_ad_block rule category",
        },
        {
          requirement: "Child profiling prevented",
          covered: true,
          feature: "algo_feed_control enforces chronological mode",
        },
        {
          requirement: "Data minimization enforced",
          covered: true,
          feature: "Minimal child profile schema",
        },
        {
          requirement: "Cross-platform enforcement",
          covered: true,
          feature: "Platform adapters for YouTube, Instagram, TikTok",
        },
        {
          requirement: "Compliance documentation for Board review",
          covered: true,
          feature: "Enforcement audit trail and compliance dashboard",
        },
      ],
    },
    relatedLawIds: ["gdpr-art-8", "eu-dsa"],
    tags: ["targeted-ads", "parental-consent", "data-protection", "behavioral-monitoring"],
  },
  autoSnippet({
    id: "au-smma",
    shortName: "AU SMMA",
    fullName: "Australia Social Media Minimum Age Act 2024",
    jurisdiction: "Australia",
    jurisdictionGroup: "asia-pacific",
    country: "AU",
    status: "enacted",
    statusLabel: "Enacted (Dec 2024)",
    introduced: "2024 (Social Media Minimum Age Act, Australian Parliament)",
    summary:
      "Australian law establishing a minimum age of 16 for social media access, with significant penalties for platforms that fail to enforce age verification.",
    keyProvisions: [
      "Minimum age of 16 for social media account creation and access",
      "Platforms must implement age assurance measures to prevent under-16 access",
      "No exemption for parental consent \u2014 under-16s banned regardless",
      "Penalties up to AUD 49.5 million for systematic non-compliance",
      "eSafety Commissioner responsible for enforcement and guidance",
      "12-month implementation period following Royal Assent",
    ],
    ruleCategories: ["social_media_min_age", "age_gate"],
    platforms: ["Facebook", "Instagram", "TikTok", "Snapchat", "YouTube", "Discord", "Roblox", "X", "Telegram"],
    ageThreshold: "Under 16",
    penaltyRange: "Up to AUD 49.5M",
    relatedLawIds: ["au-osa", "nz-sm-proposal", "uk-osa"],
    tags: ["minimum-age", "social-media-ban", "age-verification"],
  }),
  autoSnippet({
    id: "id-gr-17",
    shortName: "ID GR 17",
    fullName: "Indonesia GR 17/2025 on Child Protection",
    jurisdiction: "Indonesia",
    jurisdictionGroup: "asia-pacific",
    country: "ID",
    status: "enacted",
    statusLabel: "Enacted (2025)",
    introduced: "2025 (Government Regulation 17/2025)",
    summary:
      "Indonesian government regulation requiring platforms to implement age verification, content rating, and privacy protections for children accessing digital services.",
    keyProvisions: [
      "Platforms must implement age verification for all Indonesian users",
      "Content must be rated according to Indonesian age classification standards",
      "Parental consent required for data collection from users under 17",
      "Platforms must conduct risk assessments for services likely used by children",
      "Data sharing restrictions for minor user data",
    ],
    ruleCategories: ["age_gate", "content_rating", "privacy_data_sharing"],
    platforms: ["YouTube", "TikTok", "Instagram", "Roblox", "Discord"],
    ageThreshold: "Under 17",
    relatedLawIds: ["au-smma", "sg-pdpa", "jp-yiea"],
    tags: ["parental-consent", "risk-assessment", "content-restrictions"],
  }),
  autoSnippet({
    id: "sg-pdpa",
    shortName: "SG PDPA",
    fullName: "Singapore PDPA Child Guidelines",
    jurisdiction: "Singapore",
    jurisdictionGroup: "asia-pacific",
    country: "SG",
    status: "enacted",
    statusLabel: "Guidelines published (2024)",
    introduced: "2024 (PDPC Advisory Guidelines on Children's Data)",
    summary:
      "Singapore's Personal Data Protection Commission guidelines on collecting, using, and disclosing personal data of children, emphasizing consent and data protection.",
    keyProvisions: [
      "Parental consent required for collection of children's personal data",
      "Organizations should limit data collection from children to what is necessary",
      "Targeted advertising restrictions for services directed at children",
      "Guidelines on age-appropriate privacy notices for children",
      "PDPC enforcement authority for guideline violations",
    ],
    ruleCategories: ["privacy_data_sharing", "targeted_ad_block"],
    platforms: ["YouTube", "TikTok", "Instagram", "Roblox"],
    ageThreshold: "All minors",
    relatedLawIds: ["india-dpdpa", "gdpr-art-8"],
    tags: ["data-protection", "guidelines"],
  }),
  autoSnippet({
    id: "jp-yiea",
    shortName: "JP YIEA",
    fullName: "Japan Youth Internet Environment Act",
    jurisdiction: "Japan",
    jurisdictionGroup: "asia-pacific",
    country: "JP",
    status: "enacted",
    statusLabel: "In force (enacted 2008; amended)",
    introduced: "2008 (Act on Development of an Environment that Provides Safe and Secure Internet Use for Young People)",
    summary:
      "Japanese law requiring ISPs and device manufacturers to provide content filtering for minors, promoting a safe internet environment for young people.",
    keyProvisions: [
      "ISPs must offer content filtering services for minor subscribers",
      "Mobile carriers must activate filtering by default for minor accounts",
      "Device manufacturers encouraged to pre-install filtering software",
      "Government promotes internet literacy education for youth",
      "Prefectural governments responsible for local implementation",
    ],
    ruleCategories: ["web_filter_level", "web_category_block"],
    platforms: ["NTT Docomo", "SoftBank", "KDDI", "YouTube", "TikTok"],
    ageThreshold: "Youth",
    relatedLawIds: ["kr-jpa", "au-osa", "cipa"],
    tags: ["content-filtering", "education", "internet-safety"],
  }),
  autoSnippet({
    id: "kr-jpa",
    shortName: "KR JPA",
    fullName: "South Korea Juvenile Protection Act",
    jurisdiction: "South Korea",
    jurisdictionGroup: "asia-pacific",
    country: "KR",
    status: "enacted",
    statusLabel: "In force (enacted 2014; amended)",
    introduced: "2014 (Juvenile Protection Act amendments)",
    summary:
      "South Korean law restricting minors' access to online games during nighttime hours and requiring content rating for all games and media accessible to juveniles.",
    keyProvisions: [
      "Shutdown system restricting under-16 gaming access from midnight to 6 AM (repealed 2021, replaced with parental choice)",
      "All games must be rated by the Game Rating and Administration Committee",
      "Parental consent required for minors to access online gaming services",
      "Platforms must provide usage time management tools for minor accounts",
      "Content rating and age verification required for media directed at minors",
    ],
    ruleCategories: ["time_daily_limit", "content_rating"],
    platforms: ["Nexon", "NCSoft", "Roblox", "YouTube", "TikTok"],
    ageThreshold: "Juveniles",
    relatedLawIds: ["jp-yiea", "au-smma"],
    tags: ["gaming-addiction", "content-protection"],
  }),
  autoSnippet({
    id: "kr-pipa",
    shortName: "KR PIPA",
    fullName: "South Korea Personal Information Protection Act",
    jurisdiction: "South Korea",
    jurisdictionGroup: "asia-pacific",
    country: "KR",
    status: "enacted",
    statusLabel: "In force (enacted 2011; amended 2023)",
    introduced: "2011 (Personal Information Protection Act, amended 2023)",
    summary:
      "South Korea's comprehensive data protection law with strengthened provisions for children's personal information, requiring parental consent and restricting data processing for minors.",
    keyProvisions: [
      "Parental or guardian consent required for processing personal data of children under 14",
      "Data controllers must not collect more information than necessary from children",
      "Children and guardians have the right to request data correction and deletion",
      "Data controllers must implement safety measures for children's personal data",
      "Personal Information Protection Commission (PIPC) enforcement authority",
      "Administrative fines up to 3% of relevant revenue for violations",
    ],
    ruleCategories: ["privacy_data_sharing", "data_deletion_request", "targeted_ad_block"],
    platforms: ["YouTube", "TikTok", "Instagram", "Roblox", "Discord"],
    ageThreshold: "Under 14",
    penaltyRange: "Up to 3% of relevant revenue",
    relatedLawIds: ["kr-jpa", "gdpr-art-8", "sg-pdpa"],
    tags: ["data-protection", "parental-consent", "privacy"],
  }),
  autoSnippet({
    id: "nz-sm-proposal",
    shortName: "NZ SM Proposal",
    fullName: "New Zealand Social Media Age Proposal",
    jurisdiction: "New Zealand",
    jurisdictionGroup: "asia-pacific",
    country: "NZ",
    status: "proposed",
    statusLabel: "Proposed (2024)",
    introduced: "2024 (New Zealand Government proposal)",
    summary:
      "New Zealand government proposal to establish a minimum age for social media access, modeled on Australia's Social Media Minimum Age Act.",
    keyProvisions: [
      "Proposed minimum age of 16 for social media access",
      "Platforms would be required to implement age verification",
      "Modeled on Australia's Social Media Minimum Age Act 2024",
      "Public consultation phase underway",
    ],
    ruleCategories: ["social_media_min_age", "age_gate"],
    platforms: ["Instagram", "TikTok", "Snapchat", "YouTube", "Facebook"],
    ageThreshold: "Under 16",
    relatedLawIds: ["au-smma", "au-osa"],
    tags: ["social-media-ban", "age-verification"],
  }),

  // ============================================================
  // === AMERICAS ===
  // ============================================================
  autoSnippet({
    id: "ca-bill-c63",
    shortName: "CA Bill C-63",
    fullName: "Canada Online Harms Act (Bill C-63)",
    jurisdiction: "Canada",
    jurisdictionGroup: "americas",
    country: "CA",
    status: "proposed",
    statusLabel: "Proposed (2024)",
    introduced: "2024 (Bill C-63, House of Commons)",
    summary:
      "Canadian bill establishing a duty of care for online platforms to protect children from harmful content, with specific provisions for CSAM reporting and addictive design restrictions.",
    keyProvisions: [
      "Establishes Digital Safety Commission as independent regulator",
      "Duty to protect children from harmful content including CSAM",
      "Platforms must implement age-appropriate design for services used by children",
      "Mandatory reporting of CSAM to Canadian Centre for Child Protection",
      "Restrictions on addictive design features for minor users",
      "Administrative monetary penalties for non-compliance",
    ],
    ruleCategories: ["csam_reporting", "addictive_design_control", "dm_restriction"],
    platforms: ["YouTube", "Instagram", "TikTok", "Snapchat", "Discord", "Roblox"],
    ageThreshold: "All minors",
    detailedPage: {
      provisions: [
        {
          title: "Digital Safety Commission",
          description:
            "Establishes an independent Digital Safety Commission as Canada's online safety regulator, with powers to create regulations, investigate complaints, and impose administrative monetary penalties.",
        },
        {
          title: "Duty to Protect Children",
          description:
            "Platforms have an affirmative duty to protect children from harmful content, including CSAM, content promoting self-harm, and bullying. This duty requires proactive measures, not just reactive takedowns.",
        },
        {
          title: "Age-Appropriate Design",
          description:
            "Platforms must implement age-appropriate design principles for services used by children, including privacy-by-default settings and restrictions on features that could harm children.",
        },
        {
          title: "Mandatory CSAM Reporting",
          description:
            "Platforms are required to report child sexual abuse material to the Canadian Centre for Child Protection. Failure to report carries significant penalties.",
        },
        {
          title: "Restrictions on Addictive Design",
          description:
            "Platforms must restrict addictive design features for minor users, including infinite scroll, autoplay, and engagement-maximizing notification systems.",
        },
        {
          title: "Administrative Monetary Penalties",
          description:
            "The Digital Safety Commission can impose administrative monetary penalties for non-compliance. The bill also creates a Digital Safety Ombudsperson for public complaints.",
        },
      ],
      phosraFeatures: [
        {
          regulation: "Duty to protect children",
          phosraFeature: "PCSS Policy Engine",
          ruleCategory: "addictive_design_control",
          description:
            "Phosra's 40-category rule system covers the full scope of C-63's child protection duties, enforcing protective defaults across all connected platforms.",
        },
        {
          regulation: "CSAM reporting",
          phosraFeature: "CSAM Reporting",
          ruleCategory: "csam_reporting",
          description:
            "The csam_reporting rule ensures platforms have CSAM detection and reporting mechanisms enabled, supporting compliance with Canada's mandatory reporting requirements.",
        },
        {
          regulation: "Addictive design restrictions",
          phosraFeature: "Addictive Design Control",
          ruleCategory: "addictive_design_control",
          description:
            "The addictive_design_control rule disables autoplay, infinite scroll, streaks, and daily rewards across all connected platforms.",
        },
        {
          regulation: "DM safety measures",
          phosraFeature: "DM Restriction",
          ruleCategory: "dm_restriction",
          description:
            "The dm_restriction rule limits direct messaging to contacts-only, preventing unsolicited contact from strangers on Instagram, TikTok, Snapchat, and Discord.",
        },
        {
          regulation: "Enforcement documentation",
          phosraFeature: "Compliance Audit Trail",
          description:
            "Complete enforcement logging provides documentary evidence for Digital Safety Commission reviews and compliance demonstrations.",
        },
      ],
      checklist: [
        {
          requirement: "Child protection measures implemented",
          covered: true,
          feature: "PCSS Policy Engine with 40 rule categories",
        },
        {
          requirement: "CSAM reporting mechanisms enabled",
          covered: true,
          feature: "csam_reporting rule category",
        },
        {
          requirement: "Addictive design features restricted",
          covered: true,
          feature: "addictive_design_control rule category",
        },
        {
          requirement: "DM restrictions for minor accounts",
          covered: true,
          feature: "dm_restriction rule category",
        },
        {
          requirement: "Cross-platform enforcement",
          covered: true,
          feature: "Multi-platform policy engine",
        },
        {
          requirement: "Compliance documentation for Commission review",
          covered: true,
          feature: "Enforcement audit trail and compliance dashboard",
        },
        {
          requirement: "Digital Safety Ombudsperson reporting",
          covered: false,
          feature: "Ombudsperson reporting integration (planned)",
        },
      ],
    },
    relatedLawIds: ["kosa", "uk-osa", "au-osa"],
    tags: ["duty-of-care", "exploitation", "online-harms"],
  }),
  autoSnippet({
    id: "br-lgpd",
    shortName: "BR LGPD",
    fullName: "Brazil LGPD Child Provisions + Digital ECA",
    jurisdiction: "Brazil",
    jurisdictionGroup: "americas",
    country: "BR",
    status: "enacted",
    statusLabel: "LGPD enacted (2018); Digital ECA passed Senate (2024)",
    introduced: "2018 (Lei Geral de Prote\u00e7\u00e3o de Dados) + 2024 (Digital ECA)",
    summary:
      "Brazil's data protection law includes specific child provisions banning targeted advertising to minors, supplemented by the Digital ECA bill strengthening children's digital rights.",
    keyProvisions: [
      "Processing of children's data must be in their best interest",
      "Parental consent required for data collection from children and adolescents",
      "Ban on targeted advertising directed at children",
      "Right to data deletion for children and adolescents",
      "Digital ECA establishes platform duties for child safety online",
      "ANPD enforcement authority for data protection violations",
    ],
    ruleCategories: ["targeted_ad_block", "privacy_data_sharing", "data_deletion_request"],
    platforms: ["YouTube", "Instagram", "TikTok", "Roblox", "Discord"],
    ageThreshold: "Under 18",
    detailedPage: {
      provisions: [
        {
          title: "Best Interest of the Child",
          description:
            "All processing of children's and adolescents' personal data must be carried out in their best interest. This overriding principle guides all data protection decisions involving minors.",
        },
        {
          title: "Parental Consent for Data Processing",
          description:
            "Processing personal data of children and adolescents requires specific, highlighted consent from at least one parent or legal guardian. Consent must be informed and freely given.",
        },
        {
          title: "Ban on Targeted Advertising to Children",
          description:
            "Targeted advertising directed at children is prohibited under the LGPD's best-interest framework. Platforms may not use children's data for behavioral advertising or ad profiling.",
        },
        {
          title: "Right to Data Deletion",
          description:
            "Children, adolescents, and their legal guardians have the right to request deletion of personal data collected by data controllers. Requests must be honored in a timely manner.",
        },
        {
          title: "Digital ECA Platform Duties",
          description:
            "The Digital ECA (Estatuto da Crian\u00e7a e do Adolescente) establishes additional platform duties for child safety online, including content moderation obligations and age verification requirements.",
        },
        {
          title: "ANPD Enforcement",
          description:
            "The National Data Protection Authority (ANPD) enforces LGPD provisions, with enhanced scrutiny for violations involving children's data. Administrative sanctions include fines and data processing suspensions.",
        },
      ],
      phosraFeatures: [
        {
          regulation: "Ban on targeted advertising",
          phosraFeature: "Targeted Ad Block",
          ruleCategory: "targeted_ad_block",
          description:
            "The targeted_ad_block rule disables all behavioral advertising for minor users across YouTube, Instagram, TikTok, and Roblox, satisfying the LGPD's advertising prohibition.",
        },
        {
          regulation: "Data deletion rights",
          phosraFeature: "Data Deletion Request",
          ruleCategory: "data_deletion_request",
          description:
            "The data_deletion_request rule triggers deletion workflows on connected platforms. Child profiles can be fully removed from Phosra via the dashboard or API.",
        },
        {
          regulation: "Privacy data sharing controls",
          phosraFeature: "Privacy Data Sharing",
          ruleCategory: "privacy_data_sharing",
          description:
            "The privacy_data_sharing rule blocks third-party data sharing by default for child accounts, ensuring compliance with LGPD's data protection requirements.",
        },
        {
          regulation: "Parental consent model",
          phosraFeature: "Parent Account Ownership",
          description:
            "Phosra's parent-managed account model ensures all child profiles are created by a verified adult, satisfying LGPD's consent requirements.",
        },
        {
          regulation: "Enforcement documentation",
          phosraFeature: "Compliance Audit Trail",
          description:
            "Complete enforcement logging provides documentary evidence for ANPD reviews and demonstrates compliance with LGPD's best-interest principle.",
        },
      ],
      checklist: [
        {
          requirement: "Best interest of the child prioritized",
          covered: true,
          feature: "Age-appropriate policy defaults across 40 categories",
        },
        {
          requirement: "Parental consent obtained",
          covered: true,
          feature: "Parent account ownership verification",
        },
        {
          requirement: "Targeted advertising blocked",
          covered: true,
          feature: "targeted_ad_block rule category",
        },
        {
          requirement: "Data deletion mechanism available",
          covered: true,
          feature: "data_deletion_request + profile deletion API",
        },
        {
          requirement: "Third-party data sharing blocked",
          covered: true,
          feature: "privacy_data_sharing defaults to blocked",
        },
        {
          requirement: "Cross-platform enforcement",
          covered: true,
          feature: "Platform adapters for YouTube, Instagram, TikTok, Roblox, Discord",
        },
        {
          requirement: "ANPD compliance documentation",
          covered: true,
          feature: "Enforcement audit trail and compliance dashboard",
        },
      ],
    },
    relatedLawIds: ["gdpr-art-8", "coppa-2", "cl-pdp"],
    tags: ["data-protection", "advertising-ban", "best-interests"],
  }),
  autoSnippet({
    id: "mx-flppdhpp",
    shortName: "MX LFPDPPP",
    fullName: "Mexico Data Protection Law 2025",
    jurisdiction: "Mexico",
    jurisdictionGroup: "americas",
    country: "MX",
    status: "enacted",
    statusLabel: "Enacted (March 2025)",
    introduced: "2025 (Ley Federal de Protecci\u00f3n de Datos Personales)",
    summary:
      "Mexican federal data protection law with provisions for minors' personal data, requiring parental consent and data protection measures for children's information.",
    keyProvisions: [
      "Parental consent required for processing personal data of minors",
      "Data controllers must implement appropriate safeguards for children's data",
      "Privacy notices must be accessible and understandable to minors",
      "INAI enforcement authority for data protection violations",
    ],
    ruleCategories: ["privacy_data_sharing"],
    platforms: ["YouTube", "Instagram", "TikTok", "Facebook", "Roblox"],
    ageThreshold: "All minors",
    relatedLawIds: ["br-lgpd", "cl-pdp"],
    tags: ["data-protection"],
  }),
  autoSnippet({
    id: "cl-pdp",
    shortName: "CL PDP",
    fullName: "Chile Personal Data Protection Bill",
    jurisdiction: "Chile",
    jurisdictionGroup: "americas",
    country: "CL",
    status: "pending",
    statusLabel: "Passed Congress (Aug 2024); pending implementation",
    introduced: "2024 (Ley de Protecci\u00f3n de Datos Personales, Chilean Congress)",
    summary:
      "Chilean personal data protection bill with specific provisions for children's data, establishing a data protection authority and rights including data deletion for minors.",
    keyProvisions: [
      "Establishes independent data protection authority",
      "Parental consent required for processing data of minors",
      "Right to data deletion for children and their guardians",
      "Data minimization principles apply to children's data collection",
      "Administrative sanctions for violations involving children's data",
    ],
    ruleCategories: ["privacy_data_sharing", "data_deletion_request"],
    platforms: ["YouTube", "Instagram", "TikTok", "Facebook"],
    ageThreshold: "All minors",
    relatedLawIds: ["br-lgpd", "mx-flppdhpp", "gdpr-art-8"],
    tags: ["data-protection", "enforcement"],
  }),

  // ============================================================
  // === MIDDLE EAST & AFRICA ===
  // ============================================================
  autoSnippet({
    id: "ae-decree-26",
    shortName: "UAE Decree 26",
    fullName: "UAE Child Digital Safety Law",
    jurisdiction: "United Arab Emirates",
    jurisdictionGroup: "middle-east-africa",
    country: "AE",
    status: "enacted",
    statusLabel: "Enacted (2025); effective Jan 2026",
    introduced: "2025 (Federal Decree-Law 26)",
    effectiveDate: "Jan 2026",
    summary:
      "UAE law establishing comprehensive child digital safety requirements, including age verification, targeted ad bans, privacy protections, and restrictions on addictive design for platforms serving children under 13.",
    keyProvisions: [
      "Platforms must implement age verification for all users",
      "Targeted advertising banned for users under 13",
      "Privacy-by-default settings required for minor accounts",
      "Addictive design features must be disabled for children",
      "Geolocation tracking disabled by default for minor users",
      "Applies extraterritorially to platforms accessible in the UAE",
    ],
    ruleCategories: [
      "age_gate",
      "targeted_ad_block",
      "privacy_data_sharing",
      "addictive_design_control",
      "geolocation_opt_in",
    ],
    platforms: ["Instagram", "TikTok", "YouTube", "Snapchat", "Roblox", "Discord"],
    ageThreshold: "Under 13 (enhanced)",
    penaltyRange: "TBD",
    detailedPage: {
      provisions: [
        {
          title: "Age Verification Requirement",
          description:
            "Platforms must implement age verification for all users. Enhanced protections apply to children under 13, with additional obligations for users under 18.",
        },
        {
          title: "Targeted Advertising Ban for Under-13",
          description:
            "Targeted advertising directed at users under 13 is prohibited. Platforms may not use personal data of children for advertising profiling, behavioral targeting, or ad personalization.",
        },
        {
          title: "Privacy-by-Default Settings",
          description:
            "Minor accounts must default to the most restrictive privacy settings. Platforms must disable data sharing, location tracking, and ad personalization by default for children.",
        },
        {
          title: "Addictive Design Restrictions",
          description:
            "Addictive design features such as autoplay, infinite scroll, streaks, and engagement-maximizing notifications must be disabled for children's accounts.",
        },
        {
          title: "Geolocation Tracking Disabled",
          description:
            "Geolocation tracking must be disabled by default for minor users. Location data may only be collected with explicit, informed parental consent.",
        },
        {
          title: "Extraterritorial Application",
          description:
            "The law applies extraterritorially to any platform accessible in the UAE that processes data of UAE-resident children, regardless of where the platform is headquartered.",
        },
      ],
      phosraFeatures: [
        {
          regulation: "Age verification",
          phosraFeature: "Age Gate",
          ruleCategory: "age_gate",
          description:
            "The age_gate rule enforces age verification on connected platforms, ensuring minor accounts are properly identified and subject to UAE-required protections.",
        },
        {
          regulation: "Targeted advertising ban",
          phosraFeature: "Targeted Ad Block",
          ruleCategory: "targeted_ad_block",
          description:
            "The targeted_ad_block rule disables all behavioral advertising for users under 13, satisfying the Decree's advertising prohibition.",
        },
        {
          regulation: "Privacy-by-default",
          phosraFeature: "Privacy Data Sharing Controls",
          ruleCategory: "privacy_data_sharing",
          description:
            "The privacy_data_sharing rule blocks third-party data sharing by default, implementing the Decree's privacy-by-default requirements.",
        },
        {
          regulation: "Addictive design restrictions",
          phosraFeature: "Addictive Design Control",
          ruleCategory: "addictive_design_control",
          description:
            "The addictive_design_control rule disables autoplay, infinite scroll, and engagement-maximizing features for minor accounts.",
        },
        {
          regulation: "Geolocation disabled by default",
          phosraFeature: "Geolocation Opt-In",
          ruleCategory: "geolocation_opt_in",
          description:
            "The geolocation_opt_in rule ensures location tracking is disabled by default on connected platforms, requiring explicit parental authorization.",
        },
        {
          regulation: "Cross-platform enforcement",
          phosraFeature: "Multi-Platform Policy Engine",
          description:
            "A single UAE Decree-26 compliance policy enforces all requirements simultaneously across Instagram, TikTok, YouTube, Snapchat, Roblox, and Discord.",
        },
      ],
      checklist: [
        {
          requirement: "Age verification implemented",
          covered: true,
          feature: "age_gate rule category",
        },
        {
          requirement: "Targeted advertising blocked for under-13",
          covered: true,
          feature: "targeted_ad_block rule category",
        },
        {
          requirement: "Privacy settings default to most restrictive",
          covered: true,
          feature: "privacy_data_sharing defaults to blocked",
        },
        {
          requirement: "Addictive design features disabled",
          covered: true,
          feature: "addictive_design_control rule category",
        },
        {
          requirement: "Geolocation tracking disabled by default",
          covered: true,
          feature: "geolocation_opt_in rule category",
        },
        {
          requirement: "Cross-platform enforcement for UAE users",
          covered: true,
          feature: "Multi-platform policy engine",
        },
        {
          requirement: "Extraterritorial compliance documentation",
          covered: true,
          feature: "Enforcement audit trail and compliance dashboard",
        },
      ],
    },
    relatedLawIds: ["gdpr-art-8", "uk-osa", "coppa-2"],
    tags: ["parental-consent", "privacy-by-default", "age-verification", "extraterritorial"],
  }),
  autoSnippet({
    id: "ph-cotg",
    shortName: "PH COTG",
    fullName: "Philippines Child Transparency Guidelines",
    jurisdiction: "Philippines",
    jurisdictionGroup: "middle-east-africa",
    country: "PH",
    status: "enacted",
    statusLabel: "Published (Dec 2024)",
    introduced: "2024 (National Privacy Commission Guidelines)",
    summary:
      "Philippines National Privacy Commission guidelines on transparency requirements for processing children's personal data, emphasizing best interests and data protection.",
    keyProvisions: [
      "Transparency requirements for organizations processing children's data",
      "Best interests of the child must guide data processing decisions",
      "Privacy notices must be child-friendly and age-appropriate",
      "Parental consent required for data processing of minors under 18",
      "NPC enforcement authority for guideline violations",
    ],
    ruleCategories: ["privacy_data_sharing"],
    platforms: ["YouTube", "Instagram", "TikTok", "Facebook", "Roblox"],
    ageThreshold: "Under 18",
    relatedLawIds: ["sg-pdpa", "india-dpdpa"],
    tags: ["transparency", "best-interests", "data-protection"],
  }),
  autoSnippet({
    id: "sa-pdpl",
    shortName: "SA PDPL",
    fullName: "Saudi Arabia Personal Data Protection Law",
    jurisdiction: "Saudi Arabia",
    jurisdictionGroup: "middle-east-africa",
    country: "SA",
    status: "enacted",
    statusLabel: "Enacted (Sep 2023); full enforcement Mar 2025",
    introduced: "2021 (Royal Decree M/19; implementing regulations 2023)",
    effectiveDate: "Mar 2025",
    summary:
      "Saudi Arabia's comprehensive data protection law with specific provisions for children's data, requiring explicit parental consent and prohibiting processing that harms minors' interests.",
    keyProvisions: [
      "Explicit consent from parent or guardian required for processing children's personal data",
      "Processing of children's data must not harm their interests or wellbeing",
      "Data controllers must implement appropriate safeguards for children's information",
      "Right to data deletion and correction for children and their guardians",
      "Saudi Data and AI Authority (SDAIA) enforcement with fines up to SAR 5 million",
      "Extraterritorial application to entities processing data of Saudi residents",
    ],
    ruleCategories: ["privacy_data_sharing", "data_deletion_request"],
    platforms: ["YouTube", "Instagram", "TikTok", "Snapchat", "Roblox"],
    ageThreshold: "All minors",
    penaltyRange: "Up to SAR 5M (~$1.3M)",
    relatedLawIds: ["ae-decree-26", "gdpr-art-8"],
    tags: ["data-protection", "parental-consent", "extraterritorial"],
  }),

  // ============================================================
  // === ADDITIONAL US STATE AGE VERIFICATION LAWS ===
  // ============================================================
  autoSnippet({
    id: "id-age-verify",
    shortName: "ID Age Verify",
    fullName: "Idaho Age Verification Act",
    jurisdiction: "Idaho, United States",
    jurisdictionGroup: "us-state",
    country: "US",
    stateOrRegion: "Idaho",
    status: "enacted",
    statusLabel: "Enacted",
    introduced: "2024 (Idaho Legislature)",
    summary:
      "Idaho law requiring age verification for platforms hosting content harmful to minors, mandating commercially reasonable age verification methods.",
    keyProvisions: [
      "Platforms must implement age verification for access to content harmful to minors",
      "Commercially reasonable age verification methods required",
      "Private right of action for parents of affected minors",
      "Applies to commercial entities publishing content harmful to minors",
    ],
    ruleCategories: ["age_gate"],
    platforms: ["Instagram", "TikTok", "YouTube", "Snapchat"],
    ageThreshold: "All minors",
    relatedLawIds: ["fl-hb-3", "ar-age-verify", "la-act-456"],
    tags: ["age-verification"],
  }),
  autoSnippet({
    id: "ky-age-verify",
    shortName: "KY Age Verify",
    fullName: "Kentucky Age Verification Act",
    jurisdiction: "Kentucky, United States",
    jurisdictionGroup: "us-state",
    country: "US",
    stateOrRegion: "Kentucky",
    status: "enacted",
    statusLabel: "Enacted",
    introduced: "2024 (Kentucky Legislature)",
    summary:
      "Kentucky law requiring age verification for platforms hosting content harmful to minors, with civil liability for non-compliance.",
    keyProvisions: [
      "Platforms must verify the age of users before granting access to harmful content",
      "Commercially reasonable age verification methods required",
      "Civil liability for platforms failing to implement age verification",
      "Parents may bring civil action for damages",
    ],
    ruleCategories: ["age_gate"],
    platforms: ["Instagram", "TikTok", "YouTube", "Snapchat"],
    ageThreshold: "All minors",
    relatedLawIds: ["fl-hb-3", "ar-age-verify", "id-age-verify"],
    tags: ["age-verification"],
  }),
  autoSnippet({
    id: "ne-age-verify",
    shortName: "NE Age Verify",
    fullName: "Nebraska Age Verification Act",
    jurisdiction: "Nebraska, United States",
    jurisdictionGroup: "us-state",
    country: "US",
    stateOrRegion: "Nebraska",
    status: "enacted",
    statusLabel: "Enacted",
    introduced: "2024 (Nebraska Legislature)",
    summary:
      "Nebraska law requiring age verification for platforms hosting content harmful to minors, establishing obligations for commercial content publishers.",
    keyProvisions: [
      "Age verification required before providing access to content harmful to minors",
      "Commercially reasonable age verification methods must be used",
      "Platforms must retain no personal data from age verification process",
      "AG enforcement authority with civil penalties",
    ],
    ruleCategories: ["age_gate"],
    platforms: ["Instagram", "TikTok", "YouTube", "Snapchat"],
    ageThreshold: "All minors",
    relatedLawIds: ["fl-hb-3", "ar-age-verify", "sc-age-verify"],
    tags: ["age-verification"],
  }),
  autoSnippet({
    id: "sc-age-verify",
    shortName: "SC Age Verify",
    fullName: "South Carolina Age Verification Act",
    jurisdiction: "South Carolina, United States",
    jurisdictionGroup: "us-state",
    country: "US",
    stateOrRegion: "South Carolina",
    status: "enacted",
    statusLabel: "Enacted",
    introduced: "2024 (South Carolina Legislature)",
    summary:
      "South Carolina law requiring age verification for platforms hosting content harmful to minors, with both AG enforcement and private right of action.",
    keyProvisions: [
      "Platforms must verify user age before granting access to content harmful to minors",
      "Commercially reasonable age verification methods required",
      "AG enforcement authority",
      "Private right of action for parents with statutory damages",
    ],
    ruleCategories: ["age_gate"],
    platforms: ["Instagram", "TikTok", "YouTube", "Snapchat"],
    ageThreshold: "All minors",
    relatedLawIds: ["fl-hb-3", "ar-age-verify", "ne-age-verify"],
    tags: ["age-verification"],
  }),
]

// Quick-access map by law ID
export const LAW_BY_ID: Record<string, LawEntry> = Object.fromEntries(
  LAW_REGISTRY.map((law) => [law.id, law])
)

// Get laws filtered by jurisdiction group
export function getLawsByJurisdiction(group: LawEntry["jurisdictionGroup"]): LawEntry[] {
  return LAW_REGISTRY.filter((law) => law.jurisdictionGroup === group)
}

// Get laws filtered by status
export function getLawsByStatus(status: LawEntry["status"]): LawEntry[] {
  return LAW_REGISTRY.filter((law) => law.status === status)
}

// Get laws that have detailed page data
export function getLawsWithDetailedPages(): LawEntry[] {
  return LAW_REGISTRY.filter((law) => law.detailedPage !== undefined)
}
