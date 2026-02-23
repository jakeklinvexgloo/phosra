import type { BaseClient } from "../client.js";
import type { PolicyRule, RuleCategory, BulkRuleInput } from "../types.js";

export class RulesResource {
  constructor(private client: BaseClient) {}

  /**
   * List all rules in a policy.
   */
  async list(policyId: string): Promise<PolicyRule[]> {
    return this.client.request<PolicyRule[]>("GET", `/policies/${policyId}/rules`);
  }

  /**
   * Create a new rule in a policy.
   */
  async create(
    policyId: string,
    params: {
      category: RuleCategory;
      enabled: boolean;
      config: Record<string, unknown>;
    },
  ): Promise<PolicyRule> {
    return this.client.request<PolicyRule>("POST", `/policies/${policyId}/rules`, {
      body: params,
    });
  }

  /**
   * Update a rule's enabled status or config.
   */
  async update(
    ruleId: string,
    params: { enabled?: boolean; config?: Record<string, unknown> },
  ): Promise<PolicyRule> {
    return this.client.request<PolicyRule>("PUT", `/rules/${ruleId}`, { body: params });
  }

  /**
   * Delete a specific rule from a policy.
   */
  async delete(ruleId: string): Promise<void> {
    return this.client.request<void>("DELETE", `/rules/${ruleId}`);
  }

  /**
   * Create or update multiple rules at once for a policy.
   */
  async bulkUpsert(
    policyId: string,
    rules: BulkRuleInput[],
  ): Promise<PolicyRule[]> {
    return this.client.request<PolicyRule[]>(
      "PUT",
      `/policies/${policyId}/rules/bulk`,
      { body: { rules } },
    );
  }
}
