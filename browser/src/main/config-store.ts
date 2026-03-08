/**
 * Config Store — persists Netflix config agent state to disk so that
 * profile mappings, maturity settings, etc. survive across app restarts
 * even if the user hasn't completed all 9 wizard steps.
 *
 * Follows the same file-based pattern as CredentialManager and AuthManager.
 * Stored in the user's profile directory as `config-agent-state.json`.
 *
 * SECURITY: PINs are never persisted — they're stripped before saving.
 */

import * as fs from 'fs';
import * as path from 'path';
import type { AgentStatus, AgentStep, ProfileMapping } from './netflix-agent';

const FILENAME = 'config-agent-state.json';
const MAPPINGS_FILENAME = 'netflix-profile-mappings.json';

/** Steps where it makes sense to persist and later resume. */
const RESUMABLE_STEPS: AgentStep[] = [
  'awaiting-mapping',
  'awaiting-maturity',
  'awaiting-pins',
  'awaiting-locks',
  'awaiting-autoplay',
  'reviewing',
];

interface StoredState {
  status: AgentStatus;
  savedAt: string;
}

export class ConfigStore {
  private readonly filePath: string;

  constructor(profilePath: string) {
    this.filePath = path.join(profilePath, FILENAME);
  }

  /** Save agent status to disk (strips PINs for security). */
  save(status: AgentStatus): void {
    if (!RESUMABLE_STEPS.includes(status.step)) return;

    // Strip PINs from changes before persisting
    const sanitised: AgentStatus = {
      ...status,
      changes: status.changes.map((c) => {
        if (c.pin) return { ...c, pin: undefined };
        return c;
      }),
    };

    const stored: StoredState = {
      status: sanitised,
      savedAt: new Date().toISOString(),
    };

    try {
      fs.writeFileSync(this.filePath, JSON.stringify(stored, null, 2), {
        encoding: 'utf-8',
        mode: 0o600,
      });
    } catch {
      // Non-critical — silently ignore write failures
    }
  }

  /** Load previously saved state, or null if none exists / is stale. */
  load(): AgentStatus | null {
    const result = this.loadWithTimestamp();
    return result?.state ?? null;
  }

  /** Load previously saved state with its timestamp for comparison. */
  loadWithTimestamp(): { state: AgentStatus; savedAt: string } | null {
    try {
      if (!fs.existsSync(this.filePath)) return null;
      const raw = fs.readFileSync(this.filePath, 'utf-8');
      const stored: StoredState = JSON.parse(raw);

      // Reject if saved state isn't resumable
      if (!RESUMABLE_STEPS.includes(stored.status.step)) {
        this.clear();
        return null;
      }

      // Reject if older than 7 days
      const savedAt = new Date(stored.savedAt).getTime();
      if (Date.now() - savedAt > 7 * 24 * 60 * 60 * 1000) {
        this.clear();
        return null;
      }

      return { state: stored.status, savedAt: stored.savedAt };
    } catch {
      this.clear();
      return null;
    }
  }

  /** Delete persisted state. */
  clear(): void {
    try {
      if (fs.existsSync(this.filePath)) {
        fs.unlinkSync(this.filePath);
      }
    } catch {
      // ignore
    }
  }

  // -------------------------------------------------------------------------
  // Profile mappings — persisted separately so they survive wizard completion
  // -------------------------------------------------------------------------

  private get mappingsPath(): string {
    return path.join(path.dirname(this.filePath), MAPPINGS_FILENAME);
  }

  /** Save profile mappings (persists across wizard completion). */
  saveMappings(mappings: ProfileMapping[]): void {
    // Save all assigned mappings (child + adult), not just children
    const assignedMappings = mappings.filter(
      (m) => m.familyMemberType !== 'unassigned' && m.familyMemberId,
    );
    if (assignedMappings.length === 0) return;

    try {
      fs.writeFileSync(
        this.mappingsPath,
        JSON.stringify({ mappings: assignedMappings, savedAt: new Date().toISOString() }, null, 2),
        { encoding: 'utf-8', mode: 0o600 },
      );
    } catch {
      // Non-critical
    }
  }

  /** Load saved profile mappings, or null if none exist. */
  loadMappings(): ProfileMapping[] | null {
    try {
      if (!fs.existsSync(this.mappingsPath)) return null;
      const raw = fs.readFileSync(this.mappingsPath, 'utf-8');
      const data = JSON.parse(raw);
      return data.mappings ?? null;
    } catch {
      return null;
    }
  }

  /** Save which profile GUIDs have PINs enabled. */
  savePinStatus(guids: string[]): void {
    try {
      const existing = this.loadMappingsRaw();
      existing.pinnedGuids = guids;
      fs.writeFileSync(this.mappingsPath, JSON.stringify(existing, null, 2), {
        encoding: 'utf-8', mode: 0o600,
      });
    } catch { /* non-critical */ }
  }

  /** Load profile GUIDs that have PINs enabled. */
  loadPinStatus(): string[] {
    try {
      const data = this.loadMappingsRaw();
      return (data.pinnedGuids as string[]) ?? [];
    } catch {
      return [];
    }
  }

  private loadMappingsRaw(): Record<string, unknown> {
    try {
      if (!fs.existsSync(this.mappingsPath)) return {};
      return JSON.parse(fs.readFileSync(this.mappingsPath, 'utf-8'));
    } catch {
      return {};
    }
  }

  // -------------------------------------------------------------------------
  // Profile → Child mapping (maps Netflix profile GUIDs to DB child IDs)
  // Supports one profile → multiple children (shared profiles)
  // -------------------------------------------------------------------------

  private get profileChildMapPath(): string {
    return path.join(path.dirname(this.filePath), 'profile-child-map.json');
  }

  /** A single mapping entry: Netflix profile GUID → one or more DB child IDs + names. */
  saveProfileChildMap(map: ProfileChildMapEntry[]): void {
    try {
      fs.writeFileSync(
        this.profileChildMapPath,
        JSON.stringify({ map, savedAt: new Date().toISOString() }, null, 2),
        { encoding: 'utf-8', mode: 0o600 },
      );
    } catch {
      // Non-critical
    }
  }

  loadProfileChildMap(): ProfileChildMapEntry[] | null {
    try {
      if (!fs.existsSync(this.profileChildMapPath)) return null;
      const raw = fs.readFileSync(this.profileChildMapPath, 'utf-8');
      const data = JSON.parse(raw);
      return data.map ?? null;
    } catch {
      return null;
    }
  }
}

export interface ProfileChildMapEntry {
  profileGuid: string;
  profileName: string;
  children: { childId: string; childName: string }[];
}
