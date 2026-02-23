import type { BaseClient } from "../client.js";
import type { FamilyOverview } from "../types.js";

export class ReportsResource {
  constructor(private client: BaseClient) {}

  /**
   * Get a health dashboard for a family: children, active policies,
   * sync status, recent enforcement jobs, and recommendations.
   */
  async familyOverview(familyId: string): Promise<FamilyOverview> {
    return this.client.request<FamilyOverview>(
      "GET",
      `/families/${familyId}/reports/overview`,
    );
  }
}
