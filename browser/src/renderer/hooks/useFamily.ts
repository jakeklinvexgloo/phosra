/**
 * React hook for family data via Phosra API (through IPC).
 *
 * Fetches families and children when the user is logged in.
 */

import { useState, useEffect, useCallback } from 'react';
import { ipc } from '../lib/ipc';
import type { Family, Child, FamilyMember, FamilyRole, QuickSetupRequest, QuickSetupResponse, Strictness } from '../lib/ipc';

export function useFamily(isLoggedIn: boolean) {
  const [families, setFamilies] = useState<Family[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!ipc || !isLoggedIn) return;
    setIsLoading(true);
    setError(null);
    try {
      const familyResult = await ipc.listFamilies();
      if (familyResult.success && familyResult.data) {
        setFamilies(familyResult.data);
        // Fetch children and members for the first family
        if (familyResult.data.length > 0) {
          const familyId = familyResult.data[0].id;
          // Fetch children (required)
          const childResult = await ipc.listFamilyChildren(familyId);
          if (childResult.success && childResult.data) {
            setChildren(childResult.data);
          }
          // Fetch members (best-effort — don't block panel if this fails)
          try {
            if (typeof ipc.listFamilyMembers === 'function') {
              const memberResult = await ipc.listFamilyMembers(familyId);
              if (memberResult.success && memberResult.data) {
                setMembers(memberResult.data);
              }
            }
          } catch {
            // Members fetch failed — show panel with empty members
          }
        }
      } else {
        // No families yet — that's fine
        setFamilies([]);
        setChildren([]);
        setMembers([]);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      // Not authenticated or API error — clear data silently
      if (message.includes('Not authenticated') || message.includes('401')) {
        setFamilies([]);
        setChildren([]);
        setMembers([]);
      } else {
        setError(message);
      }
    } finally {
      setIsLoading(false);
    }
  }, [isLoggedIn]);

  // Fetch when login state changes
  useEffect(() => {
    if (isLoggedIn) {
      refresh();
    } else {
      setFamilies([]);
      setChildren([]);
      setMembers([]);
    }
  }, [isLoggedIn, refresh]);

  const quickSetup = useCallback(async (req: QuickSetupRequest): Promise<QuickSetupResponse | null> => {
    if (!ipc) return null;
    setError(null);
    try {
      const result = await ipc.quickSetup(req);
      if (result.success && result.data) {
        // Refresh data after setup
        await refresh();
        return result.data;
      } else {
        setError(result.error || 'Setup failed');
        return null;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      return null;
    }
  }, [refresh]);

  const addChild = useCallback(async (familyId: string, name: string, birthDate: string): Promise<Child | null> => {
    if (!ipc) return null;
    setError(null);
    try {
      const result = await ipc.addChild(familyId, name, birthDate);
      if (result.success && result.data) {
        await refresh();
        return result.data;
      } else {
        setError(result.error || 'Failed to add child');
        return null;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      return null;
    }
  }, [refresh]);

  const addMember = useCallback(async (familyId: string, email: string, role: FamilyRole, displayName?: string): Promise<FamilyMember | null> => {
    if (!ipc) return null;
    setError(null);
    const result = await ipc.addFamilyMember(familyId, email, role, displayName);
    if (result.success && result.data) {
      await refresh();
      return result.data;
    }
    // Throw so the form's catch block can display the error inline
    const raw = result.error || 'Failed to add member';
    if (raw.includes('user not found')) {
      throw new Error('No Phosra account found for that email');
    }
    throw new Error(raw);
  }, [refresh]);

  const updateChild = useCallback(async (childId: string, name: string, birthDate: string): Promise<boolean> => {
    if (!ipc) return false;
    setError(null);
    try {
      const result = await ipc.updateChild(childId, name, birthDate);
      if (result.success) {
        await refresh();
        return true;
      } else {
        setError(result.error || 'Failed to update child');
        return false;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      return false;
    }
  }, [refresh]);

  const updateMember = useCallback(async (familyId: string, memberId: string, displayName: string, role: FamilyRole): Promise<boolean> => {
    if (!ipc) return false;
    setError(null);
    try {
      const result = await ipc.updateFamilyMember(familyId, memberId, displayName, role);
      if (result.success) {
        await refresh();
        return true;
      } else {
        setError(result.error || 'Failed to update member');
        return false;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      return false;
    }
  }, [refresh]);

  const removeMember = useCallback(async (familyId: string, memberId: string): Promise<boolean> => {
    if (!ipc) return false;
    setError(null);
    try {
      const result = await ipc.removeFamilyMember(familyId, memberId);
      if (result.success) {
        await refresh();
        return true;
      } else {
        setError(result.error || 'Failed to remove member');
        return false;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      return false;
    }
  }, [refresh]);

  return { families, children, members, isLoading, error, refresh, quickSetup, addChild, updateChild, addMember, updateMember, removeMember };
}
