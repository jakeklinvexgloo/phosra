import type { BaseClient } from "../client.js";
import type { Webhook, WebhookDelivery } from "../types.js";

export class WebhooksResource {
  constructor(private client: BaseClient) {}

  /**
   * List webhook subscriptions for a family.
   */
  async list(familyId: string): Promise<Webhook[]> {
    return this.client.request<Webhook[]>("GET", `/families/${familyId}/webhooks`);
  }

  /**
   * Register a webhook endpoint to receive event notifications.
   */
  async create(params: {
    family_id: string;
    url: string;
    events: string[];
  }): Promise<Webhook> {
    return this.client.request<Webhook>("POST", "/webhooks", { body: params });
  }

  /**
   * Get a specific webhook by ID.
   */
  async get(webhookId: string): Promise<Webhook> {
    return this.client.request<Webhook>("GET", `/webhooks/${webhookId}`);
  }

  /**
   * Update a webhook's URL, events, or active status.
   */
  async update(
    webhookId: string,
    params: { url?: string; events?: string[]; active?: boolean },
  ): Promise<Webhook> {
    return this.client.request<Webhook>("PUT", `/webhooks/${webhookId}`, {
      body: params,
    });
  }

  /**
   * Delete a webhook subscription.
   */
  async delete(webhookId: string): Promise<void> {
    return this.client.request<void>("DELETE", `/webhooks/${webhookId}`);
  }

  /**
   * Send a test delivery to a webhook endpoint.
   */
  async test(webhookId: string): Promise<WebhookDelivery> {
    return this.client.request<WebhookDelivery>(
      "POST",
      `/webhooks/${webhookId}/test`,
    );
  }

  /**
   * List delivery history for a webhook.
   */
  async deliveries(webhookId: string): Promise<WebhookDelivery[]> {
    return this.client.request<WebhookDelivery[]>(
      "GET",
      `/webhooks/${webhookId}/deliveries`,
    );
  }
}
