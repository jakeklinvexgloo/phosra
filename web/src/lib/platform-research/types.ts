// ── Platform Research Types ─────────────────────────────────────

export type ResearchStatus = "pending" | "running" | "completed" | "failed" | "skipped"
export type ResearchTriggerType = "manual" | "scheduled" | "bulk"
export type LoginMethod = "email_password" | "oauth" | "api_key" | "manual" | "none"

/** Credentials for a single platform, stored in platform-credentials.local.json */
export interface PlatformCredentials {
  loginMethod: LoginMethod
  username?: string
  password?: string
  oauthToken?: string
  totpSecret?: string
  phone?: string
  loginUrl?: string
  parentalControlsUrl?: string
  extra?: Record<string, string>
  notes?: string
}

/** A screenshot captured during research */
export interface ResearchScreenshot {
  id: string
  label: string
  /** Relative path within screenshots storage */
  path: string
  /** Page URL where screenshot was taken */
  url: string
  timestamp: string
  /** Width in pixels */
  width: number
  /** Height in pixels */
  height: number
}

/** A discovered parental control capability */
export interface DiscoveredCapability {
  /** Rule category from Phosra's models.go (e.g. "screen_time_limit") */
  ruleCategory: string
  /** Human-readable description */
  description: string
  /** Where this was found */
  location: string
  /** How confident we are (0-1) */
  confidence: number
  /** Supporting screenshot IDs */
  screenshotIds: string[]
}

/** Structured notes from research */
export interface ResearchNotes {
  summary: string
  parentalControlsFound: boolean
  settingsLocation: string
  capabilities: DiscoveredCapability[]
  ageRestrictionOptions: string[]
  contentFilteringOptions: string[]
  screenTimeLimits: boolean
  purchaseControls: boolean
  privacySettings: string[]
  rawNotes: string
}

/** Full result from researching a single platform */
export interface ResearchResult {
  id: string
  platformId: string
  platformName: string
  status: ResearchStatus
  triggerType: ResearchTriggerType
  screenshots: ResearchScreenshot[]
  notes: ResearchNotes | null
  errorMessage?: string
  startedAt: string
  completedAt?: string
  durationMs?: number
}

/** Context passed to adapter during research */
export interface ResearchContext {
  platformId: string
  platformName: string
  credentials: PlatformCredentials
  screenshotDir: string
  /** Unique run ID for this research session */
  runId: string
}

/** Interface that each platform adapter must implement */
export interface PlatformResearchAdapter {
  platformId: string
  platformName: string

  /** Navigate to login page and authenticate */
  login(ctx: ResearchContext, page: PlaywrightPage): Promise<void>

  /** Navigate to parental controls / family settings */
  navigateToParentalControls(ctx: ResearchContext, page: PlaywrightPage): Promise<void>

  /** Take screenshots of all relevant settings pages */
  captureScreenshots(ctx: ResearchContext, page: PlaywrightPage): Promise<ResearchScreenshot[]>

  /** Extract structured notes from the page */
  extractNotes(ctx: ResearchContext, page: PlaywrightPage): Promise<ResearchNotes>
}

/** Minimal Playwright page interface to avoid hard dependency */
export interface PlaywrightPage {
  goto(url: string, options?: { waitUntil?: "load" | "domcontentloaded" | "networkidle"; timeout?: number }): Promise<unknown>
  click(selector: string, options?: { timeout?: number }): Promise<void>
  fill(selector: string, value: string): Promise<void>
  type(selector: string, value: string, options?: { delay?: number }): Promise<void>
  waitForSelector(selector: string, options?: { timeout?: number; state?: "visible" | "hidden" | "attached" | "detached" }): Promise<unknown>
  waitForTimeout(ms: number): Promise<void>
  waitForNavigation(options?: { timeout?: number; waitUntil?: "load" | "domcontentloaded" | "networkidle" }): Promise<unknown>
  waitForURL(url: string | RegExp, options?: { timeout?: number }): Promise<void>
  screenshot(options?: { path?: string; fullPage?: boolean }): Promise<Buffer>
  url(): string
  title(): Promise<string>
  content(): Promise<string>
  $(selector: string): Promise<unknown | null>
  $$(selector: string): Promise<unknown[]>
  evaluate<T>(fn: string | ((...args: unknown[]) => T), ...args: unknown[]): Promise<T>
  keyboard: { press(key: string): Promise<void> }
}

/** A research run tracking bulk/scheduled research sessions */
export interface ResearchRun {
  id: string
  triggerType: ResearchTriggerType
  status: ResearchStatus
  platformIds: string[]
  completedCount: number
  failedCount: number
  totalCount: number
  startedAt: string
  completedAt?: string
}

/** Diff between research findings and current registry */
export interface RegistryDiff {
  platformId: string
  platformName: string
  newCapabilities: DiscoveredCapability[]
  removedCapabilities: string[]
  changedCapabilities: {
    ruleCategory: string
    currentDescription: string
    researchDescription: string
  }[]
  unchanged: string[]
}

/** Stats for the research dashboard */
export interface ResearchStats {
  totalPlatforms: number
  researched: number
  inProgress: number
  failed: number
  notStarted: number
  lastRunAt?: string
  avgDurationMs?: number
}

// ── Status Display Helpers ──────────────────────────────────────

export const RESEARCH_STATUS_META: Record<ResearchStatus, { label: string; color: string; dotColor: string }> = {
  pending: { label: "Pending", color: "bg-muted text-muted-foreground", dotColor: "bg-muted-foreground" },
  running: { label: "Running", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300", dotColor: "bg-blue-500" },
  completed: { label: "Completed", color: "bg-brand-green/10 text-brand-green", dotColor: "bg-brand-green" },
  failed: { label: "Failed", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300", dotColor: "bg-red-500" },
  skipped: { label: "Skipped", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300", dotColor: "bg-amber-500" },
}
