/**
 * Step 1: Profile Discovery — shows a live progress checklist as the agent
 * navigates to Netflix and extracts profiles, with per-phase status icons.
 */

import React from 'react';
import type { DiscoveryPhase } from '../../../hooks/useConfigAgent';

interface Props {
  phase?: DiscoveryPhase;
  profilesRead?: number;
  profilesTotal?: number;
}

interface MicroStep {
  phase: DiscoveryPhase;
  label: string;
  detail: string;
}

const MICRO_STEPS: MicroStep[] = [
  {
    phase: 'navigating',
    label: 'Opening Netflix',
    detail: 'Navigating to profile management page',
  },
  {
    phase: 'checking-login',
    label: 'Checking auth status',
    detail: 'Verifying you\'re signed in',
  },
  {
    phase: 'logging-in',
    label: 'Signing in',
    detail: 'Auto-filling credentials',
  },
  {
    phase: 'loading-profiles',
    label: 'Loading profile page',
    detail: 'Waiting for Netflix to render',
  },
  {
    phase: 'extracting-cache',
    label: 'Reading profile data',
    detail: 'Extracting from Netflix cache',
  },
  {
    phase: 'scraping-dom',
    label: 'Scanning page',
    detail: 'Extracting profiles from page',
  },
  {
    phase: 'reading-details',
    label: 'Reading profile details',
    detail: 'Checking settings for each profile',
  },
];

const PHASE_ORDER: DiscoveryPhase[] = [
  'navigating',
  'checking-login',
  'logging-in',
  'loading-profiles',
  'extracting-cache',
  'scraping-dom',
  'reading-details',
  'done',
];

function phaseIndex(phase?: DiscoveryPhase): number {
  if (!phase) return -1;
  return PHASE_ORDER.indexOf(phase);
}

function StepIcon({ status }: { status: 'done' | 'active' | 'pending' }) {
  if (status === 'done') {
    return (
      <div className="w-5 h-5 rounded-full bg-teal-400/20 flex items-center justify-center flex-shrink-0">
        <svg className="w-3 h-3 text-teal-400" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </div>
    );
  }
  if (status === 'active') {
    return (
      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 relative">
        <div className="absolute inset-0 rounded-full border-2 border-teal-400/30" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-teal-400 animate-spin" />
        <div className="w-1.5 h-1.5 rounded-full bg-teal-400" />
      </div>
    );
  }
  return (
    <div className="w-5 h-5 rounded-full border border-white/10 flex-shrink-0" />
  );
}

export function ProfileDiscovery({ phase, profilesRead, profilesTotal }: Props) {
  const currentIdx = phaseIndex(phase);

  // Filter out 'logging-in' if we've passed it without hitting it (went straight to loading-profiles)
  const visibleSteps = MICRO_STEPS.filter((s) => {
    // Always hide 'logging-in' if the current phase passed it without activating it
    if (s.phase === 'logging-in' && currentIdx > phaseIndex('logging-in')) {
      return false;
    }
    // Hide 'scraping-dom' if we're past 'extracting-cache' (means Falcor worked)
    if (s.phase === 'scraping-dom' && currentIdx > phaseIndex('extracting-cache') && phase !== 'scraping-dom') {
      return false;
    }
    // Hide 'extracting-cache' if we're on 'scraping-dom' (means Falcor failed, show scraping instead)
    if (s.phase === 'extracting-cache' && phase === 'scraping-dom') {
      return false;
    }
    return true;
  });

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-2 border-teal-400/20" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-teal-400 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-4 h-4 text-teal-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        <div>
          <h3 className="text-[14px] font-semibold text-white">
            Scanning Netflix
          </h3>
          <p className="text-[11px] text-white/40">
            {profilesTotal && profilesTotal > 0
              ? `Found ${profilesTotal} profile${profilesTotal !== 1 ? 's' : ''}`
              : 'Discovering your profiles...'}
          </p>
        </div>
      </div>

      {/* Micro-step checklist */}
      <div className="space-y-0.5">
        {visibleSteps.map((ms, i) => {
          const msIdx = phaseIndex(ms.phase);
          let status: 'done' | 'active' | 'pending';
          if (msIdx < currentIdx) {
            status = 'done';
          } else if (msIdx === currentIdx) {
            status = 'active';
          } else {
            status = 'pending';
          }

          return (
            <div
              key={ms.phase}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-300 ${
                status === 'active'
                  ? 'bg-teal-400/[0.06]'
                  : ''
              }`}
              style={{
                opacity: status === 'pending' ? 0.35 : 1,
                animationDelay: `${i * 50}ms`,
              }}
            >
              <StepIcon status={status} />
              <div className="min-w-0 flex-1">
                <div className={`text-[12px] font-medium transition-colors duration-300 ${
                  status === 'active' ? 'text-white' : status === 'done' ? 'text-white/60' : 'text-white/30'
                }`}>
                  {ms.label}
                  {/* Show profile count for the reading step */}
                  {ms.phase === 'reading-details' && status === 'active' && profilesRead !== undefined && profilesTotal !== undefined && profilesTotal > 0 && (
                    <span className="text-teal-400/70 ml-1.5">
                      ({profilesRead}/{profilesTotal})
                    </span>
                  )}
                </div>
                {status === 'active' && (
                  <div className="text-[10px] text-white/35 mt-0.5 animate-fade-in">
                    {ms.detail}
                  </div>
                )}
              </div>
              {status === 'active' && (
                <div className="flex gap-1">
                  {[0, 1, 2].map((j) => (
                    <div
                      key={j}
                      className="w-1 h-1 rounded-full bg-teal-400/50 animate-bounce"
                      style={{ animationDelay: `${j * 150}ms` }}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Elapsed time hint */}
      <div className="mt-4 text-center">
        <p className="text-[10px] text-white/20">
          This usually takes 5-10 seconds
        </p>
      </div>
    </div>
  );
}
