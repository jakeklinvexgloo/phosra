/**
 * State machine hook for the Netflix configuration agent wizard.
 *
 * Manages wizard steps, profile data, mappings, changes, and IPC
 * communication with the main process agent.
 */

import { useState, useEffect, useCallback } from 'react';
import { ipc } from '../lib/ipc';

// ---------------------------------------------------------------------------
// Types (mirrored from main/netflix-agent.ts for renderer use)
// ---------------------------------------------------------------------------

export type NetflixMaturityLevel = 'little-kids' | 'older-kids' | 'teens' | 'all';

export interface NetflixProfile {
  guid: string;
  name: string;
  avatarUrl: string;
  isKids: boolean;
  maturityLevel: NetflixMaturityLevel;
  hasPIN: boolean;
  isLocked: boolean;
  autoplayEnabled: boolean;
}

export interface ProfileMapping {
  netflixProfile: NetflixProfile;
  familyMemberId?: string;
  familyMemberName?: string;
  familyMemberType: 'child' | 'adult' | 'shared' | 'unassigned';
  childAge?: number;
  childStrictness?: 'relaxed' | 'recommended' | 'strict';
  recommendedMaturity?: NetflixMaturityLevel;
}

export interface ConfigChange {
  id: string;
  type: 'maturity' | 'pin' | 'lock' | 'autoplay';
  profileGuid: string;
  profileName: string;
  description: string;
  enabled: boolean;
  fromLevel?: string;
  toLevel?: string;
  pin?: string;
}

export interface ApplyProgress {
  changeId: string;
  status: 'pending' | 'applying' | 'success' | 'failed';
  error?: string;
}

export type AgentStep =
  | 'idle'
  | 'discovering'
  | 'awaiting-mapping'
  | 'awaiting-maturity'
  | 'awaiting-pins'
  | 'awaiting-locks'
  | 'awaiting-autoplay'
  | 'reviewing'
  | 'applying'
  | 'complete'
  | 'error';

export type DiscoveryPhase =
  | 'navigating'
  | 'checking-login'
  | 'logging-in'
  | 'loading-profiles'
  | 'extracting-cache'
  | 'scraping-dom'
  | 'reading-details'
  | 'done';

export interface AgentStatus {
  step: AgentStep;
  profiles: NetflixProfile[];
  mappings: ProfileMapping[];
  changes: ConfigChange[];
  applyProgress: ApplyProgress[];
  error?: string;
  discoveryPhase?: DiscoveryPhase;
  discoveryProfilesRead?: number;
  discoveryProfilesTotal?: number;
}

const INITIAL_STATUS: AgentStatus = {
  step: 'idle',
  profiles: [],
  mappings: [],
  changes: [],
  applyProgress: [],
};

// Step index for progress bar
const STEP_ORDER: AgentStep[] = [
  'discovering',
  'awaiting-mapping',
  'awaiting-maturity',
  'awaiting-pins',
  'awaiting-locks',
  'awaiting-autoplay',
  'reviewing',
  'applying',
  'complete',
];

export function useConfigAgent() {
  const [status, setStatus] = useState<AgentStatus>(INITIAL_STATUS);
  const [isOpen, setIsOpen] = useState(false);
  const [hasSavedState, setHasSavedState] = useState(false);

  // Listen for push updates from the main process agent
  useEffect(() => {
    if (!ipc?.onConfigAgentStatusUpdate) return;
    const cleanup = ipc.onConfigAgentStatusUpdate((data: unknown) => {
      setStatus(data as AgentStatus);
    });
    return cleanup;
  }, []);

  // Check for saved state on mount
  useEffect(() => {
    if (!ipc?.configAgentCheckSaved) return;
    ipc.configAgentCheckSaved().then((result) => {
      if (result.success && result.data) {
        setHasSavedState(true);
      }
    });
  }, []);

  // Manage tab inset when drawer opens/closes
  useEffect(() => {
    if (!ipc) return;
    ipc.configAgentSetTabInset?.(isOpen ? 360 : 0);
  }, [isOpen]);

  const start = useCallback(async () => {
    if (!ipc?.configAgentStart) return;
    setIsOpen(true);
    setHasSavedState(false);
    setStatus({ ...INITIAL_STATUS, step: 'discovering' });
    const result = await ipc.configAgentStart();
    if (result.success && result.data) {
      setStatus(result.data as AgentStatus);
    } else {
      setStatus({
        ...INITIAL_STATUS,
        step: 'error',
        error: result.error || 'Failed to start agent',
      });
    }
  }, []);

  const resume = useCallback(async () => {
    if (!ipc?.configAgentResume) return;
    setIsOpen(true);
    setHasSavedState(false);
    const result = await ipc.configAgentResume();
    if (result.success && result.data) {
      setStatus(result.data as AgentStatus);
    } else {
      // If resume fails, fall back to fresh start
      await start();
    }
  }, [start]);

  const confirmMappings = useCallback(async (mappings: ProfileMapping[]) => {
    if (!ipc?.configAgentConfirmMappings) return;
    const result = await ipc.configAgentConfirmMappings(mappings);
    if (result.success && result.data) {
      setStatus(result.data as AgentStatus);
    }
  }, []);

  const confirmMaturity = useCallback(async (mappings: ProfileMapping[]) => {
    if (!ipc?.configAgentConfirmMaturity) return;
    const result = await ipc.configAgentConfirmMaturity(mappings);
    if (result.success && result.data) {
      setStatus(result.data as AgentStatus);
    }
  }, []);

  const confirmPins = useCallback(async (profileGuids: string[], pin: string) => {
    if (!ipc?.configAgentConfirmPins) return;
    const result = await ipc.configAgentConfirmPins(profileGuids, pin);
    if (result.success && result.data) {
      setStatus(result.data as AgentStatus);
    }
  }, []);

  const confirmLocks = useCallback(async (profileGuids: string[]) => {
    if (!ipc?.configAgentConfirmLocks) return;
    const result = await ipc.configAgentConfirmLocks(profileGuids);
    if (result.success && result.data) {
      setStatus(result.data as AgentStatus);
    }
  }, []);

  const confirmAutoplay = useCallback(async (settings: { profileGuid: string; disable: boolean }[]) => {
    if (!ipc?.configAgentConfirmAutoplay) return;
    const result = await ipc.configAgentConfirmAutoplay(settings);
    if (result.success && result.data) {
      setStatus(result.data as AgentStatus);
    }
  }, []);

  const updateChanges = useCallback(async (changes: ConfigChange[]) => {
    if (!ipc?.configAgentUpdateChanges) return;
    const result = await ipc.configAgentUpdateChanges(changes);
    if (result.success && result.data) {
      setStatus(result.data as AgentStatus);
    }
  }, []);

  const apply = useCallback(async () => {
    if (!ipc?.configAgentApply) return;
    setStatus((s) => ({ ...s, step: 'applying' }));
    const result = await ipc.configAgentApply();
    if (result.success && result.data) {
      setStatus(result.data as AgentStatus);
    }
  }, []);

  const cancel = useCallback(async () => {
    if (ipc?.configAgentCancel) {
      await ipc.configAgentCancel();
    }
    setStatus(INITIAL_STATUS);
    setIsOpen(false);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    if (ipc?.configAgentSetTabInset) {
      ipc.configAgentSetTabInset(0);
    }
  }, []);

  // Current step index for the progress bar (0-based)
  const stepIndex = STEP_ORDER.indexOf(status.step);
  const totalSteps = STEP_ORDER.length;

  return {
    status,
    isOpen,
    stepIndex,
    totalSteps,
    hasSavedState,
    start,
    resume,
    confirmMappings,
    confirmMaturity,
    confirmPins,
    confirmLocks,
    confirmAutoplay,
    updateChanges,
    apply,
    cancel,
    close,
    setIsOpen,
  };
}
