import React, { useMemo } from 'react';

interface ChildViewingData {
  childId: string;
  childName: string;
  age: number;
  entries: { title: string; date: string; seriesTitle?: string }[];
}

interface ChildInsight {
  child: { id: string; name: string; birth_date: string };
  age: number;
  totalEntries: number;
  uniqueTitles: number;
  matched: number;
  aboveAge: { title: string; ageMin: number; stars: number; episodes: number }[];
  highQuality: number;
  familyFriendly: number;
  titleWatchCounts: { title: string; displayTitle: string; episodes: number; ageMin: number | null; stars: number; isFamilyFriendly: boolean }[];
}

const CHILD_COLORS = ['#2dd4bf', '#60a5fa', '#f472b6', '#a78bfa', '#fbbf24', '#34d399', '#f87171', '#818cf8'];

function parseNetflixDate(dateStr: string): Date {
  const parts = dateStr.split('/');
  const month = parseInt(parts[0], 10) - 1;
  const day = parseInt(parts[1], 10);
  let year = parseInt(parts[2], 10);
  if (year < 100) year += year < 50 ? 2000 : 1900;
  return new Date(year, month, day);
}

function getChildColor(index: number): string {
  return CHILD_COLORS[index % CHILD_COLORS.length];
}

interface Callout {
  type: 'concern' | 'positive' | 'neutral';
  icon: string;
  text: string;
  childName: string;
  childIndex: number;
}

interface WeeklyDigestProps {
  childData: ChildViewingData[];
  insights: ChildInsight[];
  familyName?: string;
}

export default function WeeklyDigest({ childData, insights, familyName = 'Your Family' }: WeeklyDigestProps) {
  const analysis = useMemo(() => {
    const now = new Date();
    const thisWeekStart = new Date(now);
    thisWeekStart.setDate(now.getDate() - 7);
    thisWeekStart.setHours(0, 0, 0, 0);

    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(thisWeekStart.getDate() - 7);

    const beforeThisWeekStart = new Date(thisWeekStart);
    beforeThisWeekStart.setDate(thisWeekStart.getDate() - 1);

    let totalThisWeek = 0;
    let totalLastWeek = 0;
    const titlesThisWeek = new Set<string>();
    const titlesBefore = new Set<string>();
    const binges: { childName: string; childIndex: number; series: string; count: number }[] = [];
    const newTitles: { childName: string; childIndex: number; title: string }[] = [];
    let matchedEpisodesThisWeek = 0;
    let ageAppropriateEpisodes = 0;
    const newAboveAge: { childName: string; childIndex: number; title: string; ageMin: number }[] = [];

    childData.forEach((child, childIdx) => {
      const insight = insights.find((i) => i.child.id === child.childId);
      const aboveAgeTitles = new Set((insight?.aboveAge ?? []).map((a) => a.title));

      // Parse all entries with dates
      const parsed = child.entries.map((e) => ({
        ...e,
        parsed: parseNetflixDate(e.date),
      }));

      // Entries before this week (for detecting new titles)
      parsed.forEach((e) => {
        if (e.parsed < thisWeekStart) {
          titlesBefore.add(`${child.childId}::${e.seriesTitle || e.title}`);
        }
      });

      // This week entries
      const thisWeekEntries = parsed.filter((e) => e.parsed >= thisWeekStart && e.parsed <= now);
      const lastWeekEntries = parsed.filter((e) => e.parsed >= lastWeekStart && e.parsed < thisWeekStart);

      totalThisWeek += thisWeekEntries.length;
      totalLastWeek += lastWeekEntries.length;

      thisWeekEntries.forEach((e) => {
        const key = e.seriesTitle || e.title;
        titlesThisWeek.add(key);
      });

      // Age-appropriate calculation from insights
      if (insight) {
        const thisWeekTitles = new Set(thisWeekEntries.map((e) => e.seriesTitle || e.title));
        thisWeekEntries.forEach((e) => {
          const titleKey = e.seriesTitle || e.title;
          const watchEntry = insight.titleWatchCounts.find(
            (t) => t.title === titleKey || t.displayTitle === titleKey
          );
          if (watchEntry && watchEntry.ageMin !== null) {
            matchedEpisodesThisWeek++;
            if (watchEntry.ageMin <= child.age) {
              ageAppropriateEpisodes++;
            }
          }
        });

        // New above-age content this week
        thisWeekTitles.forEach((title) => {
          if (aboveAgeTitles.has(title) && !titlesBefore.has(`${child.childId}::${title}`)) {
            newAboveAge.push({
              childName: child.childName,
              childIndex: childIdx,
              title,
              ageMin: insight.aboveAge.find((a) => a.title === title)?.ageMin ?? 0,
            });
          }
        });
      }

      // Detect binge sessions (4+ same series same day)
      const daySeriesMap = new Map<string, number>();
      thisWeekEntries.forEach((e) => {
        const series = e.seriesTitle || e.title;
        const dayKey = `${e.parsed.getFullYear()}-${e.parsed.getMonth()}-${e.parsed.getDate()}::${series}`;
        daySeriesMap.set(dayKey, (daySeriesMap.get(dayKey) ?? 0) + 1);
      });
      daySeriesMap.forEach((count, key) => {
        if (count >= 4) {
          const series = key.split('::')[1];
          binges.push({ childName: child.childName, childIndex: childIdx, series, count });
        }
      });

      // Detect new titles
      thisWeekEntries.forEach((e) => {
        const titleKey = `${child.childId}::${e.seriesTitle || e.title}`;
        if (!titlesBefore.has(titleKey)) {
          const display = e.seriesTitle || e.title;
          if (!newTitles.find((n) => n.childName === child.childName && n.title === display)) {
            newTitles.push({ childName: child.childName, childIndex: childIdx, title: display });
          }
        }
      });
    });

    const delta = totalThisWeek - totalLastWeek;
    const ageAppropriatePct = matchedEpisodesThisWeek > 0
      ? Math.round((ageAppropriateEpisodes / matchedEpisodesThisWeek) * 100)
      : 100;

    // Build callouts (priority: above-age > binge > new title)
    const callouts: Callout[] = [];
    newAboveAge.forEach((item) => {
      callouts.push({
        type: 'concern',
        icon: '\u26A0',
        text: `New above-age title: "${item.title}" (rated ${item.ageMin}+)`,
        childName: item.childName,
        childIndex: item.childIndex,
      });
    });
    binges.forEach((b) => {
      callouts.push({
        type: 'concern',
        icon: '\u23F1',
        text: `Binged "${b.series}" \u2014 ${b.count} episodes in one sitting`,
        childName: b.childName,
        childIndex: b.childIndex,
      });
    });
    newTitles.slice(0, 4).forEach((n) => {
      callouts.push({
        type: 'positive',
        icon: '\u2728',
        text: `Discovered "${n.title}"`,
        childName: n.childName,
        childIndex: n.childIndex,
      });
    });

    const topCallouts = callouts.slice(0, 2);

    // Build action
    let action: { text: string; type: 'concern' | 'positive' | 'neutral' };
    if (newAboveAge.length > 0) {
      const first = newAboveAge[0];
      action = {
        text: `Talk to ${first.childName} about "${first.title}" \u2014 tap for conversation guide`,
        type: 'concern',
      };
    } else if (binges.length > 0) {
      const first = binges[0];
      action = {
        text: `${first.childName} binged "${first.series}" (${first.count} episodes). Consider setting a daily limit.`,
        type: 'concern',
      };
    } else {
      action = {
        text: 'Great week! All content age-appropriate.',
        type: 'positive',
      };
    }

    return {
      totalThisWeek,
      delta,
      uniqueTitles: titlesThisWeek.size,
      ageAppropriatePct,
      callouts: topCallouts,
      action,
    };
  }, [childData, insights]);

  const borderColorMap: Record<string, string> = {
    concern: '#f59e0b',
    positive: '#10b981',
    neutral: '#60a5fa',
  };

  return (
    <div
      className="rounded-xl p-5"
      style={{
        backgroundColor: 'var(--chrome-surface)',
        border: '1px solid var(--chrome-border)',
      }}
    >
      {/* Header */}
      <h3
        className="text-sm font-semibold mb-4"
        style={{ color: 'var(--chrome-text)' }}
      >
        This Week in {familyName}
      </h3>

      {/* 3 Stats Row */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {/* Total episodes */}
        <div
          className="rounded-lg p-3 text-center"
          style={{ backgroundColor: 'var(--chrome-bg)' }}
        >
          <div className="flex items-center justify-center gap-1.5">
            <span
              className="text-2xl font-bold"
              style={{ color: 'var(--chrome-text)' }}
            >
              {analysis.totalThisWeek}
            </span>
            {analysis.delta !== 0 && (
              <span
                className="text-xs font-medium px-1.5 py-0.5 rounded-full"
                style={{
                  backgroundColor: analysis.delta < 0 ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                  color: analysis.delta < 0 ? '#10b981' : '#f59e0b',
                }}
              >
                {analysis.delta > 0 ? '+' : ''}{analysis.delta}
              </span>
            )}
          </div>
          <div
            className="text-xs mt-1"
            style={{ color: 'var(--chrome-text-secondary)' }}
          >
            Episodes
          </div>
        </div>

        {/* Unique titles */}
        <div
          className="rounded-lg p-3 text-center"
          style={{ backgroundColor: 'var(--chrome-bg)' }}
        >
          <div
            className="text-2xl font-bold"
            style={{ color: 'var(--chrome-text)' }}
          >
            {analysis.uniqueTitles}
          </div>
          <div
            className="text-xs mt-1"
            style={{ color: 'var(--chrome-text-secondary)' }}
          >
            Unique Titles
          </div>
        </div>

        {/* Age-appropriate % */}
        <div
          className="rounded-lg p-3 text-center"
          style={{ backgroundColor: 'var(--chrome-bg)' }}
        >
          <div
            className="text-2xl font-bold"
            style={{
              color: analysis.ageAppropriatePct >= 90
                ? '#10b981'
                : analysis.ageAppropriatePct >= 70
                  ? '#f59e0b'
                  : '#ef4444',
            }}
          >
            {analysis.ageAppropriatePct}%
          </div>
          <div
            className="text-xs mt-1"
            style={{ color: 'var(--chrome-text-secondary)' }}
          >
            Age-Appropriate
          </div>
        </div>
      </div>

      {/* 2 Callouts */}
      {analysis.callouts.length > 0 && (
        <div className="flex flex-col gap-2 mb-4">
          {analysis.callouts.map((callout, i) => (
            <div
              key={i}
              className="rounded-lg p-3 flex items-start gap-2.5"
              style={{
                backgroundColor: 'var(--chrome-bg)',
                borderLeft: `3px solid ${borderColorMap[callout.type]}`,
              }}
            >
              <span className="text-sm shrink-0">{callout.icon}</span>
              <div className="flex-1 min-w-0">
                <div
                  className="text-xs leading-relaxed"
                  style={{ color: 'var(--chrome-text)' }}
                >
                  {callout.text}
                </div>
              </div>
              <span
                className="text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0"
                style={{
                  backgroundColor: `${getChildColor(callout.childIndex)}22`,
                  color: getChildColor(callout.childIndex),
                }}
              >
                {callout.childName}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* 1 Action */}
      <button
        className="w-full text-left rounded-lg px-3 py-2.5 text-xs transition-colors"
        style={{
          backgroundColor: analysis.action.type === 'positive'
            ? 'rgba(16,185,129,0.08)'
            : 'rgba(245,158,11,0.08)',
          color: analysis.action.type === 'positive' ? '#10b981' : '#f59e0b',
          border: 'none',
          cursor: 'pointer',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = analysis.action.type === 'positive'
            ? 'rgba(16,185,129,0.15)'
            : 'rgba(245,158,11,0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = analysis.action.type === 'positive'
            ? 'rgba(16,185,129,0.08)'
            : 'rgba(245,158,11,0.08)';
        }}
      >
        {analysis.action.text}
      </button>
    </div>
  );
}
