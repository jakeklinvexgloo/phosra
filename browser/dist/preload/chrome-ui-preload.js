"use strict";
const electron = require("electron");
const electronAPI = {
  // -------------------------------------------------------------------
  // Tab operations
  // -------------------------------------------------------------------
  /** Create a new tab, optionally navigating to a URL. */
  createTab: (url) => {
    return electron.ipcRenderer.invoke("tab:create", url);
  },
  /** Close a tab by its ID. */
  closeTab: (id) => {
    return electron.ipcRenderer.invoke("tab:close", id);
  },
  /** Switch to a tab by its ID. */
  switchTab: (id) => {
    return electron.ipcRenderer.invoke("tab:switch", id);
  },
  /** List all open tabs and the active tab ID. */
  listTabs: () => {
    return electron.ipcRenderer.invoke("tab:list");
  },
  /** Navigate the active tab to a URL. */
  navigate: (url) => {
    return electron.ipcRenderer.invoke("tab:navigate", url);
  },
  /** Navigate the active tab back. */
  goBack: () => {
    return electron.ipcRenderer.invoke("tab:go-back");
  },
  /** Navigate the active tab forward. */
  goForward: () => {
    return electron.ipcRenderer.invoke("tab:go-forward");
  },
  /** Reload the active tab. */
  reload: () => {
    return electron.ipcRenderer.invoke("tab:reload");
  },
  // -------------------------------------------------------------------
  // Events (main -> renderer push notifications)
  // -------------------------------------------------------------------
  /** Subscribe to tab state updates pushed from the main process. */
  onTabStateUpdate: (callback) => {
    const handler = (_event, data) => {
      callback(data);
    };
    electron.ipcRenderer.on("tab:state-update", handler);
    return () => {
      electron.ipcRenderer.removeListener("tab:state-update", handler);
    };
  },
  // -------------------------------------------------------------------
  // Chrome UI layout
  // -------------------------------------------------------------------
  /** Expand or collapse the chrome view to show dropdowns. */
  setChromeExpanded: (expanded) => {
    return electron.ipcRenderer.invoke("chrome:set-expanded", expanded);
  },
  /** Dynamically set the chrome view height to fit panel content. */
  setChromeHeight: (height) => {
    return electron.ipcRenderer.invoke("chrome:set-height", height);
  },
  // -------------------------------------------------------------------
  // Profile operations
  // -------------------------------------------------------------------
  /** List all available browser profiles. */
  listProfiles: () => {
    return electron.ipcRenderer.invoke("profile:list");
  },
  /** Switch to (or create) a named profile. */
  switchProfile: (name) => {
    return electron.ipcRenderer.invoke("profile:switch", name);
  },
  // -------------------------------------------------------------------
  // Credential operations
  // -------------------------------------------------------------------
  /** Check if OS keychain encryption is available. */
  checkCredentials: () => {
    return electron.ipcRenderer.invoke("credentials:check");
  },
  /** List all credentials (passwords are NOT included). */
  listCredentials: () => {
    return electron.ipcRenderer.invoke("credentials:list");
  },
  /** Save a credential for a streaming service. */
  saveCredential: (serviceId, username, password) => {
    return electron.ipcRenderer.invoke("credentials:save", serviceId, username, password);
  },
  /** Save a credential for a custom provider. */
  saveCustomCredential: (name, loginUrl, username, password, existingServiceId) => {
    return electron.ipcRenderer.invoke("credentials:save-custom", name, loginUrl, username, password, existingServiceId);
  },
  /** Delete a stored credential. */
  deleteCredential: (serviceId) => {
    return electron.ipcRenderer.invoke("credentials:delete", serviceId);
  },
  /** Subscribe to auto-fill availability notifications. */
  onAutoFillAvailable: (callback) => {
    const handler = (_event, data) => {
      callback(data);
    };
    electron.ipcRenderer.on("credentials:autofill-available", handler);
    return () => {
      electron.ipcRenderer.removeListener("credentials:autofill-available", handler);
    };
  },
  /** Subscribe to MFA challenge detection notifications. */
  onMfaChallenge: (callback) => {
    const handler = (_event, data) => {
      callback(data);
    };
    electron.ipcRenderer.on("mfa:challenge-detected", handler);
    return () => {
      electron.ipcRenderer.removeListener("mfa:challenge-detected", handler);
    };
  },
  // -------------------------------------------------------------------
  // Auth operations
  // -------------------------------------------------------------------
  /** Get current auth status. */
  getAuthStatus: () => {
    return electron.ipcRenderer.invoke("auth:status");
  },
  /** Log out (clear stored token). */
  logout: () => {
    return electron.ipcRenderer.invoke("auth:logout");
  },
  /** Open phosra.com/login in a new tab. */
  loginNavigate: () => {
    return electron.ipcRenderer.invoke("auth:login-navigate");
  },
  /** Subscribe to auth status changes pushed from main process. */
  onAuthStatusChanged: (callback) => {
    const handler = (_event, data) => {
      callback(data);
    };
    electron.ipcRenderer.on("auth:status-changed", handler);
    return () => {
      electron.ipcRenderer.removeListener("auth:status-changed", handler);
    };
  },
  // -------------------------------------------------------------------
  // Family operations
  // -------------------------------------------------------------------
  /** Quick setup: create family + child + policies in one call. */
  quickSetup: (req) => {
    return electron.ipcRenderer.invoke("family:quick-setup", req);
  },
  /** List all families for the authenticated user. */
  listFamilies: () => {
    return electron.ipcRenderer.invoke("family:list");
  },
  /** List children in a family. */
  listFamilyChildren: (familyId) => {
    return electron.ipcRenderer.invoke("family:children", familyId);
  },
  /** List policies for a child. */
  listChildPolicies: (childId) => {
    return electron.ipcRenderer.invoke("family:child-policies", childId);
  },
  /** Add a child to an existing family. */
  addChild: (familyId, name, birthDate) => {
    return electron.ipcRenderer.invoke("family:add-child", familyId, name, birthDate);
  },
  /** List members (parents/guardians) in a family. */
  listFamilyMembers: (familyId) => {
    return electron.ipcRenderer.invoke("family:members", familyId);
  },
  /** Add a member (parent/guardian) by email. */
  addFamilyMember: (familyId, email, role, displayName) => {
    return electron.ipcRenderer.invoke("family:add-member", familyId, email, role, displayName);
  },
  /** Remove a member from a family. */
  removeFamilyMember: (familyId, memberId) => {
    return electron.ipcRenderer.invoke("family:remove-member", familyId, memberId);
  },
  /** Update a child's name and birth date. */
  updateChild: (childId, name, birthDate) => {
    return electron.ipcRenderer.invoke("family:update-child", childId, name, birthDate);
  },
  /** Update a family member's display name and role. */
  updateFamilyMember: (familyId, memberId, displayName, role) => {
    return electron.ipcRenderer.invoke("family:update-member", familyId, memberId, displayName, role);
  },
  // -------------------------------------------------------------------
  // Config agent operations
  // -------------------------------------------------------------------
  /** Check if there's a saved config agent state to resume. */
  configAgentCheckSaved: () => {
    return electron.ipcRenderer.invoke("config-agent:check-saved");
  },
  /** Resume a previously saved config agent session. */
  configAgentResume: () => {
    return electron.ipcRenderer.invoke("config-agent:resume");
  },
  /** Start the Netflix config agent (profile discovery). */
  configAgentStart: () => {
    return electron.ipcRenderer.invoke("config-agent:start");
  },
  /** Confirm profile-to-family mappings. */
  configAgentConfirmMappings: (mappings) => {
    return electron.ipcRenderer.invoke("config-agent:confirm-mappings", mappings);
  },
  /** Confirm maturity settings. */
  configAgentConfirmMaturity: (mappings) => {
    return electron.ipcRenderer.invoke("config-agent:confirm-maturity", mappings);
  },
  /** Set PINs on selected profiles. */
  configAgentConfirmPins: (profileGuids, pin) => {
    return electron.ipcRenderer.invoke("config-agent:confirm-pins", profileGuids, pin);
  },
  /** Lock selected profiles. */
  configAgentConfirmLocks: (profileGuids) => {
    return electron.ipcRenderer.invoke("config-agent:confirm-locks", profileGuids);
  },
  /** Set autoplay preferences. */
  configAgentConfirmAutoplay: (settings) => {
    return electron.ipcRenderer.invoke("config-agent:confirm-autoplay", settings);
  },
  /** Update the change list (toggle items on/off). */
  configAgentUpdateChanges: (changes) => {
    return electron.ipcRenderer.invoke("config-agent:update-changes", changes);
  },
  /** Apply all enabled changes. */
  configAgentApply: () => {
    return electron.ipcRenderer.invoke("config-agent:apply");
  },
  /** Cancel the config agent. */
  configAgentCancel: () => {
    return electron.ipcRenderer.invoke("config-agent:cancel");
  },
  /** Resize the active tab to make room for the config drawer. */
  configAgentSetTabInset: (right) => {
    return electron.ipcRenderer.invoke("config-agent:set-tab-inset", right);
  },
  /** Subscribe to config agent status updates. */
  onConfigAgentStatusUpdate: (callback) => {
    const handler = (_event, data) => {
      callback(data);
    };
    electron.ipcRenderer.on("config-agent:status-update", handler);
    return () => {
      electron.ipcRenderer.removeListener("config-agent:status-update", handler);
    };
  },
  // -------------------------------------------------------------------
  // Netflix viewing activity
  // -------------------------------------------------------------------
  /** Load persisted child-to-Netflix-profile mappings. */
  loadNetflixMappings: () => {
    return electron.ipcRenderer.invoke("netflix:load-mappings");
  },
  /** Load persisted viewing activity (survives app restart). */
  loadNetflixActivity: () => {
    return electron.ipcRenderer.invoke("netflix:load-activity");
  },
  resyncNetflixBackend: () => {
    return electron.ipcRenderer.invoke("netflix:resync-backend");
  },
  /** Fetch Netflix viewing activity for child profiles. */
  fetchNetflixActivity: (mappings) => {
    return electron.ipcRenderer.invoke("netflix:fetch-activity", mappings);
  },
  // -------------------------------------------------------------------
  // CSM Enrichment
  // -------------------------------------------------------------------
  /** Trigger CSM enrichment for a list of Netflix titles. */
  enrichCSMTitles: (titles) => {
    return electron.ipcRenderer.invoke("csm:enrich-titles", titles);
  },
  /** Get all cached CSM reviews. */
  getCSMCachedReviews: () => {
    return electron.ipcRenderer.invoke("csm:get-cached");
  },
  /** Get CSM cache stats (total, fresh, stale). */
  getCSMCacheStats: () => {
    return electron.ipcRenderer.invoke("csm:get-cache-stats");
  },
  /** Get shallow CSM reviews (missing deep fields like ageExplanation, positiveContent). */
  getCSMShallowReviews: () => {
    return electron.ipcRenderer.invoke("csm:get-shallow-reviews");
  },
  /** Force re-scrape shallow reviews to get deep data. */
  rescrapeShallowReviews: () => {
    return electron.ipcRenderer.invoke("csm:rescrape-shallow");
  },
  /** Subscribe to CSM enrichment updates (per-title results as they arrive). */
  onCSMEnrichmentUpdate: (callback) => {
    const handler = (_event, data) => {
      callback(data);
    };
    electron.ipcRenderer.on("csm:enrichment-update", handler);
    return () => {
      electron.ipcRenderer.removeListener("csm:enrichment-update", handler);
    };
  },
  /** Subscribe to CSM enrichment completion. */
  onCSMEnrichmentComplete: (callback) => {
    const handler = () => {
      callback();
    };
    electron.ipcRenderer.on("csm:enrichment-complete", handler);
    return () => {
      electron.ipcRenderer.removeListener("csm:enrichment-complete", handler);
    };
  },
  // Profile → Child mapping
  saveProfileChildMap: (map) => {
    return electron.ipcRenderer.invoke("profile-child-map:save", map);
  },
  loadProfileChildMap: () => {
    return electron.ipcRenderer.invoke("profile-child-map:load");
  }
};
electron.contextBridge.exposeInMainWorld("electronAPI", electronAPI);
