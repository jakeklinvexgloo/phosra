import type { BaseClient } from "../client.js";
import type { Platform } from "../types.js";

export class PlatformsResource {
  constructor(private client: BaseClient) {}

  /**
   * List all platforms Phosra can integrate with.
   */
  async list(): Promise<Platform[]> {
    return this.client.request<Platform[]>("GET", "/platforms");
  }

  /**
   * Get details of a specific platform.
   */
  async get(platformId: string): Promise<Platform> {
    return this.client.request<Platform>("GET", `/platforms/${platformId}`);
  }

  /**
   * Filter platforms by category (dns, streaming, gaming, device, browser).
   */
  async byCategory(category: string): Promise<Platform[]> {
    return this.client.request<Platform[]>("GET", "/platforms/by-category", {
      query: { category },
    });
  }

  /**
   * Filter platforms by capability (web_filtering, content_rating, time_limit, etc.).
   */
  async byCapability(capability: string): Promise<Platform[]> {
    return this.client.request<Platform[]>("GET", "/platforms/by-capability", {
      query: { capability },
    });
  }
}
