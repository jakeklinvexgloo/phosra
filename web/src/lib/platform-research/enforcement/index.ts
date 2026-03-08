// ── Enforcement Infrastructure ────────────────────────────────────

// Types
export type {
  EnforcementContext,
  PolicyRule,
  RuleEnforcementResult,
  RuleVerificationResult,
  EnforcementResult,
  SelectorStrategy,
  BrowserEnforcementAdapter,
} from "./types"
export { EnforcementError, AGE_RATING_MAP, resolveRating } from "./types"

// Base adapter
export { BaseEnforcementAdapter } from "./base-enforcement-adapter"

// Credential vault
export {
  saveCredentials,
  loadCredentials,
  listPlatforms,
  removeCredentials,
  loadCredentialsFromFile,
} from "./credential-vault"

// Registry
export {
  getEnforcementAdapter,
  getEnforcementAdapterIds,
  hasEnforcementAdapter,
} from "./enforcement-registry"

// Orchestrator
export { enforce } from "./enforcer"
export type { EnforceOptions } from "./enforcer"
