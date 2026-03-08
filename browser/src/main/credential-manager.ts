/**
 * Credential manager — encrypt/decrypt/CRUD for streaming service credentials.
 *
 * Supports both built-in streaming services and custom providers added by the user.
 * Passwords are encrypted at rest using Electron's `safeStorage` API, which
 * delegates to the OS keychain (macOS Keychain, Windows DPAPI, Linux Secret Service).
 * The credentials file is stored inside the profile directory with restricted permissions.
 *
 * SECURITY: Decrypted passwords never leave the main process. The renderer only
 * receives `CredentialInfo` objects (with `hasPassword` instead of the actual password).
 */

import { safeStorage } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import {
  matchUrlToService,
  getServiceById,
  isBuiltInService,
  STREAMING_SERVICES,
  DEFAULT_SELECTORS,
} from './streaming-services';
import type { StreamingService } from './streaming-services';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Stored on disk — password is encrypted via safeStorage. */
interface StoredCredential {
  serviceId: string;
  username: string;
  encryptedPassword: string; // base64 of safeStorage buffer
  createdAt: string;
  updatedAt: string;
  /** For custom providers: user-given display name. */
  customName?: string;
  /** For custom providers: login URL pattern for auto-fill matching. */
  customLoginUrl?: string;
}

/** Sent to the renderer — password never crosses the IPC boundary. */
export interface CredentialInfo {
  serviceId: string;
  displayName: string;
  username: string;
  hasPassword: boolean;
  updatedAt: string;
  isCustom: boolean;
  loginUrl?: string;
}

// ---------------------------------------------------------------------------
// Manager
// ---------------------------------------------------------------------------

export class CredentialManager {
  private readonly filePath: string;
  private credentials: Map<string, StoredCredential> = new Map();

  constructor(profilePath: string) {
    this.filePath = path.join(profilePath, 'credentials.json');
    this.load();
  }

  // -----------------------------------------------------------------------
  // Public API
  // -----------------------------------------------------------------------

  /** Check whether safeStorage encryption is available on this machine. */
  isAvailable(): boolean {
    return safeStorage.isEncryptionAvailable();
  }

  /** List all credentials (safe for renderer — no passwords). */
  list(): CredentialInfo[] {
    // Built-in services (always shown, even if no credential stored)
    const builtIn: CredentialInfo[] = STREAMING_SERVICES.map((svc) => {
      const cred = this.credentials.get(svc.id);
      return {
        serviceId: svc.id,
        displayName: svc.displayName,
        username: cred?.username ?? '',
        hasPassword: !!cred?.encryptedPassword,
        updatedAt: cred?.updatedAt ?? '',
        isCustom: false,
      };
    });

    // Custom providers (only those that are stored)
    const custom: CredentialInfo[] = [];
    for (const cred of this.credentials.values()) {
      if (!isBuiltInService(cred.serviceId) && cred.customName) {
        custom.push({
          serviceId: cred.serviceId,
          displayName: cred.customName,
          username: cred.username,
          hasPassword: !!cred.encryptedPassword,
          updatedAt: cred.updatedAt,
          isCustom: true,
          loginUrl: cred.customLoginUrl,
        });
      }
    }

    return [...builtIn, ...custom];
  }

  /** Save (create or update) a credential for a built-in streaming service. */
  save(serviceId: string, username: string, password: string): CredentialInfo {
    if (!this.isAvailable()) {
      throw new Error('OS keychain encryption is not available');
    }

    const svc = getServiceById(serviceId);
    if (!svc) {
      throw new Error(`Unknown service: ${serviceId}`);
    }

    const encrypted = safeStorage.encryptString(password);
    const now = new Date().toISOString();

    const existing = this.credentials.get(serviceId);
    const stored: StoredCredential = {
      serviceId,
      username,
      encryptedPassword: encrypted.toString('base64'),
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };

    this.credentials.set(serviceId, stored);
    this.persist();

    return {
      serviceId,
      displayName: svc.displayName,
      username,
      hasPassword: true,
      updatedAt: now,
      isCustom: false,
    };
  }

  /** Save a credential for a custom provider. */
  saveCustom(
    name: string,
    loginUrl: string,
    username: string,
    password: string,
    existingServiceId?: string,
  ): CredentialInfo {
    if (!this.isAvailable()) {
      throw new Error('OS keychain encryption is not available');
    }

    const serviceId = existingServiceId ?? `custom-${Date.now()}`;
    const encrypted = safeStorage.encryptString(password);
    const now = new Date().toISOString();

    const existing = this.credentials.get(serviceId);
    const stored: StoredCredential = {
      serviceId,
      username,
      encryptedPassword: encrypted.toString('base64'),
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      customName: name,
      customLoginUrl: loginUrl,
    };

    this.credentials.set(serviceId, stored);
    this.persist();

    return {
      serviceId,
      displayName: name,
      username,
      hasPassword: true,
      updatedAt: now,
      isCustom: true,
      loginUrl,
    };
  }

  /** Delete a stored credential. */
  delete(serviceId: string): boolean {
    const deleted = this.credentials.delete(serviceId);
    if (deleted) {
      this.persist();
    }
    return deleted;
  }

  /** Match a URL to a service and return the decrypted password (main process only). */
  getAutoFillData(url: string): { service: StreamingService; username: string; password: string } | null {
    const customServices = this.getCustomAsStreamingServices();
    const svc = matchUrlToService(url, customServices);
    if (!svc) return null;

    const cred = this.credentials.get(svc.id);
    if (!cred || !cred.encryptedPassword) return null;

    try {
      const buffer = Buffer.from(cred.encryptedPassword, 'base64');
      const password = safeStorage.decryptString(buffer);
      return { service: svc, username: cred.username, password };
    } catch {
      console.error(`[CredentialManager] Failed to decrypt password for ${svc.id}`);
      return null;
    }
  }

  /** Check if a URL matches a service that has stored credentials. */
  hasCredentialForUrl(url: string): { serviceId: string; displayName: string } | null {
    const customServices = this.getCustomAsStreamingServices();
    const svc = matchUrlToService(url, customServices);
    if (!svc) return null;

    const cred = this.credentials.get(svc.id);
    if (!cred || !cred.encryptedPassword) return null;

    return { serviceId: svc.id, displayName: svc.displayName };
  }

  // -----------------------------------------------------------------------
  // Helpers
  // -----------------------------------------------------------------------

  /** Convert custom credentials into StreamingService objects for URL matching. */
  private getCustomAsStreamingServices(): StreamingService[] {
    const custom: StreamingService[] = [];
    for (const cred of this.credentials.values()) {
      if (!isBuiltInService(cred.serviceId) && cred.customLoginUrl) {
        custom.push({
          id: cred.serviceId,
          displayName: cred.customName ?? 'Custom',
          loginUrls: [cred.customLoginUrl],
          selectors: DEFAULT_SELECTORS,
        });
      }
    }
    return custom;
  }

  // -----------------------------------------------------------------------
  // Persistence
  // -----------------------------------------------------------------------

  private load(): void {
    try {
      if (!fs.existsSync(this.filePath)) return;
      const raw = fs.readFileSync(this.filePath, 'utf-8');
      const entries: StoredCredential[] = JSON.parse(raw);
      for (const entry of entries) {
        this.credentials.set(entry.serviceId, entry);
      }
    } catch {
      console.error('[CredentialManager] Failed to load credentials file');
    }
  }

  private persist(): void {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const data = JSON.stringify(Array.from(this.credentials.values()), null, 2);
      fs.writeFileSync(this.filePath, data, { encoding: 'utf-8', mode: 0o600 });
    } catch (err) {
      console.error('[CredentialManager] Failed to persist credentials:', err);
    }
  }
}
