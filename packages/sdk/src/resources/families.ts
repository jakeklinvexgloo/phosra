import type { BaseClient } from "../client.js";
import type { Family } from "../types.js";

export class FamiliesResource {
  constructor(private client: BaseClient) {}

  /**
   * List all families the current user belongs to.
   */
  async list(): Promise<Family[]> {
    return this.client.request<Family[]>("GET", "/families");
  }

  /**
   * Create a new family group.
   */
  async create(params: { name: string }): Promise<Family> {
    return this.client.request<Family>("POST", "/families", { body: params });
  }

  /**
   * Get details of a specific family.
   */
  async get(familyId: string): Promise<Family> {
    return this.client.request<Family>("GET", `/families/${familyId}`);
  }

  /**
   * Update a family's name.
   */
  async update(familyId: string, params: { name: string }): Promise<Family> {
    return this.client.request<Family>("PUT", `/families/${familyId}`, { body: params });
  }

  /**
   * Delete a family and all its children, policies, and rules.
   */
  async delete(familyId: string): Promise<void> {
    return this.client.request<void>("DELETE", `/families/${familyId}`);
  }
}
