/**
 * React hook for managing streaming service credentials via IPC.
 *
 * Follows the same pattern as useBookmarks, but backed by main process
 * IPC calls instead of localStorage (passwords are encrypted by the main process).
 */

import { useState, useEffect, useCallback } from 'react';
import { ipc } from '../lib/ipc';
import type { CredentialInfo } from '../lib/ipc';

export function useCredentials() {
  const [credentials, setCredentials] = useState<CredentialInfo[]>([]);
  const [isAvailable, setIsAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!ipc) return;
    const list = await ipc.listCredentials();
    setCredentials(list);
  }, []);

  // Load credentials on mount
  useEffect(() => {
    async function load() {
      if (!ipc) {
        setIsLoading(false);
        return;
      }
      try {
        const available = await ipc.checkCredentials();
        setIsAvailable(available);
        if (available) {
          await refresh();
        }
      } catch {
        // IPC not ready yet
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [refresh]);

  /** Save a credential for a built-in service. */
  const saveCredential = useCallback(
    async (serviceId: string, username: string, password: string) => {
      if (!ipc) return;
      const result = await ipc.saveCredential(serviceId, username, password);
      await refresh();
      return result;
    },
    [refresh],
  );

  /** Save a credential for a custom provider. */
  const saveCustomCredential = useCallback(
    async (name: string, loginUrl: string, username: string, password: string, existingServiceId?: string) => {
      if (!ipc) return;
      const result = await ipc.saveCustomCredential(name, loginUrl, username, password, existingServiceId);
      await refresh();
      return result;
    },
    [refresh],
  );

  const deleteCredential = useCallback(async (serviceId: string) => {
    if (!ipc) return;
    await ipc.deleteCredential(serviceId);
    await refresh();
  }, [refresh]);

  return { credentials, isAvailable, isLoading, saveCredential, saveCustomCredential, deleteCredential };
}
