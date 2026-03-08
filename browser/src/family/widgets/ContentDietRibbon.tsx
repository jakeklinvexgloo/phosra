import React, { useState, useMemo, useCallback } from 'react';
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
const OTHER_COLOR = '#52525b';

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

/** Generate a stable date key from a Date */
function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

interface ContentDietRibbonProps {
  childData: ChildViewingData[];
  reviews?: Map<string, CSMReviewLookup>;
}

export default function ContentDietRibbon({ childData, reviews }: ContentDietRibbonProps) {
  const [selectedChildIdx, setSelectedChildIdx] = useState(0);

  const NUM_WEEKS = 12;
  const L = 12, R = 12, T = 16, B = 32;
  const W = 640, H = 220;
  const plotW = W - L - R;
  const plotH = H - T - B;
  const GAP = 2;

  const child = childData[selectedChildIdx] ?? childData[0];

  const { weekStarts, weekColumns, seriesColorMap, seriesOrder, maxEpisodes } = useMemo(() => {
    if (!child) {
      return {
        weekStarts: [],
        weekColumns: [],
        seriesColorMap: new Map<string, string>(),
        seriesOrder: [],
        maxEpisodes: 0,
      };
    }

    const today = new Date();
    const weekStarts = getWeekStarts(today, NUM_WEEKS);

    // Bucket entries by week -> series -> count
    type WeekColumn = {
      weekIdx: number;
      total: number;
      diversityScore: number;
      segments: { series: string; count: number }[];
    };

    const weekColumns: WeekColumn[] = [];

    // Global series count across all weeks (to pick top 6)
    const globalSeriesCount = new Map<string, number>();

    // First pass: collect per-week series counts
    const weekSeriesMaps: Map<string, number>[] = [];

    for (let w = 0; w < NUM_WEEKS; w++) {
      const weekStart = weekStarts[w];
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      const seriesMap = new Map<string, number>();

      for (const entry of child.entries) {
        const d = parseNetflixDate(entry.date);
        if (d >= weekStart && d < weekEnd) {
          const series = entry.seriesTitle || entry.title;
          const count = (seriesMap.get(series) ?? 0) + 1;
          seriesMap.set(series, count);
          globalSeriesCount.set(series, (globalSeriesCount.get(series) ?? 0) + 1);
        }
      }

      weekSeriesMaps.push(seriesMap);
    }

    // Determine top 6 series globally
    const sortedSeries = Array.from(globalSeriesCount.entries())
      .sort((a, b) => b[1] - a[1]);
    const top6 = sortedSeries.slice(0, 6).map(s => s[0]);

    // Assign colors to top 6
    const seriesColorMap = new Map<string, string>();
    top6.forEach((s, i) => {
      seriesColorMap.set(s, CHILD_COLORS[i % CHILD_COLORS.length]);
    });

    // Second pass: build week columns with segments
    let maxEpisodes = 0;

    for (let w = 0; w < NUM_WEEKS; w++) {
      const seriesMap = weekSeriesMaps[w];
      const total = Array.from(seriesMap.values()).reduce((a, b) => a + b, 0);
      maxEpisodes = Math.max(maxEpisodes, total);

      const segments: { series: string; count: number }[] = [];
      let otherCount = 0;

      // Add top 6 series in order
      for (const s of top6) {
        const count = seriesMap.get(s) ?? 0;
        if (count > 0) {
          segments.push({ series: s, count });
        }
      }

      // Collect "Other"
      for (const [s, count] of seriesMap) {
        if (!top6.includes(s)) {
          otherCount += count;
        }
      }
      if (otherCount > 0) {
        segments.push({ series: 'Other', count: otherCount });
      }

      weekColumns.push({
        weekIdx: w,
        total,
        diversityScore: seriesMap.size,
        segments,
      });
    }

    const seriesOrder = [...top6];
    if (sortedSeries.length > 6) {
      seriesOrder.push('Other');
    }

    return { weekStarts, weekColumns, seriesColorMap, seriesOrder, maxEpisodes };
  }, [child, NUM_WEEKS]);

  const colWidth = Math.max(1, (plotW / NUM_WEEKS) - GAP);

  // Touch-friendly slide interaction for crosshair
  const weekResolver = useCallback(
    (rect: DOMRect, point: { clientX: number; clientY: number }) => {
      const relX = point.clientX - rect.left;
      const fraction = relX / rect.width;
      return Math.min(NUM_WEEKS - 1, Math.max(0, Math.floor(fraction * NUM_WEEKS)));
    },
    []
  );
  const { active: hoveredWeek, bindOverlay, bindContainer, isTouching } =
    useTouchInteraction<number>('slide', weekResolver);

  if (!child) return null;

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
      <div className="flex items-center justify-between mb-3">
        <h3
          className="text-sm font-semibold"
          style={{ color: 'var(--chrome-text)' }}
        >
          Content Diet
        </h3>

        {/* Child toggle buttons */}
        {childData.length > 1 && (
          <div className="flex gap-1">
            {childData.map((c, idx) => {
              const color = CHILD_COLORS[idx % CHILD_COLORS.length];
              const isActive = idx === selectedChildIdx;
              return (
                <button
                  key={c.childId}
                  onClick={() => setSelectedChildIdx(idx)}
                  className="flex items-center gap-1 text-xs px-2 py-1 rounded-md transition-all cursor-pointer border-none"
                  style={{
                    backgroundColor: isActive ? `${color}22` : 'transparent',
                    color: isActive ? color : 'var(--chrome-text-secondary)',
                    outline: isActive ? `1px solid ${color}44` : 'none',
                  }}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: color, opacity: isActive ? 1 : 0.4 }}
                  />
                  {c.childName}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
        <defs>
          <clipPath id="contentDietRibbon-clip">
            <rect x={L} y={T} width={plotW} height={plotH} />
          </clipPath>
        </defs>

        <g clipPath="url(#contentDietRibbon-clip)">
          {weekColumns.map((col, w) => {
            if (col.total === 0) return null;

            const colX = L + w * (colWidth + GAP);
            const colHeight = maxEpisodes > 0
              ? (col.total / maxEpisodes) * plotH
              : 0;
            const colTop = T + plotH - colHeight;

            // Stack segments proportionally
            let currentY = colTop;
            const isHov = hoveredWeek === w;

            return (
              <g key={`col-${w}`}>
                {col.segments.map((seg, s) => {
                  const segHeight = (seg.count / col.total) * colHeight;
                  const fill = seg.series === 'Other'
                    ? OTHER_COLOR
                    : (seriesColorMap.get(seg.series) ?? OTHER_COLOR);
                  const y = currentY;
                  currentY += segHeight;

                  return (
                    <rect
                      key={`seg-${w}-${s}`}
                      x={colX}
                      y={y}
                      width={colWidth}
                      height={Math.max(0.5, segHeight)}
                      fill={fill}
                      opacity={isHov ? 0.95 : 0.7}
                      rx={s === 0 ? 2 : 0}
                      style={{ transition: 'opacity 0.15s ease' }}
                    />
                  );
                })}

                {/* Diversity score above column */}
                <text
                  x={colX + colWidth / 2}
                  y={colTop - 4}
                  textAnchor="middle"
                  fontSize="8"
                  fontWeight="600"
                  fill="var(--chrome-text-secondary)"
                  opacity={0.7}
                >
                  {col.diversityScore}
                </text>
              </g>
            );
          })}
        </g>

        {/* X-axis week labels */}
        {weekStarts.map((ws, w) => (
          <text
            key={`x-${w}`}
            x={L + w * (colWidth + GAP) + colWidth / 2}
            y={H - B + 14}
            textAnchor="middle"
            fontSize="8"
            fill="var(--chrome-text-secondary)"
          >
            {ws.toLocaleDateString('en', { month: 'short', day: 'numeric' })}
          </text>
        ))}

        {/* Hover tooltip */}
        {hoveredWeek !== null && weekColumns[hoveredWeek] && weekColumns[hoveredWeek].total > 0 && (() => {
          const col = weekColumns[hoveredWeek];
          const colX = L + hoveredWeek * (colWidth + GAP) + colWidth / 2;
          const tooltipW = 140;
          const tooltipX = colX > W / 2 ? colX - tooltipW - 8 : colX + 8;
          const tooltipH = 18 + col.segments.length * 14;
          const weekLabel = weekStarts[hoveredWeek]?.toLocaleDateString('en', {
            month: 'short',
            day: 'numeric',
          });

          return (
            <g>
              <rect
                x={tooltipX} y={T}
                width={tooltipW} height={tooltipH}
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
                {weekLabel} -- {col.total} ep{col.total !== 1 ? 's' : ''}
              </text>
              {col.segments.map((seg, i) => {
                const fill = seg.series === 'Other'
                  ? OTHER_COLOR
                  : (seriesColorMap.get(seg.series) ?? OTHER_COLOR);
                return (
                  <g key={`tip-${i}`}>
                    <rect
                      x={tooltipX + 8}
                      y={T + 20 + i * 14}
                      width={8} height={8}
                      rx={1}
                      fill={fill}
                    />
                    <text
                      x={tooltipX + 20}
                      y={T + 24 + i * 14}
                      fontSize="8"
                      dominantBaseline="central"
                      fill="var(--chrome-text-secondary)"
                    >
                      {seg.series.length > 16
                        ? seg.series.slice(0, 15) + '...'
                        : seg.series}{' '}
                      ({seg.count})
                    </text>
                  </g>
                );
              })}
            </g>
          );
        })()}

        {/* Invisible overlay for mouse + touch tracking */}
        <rect
          x={L} y={T} width={plotW} height={plotH}
          fill="transparent"
          style={touchOverlayStyle(isTouching)}
          {...bindOverlay}
        />
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-3">
        {seriesOrder.map(series => {
          const fill = series === 'Other'
            ? OTHER_COLOR
            : (seriesColorMap.get(series) ?? OTHER_COLOR);
          return (
            <div
              key={series}
              className="flex items-center gap-1.5 text-xs"
              style={{ color: 'var(--chrome-text-secondary)' }}
            >
              <span
                className="w-2.5 h-2.5 rounded-sm shrink-0"
                style={{ backgroundColor: fill }}
              />
              {series.length > 20 ? series.slice(0, 19) + '...' : series}
            </div>
          );
        })}
      </div>
    </div>
  );
}
