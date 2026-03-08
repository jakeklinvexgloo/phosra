/**
 * Step 4: PIN Protection — lets the parent set a 4-digit PIN on adult
 * profiles to prevent children from switching to them.
 *
 * If all adult profiles already have PINs, shows a confirmation instead.
 */

import React, { useState, useMemo } from 'react';
import type { NetflixProfile, ProfileMapping } from '../../../hooks/useConfigAgent';

interface Props {
  profiles: NetflixProfile[];
  mappings: ProfileMapping[];
  onConfirm: (profileGuids: string[], pin: string) => void;
}

export function PinProtection({ profiles, mappings, onConfirm }: Props) {
  // Identify adult profiles (not mapped to children)
  const adultProfiles = useMemo(() => {
    const childGuids = new Set(
      mappings
        .filter((m) => m.familyMemberType === 'child')
        .map((m) => m.netflixProfile.guid),
    );
    return profiles.filter((p) => !childGuids.has(p.guid) && !p.isKids);
  }, [profiles, mappings]);

  const allHavePins = adultProfiles.length > 0 && adultProfiles.every((p) => p.hasPIN);
  const unpinnedProfiles = adultProfiles.filter((p) => !p.hasPIN);

  const [selectedGuids, setSelectedGuids] = useState<Set<string>>(new Set());

  const [pin, setPin] = useState('');

  const toggleProfile = (guid: string) => {
    setSelectedGuids((prev) => {
      const next = new Set(prev);
      if (next.has(guid)) next.delete(guid);
      else next.add(guid);
      return next;
    });
  };

  const handleContinue = () => {
    onConfirm(Array.from(selectedGuids), pin);
  };

  const handleSkip = () => {
    onConfirm([], '');
  };

  // --- All adult profiles already have PINs ---
  if (allHavePins) {
    return (
      <div className="animate-fade-in">
        <div className="mb-4">
          <h3 className="text-[14px] font-semibold text-white mb-1">PIN Protection</h3>
        </div>

        <div className="space-y-2 mb-4">
          {adultProfiles.map((profile, i) => (
            <div
              key={profile.guid}
              className="flex items-center gap-2.5 p-2.5 rounded-xl border border-teal-400/15 bg-teal-400/[0.04] animate-field-enter"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <div className="w-7 h-7 rounded-md flex-shrink-0 overflow-hidden bg-[#333] relative">
                <span className="absolute inset-0 flex items-center justify-center text-[11px] font-medium text-white/60">
                  {profile.name.charAt(0)}
                </span>
                {profile.avatarUrl && (
                  <img
                    src={profile.avatarUrl}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                )}
              </div>
              <span className="text-[12px] text-white">{profile.name}</span>
              <span className="text-[9px] font-medium text-teal-400 bg-teal-400/10 px-1.5 py-0.5 rounded-full ml-auto flex items-center gap-1">
                <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                PIN enabled
              </span>
            </div>
          ))}
        </div>

        <button
          onClick={handleSkip}
          className="w-full h-10 rounded-lg text-[12px] font-medium bg-teal-500 hover:bg-teal-400 active:bg-teal-600 text-white shadow-[0_2px_8px_rgba(45,212,191,0.25)] active:scale-[0.98] transition-all duration-200"
        >
          Continue
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-4">
        <h3 className="text-[14px] font-semibold text-white mb-1">PIN Protection</h3>
        <p className="text-[11px] text-white/40 mb-2">
          Add a 4-digit PIN to adult profiles so children can't access them.
        </p>
        <div className="p-2.5 rounded-lg bg-blue-400/8 border border-blue-400/10">
          <p className="text-[10px] text-blue-300/80 leading-relaxed">
            <span className="font-semibold text-blue-300">PIN</span> adds a quick 4-digit code to <span className="text-white/60">adult</span> profiles.
            The next step, <span className="font-semibold text-blue-300">Profile Lock</span>, requires the full Netflix <span className="text-white/60">account password</span> to switch away from a <span className="text-white/60">child's</span> profile — a stronger safeguard.
          </p>
        </div>
      </div>

      {adultProfiles.length === 0 ? (
        <div className="py-4 text-center">
          <p className="text-[12px] text-white/40 mb-4">
            No adult profiles found to protect with a PIN.
          </p>
          <button
            onClick={handleSkip}
            className="w-full h-10 rounded-lg text-[12px] font-medium bg-teal-500 hover:bg-teal-400 text-white transition-all duration-200"
          >
            Continue
          </button>
        </div>
      ) : (
        <>
          {/* Profiles already secured */}
          {adultProfiles.some((p) => p.hasPIN) && (
            <div className="space-y-2 mb-3">
              {adultProfiles.filter((p) => p.hasPIN).map((profile, i) => (
                <div
                  key={profile.guid}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl border border-teal-400/15 bg-teal-400/[0.04] animate-field-enter"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <div className="w-7 h-7 rounded-md flex-shrink-0 overflow-hidden bg-[#333] relative">
                    <span className="absolute inset-0 flex items-center justify-center text-[11px] font-medium text-white/60">
                      {profile.name.charAt(0)}
                    </span>
                    {profile.avatarUrl && (
                      <img
                        src={profile.avatarUrl}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    )}
                  </div>
                  <span className="text-[12px] text-white">{profile.name}</span>
                  <span className="text-[9px] font-medium text-teal-400 bg-teal-400/10 px-1.5 py-0.5 rounded-full ml-auto flex items-center gap-1">
                    <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    PIN enabled
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Profiles that need PINs */}
          {unpinnedProfiles.length > 0 && (
            <>
              {adultProfiles.some((p) => p.hasPIN) && (
                <p className="text-[10px] text-white/30 uppercase tracking-wider font-semibold mb-2 mt-1">
                  Not yet protected
                </p>
              )}
              <div className="space-y-2 mb-4">
                {unpinnedProfiles.map((profile, i) => (
                  <label
                    key={profile.guid}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] cursor-pointer hover:bg-white/[0.04] transition-colors animate-field-enter"
                    style={{ animationDelay: `${i * 40}ms` }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedGuids.has(profile.guid)}
                      onChange={() => toggleProfile(profile.guid)}
                      className="w-4 h-4 rounded border-white/20 bg-white/[0.06] text-teal-400 focus:ring-teal-400/50"
                    />
                    <div className="w-7 h-7 rounded-md flex-shrink-0 overflow-hidden bg-[#333] relative">
                      <span className="absolute inset-0 flex items-center justify-center text-[11px] font-medium text-white/60">
                        {profile.name.charAt(0)}
                      </span>
                      {profile.avatarUrl && (
                        <img
                          src={profile.avatarUrl}
                          alt=""
                          className="absolute inset-0 w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      )}
                    </div>
                    <span className="text-[12px] text-white">{profile.name}</span>
                  </label>
                ))}
              </div>
            </>
          )}

          {/* PIN input */}
          {selectedGuids.size > 0 && (
            <div className="mb-4 animate-field-enter">
              <label className="block text-[11px] font-medium text-white/50 mb-1.5">
                4-Digit PIN
              </label>
              <input
                type="tel"
                value={pin}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, '').slice(0, 4);
                  setPin(digits);
                }}
                placeholder="1234"
                maxLength={4}
                className="w-full h-10 rounded-lg bg-white/[0.06] border border-white/[0.08] text-[18px] text-white text-center font-mono tracking-[0.5em] px-4 placeholder:text-white/20 focus:outline-none focus:border-teal-400/50 focus:ring-1 focus:ring-teal-400/30 transition-all"
                autoFocus
              />
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleContinue}
              disabled={selectedGuids.size > 0 && pin.length !== 4}
              className={`flex-1 h-10 rounded-lg text-[12px] font-medium transition-all duration-200 flex items-center justify-center gap-1.5 ${
                selectedGuids.size === 0 || pin.length === 4
                  ? 'bg-teal-500 hover:bg-teal-400 active:bg-teal-600 text-white shadow-[0_2px_8px_rgba(45,212,191,0.25)] active:scale-[0.98]'
                  : 'bg-white/[0.05] text-white/20 cursor-not-allowed'
              }`}
            >
              Continue
            </button>
            <button
              onClick={handleSkip}
              className="px-4 h-10 rounded-lg text-[12px] font-medium text-white/40 hover:text-white/60 hover:bg-white/[0.05] active:scale-[0.97] transition-all duration-200"
            >
              Skip
            </button>
          </div>
        </>
      )}
    </div>
  );
}
