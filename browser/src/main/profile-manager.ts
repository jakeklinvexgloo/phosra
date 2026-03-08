/**
 * Persistent browser profile manager.
 *
 * Each profile is a subdirectory under `~/.phosra-browser/profiles/` (resolved
 * via Electron's `app.getPath('userData')`).  A profile stores cookies, local
 * storage, IndexedDB, and other Chromium session state so that login sessions
 * persist across app restarts.
 */

import { app } from 'electron';
import * as path from 'path';
import * as fs from 'fs';

const DEFAULT_PROFILE_NAME = 'default';

export class ProfileManager {
  private readonly profilesDir: string;

  constructor() {
    const userData = app.getPath('userData');
    this.profilesDir = path.join(userData, 'profiles');

    // Ensure the profiles root directory exists
    if (!fs.existsSync(this.profilesDir)) {
      fs.mkdirSync(this.profilesDir, { recursive: true });
    }

    // Ensure the default profile directory exists
    this.ensureProfile(DEFAULT_PROFILE_NAME);
  }

  /**
   * Returns the absolute filesystem path for the given profile name.
   */
  getProfilePath(name: string): string {
    return path.join(this.profilesDir, this.sanitizeName(name));
  }

  /**
   * Returns all available profile names (directory names under profilesDir).
   */
  listProfiles(): string[] {
    try {
      return fs
        .readdirSync(this.profilesDir, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
        .sort();
    } catch {
      return [];
    }
  }

  /**
   * Creates a new profile directory.  Returns the absolute path.
   * If the profile already exists, returns its path without error.
   */
  createProfile(name: string): string {
    const profilePath = this.getProfilePath(name);
    this.ensureProfile(name);
    return profilePath;
  }

  /**
   * Deletes a profile directory and all its contents.
   * Throws if the caller tries to delete the default profile.
   */
  deleteProfile(name: string): void {
    const sanitized = this.sanitizeName(name);
    if (sanitized === DEFAULT_PROFILE_NAME) {
      throw new Error('Cannot delete the default profile');
    }

    const profilePath = this.getProfilePath(name);
    if (fs.existsSync(profilePath)) {
      fs.rmSync(profilePath, { recursive: true, force: true });
    }
  }

  /**
   * Convenience accessor for the default profile path.
   */
  getDefaultProfilePath(): string {
    return this.getProfilePath(DEFAULT_PROFILE_NAME);
  }

  // ---- private helpers ----

  private sanitizeName(name: string): string {
    // Remove path separators and other potentially dangerous characters
    return name.replace(/[^a-zA-Z0-9_-]/g, '_') || DEFAULT_PROFILE_NAME;
  }

  private ensureProfile(name: string): void {
    const profilePath = this.getProfilePath(name);
    if (!fs.existsSync(profilePath)) {
      fs.mkdirSync(profilePath, { recursive: true });
    }
  }
}
