import { useState, useEffect, useCallback } from 'react';
import { ipc, TabInfo } from '../lib/ipc';

export function useNavigation(activeTab: TabInfo | null) {
  const [url, setUrl] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Sync the address bar with the active tab's URL when not editing
  useEffect(() => {
    if (!isEditing && activeTab) {
      setUrl(activeTab.url);
    }
  }, [activeTab?.url, activeTab?.id, isEditing]);

  const isLoading = activeTab?.isLoading ?? false;

  const navigate = useCallback(
    async (input: string) => {
      let target = input.trim();
      if (!target) return;

      // If user typed something that looks like a URL, use it directly
      // Otherwise treat it as a search query
      if (
        target.startsWith('http://') ||
        target.startsWith('https://') ||
        target.startsWith('file://') ||
        target.startsWith('about:') ||
        target.startsWith('phosra://')
      ) {
        // Already a URL
      } else if (target.includes('.') && !target.includes(' ')) {
        // Looks like a domain
        target = 'https://' + target;
      } else {
        // Treat as search
        target =
          'https://www.google.com/search?q=' + encodeURIComponent(target);
      }

      setUrl(target);
      setIsEditing(false);

      try {
        await ipc?.navigate?.(target);
      } catch (err) {
        console.error('Navigation failed:', err);
      }
    },
    []
  );

  const goBack = useCallback(async () => {
    try {
      await ipc?.goBack?.();
    } catch (err) {
      console.error('Go back failed:', err);
    }
  }, []);

  const goForward = useCallback(async () => {
    try {
      await ipc?.goForward?.();
    } catch (err) {
      console.error('Go forward failed:', err);
    }
  }, []);

  const reload = useCallback(async () => {
    try {
      await ipc?.reload?.();
    } catch (err) {
      console.error('Reload failed:', err);
    }
  }, []);

  return {
    url,
    setUrl,
    isLoading,
    isEditing,
    setIsEditing,
    navigate,
    goBack,
    goForward,
    reload,
  };
}
