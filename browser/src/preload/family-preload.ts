/**
 * Family dashboard preload script (phosra://family).
 *
 * @module family-preload
 *
 * Runs in the family page WebContentsView with `contextIsolation: true` and
 * `nodeIntegration: false`. This means the renderer has NO direct access to
 * Node.js or Electron APIs — every capability must be explicitly exposed
 * through {@link contextBridge.exposeInMainWorld}.
 *
 * ## Security scope
 *
 * - Only IPC channels listed below are reachable from the renderer.
 * - All calls use `ipcRenderer.invoke()` (request/response) or
 *   `ipcRenderer.on()` (push from main), never `ipcRenderer.send()`.
 * - Credential passwords are **never** exposed; `credentials:list` returns
 *   metadata only (service ID, username, login URL).
 * - Auth tokens are managed entirely in the main process; the renderer only
 *   sees opaque status objects via `auth:status`.
 *
 * ## Exposed channels (window.phosraFamily)
 *
 * | Group               | Channel                       | Direction       |
 * |---------------------|-------------------------------|-----------------|
 * | Auth                | `auth:status`                 | invoke          |
 * | Auth                | `auth:logout`                 | invoke          |
 * | Auth                | `auth:status-changed`         | on (push)       |
 * | Family CRUD         | `family:list`                 | invoke          |
 * | Family CRUD         | `family:children`             | invoke          |
 * | Family CRUD         | `family:members`              | invoke          |
 * | Family CRUD         | `family:add-child`            | invoke          |
 * | Family CRUD         | `family:update-child`         | invoke          |
 * | Family CRUD         | `family:add-member`           | invoke          |
 * | Family CRUD         | `family:update-member`        | invoke          |
 * | Family CRUD         | `family:remove-member`        | invoke          |
 * | Family CRUD         | `family:quick-setup`          | invoke          |
 * | Netflix Activity    | `netflix:load-mappings`       | invoke          |
 * | Netflix Activity    | `netflix:load-activity`       | invoke          |
 * | Netflix Activity    | `netflix:fetch-activity`      | invoke          |
 * | CSM Enrichment      | `csm:enrich-titles`          | invoke          |
 * | CSM Enrichment      | `csm:get-cached`             | invoke          |
 * | CSM Enrichment      | `csm:get-cache-stats`        | invoke          |
 * | CSM Enrichment      | `csm:get-shallow-reviews`    | invoke          |
 * | CSM Enrichment      | `csm:rescrape-shallow`       | invoke          |
 * | CSM Enrichment      | `csm:enrichment-update`      | on (push)       |
 * | CSM Enrichment      | `csm:enrichment-complete`    | on (push)       |
 * | Profile Mapping     | `profile-child-map:save`      | invoke          |
 * | Profile Mapping     | `profile-child-map:load`      | invoke          |
 * | Credentials         | `credentials:list`            | invoke          |
 * | Navigation          | `tab:navigate`                | invoke          |
 */

import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

contextBridge.exposeInMainWorld('phosraFamily', {
  // -------------------------------------------------------------------
  // Auth
  // -------------------------------------------------------------------

  /** Get current auth status. */
  getAuthStatus: () => ipcRenderer.invoke('auth:status'),

  /** Log out (clear stored token). */
  logout: () => ipcRenderer.invoke('auth:logout'),

  /** Subscribe to auth status changes pushed from main process. */
  onAuthStatusChanged: (callback: (data: unknown) => void): (() => void) => {
    const handler = (_event: IpcRendererEvent, data: unknown) => {
      callback(data);
    };
    ipcRenderer.on('auth:status-changed', handler);
    return () => {
      ipcRenderer.removeListener('auth:status-changed', handler);
    };
  },

  // -------------------------------------------------------------------
  // Family CRUD
  // -------------------------------------------------------------------

  /** List all families for the authenticated user. */
  listFamilies: () => ipcRenderer.invoke('family:list'),

  /** List children in a family. */
  listFamilyChildren: (familyId: string) => ipcRenderer.invoke('family:children', familyId),

  /** List members (parents/guardians) in a family. */
  listFamilyMembers: (familyId: string) => ipcRenderer.invoke('family:members', familyId),

  /** Add a child to an existing family. */
  addChild: (familyId: string, name: string, birthDate: string) =>
    ipcRenderer.invoke('family:add-child', familyId, name, birthDate),

  /** Update a child's name and birth date. */
  updateChild: (childId: string, name: string, birthDate: string) =>
    ipcRenderer.invoke('family:update-child', childId, name, birthDate),

  /** Add a member (parent/guardian) by email. */
  addFamilyMember: (familyId: string, email: string, role: string, displayName?: string) =>
    ipcRenderer.invoke('family:add-member', familyId, email, role, displayName),

  /** Update a family member's display name and role. */
  updateFamilyMember: (familyId: string, memberId: string, displayName: string, role: string) =>
    ipcRenderer.invoke('family:update-member', familyId, memberId, displayName, role),

  /** Remove a member from a family. */
  removeFamilyMember: (familyId: string, memberId: string) =>
    ipcRenderer.invoke('family:remove-member', familyId, memberId),

  /** Quick setup: create family + child + policies in one call. */
  quickSetup: (req: unknown) => ipcRenderer.invoke('family:quick-setup', req),

  // -------------------------------------------------------------------
  // Netflix Activity
  // -------------------------------------------------------------------

  /** Load persisted child-to-Netflix-profile mappings. */
  loadNetflixMappings: () => ipcRenderer.invoke('netflix:load-mappings'),

  /** Load persisted viewing activity (survives app restart). */
  loadNetflixActivity: () => ipcRenderer.invoke('netflix:load-activity'),

  /** Fetch Netflix viewing activity for child profiles. */
  fetchNetflixActivity: (mappings: unknown) =>
    ipcRenderer.invoke('netflix:fetch-activity', mappings),

  // -------------------------------------------------------------------
  // CSM Enrichment
  // -------------------------------------------------------------------

  /** Trigger CSM enrichment for a list of Netflix titles. */
  enrichCSMTitles: (titles: string[]) => ipcRenderer.invoke('csm:enrich-titles', titles),

  /** Get all cached CSM reviews. */
  getCSMCachedReviews: () => ipcRenderer.invoke('csm:get-cached'),

  /** Get CSM cache stats (total, fresh, stale). */
  getCSMCacheStats: () => ipcRenderer.invoke('csm:get-cache-stats'),

  /** Get shallow CSM reviews (missing deep fields). */
  getCSMShallowReviews: () => ipcRenderer.invoke('csm:get-shallow-reviews'),

  /** Force re-scrape shallow reviews to get deep data. */
  rescrapeShallowReviews: () => ipcRenderer.invoke('csm:rescrape-shallow'),

  /** Subscribe to CSM enrichment updates (per-title results as they arrive). */
  onCSMEnrichmentUpdate: (callback: (data: unknown) => void): (() => void) => {
    const handler = (_event: IpcRendererEvent, data: unknown) => {
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

  // -------------------------------------------------------------------
  // Profile-Child Mapping
  // -------------------------------------------------------------------

  /** Save profile-to-child mappings. */
  saveProfileChildMap: (map: unknown) => ipcRenderer.invoke('profile-child-map:save', map),

  /** Load profile-to-child mappings. */
  loadProfileChildMap: () => ipcRenderer.invoke('profile-child-map:load'),

  // -------------------------------------------------------------------
  // Credentials
  // -------------------------------------------------------------------

  /** List all credentials (passwords are NOT included). */
  listCredentials: () => ipcRenderer.invoke('credentials:list'),

  // -------------------------------------------------------------------
  // Navigation
  // -------------------------------------------------------------------

  /** Navigate the active tab to the given URL. */
  navigateTo: (url: string) => ipcRenderer.invoke('tab:navigate', url),
});
