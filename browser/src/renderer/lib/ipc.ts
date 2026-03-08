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

// Netflix activity types
export interface ViewingEntry {
  title: string;
  date: string;
  titleUrl?: string;
  seriesTitle?: string;
}

export interface ChildActivity {
  childName: string;
  childId: string;
  profileName: string;
  profileGuid: string;
  avatarUrl: string;
  entries: ViewingEntry[];
  fetchedAt: string;
}

export interface ProfileMappingInput {
  childName: string;
  childId: string;
  profileGuid: string;
  profileName: string;
  avatarUrl: string;
}

// CSM enrichment types
export interface CSMDescriptor {
  category: string;
  level: string;
  numericLevel: number;
  description: string;
}

export interface CSMPositiveContent {
  category: string;
  description: string;
}

export interface CSMCachedReview {
  csmSlug: string;
  csmUrl: string;
  csmMediaType: string;
  title: string;
  ageRating: string;
  ageRangeMin: number;
  qualityStars: number;
  isFamilyFriendly: boolean;
  reviewSummary: string;
  reviewBody: string;
  parentSummary: string;
  ageExplanation: string;
  descriptors: CSMDescriptor[];
  positiveContent: CSMPositiveContent[];
  scrapedAt: string;
}

export interface CSMEnrichmentUpdate {
  title: string;
  status: 'cached' | 'scraped' | 'not-found' | 'error';
  review?: CSMCachedReview;
}

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

export interface ProfileChildMapEntry {
  profileGuid: string;
  profileName: string;
  children: { childId: string; childName: string }[];
}

export interface ElectronAPI {
  createTab: (url?: string) => Promise<TabInfo>;
  closeTab: (id: number) => Promise<unknown>;
  switchTab: (id: number) => Promise<unknown>;
  listTabs: () => Promise<TabStateUpdate>;
  navigate: (url: string) => Promise<unknown>;
  goBack: () => Promise<unknown>;
  goForward: () => Promise<unknown>;
  reload: () => Promise<unknown>;
  onTabStateUpdate: (callback: (data: TabStateUpdate) => void) => (() => void);
  setChromeExpanded: (expanded: boolean) => Promise<unknown>;
  setChromeHeight: (height: number) => Promise<unknown>;
  listProfiles: () => Promise<string[]>;
  switchProfile: (name: string) => Promise<unknown>;
  // Credential operations
  checkCredentials: () => Promise<boolean>;
  listCredentials: () => Promise<CredentialInfo[]>;
  saveCredential: (serviceId: string, username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  saveCustomCredential: (name: string, loginUrl: string, username: string, password: string, existingServiceId?: string) => Promise<{ success: boolean; error?: string }>;
  deleteCredential: (serviceId: string) => Promise<{ success: boolean }>;
  onAutoFillAvailable: (callback: (data: AutoFillNotification) => void) => (() => void);
  onMfaChallenge: (callback: (data: MfaChallengeNotification) => void) => (() => void);
  // Auth operations
  getAuthStatus: () => Promise<AuthInfo>;
  logout: () => Promise<unknown>;
  loginNavigate: () => Promise<unknown>;
  onAuthStatusChanged: (callback: (data: AuthInfo) => void) => (() => void);
  // Family operations
  quickSetup: (req: QuickSetupRequest) => Promise<{ success: boolean; data?: QuickSetupResponse; error?: string }>;
  listFamilies: () => Promise<{ success: boolean; data?: Family[]; error?: string }>;
  listFamilyChildren: (familyId: string) => Promise<{ success: boolean; data?: Child[]; error?: string }>;
  listChildPolicies: (childId: string) => Promise<{ success: boolean; data?: ChildPolicy[]; error?: string }>;
  addChild: (familyId: string, name: string, birthDate: string) => Promise<{ success: boolean; data?: Child; error?: string }>;
  // Member operations
  listFamilyMembers: (familyId: string) => Promise<{ success: boolean; data?: FamilyMember[]; error?: string }>;
  addFamilyMember: (familyId: string, email: string, role: FamilyRole, displayName?: string) => Promise<{ success: boolean; data?: FamilyMember; error?: string }>;
  removeFamilyMember: (familyId: string, memberId: string) => Promise<{ success: boolean; error?: string }>;
  updateChild: (childId: string, name: string, birthDate: string) => Promise<{ success: boolean; data?: Child; error?: string }>;
  updateFamilyMember: (familyId: string, memberId: string, displayName: string, role: FamilyRole) => Promise<{ success: boolean; data?: FamilyMember; error?: string }>;
  // Config agent operations
  configAgentCheckSaved: () => Promise<{ success: boolean; data?: unknown }>;
  configAgentResume: () => Promise<{ success: boolean; data?: unknown; error?: string }>;
  configAgentStart: () => Promise<{ success: boolean; data?: unknown; error?: string }>;
  configAgentConfirmMappings: (mappings: unknown[]) => Promise<{ success: boolean; data?: unknown; error?: string }>;
  configAgentConfirmMaturity: (mappings: unknown[]) => Promise<{ success: boolean; data?: unknown; error?: string }>;
  configAgentConfirmPins: (profileGuids: string[], pin: string) => Promise<{ success: boolean; data?: unknown; error?: string }>;
  configAgentConfirmLocks: (profileGuids: string[]) => Promise<{ success: boolean; data?: unknown; error?: string }>;
  configAgentConfirmAutoplay: (settings: { profileGuid: string; disable: boolean }[]) => Promise<{ success: boolean; data?: unknown; error?: string }>;
  configAgentUpdateChanges: (changes: unknown[]) => Promise<{ success: boolean; data?: unknown; error?: string }>;
  configAgentApply: () => Promise<{ success: boolean; data?: unknown; error?: string }>;
  configAgentCancel: () => Promise<{ success: boolean }>;
  configAgentSetTabInset: (right: number) => Promise<{ success: boolean }>;
  onConfigAgentStatusUpdate: (callback: (data: unknown) => void) => (() => void);
  // Netflix activity
  loadNetflixMappings: () => Promise<{ success: boolean; data?: ProfileMappingInput[] }>;
  fetchNetflixActivity: (mappings: ProfileMappingInput[]) => Promise<{ success: boolean; data?: ChildActivity[]; error?: string }>;
  loadNetflixActivity: () => Promise<{ success: boolean; data?: ChildActivity[] }>;
  resyncNetflixBackend: () => Promise<{ success: boolean; synced?: number; skipped?: number; error?: string }>;
  // CSM enrichment
  enrichCSMTitles: (titles: string[]) => Promise<{ success: boolean; error?: string }>;
  getCSMCachedReviews: () => Promise<{ success: boolean; data?: CSMCachedReview[]; error?: string }>;
  getCSMCacheStats: () => Promise<{ success: boolean; data?: { total: number; fresh: number; stale: number }; error?: string }>;
  getCSMShallowReviews: () => Promise<{ success: boolean; data?: { count: number; titles: string[] }; error?: string }>;
  rescrapeShallowReviews: () => Promise<{ success: boolean; count?: number; error?: string }>;
  onCSMEnrichmentUpdate: (callback: (data: CSMEnrichmentUpdate) => void) => (() => void);
  onCSMEnrichmentComplete: (callback: () => void) => (() => void);
  // Profile → Child mapping
  saveProfileChildMap: (map: ProfileChildMapEntry[]) => Promise<{ success: boolean }>;
  loadProfileChildMap: () => Promise<{ success: boolean; data?: ProfileChildMapEntry[] }>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export const ipc: ElectronAPI | undefined = typeof window !== 'undefined' ? window.electronAPI : undefined;

// ---------------------------------------------------------------------------
// Shared chrome-expansion ref-counting
// Multiple components (AddressBar autocomplete, SettingsPanel dropdown) can
// independently request the chrome view to expand. We only collapse once ALL
// components have released their request.
// ---------------------------------------------------------------------------
let _expansionCount = 0;
let _collapseTimer: ReturnType<typeof setTimeout> | null = null;

/** Maximum time the chrome view can stay expanded before auto-collapsing (safety). */
const MAX_EXPANSION_MS = 30_000;

export function requestChromeExpansion(): void {
  _expansionCount++;
  if (_expansionCount === 1) {
    ipc?.setChromeExpanded(true);
  }
  // Safety: auto-collapse after timeout in case release is never called
  if (_collapseTimer) clearTimeout(_collapseTimer);
  _collapseTimer = setTimeout(() => {
    if (_expansionCount > 0) {
      console.warn('[chrome-expansion] Force-collapsing after timeout, count was', _expansionCount);
      _expansionCount = 0;
      ipc?.setChromeExpanded(false);
    }
  }, MAX_EXPANSION_MS);
}

export function releaseChromeExpansion(): void {
  _expansionCount = Math.max(0, _expansionCount - 1);
  if (_expansionCount === 0) {
    if (_collapseTimer) { clearTimeout(_collapseTimer); _collapseTimer = null; }
    ipc?.setChromeExpanded(false);
  }
}

/** Force-collapse the chrome view regardless of ref count. */
export function forceCollapseChrome(): void {
  _expansionCount = 0;
  if (_collapseTimer) { clearTimeout(_collapseTimer); _collapseTimer = null; }
  ipc?.setChromeExpanded(false);
}
