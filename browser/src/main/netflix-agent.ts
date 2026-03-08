/**
 * Netflix configuration agent — orchestrates browser automation to configure
 * Netflix profiles for a family's children.
 *
 * Runs in the main process. Communicates with the active tab via
 * `webContents.executeJavaScript()` and pushes status updates to the
 * chrome UI view via IPC.
 */

import type { WebContentsView } from 'electron';
import { NETFLIX_URLS, NETFLIX_SELECTORS, NETFLIX_MATURITY_LEVELS } from './netflix-selectors';
import type { NetflixMaturityLevel } from './netflix-selectors';
import type { CredentialManager } from './credential-manager';
import { agentInfo, agentEvent, agentError, agentDebug, agentWarn } from './agent-logger';

const LOG_SRC = 'netflix-agent';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface NetflixProfile {
  guid: string;
  name: string;
  avatarUrl: string;
  isKids: boolean;
  maturityLevel: NetflixMaturityLevel;
  hasPIN: boolean;
  isLocked: boolean;
  autoplayEnabled: boolean;
}

export interface FamilyChild {
  id: string;
  name: string;
  birthDate: string;
  strictness?: 'relaxed' | 'recommended' | 'strict';
}

export interface FamilyMemberInfo {
  id: string;
  name: string;
  role: string;
}

export interface ProfileMapping {
  netflixProfile: NetflixProfile;
  familyMemberId?: string;
  familyMemberName?: string;
  familyMemberType: 'child' | 'adult' | 'shared' | 'unassigned';
  childAge?: number;
  childStrictness?: 'relaxed' | 'recommended' | 'strict';
  recommendedMaturity?: NetflixMaturityLevel;
}

export interface ConfigChange {
  id: string;
  type: 'maturity' | 'pin' | 'lock' | 'autoplay';
  profileGuid: string;
  profileName: string;
  description: string;
  enabled: boolean;
  /** For maturity changes */
  fromLevel?: string;
  toLevel?: string;
  /** For PIN changes */
  pin?: string;
}

export type AgentStep =
  | 'idle'
  | 'discovering'
  | 'awaiting-mapping'
  | 'awaiting-maturity'
  | 'awaiting-pins'
  | 'awaiting-locks'
  | 'awaiting-autoplay'
  | 'reviewing'
  | 'applying'
  | 'complete'
  | 'error';

/** Sub-phases within the 'discovering' step for granular progress. */
export type DiscoveryPhase =
  | 'navigating'
  | 'checking-login'
  | 'logging-in'
  | 'loading-profiles'
  | 'extracting-cache'
  | 'scraping-dom'
  | 'reading-details'
  | 'done';

export interface AgentStatus {
  step: AgentStep;
  profiles: NetflixProfile[];
  mappings: ProfileMapping[];
  changes: ConfigChange[];
  applyProgress: ApplyProgress[];
  error?: string;
  /** Granular progress within the 'discovering' step. */
  discoveryPhase?: DiscoveryPhase;
  /** How many profiles have been read so far during discovery detail scanning. */
  discoveryProfilesRead?: number;
  discoveryProfilesTotal?: number;
}

export interface ApplyProgress {
  changeId: string;
  status: 'pending' | 'applying' | 'success' | 'failed';
  error?: string;
}

// ---------------------------------------------------------------------------
// Agent
// ---------------------------------------------------------------------------

export class NetflixAgent {
  private step: AgentStep = 'idle';
  private profiles: NetflixProfile[] = [];
  private mappings: ProfileMapping[] = [];
  private changes: ConfigChange[] = [];
  private applyProgress: ApplyProgress[] = [];
  private error?: string;
  private discoveryPhase?: DiscoveryPhase;
  private discoveryProfilesRead = 0;
  private discoveryProfilesTotal = 0;

  private readonly chromeView: WebContentsView;
  private readonly getActiveTab: () => { view: WebContentsView } | undefined;
  private readonly credentialManager: CredentialManager | null;

  constructor(opts: {
    chromeView: WebContentsView;
    getActiveTab: () => { view: WebContentsView } | undefined;
    credentialManager: CredentialManager | null;
  }) {
    this.chromeView = opts.chromeView;
    this.getActiveTab = opts.getActiveTab;
    this.credentialManager = opts.credentialManager;
  }

  // -------------------------------------------------------------------
  // Public API (called from IPC handlers)
  // -------------------------------------------------------------------

  /** Restore agent from a previously saved state (skips discovery). */
  restore(saved: AgentStatus): AgentStatus {
    agentEvent(LOG_SRC, 'restore', `Restoring agent at step: ${saved.step}`);
    this.step = saved.step;
    this.profiles = saved.profiles;
    this.mappings = saved.mappings;
    this.changes = saved.changes;
    this.applyProgress = saved.applyProgress;
    this.error = saved.error;
    this.discoveryPhase = saved.discoveryPhase;
    this.discoveryProfilesRead = saved.discoveryProfilesRead ?? 0;
    this.discoveryProfilesTotal = saved.discoveryProfilesTotal ?? 0;
    this.pushStatus();
    return this.getStatus();
  }

  async start(): Promise<AgentStatus> {
    agentEvent(LOG_SRC, 'start', 'Starting Netflix configuration agent');
    this.step = 'discovering';
    this.profiles = [];
    this.mappings = [];
    this.changes = [];
    this.applyProgress = [];
    this.error = undefined;
    this.discoveryPhase = 'navigating';
    this.discoveryProfilesRead = 0;
    this.discoveryProfilesTotal = 0;
    this.pushStatus();

    try {
      const tab = this.getActiveTab();
      if (!tab) throw new Error('No active tab');

      // Phase 1: Navigate to profile management page
      this.discoveryPhase = 'navigating';
      this.pushStatus();
      agentInfo(LOG_SRC, 'phase', `Navigating to ${NETFLIX_URLS.profileManage}`);
      await tab.view.webContents.loadURL(NETFLIX_URLS.profileManage);
      await this.waitForNavigation(tab.view);
      agentDebug(LOG_SRC, 'nav-done', `Navigation complete, URL: ${tab.view.webContents.getURL()}`);

      // Phase 2: Check if we need to log in
      this.discoveryPhase = 'checking-login';
      this.pushStatus();
      agentInfo(LOG_SRC, 'phase', 'Checking login status');
      const isLogin = await this.isLoginPage(tab.view);
      agentDebug(LOG_SRC, 'login-check', `Login page detected: ${isLogin}`);

      if (isLogin) {
        // Phase 3: Auto-fill login
        this.discoveryPhase = 'logging-in';
        this.pushStatus();
        agentInfo(LOG_SRC, 'phase', 'Auto-filling Netflix credentials');
        await this.handleLogin(tab.view);
        agentInfo(LOG_SRC, 'login-done', 'Login submitted, reloading profile page');
        await tab.view.webContents.loadURL(NETFLIX_URLS.profileManage);
        await this.waitForNavigation(tab.view);
      }

      // Phase 4: Load profile page
      this.discoveryPhase = 'loading-profiles';
      this.pushStatus();
      agentInfo(LOG_SRC, 'phase', 'Waiting for profile page to render');
      await this.delay(1000); // let page render fully

      // Phase 5-6: Extract profiles (Falcor cache then DOM)
      this.profiles = await this.discoverProfiles(tab.view);
      agentEvent(LOG_SRC, 'profiles-discovered', `Discovered ${this.profiles.length} profiles`, {
        profiles: this.profiles.map((p) => ({ name: p.name, isKids: p.isKids, maturity: p.maturityLevel })),
      });

      // Phase 7: Done
      this.discoveryPhase = 'done';
      this.step = 'awaiting-mapping';
      this.pushStatus();
      agentEvent(LOG_SRC, 'step-change', 'Discovery complete, awaiting profile mapping');
      return this.getStatus();
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      agentError(LOG_SRC, 'start-error', `Agent failed: ${errMsg}`);
      this.step = 'error';
      this.error = errMsg;
      this.discoveryPhase = undefined;
      this.pushStatus();
      return this.getStatus();
    }
  }

  /** Pre-load mappings from saved state without advancing the step. */
  confirmMappingsPreload(mappings: ProfileMapping[]): void {
    this.mappings = mappings;
    this.pushStatus();
  }

  confirmMappings(mappings: ProfileMapping[]): AgentStatus {
    agentEvent(LOG_SRC, 'step-change', `Mappings confirmed (${mappings.length} profiles mapped)`, {
      mappings: mappings.map((m) => ({ profile: m.netflixProfile.name, member: m.familyMemberName, type: m.familyMemberType })),
    });
    this.mappings = mappings;
    this.step = 'awaiting-maturity';
    this.pushStatus();
    return this.getStatus();
  }

  confirmMaturity(mappings: ProfileMapping[]): AgentStatus {
    agentEvent(LOG_SRC, 'step-change', 'Maturity settings confirmed');
    this.mappings = mappings;
    this.step = 'awaiting-pins';
    this.pushStatus();
    return this.getStatus();
  }

  confirmPins(profileGuids: string[], pin: string): AgentStatus {
    // Generate PIN changes
    for (const guid of profileGuids) {
      const profile = this.profiles.find((p) => p.guid === guid);
      if (profile) {
        this.changes.push({
          id: `pin-${guid}`,
          type: 'pin',
          profileGuid: guid,
          profileName: profile.name,
          description: `Set 4-digit PIN on "${profile.name}"`,
          enabled: true,
          pin,
        });
      }
    }
    this.step = 'awaiting-locks';
    this.pushStatus();
    return this.getStatus();
  }

  confirmLocks(profileGuids: string[]): AgentStatus {
    for (const guid of profileGuids) {
      const profile = this.profiles.find((p) => p.guid === guid);
      if (profile) {
        this.changes.push({
          id: `lock-${guid}`,
          type: 'lock',
          profileGuid: guid,
          profileName: profile.name,
          description: `Lock profile "${profile.name}"`,
          enabled: true,
        });
      }
    }
    this.step = 'awaiting-autoplay';
    this.pushStatus();
    return this.getStatus();
  }

  confirmAutoplay(settings: { profileGuid: string; disable: boolean }[]): AgentStatus {
    for (const setting of settings) {
      if (!setting.disable) continue;
      const profile = this.profiles.find((p) => p.guid === setting.profileGuid);
      if (profile) {
        this.changes.push({
          id: `autoplay-${setting.profileGuid}`,
          type: 'autoplay',
          profileGuid: setting.profileGuid,
          profileName: profile.name,
          description: `Disable autoplay on "${profile.name}"`,
          enabled: true,
        });
      }
    }

    // Also add maturity changes from confirmed mappings
    for (const mapping of this.mappings) {
      if (
        mapping.familyMemberType === 'child' &&
        mapping.recommendedMaturity &&
        mapping.recommendedMaturity !== mapping.netflixProfile.maturityLevel
      ) {
        this.changes.push({
          id: `maturity-${mapping.netflixProfile.guid}`,
          type: 'maturity',
          profileGuid: mapping.netflixProfile.guid,
          profileName: mapping.netflixProfile.name,
          description: `Set maturity to "${this.maturityLabel(mapping.recommendedMaturity)}" on "${mapping.netflixProfile.name}"`,
          enabled: true,
          fromLevel: mapping.netflixProfile.maturityLevel,
          toLevel: mapping.recommendedMaturity,
        });
      }
    }

    this.step = 'reviewing';
    this.pushStatus();
    return this.getStatus();
  }

  updateChanges(changes: ConfigChange[]): AgentStatus {
    this.changes = changes;
    this.pushStatus();
    return this.getStatus();
  }

  async applyChanges(): Promise<AgentStatus> {
    const enabledChanges = this.changes.filter((c) => c.enabled);
    agentEvent(LOG_SRC, 'apply-start', `Applying ${enabledChanges.length} changes`, {
      changes: enabledChanges.map((c) => ({ id: c.id, type: c.type, profile: c.profileName })),
    });
    this.step = 'applying';
    this.applyProgress = enabledChanges.map((c) => ({
      changeId: c.id,
      status: 'pending' as const,
    }));
    this.pushStatus();

    for (const change of enabledChanges) {
      const progress = this.applyProgress.find((p) => p.changeId === change.id);
      if (!progress) continue;

      progress.status = 'applying';
      this.pushStatus();
      agentInfo(LOG_SRC, 'apply-change', `Applying: ${change.description}`, { changeId: change.id, type: change.type });

      try {
        await this.applyChange(change);
        progress.status = 'success';
        agentEvent(LOG_SRC, 'apply-success', `Success: ${change.description}`);
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err);
        progress.status = 'failed';
        progress.error = errMsg;
        agentError(LOG_SRC, 'apply-failed', `Failed: ${change.description} — ${errMsg}`);
      }
      this.pushStatus();
    }

    const anyFailed = this.applyProgress.some((p) => p.status === 'failed');
    this.step = anyFailed ? 'error' : 'complete';
    if (anyFailed) {
      this.error = 'Some changes failed to apply. See details above.';
      agentWarn(LOG_SRC, 'apply-partial', 'Some changes failed to apply');
    } else {
      agentEvent(LOG_SRC, 'apply-complete', 'All changes applied successfully');
    }
    this.pushStatus();
    return this.getStatus();
  }

  cancel(): void {
    this.step = 'idle';
    this.profiles = [];
    this.mappings = [];
    this.changes = [];
    this.applyProgress = [];
    this.error = undefined;
    this.pushStatus();
  }

  getStatus(): AgentStatus {
    return {
      step: this.step,
      profiles: this.profiles,
      mappings: this.mappings,
      changes: this.changes,
      applyProgress: this.applyProgress,
      error: this.error,
      discoveryPhase: this.discoveryPhase,
      discoveryProfilesRead: this.discoveryProfilesRead,
      discoveryProfilesTotal: this.discoveryProfilesTotal,
    };
  }

  // -------------------------------------------------------------------
  // Profile discovery
  // -------------------------------------------------------------------

  private async discoverProfiles(view: WebContentsView): Promise<NetflixProfile[]> {
    // Try Falcor cache first
    this.discoveryPhase = 'extracting-cache';
    this.pushStatus();
    agentInfo(LOG_SRC, 'phase', 'Attempting Falcor cache extraction');
    try {
      const falcorProfiles = await this.extractFromFalcorCache(view);
      if (falcorProfiles.length > 0) {
        agentEvent(LOG_SRC, 'falcor-success', `Falcor cache: found ${falcorProfiles.length} profiles`);
        this.discoveryProfilesTotal = falcorProfiles.length;
        this.discoveryProfilesRead = falcorProfiles.length;
        this.pushStatus();
        return falcorProfiles;
      }
      agentDebug(LOG_SRC, 'falcor-empty', 'Falcor cache returned 0 profiles, falling back to DOM');
    } catch (err) {
      agentWarn(LOG_SRC, 'falcor-failed', `Falcor extraction failed: ${err instanceof Error ? err.message : err}`);
    }

    // Fall back to DOM scraping
    this.discoveryPhase = 'scraping-dom';
    this.pushStatus();
    agentInfo(LOG_SRC, 'phase', 'Falling back to DOM scraping');
    const profiles = await this.scrapeProfilesFromDOM(view);
    agentEvent(LOG_SRC, 'dom-scrape-done', `DOM scraping: found ${profiles.length} profiles`);
    this.discoveryProfilesTotal = profiles.length;
    this.discoveryProfilesRead = profiles.length;
    this.pushStatus();
    return profiles;
  }

  private async extractFromFalcorCache(view: WebContentsView): Promise<NetflixProfile[]> {
    const script = `
      (async function() {
        try {
          const cache = window.netflix?.falcorCache;
          if (!cache || !cache.profiles) return JSON.stringify([]);

          // Helper: convert an image URL to a data URI via canvas
          function toDataUri(url) {
            if (!url) return Promise.resolve('');
            return new Promise(resolve => {
              const img = new Image();
              img.crossOrigin = 'anonymous';
              img.onload = () => {
                try {
                  const c = document.createElement('canvas');
                  c.width = img.naturalWidth;
                  c.height = img.naturalHeight;
                  c.getContext('2d').drawImage(img, 0, 0);
                  resolve(c.toDataURL('image/png'));
                } catch (e) { resolve(url); }
              };
              img.onerror = () => resolve(url);
              setTimeout(() => resolve(url), 3000);
              img.src = url;
            });
          }

          const profiles = [];
          const profileKeys = Object.keys(cache.profiles);
          for (const key of profileKeys) {
            if (key === '$size' || key === 'length') continue;
            const p = cache.profiles[key];
            if (!p || !p.summary || !p.summary.value) continue;
            const s = p.summary.value;

            // Try multiple paths for avatar URL
            let avatarUrl = s.avatarUrl || '';
            if (!avatarUrl && p.avatar?.value?.url) {
              avatarUrl = p.avatar.value.url;
            }
            if (!avatarUrl && p.avatar?.value?.images?.byWidth) {
              const widths = Object.keys(p.avatar.value.images.byWidth);
              const best = widths.sort((a, b) => Number(b) - Number(a))[0];
              if (best) avatarUrl = p.avatar.value.images.byWidth[best]?.value || '';
            }
            if (!avatarUrl && s.avatarName) {
              // Netflix CDN pattern for known avatar names
              avatarUrl = 'https://occ-0-2794-3646.1.nflxso.net/dnm/api/v6/vN7bi_My87NPKvsBoib006Llxga/AAAABW-' + s.avatarName + '.png';
            }

            // Extract maturity — handle object, string, or numeric
            let maturityRaw = 'all';
            if (s.maturityLevel?.value !== undefined) {
              maturityRaw = String(s.maturityLevel.value);
            } else if (s.maturity?.value?.level !== undefined) {
              maturityRaw = String(s.maturity.value.level);
            } else if (typeof s.maturityLevel === 'string') {
              maturityRaw = s.maturityLevel;
            }

            // Detect kids profile from multiple Falcor fields
            const isKids = !!(
              s.isKids ||
              s.isKid ||
              s.kidsModeEnabled ||
              s.experience === 'kids' ||
              s.experience === 'jfk' ||
              s.type === 'kids' ||
              s.profileType === 'kids'
            );

            // Detect PIN from multiple Falcor fields
            const hasPIN = !!(
              s.hasPIN ||
              s.hasPin ||
              s.pinProtected ||
              s.isPinProtected ||
              s.profileLock?.hasPin ||
              s.profileLock?.value?.hasPin ||
              p.profileLock?.value?.hasPin ||
              p.pin?.value
            );

            // Detect lock from multiple fields
            const isLocked = !!(
              s.isLocked ||
              s.locked ||
              s.profileLock?.isLocked ||
              s.profileLock?.value?.isLocked ||
              p.profileLock?.value?.isLocked
            );

            profiles.push({
              guid: s.guid || key,
              name: s.profileName || 'Unknown',
              avatarUrl: avatarUrl,
              isKids: isKids,
              maturityLevel: maturityRaw,
              hasPIN: hasPIN,
              isLocked: isLocked,
              autoplayEnabled: s.autoplayEnabled !== false,
            });
          }

          // Also try to grab avatar URLs from DOM profile cards if Falcor missed them
          const domCards = document.querySelectorAll('[data-profile-guid], .profile-icon, .profile-button');
          for (const card of domCards) {
            const guid = card.getAttribute('data-profile-guid') || card.getAttribute('data-guid') || '';
            const img = card.querySelector('img');
            if (guid && img?.src) {
              const profile = profiles.find(p => p.guid === guid);
              if (profile && !profile.avatarUrl) {
                profile.avatarUrl = img.src;
              }
            }
          }

          // Convert avatar URLs to data URIs so they work outside Netflix context
          await Promise.all(profiles.map(async (p) => {
            if (p.avatarUrl && !p.avatarUrl.startsWith('data:')) {
              p.avatarUrl = await toDataUri(p.avatarUrl);
            }
          }));

          return JSON.stringify(profiles);
        } catch (e) {
          return JSON.stringify([]);
        }
      })()
    `;

    const result = await view.webContents.executeJavaScript(script);
    const profiles = JSON.parse(result) as NetflixProfile[];

    // Normalise maturity level values
    return profiles.map((p) => ({
      ...p,
      maturityLevel: this.normaliseMaturityLevel(p.maturityLevel),
    }));
  }

  private async scrapeProfilesFromDOM(view: WebContentsView): Promise<NetflixProfile[]> {
    const script = `
      (async function() {
        function toDataUri(url) {
          if (!url) return Promise.resolve('');
          return new Promise(resolve => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
              try {
                const c = document.createElement('canvas');
                c.width = img.naturalWidth;
                c.height = img.naturalHeight;
                c.getContext('2d').drawImage(img, 0, 0);
                resolve(c.toDataURL('image/png'));
              } catch (e) { resolve(url); }
            };
            img.onerror = () => resolve(url);
            setTimeout(() => resolve(url), 3000);
            img.src = url;
          });
        }

        const profiles = [];
        const cards = document.querySelectorAll('${NETFLIX_SELECTORS.profileCards}');
        cards.forEach(card => {
          const nameEl = card.querySelector('${NETFLIX_SELECTORS.profileName}') || card.closest('[class*="profile"]')?.querySelector('[class*="name"]');
          const isKids = !!card.querySelector('${NETFLIX_SELECTORS.kidsIndicator}');
          const guid = card.getAttribute('data-profile-guid') || card.getAttribute('data-guid') || '';
          const avatarImg = card.querySelector('img');

          profiles.push({
            guid: guid,
            name: nameEl?.textContent?.trim() || 'Unknown',
            avatarUrl: avatarImg?.src || '',
            isKids: isKids,
            maturityLevel: isKids ? 'older-kids' : 'all',
            hasPIN: false,
            isLocked: false,
            autoplayEnabled: true,
          });
        });

        // Convert avatar URLs to data URIs
        await Promise.all(profiles.map(async (p) => {
          if (p.avatarUrl && !p.avatarUrl.startsWith('data:')) {
            p.avatarUrl = await toDataUri(p.avatarUrl);
          }
        }));

        return JSON.stringify(profiles);
      })()
    `;

    const result = await view.webContents.executeJavaScript(script);
    return JSON.parse(result) as NetflixProfile[];
  }

  // -------------------------------------------------------------------
  // Apply changes
  // -------------------------------------------------------------------

  private async applyChange(change: ConfigChange): Promise<void> {
    const tab = this.getActiveTab();
    if (!tab) throw new Error('No active tab');

    switch (change.type) {
      case 'maturity':
        await this.applyMaturityChange(tab.view, change);
        break;
      case 'pin':
        await this.applyPinChange(tab.view, change);
        break;
      case 'lock':
        await this.applyLockChange(tab.view, change);
        break;
      case 'autoplay':
        await this.applyAutoplayChange(tab.view, change);
        break;
    }
  }

  private async applyMaturityChange(view: WebContentsView, change: ConfigChange): Promise<void> {
    // Navigate to the restrictions page for this profile
    agentInfo(LOG_SRC, 'maturity', `Navigating to restrictions page for ${change.profileName}`);
    await view.webContents.loadURL(NETFLIX_URLS.restrictions(change.profileGuid));
    await this.waitForNavigation(view);
    await this.delay(2000);

    // Handle MFA gate (restrictions always require it)
    await this.handleMfaGate(view);
    await this.delay(2000);

    // The restrictions page should now be loaded — inspect and set maturity
    // Netflix uses radio buttons with data-uia="maturity-{value}-radio" and numeric values:
    //   TV-Y=35, TV-Y7=41, TV-G/G=50, TV-PG/PG=70, PG-13=80, TV-14=90, R=100, TV-MA=110, NC-17=1000000
    // Our maturity levels map to maximum allowed ratings:
    //   little-kids → G/TV-G (value 50)
    //   older-kids  → PG/TV-PG (value 70)
    //   teens       → TV-14 (value 90)
    //   all         → NC-17 (value 1000000)
    agentInfo(LOG_SRC, 'maturity', `Setting maturity to ${change.toLevel}`);
    const maturitySet = await view.webContents.executeJavaScript(`
      (function() {
        var targetMap = {
          'little-kids': '50',
          'older-kids': '70',
          'teens': '90',
          'all': '1000000'
        };
        var target = ${JSON.stringify(change.toLevel)};
        var targetValue = targetMap[target];
        if (!targetValue) return null;

        // Find the radio button by data-uia or value
        var radio = document.querySelector('[data-uia="maturity-' + targetValue + '-radio"]');
        if (!radio) {
          radio = document.querySelector('input[name="maturity-rating"][value="' + targetValue + '"]');
        }
        if (radio) {
          radio.click();
          return 'radio:' + targetValue;
        }

        // Fallback: try all maturity radios and match by value
        var radios = document.querySelectorAll('input[name="maturity-rating"]');
        for (var i = 0; i < radios.length; i++) {
          if (radios[i].value === targetValue) {
            radios[i].click();
            return 'fallback-radio:' + targetValue;
          }
        }

        return null;
      })()
    `);

    if (!maturitySet) {
      agentWarn(LOG_SRC, 'maturity', 'Could not find maturity control on page');
      throw new Error('Could not find maturity rating control on Netflix restrictions page');
    }
    agentInfo(LOG_SRC, 'maturity', `Maturity set via: ${maturitySet}`);
    await this.delay(1000);

    // Click save/submit
    await this.clickSaveButton(view);
    await this.delay(2000);
  }

  private async applyPinChange(view: WebContentsView, change: ConfigChange): Promise<void> {
    if (!change.pin) return;

    // Profile Lock is on the profile settings page
    agentInfo(LOG_SRC, 'pin', `Navigating to profile settings for ${change.profileName}`);
    await view.webContents.loadURL(NETFLIX_URLS.profileSettings(change.profileGuid));
    await this.waitForNavigation(view);
    await this.delay(2000);

    // Click "Profile Lock" button
    agentInfo(LOG_SRC, 'pin', 'Clicking Profile Lock button');
    await this.clickButton(view, NETFLIX_SELECTORS.profileLockButton);
    await this.delay(2000);

    // Handle MFA gate
    await this.handleMfaGate(view);
    await this.delay(2000);

    // Fill the PIN input
    agentInfo(LOG_SRC, 'pin', 'Filling PIN');
    const pinFilled = await view.webContents.executeJavaScript(`
      (function() {
        // Look for PIN input fields (often 4 separate inputs or one input)
        var pinInputs = document.querySelectorAll('input[type="tel"], input[type="number"], input[inputmode="numeric"], input[maxlength="4"], input[maxlength="1"]');
        if (pinInputs.length === 0) {
          pinInputs = document.querySelectorAll('input[type="text"]');
        }

        var pin = ${JSON.stringify(change.pin)};
        var setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;

        if (pinInputs.length === 4) {
          // 4 separate digit inputs
          for (var i = 0; i < 4; i++) {
            setter.call(pinInputs[i], pin[i]);
            pinInputs[i].dispatchEvent(new Event('input', { bubbles: true }));
            pinInputs[i].dispatchEvent(new Event('change', { bubbles: true }));
          }
          return 'filled-4-inputs';
        } else if (pinInputs.length >= 1) {
          // Single PIN input
          setter.call(pinInputs[0], pin);
          pinInputs[0].dispatchEvent(new Event('input', { bubbles: true }));
          pinInputs[0].dispatchEvent(new Event('change', { bubbles: true }));
          return 'filled-single-input';
        }
        return null;
      })()
    `);

    if (!pinFilled) {
      throw new Error('Could not find PIN input fields on Netflix Profile Lock page');
    }
    agentInfo(LOG_SRC, 'pin', `PIN filled: ${pinFilled}`);
    await this.delay(500);

    await this.clickSaveButton(view);
    await this.delay(2000);
  }

  private async applyLockChange(view: WebContentsView, change: ConfigChange): Promise<void> {
    // Profile Lock is on the profile settings page
    agentInfo(LOG_SRC, 'lock', `Navigating to profile settings for ${change.profileName}`);
    await view.webContents.loadURL(NETFLIX_URLS.profileSettings(change.profileGuid));
    await this.waitForNavigation(view);
    await this.delay(2000);

    // Click "Profile Lock" button
    agentInfo(LOG_SRC, 'lock', 'Clicking Profile Lock button');
    await this.clickButton(view, NETFLIX_SELECTORS.profileLockButton);
    await this.delay(2000);

    // Handle MFA gate
    await this.handleMfaGate(view);
    await this.delay(2000);

    // Toggle the lock on
    const locked = await view.webContents.executeJavaScript(`
      (function() {
        // Look for toggle/checkbox for profile lock
        var toggles = document.querySelectorAll('input[type="checkbox"], [role="switch"]');
        for (var i = 0; i < toggles.length; i++) {
          var label = toggles[i].closest('label') || document.querySelector('label[for="' + toggles[i].id + '"]');
          var parent = toggles[i].closest('[class*="lock"], [class*="Lock"], [data-uia*="lock"]');
          if (label || parent) {
            if (!toggles[i].checked) toggles[i].click();
            return true;
          }
        }

        // Try clicking a button that enables the lock
        var btns = document.querySelectorAll('button');
        for (var j = 0; j < btns.length; j++) {
          var text = (btns[j].textContent || '').toLowerCase();
          if (text.includes('enable') || text.includes('lock') || text.includes('turn on')) {
            btns[j].click();
            return true;
          }
        }
        return false;
      })()
    `);

    if (!locked) {
      throw new Error('Could not find profile lock toggle on Netflix settings page');
    }
    await this.delay(500);

    await this.clickSaveButton(view);
    await this.delay(2000);
  }

  private async applyAutoplayChange(view: WebContentsView, change: ConfigChange): Promise<void> {
    // Autoplay is on the playback settings page — NO MFA required
    agentInfo(LOG_SRC, 'autoplay', `Navigating to playback settings for ${change.profileName}`);
    await view.webContents.loadURL(NETFLIX_URLS.playback(change.profileGuid));
    await this.waitForNavigation(view);
    await this.delay(2000);

    // Disable autoplay toggles
    const disabled = await view.webContents.executeJavaScript(`
      (function() {
        var results = [];

        // Find all checkboxes/toggles on the page
        var toggles = document.querySelectorAll('input[type="checkbox"], [role="switch"]');
        var pageText = document.body.innerText.toLowerCase();

        for (var i = 0; i < toggles.length; i++) {
          var label = toggles[i].closest('label') || document.querySelector('label[for="' + toggles[i].id + '"]');
          var parent = toggles[i].parentElement;
          var context = '';
          if (label) context = label.textContent.toLowerCase();
          else if (parent) context = parent.textContent.toLowerCase();

          // Check if this toggle is related to autoplay
          var isAutoplay = context.includes('autoplay') ||
            toggles[i].getAttribute('data-uia')?.includes('autoplay') ||
            toggles[i].name?.includes('autoplay');

          if (isAutoplay && toggles[i].checked) {
            toggles[i].click();
            results.push('toggled: ' + context.substring(0, 40));
          }
        }

        // Also check for "Autoplay next episode" and "Autoplay previews" text
        // Netflix renders these as toggle rows
        var rows = document.querySelectorAll('[class*="toggle"], [class*="Toggle"], [class*="switch"], [class*="Switch"]');
        for (var j = 0; j < rows.length; j++) {
          var rowText = (rows[j].textContent || '').toLowerCase();
          if (rowText.includes('autoplay')) {
            var toggle = rows[j].querySelector('input[type="checkbox"], [role="switch"]');
            if (toggle && toggle.checked) {
              toggle.click();
              results.push('row-toggled: ' + rowText.substring(0, 40));
            }
          }
        }

        return results.length > 0 ? JSON.stringify(results) : null;
      })()
    `);

    if (!disabled) {
      agentWarn(LOG_SRC, 'autoplay', 'No autoplay toggles found or already disabled');
    } else {
      agentInfo(LOG_SRC, 'autoplay', `Autoplay disabled: ${disabled}`);
    }
    await this.delay(1000);

    // Save changes — playback page may auto-save or have a save button
    await this.clickSaveButton(view);
    await this.delay(2000);
  }

  // -------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------

  private async isLoginPage(view: WebContentsView): Promise<boolean> {
    const url = view.webContents.getURL().toLowerCase();
    if (url.includes('netflix.com/login')) return true;

    const hasLoginForm = await view.webContents.executeJavaScript(`
      !!document.querySelector('${NETFLIX_SELECTORS.loginForm}')
    `);
    return !!hasLoginForm;
  }

  private async handleLogin(view: WebContentsView): Promise<void> {
    if (!this.credentialManager) {
      throw new Error('Not logged in to Netflix. Please sign in first.');
    }

    const data = this.credentialManager.getAutoFillData('https://www.netflix.com/login');
    if (!data) {
      throw new Error('No Netflix credentials stored. Please sign in to Netflix first.');
    }

    const { username, password, service } = data;
    const fillScript = `
      (function() {
        function fill(selector, value) {
          const el = document.querySelector(selector);
          if (!el) return false;
          const nativeSetter = Object.getOwnPropertyDescriptor(
            window.HTMLInputElement.prototype, 'value'
          )?.set;
          if (nativeSetter) {
            nativeSetter.call(el, value);
          } else {
            el.value = value;
          }
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
          return true;
        }
        fill(${JSON.stringify(service.selectors.username)}, ${JSON.stringify(username)});
        fill(${JSON.stringify(service.selectors.password)}, ${JSON.stringify(password)});
      })()
    `;

    await this.delay(1500);
    await view.webContents.executeJavaScript(fillScript);
    await this.delay(500);

    // Click submit
    const submitSelector = service.selectors.submit ?? 'button[type="submit"]';
    await this.clickButton(view, submitSelector);
    await this.delay(5000);
  }

  /**
   * Handle Netflix's MFA gate that appears before sensitive settings pages.
   * Detects the MFA page, clicks "Confirm password", fills the password, and submits.
   * No-ops if no MFA gate is detected.
   */
  private async handleMfaGate(view: WebContentsView): Promise<void> {
    const url = view.webContents.getURL();
    const isMfaPage = url.includes('/mfa');

    // Also check page text for MFA indicators
    const hasMfaText = await view.webContents.executeJavaScript(`
      (function() {
        var text = (document.body.innerText || '').toLowerCase();
        return text.includes('make sure') || text.includes('confirm password') || text.includes('verify your identity');
      })()
    `);

    if (!isMfaPage && !hasMfaText) {
      agentDebug(LOG_SRC, 'mfa', 'No MFA gate detected, continuing');
      return;
    }

    agentInfo(LOG_SRC, 'mfa', 'MFA gate detected, handling password confirmation');

    // Step 1: Click "Confirm password" button if present
    const clickedPasswordOption = await view.webContents.executeJavaScript(`
      (function() {
        // Try the specific data-uia selector first
        var btn = document.querySelector('${NETFLIX_SELECTORS.mfaPasswordButton}');
        if (btn) { btn.click(); return 'data-uia'; }

        // Fallback: find button with "password" or "Confirm password" text
        var btns = document.querySelectorAll('button');
        for (var i = 0; i < btns.length; i++) {
          var text = (btns[i].textContent || '').toLowerCase();
          if (text.includes('confirm password') || text.includes('password')) {
            btns[i].click();
            return 'text:' + text.substring(0, 30);
          }
        }
        return null;
      })()
    `);

    if (clickedPasswordOption) {
      agentDebug(LOG_SRC, 'mfa', `Clicked password option: ${clickedPasswordOption}`);
      await this.delay(2000);
    }

    // Step 2: Fill the password
    if (!this.credentialManager) {
      throw new Error('MFA gate requires Netflix password but no credential manager available');
    }

    const data = this.credentialManager.getAutoFillData('https://www.netflix.com/login');
    if (!data) {
      throw new Error('MFA gate requires Netflix password but no credentials stored');
    }

    const passwordFilled = await view.webContents.executeJavaScript(`
      (function() {
        var el = document.querySelector(${JSON.stringify(NETFLIX_SELECTORS.mfaPasswordInput)});
        if (!el) {
          // Broader fallback
          el = document.querySelector(${JSON.stringify(NETFLIX_SELECTORS.passwordInput)});
        }
        if (!el) return false;

        var setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
        setter.call(el, ${JSON.stringify(data.password)});
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
      })()
    `);

    if (!passwordFilled) {
      throw new Error('Could not find password input on MFA page');
    }
    agentInfo(LOG_SRC, 'mfa', 'Password filled');
    await this.delay(500);

    // Step 3: Submit
    const submitted = await view.webContents.executeJavaScript(`
      (function() {
        // Try specific MFA submit button
        var btn = document.querySelector(${JSON.stringify(NETFLIX_SELECTORS.mfaSubmitButton)});
        if (btn) { btn.click(); return 'data-uia'; }

        // Fallback to any submit button
        btn = document.querySelector('button[type="submit"]');
        if (btn) { btn.click(); return 'submit-btn'; }

        // Fallback to button with submit-like text
        var btns = document.querySelectorAll('button');
        for (var i = 0; i < btns.length; i++) {
          var text = (btns[i].textContent || '').toLowerCase();
          if (text.includes('continue') || text.includes('submit') || text.includes('confirm') || text.includes('verify')) {
            btns[i].click();
            return 'text:' + text.substring(0, 30);
          }
        }
        return null;
      })()
    `);

    if (!submitted) {
      throw new Error('Could not find submit button on MFA page');
    }
    agentInfo(LOG_SRC, 'mfa', `MFA submitted via: ${submitted}`);
    await this.delay(4000);
    await this.waitForNavigation(view);
  }

  /**
   * Find and click a save/submit button on the current Netflix settings page.
   * Silently no-ops if no save button is found (some pages auto-save).
   */
  private async clickSaveButton(view: WebContentsView): Promise<void> {
    const clicked = await view.webContents.executeJavaScript(`
      (function() {
        // Try submit button first
        var btn = document.querySelector('button[type="submit"]');
        if (btn) { btn.click(); return 'submit'; }

        // Try data-uia save button
        btn = document.querySelector('[data-uia*="save"], [data-uia*="submit"]');
        if (btn) { btn.click(); return 'data-uia'; }

        // Try button text
        var btns = document.querySelectorAll('button');
        for (var i = 0; i < btns.length; i++) {
          var text = (btns[i].textContent || '').toLowerCase().trim();
          if (text === 'save' || text === 'save changes' || text === 'submit' || text === 'done' || text === 'apply') {
            btns[i].click();
            return 'text:' + text;
          }
        }
        return null;
      })()
    `);

    if (clicked) {
      agentInfo(LOG_SRC, 'save', `Clicked save button: ${clicked}`);
    } else {
      agentDebug(LOG_SRC, 'save', 'No save button found (page may auto-save)');
    }
  }

  private async clickButton(view: WebContentsView, selector: string): Promise<void> {
    await view.webContents.executeJavaScript(`
      (function() {
        const btn = document.querySelector(${JSON.stringify(selector)});
        if (btn) { btn.click(); return true; }
        return false;
      })()
    `);
  }

  private async waitForNavigation(view: WebContentsView): Promise<void> {
    return new Promise<void>((resolve) => {
      const timeout = setTimeout(() => resolve(), 10000);
      const handler = () => {
        clearTimeout(timeout);
        resolve();
      };
      view.webContents.once('did-stop-loading', handler);
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private normaliseMaturityLevel(raw: string): NetflixMaturityLevel {
    const lower = (raw || '').toLowerCase().replace(/[\s_]/g, '-');

    // Handle Netflix numeric maturity levels
    // TV-Y=35, TV-Y7=41, TV-G/G=50, TV-PG/PG=70, PG-13=80, TV-14=90, R=100, TV-MA=110, NC-17=1000000
    const num = Number(raw);
    if (!isNaN(num) && num > 0) {
      if (num <= 50) return 'little-kids';   // TV-Y, TV-Y7, TV-G/G
      if (num <= 70) return 'older-kids';    // TV-PG/PG
      if (num <= 90) return 'teens';         // PG-13, TV-14
      return 'all';                          // R, TV-MA, NC-17
    }

    if (lower.includes('little')) return 'little-kids';
    if (lower.includes('older')) return 'older-kids';
    if (lower.includes('teen')) return 'teens';
    return 'all';
  }

  private maturityLabel(level: NetflixMaturityLevel): string {
    const found = NETFLIX_MATURITY_LEVELS.find((m) => m.value === level);
    return found?.label ?? level;
  }

  private pushStatus(): void {
    if (!this.chromeView || this.chromeView.webContents.isDestroyed()) return;
    try {
      this.chromeView.webContents.send('config-agent:status-update', this.getStatus());
    } catch {
      // Chrome view may be destroyed
    }
  }
}
