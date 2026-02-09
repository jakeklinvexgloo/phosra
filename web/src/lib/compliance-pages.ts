import { COMPLIANCE_LAWS } from "@/components/marketing/compliance-data"

export interface CompliancePageData {
  hero: {
    lawName: string
    shortName: string
    jurisdiction: string
    stage: string
    stageColor: "enacted" | "passed" | "pending"
    description: string
  }
  provisions: { title: string; description: string }[]
  phosraFeatures: {
    regulation: string
    phosraFeature: string
    ruleCategory?: string
    description: string
  }[]
  checklist: { requirement: string; covered: boolean; feature: string }[]
  relatedLaws: { id: string; name: string; href: string }[]
}

const kosaLaw = COMPLIANCE_LAWS.find((l) => l.id === "kosa")!
const coppaLaw = COMPLIANCE_LAWS.find((l) => l.id === "coppa-2")!
const dsaLaw = COMPLIANCE_LAWS.find((l) => l.id === "eu-dsa")!

export const COMPLIANCE_PAGES: Record<string, CompliancePageData> = {
  kosa: {
    hero: {
      lawName: "Kids Online Safety Act",
      shortName: "KOSA",
      jurisdiction: "United States (Federal)",
      stage: "Passed Senate (Jul 2024)",
      stageColor: "passed",
      description: kosaLaw.summary,
    },
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
          "Phosra's 26-category rule system covers the full scope of KOSA's duty-of-care requirements, enforcing protective defaults across all connected platforms in a single API call.",
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
        feature: "PCSS Policy Engine with 26 rule categories",
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
    relatedLaws: [
      { id: "coppa", name: "COPPA 2.0", href: "/compliance/coppa" },
      { id: "dsa", name: "EU DSA", href: "/compliance/dsa" },
    ],
  },

  coppa: {
    hero: {
      lawName: "Children's Online Privacy Protection Act 2.0",
      shortName: "COPPA 2.0",
      jurisdiction: "United States (Federal)",
      stage: "Passed Senate (Jul 2024)",
      stageColor: "passed",
      description: coppaLaw.summary,
    },
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
    relatedLaws: [
      { id: "kosa", name: "KOSA", href: "/compliance/kosa" },
      { id: "dsa", name: "EU DSA", href: "/compliance/dsa" },
    ],
  },

  dsa: {
    hero: {
      lawName: "Digital Services Act",
      shortName: "EU DSA",
      jurisdiction: "European Union",
      stage: "In force (Feb 2024)",
      stageColor: "enacted",
      description: dsaLaw.summary,
    },
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
    relatedLaws: [
      { id: "kosa", name: "KOSA", href: "/compliance/kosa" },
      { id: "coppa", name: "COPPA 2.0", href: "/compliance/coppa" },
    ],
  },
}
