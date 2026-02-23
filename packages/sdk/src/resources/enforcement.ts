import type { BaseClient } from "../client.js";
import type { EnforcementJob, EnforcementResult } from "../types.js";

export class EnforcementResource {
  constructor(private client: BaseClient) {}

  /**
   * Push the child's active policy rules to connected platforms.
   * Optionally target specific platforms; otherwise fans out to all connected platforms.
   */
  async trigger(
    childId: string,
    params?: { platform_ids?: string[] },
  ): Promise<EnforcementJob> {
    return this.client.request<EnforcementJob>(
      "POST",
      `/children/${childId}/enforce`,
      params ? { body: params } : undefined,
    );
  }

  /**
   * Trigger enforcement for a specific compliance link (platform connection).
   */
  async triggerLink(linkId: string): Promise<EnforcementJob> {
    return this.client.request<EnforcementJob>(
      "POST",
      `/compliance/${linkId}/enforce`,
    );
  }

  /**
   * List enforcement job history for a child.
   */
  async listJobs(childId: string): Promise<EnforcementJob[]> {
    return this.client.request<EnforcementJob[]>(
      "GET",
      `/children/${childId}/enforcement/jobs`,
    );
  }

  /**
   * Get status of a specific enforcement job.
   */
  async getJob(jobId: string): Promise<EnforcementJob> {
    return this.client.request<EnforcementJob>(
      "GET",
      `/enforcement/jobs/${jobId}`,
    );
  }

  /**
   * Get per-platform results of an enforcement job.
   */
  async getResults(jobId: string): Promise<EnforcementResult[]> {
    return this.client.request<EnforcementResult[]>(
      "GET",
      `/enforcement/jobs/${jobId}/results`,
    );
  }

  /**
   * Retry a failed enforcement job.
   */
  async retry(jobId: string): Promise<EnforcementJob> {
    return this.client.request<EnforcementJob>(
      "POST",
      `/enforcement/jobs/${jobId}/retry`,
    );
  }
}
