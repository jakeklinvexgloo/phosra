import type { PlaywrightPage, PlatformCredentials, ResearchScreenshot } from "../types"

// Re-export for convenience
export type { PlaywrightPage, PlatformCredentials, ResearchScreenshot }

export interface EnforcementContext {
  platformId: string
  platformName: string
  credentials: PlatformCredentials
  childName: string
  childAge: number
  screenshotDir: string
  runId: string
  sessionCachePath?: string
}

export interface PolicyRule {
  category: string                    // PCSS rule category (e.g., "content_rating")
  config: Record<string, unknown>     // Rule-specific config (e.g., { maxRating: "PG" })
}

export interface RuleEnforcementResult {
  ruleCategory: string
  status: "applied" | "skipped" | "failed" | "unsupported"
  reason?: string
  previousValue?: string
  newValue?: string
  screenshot?: ResearchScreenshot
  details?: Record<string, unknown>
}

export interface RuleVerificationResult {
  ruleCategory: string
  verified: boolean
  currentValue?: string
  expectedValue?: string
  screenshot?: ResearchScreenshot
}

export interface EnforcementResult {
  platformId: string
  childName: string
  childAge: number
  applied: number
  skipped: number
  failed: number
  rules: RuleEnforcementResult[]
  screenshots: ResearchScreenshot[]
  startedAt: string
  completedAt: string
  durationMs: number
}

export interface SelectorStrategy {
  primary: string
  fallbacks: string[]
  textMatch?: string
  lastVerified?: string
}

// The core interface every enforcement adapter must implement
export interface BrowserEnforcementAdapter {
  platformId: string
  platformName: string

  supportedRuleCategories(): string[]

  login(ctx: EnforcementContext, page: PlaywrightPage): Promise<void>

  getCurrentConfig(
    ctx: EnforcementContext,
    page: PlaywrightPage
  ): Promise<Record<string, unknown>>

  enforceRule(
    ctx: EnforcementContext,
    page: PlaywrightPage,
    rule: PolicyRule
  ): Promise<RuleEnforcementResult>

  verifyRule(
    ctx: EnforcementContext,
    page: PlaywrightPage,
    rule: PolicyRule
  ): Promise<RuleVerificationResult>

  revokeRule(
    ctx: EnforcementContext,
    page: PlaywrightPage,
    rule: PolicyRule
  ): Promise<RuleEnforcementResult>
}

// Age-to-rating mapping for PCSS content_rating rule
export const AGE_RATING_MAP: Record<string, Record<number, string>> = {
  netflix: { 0: "Little Kids", 7: "Older Kids", 13: "Teens", 17: "All Maturity" },
  youtube: { 0: "restricted", 13: "moderate", 18: "unrestricted" },
  roblox: { 0: "All Ages", 9: "9+", 13: "13+", 17: "17+" },
  "disney-plus": { 0: "TV-Y", 7: "TV-G", 13: "TV-PG", 17: "TV-14" },
  tiktok: { 0: "restricted", 13: "moderate", 18: "unrestricted" },
}

// Resolve the appropriate rating for a child's age on a given platform
export function resolveRating(platformId: string, childAge: number): string {
  const map = AGE_RATING_MAP[platformId]
  if (!map) return "restricted"
  const thresholds = Object.keys(map).map(Number).sort((a, b) => b - a)
  for (const t of thresholds) {
    if (childAge >= t) return map[t]
  }
  return map[0] ?? "restricted"
}

// Error class for enforcement failures
export class EnforcementError extends Error {
  constructor(
    message: string,
    public code: "captcha" | "rate_limit" | "session_expired" | "ui_changed" |
                 "mfa_required" | "network" | "invalid_creds" | "account_locked" | "selector_not_found",
    public recoverable: boolean,
    public screenshotPath?: string,
  ) {
    super(message)
    this.name = "EnforcementError"
  }
}
