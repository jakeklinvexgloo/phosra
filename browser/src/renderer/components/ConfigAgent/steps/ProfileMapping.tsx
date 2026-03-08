/**
 * Step 2: Profile-to-Family Mapping — lets the parent map each Netflix
 * profile to one or more family members (child, adult, shared, or unassigned).
 *
 * Uses a custom multi-select dropdown with pills, on-brand with the dark
 * Phosra Browser theme.
 */

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import type { NetflixProfile, ProfileMapping as ProfileMappingType } from '../../../hooks/useConfigAgent';
import type { Child, FamilyMember } from '../../../lib/ipc';

interface Props {
  profiles: NetflixProfile[];
  children: Child[];
  members: FamilyMember[];
  savedMappings?: ProfileMappingType[];
  onConfirm: (mappings: ProfileMappingType[]) => void;
}

function calculateAge(birthDate: string): number {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--;
  return Math.max(0, age);
}

/** Simple fuzzy name match — checks if names share 3+ characters. */
function fuzzyMatch(a: string, b: string): boolean {
  const la = a.toLowerCase().trim();
  const lb = b.toLowerCase().trim();
  if (la === lb) return true;
  if (la.includes(lb) || lb.includes(la)) return true;
  if (la.length >= 3 && lb.length >= 3 && la.slice(0, 3) === lb.slice(0, 3)) return true;
  return false;
}

// ── Option types for the multi-select ─────────────────────────────────────────

interface SelectOption {
  id: string;
  label: string;
  sublabel?: string;
  group: 'special' | 'children' | 'adults';
  type: 'shared' | 'child' | 'adult';
  data?: Child | FamilyMember;
}

// ── Multi-select dropdown ─────────────────────────────────────────────────────

function MultiSelectDropdown({
  options,
  selected,
  onChange,
}: {
  options: SelectOption[];
  selected: string[];
  onChange: (ids: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(0);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number; width: number; flipUp: boolean } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Close on outside click or scroll
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node) &&
          listRef.current && !listRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleScroll = () => setOpen(false);
    document.addEventListener('mousedown', handleClick);
    // Close on scroll of the drawer's scrollable area
    const scrollParent = containerRef.current?.closest('.overflow-y-auto');
    scrollParent?.addEventListener('scroll', handleScroll);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      scrollParent?.removeEventListener('scroll', handleScroll);
    };
  }, [open]);

  // Position the dropdown using fixed coords so it escapes overflow containers
  useEffect(() => {
    if (!open || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const flipUp = spaceBelow < 240;
    setDropdownPos({
      top: flipUp ? rect.top : rect.bottom + 4,
      left: rect.left,
      width: rect.width,
      flipUp,
    });
  }, [open]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (!open || !listRef.current) return;
    const items = listRef.current.querySelectorAll('[data-option]');
    (items[highlightIdx] as HTMLElement | undefined)?.scrollIntoView({ block: 'nearest' });
  }, [highlightIdx, open]);

  const toggleOption = useCallback(
    (id: string) => {
      // "shared" is exclusive — selecting it clears everything else
      if (id === 'shared') {
        onChange(selected.includes('shared') ? [] : ['shared']);
        return;
      }
      // Selecting a person removes "shared"
      const withoutShared = selected.filter((s) => s !== 'shared');
      if (withoutShared.includes(id)) {
        onChange(withoutShared.filter((s) => s !== id));
      } else {
        onChange([...withoutShared, id]);
      }
    },
    [selected, onChange],
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setOpen(true);
        setHighlightIdx(0);
      }
      return;
    }
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightIdx((i) => Math.min(i + 1, options.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightIdx((i) => Math.max(i - 1, 0));
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (options[highlightIdx]) toggleOption(options[highlightIdx].id);
        break;
      case 'Escape':
        e.preventDefault();
        setOpen(false);
        break;
    }
  };

  const selectedOptions = options.filter((o) => selected.includes(o.id));
  const isUnassigned = selected.length === 0;

  // Group options for rendering
  const groups: { label: string; items: SelectOption[] }[] = [];
  const specials = options.filter((o) => o.group === 'special');
  const childrenOpts = options.filter((o) => o.group === 'children');
  const adultsOpts = options.filter((o) => o.group === 'adults');
  if (specials.length) groups.push({ label: '', items: specials });
  if (childrenOpts.length) groups.push({ label: 'Children', items: childrenOpts });
  if (adultsOpts.length) groups.push({ label: 'Adults', items: adultsOpts });

  // Flat index for keyboard navigation
  let flatIdx = 0;

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(!open)}
        onKeyDown={handleKeyDown}
        className={`
          w-full min-h-[34px] rounded-lg border px-2.5 py-1.5
          flex items-center flex-wrap gap-1
          text-left text-[11px] cursor-pointer
          transition-all duration-150
          ${open
            ? 'border-teal-400/40 bg-white/[0.08] ring-1 ring-teal-400/20'
            : 'border-white/[0.08] bg-white/[0.04] hover:border-white/[0.15] hover:bg-white/[0.06]'}
        `}
      >
        {isUnassigned ? (
          <span className="text-white/30 py-0.5">Unassigned</span>
        ) : (
          selectedOptions.map((opt) => (
            <span
              key={opt.id}
              className={`
                inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium
                ${opt.type === 'child'
                  ? 'bg-teal-400/15 text-teal-300'
                  : opt.type === 'shared'
                    ? 'bg-purple-400/15 text-purple-300'
                    : 'bg-blue-400/15 text-blue-300'}
              `}
            >
              {opt.label}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleOption(opt.id);
                }}
                className="ml-0.5 hover:text-white transition-colors"
              >
                <svg className="w-2.5 h-2.5" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M2.5 2.5l5 5M7.5 2.5l-5 5" />
                </svg>
              </button>
            </span>
          ))
        )}
        {/* Chevron */}
        <svg
          className={`w-3 h-3 ml-auto flex-shrink-0 text-white/30 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {/* Dropdown — fixed position to escape overflow containers */}
      {open && dropdownPos && ReactDOM.createPortal(
        <div
          ref={listRef}
          data-portal
          data-dropdown-portal
          className="fixed z-[9999] rounded-lg border border-white/[0.1] bg-[#1a1a2e]/95 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden animate-fade-in"
          style={{
            maxHeight: 220,
            overflowY: 'auto',
            width: dropdownPos.width,
            left: dropdownPos.left,
            ...(dropdownPos.flipUp
              ? { bottom: window.innerHeight - dropdownPos.top + 4 }
              : { top: dropdownPos.top }),
          }}
        >
          {groups.map((group) => (
            <React.Fragment key={group.label || 'special'}>
              {group.label && (
                <div className="px-3 pt-2 pb-1 text-[9px] font-semibold text-white/25 uppercase tracking-wider">
                  {group.label}
                </div>
              )}
              {group.items.map((opt) => {
                const idx = flatIdx++;
                const isSelected = selected.includes(opt.id);
                const isHighlighted = highlightIdx === idx;
                return (
                  <button
                    key={opt.id}
                    data-option
                    type="button"
                    onClick={() => toggleOption(opt.id)}
                    onMouseEnter={() => setHighlightIdx(idx)}
                    className={`
                      w-full flex items-center gap-2 px-3 py-2 text-left text-[11px]
                      transition-colors duration-75
                      ${isHighlighted ? 'bg-white/[0.08]' : 'hover:bg-white/[0.05]'}
                    `}
                  >
                    {/* Checkbox */}
                    <div
                      className={`
                        w-3.5 h-3.5 rounded flex-shrink-0 border flex items-center justify-center transition-all
                        ${isSelected
                          ? 'bg-teal-500 border-teal-400'
                          : 'border-white/[0.15] bg-white/[0.04]'}
                      `}
                    >
                      {isSelected && (
                        <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M2.5 6l2.5 2.5 4.5-5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>

                    {/* Avatar dot */}
                    <div
                      className={`
                        w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-[9px] font-semibold
                        ${opt.type === 'child'
                          ? 'bg-teal-400/15 text-teal-300'
                          : opt.type === 'shared'
                            ? 'bg-purple-400/15 text-purple-300'
                            : 'bg-blue-400/15 text-blue-300'}
                      `}
                    >
                      {opt.type === 'shared' ? (
                        <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v1h8v-1zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-1a5.97 5.97 0 00-.75-2.906A3.005 3.005 0 0119 17v1h-3zM4.75 14.094A5.97 5.97 0 004 17v1H1v-1a3 3 0 013.75-2.906z" />
                        </svg>
                      ) : (
                        opt.label.charAt(0)
                      )}
                    </div>

                    {/* Label */}
                    <div className="min-w-0 flex-1">
                      <div className={`text-[11px] ${isSelected ? 'text-white' : 'text-white/70'}`}>
                        {opt.label}
                      </div>
                      {opt.sublabel && (
                        <div className="text-[9px] text-white/30">{opt.sublabel}</div>
                      )}
                    </div>
                  </button>
                );
              })}
            </React.Fragment>
          ))}
        </div>,
        document.body,
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function ProfileMapping({ profiles, children, members, savedMappings, onConfirm }: Props) {
  // Build options list
  const options = useMemo((): SelectOption[] => {
    const opts: SelectOption[] = [
      { id: 'shared', label: 'Shared Profile', group: 'special', type: 'shared' },
    ];
    for (const c of children) {
      opts.push({
        id: c.id,
        label: c.name,
        sublabel: `Age ${calculateAge(c.birth_date)}`,
        group: 'children',
        type: 'child',
        data: c,
      });
    }
    for (const m of members) {
      opts.push({
        id: m.id,
        label: m.display_name || m.name || m.email || 'Member',
        group: 'adults',
        type: 'adult',
        data: m,
      });
    }
    return opts;
  }, [children, members]);

  // Initialise from saved mappings if available, otherwise fuzzy-match
  const initialSelections = useMemo(() => {
    const result: Record<string, string[]> = {};

    // If we have saved mappings, use them
    if (savedMappings && savedMappings.length > 0) {
      for (const profile of profiles) {
        const saved = savedMappings.find((m) => m.netflixProfile.guid === profile.guid);
        if (saved?.familyMemberId) {
          result[profile.guid] = [saved.familyMemberId];
        } else if (saved?.familyMemberType === 'shared') {
          result[profile.guid] = ['shared'];
        } else {
          result[profile.guid] = [];
        }
      }
      return result;
    }

    // Fallback: fuzzy-match suggestions
    const used = new Set<string>();
    for (const profile of profiles) {
      const matchedChild = children.find(
        (c) => !used.has(c.id) && fuzzyMatch(profile.name, c.name),
      );
      if (matchedChild) {
        used.add(matchedChild.id);
        result[profile.guid] = [matchedChild.id];
        continue;
      }
      const matchedMember = members.find(
        (m) => !used.has(m.id) && fuzzyMatch(profile.name, m.display_name || m.name || ''),
      );
      if (matchedMember) {
        used.add(matchedMember.id);
        result[profile.guid] = [matchedMember.id];
        continue;
      }
      result[profile.guid] = [];
    }
    return result;
  }, [profiles, children, members, savedMappings]);

  const [selections, setSelections] = useState(initialSelections);

  const handleChange = (profileGuid: string, ids: string[]) => {
    setSelections((prev) => ({ ...prev, [profileGuid]: ids }));
  };

  const handleConfirm = () => {
    const result: ProfileMappingType[] = [];
    for (const profile of profiles) {
      const selected = selections[profile.guid] ?? [];
      if (selected.length === 0) {
        result.push({ netflixProfile: profile, familyMemberType: 'unassigned' });
        continue;
      }
      if (selected.includes('shared')) {
        result.push({ netflixProfile: profile, familyMemberType: 'shared' });
        continue;
      }
      for (const id of selected) {
        const child = children.find((c) => c.id === id);
        if (child) {
          const age = calculateAge(child.birth_date);
          result.push({
            netflixProfile: profile,
            familyMemberId: child.id,
            familyMemberName: child.name,
            familyMemberType: 'child',
            childAge: age,
            childStrictness: 'recommended',
          });
          continue;
        }
        const member = members.find((m) => m.id === id);
        if (member) {
          result.push({
            netflixProfile: profile,
            familyMemberId: member.id,
            familyMemberName: member.display_name || member.name || member.email || '',
            familyMemberType: 'adult',
          });
        }
      }
    }
    onConfirm(result);
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-4">
        <h3 className="text-[14px] font-semibold text-white mb-1">
          Found {profiles.length} Profile{profiles.length !== 1 ? 's' : ''}
        </h3>
        <p className="text-[11px] text-white/40">
          Map each Netflix profile to family members. You can assign multiple people to one profile.
        </p>
      </div>

      <div className="space-y-2.5">
        {profiles.map((profile, i) => (
          <div
            key={profile.guid}
            className="p-3 rounded-xl border border-white/[0.06] bg-white/[0.02] animate-field-enter"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            {/* Netflix profile info */}
            <div className="flex items-center gap-2.5 mb-2.5">
              <div className="w-9 h-9 rounded-lg flex-shrink-0 overflow-hidden bg-[#333] relative">
                <span className="absolute inset-0 flex items-center justify-center text-[14px] font-semibold text-white/60">
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
              <div className="min-w-0 flex-1">
                <div className="text-[12px] font-medium text-white">{profile.name}</div>
                <div className="text-[10px] text-white/35">
                  {profile.isKids ? 'Kids profile' : 'Standard profile'}
                </div>
              </div>
            </div>

            {/* Multi-select dropdown */}
            <MultiSelectDropdown
              options={options}
              selected={selections[profile.guid] ?? []}
              onChange={(ids) => handleChange(profile.guid, ids)}
            />
          </div>
        ))}
      </div>

      {/* Continue button */}
      <button
        onClick={handleConfirm}
        className="w-full mt-4 h-10 rounded-lg text-[12px] font-medium bg-teal-500 hover:bg-teal-400 active:bg-teal-600 text-white shadow-[0_2px_8px_rgba(45,212,191,0.25)] hover:shadow-[0_4px_16px_rgba(45,212,191,0.35)] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-1.5"
      >
        Continue
        <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
}
