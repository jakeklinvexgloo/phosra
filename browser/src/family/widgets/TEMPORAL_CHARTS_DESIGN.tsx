/**
 * TEMPORAL CHARTS — SVG Implementation Design
 * =============================================
 *
 * 5 pure-SVG React chart components for the Family Dashboard.
 * No D3, no Recharts — just inline SVG with React state.
 *
 * Shared conventions (matching existing widgets like ContentRadar, AgeRatingDrift):
 *   - CSS vars: --chrome-bg, --chrome-surface, --chrome-text, --chrome-text-secondary, --chrome-border
 *   - CHILD_COLORS: ['#2dd4bf','#60a5fa','#f472b6','#a78bfa','#fbbf24','#34d399','#f87171','#818cf8']
 *   - Wrapper: rounded-xl p-5, bg var(--chrome-surface), 1px solid var(--chrome-border)
 *   - Font sizes: 9-11px for labels, CSS transitions for hover (0.2s ease)
 *   - Data source: ViewingEntry[] = { title, date, seriesTitle? }[]
 *   - useMemo for all data transforms, useState for hover/interaction
 */

import React, { useState, useMemo, useCallback } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Shared types & utilities
// ─────────────────────────────────────────────────────────────────────────────

interface ViewingEntry {
  title: string;
  date: string;           // ISO date string "2026-01-15"
  seriesTitle?: string;
  ageMin?: number;        // from CSM review lookup
  contentType?: string;   // "movie" | "series" | "special"
}

interface ChildData {
  childId: string;
  name: string;
  age: number;
  color: string;          // from CHILD_COLORS[idx]
  entries: ViewingEntry[];
}

const CHILD_COLORS = ['#2dd4bf', '#60a5fa', '#f472b6', '#a78bfa', '#fbbf24', '#34d399', '#f87171', '#818cf8'];

/** Parse "2026-01-15" to Date, memoize-safe */
function parseDate(iso: string): Date {
  return new Date(iso + 'T00:00:00');
}

/** Get ISO date string for a Date (YYYY-MM-DD) */
function toDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Get Monday-based week start for a date */
function getWeekStart(d: Date): Date {
  const copy = new Date(d);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Monday = 0
  copy.setDate(copy.getDate() + diff);
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
// 1. ACTIVITY HEATMAP (GitHub-style)
// ─────────────────────────────────────────────────────────────────────────────
//
// viewBox: "0 0 720 120"
// Grid: 52 columns (weeks) x 7 rows (days, Mon=0 to Sun=6)
// Cell size: 11x11px with 2px gap = 13px pitch
// Left margin: 24px (for day labels: M, W, F)
// Bottom margin: 16px (for month labels)
//
// SVG math:
//   cellSize = 11, gap = 2, pitch = 13
//   gridWidth = 52 * pitch = 676 → fits in 720 with 24px left margin + 20px right
//   gridHeight = 7 * pitch = 91 → fits in 120 with ~13px top + 16px bottom for month labels
//   cellX(week) = LEFT_MARGIN + week * pitch
//   cellY(day)  = TOP_MARGIN + day * pitch
//
// Color intensity mapping (teal scale):
//   0 episodes  → var(--chrome-bg) or #1a1b1e (empty cell, subtle border)
//   1-2         → teal at 25% opacity (#2dd4bf40)
//   3-5         → teal at 55% opacity (#2dd4bf8c)
//   6+          → teal at 90% opacity (#2dd4bfe6)
//
// Data transform:
//   1. Build Map<dateKey, count> from entries
//   2. Determine 52-week window ending today
//   3. For each cell, lookup count from map
//
// Hover: useState<{week: number, day: number} | null>
//   On hover → show tooltip rect + text above cell with "Jan 15: 4 episodes"
//
// Performance: Only 364 rects max. No concern at this scale.
//   Use a single useMemo to build the 52x7 grid data.
//   Tooltip is conditionally rendered (1 element).

export function ActivityHeatmap({ childData, mode }: {
  childData: ChildData[];
  mode: 'family' | string; // 'family' or childId
}) {
  const [hovered, setHovered] = useState<{ week: number; day: number; date: string; count: number } | null>(null);

  const CELL = 11, GAP = 2, PITCH = 13;
  const LEFT = 24, TOP = 10, WEEKS = 52;
  const WIDTH = 720, HEIGHT = 120;

  // Step 1: aggregate entries into date→count map
  const { grid, monthLabels } = useMemo(() => {
    // Merge entries based on mode
    const entries = mode === 'family'
      ? childData.flatMap(c => c.entries)
      : childData.find(c => c.childId === mode)?.entries ?? [];

    const countMap = new Map<string, number>();
    for (const e of entries) {
      const key = e.date.slice(0, 10);
      countMap.set(key, (countMap.get(key) ?? 0) + 1);
    }

    // Step 2: compute 52-week window
    const today = new Date();
    const endWeekStart = getWeekStart(today);

    // Build grid[week][day] = { date, count }
    const grid: { date: string; count: number }[][] = [];
    const months: { label: string; weekIdx: number }[] = [];
    let lastMonth = -1;

    for (let w = 0; w < WEEKS; w++) {
      const weekData: { date: string; count: number }[] = [];
      for (let d = 0; d < 7; d++) {
        const cellDate = new Date(endWeekStart);
        cellDate.setDate(cellDate.getDate() - (WEEKS - 1 - w) * 7 + d);
        const key = toDateKey(cellDate);
        weekData.push({ date: key, count: countMap.get(key) ?? 0 });

        // Track month transitions for labels
        if (d === 0) {
          const m = cellDate.getMonth();
          if (m !== lastMonth) {
            months.push({
              label: cellDate.toLocaleString('en', { month: 'short' }),
              weekIdx: w,
            });
            lastMonth = m;
          }
        }
      }
      grid.push(weekData);
    }

    return { grid, monthLabels: months };
  }, [childData, mode]);

  // Step 3: color intensity function
  function cellFill(count: number): string {
    if (count === 0) return 'var(--chrome-bg)';
    if (count <= 2) return 'rgba(45,212,191,0.25)';  // teal 25%
    if (count <= 5) return 'rgba(45,212,191,0.55)';  // teal 55%
    return 'rgba(45,212,191,0.9)';                     // teal 90%
  }

  const DAY_LABELS = ['', 'M', '', 'W', '', 'F', ''];

  return (
    <div className="rounded-xl p-5" style={{ backgroundColor: 'var(--chrome-surface)', border: '1px solid var(--chrome-border)' }}>
      <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--chrome-text)' }}>
        Activity Heatmap
      </h3>

      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width="100%" style={{ display: 'block' }}>
        {/* Day-of-week labels (left edge) */}
        {DAY_LABELS.map((label, d) => label ? (
          <text
            key={`day-${d}`}
            x={LEFT - 6}
            y={TOP + d * PITCH + CELL / 2}
            textAnchor="end"
            dominantBaseline="central"
            fontSize="9"
            fill="var(--chrome-text-secondary)"
          >
            {label}
          </text>
        ) : null)}

        {/* Grid cells — 52 x 7 = 364 rects */}
        {grid.map((week, w) =>
          week.map((cell, d) => (
            <rect
              key={`${w}-${d}`}
              x={LEFT + w * PITCH}
              y={TOP + d * PITCH}
              width={CELL}
              height={CELL}
              rx={2}
              fill={cellFill(cell.count)}
              stroke="var(--chrome-border)"
              strokeWidth={0.5}
              style={{ transition: 'fill 0.15s' }}
              onMouseEnter={() => setHovered({ week: w, day: d, date: cell.date, count: cell.count })}
              onMouseLeave={() => setHovered(null)}
            />
          ))
        )}

        {/* Month labels along bottom */}
        {monthLabels.map((m, i) => (
          <text
            key={`month-${i}`}
            x={LEFT + m.weekIdx * PITCH}
            y={TOP + 7 * PITCH + 12}
            fontSize="9"
            fill="var(--chrome-text-secondary)"
          >
            {m.label}
          </text>
        ))}

        {/* Tooltip — single floating element */}
        {hovered && (() => {
          const tx = LEFT + hovered.week * PITCH + CELL / 2;
          const ty = TOP + hovered.day * PITCH - 6;
          const label = `${hovered.date}: ${hovered.count} ep${hovered.count !== 1 ? 's' : ''}`;
          const textWidth = label.length * 5.5;
          // Clamp tooltip X so it doesn't overflow viewBox
          const boxX = Math.max(2, Math.min(tx - textWidth / 2 - 4, WIDTH - textWidth - 8));
          return (
            <g>
              <rect x={boxX} y={ty - 14} width={textWidth + 8} height={16} rx={4}
                fill="var(--chrome-bg)" stroke="var(--chrome-border)" strokeWidth={1} />
              <text x={boxX + 4} y={ty - 4} fontSize="9" fill="var(--chrome-text)"
                dominantBaseline="middle">
                {label}
              </text>
            </g>
          );
        })()}
      </svg>
    </div>
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// 2. STACKED AREA CHART (Episodes Over Time)
// ─────────────────────────────────────────────────────────────────────────────
//
// viewBox: "0 0 640 240"
// Margins: left=48 (y-axis labels), right=16, top=16, bottom=32 (x-axis labels)
// Plot area: 576 x 192
//
// X-axis: 12 weeks (or custom range), each tick = one week-start date
// Y-axis: episode count (auto-scaled, 0 to max stacked total, ticks at nice intervals)
//
// Data transform:
//   1. For each child, bucket entries by week → Map<weekKey, count>
//   2. Build stacked arrays: for each week, stack children bottom-to-top
//      stackedY[childIdx][weekIdx] = sum of all children below + own count
//   3. Generate SVG <path> d-strings for each child's area
//
// Catmull-Rom spline interpolation:
//   For smooth curves, use Catmull-Rom → cubic Bezier conversion.
//   Given points P0, P1, P2, P3 and tension alpha=0.5:
//     Control points for segment P1→P2:
//       cp1x = P1.x + (P2.x - P0.x) / (6 * alpha)
//       cp1y = P1.y + (P2.y - P0.y) / (6 * alpha)
//       cp2x = P2.x - (P3.x - P1.x) / (6 * alpha)
//       cp2y = P2.y - (P3.y - P1.y) / (6 * alpha)
//     SVG: C cp1x,cp1y cp2x,cp2y P2.x,P2.y
//
// Hover crosshair:
//   useState<number | null> for hoveredWeekIdx
//   On mousemove over plot area: compute nearest week index from clientX
//   Render vertical line + per-child breakdown tooltip
//
// Key SVG elements:
//   - <defs><clipPath> for plot area clipping
//   - One <path> per child (filled area, bottom = previous child's top line)
//   - <line> for crosshair
//   - <rect> invisible overlay for mouse tracking (pointer-events: all)
//   - <text> for axis labels
//
// Animation: CSS transition on path opacity (0.2s) for legend hover highlighting
// Performance: 12 weeks x N children = small dataset. Spline math in useMemo.

export function StackedAreaChart({ childData, numWeeks = 12 }: {
  childData: ChildData[];
  numWeeks?: number;
}) {
  const [hoveredWeek, setHoveredWeek] = useState<number | null>(null);
  const [highlightedChild, setHighlightedChild] = useState<string | null>(null);

  const L = 48, R = 16, T = 16, B = 32; // margins
  const W = 640, H = 240;
  const plotW = W - L - R;  // 576
  const plotH = H - T - B;  // 192

  const { weekStarts, stacked, maxY, yTicks, childOrder } = useMemo(() => {
    const today = new Date();
    const weekStarts = getWeekStarts(today, numWeeks);

    // Bucket each child's entries by week
    const childWeekCounts: Map<string, number[]> = new Map();
    const childOrder = childData.map(c => c.childId);

    for (const child of childData) {
      const counts = new Array(numWeeks).fill(0);
      for (const entry of child.entries) {
        const entryDate = parseDate(entry.date);
        // Find which week bucket this falls into
        for (let w = numWeeks - 1; w >= 0; w--) {
          if (entryDate >= weekStarts[w]) {
            counts[w]++;
            break;
          }
        }
      }
      childWeekCounts.set(child.childId, counts);
    }

    // Build stacked values: stacked[childIdx][weekIdx] = { y0 (bottom), y1 (top) }
    const stacked: { y0: number; y1: number }[][] = [];
    let maxY = 0;

    for (let c = 0; c < childData.length; c++) {
      const counts = childWeekCounts.get(childData[c].childId) ?? new Array(numWeeks).fill(0);
      const layer: { y0: number; y1: number }[] = [];

      for (let w = 0; w < numWeeks; w++) {
        const y0 = c === 0 ? 0 : stacked[c - 1][w].y1;
        const y1 = y0 + counts[w];
        layer.push({ y0, y1 });
        maxY = Math.max(maxY, y1);
      }
      stacked.push(layer);
    }

    // Nice y-axis ticks
    const rawStep = maxY / 4;
    const step = rawStep <= 1 ? 1 : rawStep <= 5 ? 5 : Math.ceil(rawStep / 5) * 5;
    const yTicks: number[] = [];
    for (let v = 0; v <= maxY; v += step) yTicks.push(v);
    if (yTicks[yTicks.length - 1] < maxY) yTicks.push(yTicks[yTicks.length - 1] + step);
    maxY = yTicks[yTicks.length - 1] || 1; // avoid division by zero

    return { weekStarts, stacked, maxY, yTicks, childOrder };
  }, [childData, numWeeks]);

  // Coordinate transforms
  const xForWeek = (w: number) => L + (w / (numWeeks - 1)) * plotW;
  const yForVal = (v: number) => T + plotH - (v / maxY) * plotH;

  // Catmull-Rom to cubic bezier path generation
  function catmullRomPath(points: { x: number; y: number }[]): string {
    if (points.length < 2) return '';
    const alpha = 6; // tension divisor (higher = less curvy, 6 is standard)

    let d = `M ${points[0].x},${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[Math.max(0, i - 1)];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[Math.min(points.length - 1, i + 2)];

      const cp1x = p1.x + (p2.x - p0.x) / alpha;
      const cp1y = p1.y + (p2.y - p0.y) / alpha;
      const cp2x = p2.x - (p3.x - p1.x) / alpha;
      const cp2y = p2.y - (p3.y - p1.y) / alpha;

      d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
    }
    return d;
  }

  // Build area path for each child (top line forward, bottom line backward)
  function areaPath(childIdx: number): string {
    const topPoints = stacked[childIdx].map((s, w) => ({ x: xForWeek(w), y: yForVal(s.y1) }));
    const botPoints = stacked[childIdx].map((s, w) => ({ x: xForWeek(w), y: yForVal(s.y0) }));

    const topPath = catmullRomPath(topPoints);
    // Reverse bottom points for closing the area
    const botReversed = [...botPoints].reverse();
    const botPath = catmullRomPath(botReversed);

    // Connect: top line → line to last bottom point → bottom line reversed → close
    return `${topPath} L ${botReversed[0].x},${botReversed[0].y} ${botPath.replace(/^M [^C]+/, '')} Z`;
  }

  // Mouse tracking: convert clientX to week index
  const handleMouseMove = useCallback((e: React.MouseEvent<SVGRectElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const fraction = relX / rect.width;
    const weekIdx = Math.round(fraction * (numWeeks - 1));
    setHoveredWeek(Math.max(0, Math.min(numWeeks - 1, weekIdx)));
  }, [numWeeks]);

  return (
    <div className="rounded-xl p-5" style={{ backgroundColor: 'var(--chrome-surface)', border: '1px solid var(--chrome-border)' }}>
      <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--chrome-text)' }}>
        Episodes Over Time
      </h3>

      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
        <defs>
          <clipPath id="plot-clip">
            <rect x={L} y={T} width={plotW} height={plotH} />
          </clipPath>
        </defs>

        {/* Y-axis grid lines + labels */}
        {yTicks.map(v => (
          <g key={`y-${v}`}>
            <line x1={L} y1={yForVal(v)} x2={L + plotW} y2={yForVal(v)}
              stroke="var(--chrome-border)" strokeWidth={0.5} />
            <text x={L - 6} y={yForVal(v)} textAnchor="end" dominantBaseline="central"
              fontSize="9" fill="var(--chrome-text-secondary)">
              {v}
            </text>
          </g>
        ))}

        {/* X-axis week labels (every 2nd week to avoid crowding) */}
        {weekStarts.map((ws, w) => w % 2 === 0 ? (
          <text key={`x-${w}`} x={xForWeek(w)} y={H - B + 14}
            textAnchor="middle" fontSize="9" fill="var(--chrome-text-secondary)">
            {ws.toLocaleDateString('en', { month: 'short', day: 'numeric' })}
          </text>
        ) : null)}

        {/* Stacked area paths — rendered bottom-to-top */}
        <g clipPath="url(#plot-clip)">
          {childData.map((child, idx) => {
            const isHighlighted = highlightedChild === null || highlightedChild === child.childId;
            return (
              <path
                key={child.childId}
                d={areaPath(idx)}
                fill={child.color}
                fillOpacity={isHighlighted ? 0.4 : 0.1}
                stroke={child.color}
                strokeWidth={isHighlighted ? 1.5 : 0.5}
                strokeOpacity={isHighlighted ? 0.8 : 0.2}
                style={{ transition: 'fill-opacity 0.2s, stroke-opacity 0.2s' }}
              />
            );
          })}
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
            {/* Per-child dots on crosshair */}
            {childData.map((child, idx) => (
              <circle
                key={child.childId}
                cx={xForWeek(hoveredWeek)}
                cy={yForVal(stacked[idx][hoveredWeek].y1)}
                r={3}
                fill={child.color}
                stroke="var(--chrome-bg)"
                strokeWidth={1.5}
              />
            ))}
            {/* Tooltip box */}
            {(() => {
              const tx = xForWeek(hoveredWeek);
              const tooltipX = tx > W / 2 ? tx - 110 : tx + 8;
              return (
                <g>
                  <rect x={tooltipX} y={T} width={100} height={14 + childData.length * 14}
                    rx={4} fill="var(--chrome-bg)" stroke="var(--chrome-border)" strokeWidth={1} />
                  <text x={tooltipX + 6} y={T + 10} fontSize="9" fontWeight="600"
                    fill="var(--chrome-text)">
                    {weekStarts[hoveredWeek]?.toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                  </text>
                  {childData.map((child, idx) => {
                    const count = stacked[idx][hoveredWeek].y1 - stacked[idx][hoveredWeek].y0;
                    return (
                      <g key={child.childId}>
                        <circle cx={tooltipX + 10} cy={T + 22 + idx * 14} r={3} fill={child.color} />
                        <text x={tooltipX + 18} y={T + 22 + idx * 14} fontSize="9"
                          dominantBaseline="central" fill="var(--chrome-text-secondary)">
                          {child.name}: {count}
                        </text>
                      </g>
                    );
                  })}
                </g>
              );
            })()}
          </g>
        )}

        {/* Invisible overlay for mouse tracking */}
        <rect
          x={L} y={T} width={plotW} height={plotH}
          fill="transparent"
          style={{ cursor: 'crosshair' }}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredWeek(null)}
        />
      </svg>

      {/* Legend (HTML, below SVG — matches ContentRadar pattern) */}
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-3">
        {childData.map(child => (
          <button
            key={child.childId}
            className="flex items-center gap-1.5 text-xs px-1 py-0.5 rounded hover:opacity-80 transition-opacity cursor-pointer bg-transparent border-none"
            style={{ color: 'var(--chrome-text)' }}
            onMouseEnter={() => setHighlightedChild(child.childId)}
            onMouseLeave={() => setHighlightedChild(null)}
          >
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: child.color }} />
            {child.name}
          </button>
        ))}
      </div>
    </div>
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// 3. EPISODE SPARKLINES (Mini inline charts)
// ─────────────────────────────────────────────────────────────────────────────
//
// viewBox: "0 0 120 24"
// No axes, no labels — pure line chart
// Size: 120x24px inline in a list row or summary card
//
// Data transform:
//   1. Last 30 days: generate array of 30 daily counts from entries
//   2. Normalize to 0..1 range (max of the 30 values)
//   3. X: evenly spaced across 120px → x(i) = (i / 29) * 116 + 2 (2px padding)
//   4. Y: inverted, y(v) = 22 - v * 20 (2px top/bottom padding)
//
// SVG elements:
//   - <path> for the sparkline (stroke only, no fill, strokeWidth=1.5)
//   - <path> for gradient fill area below line (optional, low opacity)
//   - <line> for linear regression trend line (dashed, subtle)
//   - <circle> for last data point (filled dot at rightmost value)
//
// Trend line math (linear regression):
//   Given points (x_i, y_i) for i = 0..29:
//     slope = (N * sum(x*y) - sum(x)*sum(y)) / (N * sum(x^2) - sum(x)^2)
//     intercept = (sum(y) - slope * sum(x)) / N
//   Then draw line from (0, intercept) to (29, slope*29 + intercept)
//
// Animation: none (too small, appears instantly)
// Performance: 30 points per sparkline, trivial. Render N sparklines in a list.

export function EpisodeSparkline({ entries, color = '#2dd4bf' }: {
  entries: ViewingEntry[];
  color?: string;
}) {
  const W = 120, H = 24, PAD = 2;
  const DAYS = 30;

  const { linePath, areaPath: areaD, trendLine, lastPoint, lastValue } = useMemo(() => {
    // Step 1: bucket last 30 days
    const today = new Date();
    const counts: number[] = new Array(DAYS).fill(0);

    for (const e of entries) {
      const d = parseDate(e.date);
      const daysAgo = Math.floor((today.getTime() - d.getTime()) / 86400000);
      if (daysAgo >= 0 && daysAgo < DAYS) {
        counts[DAYS - 1 - daysAgo]++;
      }
    }

    // Step 2: normalize
    const maxVal = Math.max(...counts, 1); // avoid /0

    // Step 3: compute points
    const xScale = (i: number) => PAD + (i / (DAYS - 1)) * (W - 2 * PAD);
    const yScale = (v: number) => H - PAD - (v / maxVal) * (H - 2 * PAD);

    const points = counts.map((c, i) => ({ x: xScale(i), y: yScale(c) }));

    // Line path (polyline — sparklines don't need splines at this scale)
    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

    // Area path (line + close to bottom)
    const areaPath = linePath +
      ` L ${points[points.length - 1].x.toFixed(1)},${H - PAD}` +
      ` L ${points[0].x.toFixed(1)},${H - PAD} Z`;

    // Step 4: linear regression for trend line
    const n = DAYS;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += counts[i];
      sumXY += i * counts[i];
      sumX2 += i * i;
    }
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const trendLine = {
      x1: xScale(0),
      y1: yScale(Math.max(0, intercept)),
      x2: xScale(DAYS - 1),
      y2: yScale(Math.max(0, slope * (DAYS - 1) + intercept)),
    };

    const lastPoint = points[points.length - 1];
    const lastValue = counts[counts.length - 1];

    return { linePath, areaPath: areaPath, trendLine, lastPoint, lastValue };
  }, [entries]);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={120} height={24} style={{ display: 'block' }}>
      {/* Gradient fill area */}
      <path d={areaD} fill={color} opacity={0.1} />

      {/* Trend line */}
      <line
        x1={trendLine.x1} y1={trendLine.y1}
        x2={trendLine.x2} y2={trendLine.y2}
        stroke={color} strokeWidth={0.75} strokeDasharray="2 2" opacity={0.4}
      />

      {/* Sparkline */}
      <path d={linePath} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />

      {/* Last point dot */}
      <circle cx={lastPoint.x} cy={lastPoint.y} r={2} fill={color} />
    </svg>
  );
}

/**
 * Usage in a list context:
 *
 *   <div className="flex items-center gap-3">
 *     <span className="text-xs" style={{ color: 'var(--chrome-text)' }}>{child.name}</span>
 *     <EpisodeSparkline entries={child.entries} color={child.color} />
 *     <span className="text-xs tabular-nums" style={{ color: 'var(--chrome-text-secondary)' }}>
 *       {child.entries.length} total
 *     </span>
 *   </div>
 */


// ─────────────────────────────────────────────────────────────────────────────
// 4. BINGE DETECTION TIMELINE
// ─────────────────────────────────────────────────────────────────────────────
//
// viewBox: "0 0 640 160" (dynamic height based on children count)
// Layout: horizontal swim lanes, one per child
//
// Data transform:
//   1. For each child, group entries by date → sessions = { date, count, titles[] }
//   2. Filter to last N days (default 30)
//   3. X-axis = date range, Y = swim lanes
//
// SVG math:
//   LANE_HEIGHT = 32, LANE_GAP = 8, LABEL_W = 80
//   HEADER_H = 20 (for date ticks), THRESHOLD_LABEL_W = 40
//   plotW = 640 - LABEL_W - 16
//   svgHeight = HEADER_H + childData.length * (LANE_HEIGHT + LANE_GAP) + 20
//
//   xForDate(date, minDate, maxDate) = LABEL_W + ((date - minDate) / (maxDate - minDate)) * plotW
//
//   Bubble radius: r = Math.sqrt(count) * 4, clamped to [4, 16]
//     (sqrt scaling so 1 ep = r4, 4 ep = r8, 9 ep = r12, 16 ep = r16)
//
//   Bubble color by age rating:
//     ageMin <= childAge → teal (#2dd4bf)
//     ageMin > childAge  → amber (#fbbf24)
//     unknown            → child's assigned color at 60% opacity
//
//   Binge threshold line at y=4 episodes:
//     Horizontal dashed line through all lanes at the radius that corresponds to count=4
//     Actually rendered as a label + visual cue, since bubbles are sized by count
//     Alternative: any bubble with count >= 4 gets a red (#f87171) ring/outline
//
// Hover: show tooltip with date, episode count, title list
// Animation: CSS transition on circle r (scale-in effect via transform)
// Performance: ~30 days * N children = small. One circle per session.

export function BingeTimeline({ childData, days = 30, bingeThreshold = 4 }: {
  childData: ChildData[];
  days?: number;
  bingeThreshold?: number;
}) {
  const [hovered, setHovered] = useState<{ childIdx: number; dateKey: string } | null>(null);

  const LANE_H = 32, LANE_GAP = 8, LABEL_W = 80, HEADER_H = 24;
  const W = 640;
  const plotW = W - LABEL_W - 16;
  const svgH = HEADER_H + childData.length * (LANE_H + LANE_GAP) + 8;

  const { sessions, dateRange, dateTicks } = useMemo(() => {
    const today = new Date();
    const minDate = new Date(today);
    minDate.setDate(minDate.getDate() - days);

    // For each child, build sessions
    const sessions: {
      childIdx: number;
      date: Date;
      dateKey: string;
      count: number;
      titles: string[];
      maxAgeMin: number | null;
      aboveAge: boolean;
    }[][] = [];

    for (let c = 0; c < childData.length; c++) {
      const child = childData[c];
      const dateMap = new Map<string, { count: number; titles: Set<string>; maxAge: number | null }>();

      for (const e of child.entries) {
        const d = parseDate(e.date);
        if (d < minDate || d > today) continue;
        const key = e.date.slice(0, 10);
        if (!dateMap.has(key)) dateMap.set(key, { count: 0, titles: new Set(), maxAge: null });
        const bucket = dateMap.get(key)!;
        bucket.count++;
        bucket.titles.add(e.seriesTitle || e.title);
        if (e.ageMin !== undefined) {
          bucket.maxAge = Math.max(bucket.maxAge ?? 0, e.ageMin);
        }
      }

      const childSessions = Array.from(dateMap.entries()).map(([key, data]) => ({
        childIdx: c,
        date: parseDate(key),
        dateKey: key,
        count: data.count,
        titles: Array.from(data.titles),
        maxAgeMin: data.maxAge,
        aboveAge: data.maxAge !== null && data.maxAge > child.age,
      }));

      sessions.push(childSessions);
    }

    // Date ticks: ~6 evenly spaced across the range
    const dateTicks: Date[] = [];
    const tickCount = 6;
    for (let i = 0; i <= tickCount; i++) {
      const d = new Date(minDate);
      d.setDate(d.getDate() + Math.round((i / tickCount) * days));
      dateTicks.push(d);
    }

    return { sessions, dateRange: { min: minDate, max: today }, dateTicks };
  }, [childData, days]);

  const xForDate = (d: Date) => {
    const range = dateRange.max.getTime() - dateRange.min.getTime();
    return LABEL_W + ((d.getTime() - dateRange.min.getTime()) / range) * plotW;
  };

  const bubbleRadius = (count: number) => Math.min(16, Math.max(4, Math.sqrt(count) * 4));

  return (
    <div className="rounded-xl p-5" style={{ backgroundColor: 'var(--chrome-surface)', border: '1px solid var(--chrome-border)' }}>
      <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--chrome-text)' }}>
        Binge Detection
      </h3>

      <svg viewBox={`0 0 ${W} ${svgH}`} width="100%" style={{ display: 'block' }}>
        {/* Date tick labels */}
        {dateTicks.map((d, i) => (
          <text key={`tick-${i}`} x={xForDate(d)} y={HEADER_H - 6}
            textAnchor="middle" fontSize="9" fill="var(--chrome-text-secondary)">
            {d.toLocaleDateString('en', { month: 'short', day: 'numeric' })}
          </text>
        ))}

        {/* Swim lanes */}
        {childData.map((child, c) => {
          const laneY = HEADER_H + c * (LANE_H + LANE_GAP);
          const laneCenter = laneY + LANE_H / 2;

          return (
            <g key={child.childId}>
              {/* Child label */}
              <text x={LABEL_W - 8} y={laneCenter} textAnchor="end" dominantBaseline="central"
                fontSize="11" fontWeight="600" fill="var(--chrome-text)">
                {child.name}
              </text>

              {/* Lane background */}
              <rect x={LABEL_W} y={laneY} width={plotW} height={LANE_H}
                rx={4} fill="var(--chrome-bg)" opacity={0.3} />

              {/* Binge threshold indicator — subtle dashed line across lane */}
              {/* (visual reference: bubbles at or above this size = binge) */}

              {/* Session bubbles */}
              {sessions[c]?.map(session => {
                const cx = xForDate(session.date);
                const r = bubbleRadius(session.count);
                const isBinge = session.count >= bingeThreshold;
                const isHov = hovered?.childIdx === c && hovered?.dateKey === session.dateKey;

                // Color: binge=red ring, aboveAge=amber, normal=child color
                const fillColor = session.aboveAge ? '#fbbf24' : child.color;
                const fillOpacity = isHov ? 0.9 : 0.6;

                return (
                  <g key={session.dateKey}>
                    <circle
                      cx={cx} cy={laneCenter} r={r}
                      fill={fillColor} fillOpacity={fillOpacity}
                      stroke={isBinge ? '#f87171' : 'none'}
                      strokeWidth={isBinge ? 2 : 0}
                      style={{ transition: 'r 0.2s, fill-opacity 0.15s' }}
                      onMouseEnter={() => setHovered({ childIdx: c, dateKey: session.dateKey })}
                      onMouseLeave={() => setHovered(null)}
                    />
                    {/* Count label inside larger bubbles */}
                    {r >= 8 && (
                      <text x={cx} y={laneCenter} textAnchor="middle" dominantBaseline="central"
                        fontSize="8" fontWeight="600" fill="var(--chrome-bg)">
                        {session.count}
                      </text>
                    )}

                    {/* Hover tooltip */}
                    {isHov && (
                      <g>
                        <rect x={cx - 60} y={laneY - 32} width={120} height={28}
                          rx={4} fill="var(--chrome-bg)" stroke="var(--chrome-border)" strokeWidth={1} />
                        <text x={cx} y={laneY - 22} textAnchor="middle" fontSize="9"
                          fontWeight="600" fill="var(--chrome-text)">
                          {session.dateKey}: {session.count} ep{session.count !== 1 ? 's' : ''}
                        </text>
                        <text x={cx} y={laneY - 10} textAnchor="middle" fontSize="8"
                          fill="var(--chrome-text-secondary)">
                          {session.titles.slice(0, 2).join(', ')}{session.titles.length > 2 ? '...' : ''}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </g>
          );
        })}

        {/* Legend */}
        {(() => {
          const ly = svgH - 4;
          return (
            <g>
              <circle cx={LABEL_W + 4} cy={ly - 4} r={3} fill="transparent"
                stroke="#f87171" strokeWidth={2} />
              <text x={LABEL_W + 12} y={ly - 4} dominantBaseline="central" fontSize="9"
                fill="var(--chrome-text-secondary)">
                {bingeThreshold}+ episodes = binge
              </text>
            </g>
          );
        })()}
      </svg>
    </div>
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// 5. CONTENT AGE DRIFT LINE CHART
// ─────────────────────────────────────────────────────────────────────────────
//
// viewBox: "0 0 640 280"
// Margins: L=48, R=16, T=20, B=32
// Plot area: 576 x 208
//
// X-axis: weeks (last 12 weeks)
// Y-axis: age rating (0-18, but zoomed to relevant range e.g. 2-16)
//
// Data transform:
//   1. For each child, for each week:
//      - Collect all entries in that week that have ageMin from CSM review
//      - Compute weighted average: sum(ageMin * episodeCount) / totalEpisodes
//      - If no data for a week, leave gap (don't interpolate)
//   2. Child's actual age = horizontal reference line
//
// SVG math:
//   xForWeek(w) = L + (w / (numWeeks - 1)) * plotW
//   yForAge(age) = T + plotH - ((age - minAge) / (maxAge - minAge)) * plotH
//
//   Amber zone shading: <rect> from y(childAge) to y=T (top of chart)
//     with amber fill at ~8% opacity, per child
//     Actually: one shared amber zone above max child age, or per-child with clipPath
//     Simpler: for each child, draw a semi-transparent rect from their age line to top
//
// Key SVG elements:
//   - Per-child: <path> line (Catmull-Rom smoothed), <circle> data points
//   - Per-child: horizontal dashed <line> at their actual age
//   - Amber shading: <rect> above each child's age line (very low opacity, layered)
//   - Y-axis: age ticks, X-axis: week labels
//
// Hover: crosshair at week, showing each child's avg age rating that week
// Animation: CSS transition on path stroke-dashoffset for draw-in effect (optional)
// Performance: 12 weeks * N children = trivial

export function ContentAgeDriftChart({ childData, numWeeks = 12 }: {
  childData: ChildData[];
  numWeeks?: number;
}) {
  const [hoveredWeek, setHoveredWeek] = useState<number | null>(null);

  const L = 48, R = 16, T = 20, B = 32;
  const W = 640, H = 280;
  const plotW = W - L - R;
  const plotH = H - T - B;

  const { weekStarts, childLines, yDomain } = useMemo(() => {
    const today = new Date();
    const weekStarts = getWeekStarts(today, numWeeks);

    // Determine y-axis domain from all children's ages and data
    let globalMinAge = 18, globalMaxAge = 0;
    for (const child of childData) {
      globalMinAge = Math.min(globalMinAge, child.age - 2);
      globalMaxAge = Math.max(globalMaxAge, child.age + 4);
    }

    const childLines: {
      childId: string;
      name: string;
      age: number;
      color: string;
      weeklyAvg: (number | null)[];
    }[] = [];

    for (const child of childData) {
      const weeklyAvg: (number | null)[] = [];

      for (let w = 0; w < numWeeks; w++) {
        const weekStart = weekStarts[w];
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);

        // Filter entries in this week that have ageMin
        let sumAge = 0, count = 0;
        for (const e of child.entries) {
          const d = parseDate(e.date);
          if (d >= weekStart && d < weekEnd && e.ageMin !== undefined) {
            sumAge += e.ageMin;
            count++;
          }
        }

        if (count > 0) {
          const avg = sumAge / count;
          weeklyAvg.push(avg);
          globalMinAge = Math.min(globalMinAge, avg - 1);
          globalMaxAge = Math.max(globalMaxAge, avg + 1);
        } else {
          weeklyAvg.push(null);
        }
      }

      childLines.push({
        childId: child.childId,
        name: child.name,
        age: child.age,
        color: child.color,
        weeklyAvg,
      });
    }

    // Clamp domain
    globalMinAge = Math.max(0, Math.floor(globalMinAge));
    globalMaxAge = Math.min(18, Math.ceil(globalMaxAge));

    return { weekStarts, childLines, yDomain: { min: globalMinAge, max: globalMaxAge } };
  }, [childData, numWeeks]);

  const xForWeek = (w: number) => L + (w / (numWeeks - 1)) * plotW;
  const yForAge = (age: number) => T + plotH - ((age - yDomain.min) / (yDomain.max - yDomain.min)) * plotH;

  // Build line path for a child (skip nulls — break the line)
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
        d += `M ${x},${y} `;
        inSegment = true;
      } else {
        d += `L ${x},${y} `;
      }
    }
    return d;
  }

  // Y-axis ticks (every 2 years)
  const yTicks: number[] = [];
  for (let a = yDomain.min; a <= yDomain.max; a += 2) yTicks.push(a);

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGRectElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const fraction = relX / rect.width;
    const weekIdx = Math.round(fraction * (numWeeks - 1));
    setHoveredWeek(Math.max(0, Math.min(numWeeks - 1, weekIdx)));
  }, [numWeeks]);

  return (
    <div className="rounded-xl p-5" style={{ backgroundColor: 'var(--chrome-surface)', border: '1px solid var(--chrome-border)' }}>
      <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--chrome-text)' }}>
        Content Age Drift
      </h3>

      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
        <defs>
          <clipPath id="drift-clip">
            <rect x={L} y={T} width={plotW} height={plotH} />
          </clipPath>
        </defs>

        {/* Y-axis grid + labels */}
        {yTicks.map(age => (
          <g key={`y-${age}`}>
            <line x1={L} y1={yForAge(age)} x2={L + plotW} y2={yForAge(age)}
              stroke="var(--chrome-border)" strokeWidth={0.5} />
            <text x={L - 6} y={yForAge(age)} textAnchor="end" dominantBaseline="central"
              fontSize="9" fill="var(--chrome-text-secondary)">
              {age}+
            </text>
          </g>
        ))}

        {/* X-axis labels */}
        {weekStarts.map((ws, w) => w % 2 === 0 ? (
          <text key={`x-${w}`} x={xForWeek(w)} y={H - B + 14}
            textAnchor="middle" fontSize="9" fill="var(--chrome-text-secondary)">
            {ws.toLocaleDateString('en', { month: 'short', day: 'numeric' })}
          </text>
        ) : null)}

        <g clipPath="url(#drift-clip)">
          {/* Amber zone: shading ABOVE each child's age line */}
          {childLines.map(child => (
            <rect
              key={`zone-${child.childId}`}
              x={L} y={T}
              width={plotW}
              height={yForAge(child.age) - T}
              fill="#fbbf24"
              opacity={0.04}
            />
          ))}

          {/* Per-child actual age reference line (horizontal dashed) */}
          {childLines.map(child => (
            <g key={`ref-${child.childId}`}>
              <line
                x1={L} y1={yForAge(child.age)}
                x2={L + plotW} y2={yForAge(child.age)}
                stroke={child.color} strokeWidth={1}
                strokeDasharray="4 3" opacity={0.5}
              />
              {/* Label at right edge */}
              <text
                x={L + plotW + 2} y={yForAge(child.age)}
                dominantBaseline="central" fontSize="8"
                fill={child.color} opacity={0.7}>
                {child.name} ({child.age})
              </text>
            </g>
          ))}

          {/* Data lines */}
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

          {/* Data point dots */}
          {childLines.map(child =>
            child.weeklyAvg.map((v, w) => v !== null ? (
              <circle
                key={`dot-${child.childId}-${w}`}
                cx={xForWeek(w)} cy={yForAge(v)}
                r={3}
                fill={v > child.age ? '#fbbf24' : child.color}
                stroke="var(--chrome-bg)" strokeWidth={1.5}
              />
            ) : null)
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
            {/* Tooltip */}
            {(() => {
              const tx = xForWeek(hoveredWeek);
              const tooltipX = tx > W / 2 ? tx - 120 : tx + 8;
              const activeChildren = childLines.filter(c => c.weeklyAvg[hoveredWeek] !== null);
              return (
                <g>
                  <rect x={tooltipX} y={T} width={110} height={16 + activeChildren.length * 14}
                    rx={4} fill="var(--chrome-bg)" stroke="var(--chrome-border)" strokeWidth={1} />
                  <text x={tooltipX + 6} y={T + 11} fontSize="9" fontWeight="600"
                    fill="var(--chrome-text)">
                    {weekStarts[hoveredWeek]?.toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                  </text>
                  {activeChildren.map((child, i) => {
                    const v = child.weeklyAvg[hoveredWeek]!;
                    const above = v > child.age;
                    return (
                      <g key={child.childId}>
                        <circle cx={tooltipX + 10} cy={T + 24 + i * 14} r={3} fill={child.color} />
                        <text x={tooltipX + 18} y={T + 24 + i * 14} fontSize="9"
                          dominantBaseline="central"
                          fill={above ? '#fbbf24' : 'var(--chrome-text-secondary)'}>
                          {child.name}: {v.toFixed(1)}+ {above ? '(above)' : ''}
                        </text>
                      </g>
                    );
                  })}
                </g>
              );
            })()}
          </g>
        )}

        {/* Mouse tracking overlay */}
        <rect x={L} y={T} width={plotW} height={plotH}
          fill="transparent" style={{ cursor: 'crosshair' }}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredWeek(null)}
        />
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-3">
        {childLines.map(child => (
          <div key={child.childId} className="flex items-center gap-1.5 text-xs"
            style={{ color: 'var(--chrome-text)' }}>
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: child.color }} />
            {child.name}
          </div>
        ))}
        <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--chrome-text-secondary)' }}>
          <span className="w-4 h-0 border-t border-dashed" style={{ borderColor: 'var(--chrome-text-secondary)' }} />
          Child's age
        </div>
        <div className="flex items-center gap-1.5 text-xs" style={{ color: '#fbbf24' }}>
          <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: 'rgba(251,191,36,0.15)' }} />
          Above age zone
        </div>
      </div>
    </div>
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// PERFORMANCE NOTES (all 5 charts)
// ─────────────────────────────────────────────────────────────────────────────
//
// For 1000+ entries per child:
//
// 1. All data transforms are in useMemo — recomputed only when entries/config change.
//    The transforms aggregate into small output sets:
//      - Heatmap: 364 cells max (52x7)
//      - Stacked area: 12 points per child
//      - Sparklines: 30 points
//      - Binge timeline: ~30 bubbles per child max
//      - Age drift: 12 points per child
//
// 2. The expensive operation is iterating entries (O(N) per child per chart).
//    For 1000 entries this is <1ms. For 10,000+ entries, consider:
//      a. Pre-bucketing entries by date in a shared useMemo at the parent level
//      b. Passing pre-bucketed Map<dateKey, ViewingEntry[]> to each chart
//
// 3. SVG element count is always small (< 500 elements per chart).
//    React reconciliation is fast at this scale.
//
// 4. Hover state triggers re-render of only the tooltip elements.
//    Use React.memo on the chart wrapper if parent re-renders frequently.
//
// 5. For sparklines rendered in a list (N children x 1 sparkline each):
//    Each sparkline is independent — React.memo with entries reference equality.
//    Consider virtualization only if 50+ children (unlikely in family context).
//
// 6. CSS transitions (0.15-0.2s) are GPU-accelerated for opacity/transform.
//    Avoid transitioning SVG path `d` attribute — not GPU-accelerated.
//    For draw-in animation on the line charts, use stroke-dasharray/dashoffset
//    with CSS transition on dashoffset (GPU-friendly):
//
//      const pathLength = pathRef.current?.getTotalLength() ?? 0;
//      style={{
//        strokeDasharray: pathLength,
//        strokeDashoffset: mounted ? 0 : pathLength,
//        transition: 'stroke-dashoffset 0.8s ease-out',
//      }}
//
// ─────────────────────────────────────────────────────────────────────────────
// SHARED OPTIMIZATION: Pre-bucketed entries
// ─────────────────────────────────────────────────────────────────────────────
//
// At the FamilyDashboardPage level, compute once:
//
//   const bucketedEntries = useMemo(() => {
//     const map = new Map<string, Map<string, number>>(); // childId → dateKey → count
//     for (const child of childData) {
//       const dateMap = new Map<string, number>();
//       for (const e of child.entries) {
//         const key = e.date.slice(0, 10);
//         dateMap.set(key, (dateMap.get(key) ?? 0) + 1);
//       }
//       map.set(child.childId, dateMap);
//     }
//     return map;
//   }, [childData]);
//
// Then pass bucketedEntries to charts that only need counts (heatmap, sparkline).
// Charts needing full entry data (binge timeline titles, age drift ageMin) still
// receive the raw entries array.
