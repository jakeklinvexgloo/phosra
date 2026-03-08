/**
 * Chrome UI preload script.
 *
 * Runs in the chrome UI WebContentsView with `contextIsolation: true`.
 * Exposes a typed IPC bridge to the renderer via `contextBridge.exposeInMainWorld`.
 *
 * The renderer accesses these methods via `window.electronAPI.*`.
 */

import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

export interface TabInfo {
  id: number;
  title: string;
  url: string;
  favicon?: string;
  isLoading: boolean;
  canGoBack: boolean;
  canGoForward: boolean;
}

export interface TabStateUpdate {
  tabs: TabInfo[];
  activeTabId: number | null;
}

export interface TabCreateResult extends TabInfo {}

export interface ActionResult {
  success: boolean;
  error?: string;
}

export interface ProfileSwitchResult {
  success: boolean;
  profilePath?: string;
  error?: string;
}

export interface CredentialInfo {
  serviceId: string;
  displayName: string;
  username: string;
  hasPassword: boolean;
  updatedAt: string;
  isCustom: boolean;
  loginUrl?: string;
}

export interface AutoFillNotification {
  tabId: number;
  service: { serviceId: string; displayName: string } | null;
}

export interface MfaChallengeNotification {
  tabId: number;
  serviceName: string;
}

export interface AuthInfo {
  email: string;
  isLoggedIn: boolean;
  expiresAt: string;
}

export interface CSMEnrichmentUpdate {
  title: string;
  status: 'cached' | 'scraped' | 'not-found' | 'error';
  review?: {
    csmSlug: string;
    csmUrl: string;
    csmMediaType: string;
    title: string;
    ageRating: string;
    ageRangeMin: number;
    qualityStars: number;
    isFamilyFriendly: boolean;
    reviewSummary: string;
    parentSummary: string;
    descriptors: { category: string; level: string }[];
    scrapedAt: string;
  };
}

export type Strictness = 'recommended' | 'strict' | 'relaxed';

export interface QuickSetupRequest {
  family_name?: string;
  child_name: string;
  birth_date: string;
  strictness: Strictness;
}

export interface QuickSetupResponse {
  family_id: string;
  child_id: string;
  policy_count: number;
}

export interface Family {
  id: string;
  name: string;
  created_at: string;
}

export interface Child {
  id: string;
  family_id: string;
  name: string;
  birth_date: string;
  created_at: string;
}

export interface ChildPolicy {
  id: string;
  child_id: string;
  rule_category: string;
  enabled: boolean;
  config: Record<string, unknown>;
}

export type FamilyRole = 'owner' | 'parent' | 'guardian';

export interface FamilyMember {
  id: string;
  family_id: string;
  user_id: string;
  role: FamilyRole;
  email?: string;
  name?: string;
  display_name?: string;
  joined_at: string;
}

const electronAPI = {
  // -------------------------------------------------------------------
  // Tab operations
  // -------------------------------------------------------------------

  /** Create a new tab, optionally navigating to a URL. */
  createTab: (url?: string): Promise<TabCreateResult> => {
    return ipcRenderer.invoke('tab:create', url);
  },

  /** Close a tab by its ID. */
  closeTab: (id: number): Promise<ActionResult> => {
    return ipcRenderer.invoke('tab:close', id);
  },

  /** Switch to a tab by its ID. */
  switchTab: (id: number): Promise<ActionResult> => {
    return ipcRenderer.invoke('tab:switch', id);
  },

  /** List all open tabs and the active tab ID. */
  listTabs: (): Promise<TabStateUpdate> => {
    return ipcRenderer.invoke('tab:list');
  },

  /** Navigate the active tab to a URL. */
  navigate: (url: string): Promise<ActionResult> => {
    return ipcRenderer.invoke('tab:navigate', url);
  },

  /** Navigate the active tab back. */
  goBack: (): Promise<ActionResult> => {
    return ipcRenderer.invoke('tab:go-back');
  },

  /** Navigate the active tab forward. */
  goForward: (): Promise<ActionResult> => {
    return ipcRenderer.invoke('tab:go-forward');
  },

  /** Reload the active tab. */
  reload: (): Promise<ActionResult> => {
    return ipcRenderer.invoke('tab:reload');
  },

  // -------------------------------------------------------------------
  // Events (main -> renderer push notifications)
  // -------------------------------------------------------------------

  /** Subscribe to tab state updates pushed from the main process. */
  onTabStateUpdate: (callback: (data: TabStateUpdate) => void): (() => void) => {
    const handler = (_event: IpcRendererEvent, data: TabStateUpdate) => {
      callback(data);
    };
    ipcRenderer.on('tab:state-update', handler);

    // Return a cleanup function to remove the listener
    return () => {
      ipcRenderer.removeListener('tab:state-update', handler);
    };
  },

  // -------------------------------------------------------------------
  // Chrome UI layout
  // -------------------------------------------------------------------

  /** Expand or collapse the chrome view to show dropdowns. */
  setChromeExpanded: (expanded: boolean): Promise<ActionResult> => {
    return ipcRenderer.invoke('chrome:set-expanded', expanded);
  },

  /** Dynamically set the chrome view height to fit panel content. */
  setChromeHeight: (height: number): Promise<ActionResult> => {
    return ipcRenderer.invoke('chrome:set-height', height);
  },

  // -------------------------------------------------------------------
  // Profile operations
  // -------------------------------------------------------------------

  /** List all available browser profiles. */
  listProfiles: (): Promise<string[]> => {
    return ipcRenderer.invoke('profile:list');
  },

  /** Switch to (or create) a named profile. */
  switchProfile: (name: string): Promise<ProfileSwitchResult> => {
    return ipcRenderer.invoke('profile:switch', name);
  },

  // -------------------------------------------------------------------
  // Credential operations
  // -------------------------------------------------------------------

  /** Check if OS keychain encryption is available. */
  checkCredentials: (): Promise<boolean> => {
    return ipcRenderer.invoke('credentials:check');
  },

  /** List all credentials (passwords are NOT included). */
  listCredentials: (): Promise<CredentialInfo[]> => {
    return ipcRenderer.invoke('credentials:list');
  },

  /** Save a credential for a streaming service. */
  saveCredential: (serviceId: string, username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    return ipcRenderer.invoke('credentials:save', serviceId, username, password);
  },

  /** Save a credential for a custom provider. */
  saveCustomCredential: (
    name: string,
    loginUrl: string,
    username: string,
    password: string,
    existingServiceId?: string,
  ): Promise<{ success: boolean; error?: string }> => {
    return ipcRenderer.invoke('credentials:save-custom', name, loginUrl, username, password, existingServiceId);
  },

  /** Delete a stored credential. */
  deleteCredential: (serviceId: string): Promise<{ success: boolean }> => {
    return ipcRenderer.invoke('credentials:delete', serviceId);
  },

  /** Subscribe to auto-fill availability notifications. */
  onAutoFillAvailable: (callback: (data: AutoFillNotification) => void): (() => void) => {
    const handler = (_event: IpcRendererEvent, data: AutoFillNotification) => {
      callback(data);
    };
    ipcRenderer.on('credentials:autofill-available', handler);
    return () => {
      ipcRenderer.removeListener('credentials:autofill-available', handler);
    };
  },

  /** Subscribe to MFA challenge detection notifications. */
  onMfaChallenge: (callback: (data: MfaChallengeNotification) => void): (() => void) => {
    const handler = (_event: IpcRendererEvent, data: MfaChallengeNotification) => {
      callback(data);
    };
    ipcRenderer.on('mfa:challenge-detected', handler);
    return () => {
      ipcRenderer.removeListener('mfa:challenge-detected', handler);
    };
  },

  // -------------------------------------------------------------------
  // Auth operations
  // -------------------------------------------------------------------

  /** Get current auth status. */
  getAuthStatus: (): Promise<AuthInfo> => {
    return ipcRenderer.invoke('auth:status');
  },

  /** Log out (clear stored token). */
  logout: (): Promise<ActionResult> => {
    return ipcRenderer.invoke('auth:logout');
  },

  /** Open phosra.com/login in a new tab. */
  loginNavigate: (): Promise<ActionResult> => {
    return ipcRenderer.invoke('auth:login-navigate');
  },

  /** Subscribe to auth status changes pushed from main process. */
  onAuthStatusChanged: (callback: (data: AuthInfo) => void): (() => void) => {
    const handler = (_event: IpcRendererEvent, data: AuthInfo) => {
      callback(data);
    };
    ipcRenderer.on('auth:status-changed', handler);
    return () => {
      ipcRenderer.removeListener('auth:status-changed', handler);
    };
  },

  // -------------------------------------------------------------------
  // Family operations
  // -------------------------------------------------------------------

  /** Quick setup: create family + child + policies in one call. */
  quickSetup: (req: QuickSetupRequest): Promise<{ success: boolean; data?: QuickSetupResponse; error?: string }> => {
    return ipcRenderer.invoke('family:quick-setup', req);
  },

  /** List all families for the authenticated user. */
  listFamilies: (): Promise<{ success: boolean; data?: Family[]; error?: string }> => {
    return ipcRenderer.invoke('family:list');
  },

  /** List children in a family. */
  listFamilyChildren: (familyId: string): Promise<{ success: boolean; data?: Child[]; error?: string }> => {
    return ipcRenderer.invoke('family:children', familyId);
  },

  /** List policies for a child. */
  listChildPolicies: (childId: string): Promise<{ success: boolean; data?: ChildPolicy[]; error?: string }> => {
    return ipcRenderer.invoke('family:child-policies', childId);
  },

  /** Add a child to an existing family. */
  addChild: (familyId: string, name: string, birthDate: string): Promise<{ success: boolean; data?: Child; error?: string }> => {
    return ipcRenderer.invoke('family:add-child', familyId, name, birthDate);
  },

  /** List members (parents/guardians) in a family. */
  listFamilyMembers: (familyId: string): Promise<{ success: boolean; data?: FamilyMember[]; error?: string }> => {
    return ipcRenderer.invoke('family:members', familyId);
  },

  /** Add a member (parent/guardian) by email. */
  addFamilyMember: (familyId: string, email: string, role: FamilyRole, displayName?: string): Promise<{ success: boolean; data?: FamilyMember; error?: string }> => {
    return ipcRenderer.invoke('family:add-member', familyId, email, role, displayName);
  },

  /** Remove a member from a family. */
  removeFamilyMember: (familyId: string, memberId: string): Promise<{ success: boolean; error?: string }> => {
    return ipcRenderer.invoke('family:remove-member', familyId, memberId);
  },

  /** Update a child's name and birth date. */
  updateChild: (childId: string, name: string, birthDate: string): Promise<{ success: boolean; data?: Child; error?: string }> => {
    return ipcRenderer.invoke('family:update-child', childId, name, birthDate);
  },

  /** Update a family member's display name and role. */
  updateFamilyMember: (familyId: string, memberId: string, displayName: string, role: FamilyRole): Promise<{ success: boolean; data?: FamilyMember; error?: string }> => {
    return ipcRenderer.invoke('family:update-member', familyId, memberId, displayName, role);
  },

  // -------------------------------------------------------------------
  // Config agent operations
  // -------------------------------------------------------------------

  /** Check if there's a saved config agent state to resume. */
  configAgentCheckSaved: (): Promise<{ success: boolean; data?: unknown }> => {
    return ipcRenderer.invoke('config-agent:check-saved');
  },

  /** Resume a previously saved config agent session. */
  configAgentResume: (): Promise<{ success: boolean; data?: unknown; error?: string }> => {
    return ipcRenderer.invoke('config-agent:resume');
  },

  /** Start the Netflix config agent (profile discovery). */
  configAgentStart: (): Promise<{ success: boolean; data?: unknown; error?: string }> => {
    return ipcRenderer.invoke('config-agent:start');
  },

  /** Confirm profile-to-family mappings. */
  configAgentConfirmMappings: (mappings: unknown[]): Promise<{ success: boolean; data?: unknown; error?: string }> => {
    return ipcRenderer.invoke('config-agent:confirm-mappings', mappings);
  },

  /** Confirm maturity settings. */
  configAgentConfirmMaturity: (mappings: unknown[]): Promise<{ success: boolean; data?: unknown; error?: string }> => {
    return ipcRenderer.invoke('config-agent:confirm-maturity', mappings);
  },

  /** Set PINs on selected profiles. */
  configAgentConfirmPins: (profileGuids: string[], pin: string): Promise<{ success: boolean; data?: unknown; error?: string }> => {
    return ipcRenderer.invoke('config-agent:confirm-pins', profileGuids, pin);
  },

  /** Lock selected profiles. */
  configAgentConfirmLocks: (profileGuids: string[]): Promise<{ success: boolean; data?: unknown; error?: string }> => {
    return ipcRenderer.invoke('config-agent:confirm-locks', profileGuids);
  },

  /** Set autoplay preferences. */
  configAgentConfirmAutoplay: (settings: { profileGuid: string; disable: boolean }[]): Promise<{ success: boolean; data?: unknown; error?: string }> => {
    return ipcRenderer.invoke('config-agent:confirm-autoplay', settings);
  },

  /** Update the change list (toggle items on/off). */
  configAgentUpdateChanges: (changes: unknown[]): Promise<{ success: boolean; data?: unknown; error?: string }> => {
    return ipcRenderer.invoke('config-agent:update-changes', changes);
  },

  /** Apply all enabled changes. */
  configAgentApply: (): Promise<{ success: boolean; data?: unknown; error?: string }> => {
    return ipcRenderer.invoke('config-agent:apply');
  },

  /** Cancel the config agent. */
  configAgentCancel: (): Promise<{ success: boolean }> => {
    return ipcRenderer.invoke('config-agent:cancel');
  },

  /** Resize the active tab to make room for the config drawer. */
  configAgentSetTabInset: (right: number): Promise<{ success: boolean }> => {
    return ipcRenderer.invoke('config-agent:set-tab-inset', right);
  },

  /** Subscribe to config agent status updates. */
  onConfigAgentStatusUpdate: (callback: (data: unknown) => void): (() => void) => {
    const handler = (_event: IpcRendererEvent, data: unknown) => {
      callback(data);
    };
    ipcRenderer.on('config-agent:status-update', handler);
    return () => {
      ipcRenderer.removeListener('config-agent:status-update', handler);
    };
  },

  // -------------------------------------------------------------------
  // Netflix viewing activity
  // -------------------------------------------------------------------

  /** Load persisted child-to-Netflix-profile mappings. */
  loadNetflixMappings: (): Promise<{ success: boolean; data?: unknown[] }> => {
    return ipcRenderer.invoke('netflix:load-mappings');
  },

  /** Load persisted viewing activity (survives app restart). */
  loadNetflixActivity: (): Promise<{ success: boolean; data?: unknown[] }> => {
    return ipcRenderer.invoke('netflix:load-activity');
  },
  resyncNetflixBackend: (): Promise<{ success: boolean; synced?: number; skipped?: number; error?: string }> => {
    return ipcRenderer.invoke('netflix:resync-backend');
  },

  /** Fetch Netflix viewing activity for child profiles. */
  fetchNetflixActivity: (mappings: { childName: string; childId: string; profileGuid: string; profileName: string; avatarUrl: string }[]): Promise<{ success: boolean; data?: unknown[]; error?: string }> => {
    return ipcRenderer.invoke('netflix:fetch-activity', mappings);
  },

  // -------------------------------------------------------------------
  // CSM Enrichment
  // -------------------------------------------------------------------

  /** Trigger CSM enrichment for a list of Netflix titles. */
  enrichCSMTitles: (titles: string[]): Promise<{ success: boolean; error?: string }> => {
    return ipcRenderer.invoke('csm:enrich-titles', titles);
  },

  /** Get all cached CSM reviews. */
  getCSMCachedReviews: (): Promise<{ success: boolean; data?: unknown[]; error?: string }> => {
    return ipcRenderer.invoke('csm:get-cached');
  },

  /** Get CSM cache stats (total, fresh, stale). */
  getCSMCacheStats: (): Promise<{ success: boolean; data?: { total: number; fresh: number; stale: number }; error?: string }> => {
    return ipcRenderer.invoke('csm:get-cache-stats');
  },

  /** Get shallow CSM reviews (missing deep fields like ageExplanation, positiveContent). */
  getCSMShallowReviews: (): Promise<{ success: boolean; data?: { count: number; titles: string[] }; error?: string }> => {
    return ipcRenderer.invoke('csm:get-shallow-reviews');
  },

  /** Force re-scrape shallow reviews to get deep data. */
  rescrapeShallowReviews: (): Promise<{ success: boolean; count?: number; error?: string }> => {
    return ipcRenderer.invoke('csm:rescrape-shallow');
  },

  /** Subscribe to CSM enrichment updates (per-title results as they arrive). */
  onCSMEnrichmentUpdate: (callback: (data: CSMEnrichmentUpdate) => void): (() => void) => {
    const handler = (_event: IpcRendererEvent, data: CSMEnrichmentUpdate) => {
      callback(data);
    };
    ipcRenderer.on('csm:enrichment-update', handler);
    return () => {
      ipcRenderer.removeListener('csm:enrichment-update', handler);
    };
  },

  /** Subscribe to CSM enrichment completion. */
  onCSMEnrichmentComplete: (callback: () => void): (() => void) => {
    const handler = () => {
      callback();
    };
    ipcRenderer.on('csm:enrichment-complete', handler);
    return () => {
      ipcRenderer.removeListener('csm:enrichment-complete', handler);
    };
  },

  // Profile → Child mapping
  saveProfileChildMap: (map: { profileGuid: string; profileName: string; children: { childId: string; childName: string }[] }[]): Promise<{ success: boolean }> => {
    return ipcRenderer.invoke('profile-child-map:save', map);
  },
  loadProfileChildMap: (): Promise<{ success: boolean; data?: unknown[] }> => {
    return ipcRenderer.invoke('profile-child-map:load');
  },
};

// Expose to the renderer world
contextBridge.exposeInMainWorld('electronAPI', electronAPI);

// Also export the type for the renderer to reference
export type ElectronAPI = typeof electronAPI;
