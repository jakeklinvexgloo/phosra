/**
 * Step 6: Autoplay Settings — toggle autoplay off for children's profiles.
 * Recommended: disable for under 8 (all strictness), under 12 (recommended/strict).
 */

import React, { useState, useMemo } from 'react';
import type { ProfileMapping } from '../../../hooks/useConfigAgent';

interface Props {
  mappings: ProfileMapping[];
  onConfirm: (settings: { profileGuid: string; disable: boolean }[]) => void;
}

function shouldDisableAutoplay(age?: number, strictness?: string): boolean {
  if (!age || !strictness) return false;
  if (age < 8) return true;
  if (age < 12 && (strictness === 'recommended' || strictness === 'strict')) return true;
  return false;
}

export function AutoplaySettings({ mappings, onConfirm }: Props) {
  const childMappings = useMemo(
    () => mappings.filter((m) => m.familyMemberType === 'child'),
    [mappings],
  );

  const [disabled, setDisabled] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    for (const m of childMappings) {
      if (shouldDisableAutoplay(m.childAge, m.childStrictness)) {
        initial.add(m.netflixProfile.guid);
      }
    }
    return initial;
  });

  const toggleAutoplay = (guid: string) => {
    setDisabled((prev) => {
      const next = new Set(prev);
      if (next.has(guid)) next.delete(guid);
      else next.add(guid);
      return next;
    });
  };

  const handleContinue = () => {
    const settings = childMappings.map((m) => ({
      profileGuid: m.netflixProfile.guid,
      disable: disabled.has(m.netflixProfile.guid),
    }));
    onConfirm(settings);
  };

  if (childMappings.length === 0) {
    return (
      <div className="animate-fade-in">
        <h3 className="text-[14px] font-semibold text-white mb-2">Autoplay</h3>
        <p className="text-[12px] text-white/40 mb-4">No children's profiles to configure.</p>
        <button
          onClick={() => onConfirm([])}
          className="w-full h-10 rounded-lg text-[12px] font-medium bg-teal-500 hover:bg-teal-400 text-white transition-all duration-200"
        >
          Continue
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-4">
        <h3 className="text-[14px] font-semibold text-white mb-1">Autoplay Settings</h3>
        <p className="text-[11px] text-white/40">
          Disable autoplay for children's profiles to encourage intentional viewing.
        </p>
      </div>

      <div className="space-y-2">
        {childMappings.map((m, i) => {
          const isDisabled = disabled.has(m.netflixProfile.guid);
          const recommended = shouldDisableAutoplay(m.childAge, m.childStrictness);

          return (
            <div
              key={m.netflixProfile.guid}
              className="flex items-center justify-between p-3 rounded-xl border border-white/[0.06] bg-white/[0.02] animate-field-enter"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-teal-400/15 flex items-center justify-center flex-shrink-0">
                  <span className="text-[11px] font-semibold text-teal-300">
                    {(m.familyMemberName ?? '?').charAt(0)}
                  </span>
                </div>
                <div>
                  <div className="text-[12px] font-medium text-white">
                    {m.familyMemberName}
                    {recommended && (
                      <span className="text-[9px] text-amber-400/70 ml-1.5">(recommended)</span>
                    )}
                  </div>
                  <div className="text-[10px] text-white/35">
                    Age {m.childAge} — Autoplay {isDisabled ? 'OFF' : 'ON'}
                  </div>
                </div>
              </div>

              {/* Toggle (inverted: ON means autoplay disabled) */}
              <button
                onClick={() => toggleAutoplay(m.netflixProfile.guid)}
                className={`w-10 h-5 rounded-full transition-all duration-200 relative ${
                  isDisabled ? 'bg-teal-400' : 'bg-white/[0.12]'
                }`}
                title={isDisabled ? 'Autoplay disabled' : 'Autoplay enabled'}
              >
                <div
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200 ${
                    isDisabled ? 'left-[22px]' : 'left-0.5'
                  }`}
                />
              </button>
            </div>
          );
        })}
      </div>

      <button
        onClick={handleContinue}
        className="w-full mt-4 h-10 rounded-lg text-[12px] font-medium bg-teal-500 hover:bg-teal-400 active:bg-teal-600 text-white shadow-[0_2px_8px_rgba(45,212,191,0.25)] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-1.5"
      >
        Continue
        <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
}
