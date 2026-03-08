import React, { useState, useMemo } from 'react';

interface ChildInsight {
  child: { id: string; name: string; birth_date: string };
  age: number;
  totalEntries: number;
  uniqueTitles: number;
  matched: number;
  aboveAge: { title: string; ageMin: number; stars: number; episodes: number; ageExplanation: string; parentSummary: string; descriptors: { category: string; level: string; numericLevel: number }[] }[];
  ageBreakdown: { ageMin: number; uniqueTitles: number; episodes: number }[];
  highQuality: number;
  familyFriendly: number;
  topDescriptors: { category: string; count: number }[];
  descriptorAverages: { category: string; avgLevel: number; titleCount: number }[];
  positiveContentSummary: { category: string; count: number }[];
  titleWatchCounts: { title: string; displayTitle: string; episodes: number; ageMin: number | null; stars: number; isFamilyFriendly: boolean }[];
}

const CHILD_COLORS = ['#2dd4bf', '#60a5fa', '#f472b6', '#a78bfa', '#fbbf24', '#34d399', '#f87171', '#818cf8'];

interface PositiveTitle {
  title: string;
  displayTitle: string;
  stars: number;
  episodes: number;
  positiveCategories: string[];
  childNames: string[];
  childIds: string[];
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getChildColor(childId: string, allIds: string[]): string {
  const idx = allIds.indexOf(childId);
  return CHILD_COLORS[idx % CHILD_COLORS.length];
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill={filled ? '#fbbf24' : 'none'}
      stroke={filled ? '#fbbf24' : 'var(--chrome-border)'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function StarRating({ stars }: { stars: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <StarIcon key={i} filled={i <= stars} />
      ))}
    </div>
  );
}

function TrophyIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#fbbf24"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  );
}

export default function PositiveHighlights({ insights }: { insights: ChildInsight[] }) {
  const allChildIds = useMemo(() => insights.map((i) => i.child.id), [insights]);

  const wins = useMemo(() => {
    // Build a map of positive categories per child
    const childPositiveCategories = new Map<string, Map<string, Set<string>>>();
    for (const insight of insights) {
      for (const cat of insight.positiveContentSummary) {
        // We don't have per-title positive category mapping directly,
        // but we track which categories appear for the child
        if (!childPositiveCategories.has(insight.child.id)) {
          childPositiveCategories.set(insight.child.id, new Map());
        }
      }
    }

    // Collect qualifying titles across all children
    const titleMap = new Map<string, PositiveTitle>();

    for (const insight of insights) {
      const positiveCategories = insight.positiveContentSummary.map((p) => p.category);

      for (const tw of insight.titleWatchCounts) {
        const qualifies =
          tw.isFamilyFriendly ||
          positiveCategories.length > 0 ||
          tw.stars >= 4;

        if (!qualifies) continue;

        const key = tw.title.toLowerCase();
        if (titleMap.has(key)) {
          const existing = titleMap.get(key)!;
          if (!existing.childIds.includes(insight.child.id)) {
            existing.childNames.push(insight.child.name);
            existing.childIds.push(insight.child.id);
          }
          existing.episodes += tw.episodes;
          if (tw.stars > existing.stars) existing.stars = tw.stars;
        } else {
          titleMap.set(key, {
            title: tw.title,
            displayTitle: tw.displayTitle || tw.title,
            stars: tw.stars,
            episodes: tw.episodes,
            positiveCategories: positiveCategories.length > 0 ? positiveCategories : (tw.isFamilyFriendly ? ['Family Friendly'] : []),
            childNames: [insight.child.name],
            childIds: [insight.child.id],
          });
        }
      }
    }

    // Sort by: stars desc, then episodes desc, then number of children watching
    const sorted = Array.from(titleMap.values()).sort((a, b) => {
      if (b.stars !== a.stars) return b.stars - a.stars;
      if (b.childIds.length !== a.childIds.length) return b.childIds.length - a.childIds.length;
      return b.episodes - a.episodes;
    });

    return sorted.slice(0, 5);
  }, [insights]);

  if (wins.length === 0) {
    return (
      <div
        className="rounded-xl p-5"
        style={{
          backgroundColor: 'var(--chrome-surface)',
          border: '1px solid var(--chrome-border)',
        }}
      >
        <div className="flex items-center gap-2 mb-4">
          <TrophyIcon />
          <h3 className="text-sm font-semibold" style={{ color: 'var(--chrome-text)' }}>
            Weekly Wins
          </h3>
        </div>
        <div
          className="text-center py-8 text-sm"
          style={{ color: 'var(--chrome-text-secondary)' }}
        >
          <p className="mb-1">Keep exploring!</p>
          <p>Look for family-friendly titles.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl p-5"
      style={{
        backgroundColor: 'var(--chrome-surface)',
        border: '1px solid var(--chrome-border)',
      }}
    >
      <div className="flex items-center gap-2 mb-4">
        <TrophyIcon />
        <h3 className="text-sm font-semibold" style={{ color: 'var(--chrome-text)' }}>
          Weekly Wins
        </h3>
        <span
          className="ml-auto text-xs"
          style={{ color: 'var(--chrome-text-secondary)' }}
        >
          {wins.length} positive title{wins.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {wins.map((win) => (
          <div
            key={win.title}
            className="rounded-lg p-3 transition-colors"
            style={{
              backgroundColor: 'rgba(16, 185, 129, 0.06)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              boxShadow: '0 0 12px rgba(16, 185, 129, 0.05)',
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm font-medium truncate"
                  style={{ color: 'var(--chrome-text)' }}
                  title={win.displayTitle}
                >
                  {win.displayTitle}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <StarRating stars={win.stars} />
                  <span
                    className="text-xs"
                    style={{ color: 'var(--chrome-text-secondary)' }}
                  >
                    {win.episodes} ep{win.episodes !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              {/* Child initials */}
              <div className="flex items-center gap-1 shrink-0">
                {win.childIds.map((childId, idx) => (
                  <div
                    key={childId}
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                    style={{
                      backgroundColor: getChildColor(childId, allChildIds) + '22',
                      color: getChildColor(childId, allChildIds),
                      border: `1px solid ${getChildColor(childId, allChildIds)}44`,
                    }}
                    title={win.childNames[idx]}
                  >
                    {getInitials(win.childNames[idx])}
                  </div>
                ))}
              </div>
            </div>

            {/* Positive category tags */}
            {win.positiveCategories.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {win.positiveCategories.slice(0, 4).map((cat) => (
                  <span
                    key={cat}
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium"
                    style={{
                      backgroundColor: 'rgba(16, 185, 129, 0.15)',
                      color: '#34d399',
                    }}
                  >
                    {cat}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
