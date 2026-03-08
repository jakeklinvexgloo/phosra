import React, { useMemo, useState } from 'react';

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

interface SpilloverAlert {
  youngerChild: string;
  youngerAge: number;
  olderChild: string;
  title: string;
  displayTitle: string;
  ageMin: number;
  severity: 'high' | 'medium';
}

const INITIAL_VISIBLE = 3;

export function SpilloverDetector({ insights }: { insights: ChildInsight[] }) {
  const [expanded, setExpanded] = useState(false);

  const alerts = useMemo<SpilloverAlert[]>(() => {
    if (insights.length < 2) return [];

    // Sort children by age ascending (youngest first)
    const sorted = [...insights].sort((a, b) => a.age - b.age);

    const result: SpilloverAlert[] = [];

    for (let yi = 0; yi < sorted.length - 1; yi++) {
      const younger = sorted[yi];
      // Build a set of titles the younger child watched
      const youngerTitles = new Map<string, { displayTitle: string; ageMin: number | null }>();
      for (const t of younger.titleWatchCounts) {
        youngerTitles.set(t.title, { displayTitle: t.displayTitle, ageMin: t.ageMin });
      }

      for (let oi = yi + 1; oi < sorted.length; oi++) {
        const older = sorted[oi];
        // Build set of titles the older child watched
        const olderTitleSet = new Set(older.titleWatchCounts.map((t) => t.title));

        for (const [title, meta] of youngerTitles) {
          // Title must also appear in the older sibling's watch list
          if (!olderTitleSet.has(title)) continue;
          // Title must be above the younger child's age
          if (meta.ageMin == null || meta.ageMin <= younger.age) continue;

          const severity: 'high' | 'medium' = meta.ageMin > younger.age + 4 ? 'high' : 'medium';

          result.push({
            youngerChild: younger.child.name,
            youngerAge: younger.age,
            olderChild: older.child.name,
            title,
            displayTitle: meta.displayTitle,
            ageMin: meta.ageMin,
            severity,
          });
        }
      }
    }

    // Sort high severity first, then by age gap descending
    result.sort((a, b) => {
      if (a.severity !== b.severity) return a.severity === 'high' ? -1 : 1;
      return (b.ageMin - b.youngerAge) - (a.ageMin - a.youngerAge);
    });

    return result;
  }, [insights]);

  const visibleAlerts = expanded ? alerts : alerts.slice(0, INITIAL_VISIBLE);
  const hiddenCount = alerts.length - INITIAL_VISIBLE;

  // Child color lookup
  const sortedChildren = [...insights].sort((a, b) => a.age - b.age);
  const childColorMap = new Map<string, string>();
  sortedChildren.forEach((ins, i) => {
    childColorMap.set(ins.child.name, CHILD_COLORS[i % CHILD_COLORS.length]);
  });

  return (
    <div
      className="rounded-xl p-5"
      style={{
        backgroundColor: 'var(--chrome-surface)',
        border: '1px solid var(--chrome-border)',
      }}
    >
      <h3
        className="text-sm font-semibold mb-4"
        style={{ color: 'var(--chrome-text)' }}
      >
        Spillover Detector
      </h3>

      {alerts.length === 0 ? (
        <div
          className="rounded-lg px-4 py-3 flex items-center gap-3"
          style={{
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            borderLeft: '3px solid #10b981',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.7-10.3a.75.75 0 00-1.06-1.06L9 10.28 7.36 8.64a.75.75 0 10-1.06 1.06l2.25 2.25a.75.75 0 001.06 0l4.09-4.25z"
              fill="#10b981"
            />
          </svg>
          <div>
            <p className="text-sm font-medium" style={{ color: '#10b981' }}>
              All Clear
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--chrome-text-secondary)' }}>
              No cross-profile content spillover detected between siblings.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {visibleAlerts.map((alert, i) => {
            const borderColor = alert.severity === 'high' ? '#ef4444' : '#f59e0b';
            const badgeBg = alert.severity === 'high' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)';
            const badgeText = alert.severity === 'high' ? '#ef4444' : '#f59e0b';
            const youngerColor = childColorMap.get(alert.youngerChild) || 'var(--chrome-text)';
            const olderColor = childColorMap.get(alert.olderChild) || 'var(--chrome-text-secondary)';

            return (
              <div
                key={`${alert.youngerChild}-${alert.title}-${i}`}
                className="rounded-lg px-4 py-3"
                style={{
                  backgroundColor: 'var(--chrome-bg)',
                  borderLeft: `3px solid ${borderColor}`,
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--chrome-text)' }}>
                      {alert.displayTitle}
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'var(--chrome-text-secondary)' }}>
                      <span style={{ color: youngerColor, fontWeight: 600 }}>{alert.youngerChild}</span>
                      {' '}(age {alert.youngerAge}) likely watched from{' '}
                      <span style={{ color: olderColor, fontWeight: 600 }}>{alert.olderChild}</span>'s profile
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--chrome-text-secondary)' }}>
                      Rated {alert.ageMin}+ &middot; {alert.ageMin - alert.youngerAge} years above age
                    </p>
                  </div>
                  <span
                    className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full shrink-0 mt-0.5"
                    style={{ backgroundColor: badgeBg, color: badgeText }}
                  >
                    {alert.severity}
                  </span>
                </div>
              </div>
            );
          })}

          {hiddenCount > 0 && !expanded && (
            <button
              onClick={() => setExpanded(true)}
              className="text-xs font-medium py-2 rounded-lg transition-colors"
              style={{
                color: 'var(--chrome-accent)',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.color = 'var(--chrome-accent-hover)';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.color = 'var(--chrome-accent)';
              }}
            >
              Show {hiddenCount} more alert{hiddenCount !== 1 ? 's' : ''}
            </button>
          )}

          {expanded && alerts.length > INITIAL_VISIBLE && (
            <button
              onClick={() => setExpanded(false)}
              className="text-xs font-medium py-2 rounded-lg transition-colors"
              style={{
                color: 'var(--chrome-accent)',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.color = 'var(--chrome-accent-hover)';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.color = 'var(--chrome-accent)';
              }}
            >
              Show less
            </button>
          )}
        </div>
      )}
    </div>
  );
}
