export interface GlossaryEntry {
  id: string
  term: string
  definition: string
  category: "legislation" | "technology" | "policy" | "compliance"
  relatedTerms: string[]
  relatedLawIds: string[]
}

export const GLOSSARY: GlossaryEntry[] = [
  // ── Legislation ───────────────────────────────────────────────────────
  {
    id: "aadc",
    term: "AADC (Age Appropriate Design Code)",
    definition:
      "The UK Age Appropriate Design Code, also known as the Children's Code, is a set of 15 standards that online services likely to be accessed by children must follow. It requires platforms to provide high privacy settings by default, minimize data collection, and switch off geolocation tracking for child users. California's version (AB 2273) applies similar principles to US platforms.",
    category: "legislation",
    relatedTerms: ["privacy-by-design", "age-assurance", "data-minimization"],
    relatedLawIds: ["uk-aadc", "ca-sb-976"],
  },
  {
    id: "coppa",
    term: "COPPA (Children's Online Privacy Protection Act)",
    definition:
      "A US federal law enacted in 1998 that imposes requirements on operators of websites and online services directed at children under 13. COPPA requires verifiable parental consent before collecting, using, or disclosing personal information from children. It also mandates clear privacy policies and gives parents control over their children's data.",
    category: "legislation",
    relatedTerms: ["coppa-2", "verifiable-parental-consent", "ftc-coppa-rule"],
    relatedLawIds: ["ftc-coppa"],
  },
  {
    id: "coppa-2",
    term: "COPPA 2.0",
    definition:
      "Proposed legislation that would update the original COPPA by raising the age threshold to 17, banning targeted advertising to minors, and expanding the types of personal information protected. COPPA 2.0 aims to address how children's online experiences have evolved since the original law was passed in 1998, covering social media, gaming, and AI-powered services.",
    category: "legislation",
    relatedTerms: ["coppa", "ftc-coppa-rule", "verifiable-parental-consent"],
    relatedLawIds: ["coppa-2"],
  },
  {
    id: "coppa-safe-harbor",
    term: "COPPA Safe Harbor",
    definition:
      "An FTC-approved self-regulatory program that allows industry groups to create guidelines for COPPA compliance. Companies that participate in an approved Safe Harbor program are subject to the program's oversight rather than direct FTC enforcement. Safe Harbor programs must provide substantially similar protections to COPPA and include monitoring, disciplinary, and reporting mechanisms.",
    category: "legislation",
    relatedTerms: ["coppa", "ftc-coppa-rule", "compliance-audit"],
    relatedLawIds: ["ftc-coppa"],
  },
  {
    id: "dsa",
    term: "DSA (Digital Services Act)",
    definition:
      "The European Union's Digital Services Act is a comprehensive regulation governing digital platforms operating in the EU. It requires platforms to assess and mitigate systemic risks to minors, ban targeted advertising to children based on profiling, provide transparent recommendation systems, and conduct independent audits. Very large online platforms face the strictest obligations.",
    category: "legislation",
    relatedTerms: ["algorithmic-audit", "transparency-report", "dark-patterns"],
    relatedLawIds: ["eu-dsa"],
  },
  {
    id: "ftc-coppa-rule",
    term: "FTC COPPA Rule",
    definition:
      "The Federal Trade Commission's regulation implementing COPPA, which defines how operators must comply with the statute. The rule specifies acceptable methods of verifiable parental consent, data retention limits, and confidentiality requirements. The FTC updated the rule in 2024 to strengthen protections around push notifications, targeted advertising, and educational technology data practices.",
    category: "legislation",
    relatedTerms: ["coppa", "coppa-2", "verifiable-parental-consent"],
    relatedLawIds: ["ftc-coppa"],
  },
  {
    id: "kosa",
    term: "KOSA (Kids Online Safety Act)",
    definition:
      "A US federal bill that would impose a duty of care on covered platforms to act in the best interests of minors. KOSA requires platforms to enable the strongest privacy and safety settings by default for users under 17, provide parental tools, and conduct annual independent audits. It addresses harms including promotion of self-harm, cyberbullying, and exploitation.",
    category: "legislation",
    relatedTerms: ["duty-of-care", "algorithmic-audit", "digital-wellbeing"],
    relatedLawIds: ["kosa"],
  },

  // ── Technology ────────────────────────────────────────────────────────
  {
    id: "addictive-design",
    term: "Addictive Design",
    definition:
      "Interface patterns and features intentionally designed to maximize user engagement and time spent on a platform, often at the expense of user wellbeing. Examples include infinite scroll, autoplay, streak mechanics, and variable-ratio reinforcement (like pull-to-refresh). Several child safety laws now specifically target addictive design features when applied to minor users.",
    category: "technology",
    relatedTerms: ["dark-patterns", "digital-wellbeing", "screen-time"],
    relatedLawIds: ["kosa", "ca-social-media-addiction"],
  },
  {
    id: "age-assurance",
    term: "Age Assurance",
    definition:
      "An umbrella term encompassing all methods used to determine or estimate a user's age, including age verification, age estimation, and self-declaration. Age assurance measures may range from simple date-of-birth entry to document-based verification or AI-powered facial analysis. Regulators increasingly require some form of age assurance for platforms accessible to children.",
    category: "technology",
    relatedTerms: ["age-verification", "age-estimation", "age-gating"],
    relatedLawIds: ["uk-aadc", "eu-dsa", "au-osa"],
  },
  {
    id: "age-estimation",
    term: "Age Estimation",
    definition:
      "Technology that estimates a user's age range without requiring them to provide identity documents. Common methods include facial age analysis using AI, behavioral analysis, and device-level signals. Age estimation provides a privacy-preserving alternative to document-based age verification, though it is less precise and typically determines an age range rather than exact age.",
    category: "technology",
    relatedTerms: ["age-assurance", "age-verification", "age-gating"],
    relatedLawIds: ["uk-aadc", "eu-dsa"],
  },
  {
    id: "age-gating",
    term: "Age Gating",
    definition:
      "A mechanism that restricts access to content, features, or entire platforms based on a user's age. Age gates can be implemented through self-declaration (entering a date of birth), parental consent flows, or technical verification methods. While simple age gates like date-of-birth fields are easy to bypass, more robust implementations combine multiple signals for higher confidence.",
    category: "technology",
    relatedTerms: ["age-assurance", "age-verification", "age-estimation"],
    relatedLawIds: ["ftc-coppa", "ar-age-verify"],
  },
  {
    id: "age-verification",
    term: "Age Verification",
    definition:
      "The process of confirming a user's exact age or that they meet a minimum age threshold, typically using identity documents, credit card checks, or government ID databases. Age verification provides higher confidence than age estimation but raises privacy concerns about data collection. Several US states and international jurisdictions now mandate age verification for certain online platforms.",
    category: "technology",
    relatedTerms: ["age-assurance", "age-estimation", "age-gating"],
    relatedLawIds: ["ar-age-verify", "la-act-456", "uk-osa"],
  },
  {
    id: "algorithmic-amplification",
    term: "Algorithmic Amplification",
    definition:
      "The use of recommendation algorithms to promote and increase the visibility of content to users, often prioritizing engagement metrics over user wellbeing. When applied to minor users, algorithmic amplification can surface harmful content including self-harm material, eating disorder content, and extremism. Multiple child safety laws now require platforms to disable or limit algorithmic amplification for minors.",
    category: "technology",
    relatedTerms: ["content-filtering", "content-moderation", "algorithmic-audit"],
    relatedLawIds: ["kosa", "eu-dsa", "uk-osa"],
  },
  {
    id: "content-filtering",
    term: "Content Filtering",
    definition:
      "Automated systems that screen, block, or restrict access to content deemed inappropriate for certain audiences. Content filtering for child safety may operate at the platform level (blocking harmful search results), device level (parental control apps), or network level (ISP-based filters). Modern filtering systems use AI classification models alongside keyword and hash-matching approaches.",
    category: "technology",
    relatedTerms: ["content-moderation", "age-gating", "algorithmic-amplification"],
    relatedLawIds: ["cipa", "uk-osa"],
  },
  {
    id: "content-moderation",
    term: "Content Moderation",
    definition:
      "The practice of monitoring and reviewing user-generated content to enforce platform policies and legal requirements. Content moderation combines automated detection systems with human review to identify and act on harmful material such as child sexual abuse material (CSAM), cyberbullying, and age-inappropriate content. Platforms must balance effective moderation with free expression concerns.",
    category: "technology",
    relatedTerms: ["content-filtering", "transparency-report", "algorithmic-amplification"],
    relatedLawIds: ["eu-dsa", "uk-osa", "au-osa"],
  },
  {
    id: "dark-patterns",
    term: "Dark Patterns",
    definition:
      "User interface designs that manipulate users into making choices they would not otherwise make, such as sharing more personal data, disabling privacy settings, or continuing to use a service. In the context of child safety, dark patterns include making privacy controls difficult to find, using confusing language in consent flows, and employing emotional manipulation to prevent account deletion. The EU DSA and California AADC specifically prohibit dark patterns targeting minors.",
    category: "technology",
    relatedTerms: ["addictive-design", "privacy-by-design", "data-minimization"],
    relatedLawIds: ["eu-dsa", "uk-aadc", "ca-sb-976"],
  },

  // ── Policy ────────────────────────────────────────────────────────────
  {
    id: "data-minimization",
    term: "Data Minimization",
    definition:
      "The principle that organizations should collect only the minimum amount of personal data necessary for a specific, stated purpose. For child safety, data minimization means platforms should not collect children's data beyond what is needed to provide the core service. This principle is embedded in COPPA, GDPR Article 8, the UK AADC, and numerous state-level children's privacy laws.",
    category: "policy",
    relatedTerms: ["privacy-by-design", "dpia", "coppa"],
    relatedLawIds: ["ftc-coppa", "gdpr-art-8", "uk-aadc"],
  },
  {
    id: "digital-wellbeing",
    term: "Digital Wellbeing",
    definition:
      "A holistic framework for ensuring that technology use supports rather than harms a person's mental health, social development, and physical health. For children, digital wellbeing encompasses screen time management, protection from harmful content, age-appropriate design, and prevention of addictive engagement patterns. Multiple child safety laws now reference digital wellbeing as a core objective.",
    category: "policy",
    relatedTerms: ["screen-time", "duty-of-care", "addictive-design"],
    relatedLawIds: ["kosa", "uk-aadc"],
  },
  {
    id: "dpia",
    term: "Data Protection Impact Assessment (DPIA)",
    definition:
      "A formal process for evaluating the potential privacy risks of a data processing activity before it is implemented. Under the UK AADC and GDPR, platforms must conduct DPIAs when launching new services or features that process children's data. The assessment must identify risks, evaluate their severity, and document mitigation measures. DPIAs are a key compliance tool for demonstrating accountability.",
    category: "policy",
    relatedTerms: ["privacy-by-design", "data-minimization", "compliance-audit"],
    relatedLawIds: ["uk-aadc", "gdpr-art-8"],
  },
  {
    id: "duty-of-care",
    term: "Duty of Care",
    definition:
      "A legal obligation requiring platforms to take reasonable steps to prevent foreseeable harm to their users, particularly children. In the child safety context, duty of care means platforms must proactively identify risks to minors and implement safeguards rather than merely reacting to reported harms. KOSA, the UK Online Safety Act, and Australia's Online Safety Act all impose forms of duty of care on covered platforms.",
    category: "policy",
    relatedTerms: ["kosa", "digital-wellbeing", "transparency-report"],
    relatedLawIds: ["kosa", "uk-osa", "au-osa"],
  },
  {
    id: "parental-consent",
    term: "Parental Consent",
    definition:
      "Authorization from a parent or legal guardian before a platform can collect, use, or disclose a child's personal information. Parental consent is a cornerstone of COPPA and most child privacy laws worldwide. The specific mechanisms for obtaining consent vary by jurisdiction and may include signed forms, credit card verification, video calls, or knowledge-based authentication.",
    category: "policy",
    relatedTerms: ["verifiable-parental-consent", "coppa", "age-gating"],
    relatedLawIds: ["ftc-coppa", "coppa-2", "gdpr-art-8"],
  },
  {
    id: "privacy-by-design",
    term: "Privacy by Design",
    definition:
      "An approach to system engineering that embeds privacy protections into the design and architecture of products from the outset, rather than adding them as an afterthought. For child-directed services, privacy by design means building age-appropriate defaults, minimizing data collection, and ensuring safety controls are integral to the user experience. The UK AADC explicitly requires privacy by design for services accessed by children.",
    category: "policy",
    relatedTerms: ["data-minimization", "dpia", "aadc"],
    relatedLawIds: ["uk-aadc", "gdpr-art-8", "ca-sb-976"],
  },
  {
    id: "screen-time",
    term: "Screen Time",
    definition:
      "The amount of time a user spends actively engaged with a digital device or platform. In child safety policy, screen time management refers to tools and regulations that help parents and children monitor and limit device or app usage. Several laws now require platforms to provide screen time dashboards, usage alerts, and time-limit features for minor users.",
    category: "policy",
    relatedTerms: ["digital-wellbeing", "parental-consent", "addictive-design"],
    relatedLawIds: ["kosa", "ut-smra", "ca-sb-976"],
  },
  {
    id: "verifiable-parental-consent",
    term: "Verifiable Parental Consent (VPC)",
    definition:
      "A specific requirement under COPPA that operators must use a reasonable method to ensure the person providing consent is actually the child's parent or guardian. Acceptable VPC methods include signed consent forms, credit card transactions, government ID verification, video conferencing, and knowledge-based authentication. The FTC's 2024 rule update added new approved methods and tightened existing requirements.",
    category: "policy",
    relatedTerms: ["parental-consent", "coppa", "ftc-coppa-rule"],
    relatedLawIds: ["ftc-coppa", "coppa-2"],
  },

  // ── Compliance ────────────────────────────────────────────────────────
  {
    id: "algorithmic-audit",
    term: "Algorithmic Audit",
    definition:
      "An independent assessment of a platform's algorithms to evaluate their impact on users, particularly minors. Algorithmic audits examine recommendation systems, content ranking, and personalization engines to identify potential harms such as amplification of harmful content or discriminatory outcomes. KOSA, the EU DSA, and the EU AI Act all include provisions requiring algorithmic audits for platforms serving minors.",
    category: "compliance",
    relatedTerms: ["algorithmic-amplification", "compliance-audit", "transparency-report"],
    relatedLawIds: ["kosa", "eu-dsa", "eu-ai-act"],
  },
  {
    id: "compliance-audit",
    term: "Compliance Audit",
    definition:
      "A systematic review of an organization's adherence to regulatory requirements, industry standards, or internal policies. In child safety, compliance audits verify that platforms correctly implement age verification, parental consent, data handling, and content moderation requirements. Audits may be conducted internally or by independent third parties, and several laws mandate annual compliance audits for covered platforms.",
    category: "compliance",
    relatedTerms: ["algorithmic-audit", "dpia", "transparency-report"],
    relatedLawIds: ["kosa", "eu-dsa", "uk-osa"],
  },
  {
    id: "pcss",
    term: "PCSS (Phosra Child Safety Specification)",
    definition:
      "Phosra's proprietary framework that maps platform safety policies to 45 standardized rule categories derived from global child safety legislation. The PCSS provides a unified compliance language that translates legal requirements from COPPA, KOSA, the EU DSA, and other laws into actionable technical specifications. Platforms can use the PCSS to audit their compliance posture across all applicable jurisdictions simultaneously.",
    category: "compliance",
    relatedTerms: ["rule-category", "compliance-audit", "duty-of-care"],
    relatedLawIds: ["kosa", "ftc-coppa", "eu-dsa", "uk-aadc"],
  },
  {
    id: "rule-category",
    term: "Rule Category",
    definition:
      "A standardized classification within the Phosra Child Safety Specification (PCSS) that represents a specific type of child safety requirement. There are 45 rule categories covering areas such as age verification, parental consent, content moderation, data handling, and algorithmic transparency. Each rule category maps to one or more provisions across multiple laws, enabling cross-jurisdictional compliance tracking.",
    category: "compliance",
    relatedTerms: ["pcss", "compliance-audit", "algorithmic-audit"],
    relatedLawIds: ["kosa", "ftc-coppa", "eu-dsa"],
  },
  {
    id: "transparency-report",
    term: "Transparency Report",
    definition:
      "A public disclosure document in which platforms report data about their content moderation activities, government requests for user data, policy enforcement actions, and algorithmic impact assessments. Multiple child safety laws now mandate transparency reports specifically addressing how platforms protect minor users. These reports typically must be published on a regular schedule and include standardized metrics.",
    category: "compliance",
    relatedTerms: ["compliance-audit", "algorithmic-audit", "content-moderation"],
    relatedLawIds: ["eu-dsa", "uk-osa", "au-osa"],
  },
]

// Helper: get all unique categories
export const GLOSSARY_CATEGORIES = [
  "all",
  "legislation",
  "technology",
  "policy",
  "compliance",
] as const

export type GlossaryCategory = (typeof GLOSSARY_CATEGORIES)[number]

// Helper: get terms sorted alphabetically
export function getSortedGlossary(): GlossaryEntry[] {
  return [...GLOSSARY].sort((a, b) => a.term.localeCompare(b.term))
}

// Helper: get available letters
export function getAvailableLetters(entries: GlossaryEntry[]): string[] {
  const letters = new Set(entries.map((e) => e.term[0].toUpperCase()))
  return Array.from(letters).sort()
}

// Helper: group by first letter
export function groupByLetter(
  entries: GlossaryEntry[]
): Record<string, GlossaryEntry[]> {
  const groups: Record<string, GlossaryEntry[]> = {}
  for (const entry of entries) {
    const letter = entry.term[0].toUpperCase()
    if (!groups[letter]) groups[letter] = []
    groups[letter].push(entry)
  }
  return groups
}
