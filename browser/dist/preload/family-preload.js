"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("phosraFamily", {
  // -------------------------------------------------------------------
  // Auth
  // -------------------------------------------------------------------
  /** Get current auth status. */
  getAuthStatus: () => electron.ipcRenderer.invoke("auth:status"),
  /** Log out (clear stored token). */
  logout: () => electron.ipcRenderer.invoke("auth:logout"),
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
  // Family CRUD
  // -------------------------------------------------------------------
  /** List all families for the authenticated user. */
  listFamilies: () => electron.ipcRenderer.invoke("family:list"),
  /** List children in a family. */
  listFamilyChildren: (familyId) => electron.ipcRenderer.invoke("family:children", familyId),
  /** List members (parents/guardians) in a family. */
  listFamilyMembers: (familyId) => electron.ipcRenderer.invoke("family:members", familyId),
  /** Add a child to an existing family. */
  addChild: (familyId, name, birthDate) => electron.ipcRenderer.invoke("family:add-child", familyId, name, birthDate),
  /** Update a child's name and birth date. */
  updateChild: (childId, name, birthDate) => electron.ipcRenderer.invoke("family:update-child", childId, name, birthDate),
  /** Add a member (parent/guardian) by email. */
  addFamilyMember: (familyId, email, role, displayName) => electron.ipcRenderer.invoke("family:add-member", familyId, email, role, displayName),
  /** Update a family member's display name and role. */
  updateFamilyMember: (familyId, memberId, displayName, role) => electron.ipcRenderer.invoke("family:update-member", familyId, memberId, displayName, role),
  /** Remove a member from a family. */
  removeFamilyMember: (familyId, memberId) => electron.ipcRenderer.invoke("family:remove-member", familyId, memberId),
  /** Quick setup: create family + child + policies in one call. */
  quickSetup: (req) => electron.ipcRenderer.invoke("family:quick-setup", req),
  // -------------------------------------------------------------------
  // Netflix Activity
  // -------------------------------------------------------------------
  /** Load persisted child-to-Netflix-profile mappings. */
  loadNetflixMappings: () => electron.ipcRenderer.invoke("netflix:load-mappings"),
  /** Load persisted viewing activity (survives app restart). */
  loadNetflixActivity: () => electron.ipcRenderer.invoke("netflix:load-activity"),
  /** Fetch Netflix viewing activity for child profiles. */
  fetchNetflixActivity: (mappings) => electron.ipcRenderer.invoke("netflix:fetch-activity", mappings),
  // -------------------------------------------------------------------
  // CSM Enrichment
  // -------------------------------------------------------------------
  /** Trigger CSM enrichment for a list of Netflix titles. */
  enrichCSMTitles: (titles) => electron.ipcRenderer.invoke("csm:enrich-titles", titles),
  /** Get all cached CSM reviews. */
  getCSMCachedReviews: () => electron.ipcRenderer.invoke("csm:get-cached"),
  /** Get CSM cache stats (total, fresh, stale). */
  getCSMCacheStats: () => electron.ipcRenderer.invoke("csm:get-cache-stats"),
  /** Get shallow CSM reviews (missing deep fields). */
  getCSMShallowReviews: () => electron.ipcRenderer.invoke("csm:get-shallow-reviews"),
  /** Force re-scrape shallow reviews to get deep data. */
  rescrapeShallowReviews: () => electron.ipcRenderer.invoke("csm:rescrape-shallow"),
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
  // -------------------------------------------------------------------
  // Profile-Child Mapping
  // -------------------------------------------------------------------
  /** Save profile-to-child mappings. */
  saveProfileChildMap: (map) => electron.ipcRenderer.invoke("profile-child-map:save", map),
  /** Load profile-to-child mappings. */
  loadProfileChildMap: () => electron.ipcRenderer.invoke("profile-child-map:load"),
  // -------------------------------------------------------------------
  // Credentials
  // -------------------------------------------------------------------
  /** List all credentials (passwords are NOT included). */
  listCredentials: () => electron.ipcRenderer.invoke("credentials:list"),
  // -------------------------------------------------------------------
  // Navigation
  // -------------------------------------------------------------------
  /** Navigate the active tab to the given URL. */
  navigateTo: (url) => electron.ipcRenderer.invoke("tab:navigate", url)
});
