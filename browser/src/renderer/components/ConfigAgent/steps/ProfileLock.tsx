/**
 * Step 5: Profile Lock — toggle per child profile to prevent switching.
 * Pre-selected ON for recommended/strict, OFF for relaxed.
 */

import React, { useState, useMemo } from 'react';
import type { ProfileMapping } from '../../../hooks/useConfigAgent';

interface Props {
  mappings: ProfileMapping[];
  onConfirm: (profileGuids: string[]) => void;
}

export function ProfileLock({ mappings, onConfirm }: Props) {
  const childMappings = useMemo(
    () => mappings.filter((m) => m.familyMemberType === 'child'),
    [mappings],
  );

  const [locked, setLocked] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    for (const m of childMappings) {
      // Pre-select for recommended and strict
      if (m.childStrictness !== 'relaxed') {
        initial.add(m.netflixProfile.guid);
      }
    }
    return initial;
  });

  const toggleLock = (guid: string) => {
    setLocked((prev) => {
      const next = new Set(prev);
      if (next.has(guid)) next.delete(guid);
      else next.add(guid);
      return next;
    });
  };

  const handleContinue = () => {
    onConfirm(Array.from(locked));
  };

  if (childMappings.length === 0) {
    return (
      <div className="animate-fade-in">
        <h3 className="text-[14px] font-semibold text-white mb-2">Profile Lock</h3>
        <p className="text-[12px] text-white/40 mb-4">No children's profiles to lock.</p>
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
        <h3 className="text-[14px] font-semibold text-white mb-1">Profile Lock</h3>
        <p className="text-[11px] text-white/40 mb-2">
          Lock children's profiles so they can't switch to other profiles.
        </p>
        <div className="p-2.5 rounded-lg bg-blue-400/8 border border-blue-400/10">
          <p className="text-[10px] text-blue-300/80 leading-relaxed">
            <span className="font-semibold text-blue-300">Profile Lock</span> requires the full Netflix <span className="text-white/60">account password</span> to leave a child's profile — stronger than the 4-digit <span className="text-white/60">PIN</span> set in the previous step.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {childMappings.map((m, i) => (
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
                <div className="text-[12px] font-medium text-white">{m.familyMemberName}</div>
                <div className="text-[10px] text-white/35">
                  {m.netflixProfile.name} — age {m.childAge}
                </div>
              </div>
            </div>

            {/* Toggle */}
            <button
              onClick={() => toggleLock(m.netflixProfile.guid)}
              className={`w-10 h-5 rounded-full transition-all duration-200 relative ${
                locked.has(m.netflixProfile.guid)
                  ? 'bg-teal-400'
                  : 'bg-white/[0.12]'
              }`}
            >
              <div
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200 ${
                  locked.has(m.netflixProfile.guid) ? 'left-[22px]' : 'left-0.5'
                }`}
              />
            </button>
          </div>
        ))}
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
