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

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const CHILD_COLORS = ['#2dd4bf', '#60a5fa', '#f472b6', '#a78bfa', '#fbbf24', '#34d399', '#f87171', '#818cf8'];
const NUM_WEEKS = 12;

// ─────────────────────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────────────────────

/** Parse Netflix M/D/YY date format */
function parseNetflixDate(dateStr: string): Date {
  const parts = dateStr.split('/');
  const month = parseInt(parts[0], 10) - 1;
  const day = parseInt(parts[1], 10);
  let year = parseInt(parts[2], 10);
  if (year < 100) year += year < 50 ? 2000 : 1900;
  return new Date(year, month, day);
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

export default function ViewingPulse({ childData }: { childData: ChildViewingData[] }) {
  const [highlightedChild, setHighlightedChild] = useState<string | null>(null);

  // Layout constants
  const L = 48, R = 16, T = 16, B = 32;
  const W = 640, H = 240;
  const plotW = W - L - R;  // 576
  const plotH = H - T - B;  // 192

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

  const { weekStarts, stacked, maxY, yTicks, colors } = useMemo(() => {
    const today = new Date();
    const weekStarts = getWeekStarts(today, NUM_WEEKS);

    // Assign colors to children
    const colors = childData.map((_, i) => CHILD_COLORS[i % CHILD_COLORS.length]);

    // Bucket each child's entries by week
    const childWeekCounts: number[][] = [];

    for (const child of childData) {
      const counts = new Array(NUM_WEEKS).fill(0);
      for (const entry of child.entries) {
        const entryDate = parseNetflixDate(entry.date);
        for (let w = NUM_WEEKS - 1; w >= 0; w--) {
          if (entryDate >= weekStarts[w]) {
            counts[w]++;
            break;
          }
        }
      }
      childWeekCounts.push(counts);
    }

    // Build stacked values: stacked[childIdx][weekIdx] = { y0, y1 }
    const stacked: { y0: number; y1: number }[][] = [];
    let maxY = 0;

    for (let c = 0; c < childData.length; c++) {
      const counts = childWeekCounts[c];
      const layer: { y0: number; y1: number }[] = [];

      for (let w = 0; w < NUM_WEEKS; w++) {
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
    if (yTicks.length === 0 || yTicks[yTicks.length - 1] < maxY) {
      yTicks.push((yTicks[yTicks.length - 1] ?? 0) + step);
    }
    maxY = yTicks[yTicks.length - 1] || 1;

    return { weekStarts, stacked, maxY, yTicks, colors };
  }, [childData]);

  // Coordinate transforms
  const xForWeek = useCallback((w: number) => L + (w / (NUM_WEEKS - 1)) * plotW, [plotW]);
  const yForVal = useCallback((v: number) => T + plotH - (v / maxY) * plotH, [plotH, maxY]);

  // Catmull-Rom to cubic bezier path generation
  const catmullRomPath = useCallback((points: { x: number; y: number }[]): string => {
    if (points.length < 2) return '';
    const alpha = 6;

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
  }, []);

  // Build area path for each child (top line forward, bottom line backward)
  const areaPath = useCallback((childIdx: number): string => {
    if (!stacked[childIdx]) return '';

    const topPoints = stacked[childIdx].map((s, w) => ({ x: xForWeek(w), y: yForVal(s.y1) }));
    const botPoints = stacked[childIdx].map((s, w) => ({ x: xForWeek(w), y: yForVal(s.y0) }));

    const topPath = catmullRomPath(topPoints);
    const botReversed = [...botPoints].reverse();
    const botPath = catmullRomPath(botReversed);

    return `${topPath} L ${botReversed[0].x},${botReversed[0].y} ${botPath.replace(/^M [^C]+/, '')} Z`;
  }, [stacked, xForWeek, yForVal, catmullRomPath]);

  return (
    <div
      {...bindContainer}
      className="rounded-xl p-5"
      style={{ backgroundColor: 'var(--chrome-surface)', border: '1px solid var(--chrome-border)', ...touchChartContainerStyle }}
    >
      <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--chrome-text)' }}>
        Viewing Pulse
      </h3>

      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
        <defs>
          <clipPath id="viewing-pulse-plot-clip">
            <rect x={L} y={T} width={plotW} height={plotH} />
          </clipPath>
        </defs>

        {/* Y-axis grid lines + labels */}
        {yTicks.map(v => (
          <g key={`y-${v}`}>
            <line
              x1={L} y1={yForVal(v)}
              x2={L + plotW} y2={yForVal(v)}
              stroke="var(--chrome-border)" strokeWidth={0.5}
            />
            <text
              x={L - 6} y={yForVal(v)}
              textAnchor="end" dominantBaseline="central"
              fontSize="9" fill="var(--chrome-text-secondary)"
            >
              {v}
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

        {/* Stacked area paths -- rendered bottom-to-top */}
        <g clipPath="url(#viewing-pulse-plot-clip)">
          {childData.map((child, idx) => {
            const isHighlighted = highlightedChild === null || highlightedChild === child.childId;
            return (
              <path
                key={child.childId}
                d={areaPath(idx)}
                fill={colors[idx]}
                fillOpacity={isHighlighted ? 0.4 : 0.1}
                stroke={colors[idx]}
                strokeWidth={isHighlighted ? 1.5 : 0.5}
                strokeOpacity={isHighlighted ? 0.8 : 0.2}
                style={{ transition: 'fill-opacity 0.2s, stroke-opacity 0.2s, stroke-width 0.2s' }}
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
                fill={colors[idx]}
                stroke="var(--chrome-bg)"
                strokeWidth={1.5}
              />
            ))}
            {/* Tooltip box */}
            {(() => {
              const tx = xForWeek(hoveredWeek);
              const tooltipW = 110;
              const tooltipH = 14 + childData.length * 14;
              const tooltipX = tx > W / 2 ? tx - tooltipW - 8 : tx + 8;
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
                    x={tooltipX + 6} y={T + 10}
                    fontSize="9" fontWeight="600"
                    fill="var(--chrome-text)"
                  >
                    {weekStarts[hoveredWeek]?.toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                  </text>
                  {childData.map((child, idx) => {
                    const count = stacked[idx][hoveredWeek].y1 - stacked[idx][hoveredWeek].y0;
                    return (
                      <g key={child.childId}>
                        <circle
                          cx={tooltipX + 10}
                          cy={T + 22 + idx * 14}
                          r={3}
                          fill={colors[idx]}
                        />
                        <text
                          x={tooltipX + 18}
                          y={T + 22 + idx * 14}
                          fontSize="9"
                          dominantBaseline="central"
                          fill="var(--chrome-text-secondary)"
                        >
                          {child.childName}: {count}
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

      {/* Legend (HTML, below SVG) */}
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-3">
        {childData.map((child, idx) => (
          <button
            key={child.childId}
            className="flex items-center gap-1.5 text-xs px-1 py-0.5 rounded hover:opacity-80 transition-opacity cursor-pointer bg-transparent border-none"
            style={{ color: 'var(--chrome-text)' }}
            onMouseEnter={() => setHighlightedChild(child.childId)}
            onMouseLeave={() => setHighlightedChild(null)}
            onClick={() =>
              setHighlightedChild(prev => prev === child.childId ? null : child.childId)
            }
          >
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: colors[idx] }}
            />
            {child.childName}
          </button>
        ))}
      </div>
    </div>
  );
}
