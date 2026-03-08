import React, { useMemo } from 'react';

interface ChildViewingData {
  childId: string;
  childName: string;
  age: number;
  entries: { title: string; date: string; seriesTitle?: string }[];
}

interface CSMReviewLookup {
  ageRangeMin: number;
  qualityStars: number;
  isFamilyFriendly?: boolean;
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

function normalizeTitle(t: string): string {
  return t.toLowerCase().trim();
}

function getDayKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

interface Milestone {
  id: string;
  icon: React.ReactNode;
  title: string;
  childName: string;
  childColor: string;
  description: string;
}

// SVG icons as small inline components
function StarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M10 2l2.35 4.76 5.26.77-3.81 3.71.9 5.24L10 14.14l-4.7 2.34.9-5.24L2.39 7.53l5.26-.77L10 2z"
        fill="#fbbf24"
        stroke="#fbbf24"
        strokeWidth="0.5"
      />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M10 2L4 5v4.5c0 3.86 2.56 7.47 6 8.5 3.44-1.03 6-4.64 6-8.5V5l-6-3z"
        fill="#2dd4bf"
        opacity="0.8"
      />
      <path d="M8.5 10.5l1.5 1.5 3-3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CompassIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="7" stroke="#60a5fa" strokeWidth="1.5" />
      <polygon points="10,5 12,9 10,8 8,9" fill="#60a5fa" />
      <polygon points="10,15 8,11 10,12 12,11" fill="#60a5fa" opacity="0.5" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="3" y="3" width="5.5" height="5.5" rx="1" fill="#a78bfa" opacity="0.7" />
      <rect x="11.5" y="3" width="5.5" height="5.5" rx="1" fill="#a78bfa" opacity="0.9" />
      <rect x="3" y="11.5" width="5.5" height="5.5" rx="1" fill="#a78bfa" opacity="0.9" />
      <rect x="11.5" y="11.5" width="5.5" height="5.5" rx="1" fill="#a78bfa" opacity="0.5" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M10 16s-5.5-3.5-6.5-6.5C2.5 6.5 5 4 7.5 5.5L10 8l2.5-2.5C15 4 17.5 6.5 16.5 9.5 15.5 12.5 10 16 10 16z"
        fill="#f472b6"
      />
    </svg>
  );
}

function BalanceIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="9" y="4" width="2" height="10" rx="1" fill="#34d399" />
      <rect x="4" y="14" width="12" height="2" rx="1" fill="#34d399" opacity="0.6" />
      <circle cx="6" cy="8" r="2" fill="#34d399" opacity="0.7" />
      <circle cx="14" cy="8" r="2" fill="#34d399" opacity="0.7" />
    </svg>
  );
}

export default function MilestoneCards({
  childData,
  reviews,
}: {
  childData: ChildViewingData[];
  reviews: Map<string, CSMReviewLookup>;
}) {
  const milestones = useMemo(() => {
    const result: Milestone[] = [];
    const now = new Date();
    const today = getDayKey(now);

    childData.forEach((child, childIdx) => {
      const color = CHILD_COLORS[childIdx % CHILD_COLORS.length];

      // Parse all entries with dates
      const parsed = child.entries.map((e) => ({
        ...e,
        parsedDate: parseNetflixDate(e.date),
        dayKey: getDayKey(parseNetflixDate(e.date)),
        normalized: normalizeTitle(e.seriesTitle || e.title),
      }));

      // Sort by date descending
      const sorted = [...parsed].sort((a, b) => b.parsedDate.getTime() - a.parsedDate.getTime());

      // 1. Age-Appropriate Streak
      // Group by day, check consecutive days from most recent backward
      const dayEntries = new Map<string, typeof parsed>();
      parsed.forEach((e) => {
        if (!dayEntries.has(e.dayKey)) dayEntries.set(e.dayKey, []);
        dayEntries.get(e.dayKey)!.push(e);
      });

      // Get all unique days sorted descending
      const uniqueDays = [...dayEntries.keys()].sort().reverse();
      let streakDays = 0;
      for (const day of uniqueDays) {
        const dayItems = dayEntries.get(day)!;
        const allAgeAppropriate = dayItems.every((item) => {
          const review = reviews.get(item.normalized);
          if (!review) return true; // unreviewed content doesn't break streak
          return review.ageRangeMin <= child.age;
        });
        if (allAgeAppropriate) {
          streakDays++;
        } else {
          break;
        }
      }

      if (streakDays >= 30) {
        result.push({
          id: `streak-30-${child.childId}`,
          icon: <ShieldIcon />,
          title: '30-Day Streak!',
          childName: child.childName,
          childColor: color,
          description: `${child.childName} has watched age-appropriate content for 30+ days straight.`,
        });
      } else if (streakDays >= 7) {
        result.push({
          id: `streak-7-${child.childId}`,
          icon: <ShieldIcon />,
          title: '1 Week Age-Appropriate!',
          childName: child.childName,
          childColor: color,
          description: `${streakDays}-day streak of all age-appropriate content.`,
        });
      }

      // 2. Explorer Badge: 10+ unique titles in last 30 days
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentTitles = new Set(
        parsed
          .filter((e) => e.parsedDate >= thirtyDaysAgo)
          .map((e) => e.normalized)
      );
      if (recentTitles.size >= 10) {
        result.push({
          id: `explorer-${child.childId}`,
          icon: <CompassIcon />,
          title: 'Explorer Badge',
          childName: child.childName,
          childColor: color,
          description: `Watched ${recentTitles.size} unique titles this month.`,
        });
      }

      // 3. Diverse Viewer: 4+ unique series this week
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const weekSeries = new Set(
        parsed
          .filter((e) => e.parsedDate >= sevenDaysAgo && e.parsedDate <= now)
          .map((e) => normalizeTitle(e.seriesTitle || e.title))
      );
      if (weekSeries.size >= 4) {
        result.push({
          id: `diverse-${child.childId}`,
          icon: <GridIcon />,
          title: 'Diverse Viewer',
          childName: child.childName,
          childColor: color,
          description: `Explored ${weekSeries.size} different series this week.`,
        });
      }

      // 4. Quality Pick: new 4+ star title this week
      const weekEntries = parsed.filter((e) => e.parsedDate >= sevenDaysAgo && e.parsedDate <= now);
      const qualityPick = weekEntries.find((e) => {
        const review = reviews.get(e.normalized);
        return review && review.qualityStars >= 4;
      });
      if (qualityPick) {
        const displayTitle = qualityPick.seriesTitle || qualityPick.title;
        result.push({
          id: `quality-${child.childId}`,
          icon: <StarIcon />,
          title: 'Quality Pick',
          childName: child.childName,
          childColor: color,
          description: `Found "${displayTitle}" (${reviews.get(qualityPick.normalized)!.qualityStars} stars).`,
        });
      }

      // 6. Healthy Rhythm: no single day exceeded 4 episodes in last 7 days
      const recentDays = parsed.filter((e) => e.parsedDate >= sevenDaysAgo && e.parsedDate <= now);
      if (recentDays.length > 0) {
        const dayCounts = new Map<string, number>();
        recentDays.forEach((e) => {
          dayCounts.set(e.dayKey, (dayCounts.get(e.dayKey) || 0) + 1);
        });
        const maxInDay = Math.max(...dayCounts.values());
        if (maxInDay <= 4) {
          result.push({
            id: `rhythm-${child.childId}`,
            icon: <BalanceIcon />,
            title: 'Healthy Rhythm',
            childName: child.childName,
            childColor: color,
            description: 'No binge days this week (4 or fewer episodes per day).',
          });
        }
      }
    });

    // 5. Family Time: 2+ children watched the same title on the same day
    if (childData.length >= 2) {
      // Build map of (dayKey, normalizedTitle) -> set of childIds
      const sharedMap = new Map<string, Set<string>>();
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      childData.forEach((child) => {
        child.entries.forEach((e) => {
          const date = parseNetflixDate(e.date);
          if (date < sevenDaysAgo || date > now) return;
          const dayKey = getDayKey(date);
          const title = normalizeTitle(e.seriesTitle || e.title);
          const key = `${dayKey}||${title}`;
          if (!sharedMap.has(key)) sharedMap.set(key, new Set());
          sharedMap.get(key)!.add(child.childId);
        });
      });

      const familyTitles: string[] = [];
      sharedMap.forEach((childIds, key) => {
        if (childIds.size >= 2) {
          const title = key.split('||')[1];
          if (!familyTitles.includes(title)) familyTitles.push(title);
        }
      });

      if (familyTitles.length > 0) {
        const displayTitle = familyTitles[0];
        // Find original casing
        let originalTitle = displayTitle;
        for (const child of childData) {
          const match = child.entries.find(
            (e) => normalizeTitle(e.seriesTitle || e.title) === displayTitle
          );
          if (match) {
            originalTitle = match.seriesTitle || match.title;
            break;
          }
        }

        result.push({
          id: 'family-time',
          icon: <HeartIcon />,
          title: 'Family Time',
          childName: 'Family',
          childColor: '#f472b6',
          description:
            familyTitles.length === 1
              ? `Watched "${originalTitle}" together this week.`
              : `Shared ${familyTitles.length} titles together this week.`,
        });
      }
    }

    return result;
  }, [childData, reviews]);

  if (milestones.length === 0) {
    return (
      <div
        className="rounded-xl p-5"
        style={{ backgroundColor: 'var(--chrome-surface)', border: '1px solid var(--chrome-border)' }}
      >
        <h3 style={{ color: 'var(--chrome-text)', margin: 0, fontSize: 14, fontWeight: 600 }}>
          Milestones
        </h3>
        <p style={{ color: 'var(--chrome-text-secondary)', fontSize: 13, marginTop: 8 }}>
          Keep watching — milestones unlock as we learn your family's patterns!
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl p-5"
      style={{ backgroundColor: 'var(--chrome-surface)', border: '1px solid var(--chrome-border)' }}
    >
      <h3 style={{ color: 'var(--chrome-text)', margin: 0, fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
        Milestones
      </h3>
      <div
        style={{
          display: 'flex',
          gap: 12,
          overflowX: 'auto',
          paddingBottom: 4,
          scrollbarWidth: 'thin',
        }}
      >
        {milestones.map((m) => (
          <div
            key={m.id}
            style={{
              minWidth: 180,
              maxWidth: 220,
              backgroundColor: 'var(--chrome-bg)',
              border: '1px solid rgba(45, 212, 191, 0.25)',
              borderRadius: 12,
              padding: '14px 14px 12px',
              flexShrink: 0,
              cursor: 'default',
              transition: 'transform 150ms ease, box-shadow 150ms ease',
              boxShadow: '0 0 8px rgba(45, 212, 191, 0.08)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.04)';
              (e.currentTarget as HTMLDivElement).style.boxShadow = '0 0 16px rgba(45, 212, 191, 0.2)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)';
              (e.currentTarget as HTMLDivElement).style.boxShadow = '0 0 8px rgba(45, 212, 191, 0.08)';
            }}
          >
            <div style={{ marginBottom: 8 }}>{m.icon}</div>
            <div
              style={{
                color: 'var(--chrome-text)',
                fontSize: 13,
                fontWeight: 600,
                marginBottom: 4,
              }}
            >
              {m.title}
            </div>
            <div
              style={{
                display: 'inline-block',
                backgroundColor: m.childColor + '22',
                color: m.childColor,
                fontSize: 10,
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: 10,
                marginBottom: 6,
              }}
            >
              {m.childName}
            </div>
            <div style={{ color: 'var(--chrome-text-secondary)', fontSize: 11, lineHeight: 1.4 }}>
              {m.description}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
