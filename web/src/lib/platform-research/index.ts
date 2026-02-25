// ── Platform Research — Barrel Exports ──────────────────────────

// Types
export type {
  ResearchStatus,
  ResearchTriggerType,
  LoginMethod,
  PlatformCredentials,
  ResearchScreenshot,
  DiscoveredCapability,
  ResearchNotes,
  ResearchResult,
  ResearchContext,
  PlatformResearchAdapter,
  PlaywrightPage,
  ResearchRun,
  RegistryDiff,
  ResearchStats,
} from "./types"

export { RESEARCH_STATUS_META } from "./types"

// Base adapter
export { BaseResearchAdapter } from "./base-adapter"

// Credentials
export {
  loadCredentials,
  getCredentials,
  getConfiguredPlatformIds,
  credentialsFileExists,
} from "./credentials-loader"

// Adapter registry
export {
  getAdapter,
  getAdapterPlatformIds,
  hasAdapter,
} from "./adapter-registry"

// Runner
export {
  researchPlatform,
  researchPlatforms,
} from "./runner"
