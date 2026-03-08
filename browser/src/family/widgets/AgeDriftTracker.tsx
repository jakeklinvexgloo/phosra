import React, { useMemo, useCallback } from 'react';
import { useTouchInteraction, touchChartContainerStyle, touchOverlayStyle } from './useTouchInteraction';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface ChildViewingData {
  childId: string;
  childName: string;
  age: number;
  entries: { title: string; date: string; seriesTitle?: string }[];
}

interface CSMReviewLookup {
  ageRangeMin: number;
  qualityStars: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants & utilities
// ─────────────────────────────────────────────────────────────────────────────

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

/** Get Monday-based week start for a date */
function getWeekStart(d: Date): Date {
  const copy = new Date(d);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

/** Generate array of week-start dates for N weeks ending at endDate */
function getWeekStarts(endDate: Date, numWeeks: number): Date[] {
  const weeks: Date[] = [];
  const end = getWeekStart(endDate);
  for (let i = numWeeks - 1; i >= 0; i--) {
    const d = new Date(end);
    d.setDate(d.getDate() - i * 7);
    weeks.push(d);
  }
  return weeks;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

interface AgeDriftTrackerProps {
  childData: ChildViewingData[];
  reviews: Map<string, CSMReviewLookup>;
}

export default function AgeDriftTracker({ childData, reviews }: AgeDriftTrackerProps) {
  const NUM_WEEKS = 12;
  const L = 48, R = 16, T = 24, B = 32;
  const W = 640, H = 280;
  const plotW = W - L - R;
  const plotH = H - T - B;

  // Y-axis: fixed 0-18 age rating scale
  const Y_MIN = 0;
  const Y_MAX = 18;
  const Y_TICKS = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18];

  const xForWeek = (w: number) => L + (w / (NUM_WEEKS - 1)) * plotW;
  const yForAge = (age: number) => T + plotH - ((age - Y_MIN) / (Y_MAX - Y_MIN)) * plotH;

  // Touch-friendly slide interaction for crosshair
  const weekResolver = useCallback(
    (rect: DOMRect, point: { clientX: number; clientY: number }) => {
      const relX = point.clientX - rect.left;
      const fraction = relX / rect.width;
      return Math.max(0, Math.min(NUM_WEEKS - 1, Math.round(fraction * (NUM_WEEKS - 1))));
    },
    []
  );
  const { active: hoveredWeek, bindOverlay, bindContainer, isTouching } =
    useTouchInteraction<number>('slide', weekResolver);

  const { weekStarts, childLines } = useMemo(() => {
    const today = new Date();
    const weekStarts = getWeekStarts(today, NUM_WEEKS);

    const childLines = childData.map((child, idx) => {
      const color = CHILD_COLORS[idx % CHILD_COLORS.length];
      const weeklyAvg: (number | null)[] = [];

      for (let w = 0; w < NUM_WEEKS; w++) {
        const weekStart = weekStarts[w];
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);

        let sumAge = 0;
        let count = 0;

        for (const entry of child.entries) {
          const d = parseNetflixDate(entry.date);
          if (d >= weekStart && d < weekEnd) {
            const key = normalizeTitle(entry.title);
            const review = reviews.get(key);
            if (review) {
              sumAge += review.ageRangeMin;
              count++;
            }
          }
        }

        weeklyAvg.push(count > 0 ? sumAge / count : null);
      }

      return {
        childId: child.childId,
        childName: child.childName,
        age: child.age,
        color,
        weeklyAvg,
      };
    });

    return { weekStarts, childLines };
  }, [childData, reviews]);

  // Build line path segments for a child, skipping nulls
  function buildLinePath(weeklyAvg: (number | null)[]): string {
    let d = '';
    let inSegment = false;
    for (let w = 0; w < weeklyAvg.length; w++) {
      const v = weeklyAvg[w];
      if (v === null) {
        inSegment = false;
        continue;
      }
      const x = xForWeek(w);
      const y = yForAge(v);
      if (!inSegment) {
        d += `M ${x.toFixed(1)},${y.toFixed(1)} `;
        inSegment = true;
      } else {
        d += `L ${x.toFixed(1)},${y.toFixed(1)} `;
      }
    }
    return d;
  }

  // Build area paths between the data line and the child's age reference line.
  // We split into "at/below age" (emerald) and "above age" (amber) segments.
  function buildAreaSegments(
    weeklyAvg: (number | null)[],
    childAge: number,
    color: string
  ): { path: string; fill: string }[] {
    const segments: { path: string; fill: string }[] = [];
    const ageY = yForAge(childAge);

    // Walk through consecutive non-null runs
    let runStart = -1;
    for (let w = 0; w <= weeklyAvg.length; w++) {
      const v = w < weeklyAvg.length ? weeklyAvg[w] : null;
      if (v === null) {
        if (runStart >= 0) {
          // Close run from runStart to w-1
          emitRunSegments(runStart, w - 1);
          runStart = -1;
        }
      } else {
        if (runStart < 0) runStart = w;
      }
    }

    function emitRunSegments(start: number, end: number) {
      if (start > end) return;

      // For each pair of adjacent points, create a small trapezoid between the
      // data line and the age reference line, colored by whether data is above or below age.
      for (let w = start; w <= end; w++) {
        const v = weeklyAvg[w]!;
        const x = xForWeek(w);
        const dataY = yForAge(v);

        if (w < end) {
          const vNext = weeklyAvg[w + 1]!;
          const xNext = xForWeek(w + 1);
          const dataYNext = yForAge(vNext);

          // Check if both points are on the same side of the age line
          const aboveNow = v > childAge;
          const aboveNext = vNext > childAge;

          if (aboveNow === aboveNext) {
            // Simple case: whole segment is one color
            const fill = aboveNow ? 'rgba(251,191,36,0.15)' : 'rgba(52,211,153,0.15)';
            const path = `M ${x.toFixed(1)},${dataY.toFixed(1)} L ${xNext.toFixed(1)},${dataYNext.toFixed(1)} L ${xNext.toFixed(1)},${ageY.toFixed(1)} L ${x.toFixed(1)},${ageY.toFixed(1)} Z`;
            segments.push({ path, fill });
          } else {
            // Crossing: find intersection point
            const t = (childAge - v) / (vNext - v);
            const crossX = x + t * (xNext - x);
            const crossY = ageY;

            // First half
            const fill1 = aboveNow ? 'rgba(251,191,36,0.15)' : 'rgba(52,211,153,0.15)';
            const path1 = `M ${x.toFixed(1)},${dataY.toFixed(1)} L ${crossX.toFixed(1)},${crossY.toFixed(1)} L ${x.toFixed(1)},${ageY.toFixed(1)} Z`;
            segments.push({ path: path1, fill: fill1 });

            // Second half
            const fill2 = aboveNext ? 'rgba(251,191,36,0.15)' : 'rgba(52,211,153,0.15)';
            const path2 = `M ${crossX.toFixed(1)},${crossY.toFixed(1)} L ${xNext.toFixed(1)},${dataYNext.toFixed(1)} L ${xNext.toFixed(1)},${ageY.toFixed(1)} Z`;
            segments.push({ path: path2, fill: fill2 });
          }
        }
      }
    }

    return segments;
  }

  return (
    <div
      {...bindContainer}
      className="rounded-xl p-5"
      style={{
        backgroundColor: 'var(--chrome-surface)',
        border: '1px solid var(--chrome-border)',
        ...touchChartContainerStyle,
      }}
    >
      <h3
        className="text-sm font-semibold mb-3"
        style={{ color: 'var(--chrome-text)' }}
      >
        Age Drift Tracker
      </h3>

      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
        <defs>
          <clipPath id="ageDriftTracker-clip">
            <rect x={L} y={T} width={plotW} height={plotH} />
          </clipPath>
        </defs>

        {/* Y-axis grid lines + labels */}
        {Y_TICKS.map(age => (
          <g key={`y-${age}`}>
            <line
              x1={L} y1={yForAge(age)}
              x2={L + plotW} y2={yForAge(age)}
              stroke="var(--chrome-border)" strokeWidth={0.5}
            />
            <text
              x={L - 6} y={yForAge(age)}
              textAnchor="end" dominantBaseline="central"
              fontSize="9" fill="var(--chrome-text-secondary)"
            >
              {age}
            </text>
          </g>
        ))}

        {/* X-axis week labels (every 2nd week) */}
        {weekStarts.map((ws, w) => w % 2 === 0 ? (
          <text
            key={`x-${w}`}
            x={xForWeek(w)} y={H - B + 14}
            textAnchor="middle" fontSize="9"
            fill="var(--chrome-text-secondary)"
          >
            {ws.toLocaleDateString('en', { month: 'short', day: 'numeric' })}
          </text>
        ) : null)}

        <g clipPath="url(#ageDriftTracker-clip)">
          {/* Area shading between data line and age reference */}
          {childLines.map(child => {
            const segments = buildAreaSegments(child.weeklyAvg, child.age, child.color);
            return segments.map((seg, i) => (
              <path
                key={`area-${child.childId}-${i}`}
                d={seg.path}
                fill={seg.fill}
              />
            ));
          })}

          {/* Per-child actual age reference line (horizontal dashed) */}
          {childLines.map(child => (
            <line
              key={`ref-${child.childId}`}
              x1={L} y1={yForAge(child.age)}
              x2={L + plotW} y2={yForAge(child.age)}
              stroke={child.color} strokeWidth={1}
              strokeDasharray="4 3" opacity={0.5}
            />
          ))}

          {/* Per-child data line */}
          {childLines.map(child => (
            <path
              key={`line-${child.childId}`}
              d={buildLinePath(child.weeklyAvg)}
              fill="none"
              stroke={child.color}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}

          {/* Data points */}
          {childLines.map(child =>
            child.weeklyAvg.map((v, w) => {
              if (v === null) return null;
              const aboveAge = v > child.age;
              return (
                <circle
                  key={`pt-${child.childId}-${w}`}
                  cx={xForWeek(w)}
                  cy={yForAge(v)}
                  r={3}
                  fill={aboveAge ? '#fbbf24' : child.color}
                  stroke="var(--chrome-bg)"
                  strokeWidth={1.5}
                  style={{ transition: 'fill 0.2s ease' }}
                />
              );
            })
          )}
        </g>

        {/* Hover crosshair */}
        {hoveredWeek !== null && (
          <g>
            <line
              x1={xForWeek(hoveredWeek)} y1={T}
              x2={xForWeek(hoveredWeek)} y2={T + plotH}
              stroke="var(--chrome-text)" strokeWidth={1} opacity={0.3}
              strokeDasharray="3 2"
            />
            {/* Per-child highlight dots on crosshair */}
            {childLines.map(child => {
              const v = child.weeklyAvg[hoveredWeek];
              if (v === null) return null;
              const aboveAge = v > child.age;
              return (
                <circle
                  key={`hover-${child.childId}`}
                  cx={xForWeek(hoveredWeek)}
                  cy={yForAge(v)}
                  r={4.5}
                  fill={aboveAge ? '#fbbf24' : child.color}
                  stroke="var(--chrome-bg)"
                  strokeWidth={2}
                />
              );
            })}
            {/* Tooltip box */}
            {(() => {
              const tx = xForWeek(hoveredWeek);
              const tooltipX = tx > W / 2 ? tx - 130 : tx + 10;
              const weekLabel = weekStarts[hoveredWeek]?.toLocaleDateString('en', {
                month: 'short',
                day: 'numeric',
              });
              const activeChildren = childLines.filter(c => c.weeklyAvg[hoveredWeek] !== null);
              if (activeChildren.length === 0) return null;
              const tooltipH = 16 + activeChildren.length * 16;

              return (
                <g>
                  <rect
                    x={tooltipX} y={T}
                    width={120} height={tooltipH}
                    rx={4}
                    fill="var(--chrome-bg)"
                    stroke="var(--chrome-border)"
                    strokeWidth={1}
                  />
                  <text
                    x={tooltipX + 8} y={T + 12}
                    fontSize="9" fontWeight="600"
                    fill="var(--chrome-text)"
                  >
                    {weekLabel}
                  </text>
                  {activeChildren.map((child, idx) => {
                    const v = child.weeklyAvg[hoveredWeek]!;
                    const aboveAge = v > child.age;
                    return (
                      <g key={child.childId}>
                        <circle
                          cx={tooltipX + 14}
                          cy={T + 26 + idx * 16}
                          r={3}
                          fill={aboveAge ? '#fbbf24' : child.color}
                        />
                        <text
                          x={tooltipX + 22}
                          y={T + 26 + idx * 16}
                          fontSize="9"
                          dominantBaseline="central"
                          fill="var(--chrome-text-secondary)"
                        >
                          {child.childName}: {v.toFixed(1)} (age {child.age})
                        </text>
                      </g>
                    );
                  })}
                </g>
              );
            })()}
          </g>
        )}

        {/* Invisible overlay for mouse + touch tracking */}
        <rect
          x={L} y={T} width={plotW} height={plotH}
          fill="transparent"
          style={touchOverlayStyle(isTouching)}
          {...bindOverlay}
        />
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-3">
        {childLines.map(child => (
          <div
            key={child.childId}
            className="flex items-center gap-1.5 text-xs"
            style={{ color: 'var(--chrome-text)' }}
          >
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: child.color }}
            />
            {child.childName} (age {child.age})
          </div>
        ))}
      </div>
    </div>
  );
}
