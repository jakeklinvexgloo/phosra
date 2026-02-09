// Canonical types for the Phosra Global Compliance Law Registry
// This is the single source of truth for all child safety legislation data.

export type Jurisdiction =
  | "us-federal"
  | "us-state"
  | "eu"
  | "uk"
  | "asia-pacific"
  | "americas"
  | "middle-east-africa"

export type LawStatus =
  | "enacted"
  | "passed"
  | "pending"
  | "proposed"
  | "injunction"

export interface DetailedPageData {
  provisions: { title: string; description: string }[]
  phosraFeatures: {
    regulation: string
    phosraFeature: string
    ruleCategory?: string
    description: string
  }[]
  checklist: {
    requirement: string
    covered: boolean
    feature: string
  }[]
  customSections?: {
    id: string
    title: string
    content: string
  }[]
}

export interface LawEntry {
  /** URL slug — used as route param, e.g. "kosa", "uk-osa", "tx-scope" */
  id: string
  /** Short display name for badges/pills, e.g. "KOSA" */
  shortName: string
  /** Full legal title */
  fullName: string
  /** Human-readable jurisdiction, e.g. "United States (Federal)" */
  jurisdiction: string
  /** Machine-readable jurisdiction group for filtering */
  jurisdictionGroup: Jurisdiction
  /** ISO 3166-1 alpha-2 country code, e.g. "US", "GB", "AU" */
  country: string
  /** For US state laws, the state name */
  stateOrRegion?: string

  // Status
  status: LawStatus
  /** Human-readable status, e.g. "Signed into law (Sep 2024)" */
  statusLabel: string
  /** When the law takes/took effect */
  effectiveDate?: string
  /** Bill number or introduction date */
  introduced: string

  // Content
  /** 1-2 sentence summary */
  summary: string
  /** Bullet-point key provisions */
  keyProvisions: string[]

  // Phosra mapping
  /** IDs from Go models.go RuleCategory constants */
  ruleCategories: string[]
  /** Affected platforms */
  platforms: string[]
  /** MCP enforcement code snippet */
  mcpSnippet: string

  // Optional enrichment
  /** e.g. "Under 13", "Under 17", "All minors" */
  ageThreshold?: string
  /** e.g. "Up to 6% of global turnover" */
  penaltyRange?: string

  /** Full detailed page data — only for ~15 priority laws */
  detailedPage?: DetailedPageData

  /** IDs of related laws for cross-linking */
  relatedLawIds: string[]
  /** Searchable tags */
  tags: string[]
}

// Jurisdiction metadata for UI rendering
export const JURISDICTION_META: Record<
  Jurisdiction,
  { label: string; borderColor: string; bgColor: string; textColor: string }
> = {
  "us-federal": {
    label: "US Federal",
    borderColor: "border-l-blue-500",
    bgColor: "bg-blue-500/10",
    textColor: "text-blue-600",
  },
  "us-state": {
    label: "US State",
    borderColor: "border-l-amber-500",
    bgColor: "bg-amber-500/10",
    textColor: "text-amber-600",
  },
  eu: {
    label: "European Union",
    borderColor: "border-l-indigo-500",
    bgColor: "bg-indigo-500/10",
    textColor: "text-indigo-600",
  },
  uk: {
    label: "United Kingdom",
    borderColor: "border-l-red-500",
    bgColor: "bg-red-500/10",
    textColor: "text-red-600",
  },
  "asia-pacific": {
    label: "Asia-Pacific",
    borderColor: "border-l-green-500",
    bgColor: "bg-green-500/10",
    textColor: "text-green-600",
  },
  americas: {
    label: "Americas",
    borderColor: "border-l-cyan-500",
    bgColor: "bg-cyan-500/10",
    textColor: "text-cyan-600",
  },
  "middle-east-africa": {
    label: "Middle East & Africa",
    borderColor: "border-l-orange-500",
    bgColor: "bg-orange-500/10",
    textColor: "text-orange-600",
  },
}

export const STATUS_META: Record<
  LawStatus,
  { label: string; bgColor: string; textColor: string }
> = {
  enacted: {
    label: "Enacted",
    bgColor: "bg-brand-green/10",
    textColor: "text-brand-green",
  },
  passed: {
    label: "Passed",
    bgColor: "bg-amber-500/10",
    textColor: "text-amber-600",
  },
  pending: {
    label: "Pending",
    bgColor: "bg-zinc-500/10",
    textColor: "text-zinc-500",
  },
  proposed: {
    label: "Proposed",
    bgColor: "bg-slate-500/10",
    textColor: "text-slate-500",
  },
  injunction: {
    label: "Injunction",
    bgColor: "bg-red-500/10",
    textColor: "text-red-500",
  },
}
