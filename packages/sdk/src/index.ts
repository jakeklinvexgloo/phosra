// ────────────────────────────────────────────────────────────────────────────
// @phosra/sdk — Official TypeScript SDK for the Phosra child safety API
// ────────────────────────────────────────────────────────────────────────────

import { BaseClient } from "./client.js";
import type { PhosraClientConfig } from "./types.js";

import { AuthResource } from "./resources/auth.js";
import { FamiliesResource } from "./resources/families.js";
import { ChildrenResource } from "./resources/children.js";
import { MembersResource } from "./resources/members.js";
import { PoliciesResource } from "./resources/policies.js";
import { RulesResource } from "./resources/rules.js";
import { EnforcementResource } from "./resources/enforcement.js";
import { PlatformsResource } from "./resources/platforms.js";
import { ComplianceResource } from "./resources/compliance.js";
import { WebhooksResource } from "./resources/webhooks.js";
import { RatingsResource } from "./resources/ratings.js";
import { StandardsResource } from "./resources/standards.js";
import { SetupResource } from "./resources/setup.js";
import { DevicesResource } from "./resources/devices.js";
import { ReportsResource } from "./resources/reports.js";
import { SourcesResource } from "./resources/sources.js";

/**
 * Main entry point for the Phosra SDK.
 *
 * @example User-authenticated client
 * ```ts
 * const phosra = new PhosraClient({ accessToken: 'eyJ...' });
 * const families = await phosra.families.list();
 * ```
 *
 * @example Device-authenticated client
 * ```ts
 * const phosra = PhosraClient.forDevice({ deviceKey: 'dk_...' });
 * const policy = await phosra.devices.getPolicy();
 * ```
 *
 * @example With token refresh
 * ```ts
 * const phosra = new PhosraClient({
 *   accessToken: 'eyJ...',
 *   onTokenExpired: async () => {
 *     const tokens = await phosra.auth.refresh({ refresh_token: storedRefreshToken });
 *     storedRefreshToken = tokens.refresh_token;
 *     return tokens.access_token;
 *   },
 * });
 * ```
 */
export class PhosraClient {
  /** Authentication: register, login, refresh, logout, me. */
  readonly auth: AuthResource;
  /** Family groups: CRUD operations. */
  readonly families: FamiliesResource;
  /** Children within families: CRUD and age ratings. */
  readonly children: ChildrenResource;
  /** Family members: list, invite, remove. */
  readonly members: MembersResource;
  /** Child policies: CRUD, activate, pause, generate from age. */
  readonly policies: PoliciesResource;
  /** Policy rules: CRUD and bulk upsert. */
  readonly rules: RulesResource;
  /** Enforcement: trigger, monitor jobs, get results. */
  readonly enforcement: EnforcementResource;
  /** Platforms: list and filter available integrations. */
  readonly platforms: PlatformsResource;
  /** Compliance links: connect/disconnect platforms, verify credentials. */
  readonly compliance: ComplianceResource;
  /** Webhooks: CRUD, test, delivery history. */
  readonly webhooks: WebhooksResource;
  /** Content ratings: systems, age-based lookups, cross-system conversion. */
  readonly ratings: RatingsResource;
  /** Community standards: browse, adopt, remove. */
  readonly standards: StandardsResource;
  /** Quick setup: one-step onboarding. */
  readonly setup: SetupResource;
  /** Devices: register, manage, and device-auth policy/reporting. */
  readonly devices: DevicesResource;
  /** Reports: family overview dashboard. */
  readonly reports: ReportsResource;
  /** Sources: connect and sync parental control apps. */
  readonly sources: SourcesResource;

  private readonly _client: BaseClient;

  constructor(config: PhosraClientConfig = {}) {
    this._client = new BaseClient(config);

    this.auth = new AuthResource(this._client);
    this.families = new FamiliesResource(this._client);
    this.children = new ChildrenResource(this._client);
    this.members = new MembersResource(this._client);
    this.policies = new PoliciesResource(this._client);
    this.rules = new RulesResource(this._client);
    this.enforcement = new EnforcementResource(this._client);
    this.platforms = new PlatformsResource(this._client);
    this.compliance = new ComplianceResource(this._client);
    this.webhooks = new WebhooksResource(this._client);
    this.ratings = new RatingsResource(this._client);
    this.standards = new StandardsResource(this._client);
    this.setup = new SetupResource(this._client);
    this.devices = new DevicesResource(this._client);
    this.reports = new ReportsResource(this._client);
    this.sources = new SourcesResource(this._client);
  }

  /**
   * Update the access token on the underlying client.
   * Useful after token refresh or login.
   */
  setAccessToken(token: string): void {
    this._client.setAccessToken(token);
  }

  /**
   * Create a client configured for device authentication.
   * Uses the X-Device-Key header instead of Bearer token.
   */
  static forDevice(config: {
    baseUrl?: string;
    deviceKey: string;
  }): PhosraClient {
    return new PhosraClient({
      baseUrl: config.baseUrl,
      deviceKey: config.deviceKey,
    });
  }
}

// ── Re-exports ───────────────────────────────────────────────────────────────

// Types
export type {
  PhosraClientConfig,
  RequestOptions,
  User,
  TokenPair,
  Family,
  FamilyRole,
  FamilyMember,
  Child,
  PolicyStatus,
  ChildPolicy,
  RuleCategory,
  PolicyRule,
  BulkRuleInput,
  PlatformCategory,
  ComplianceLevel,
  Platform,
  ComplianceLinkStatus,
  ComplianceLink,
  EnforcementStatus,
  EnforcementJob,
  EnforcementResult,
  RatingSystem,
  Rating,
  AgeRatings,
  Webhook,
  WebhookDelivery,
  StandardRule,
  Standard,
  StandardAdoption,
  Strictness,
  QuickSetupRequest,
  RuleSummary,
  QuickSetupResponse,
  DeviceRegistration,
  CompiledPolicy,
  DeviceReport,
  FamilyOverview,
  Source,
  SourceCapabilityEntry,
  SourceSyncJob,
  SourceSyncResult,
  AvailableSource,
  GuidedStep,
} from "./types.js";

// Errors
export {
  PhosraError,
  PhosraApiError,
  PhosraAuthError,
  PhosraNotFoundError,
  PhosraValidationError,
  PhosraRateLimitError,
} from "./errors.js";

// Base client (for advanced use)
export { BaseClient } from "./client.js";

// Resource classes (for advanced use / composition)
export { AuthResource } from "./resources/auth.js";
export { FamiliesResource } from "./resources/families.js";
export { ChildrenResource } from "./resources/children.js";
export { MembersResource } from "./resources/members.js";
export { PoliciesResource } from "./resources/policies.js";
export { RulesResource } from "./resources/rules.js";
export { EnforcementResource } from "./resources/enforcement.js";
export { PlatformsResource } from "./resources/platforms.js";
export { ComplianceResource } from "./resources/compliance.js";
export { WebhooksResource } from "./resources/webhooks.js";
export { RatingsResource } from "./resources/ratings.js";
export { StandardsResource } from "./resources/standards.js";
export { SetupResource } from "./resources/setup.js";
export { DevicesResource } from "./resources/devices.js";
export { ReportsResource } from "./resources/reports.js";
export { SourcesResource } from "./resources/sources.js";
