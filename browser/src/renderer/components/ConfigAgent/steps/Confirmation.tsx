/**
 * Step 8: Confirmation — success or failure summary with retry option.
 */

import React from 'react';
import type { ApplyProgress, ConfigChange } from '../../../hooks/useConfigAgent';

interface Props {
  applyProgress: ApplyProgress[];
  changes: ConfigChange[];
  error?: string;
  onClose: () => void;
  onRetry: () => void;
}

export function Confirmation({ applyProgress, changes, error, onClose, onRetry }: Props) {
  const successCount = applyProgress.filter((p) => p.status === 'success').length;
  const failedCount = applyProgress.filter((p) => p.status === 'failed').length;
  const totalCount = applyProgress.length;
  const allSuccess = failedCount === 0 && successCount > 0;

  return (
    <div className="animate-fade-in">
      {/* Status icon */}
      <div className="flex flex-col items-center py-6">
        {allSuccess ? (
          <>
            <div className="w-16 h-16 rounded-full bg-teal-400/15 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-teal-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-[16px] font-semibold text-white mb-1">
              Netflix is Configured!
            </h3>
            <p className="text-[12px] text-white/40 text-center">
              {successCount} setting{successCount !== 1 ? 's' : ''} applied successfully for your family.
            </p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-amber-400/15 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-[16px] font-semibold text-white mb-1">
              Partially Configured
            </h3>
            <p className="text-[12px] text-white/40 text-center">
              {successCount} of {totalCount} settings applied. {failedCount} failed.
            </p>
          </>
        )}
      </div>

      {/* Change summary */}
      <div className="space-y-1.5 mb-4">
        {applyProgress.map((progress) => {
          const change = changes.find((c) => c.id === progress.changeId);
          if (!change) return null;

          return (
            <div
              key={progress.changeId}
              className={`flex items-center gap-2 p-2 rounded-lg ${
                progress.status === 'success'
                  ? 'bg-teal-400/[0.05]'
                  : progress.status === 'failed'
                    ? 'bg-red-400/[0.05]'
                    : 'bg-white/[0.02]'
              }`}
            >
              {progress.status === 'success' ? (
                <svg className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5 text-red-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              )}
              <div className="min-w-0 flex-1">
                <span className="text-[11px] text-white/70">{change.description}</span>
                {progress.error && (
                  <div className="text-[10px] text-red-400 mt-0.5">{progress.error}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {error && (
        <div className="mb-4 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
          <span className="text-[11px] text-red-400">{error}</span>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          onClick={onClose}
          className="flex-1 h-10 rounded-lg text-[12px] font-medium bg-teal-500 hover:bg-teal-400 active:bg-teal-600 text-white shadow-[0_2px_8px_rgba(45,212,191,0.25)] active:scale-[0.98] transition-all duration-200"
        >
          Done
        </button>
        {failedCount > 0 && (
          <button
            onClick={onRetry}
            className="px-4 h-10 rounded-lg text-[12px] font-medium text-amber-400 hover:text-amber-300 hover:bg-amber-400/[0.08] active:scale-[0.97] transition-all duration-200"
          >
            Retry Failed
          </button>
        )}
      </div>
    </div>
  );
}
