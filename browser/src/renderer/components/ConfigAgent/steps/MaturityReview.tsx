/**
 * Step 3: Maturity Settings Review — profile-centric cards that group all
 * linked family members under each Netflix profile, with current vs suggested
 * maturity visualization and override dropdowns.
 */

import React, { useState, useMemo } from 'react';
import type { ProfileMapping, NetflixMaturityLevel } from '../../../hooks/useConfigAgent';

interface Props {
  mappings: ProfileMapping[];
  onConfirm: (mappings: ProfileMapping[]) => void;
}

const MATURITY_OPTIONS: { value: NetflixMaturityLevel; label: string; description: string; ratings: string }[] = [
  { value: 'little-kids', label: 'Little Kids', description: 'G, TV-Y, TV-G only', ratings: 'TV-Y / G' },
  { value: 'older-kids', label: 'Older Kids', description: 'PG, TV-PG and below', ratings: 'TV-PG / PG' },
  { value: 'teens', label: 'Teens', description: 'PG-13, TV-14 and below', ratings: 'TV-14 / PG-13' },
  { value: 'all', label: 'All Maturity Ratings', description: 'Including R and TV-MA', ratings: 'TV-MA / R' },
];

function maturityLabel(level: NetflixMaturityLevel): string {
  return MATURITY_OPTIONS.find((o) => o.value === level)?.label ?? level;
}

function maturityRatings(level: NetflixMaturityLevel): string {
  return MATURITY_OPTIONS.find((o) => o.value === level)?.ratings ?? '';
}

function recommendMaturity(age: number, strictness: string): NetflixMaturityLevel {
  if (strictness === 'strict') {
    if (age <= 9) return 'little-kids';
    if (age <= 15) return 'older-kids';
    return 'teens';
  }
  if (strictness === 'recommended') {
    if (age <= 7) return 'little-kids';
    if (age <= 12) return 'older-kids';
    return 'teens';
  }
  // relaxed
  if (age <= 7) return 'older-kids';
  if (age <= 12) return 'teens';
  return 'all';
}

// ── Grouped profile data ────────────────────────────────────────────────────

interface LinkedMember {
  id?: string;
  name: string;
  type: 'child' | 'adult' | 'shared' | 'unassigned';
  age?: number;
  strictness?: string;
}

interface ProfileGroup {
  guid: string;
  profileName: string;
  avatarUrl: string;
  isKids: boolean;
  currentMaturity: NetflixMaturityLevel;
  members: LinkedMember[];
  youngestChild: LinkedMember | null;
  suggestedMaturity: NetflixMaturityLevel;
  hasChildren: boolean;
}

function buildProfileGroups(mappings: ProfileMapping[]): ProfileGroup[] {
  const groupMap = new Map<string, ProfileGroup>();

  for (const m of mappings) {
    const guid = m.netflixProfile.guid;
    let group = groupMap.get(guid);
    if (!group) {
      group = {
        guid,
        profileName: m.netflixProfile.name,
        avatarUrl: m.netflixProfile.avatarUrl,
        isKids: m.netflixProfile.isKids,
        currentMaturity: m.netflixProfile.maturityLevel,
        members: [],
        youngestChild: null,
        suggestedMaturity: m.netflixProfile.maturityLevel,
        hasChildren: false,
      };
      groupMap.set(guid, group);
    }

    const member: LinkedMember = {
      id: m.familyMemberId,
      name: m.familyMemberName ?? (m.familyMemberType === 'shared' ? 'Shared Profile' : 'Unassigned'),
      type: m.familyMemberType,
      age: m.childAge,
      strictness: m.childStrictness,
    };

    // Deduplicate members by id+type
    const isDuplicate = group.members.some(
      (existing) => existing.id === member.id && existing.type === member.type,
    );
    if (!isDuplicate) {
      group.members.push(member);
    }

    if (m.familyMemberType === 'child' && m.childAge !== undefined) {
      group.hasChildren = true;
      if (!group.youngestChild || (m.childAge < (group.youngestChild.age ?? Infinity))) {
        group.youngestChild = member;
      }
    }
  }

  // Compute suggestion from youngest child
  for (const group of groupMap.values()) {
    if (group.youngestChild && group.youngestChild.age !== undefined && group.youngestChild.strictness) {
      group.suggestedMaturity = recommendMaturity(
        group.youngestChild.age,
        group.youngestChild.strictness,
      );
    }
  }

  return Array.from(groupMap.values());
}

// ── Component ───────────────────────────────────────────────────────────────

export function MaturityReview({ mappings, onConfirm }: Props) {
  const profileGroups = useMemo(() => buildProfileGroups(mappings), [mappings]);
  const hasAnyChildren = profileGroups.some((g) => g.hasChildren);

  const [overrides, setOverrides] = useState<Record<string, NetflixMaturityLevel>>(() => {
    const initial: Record<string, NetflixMaturityLevel> = {};
    for (const group of profileGroups) {
      initial[group.guid] = group.suggestedMaturity;
    }
    return initial;
  });

  const handleConfirm = () => {
    const updated = mappings.map((m) => {
      if (m.familyMemberType !== 'child') return m;
      return {
        ...m,
        recommendedMaturity: overrides[m.netflixProfile.guid] ?? m.netflixProfile.maturityLevel,
      };
    });
    onConfirm(updated);
  };

  if (!hasAnyChildren) {
    return (
      <div className="animate-fade-in">
        <h3 className="text-[14px] font-semibold text-white mb-2">Maturity Settings</h3>
        <p className="text-[12px] text-white/40 mb-4">
          No profiles are mapped to children. Skipping maturity configuration.
        </p>
        <button
          onClick={handleConfirm}
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
        <h3 className="text-[14px] font-semibold text-white mb-1">Maturity Settings</h3>
        <p className="text-[11px] text-white/40">
          Review maturity levels for each Netflix profile based on the youngest child linked.
        </p>
      </div>

      <div className="space-y-3">
        {profileGroups.map((group, i) => {
          const current = group.currentMaturity;
          const suggested = overrides[group.guid] ?? group.suggestedMaturity;
          const needsChange = current !== suggested;

          return (
            <div
              key={group.guid}
              className="p-3 rounded-xl border border-white/[0.06] bg-white/[0.02] animate-field-enter"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              {/* Profile header */}
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-lg flex-shrink-0 overflow-hidden bg-[#333] relative">
                  <span className="absolute inset-0 flex items-center justify-center text-[12px] font-semibold text-white/60">
                    {group.profileName.charAt(0)}
                  </span>
                  {group.avatarUrl && (
                    <img
                      src={group.avatarUrl}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[12px] font-medium text-white">{group.profileName}</div>
                  {group.isKids && (
                    <span className="text-[9px] text-yellow-300/70 font-medium">Kids profile</span>
                  )}
                </div>
              </div>

              {/* Linked members */}
              <div className="mb-3">
                <div className="text-[9px] text-white/25 uppercase tracking-wider font-semibold mb-1.5">
                  Linked Members
                </div>
                <div className="flex flex-wrap gap-1">
                  {group.members.map((member, mi) => (
                    <span
                      key={member.id ?? `${member.type}-${mi}`}
                      className={`
                        inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium
                        ${member.type === 'child'
                          ? 'bg-teal-400/15 text-teal-300'
                          : member.type === 'shared'
                            ? 'bg-purple-400/15 text-purple-300'
                            : 'bg-blue-400/15 text-blue-300'}
                      `}
                    >
                      {member.name}
                      {member.type === 'child' && member.age !== undefined && (
                        <span className="text-white/40">(age {member.age})</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>

              {/* No children → compact green card, no override */}
              {!group.hasChildren ? (
                <div className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-emerald-400/8 border border-emerald-400/10">
                  <svg className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-[11px] text-emerald-300 font-medium">No changes needed</span>
                </div>
              ) : needsChange ? (
                <>
                  {/* Current vs Suggested — change needed */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex-1 text-center">
                      <div className="text-[9px] text-white/30 uppercase tracking-wider mb-1">Current</div>
                      <div className="text-[11px] font-medium px-2 py-1.5 rounded-md bg-amber-400/10 text-amber-300">
                        {maturityLabel(current)}
                        <div className="text-[9px] mt-0.5 text-amber-300/50">
                          {maturityRatings(current)}
                        </div>
                      </div>
                    </div>

                    <svg className="w-4 h-4 text-white/20 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>

                    <div className="flex-1 text-center">
                      <div className="text-[9px] text-white/30 uppercase tracking-wider mb-1">Suggested</div>
                      <div className="text-[11px] font-medium px-2 py-1.5 rounded-md bg-teal-400/10 text-teal-300">
                        {maturityLabel(suggested)}
                        <div className="text-[9px] mt-0.5 text-teal-300/50">
                          {maturityRatings(suggested)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Explanation */}
                  {group.youngestChild && (
                    <p className="text-[10px] text-white/30 mb-2.5">
                      Based on {group.youngestChild.name}
                      {group.youngestChild.age !== undefined && ` (age ${group.youngestChild.age})`}
                    </p>
                  )}

                  {/* Override dropdown */}
                  <select
                    value={suggested}
                    onChange={(e) =>
                      setOverrides((prev) => ({
                        ...prev,
                        [group.guid]: e.target.value as NetflixMaturityLevel,
                      }))
                    }
                    className="w-full h-7 rounded-md bg-white/[0.06] border border-white/[0.08] text-[10px] text-white/70 px-2 appearance-none cursor-pointer hover:border-white/[0.15] transition-colors"
                  >
                    {MATURITY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value} className="bg-[#1a1a2e]">
                        {opt.label} ({opt.ratings}) — {opt.description}
                      </option>
                    ))}
                  </select>
                </>
              ) : (
                <>
                  {/* Current matches suggested — green compact + override */}
                  <div className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-emerald-400/8 border border-emerald-400/10 mb-2.5">
                    <svg className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-[11px] text-emerald-300 font-medium">
                      No changes needed — {maturityLabel(current)} ({maturityRatings(current)})
                    </span>
                  </div>

                  {/* Override dropdown (in case they want to change it) */}
                  <select
                    value={suggested}
                    onChange={(e) =>
                      setOverrides((prev) => ({
                        ...prev,
                        [group.guid]: e.target.value as NetflixMaturityLevel,
                      }))
                    }
                    className="w-full h-7 rounded-md bg-white/[0.06] border border-white/[0.08] text-[10px] text-white/70 px-2 appearance-none cursor-pointer hover:border-white/[0.15] transition-colors"
                  >
                    {MATURITY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value} className="bg-[#1a1a2e]">
                        {opt.label} ({opt.ratings}) — {opt.description}
                      </option>
                    ))}
                  </select>
                </>
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={handleConfirm}
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
