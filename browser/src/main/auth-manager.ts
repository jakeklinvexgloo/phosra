/**
 * Auth manager — encrypt/persist Phosra session tokens from phosra.com login.
 *
 * Flow:
 * 1. User logs in on phosra.com in system browser
 * 2. Deep-link delivers a Stytch `session_token` (opaque, lasts 7 days)
 * 3. AuthManager stores it encrypted via safeStorage
 * 4. Before each API call, exchanges session_token for a fresh JWT (5 min)
 *    via the Stytch sessions/authenticate endpoint
 * 5. Caches the JWT for 4 minutes to avoid redundant calls
 *
 * The Stytch session_jwt (short-lived) is NEVER persisted — only the
 * long-lived session_token is stored.
 */

import { safeStorage } from 'electron';
import { net } from 'electron';
import * as fs from 'fs';
import * as path from 'path';

// Stytch credentials — injected at build time via Vite define.
// Falls back to process.env for dev mode (vite-plugin-electron sets NODE_ENV).
declare const __STYTCH_PROJECT_ID__: string;
declare const __STYTCH_SECRET__: string;

const STYTCH_PROJECT_ID = (typeof __STYTCH_PROJECT_ID__ !== 'undefined' ? __STYTCH_PROJECT_ID__ : '') || process.env.STYTCH_PROJECT_ID || '';
const STYTCH_SECRET = (typeof __STYTCH_SECRET__ !== 'undefined' ? __STYTCH_SECRET__ : '') || process.env.STYTCH_SECRET || '';
const STYTCH_API_URL = 'https://api.stytch.com/v1/sessions/authenticate';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Stored on disk — session_token is encrypted via safeStorage. */
interface StoredAuth {
  encryptedSessionToken: string; // base64 of safeStorage buffer
  email: string;
  expiresAt: string; // session expiry (~7 days)
  savedAt: string;
}

/** Sent to the renderer — secrets never cross IPC boundary. */
export interface AuthInfo {
  email: string;
  isLoggedIn: boolean;
  expiresAt: string;
}

// ---------------------------------------------------------------------------
// Manager
// ---------------------------------------------------------------------------

export class AuthManager {
  private readonly filePath: string;
  private readonly session: Electron.Session;
  private stored: StoredAuth | null = null;

  // JWT cache (in-memory only, never persisted)
  private cachedJwt: string | null = null;
  private cachedJwtExpiry = 0;

  constructor(profilePath: string, session: Electron.Session) {
    this.filePath = path.join(profilePath, 'auth-token.json');
    this.session = session;
    this.load();
  }

  // -----------------------------------------------------------------------
  // Public API
  // -----------------------------------------------------------------------

  /** Whether the user is currently logged in (has a non-expired session). */
  isLoggedIn(): boolean {
    if (!this.stored) return false;
    return new Date(this.stored.expiresAt) > new Date();
  }

  /** Auth info safe for the renderer (no secrets). */
  getInfo(): AuthInfo {
    if (!this.stored || !this.isLoggedIn()) {
      return { email: '', isLoggedIn: false, expiresAt: '' };
    }
    return {
      email: this.stored.email,
      isLoggedIn: true,
      expiresAt: this.stored.expiresAt,
    };
  }

  /**
   * Get a fresh Stytch JWT for API calls.
   * Returns a cached JWT if still valid, otherwise exchanges the
   * session_token for a new one via the Stytch API.
   */
  async getToken(): Promise<string | null> {
    if (!this.stored || !this.isLoggedIn()) return null;

    // Return cached JWT if still valid (with 60s safety buffer)
    if (this.cachedJwt && Date.now() < this.cachedJwtExpiry - 60_000) {
      return this.cachedJwt;
    }

    // Exchange session_token for a fresh JWT
    return this.refreshJwt();
  }

  /**
   * Store a session_token from the deep-link auth flow.
   * Called when phosra-browser://auth?session_token=... is received.
   */
  storeSessionToken(sessionToken: string, email?: string): boolean {
    if (!safeStorage.isEncryptionAvailable()) {
      console.error('[AuthManager] safeStorage encryption not available');
      return false;
    }

    const encrypted = safeStorage.encryptString(sessionToken);
    this.stored = {
      encryptedSessionToken: encrypted.toString('base64'),
      email: email || '',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      savedAt: new Date().toISOString(),
    };

    // Clear cached JWT so next getToken() fetches a fresh one
    this.cachedJwt = null;
    this.cachedJwtExpiry = 0;

    this.persist();
    console.log(`[AuthManager] Session token stored for ${email || 'unknown user'}`);
    return true;
  }

  /**
   * Legacy: store a JWT directly (from cookie capture flow).
   * Kept for backwards compatibility with the tab-manager cookie capture.
   */
  storeToken(jwt: string): boolean {
    if (!safeStorage.isEncryptionAvailable()) {
      console.error('[AuthManager] safeStorage encryption not available');
      return false;
    }

    const email = this.extractEmailFromJwt(jwt);
    const encrypted = safeStorage.encryptString(jwt);

    // Store as session token (it'll work for one API call at least)
    this.stored = {
      encryptedSessionToken: encrypted.toString('base64'),
      email,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 min
      savedAt: new Date().toISOString(),
    };

    // Also cache it directly as the JWT
    this.cachedJwt = jwt;
    this.cachedJwtExpiry = Date.now() + 4 * 60 * 1000;

    this.persist();
    console.log(`[AuthManager] JWT stored for ${email || 'unknown user'}`);
    return true;
  }

  /**
   * Read the stytch_session cookie from the Electron session's cookie jar.
   * Called by TabManager when navigation to phosra.com/dashboard is detected.
   */
  async captureTokenFromSession(): Promise<boolean> {
    try {
      // Try to get the session token (opaque, long-lived)
      const sessionTokenCookies = await this.session.cookies.get({
        name: 'stytch_session',
        domain: '.phosra.com',
      });
      if (sessionTokenCookies.length > 0) {
        return this.storeSessionToken(sessionTokenCookies[0].value);
      }

      // Fallback: try without leading dot
      const sessionTokenCookies2 = await this.session.cookies.get({
        name: 'stytch_session',
        domain: 'phosra.com',
      });
      if (sessionTokenCookies2.length > 0) {
        return this.storeSessionToken(sessionTokenCookies2[0].value);
      }

      // Last resort: try the JWT cookie (short-lived, but better than nothing)
      const jwtCookies = await this.session.cookies.get({
        name: 'stytch_session_jwt',
        domain: '.phosra.com',
      });
      if (jwtCookies.length > 0) {
        return this.storeToken(jwtCookies[0].value);
      }

      console.log('[AuthManager] No Stytch cookies found');
      return false;
    } catch (err) {
      console.error('[AuthManager] Failed to capture token:', err);
      return false;
    }
  }

  /** Clear stored token and log out. */
  logout(): void {
    this.stored = null;
    this.cachedJwt = null;
    this.cachedJwtExpiry = 0;
    try {
      if (fs.existsSync(this.filePath)) {
        fs.unlinkSync(this.filePath);
      }
    } catch (err) {
      console.error('[AuthManager] Failed to delete auth file:', err);
    }
  }

  // -----------------------------------------------------------------------
  // Private: Stytch token refresh
  // -----------------------------------------------------------------------

  private async refreshJwt(): Promise<string | null> {
    const sessionToken = this.getSessionToken();
    if (!sessionToken) return null;

    if (!STYTCH_PROJECT_ID || !STYTCH_SECRET) {
      console.error('[AuthManager] Stytch credentials not configured');
      return null;
    }

    try {
      const basicAuth = Buffer.from(`${STYTCH_PROJECT_ID}:${STYTCH_SECRET}`).toString('base64');

      const res = await net.fetch(STYTCH_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${basicAuth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ session_token: sessionToken }),
      });

      if (!res.ok) {
        const body = await res.text().catch(() => '');
        console.error(`[AuthManager] Stytch refresh failed: ${res.status} ${body}`);
        // If 401/404, the session is invalid — clear it
        if (res.status === 401 || res.status === 404) {
          this.logout();
        }
        return null;
      }

      const data = await res.json() as {
        session_jwt: string;
        session_token: string;
        session: { expires_at: string; user_id: string };
        user?: { emails?: Array<{ email: string }> };
      };

      // Cache the fresh JWT (valid for ~5 min, cache for 4 min)
      this.cachedJwt = data.session_jwt;
      this.cachedJwtExpiry = Date.now() + 4 * 60 * 1000;

      // Update stored session token (Stytch may rotate it)
      if (data.session_token && data.session_token !== sessionToken) {
        const email = data.user?.emails?.[0]?.email || this.stored?.email || '';
        this.storeSessionToken(data.session_token, email);
      }

      // Update email if available
      if (data.user?.emails?.[0]?.email && this.stored) {
        this.stored.email = data.user.emails[0].email;
        this.persist();
      }

      // Update session expiry
      if (data.session?.expires_at && this.stored) {
        this.stored.expiresAt = data.session.expires_at;
        this.persist();
      }

      console.log('[AuthManager] JWT refreshed successfully');
      return this.cachedJwt;
    } catch (err) {
      console.error('[AuthManager] Failed to refresh JWT:', err);
      return null;
    }
  }

  /** Decrypt the stored session token. */
  private getSessionToken(): string | null {
    if (!this.stored) return null;
    try {
      const buffer = Buffer.from(this.stored.encryptedSessionToken, 'base64');
      return safeStorage.decryptString(buffer);
    } catch {
      console.error('[AuthManager] Failed to decrypt session token');
      return null;
    }
  }

  private extractEmailFromJwt(jwt: string): string {
    try {
      const parts = jwt.split('.');
      if (parts.length < 2) return '';
      const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const decoded = JSON.parse(Buffer.from(payload, 'base64').toString('utf-8'));
      return decoded.email || decoded.sub || decoded['https://stytch.com/session']?.authentication_factors?.[0]?.email_factor?.email_address || '';
    } catch {
      return '';
    }
  }

  // -----------------------------------------------------------------------
  // Persistence
  // -----------------------------------------------------------------------

  private load(): void {
    try {
      if (!fs.existsSync(this.filePath)) return;
      const raw = fs.readFileSync(this.filePath, 'utf-8');
      const parsed = JSON.parse(raw);

      // Migrate: old format used `encryptedToken` (a short-lived JWT).
      // New format uses `encryptedSessionToken` (long-lived session token).
      // The old JWT is expired by now, so just clear it and prompt re-login.
      if (parsed.encryptedToken && !parsed.encryptedSessionToken) {
        console.log('[AuthManager] Clearing stale v1 auth token — re-login required');
        fs.unlinkSync(this.filePath);
        return;
      }

      this.stored = parsed;
    } catch {
      console.error('[AuthManager] Failed to load auth file');
    }
  }

  private persist(): void {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.filePath, JSON.stringify(this.stored, null, 2), {
        encoding: 'utf-8',
        mode: 0o600,
      });
    } catch (err) {
      console.error('[AuthManager] Failed to persist auth:', err);
    }
  }
}
