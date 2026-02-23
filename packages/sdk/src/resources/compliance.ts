import type { BaseClient } from "../client.js";
import type { ComplianceLink } from "../types.js";

export class ComplianceResource {
  constructor(private client: BaseClient) {}

  /**
   * List all platform connections for a family.
   */
  async list(familyId: string): Promise<ComplianceLink[]> {
    return this.client.request<ComplianceLink[]>(
      "GET",
      `/families/${familyId}/compliance`,
    );
  }

  /**
   * Connect a platform to the family by providing credentials for verification.
   */
  async create(params: {
    family_id: string;
    platform_id: string;
    credentials: string | Record<string, unknown>;
  }): Promise<ComplianceLink> {
    return this.client.request<ComplianceLink>("POST", "/compliance", { body: params });
  }

  /**
   * Re-verify an existing platform connection.
   */
  async verify(linkId: string): Promise<ComplianceLink> {
    return this.client.request<ComplianceLink>(
      "POST",
      `/compliance/${linkId}/verify`,
    );
  }

  /**
   * Disconnect a platform from the family.
   */
  async delete(linkId: string): Promise<void> {
    return this.client.request<void>("DELETE", `/compliance/${linkId}`);
  }

  /**
   * Trigger enforcement on a specific compliance link.
   */
  async enforce(linkId: string): Promise<void> {
    return this.client.request<void>("POST", `/compliance/${linkId}/enforce`);
  }
}
