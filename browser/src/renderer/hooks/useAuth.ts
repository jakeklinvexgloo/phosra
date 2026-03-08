/**
 * React hook for Phosra auth state via IPC.
 *
 * Checks auth:status on mount and listens for auth:status-changed push events
 * (triggered when token is captured from phosra.com login).
 */

import { useState, useEffect, useCallback } from 'react';
import { ipc } from '../lib/ipc';
import type { AuthInfo } from '../lib/ipc';

const EMPTY_AUTH: AuthInfo = { email: '', isLoggedIn: false, expiresAt: '' };

export function useAuth() {
  const [authInfo, setAuthInfo] = useState<AuthInfo>(EMPTY_AUTH);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!ipc) return;
    try {
      const info = await ipc.getAuthStatus();
      setAuthInfo(info);
    } catch {
      // IPC not ready
    }
  }, []);

  // Load on mount
  useEffect(() => {
    refresh().finally(() => setIsLoading(false));
  }, [refresh]);

  // Listen for push events from main process
  useEffect(() => {
    if (!ipc) return;
    const cleanup = ipc.onAuthStatusChanged((info) => {
      setAuthInfo(info);
    });
    return cleanup;
  }, []);

  const logout = useCallback(async () => {
    if (!ipc) return;
    await ipc.logout();
    setAuthInfo(EMPTY_AUTH);
  }, []);

  const loginNavigate = useCallback(async () => {
    if (!ipc) return;
    await ipc.loginNavigate();
  }, []);

  return {
    authInfo,
    isLoggedIn: authInfo.isLoggedIn,
    isLoading,
    logout,
    loginNavigate,
    refresh,
  };
}
