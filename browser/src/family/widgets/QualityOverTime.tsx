import React, { useMemo, useId, useCallback } from 'react';
import { useTouchInteraction, touchChartContainerStyle, touchOverlayStyle } from './useTouchInteraction';

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

function getWeekKey(date: Date): string {
  const d = new Date(date);
  const dayOfWeek = d.getDay();
  d.setDate(d.getDate() - dayOfWeek);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

function formatWeekLabel(weekKey: string): string {
  const d = new Date(weekKey + 'T00:00:00');
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

const MARGIN = { left: 32, right: 12, top: 12, bottom: 24 };
const WIDTH = 480;
const HEIGHT = 160;
const PLOT_W = WIDTH - MARGIN.left - MARGIN.right;
const PLOT_H = HEIGHT - MARGIN.top - MARGIN.bottom;
const Y_MIN = 0;
const Y_MAX = 5;
const Y_TICKS = [1, 2, 3, 4, 5];
const REFERENCE_LINE = 3.0;
const WEEKS_TO_SHOW = 12;

interface WeeklyAvg {
  weekKey: string;
  avg: number;
}

export default function QualityOverTime({
  childData,
  reviews,
}: {
  childData: ChildViewingData[];
  reviews: Map<string, CSMReviewLookup>;
}) {
  const instanceId = useId();
  const clipId = `quality-clip-${instanceId.replace(/:/g, '')}`;

  // Touch-friendly slide interaction for crosshair
  const weekResolver = useCallback(
    (rect: DOMRect, point: { clientX: number; clientY: number }) => {
      const relX = point.clientX - rect.left;
      const fraction = relX / rect.width;
      return Math.max(0, Math.min(WEEKS_TO_SHOW - 1, Math.round(fraction * (WEEKS_TO_SHOW - 1))));
    },
    []
  );
  const { active: hoverWeekIdx, bindOverlay, bindContainer, isTouching } =
    useTouchInteraction<number>('slide', weekResolver);

  const { weekKeys, childLines, currentWeekAvgs } = useMemo(() => {
    // Determine the last 12 weeks ending at the most recent week in the data
    const allDates: Date[] = [];
    childData.forEach((child) => {
      child.entries.forEach((e) => {
        allDates.push(parseNetflixDate(e.date));
      });
    });

    if (allDates.length === 0) {
      return { weekKeys: [], childLines: [], currentWeekAvgs: [] as { name: string; avg: number; color: string }[] };
    }

    const maxDate = new Date(Math.max(...allDates.map((d) => d.getTime())));
    const latestWeek = getWeekKey(maxDate);

    const weeks: string[] = [];
    const base = new Date(latestWeek + 'T00:00:00');
    for (let i = WEEKS_TO_SHOW - 1; i >= 0; i--) {
      const d = new Date(base);
      d.setDate(d.getDate() - i * 7);
      weeks.push(getWeekKey(d));
    }

    const weekSet = new Set(weeks);

    const lines = childData.map((child, idx) => {
      // Group entries by week
      const weekMap = new Map<string, number[]>();
      child.entries.forEach((entry) => {
        const date = parseNetflixDate(entry.date);
        const wk = getWeekKey(date);
        if (!weekSet.has(wk)) return;
        const key = normalizeTitle(entry.seriesTitle || entry.title);
        const review = reviews.get(key);
        if (!review) return;
        if (!weekMap.has(wk)) weekMap.set(wk, []);
        weekMap.get(wk)!.push(review.qualityStars);
      });

      const points: WeeklyAvg[] = weeks.map((wk) => {
        const ratings = weekMap.get(wk);
        if (!ratings || ratings.length === 0) return { weekKey: wk, avg: NaN };
        const sum = ratings.reduce((a, b) => a + b, 0);
        return { weekKey: wk, avg: sum / ratings.length };
      });

      return {
        childId: child.childId,
        name: child.childName,
        color: CHILD_COLORS[idx % CHILD_COLORS.length],
        points,
      };
    });

    // Current week averages (last week in the range)
    const currentWk = weeks[weeks.length - 1];
    const cwAvgs = lines
      .map((line) => {
        const pt = line.points.find((p) => p.weekKey === currentWk);
        return {
          name: line.name,
          avg: pt && !isNaN(pt.avg) ? pt.avg : NaN,
          color: line.color,
        };
      })
      .filter((c) => !isNaN(c.avg));

    return { weekKeys: weeks, childLines: lines, currentWeekAvgs: cwAvgs };
  }, [childData, reviews]);

  if (weekKeys.length === 0) {
    return (
      <div
        className="rounded-xl p-5"
        style={{ backgroundColor: 'var(--chrome-surface)', border: '1px solid var(--chrome-border)' }}
      >
        <h3 style={{ color: 'var(--chrome-text)', margin: 0, fontSize: 14, fontWeight: 600 }}>
          Quality Over Time
        </h3>
        <p style={{ color: 'var(--chrome-text-secondary)', fontSize: 13, marginTop: 8 }}>
          No viewing data available yet.
        </p>
      </div>
    );
  }

  function xForWeek(idx: number): number {
    return MARGIN.left + (idx / (WEEKS_TO_SHOW - 1)) * PLOT_W;
  }

  function yForVal(val: number): number {
    return MARGIN.top + PLOT_H - ((val - Y_MIN) / (Y_MAX - Y_MIN)) * PLOT_H;
  }

  function buildPath(points: WeeklyAvg[]): string {
    const segments: string[] = [];
    let drawing = false;
    points.forEach((pt, i) => {
      if (isNaN(pt.avg)) {
        drawing = false;
        return;
      }
      const x = xForWeek(i);
      const y = yForVal(pt.avg);
      if (!drawing) {
        segments.push(`M${x},${y}`);
        drawing = true;
      } else {
        segments.push(`L${x},${y}`);
      }
    });
    return segments.join(' ');
  }

  // Compute overall current week average across all children
  const overallCurrentAvg =
    currentWeekAvgs.length > 0
      ? currentWeekAvgs.reduce((s, c) => s + c.avg, 0) / currentWeekAvgs.length
      : NaN;

  const hoveredWeekKey = hoverWeekIdx !== null ? weekKeys[hoverWeekIdx] : null;

  return (
    <div
      {...bindContainer}
      className="rounded-xl p-5"
      style={{ backgroundColor: 'var(--chrome-surface)', border: '1px solid var(--chrome-border)', ...touchChartContainerStyle }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
        <div>
          <h3 style={{ color: 'var(--chrome-text)', margin: 0, fontSize: 14, fontWeight: 600 }}>
            Quality Over Time
          </h3>
          <p style={{ color: 'var(--chrome-text-secondary)', fontSize: 11, margin: '2px 0 0' }}>
            Average CSM quality rating per week
          </p>
        </div>
        {!isNaN(overallCurrentAvg) && (
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#2dd4bf', lineHeight: 1 }}>
              {overallCurrentAvg.toFixed(1)}
            </div>
            <div style={{ fontSize: 10, color: 'var(--chrome-text-secondary)' }}>this week</div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 6, flexWrap: 'wrap' }}>
        {childLines.map((line) => (
          <div key={line.childId} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: line.color }} />
            <span style={{ fontSize: 11, color: 'var(--chrome-text-secondary)' }}>{line.name}</span>
          </div>
        ))}
      </div>

      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        width="100%"
        style={{ display: 'block' }}
      >
        <defs>
          <clipPath id={clipId}>
            <rect x={MARGIN.left} y={MARGIN.top} width={PLOT_W} height={PLOT_H} />
          </clipPath>
        </defs>

        {/* Y-axis grid lines and labels */}
        {Y_TICKS.map((tick) => {
          const y = yForVal(tick);
          return (
            <g key={tick}>
              <line
                x1={MARGIN.left}
                y1={y}
                x2={WIDTH - MARGIN.right}
                y2={y}
                stroke="var(--chrome-border)"
                strokeWidth={0.5}
              />
              <text
                x={MARGIN.left - 6}
                y={y + 3}
                textAnchor="end"
                fill="var(--chrome-text-secondary)"
                fontSize={9}
              >
                {tick}
              </text>
            </g>
          );
        })}

        {/* Reference line at 3.0 */}
        <line
          x1={MARGIN.left}
          y1={yForVal(REFERENCE_LINE)}
          x2={WIDTH - MARGIN.right}
          y2={yForVal(REFERENCE_LINE)}
          stroke="var(--chrome-text-secondary)"
          strokeWidth={1}
          strokeDasharray="4 3"
          opacity={0.4}
        />
        <text
          x={WIDTH - MARGIN.right - 2}
          y={yForVal(REFERENCE_LINE) - 4}
          textAnchor="end"
          fill="var(--chrome-text-secondary)"
          fontSize={8}
          opacity={0.6}
        >
          solid content
        </text>

        {/* X-axis labels (every 3rd week) */}
        {weekKeys.map((wk, i) => {
          if (i % 3 !== 0 && i !== weekKeys.length - 1) return null;
          return (
            <text
              key={wk}
              x={xForWeek(i)}
              y={HEIGHT - 4}
              textAnchor="middle"
              fill="var(--chrome-text-secondary)"
              fontSize={9}
            >
              {formatWeekLabel(wk)}
            </text>
          );
        })}

        {/* Child lines */}
        <g clipPath={`url(#${clipId})`}>
          {childLines.map((line) => (
            <g key={line.childId}>
              <path d={buildPath(line.points)} fill="none" stroke={line.color} strokeWidth={1.5} />
              {line.points.map((pt, i) => {
                if (isNaN(pt.avg)) return null;
                return (
                  <circle
                    key={i}
                    cx={xForWeek(i)}
                    cy={yForVal(pt.avg)}
                    r={2.5}
                    fill={line.color}
                    stroke="var(--chrome-surface)"
                    strokeWidth={1}
                  />
                );
              })}
            </g>
          ))}
        </g>

        {/* Invisible overlay for mouse + touch tracking */}
        <rect
          x={MARGIN.left} y={MARGIN.top} width={PLOT_W} height={PLOT_H}
          fill="transparent"
          style={touchOverlayStyle(isTouching)}
          {...bindOverlay}
        />

        {/* Crosshair + tooltip on hover */}
        {hoverWeekIdx !== null && (
          <>
            <line
              x1={xForWeek(hoverWeekIdx)}
              y1={MARGIN.top}
              x2={xForWeek(hoverWeekIdx)}
              y2={MARGIN.top + PLOT_H}
              stroke="var(--chrome-text-secondary)"
              strokeWidth={0.5}
              strokeDasharray="2 2"
              opacity={0.6}
            />
            {childLines.map((line) => {
              const pt = line.points[hoverWeekIdx];
              if (!pt || isNaN(pt.avg)) return null;
              return (
                <circle
                  key={line.childId}
                  cx={xForWeek(hoverWeekIdx)}
                  cy={yForVal(pt.avg)}
                  r={4}
                  fill={line.color}
                  stroke="var(--chrome-surface)"
                  strokeWidth={1.5}
                />
              );
            })}
          </>
        )}
      </svg>

      {/* Tooltip panel below chart */}
      {hoverWeekIdx !== null && hoveredWeekKey && (
        <div
          style={{
            backgroundColor: 'var(--chrome-bg)',
            border: '1px solid var(--chrome-border)',
            borderRadius: 8,
            padding: '6px 10px',
            marginTop: 4,
            fontSize: 11,
          }}
        >
          <div style={{ color: 'var(--chrome-text-secondary)', marginBottom: 4 }}>
            Week of {formatWeekLabel(hoveredWeekKey)}
          </div>
          {childLines.map((line) => {
            const pt = line.points[hoverWeekIdx!];
            if (!pt || isNaN(pt.avg)) return null;
            return (
              <div
                key={line.childId}
                style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}
              >
                <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: line.color }} />
                <span style={{ color: 'var(--chrome-text)' }}>{line.name}</span>
                <span style={{ color: line.color, fontWeight: 600, marginLeft: 'auto' }}>
                  {pt.avg.toFixed(1)} stars
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
