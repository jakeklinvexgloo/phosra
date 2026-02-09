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
  { label: string; borderColor: string; bgColor: string; textColor: string; accentColor: string }
> = {
  "us-federal": {
    label: "US Federal",
    borderColor: "border-l-border",
    bgColor: "bg-muted",
    textColor: "text-muted-foreground",
    accentColor: "bg-border",
  },
  "us-state": {
    label: "US State",
    borderColor: "border-l-border",
    bgColor: "bg-muted",
    textColor: "text-muted-foreground",
    accentColor: "bg-border",
  },
  eu: {
    label: "European Union",
    borderColor: "border-l-border",
    bgColor: "bg-muted",
    textColor: "text-muted-foreground",
    accentColor: "bg-border",
  },
  uk: {
    label: "United Kingdom",
    borderColor: "border-l-border",
    bgColor: "bg-muted",
    textColor: "text-muted-foreground",
    accentColor: "bg-border",
  },
  "asia-pacific": {
    label: "Asia-Pacific",
    borderColor: "border-l-border",
    bgColor: "bg-muted",
    textColor: "text-muted-foreground",
    accentColor: "bg-border",
  },
  americas: {
    label: "Americas",
    borderColor: "border-l-border",
    bgColor: "bg-muted",
    textColor: "text-muted-foreground",
    accentColor: "bg-border",
  },
  "middle-east-africa": {
    label: "Middle East & Africa",
    borderColor: "border-l-border",
    bgColor: "bg-muted",
    textColor: "text-muted-foreground",
    accentColor: "bg-border",
  },
}

export const STATUS_META: Record<
  LawStatus,
  { label: string; bgColor: string; textColor: string; dotColor: string }
> = {
  enacted: {
    label: "Enacted",
    bgColor: "bg-foreground/5",
    textColor: "text-foreground",
    dotColor: "bg-foreground",
  },
  passed: {
    label: "Passed",
    bgColor: "bg-foreground/5",
    textColor: "text-muted-foreground",
    dotColor: "bg-muted-foreground",
  },
  pending: {
    label: "Pending",
    bgColor: "bg-foreground/5",
    textColor: "text-muted-foreground",
    dotColor: "bg-muted-foreground/50",
  },
  proposed: {
    label: "Proposed",
    bgColor: "bg-foreground/5",
    textColor: "text-muted-foreground",
    dotColor: "bg-muted-foreground/50",
  },
  injunction: {
    label: "Injunction",
    bgColor: "bg-foreground/5",
    textColor: "text-muted-foreground",
    dotColor: "bg-muted-foreground",
  },
}
