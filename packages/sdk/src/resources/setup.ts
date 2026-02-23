import type { BaseClient } from "../client.js";
import type { QuickSetupRequest, QuickSetupResponse } from "../types.js";

export class SetupResource {
  constructor(private client: BaseClient) {}

  /**
   * One-step onboarding: creates a family, adds a child, generates
   * age-appropriate policy rules, and activates the policy.
   *
   * If `family_id` is provided, uses that existing family.
   * `strictness` defaults to 'recommended'.
   */
  async quick(params: QuickSetupRequest): Promise<QuickSetupResponse> {
    return this.client.request<QuickSetupResponse>("POST", "/setup/quick", {
      body: params,
    });
  }
}
