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

interface SiblingPair {
  childA: ChildInsight;
  childB: ChildInsight;
  colorA: string;
  colorB: string;
  overlapCount: number;
  overlapPct: number;
  sharedTitles: string[];
}

function computePairs(insights: ChildInsight[]): SiblingPair[] {
  const pairs: SiblingPair[] = [];

  for (let i = 0; i < insights.length; i++) {
    for (let j = i + 1; j < insights.length; j++) {
      const a = insights[i];
      const b = insights[j];
      const titlesA = new Set(a.titleWatchCounts?.map((t) => t.title) ?? []);
      const titlesB = new Set(b.titleWatchCounts?.map((t) => t.title) ?? []);

      const shared: string[] = [];
      for (const t of titlesA) {
        if (titlesB.has(t)) shared.push(t);
      }

      // Sort shared by combined episodes descending
      const aCounts = new Map(a.titleWatchCounts?.map((t) => [t.title, t.episodes]) ?? []);
      const bCounts = new Map(b.titleWatchCounts?.map((t) => [t.title, t.episodes]) ?? []);
      shared.sort((x, y) => {
        const sumX = (aCounts.get(x) ?? 0) + (bCounts.get(x) ?? 0);
        const sumY = (aCounts.get(y) ?? 0) + (bCounts.get(y) ?? 0);
        return sumY - sumX;
      });

      const minUnique = Math.min(a.uniqueTitles || 1, b.uniqueTitles || 1);
      const overlapPct = minUnique > 0 ? (shared.length / minUnique) * 100 : 0;

      pairs.push({
        childA: a,
        childB: b,
        colorA: CHILD_COLORS[i % CHILD_COLORS.length],
        colorB: CHILD_COLORS[j % CHILD_COLORS.length],
        overlapCount: shared.length,
        overlapPct,
        sharedTitles: shared.slice(0, 5),
      });
    }
  }

  pairs.sort((a, b) => b.overlapPct - a.overlapPct);
  return pairs;
}

function displayTitle(title: string, insights: ChildInsight[]): string {
  for (const ins of insights) {
    const found = ins.titleWatchCounts?.find((t) => t.title === title);
    if (found) return found.displayTitle || title;
  }
  return title;
}

interface VennProps {
  colorA: string;
  colorB: string;
  overlapPct: number;
}

function VennDiagram({ colorA, colorB, overlapPct }: VennProps) {
  // Overlap controls how close the circles are. 0% = far apart, 100% = fully overlapping
  const clampedPct = Math.min(Math.max(overlapPct, 0), 100);
  // At 0% overlap: offset = 30 (circles just touching)
  // At 100% overlap: offset = 0 (circles fully on top of each other)
  const offset = 30 - (clampedPct / 100) * 25;

  return (
    <div className="relative flex items-center justify-center" style={{ width: 72, height: 48 }}>
      <div
        className="absolute rounded-full"
        style={{
          width: 36,
          height: 36,
          backgroundColor: colorA,
          opacity: 0.35,
          left: `calc(50% - 18px - ${offset / 2}px)`,
          top: 6,
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          width: 36,
          height: 36,
          backgroundColor: colorB,
          opacity: 0.35,
          left: `calc(50% - 18px + ${offset / 2}px)`,
          top: 6,
        }}
      />
      <span
        className="relative text-xs font-bold z-10"
        style={{ color: 'var(--chrome-text)' }}
      >
        {Math.round(clampedPct)}%
      </span>
    </div>
  );
}

interface SiblingOverlapProps {
  insights: ChildInsight[];
}

export default function SiblingOverlap({ insights }: SiblingOverlapProps) {
  const pairs = useMemo(() => computePairs(insights ?? []), [insights]);

  if (!insights || insights.length < 2) {
    return (
      <div
        className="rounded-xl p-5"
        style={{ backgroundColor: 'var(--chrome-surface)', border: '1px solid var(--chrome-border)' }}
      >
        <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--chrome-text)' }}>
          Sibling Overlap
        </h3>
        <div className="flex flex-col items-center justify-center py-6 gap-2">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
            style={{ backgroundColor: 'var(--chrome-hover)', color: 'var(--chrome-text-secondary)' }}
          >
            +
          </div>
          <p className="text-xs text-center" style={{ color: 'var(--chrome-text-secondary)' }}>
            Add another child to see sibling content overlap
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl p-5"
      style={{ backgroundColor: 'var(--chrome-surface)', border: '1px solid var(--chrome-border)' }}
    >
      <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--chrome-text)' }}>
        Sibling Overlap
      </h3>

      <div className="grid gap-3" style={{ gridTemplateColumns: pairs.length > 2 ? 'repeat(2, 1fr)' : '1fr' }}>
        {pairs.map((pair) => (
          <div
            key={`${pair.childA.child.id}-${pair.childB.child.id}`}
            className="rounded-lg p-3"
            style={{ backgroundColor: 'var(--chrome-bg)', border: '1px solid var(--chrome-border)' }}
          >
            {/* Header: names */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: pair.colorA }}
                />
                <span className="text-xs font-medium" style={{ color: 'var(--chrome-text)' }}>
                  {pair.childA.child.name}
                </span>
              </div>
              <span className="text-[10px]" style={{ color: 'var(--chrome-text-secondary)' }}>
                &amp;
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium" style={{ color: 'var(--chrome-text)' }}>
                  {pair.childB.child.name}
                </span>
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: pair.colorB }}
                />
              </div>
            </div>

            {/* Venn diagram */}
            <div className="flex justify-center mb-2">
              <VennDiagram colorA={pair.colorA} colorB={pair.colorB} overlapPct={pair.overlapPct} />
            </div>

            {/* Stats */}
            <p className="text-[11px] text-center mb-2" style={{ color: 'var(--chrome-text-secondary)' }}>
              {pair.overlapCount} shared title{pair.overlapCount !== 1 ? 's' : ''}
            </p>

            {/* Top shared titles */}
            {pair.sharedTitles.length > 0 && (
              <div className="space-y-0.5">
                {pair.sharedTitles.slice(0, 3).map((title) => (
                  <div
                    key={title}
                    className="text-[10px] truncate px-1.5 py-0.5 rounded"
                    style={{
                      color: 'var(--chrome-text-secondary)',
                      backgroundColor: 'var(--chrome-surface)',
                    }}
                  >
                    {displayTitle(title, insights)}
                  </div>
                ))}
              </div>
            )}

            {pair.sharedTitles.length === 0 && (
              <p className="text-[10px] text-center" style={{ color: 'var(--chrome-text-secondary)' }}>
                No shared titles yet
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
