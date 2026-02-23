import type { BaseClient } from "../client.js";
import type { Standard, StandardAdoption } from "../types.js";

export class StandardsResource {
  constructor(private client: BaseClient) {}

  /**
   * List all published community standards.
   */
  async list(): Promise<Standard[]> {
    return this.client.request<Standard[]>("GET", "/standards");
  }

  /**
   * Get a community standard by its slug.
   */
  async get(slug: string): Promise<Standard> {
    return this.client.request<Standard>("GET", `/standards/${slug}`);
  }

  /**
   * List standards adopted by a specific child.
   */
  async forChild(childId: string): Promise<Standard[]> {
    return this.client.request<Standard[]>(
      "GET",
      `/children/${childId}/standards`,
    );
  }

  /**
   * Adopt a community standard for a child.
   * This applies the standard's rules to the child's active policy.
   */
  async adopt(
    childId: string,
    params: { standard_id: string },
  ): Promise<StandardAdoption> {
    return this.client.request<StandardAdoption>(
      "POST",
      `/children/${childId}/standards`,
      { body: params },
    );
  }

  /**
   * Remove a community standard adoption from a child.
   */
  async remove(childId: string, standardId: string): Promise<void> {
    return this.client.request<void>(
      "DELETE",
      `/children/${childId}/standards/${standardId}`,
    );
  }
}
