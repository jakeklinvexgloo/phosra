import type { BaseClient } from "../client.js";
import type { ChildPolicy, PolicyRule } from "../types.js";

export class PoliciesResource {
  constructor(private client: BaseClient) {}

  /**
   * List all policies for a child.
   */
  async list(childId: string): Promise<ChildPolicy[]> {
    return this.client.request<ChildPolicy[]>("GET", `/children/${childId}/policies`);
  }

  /**
   * Create a new policy for a child. Policies start in 'draft' status.
   */
  async create(
    childId: string,
    params: { name: string; priority?: number },
  ): Promise<ChildPolicy> {
    return this.client.request<ChildPolicy>("POST", `/children/${childId}/policies`, {
      body: params,
    });
  }

  /**
   * Get details of a specific policy.
   */
  async get(policyId: string): Promise<ChildPolicy> {
    return this.client.request<ChildPolicy>("GET", `/policies/${policyId}`);
  }

  /**
   * Update a policy's name or priority.
   */
  async update(
    policyId: string,
    params: { name?: string; priority?: number },
  ): Promise<ChildPolicy> {
    return this.client.request<ChildPolicy>("PUT", `/policies/${policyId}`, {
      body: params,
    });
  }

  /**
   * Delete a policy and all its rules.
   */
  async delete(policyId: string): Promise<void> {
    return this.client.request<void>("DELETE", `/policies/${policyId}`);
  }

  /**
   * Activate a policy so its rules are enforced.
   */
  async activate(policyId: string): Promise<ChildPolicy> {
    return this.client.request<ChildPolicy>("POST", `/policies/${policyId}/activate`);
  }

  /**
   * Pause a policy to temporarily stop enforcement.
   */
  async pause(policyId: string): Promise<ChildPolicy> {
    return this.client.request<ChildPolicy>("POST", `/policies/${policyId}/pause`);
  }

  /**
   * Auto-generate age-appropriate rules for a policy based on the child's birth date.
   * Replaces existing rules with defaults for the child's age group.
   */
  async generateFromAge(policyId: string): Promise<PolicyRule[]> {
    return this.client.request<PolicyRule[]>(
      "POST",
      `/policies/${policyId}/generate-from-age`,
    );
  }
}
