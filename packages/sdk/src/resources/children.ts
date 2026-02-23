import type { BaseClient } from "../client.js";
import type { Child, AgeRatings } from "../types.js";

export class ChildrenResource {
  constructor(private client: BaseClient) {}

  /**
   * List all children in a family.
   */
  async list(familyId: string): Promise<Child[]> {
    return this.client.request<Child[]>("GET", `/families/${familyId}/children`);
  }

  /**
   * Add a new child to a family.
   */
  async create(
    familyId: string,
    params: { name: string; birth_date: string },
  ): Promise<Child> {
    return this.client.request<Child>("POST", `/families/${familyId}/children`, {
      body: params,
    });
  }

  /**
   * Get details of a specific child.
   */
  async get(childId: string): Promise<Child> {
    return this.client.request<Child>("GET", `/children/${childId}`);
  }

  /**
   * Update a child's name or birth date.
   */
  async update(
    childId: string,
    params: { name?: string; birth_date?: string },
  ): Promise<Child> {
    return this.client.request<Child>("PUT", `/children/${childId}`, { body: params });
  }

  /**
   * Delete a child and all their policies and rules.
   */
  async delete(childId: string): Promise<void> {
    return this.client.request<void>("DELETE", `/children/${childId}`);
  }

  /**
   * Get recommended content ratings for a child based on their age,
   * across all rating systems (MPAA, TV, ESRB, PEGI, CSM).
   */
  async ageRatings(childId: string): Promise<AgeRatings> {
    return this.client.request<AgeRatings>("GET", `/children/${childId}/age-ratings`);
  }
}
