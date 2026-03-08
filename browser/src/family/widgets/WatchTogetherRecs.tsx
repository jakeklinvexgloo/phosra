/**
 * WatchTogetherRecs — recommends titles the whole family can watch together.
 *
 * Algorithm: finds the youngest child's age, then surfaces titles from all
 * children's watch history that are age-appropriate for that youngest child
 * and have >= 3 quality stars. Deduplicates, sorts by quality then total
 * episodes, and renders a horizontal Netflix-style scrollable row.
 */

import React, { useState } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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

interface Props {
  insights: ChildInsight[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CHILD_COLORS = ['#2dd4bf', '#60a5fa', '#f472b6', '#a78bfa', '#fbbf24', '#34d399', '#f87171', '#818cf8'];
const MAX_CARDS = 10;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function renderStars(count: number): string {
  return '\u2605'.repeat(count) + '\u2606'.repeat(5 - count);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const WatchTogetherRecs: React.FC<Props> = ({ insights }) => {
  const [scrollRef] = useState<{ current: HTMLDivElement | null }>({ current: null });

  // Find youngest child's age
  const youngestAge = Math.min(...insights.map((i) => i.age));

  // Build child color map
  const childColorMap = new Map<string, { name: string; color: string }>();
  insights.forEach((ins, idx) => {
    childColorMap.set(ins.child.id, {
      name: ins.child.name,
      color: CHILD_COLORS[idx % CHILD_COLORS.length],
    });
  });

  // Aggregate titles across all children
  const titleMap = new Map<
    string,
    {
      title: string;
      displayTitle: string;
      stars: number;
      ageMin: number;
      totalEpisodes: number;
      isFamilyFriendly: boolean;
      watchedBy: Set<string>;
    }
  >();

  for (const insight of insights) {
    for (const t of insight.titleWatchCounts) {
      if (t.ageMin === null || t.ageMin > youngestAge || t.stars < 3) continue;

      const key = t.title.toLowerCase();
      const existing = titleMap.get(key);
      if (existing) {
        existing.totalEpisodes += t.episodes;
        existing.watchedBy.add(insight.child.id);
        // Keep the higher star rating if there's a discrepancy
        if (t.stars > existing.stars) existing.stars = t.stars;
      } else {
        titleMap.set(key, {
          title: t.title,
          displayTitle: t.displayTitle,
          stars: t.stars,
          ageMin: t.ageMin,
          totalEpisodes: t.episodes,
          isFamilyFriendly: t.isFamilyFriendly,
          watchedBy: new Set([insight.child.id]),
        });
      }
    }
  }

  // Sort by stars desc, then episodes desc
  const recommendations = Array.from(titleMap.values())
    .sort((a, b) => b.stars - a.stars || b.totalEpisodes - a.totalEpisodes)
    .slice(0, MAX_CARDS);

  // Empty state
  if (recommendations.length === 0) {
    return (
      <div
        style={{
          background: 'var(--chrome-surface)',
          border: '1px solid var(--chrome-border)',
          borderRadius: 12,
          padding: '32px 24px',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 32, marginBottom: 8 }}>&#x1F4FA;</div>
        <p style={{ color: 'var(--chrome-text)', fontSize: 15, fontWeight: 600, margin: '0 0 4px' }}>
          No shared-age titles found yet
        </p>
        <p style={{ color: 'var(--chrome-text-secondary)', fontSize: 13, margin: 0 }}>
          As your kids watch more content, recommendations for family movie night will appear here.
        </p>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: 4 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 18 }}>&#x1F3AC;</span>
        <h3 style={{ color: 'var(--chrome-text)', fontSize: 15, fontWeight: 600, margin: 0 }}>
          Watch Together
        </h3>
        <span
          style={{
            color: 'var(--chrome-text-secondary)',
            fontSize: 12,
            marginLeft: 4,
          }}
        >
          Age-appropriate for everyone (age {youngestAge}+)
        </span>
      </div>

      {/* Scrollable row */}
      <div
        ref={(el) => { scrollRef.current = el; }}
        style={{
          display: 'flex',
          gap: 12,
          overflowX: 'auto',
          paddingBottom: 8,
          scrollbarWidth: 'thin',
          scrollbarColor: 'var(--chrome-border) transparent',
        }}
      >
        {recommendations.map((rec) => (
          <div
            key={rec.title}
            style={{
              flex: '0 0 180px',
              background: 'var(--chrome-surface)',
              border: '1px solid var(--chrome-border)',
              borderRadius: 10,
              padding: 14,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              transition: 'border-color 0.15s',
              cursor: 'default',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--chrome-accent)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--chrome-border)';
            }}
          >
            {/* Title */}
            <p
              style={{
                color: 'var(--chrome-text)',
                fontSize: 13,
                fontWeight: 600,
                margin: 0,
                lineHeight: 1.3,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
              title={rec.displayTitle}
            >
              {rec.displayTitle}
            </p>

            {/* Star rating + age badge */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: '#fbbf24', fontSize: 12, letterSpacing: 1 }}>
                {renderStars(rec.stars)}
              </span>
              <span
                style={{
                  background: rec.ageMin <= 7 ? '#065f4620' : '#78350f20',
                  color: rec.ageMin <= 7 ? '#2dd4bf' : '#fbbf24',
                  fontSize: 10,
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: 4,
                }}
              >
                {rec.ageMin}+
              </span>
            </div>

            {/* Episodes count */}
            <span style={{ color: 'var(--chrome-text-secondary)', fontSize: 11 }}>
              {rec.totalEpisodes} episode{rec.totalEpisodes !== 1 ? 's' : ''} watched
            </span>

            {/* Child avatars who watched */}
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 'auto' }}>
              {Array.from(rec.watchedBy).map((childId) => {
                const child = childColorMap.get(childId);
                if (!child) return null;
                return (
                  <div
                    key={childId}
                    title={child.name}
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      background: child.color + '25',
                      border: `1.5px solid ${child.color}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 9,
                      fontWeight: 700,
                      color: child.color,
                    }}
                  >
                    {getInitials(child.name)}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WatchTogetherRecs;
