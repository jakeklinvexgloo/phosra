/**
 * IPC handler registrations for chrome UI <-> main process communication.
 *
 * Request/response channels use `ipcMain.handle()`.
 * Push notifications from main to renderer use `webContents.send()` (handled
 * inside TabManager via the `tab:state-update` channel).
 */

import * as path from 'path';
import { ipcMain, shell } from 'electron';
import { WindowManager } from './window-manager';
import { ProfileManager } from './profile-manager';
import { CredentialManager } from './credential-manager';
import { AuthManager } from './auth-manager';
import { PhosraApiClient } from './phosra-api';
import { NetflixAgent } from './netflix-agent';
import type { ProfileMapping, ConfigChange } from './netflix-agent';
import { ConfigStore } from './config-store';
import type { ProfileChildMapEntry } from './config-store';
import type { AgentStatus } from './netflix-agent';
import { fetchNetflixActivity, ActivityStore } from './netflix-activity';
import type { ProfileMappingInput } from './netflix-activity';
import { CSMEnrichmentService } from './csm-enrichment-service';

/** All channels registered by this module (handle-based), so we can remove them before re-registering. */
const CHANNELS = [
  'tab:create', 'tab:close', 'tab:switch', 'tab:list',
  'tab:navigate', 'tab:go-back', 'tab:go-forward', 'tab:reload',
  'chrome:set-expanded', 'chrome:set-height',
  'profile:list', 'profile:switch',
  'credentials:check', 'credentials:list', 'credentials:save',
  'credentials:save-custom', 'credentials:delete',
  'auth:status', 'auth:logout', 'auth:login-navigate',
  'family:quick-setup', 'family:list', 'family:children', 'family:child-policies', 'family:add-child',
  'family:members', 'family:add-member', 'family:remove-member',
  'family:update-child', 'family:update-member',
  'config-agent:start', 'config-agent:resume', 'config-agent:check-saved',
  'config-agent:confirm-mappings', 'config-agent:confirm-maturity',
  'config-agent:confirm-pins', 'config-agent:confirm-locks', 'config-agent:confirm-autoplay',
  'config-agent:update-changes', 'config-agent:apply', 'config-agent:cancel',
  'config-agent:set-tab-inset',
  'netflix:fetch-activity',
  'netflix:load-activity',
  'netflix:load-mappings',
  'netflix:resync-backend',
  'csm:enrich-titles',
  'csm:get-cached',
  'csm:get-cache-stats',
  'csm:get-shallow-reviews',
  'csm:rescrape-shallow',
  'profile-child-map:save',
  'profile-child-map:load',
];

/** One-way channels registered via ipcMain.on (fire-and-forget from renderer). */
const ON_CHANNELS = [
  'chrome:focus-address-bar',
];

export function registerIpcHandlers(
  windowManager: WindowManager,
  profileManager: ProfileManager,
  credentialManager?: CredentialManager,
  authManager?: AuthManager,
  apiClient?: PhosraApiClient,
): void {
  // Remove any previously registered handlers (safe for re-registration on macOS activate)
  for (const channel of CHANNELS) {
    ipcMain.removeHandler(channel);
  }
  for (const channel of ON_CHANNELS) {
    ipcMain.removeAllListeners(channel);
  }

  const tabManager = windowManager.getTabManager();

  // -------------------------------------------------------------------
  // Tab operations
  // -------------------------------------------------------------------

  ipcMain.handle('tab:create', (_event, url?: string) => {
    const tab = tabManager.createTab(url);
    return {
      id: tab.id,
      title: tab.title,
      url: tab.url,
      isLoading: tab.isLoading,
      canGoBack: tab.canGoBack,
      canGoForward: tab.canGoForward,
    };
  });

  ipcMain.handle('tab:close', (_event, id: number) => {
    tabManager.closeTab(id);
    return { success: true };
  });

  ipcMain.handle('tab:switch', (_event, id: number) => {
    tabManager.switchTab(id);
    return { success: true };
  });

  ipcMain.handle('tab:list', () => {
    return {
      tabs: tabManager.toTabInfoList(),
      activeTabId: tabManager.getActiveTabId(),
    };
  });

  ipcMain.handle('tab:navigate', (_event, url: string) => {
    const activeTab = tabManager.getActiveTab();
    if (!activeTab) {
      return { success: false, error: 'No active tab' };
    }

    // Normalise bare hostnames / search queries
    const targetUrl = normaliseUrl(url);

    activeTab.view.webContents.loadURL(targetUrl).catch((err: Error) => {
      console.error('[IPC] tab:navigate failed:', err.message);
    });

    return { success: true };
  });

  ipcMain.handle('tab:go-back', () => {
    const activeTab = tabManager.getActiveTab();
    if (!activeTab) {
      return { success: false, error: 'No active tab' };
    }

    if (activeTab.view.webContents.navigationHistory.canGoBack()) {
      activeTab.view.webContents.navigationHistory.goBack();
    }

    return { success: true };
  });

  ipcMain.handle('tab:go-forward', () => {
    const activeTab = tabManager.getActiveTab();
    if (!activeTab) {
      return { success: false, error: 'No active tab' };
    }

    if (activeTab.view.webContents.navigationHistory.canGoForward()) {
      activeTab.view.webContents.navigationHistory.goForward();
    }

    return { success: true };
  });

  ipcMain.handle('tab:reload', () => {
    const activeTab = tabManager.getActiveTab();
    if (!activeTab) {
      return { success: false, error: 'No active tab' };
    }

    activeTab.view.webContents.reload();
    return { success: true };
  });

  // -------------------------------------------------------------------
  // Chrome UI layout
  // -------------------------------------------------------------------

  ipcMain.handle('chrome:set-expanded', (_event, expanded: boolean) => {
    windowManager.setChromeExpanded(expanded);
    return { success: true };
  });

  ipcMain.handle('chrome:set-height', (_event, height: number) => {
    windowManager.setChromeHeight(height);
    return { success: true };
  });

  /** Forward focus-address-bar request from home page to the chrome UI view. */
  ipcMain.on('chrome:focus-address-bar', () => {
    const chromeView = windowManager.getChromeView();
    if (chromeView && !chromeView.webContents.isDestroyed()) {
      chromeView.webContents.send('chrome:focus-address-bar');
    }
  });

  // -------------------------------------------------------------------
  // Profile operations
  // -------------------------------------------------------------------

  ipcMain.handle('profile:list', () => {
    return profileManager.listProfiles();
  });

  ipcMain.handle('profile:switch', (_event, name: string) => {
    try {
      const profilePath = profileManager.createProfile(name);
      return { success: true, profilePath };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { success: false, error: message };
    }
  });

  // -------------------------------------------------------------------
  // Credential operations
  // -------------------------------------------------------------------

  if (credentialManager) {
    ipcMain.handle('credentials:check', () => {
      return credentialManager.isAvailable();
    });

    ipcMain.handle('credentials:list', () => {
      return credentialManager.list();
    });

    ipcMain.handle('credentials:save', (_event, serviceId: string, username: string, password: string) => {
      try {
        const info = credentialManager.save(serviceId, username, password);
        return { success: true, credential: info };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { success: false, error: message };
      }
    });

    ipcMain.handle('credentials:save-custom', (
      _event,
      name: string,
      loginUrl: string,
      username: string,
      password: string,
      existingServiceId?: string,
    ) => {
      try {
        const info = credentialManager.saveCustom(name, loginUrl, username, password, existingServiceId);
        return { success: true, credential: info };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { success: false, error: message };
      }
    });

    ipcMain.handle('credentials:delete', (_event, serviceId: string) => {
      const deleted = credentialManager.delete(serviceId);
      return { success: deleted };
    });
  }

  // -------------------------------------------------------------------
  // Auth operations
  // -------------------------------------------------------------------

  if (authManager) {
    ipcMain.handle('auth:status', () => {
      return authManager.getInfo();
    });

    ipcMain.handle('auth:logout', () => {
      authManager.logout();
      return { success: true };
    });

    ipcMain.handle('auth:login-navigate', async () => {
      // Open in the system browser so Google OAuth works.
      // After login, phosra.com redirects to phosra-browser://auth?session_token=...
      // which macOS delivers back to this app via the open-url event.
      try {
        await shell.openExternal('https://www.phosra.com/login?from=phosra-browser');
        return { success: true };
      } catch (err) {
        console.error('[Auth] Failed to open login URL:', err);
        return { success: false, error: 'Failed to open browser' };
      }
    });
  }

  // -------------------------------------------------------------------
  // Family operations (via Phosra API)
  // -------------------------------------------------------------------

  if (apiClient) {
    ipcMain.handle('family:quick-setup', async (_event, req: {
      family_name?: string;
      child_name: string;
      birth_date: string;
      strictness: string;
    }) => {
      try {
        const result = await apiClient.quickSetup(req as any);
        return { success: true, data: result };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { success: false, error: message };
      }
    });

    ipcMain.handle('family:list', async () => {
      try {
        const families = await apiClient.listFamilies();
        return { success: true, data: families };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { success: false, error: message };
      }
    });

    ipcMain.handle('family:children', async (_event, familyId: string) => {
      try {
        const children = await apiClient.listChildren(familyId);
        return { success: true, data: children };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { success: false, error: message };
      }
    });

    ipcMain.handle('family:child-policies', async (_event, childId: string) => {
      try {
        const policies = await apiClient.listPolicies(childId);
        return { success: true, data: policies };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { success: false, error: message };
      }
    });

    ipcMain.handle('family:add-child', async (_event, familyId: string, name: string, birthDate: string) => {
      try {
        const child = await apiClient.addChild(familyId, name, birthDate);
        return { success: true, data: child };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { success: false, error: message };
      }
    });

    ipcMain.handle('family:members', async (_event, familyId: string) => {
      try {
        const members = await apiClient.listMembers(familyId);
        return { success: true, data: members };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { success: false, error: message };
      }
    });

    ipcMain.handle('family:add-member', async (_event, familyId: string, email: string, role: string, displayName?: string) => {
      try {
        const member = await apiClient.addMember(familyId, email, role as any, displayName);
        return { success: true, data: member };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { success: false, error: message };
      }
    });

    ipcMain.handle('family:remove-member', async (_event, familyId: string, memberId: string) => {
      try {
        await apiClient.removeMember(familyId, memberId);
        return { success: true };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { success: false, error: message };
      }
    });

    ipcMain.handle('family:update-child', async (_event, childId: string, name: string, birthDate: string) => {
      try {
        const child = await apiClient.updateChild(childId, { name, birth_date: birthDate });
        return { success: true, data: child };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { success: false, error: message };
      }
    });

    ipcMain.handle('family:update-member', async (_event, familyId: string, memberId: string, displayName: string, role: string) => {
      try {
        const member = await apiClient.updateMember(familyId, memberId, { display_name: displayName, role: role as any });
        return { success: true, data: member };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { success: false, error: message };
      }
    });
  }

  // -------------------------------------------------------------------
  // Config agent operations (with persistence)
  // -------------------------------------------------------------------

  let netflixAgent: NetflixAgent | null = null;
  const configStore = new ConfigStore(profileManager.getDefaultProfilePath());

  function makeAgent(): NetflixAgent {
    const tabManager = windowManager.getTabManager();
    return new NetflixAgent({
      chromeView: windowManager.getChromeView(),
      getActiveTab: () => tabManager.getActiveTab(),
      credentialManager: credentialManager ?? null,
    });
  }

  /** Auto-persist after each state-changing operation — DB first, local fallback. */
  function persistStatus(agent: NetflixAgent) {
    const status = agent.getStatus();
    configStore.save(status);
    // Fire-and-forget save to backend DB
    apiClient?.saveConfigState('netflix', status).catch(() => {});
  }

  ipcMain.handle('config-agent:check-saved', async () => {
    // Load from both sources and use whichever is newer
    const local = configStore.loadWithTimestamp();
    let remote: { state: AgentStatus; savedAt: string } | null = null;
    try {
      const r = await apiClient?.getConfigState('netflix');
      const rAny = r as Record<string, unknown> | null;
      if (rAny?.state && rAny?.savedAt) remote = { state: rAny.state as AgentStatus, savedAt: rAny.savedAt as string };
      else if (rAny?.state) remote = { state: rAny.state as AgentStatus, savedAt: '' };
    } catch { /* ignore */ }

    if (remote && local) {
      // Use whichever is newer
      const remoteTime = remote.savedAt ? new Date(remote.savedAt).getTime() : 0;
      const localTime = local.savedAt ? new Date(local.savedAt).getTime() : 0;
      return { success: true, data: localTime >= remoteTime ? local.state : remote.state };
    }
    if (remote) return { success: true, data: remote.state };
    if (local) return { success: true, data: local.state };
    return { success: true, data: null };
  });

  ipcMain.handle('config-agent:start', async () => {
    try {
      netflixAgent = makeAgent();
      const status = await netflixAgent.start();

      // Merge saved PIN status into discovered profiles
      const savedPins = new Set(configStore.loadPinStatus());
      if (savedPins.size > 0) {
        for (const profile of status.profiles) {
          if (savedPins.has(profile.guid)) {
            profile.hasPIN = true;
          }
        }
      }

      // Pre-populate mappings from previously saved assignments
      const savedMappings = configStore.loadMappings();
      if (savedMappings && savedMappings.length > 0 && status.profiles.length > 0) {
        const prePopulated: ProfileMapping[] = status.profiles.map((profile) => {
          const saved = savedMappings.find((m) => m.netflixProfile.guid === profile.guid);
          if (saved) {
            return {
              ...saved,
              netflixProfile: profile, // use freshly-scraped profile data
            };
          }
          return {
            netflixProfile: profile,
            familyMemberType: 'unassigned' as const,
          };
        });
        netflixAgent.confirmMappingsPreload(prePopulated);
      }

      persistStatus(netflixAgent);
      return { success: true, data: netflixAgent.getStatus() };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { success: false, error: message };
    }
  });

  ipcMain.handle('config-agent:resume', async () => {
    // Load from both sources and use whichever is newer
    const local = configStore.loadWithTimestamp();
    let remote: { state: AgentStatus; savedAt: string } | null = null;
    try {
      const r = await apiClient?.getConfigState('netflix');
      const rAny = r as Record<string, unknown> | null;
      if (rAny?.state && rAny?.savedAt) remote = { state: rAny.state as AgentStatus, savedAt: rAny.savedAt as string };
      else if (rAny?.state) remote = { state: rAny.state as AgentStatus, savedAt: '' };
    } catch { /* ignore */ }

    let saved: AgentStatus | null = null;
    if (remote && local) {
      const remoteTime = remote.savedAt ? new Date(remote.savedAt).getTime() : 0;
      const localTime = local.savedAt ? new Date(local.savedAt).getTime() : 0;
      saved = localTime >= remoteTime ? local.state : remote.state;
    } else if (remote) {
      saved = remote.state;
    } else if (local) {
      saved = local.state;
    }

    if (!saved) return { success: false, error: 'No saved state' };
    netflixAgent = makeAgent();
    const status = netflixAgent.restore(saved);
    return { success: true, data: status };
  });

  ipcMain.handle('config-agent:confirm-mappings', (_event, mappings: ProfileMapping[]) => {
    if (!netflixAgent) return { success: false, error: 'Agent not started' };
    const status = netflixAgent.confirmMappings(mappings);
    persistStatus(netflixAgent);
    // Persist mappings separately so they survive wizard completion
    configStore.saveMappings(mappings);
    return { success: true, data: status };
  });

  ipcMain.handle('config-agent:confirm-maturity', (_event, mappings: ProfileMapping[]) => {
    if (!netflixAgent) return { success: false, error: 'Agent not started' };
    const status = netflixAgent.confirmMaturity(mappings);
    persistStatus(netflixAgent);
    return { success: true, data: status };
  });

  ipcMain.handle('config-agent:confirm-pins', (_event, profileGuids: string[], pin: string) => {
    if (!netflixAgent) return { success: false, error: 'Agent not started' };
    const status = netflixAgent.confirmPins(profileGuids, pin);
    persistStatus(netflixAgent);
    // Merge new PINs with previously saved ones
    if (profileGuids.length > 0) {
      const existing = new Set(configStore.loadPinStatus());
      for (const g of profileGuids) existing.add(g);
      configStore.savePinStatus(Array.from(existing));
    }
    return { success: true, data: status };
  });

  ipcMain.handle('config-agent:confirm-locks', (_event, profileGuids: string[]) => {
    if (!netflixAgent) return { success: false, error: 'Agent not started' };
    const status = netflixAgent.confirmLocks(profileGuids);
    persistStatus(netflixAgent);
    return { success: true, data: status };
  });

  ipcMain.handle('config-agent:confirm-autoplay', (_event, settings: { profileGuid: string; disable: boolean }[]) => {
    if (!netflixAgent) return { success: false, error: 'Agent not started' };
    const status = netflixAgent.confirmAutoplay(settings);
    persistStatus(netflixAgent);
    return { success: true, data: status };
  });

  ipcMain.handle('config-agent:update-changes', (_event, changes: ConfigChange[]) => {
    if (!netflixAgent) return { success: false, error: 'Agent not started' };
    const status = netflixAgent.updateChanges(changes);
    persistStatus(netflixAgent);
    return { success: true, data: status };
  });

  ipcMain.handle('config-agent:apply', async () => {
    if (!netflixAgent) return { success: false, error: 'Agent not started' };
    try {
      const status = await netflixAgent.applyChanges();
      // Clear wizard state on completion, but persist the final mappings
      if (status.step === 'complete') {
        configStore.saveMappings(status.mappings);
        configStore.clear();
        apiClient?.deleteConfigState('netflix').catch(() => {});
      }
      return { success: true, data: status };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { success: false, error: message };
    }
  });

  ipcMain.handle('config-agent:cancel', () => {
    if (netflixAgent) {
      netflixAgent.cancel();
      netflixAgent = null;
    }
    configStore.clear();
    apiClient?.deleteConfigState('netflix').catch(() => {});
    return { success: true };
  });

  ipcMain.handle('config-agent:set-tab-inset', (_event, right: number) => {
    windowManager.setTabInset({ right });
    return { success: true };
  });

  // -------------------------------------------------------------------
  // Netflix profile mappings (persisted separately from wizard state)
  // -------------------------------------------------------------------

  ipcMain.handle('netflix:load-mappings', () => {
    const mappings = configStore.loadMappings();
    return { success: true, data: mappings };
  });

  // -------------------------------------------------------------------
  // Profile → Child mapping (Netflix profile GUID → DB child IDs)
  // -------------------------------------------------------------------

  ipcMain.handle('profile-child-map:save', (_event, map: ProfileChildMapEntry[]) => {
    configStore.saveProfileChildMap(map);
    return { success: true };
  });

  ipcMain.handle('profile-child-map:load', () => {
    const map = configStore.loadProfileChildMap();
    return { success: true, data: map };
  });

  // -------------------------------------------------------------------
  // Netflix viewing activity (with persistence + backend sync)
  // -------------------------------------------------------------------

  const activityStore = new ActivityStore(profileManager.getDefaultProfilePath());

  ipcMain.handle('netflix:fetch-activity', async (_event, mappings: ProfileMappingInput[]) => {
    const activeTab = tabManager.getActiveTab();
    if (!activeTab) {
      return { success: false, error: 'No active tab — open Netflix first' };
    }
    try {
      const activities = await fetchNetflixActivity(activeTab.view, mappings);

      // Persist locally
      activityStore.save(activities);

      // Sync to backend (fire-and-forget, batched)
      // Uses profile-child map to resolve Netflix profiles → DB children
      // Supports one profile → multiple children (shared profiles)
      if (apiClient) {
        const profileChildMap = configStore.loadProfileChildMap();
        const BATCH_SIZE = 500;

        for (const act of activities) {
          // Resolve which DB children this profile maps to
          const mapEntry = profileChildMap?.find((m) => m.profileGuid === act.profileGuid);
          const targets = mapEntry?.children ?? [{ childId: act.childId, childName: act.childName }];

          for (const target of targets) {
            const allEntries = act.entries.map((e) => ({
              child_id: target.childId,
              child_name: target.childName,
              platform: 'netflix',
              title: e.title,
              series_title: e.seriesTitle || null,
              watched_date: parseNetflixDate(e.date),
              netflix_profile: act.profileGuid,
            }));
            // Send in batches to avoid oversized payloads
            for (let i = 0; i < allEntries.length; i += BATCH_SIZE) {
              const batch = allEntries.slice(i, i + BATCH_SIZE);
              apiClient.syncViewingHistory(batch).catch((err) => {
                console.error(`[netflix-activity] Backend sync batch failed (${target.childName}):`, err);
              });
            }
          }
        }
      }

      return { success: true, data: activities };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { success: false, error: message };
    }
  });

  ipcMain.handle('netflix:load-activity', async () => {
    try {
      const saved = activityStore.load();
      if (saved && saved.length > 0) {
        return { success: true, data: saved };
      }

      // Local data is empty — try fetching from server
      if (!apiClient) {
        return { success: true, data: saved };
      }

      console.log('[netflix:load-activity] Local cache empty, fetching from server...');

      const families = await apiClient.listFamilies();
      if (!families || families.length === 0) {
        return { success: true, data: null };
      }
      const familyId = families[0].id;
      const children = await apiClient.listChildren(familyId);
      if (!children || children.length === 0) {
        return { success: true, data: null };
      }

      const activities: import('./netflix-activity').ChildActivity[] = [];

      for (const child of children) {
        try {
          const rows = await apiClient.getChildViewingHistory(child.id);
          if (!rows || rows.length === 0) continue;

          // Group rows by netflix_profile
          const byProfile = new Map<string, typeof rows>();
          for (const row of rows) {
            const key = row.netflix_profile || 'unknown';
            if (!byProfile.has(key)) byProfile.set(key, []);
            byProfile.get(key)!.push(row);
          }

          for (const [profileGuid, profileRows] of byProfile) {
            const entries = profileRows.map((row: any) => ({
              title: row.title || '',
              date: formatServerDateToLocal(row.watched_date),
              seriesTitle: row.series_title || undefined,
            }));

            activities.push({
              childName: child.name,
              childId: child.id,
              profileName: profileGuid,
              profileGuid,
              avatarUrl: '',
              entries,
              fetchedAt: new Date().toISOString(),
            });
          }
        } catch (err) {
          console.error(`[netflix:load-activity] Failed to fetch history for child ${child.name}:`, err);
        }
      }

      if (activities.length > 0) {
        activityStore.save(activities);
        console.log(`[netflix:load-activity] Fetched ${activities.length} profiles from server, saved locally`);
      }

      return { success: true, data: activities.length > 0 ? activities : null };
    } catch (err) {
      console.error('[netflix:load-activity] Server fallback failed:', err);
      return { success: true, data: null };
    }
  });

  // Re-sync all persisted activity to backend using profile-child map
  ipcMain.handle('netflix:resync-backend', async () => {
    if (!apiClient) return { success: false, error: 'Not authenticated' };
    const saved = activityStore.load();
    if (!saved || saved.length === 0) return { success: false, error: 'No persisted activity' };

    const profileChildMap = configStore.loadProfileChildMap();
    const BATCH_SIZE = 500;
    let totalSynced = 0;
    let totalSkipped = 0;

    for (const act of saved) {
      const mapEntry = profileChildMap?.find((m) => m.profileGuid === act.profileGuid);
      const targets = mapEntry?.children ?? [{ childId: act.childId, childName: act.childName }];

      for (const target of targets) {
        const allEntries = act.entries.map((e) => ({
          child_id: target.childId,
          child_name: target.childName,
          platform: 'netflix',
          title: e.title,
          series_title: e.seriesTitle || null,
          watched_date: parseNetflixDate(e.date),
          netflix_profile: act.profileGuid,
        }));

        console.log(`[resync] ${act.profileName} → ${target.childName}: ${allEntries.length} entries`);

        for (let i = 0; i < allEntries.length; i += BATCH_SIZE) {
          const batch = allEntries.slice(i, i + BATCH_SIZE);
          try {
            await apiClient.syncViewingHistory(batch);
            totalSynced += batch.length;
          } catch (err) {
            console.error(`[resync] Batch failed (${target.childName}):`, err);
            totalSkipped += batch.length;
          }
        }
      }
    }

    console.log(`[resync] Done: ${totalSynced} synced, ${totalSkipped} skipped`);
    return { success: true, synced: totalSynced, skipped: totalSkipped };
  });

  // -------------------------------------------------------------------
  // CSM Enrichment
  // -------------------------------------------------------------------

  let csmService: CSMEnrichmentService | null = null;

  function ensureCSMService(): CSMEnrichmentService {
    if (!csmService) {
      const mainWindow = windowManager.getWindow();
      const stealthPreload = path.join(__dirname, '..', 'preload', 'stealth-preload.js');
      const profilePath = profileManager.getDefaultProfilePath();
      csmService = new CSMEnrichmentService(
        mainWindow,
        stealthPreload,
        profilePath,
        apiClient ?? null,
        windowManager.getChromeView(),
      );
    }
    return csmService;
  }

  ipcMain.handle('csm:enrich-titles', async (_event, titles: string[]) => {
    try {
      const service = ensureCSMService();
      service.enrichTitles(titles);
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { success: false, error: message };
    }
  });

  ipcMain.handle('csm:get-cached', async () => {
    try {
      const service = ensureCSMService();
      const localReviews = service.getCachedReviews();

      if (localReviews && localReviews.length > 0) {
        return { success: true, data: localReviews };
      }

      // Local cache is empty — try fetching from server
      if (!apiClient) {
        return { success: true, data: localReviews };
      }

      console.log('[csm:get-cached] Local cache empty, fetching from server...');

      const families = await apiClient.listFamilies();
      if (!families || families.length === 0) {
        return { success: true, data: [] };
      }
      const familyId = families[0].id;

      const serverReviews = await apiClient.getCSMReviewsByFamily(familyId);
      if (!serverReviews || serverReviews.length === 0) {
        return { success: true, data: [] };
      }

      // Transform server snake_case to local CSMCachedReview format
      const transformed: import('./csm-cache').CSMCachedReview[] = serverReviews.map((r: any) => ({
        csmSlug: r.csm_slug || '',
        csmUrl: r.csm_url || '',
        csmMediaType: r.csm_media_type || '',
        title: r.title || '',
        ageRating: r.age_rating || '',
        ageRangeMin: r.age_range_min ?? 0,
        qualityStars: r.quality_stars ?? 0,
        isFamilyFriendly: r.is_family_friendly ?? false,
        reviewSummary: r.review_summary || '',
        reviewBody: r.review_body || '',
        parentSummary: r.parent_summary || '',
        ageExplanation: r.age_explanation || '',
        descriptors: Array.isArray(r.descriptors_json)
          ? r.descriptors_json.map((d: any) => ({
              category: d.category || '',
              level: d.level || '',
              numericLevel: d.numericLevel ?? d.numeric_level ?? 0,
              description: d.description || '',
            }))
          : [],
        positiveContent: Array.isArray(r.positive_content)
          ? r.positive_content.map((p: any) => ({
              category: p.category || '',
              description: p.description || '',
            }))
          : [],
        scrapedAt: r.created_at || new Date().toISOString(),
      }));

      // Persist to local CSM cache so subsequent loads are fast
      // We access the cache through the service's internal cache by setting each review
      const { CSMCache } = await import('./csm-cache');
      const localCache = new CSMCache(profileManager.getDefaultProfilePath());
      for (const review of transformed) {
        localCache.set(review);
      }

      console.log(`[csm:get-cached] Fetched ${transformed.length} reviews from server, saved locally`);
      return { success: true, data: transformed };
    } catch (err) {
      console.error('[csm:get-cached] Server fallback failed:', err);
      return { success: true, data: [] };
    }
  });

  ipcMain.handle('csm:get-cache-stats', () => {
    try {
      const service = ensureCSMService();
      return { success: true, data: service.getCacheStats() };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { success: false, error: message };
    }
  });

  ipcMain.handle('csm:get-shallow-reviews', () => {
    try {
      const service = ensureCSMService();
      return { success: true, data: service.getShallowReviews() };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { success: false, error: message };
    }
  });

  ipcMain.handle('csm:rescrape-shallow', () => {
    try {
      const service = ensureCSMService();
      const { count, titles } = service.getShallowReviews();
      if (count === 0) {
        return { success: true, count: 0 };
      }
      service.enrichTitles(titles, true);
      return { success: true, count };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { success: false, error: message };
    }
  });
}

// -------------------------------------------------------------------
// Helpers
// -------------------------------------------------------------------

/**
 * Convert a server date (YYYY-MM-DD) to Netflix's local display format (M/D/YY).
 * Returns empty string if unparseable.
 */
function formatServerDateToLocal(dateStr: string | null): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return dateStr;
  const shortYear = year % 100;
  return `${month}/${day}/${shortYear}`;
}

/**
 * Parse Netflix's date format (e.g. "3/5/26", "12/25/25") to ISO date string.
 * Netflix uses M/D/YY format. Returns null if unparseable.
 */
function parseNetflixDate(dateStr: string): string | null {
  if (!dateStr) return null;
  const parts = dateStr.split('/');
  if (parts.length !== 3) return null;
  const month = parseInt(parts[0], 10);
  const day = parseInt(parts[1], 10);
  let year = parseInt(parts[2], 10);
  if (isNaN(month) || isNaN(day) || isNaN(year)) return null;
  // 2-digit year: 00-99 -> 2000-2099
  if (year < 100) year += 2000;
  const m = String(month).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}

/**
 * Normalise user input into a loadable URL:
 * - If it looks like a URL, ensure it has a scheme.
 * - Otherwise treat it as a Google search query.
 */
function normaliseUrl(input: string): string {
  const trimmed = input.trim();

  // Already has a scheme
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(trimmed)) {
    return trimmed;
  }

  // about: and file: schemes
  if (/^(about|file|data|javascript):/.test(trimmed)) {
    return trimmed;
  }

  // Looks like a domain (contains a dot and no spaces)
  if (/^[^\s]+\.[^\s]+$/.test(trimmed)) {
    return `https://${trimmed}`;
  }

  // Treat as a search query
  return `https://www.google.com/search?q=${encodeURIComponent(trimmed)}`;
}
