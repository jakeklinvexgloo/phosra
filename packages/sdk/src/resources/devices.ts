import type { BaseClient } from "../client.js";
import type { DeviceRegistration, CompiledPolicy, DeviceReport } from "../types.js";

export class DevicesResource {
  constructor(private client: BaseClient) {}

  /**
   * Register a new device (iOS app instance) for a child.
   * Requires user (parent) auth.
   */
  async register(
    childId: string,
    params: {
      platform_id: string;
      device_name: string;
      device_model: string;
      os_version: string;
      app_version: string;
      capabilities?: string[];
    },
  ): Promise<DeviceRegistration> {
    return this.client.request<DeviceRegistration>(
      "POST",
      `/children/${childId}/devices`,
      { body: params },
    );
  }

  /**
   * List all registered devices for a child.
   * Requires user (parent) auth.
   */
  async list(childId: string): Promise<DeviceRegistration[]> {
    return this.client.request<DeviceRegistration[]>(
      "GET",
      `/children/${childId}/devices`,
    );
  }

  /**
   * Update a device registration (e.g. APNs token, app version).
   * Requires user (parent) auth.
   */
  async update(
    deviceId: string,
    params: {
      device_name?: string;
      os_version?: string;
      app_version?: string;
      apns_token?: string;
      capabilities?: string[];
    },
  ): Promise<DeviceRegistration> {
    return this.client.request<DeviceRegistration>(
      "PUT",
      `/devices/${deviceId}`,
      { body: params },
    );
  }

  /**
   * Revoke (delete) a device registration.
   * Requires user (parent) auth.
   */
  async revoke(deviceId: string): Promise<void> {
    return this.client.request<void>("DELETE", `/devices/${deviceId}`);
  }

  // ── Device-auth endpoints (X-Device-Key) ──────────────────────────────

  /**
   * Get the compiled policy for the authenticated device.
   * Requires device key auth (X-Device-Key).
   */
  async getPolicy(): Promise<CompiledPolicy> {
    return this.client.request<CompiledPolicy>("GET", "/device/policy");
  }

  /**
   * Submit an activity or status report from the device.
   * Requires device key auth (X-Device-Key).
   */
  async submitReport(params: {
    report_type: string;
    payload: Record<string, unknown>;
    reported_at?: string;
  }): Promise<DeviceReport> {
    return this.client.request<DeviceReport>("POST", "/device/report", {
      body: params,
    });
  }

  /**
   * Acknowledge receipt of a policy version.
   * Requires device key auth (X-Device-Key).
   */
  async ack(params: { version: number }): Promise<void> {
    return this.client.request<void>("POST", "/device/ack", { body: params });
  }
}
