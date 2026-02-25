// ────────────────────────────────────────────────────────────────────────────
// @phosra/sdk — Base HTTP client
// ────────────────────────────────────────────────────────────────────────────

import type { PhosraClientConfig, RequestOptions } from "./types.js";
import {
  PhosraApiError,
  PhosraAuthError,
  PhosraNotFoundError,
  PhosraRateLimitError,
  PhosraValidationError,
} from "./errors.js";

const DEFAULT_BASE_URL = "https://phosra-api.fly.dev/api/v1";

export class BaseClient {
  private baseUrl: string;
  private accessToken?: string;
  private deviceKey?: string;
  private apiKey?: string;
  private onTokenExpired?: () => Promise<string>;

  constructor(config: PhosraClientConfig = {}) {
    this.baseUrl = (config.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, "");
    this.accessToken = config.accessToken;
    this.deviceKey = config.deviceKey;
    this.apiKey = config.apiKey;
    this.onTokenExpired = config.onTokenExpired;
  }

  /**
   * Update the access token (e.g. after a refresh).
   */
  setAccessToken(token: string): void {
    this.accessToken = token;
  }

  /**
   * Core HTTP request method. All resource methods call through here.
   */
  async request<T>(
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
    path: string,
    options?: RequestOptions,
  ): Promise<T> {
    const url = this.buildUrl(path, options?.query);
    const headers = this.buildHeaders(options?.headers);

    const init: RequestInit = {
      method,
      headers,
    };

    if (options?.body !== undefined && method !== "GET") {
      init.body = JSON.stringify(options.body);
    }

    let response = await fetch(url, init);

    // On 401, attempt token refresh and retry once
    if (response.status === 401 && this.onTokenExpired) {
      try {
        const newToken = await this.onTokenExpired();
        this.accessToken = newToken;
        const retryHeaders = this.buildHeaders(options?.headers);
        const retryInit: RequestInit = { method, headers: retryHeaders };
        if (options?.body !== undefined && method !== "GET") {
          retryInit.body = JSON.stringify(options.body);
        }
        response = await fetch(url, retryInit);
      } catch {
        // If token refresh fails, throw the original 401
        throw new PhosraAuthError();
      }
    }

    return this.handleResponse<T>(response);
  }

  private buildUrl(
    path: string,
    query?: Record<string, string | number | boolean | undefined>,
  ): string {
    const url = new URL(`${this.baseUrl}${path}`);

    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined) {
          url.searchParams.set(key, String(value));
        }
      }
    }

    return url.toString();
  }

  private buildHeaders(extra?: Record<string, string>): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    // Auth precedence: deviceKey > apiKey > accessToken
    if (this.deviceKey) {
      headers["X-Device-Key"] = this.deviceKey;
    } else if (this.apiKey) {
      headers["X-Api-Key"] = this.apiKey;
    } else if (this.accessToken) {
      headers["Authorization"] = `Bearer ${this.accessToken}`;
    }

    if (extra) {
      Object.assign(headers, extra);
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (response.status === 204) {
      return undefined as T;
    }

    let body: Record<string, unknown> | undefined;
    try {
      body = await response.json() as Record<string, unknown>;
    } catch {
      // Non-JSON response
    }

    if (response.ok) {
      return body as T;
    }

    // Extract error info
    const message =
      (body?.message as string) ??
      (body?.error as string) ??
      response.statusText ??
      "Unknown error";
    const code = body?.code as string | undefined;
    const details = body as Record<string, unknown> | undefined;

    switch (response.status) {
      case 401:
        throw new PhosraAuthError(message, details);
      case 404:
        throw new PhosraNotFoundError(message, details);
      case 422:
        throw new PhosraValidationError(message, details);
      case 429: {
        const retryAfterHeader = response.headers.get("Retry-After");
        const retryAfter = retryAfterHeader ? parseInt(retryAfterHeader, 10) : undefined;
        throw new PhosraRateLimitError(message, retryAfter, details);
      }
      default:
        throw new PhosraApiError(message, response.status, code, details);
    }
  }
}
