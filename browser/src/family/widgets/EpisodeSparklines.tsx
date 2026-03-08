import React, { useMemo } from 'react';

interface ChildViewingData {
  childId: string;
  childName: string;
  age: number;
  entries: { title: string; date: string; seriesTitle?: string }[];
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

interface DailyData {
  day: number; // 0-29, 0 = oldest
  count: number;
}

interface ChildSparkline {
  childName: string;
  color: string;
  dailyCounts: number[]; // 30 entries
  avg: number;
  trendSlope: number;
  trendIntercept: number;
}

function computeLinearRegression(values: number[]): { slope: number; intercept: number } {
  const n = values.length;
  if (n === 0) return { slope: 0, intercept: 0 };

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += values[i];
    sumXY += i * values[i];
    sumXX += i * i;
  }

  const denom = n * sumXX - sumX * sumX;
  if (denom === 0) return { slope: 0, intercept: sumY / n };

  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
}

export default function EpisodeSparklines({ childData }: { childData: ChildViewingData[] }) {
  const sparklines = useMemo<ChildSparkline[]>(() => {
    const now = new Date();
    now.setHours(23, 59, 59, 999);

    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 29);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    return childData.map((child, idx) => {
      // Initialize 30 days of zeros
      const dailyCounts = new Array(30).fill(0);

      child.entries.forEach((entry) => {
        const date = parseNetflixDate(entry.date);
        date.setHours(0, 0, 0, 0);

        if (date >= thirtyDaysAgo && date <= now) {
          const diffMs = date.getTime() - thirtyDaysAgo.getTime();
          const dayIndex = Math.floor(diffMs / (1000 * 60 * 60 * 24));
          if (dayIndex >= 0 && dayIndex < 30) {
            dailyCounts[dayIndex]++;
          }
        }
      });

      const total = dailyCounts.reduce((s, v) => s + v, 0);
      const avg = Math.round((total / 30) * 10) / 10;

      const { slope, intercept } = computeLinearRegression(dailyCounts);

      return {
        childName: child.childName,
        color: getChildColor(idx),
        dailyCounts,
        avg,
        trendSlope: slope,
        trendIntercept: intercept,
      };
    });
  }, [childData]);

  if (sparklines.length === 0) return null;

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
        Daily Episodes (Last 30 Days)
      </h3>

      <div className="flex flex-col gap-3">
        {sparklines.map((spark) => {
          const maxCount = Math.max(...spark.dailyCounts, 1);
          const W = 120;
          const H = 24;
          const padY = 2;
          const usableH = H - padY * 2;

          // Build polyline points
          const points = spark.dailyCounts.map((count, i) => {
            const x = (i / 29) * W;
            const y = padY + usableH - (count / maxCount) * usableH;
            return `${x},${y}`;
          });

          const polylinePoints = points.join(' ');

          // Fill area: close the path along the bottom
          const fillPoints = `${points.join(' ')} ${W},${H} 0,${H}`;

          // Trend line
          const trendStart = spark.trendIntercept;
          const trendEnd = spark.trendIntercept + spark.trendSlope * 29;
          const trendY1 = padY + usableH - (Math.max(0, trendStart) / maxCount) * usableH;
          const trendY2 = padY + usableH - (Math.max(0, trendEnd) / maxCount) * usableH;

          // Terminal dot
          const lastCount = spark.dailyCounts[29];
          const lastX = W;
          const lastY = padY + usableH - (lastCount / maxCount) * usableH;

          return (
            <div key={spark.childName} className="flex items-center gap-3">
              {/* Child name */}
              <span
                className="text-xs w-[72px] text-right shrink-0 truncate"
                style={{ color: spark.color }}
                title={spark.childName}
              >
                {spark.childName}
              </span>

              {/* Sparkline SVG */}
              <svg
                width={120}
                height={24}
                viewBox={`0 0 ${W} ${H}`}
                className="shrink-0"
                style={{ overflow: 'visible' }}
              >
                {/* Fill area */}
                <polygon
                  points={fillPoints}
                  fill={spark.color}
                  opacity={0.1}
                />

                {/* Data line */}
                <polyline
                  points={polylinePoints}
                  fill="none"
                  stroke={spark.color}
                  strokeWidth={1.5}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />

                {/* Trend line */}
                <line
                  x1={0}
                  y1={trendY1}
                  x2={W}
                  y2={trendY2}
                  stroke={spark.color}
                  strokeWidth={1}
                  strokeDasharray="3 2"
                  opacity={0.4}
                />

                {/* Terminal dot */}
                <circle
                  cx={lastX}
                  cy={lastY}
                  r={2}
                  fill={spark.color}
                />
              </svg>

              {/* Average stat */}
              <span
                className="text-xs w-[56px] shrink-0 text-right"
                style={{ color: 'var(--chrome-text-secondary)' }}
              >
                avg {spark.avg}/day
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
