/**
 * Config Agent Drawer — right-edge slide-in panel (360px) that renders
 * alongside the browser tab. Contains the wizard step navigation,
 * progress bar, and renders the active step component.
 */

import React from 'react';
import { ProfileDiscovery } from './steps/ProfileDiscovery';
import { ProfileMapping } from './steps/ProfileMapping';
import { MaturityReview } from './steps/MaturityReview';
import { PinProtection } from './steps/PinProtection';
import { ProfileLock } from './steps/ProfileLock';
import { AutoplaySettings } from './steps/AutoplaySettings';
import { ReviewApply } from './steps/ReviewApply';
import { Confirmation } from './steps/Confirmation';
import type { useConfigAgent } from '../../hooks/useConfigAgent';
import type { Child, FamilyMember } from '../../lib/ipc';

interface ConfigAgentDrawerProps {
  agent: ReturnType<typeof useConfigAgent>;
  children: Child[];
  members: FamilyMember[];
}

const STEP_LABELS = [
  'Discover',
  'Map Profiles',
  'Maturity',
  'PIN',
  'Lock',
  'Autoplay',
  'Review',
  'Apply',
  'Done',
];

export function ConfigAgentDrawer({ agent, children, members }: ConfigAgentDrawerProps) {
  const { status, stepIndex, totalSteps, cancel, close } = agent;

  return (
    <div
      className="fixed top-0 right-0 bottom-0 w-[360px] bg-[#1a1a2e]/95 backdrop-blur-xl border-l border-white/[0.08] flex flex-col z-50 animate-slide-in-right"
      style={{ boxShadow: '-4px 0 24px rgba(0,0,0,0.4)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          {/* Netflix icon */}
          <div className="w-8 h-8 rounded-lg bg-[#E50914] flex items-center justify-center p-1.5">
            <svg viewBox="0 0 24 34" className="w-full h-full">
              <defs>
                <linearGradient id="nGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#E50914" />
                  <stop offset="1" stopColor="#B1060F" />
                </linearGradient>
              </defs>
              <rect x="0" y="0" width="6" height="34" fill="#fff" />
              <rect x="18" y="0" width="6" height="34" fill="#fff" />
              <polygon points="0,0 6,0 24,34 18,34" fill="rgba(255,255,255,0.85)" />
            </svg>
          </div>
          <div>
            <h2 className="text-[13px] font-semibold text-white">Configure Netflix</h2>
            <p className="text-[10px] text-white/40">Family safety settings</p>
          </div>
        </div>
        <button
          onClick={close}
          className="p-1.5 rounded-lg hover:bg-white/[0.06] text-white/40 hover:text-white/70 transition-all duration-150"
          title="Close"
        >
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Progress bar */}
      {stepIndex >= 0 && status.step !== 'error' && (
        <div className="px-4 pt-3 pb-2">
          <div className="flex items-center gap-1 mb-1.5">
            {STEP_LABELS.map((label, i) => (
              <div
                key={label}
                className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                  i <= stepIndex
                    ? 'bg-teal-400'
                    : 'bg-white/[0.08]'
                }`}
              />
            ))}
          </div>
          <p className="text-[10px] text-white/30">
            Step {Math.max(stepIndex + 1, 1)} of {totalSteps} — {STEP_LABELS[Math.max(stepIndex, 0)]}
          </p>
        </div>
      )}

      {/* Step content */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
        <StepRenderer agent={agent} children={children} members={members} />
      </div>

      {/* Cancel button (always visible except on complete) */}
      {status.step !== 'complete' && status.step !== 'idle' && (
        <div className="px-4 py-3 border-t border-white/[0.06]">
          <button
            onClick={cancel}
            className="w-full h-9 rounded-lg text-[12px] font-medium text-white/40 hover:text-white/60 hover:bg-white/[0.05] active:scale-[0.98] transition-all duration-200"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

function StepRenderer({
  agent,
  children,
  members,
}: ConfigAgentDrawerProps) {
  const { status } = agent;

  switch (status.step) {
    case 'discovering':
      return (
        <ProfileDiscovery
          phase={status.discoveryPhase}
          profilesRead={status.discoveryProfilesRead}
          profilesTotal={status.discoveryProfilesTotal}
        />
      );

    case 'awaiting-mapping':
      return (
        <ProfileMapping
          profiles={status.profiles}
          children={children}
          members={members}
          savedMappings={status.mappings}
          onConfirm={agent.confirmMappings}
        />
      );

    case 'awaiting-maturity':
      return (
        <MaturityReview
          mappings={status.mappings}
          onConfirm={agent.confirmMaturity}
        />
      );

    case 'awaiting-pins':
      return (
        <PinProtection
          profiles={status.profiles}
          mappings={status.mappings}
          onConfirm={agent.confirmPins}
        />
      );

    case 'awaiting-locks':
      return (
        <ProfileLock
          mappings={status.mappings}
          onConfirm={agent.confirmLocks}
        />
      );

    case 'awaiting-autoplay':
      return (
        <AutoplaySettings
          mappings={status.mappings}
          onConfirm={agent.confirmAutoplay}
        />
      );

    case 'reviewing':
      return (
        <ReviewApply
          changes={status.changes}
          applyProgress={status.applyProgress}
          isApplying={false}
          onUpdateChanges={agent.updateChanges}
          onApply={agent.apply}
        />
      );

    case 'applying':
      return (
        <ReviewApply
          changes={status.changes}
          applyProgress={status.applyProgress}
          isApplying={true}
          onUpdateChanges={agent.updateChanges}
          onApply={agent.apply}
        />
      );

    case 'complete':
    case 'error':
      return (
        <Confirmation
          applyProgress={status.applyProgress}
          changes={status.changes}
          error={status.error}
          onClose={agent.close}
          onRetry={agent.apply}
        />
      );

    default:
      return null;
  }
}
