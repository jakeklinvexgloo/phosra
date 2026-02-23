import type { BaseClient } from "../client.js";
import type {
  Source,
  SourceSyncJob,
  SourceSyncResult,
  AvailableSource,
  GuidedStep,
} from "../types.js";

export class SourcesResource {
  constructor(private client: BaseClient) {}

  /**
   * List all available parental control source adapters.
   */
  async listAvailable(): Promise<AvailableSource[]> {
    return this.client.request<AvailableSource[]>("GET", "/sources/available");
  }

  /**
   * Connect a parental control app as a source for a child.
   */
  async connect(params: {
    child_id: string;
    family_id: string;
    source: string;
    credentials?: Record<string, string>;
    auto_sync?: boolean;
  }): Promise<Source> {
    return this.client.request<Source>("POST", "/sources", { body: params });
  }

  /**
   * Get details of a connected source.
   */
  async get(sourceId: string): Promise<Source> {
    return this.client.request<Source>("GET", `/sources/${sourceId}`);
  }

  /**
   * List all connected sources for a child.
   */
  async listByChild(childId: string): Promise<Source[]> {
    return this.client.request<Source[]>(
      "GET",
      `/children/${childId}/sources`,
    );
  }

  /**
   * List all connected sources for a family.
   */
  async listByFamily(familyId: string): Promise<Source[]> {
    return this.client.request<Source[]>(
      "GET",
      `/families/${familyId}/sources`,
    );
  }

  /**
   * Push all active policy rules to a connected source.
   */
  async sync(
    sourceId: string,
    params?: { sync_mode?: "full" | "incremental" },
  ): Promise<SourceSyncJob> {
    return this.client.request<SourceSyncJob>(
      "POST",
      `/sources/${sourceId}/sync`,
      { body: { sync_mode: params?.sync_mode ?? "full" } },
    );
  }

  /**
   * Push a single rule to a connected source.
   */
  async pushRule(
    sourceId: string,
    params: { category: string; value?: unknown },
  ): Promise<SourceSyncResult> {
    return this.client.request<SourceSyncResult>(
      "POST",
      `/sources/${sourceId}/rules`,
      { body: params },
    );
  }

  /**
   * Get manual setup instructions for a guided-tier source.
   */
  async getGuidedSteps(
    sourceId: string,
    category: string,
  ): Promise<GuidedStep[]> {
    return this.client.request<GuidedStep[]>(
      "GET",
      `/sources/${sourceId}/guide/${category}`,
    );
  }

  /**
   * List sync job history for a source.
   */
  async listSyncJobs(
    sourceId: string,
    params?: { limit?: number },
  ): Promise<SourceSyncJob[]> {
    return this.client.request<SourceSyncJob[]>(
      "GET",
      `/sources/${sourceId}/jobs`,
      params?.limit ? { query: { limit: params.limit } } : undefined,
    );
  }

  /**
   * Get details of a specific sync job.
   */
  async getSyncJob(sourceId: string, jobId: string): Promise<SourceSyncJob> {
    return this.client.request<SourceSyncJob>(
      "GET",
      `/sources/${sourceId}/jobs/${jobId}`,
    );
  }

  /**
   * Get per-rule results for a sync job.
   */
  async getSyncResults(
    sourceId: string,
    jobId: string,
  ): Promise<SourceSyncResult[]> {
    return this.client.request<SourceSyncResult[]>(
      "GET",
      `/sources/${sourceId}/jobs/${jobId}/results`,
    );
  }

  /**
   * Retry a failed sync job.
   */
  async retrySyncJob(
    sourceId: string,
    jobId: string,
  ): Promise<SourceSyncJob> {
    return this.client.request<SourceSyncJob>(
      "POST",
      `/sources/${sourceId}/jobs/${jobId}/retry`,
    );
  }

  /**
   * Disconnect a parental control source.
   */
  async disconnect(sourceId: string): Promise<void> {
    return this.client.request<void>("DELETE", `/sources/${sourceId}`);
  }
}
