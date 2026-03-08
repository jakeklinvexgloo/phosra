/**
 * Step 7: Review & Apply — summary of all changes grouped by type,
 * with checkboxes to exclude individual items, and a live progress
 * checklist during application.
 */

import React from 'react';
import type { ConfigChange, ApplyProgress } from '../../../hooks/useConfigAgent';

interface Props {
  changes: ConfigChange[];
  applyProgress: ApplyProgress[];
  isApplying: boolean;
  onUpdateChanges: (changes: ConfigChange[]) => void;
  onApply: () => void;
}

const TYPE_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  maturity: { label: 'Maturity Ratings', icon: 'M', color: 'text-blue-400 bg-blue-400/15' },
  pin: { label: 'PIN Protection', icon: '#', color: 'text-amber-400 bg-amber-400/15' },
  lock: { label: 'Profile Locks', icon: 'L', color: 'text-purple-400 bg-purple-400/15' },
  autoplay: { label: 'Autoplay', icon: 'A', color: 'text-teal-400 bg-teal-400/15' },
};

function StatusIcon({ status }: { status: ApplyProgress['status'] }) {
  switch (status) {
    case 'pending':
      return (
        <div className="w-4 h-4 rounded-full border border-white/20" />
      );
    case 'applying':
      return (
        <div className="w-4 h-4 rounded-full border-2 border-transparent border-t-teal-400 animate-spin" />
      );
    case 'success':
      return (
        <svg className="w-4 h-4 text-teal-400" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      );
    case 'failed':
      return (
        <svg className="w-4 h-4 text-red-400" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      );
  }
}

export function ReviewApply({ changes, applyProgress, isApplying, onUpdateChanges, onApply }: Props) {
  const enabledCount = changes.filter((c) => c.enabled).length;

  const toggleChange = (id: string) => {
    if (isApplying) return;
    const updated = changes.map((c) =>
      c.id === id ? { ...c, enabled: !c.enabled } : c,
    );
    onUpdateChanges(updated);
  };

  // Group changes by type
  const groups = changes.reduce<Record<string, ConfigChange[]>>((acc, change) => {
    if (!acc[change.type]) acc[change.type] = [];
    acc[change.type].push(change);
    return acc;
  }, {});

  return (
    <div className="animate-fade-in">
      <div className="mb-4">
        <h3 className="text-[14px] font-semibold text-white mb-1">
          {isApplying ? 'Applying Changes...' : 'Review Changes'}
        </h3>
        <p className="text-[11px] text-white/40">
          {isApplying
            ? 'The agent is navigating Netflix and applying your settings. Watch the tab on the left.'
            : `${enabledCount} change${enabledCount !== 1 ? 's' : ''} ready to apply. Uncheck any you'd like to skip.`
          }
        </p>
      </div>

      {changes.length === 0 ? (
        <div className="py-6 text-center">
          <p className="text-[12px] text-white/40">No changes to apply.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groups).map(([type, typeChanges]) => {
            const meta = TYPE_LABELS[type] ?? { label: type, icon: '?', color: 'text-white/60 bg-white/10' };
            return (
              <div key={type}>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${meta.color}`}>
                    {meta.icon}
                  </div>
                  <span className="text-[11px] font-semibold text-white/50 uppercase tracking-wider">
                    {meta.label}
                  </span>
                </div>
                <div className="space-y-1.5">
                  {typeChanges.map((change) => {
                    const progress = applyProgress.find((p) => p.changeId === change.id);
                    return (
                      <div
                        key={change.id}
                        className={`flex items-center gap-2.5 p-2.5 rounded-lg border transition-all duration-200 ${
                          change.enabled
                            ? 'border-white/[0.08] bg-white/[0.02]'
                            : 'border-white/[0.04] bg-white/[0.01] opacity-50'
                        }`}
                      >
                        {isApplying && progress ? (
                          <StatusIcon status={progress.status} />
                        ) : (
                          <input
                            type="checkbox"
                            checked={change.enabled}
                            onChange={() => toggleChange(change.id)}
                            disabled={isApplying}
                            className="w-3.5 h-3.5 rounded border-white/20 bg-white/[0.06] text-teal-400 focus:ring-teal-400/50"
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="text-[11px] text-white/80">{change.description}</div>
                          {progress?.status === 'failed' && progress.error && (
                            <div className="text-[10px] text-red-400 mt-0.5">{progress.error}</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!isApplying && changes.length > 0 && (
        <button
          onClick={onApply}
          disabled={enabledCount === 0}
          className={`w-full mt-4 h-10 rounded-lg text-[12px] font-medium transition-all duration-200 flex items-center justify-center gap-1.5 ${
            enabledCount > 0
              ? 'bg-teal-500 hover:bg-teal-400 active:bg-teal-600 text-white shadow-[0_2px_8px_rgba(45,212,191,0.25)] active:scale-[0.98]'
              : 'bg-white/[0.05] text-white/20 cursor-not-allowed'
          }`}
        >
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Apply {enabledCount} Change{enabledCount !== 1 ? 's' : ''}
        </button>
      )}

      {isApplying && (
        <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-white/40">
          <div className="w-3 h-3 rounded-full border-2 border-transparent border-t-teal-400 animate-spin" />
          Working...
        </div>
      )}
    </div>
  );
}
