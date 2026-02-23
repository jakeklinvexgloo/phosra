import type { BaseClient } from "../client.js";
import type { User, TokenPair } from "../types.js";

export class AuthResource {
  constructor(private client: BaseClient) {}

  /**
   * Register a new user account.
   */
  async register(params: {
    email: string;
    password: string;
    name: string;
  }): Promise<TokenPair> {
    return this.client.request<TokenPair>("POST", "/auth/register", { body: params });
  }

  /**
   * Log in with email and password.
   */
  async login(params: { email: string; password: string }): Promise<TokenPair> {
    return this.client.request<TokenPair>("POST", "/auth/login", { body: params });
  }

  /**
   * Refresh an expired access token using a refresh token.
   */
  async refresh(params: { refresh_token: string }): Promise<TokenPair> {
    return this.client.request<TokenPair>("POST", "/auth/refresh", { body: params });
  }

  /**
   * Log out (revoke the current session).
   */
  async logout(): Promise<void> {
    return this.client.request<void>("POST", "/auth/logout");
  }

  /**
   * Get the current authenticated user's profile.
   */
  async me(): Promise<User> {
    return this.client.request<User>("GET", "/auth/me");
  }
}
