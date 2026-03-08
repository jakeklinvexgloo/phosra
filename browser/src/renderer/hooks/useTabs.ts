import { useState, useEffect, useCallback } from 'react';
import { ipc, TabInfo } from '../lib/ipc';

export function useTabs() {
  const [tabs, setTabs] = useState<TabInfo[]>([]);
  const [activeTabId, setActiveTabId] = useState<number | null>(null);

  const activeTab = tabs.find((t) => t.id === activeTabId) ?? null;

  useEffect(() => {
    // Fetch initial tab state
    ipc?.listTabs?.().then((data) => {
      if (data && Array.isArray(data.tabs)) {
        setTabs(data.tabs);
        setActiveTabId(data.activeTabId);
      }
    }).catch(console.error);

    // Subscribe to live updates from the main process
    const cleanup = ipc?.onTabStateUpdate?.((data) => {
      if (data && Array.isArray(data.tabs)) {
        setTabs(data.tabs);
        setActiveTabId(data.activeTabId);
      }
    });

    return () => { cleanup?.(); };
  }, []);

  const createTab = useCallback(async () => {
    try {
      await ipc?.createTab?.();
    } catch (err) {
      console.error('Failed to create tab:', err);
    }
  }, []);

  const closeTab = useCallback(async (id: number) => {
    try {
      await ipc?.closeTab?.(id);
    } catch (err) {
      console.error('Failed to close tab:', err);
    }
  }, []);

  const switchTab = useCallback(async (id: number) => {
    try {
      await ipc?.switchTab?.(id);
    } catch (err) {
      console.error('Failed to switch tab:', err);
    }
  }, []);

  return { tabs, activeTab, activeTabId, createTab, closeTab, switchTab };
}
