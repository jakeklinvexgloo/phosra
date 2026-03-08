import React, { useMemo } from 'react';
import { useTouchInteraction, touchChartContainerStyle } from './useTouchInteraction';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface ChildViewingData {
  childId: string;
  childName: string;
  age: number;
  entries: { title: string; date: string; seriesTitle?: string }[];
}

interface RewatchRow {
  title: string;
  seriesTitle?: string;
  totalWatches: number;
  dots: { date: Date; dateKey: string; count: number; childIdx: number }[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const CHILD_COLORS = ['#2dd4bf', '#60a5fa', '#f472b6', '#a78bfa', '#fbbf24', '#34d399', '#f87171', '#818cf8'];
const ROW_HEIGHT = 28;
const LABEL_WIDTH = 150;
const BADGE_WIDTH = 40;
const CHART_LEFT = LABEL_WIDTH + 8;
const WEEKS = 12;
const MAX_ROWS = 8;

// ─────────────────────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────────────────────

function parseNetflixDate(dateStr: string): Date {
  const parts = dateStr.split('/');
  const month = parseInt(parts[0], 10) - 1;
  const day = parseInt(parts[1], 10);
  let year = parseInt(parts[2], 10);
  if (year < 100) year += year < 50 ? 2000 : 1900;
  return new Date(year, month, day);
}

function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export default function RewatchRadar({ childData }: { childData: ChildViewingData[] }) {
  const { active: hoveredDot, bindElement, bindContainer } =
    useTouchInteraction<{ rowIdx: number; dotIdx: number; x: number; y: number; title: string; dateKey: string; count: number; childName: string }>('tap-toggle');

  const { rows, startDate, endDate, weekLabels, totalDays } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(today);
    start.setDate(start.getDate() - WEEKS * 7);

    const startMs = start.getTime();
    const endMs = today.getTime();
    const totalDays = Math.round((endMs - startMs) / (1000 * 60 * 60 * 24));

    // Find rewatched titles: titles appearing on 2+ distinct dates
    // Track per-child for coloring
    const titleData = new Map<string, {
      seriesTitle?: string;
      watches: Map<string, { count: number; childIdx: number; date: Date }>;
      totalCount: number;
    }>();

    childData.forEach((child, childIdx) => {
      for (const entry of child.entries) {
        const d = parseNetflixDate(entry.date);
        if (d.getTime() < startMs || d.getTime() > endMs) continue;

        const dk = toDateKey(d);
        const key = entry.title;

        if (!titleData.has(key)) {
          titleData.set(key, {
            seriesTitle: entry.seriesTitle,
            watches: new Map(),
            totalCount: 0,
          });
        }

        const data = titleData.get(key)!;
        data.totalCount++;

        const watchKey = `${dk}::${childIdx}`;
        if (data.watches.has(watchKey)) {
          data.watches.get(watchKey)!.count++;
        } else {
          data.watches.set(watchKey, { count: 1, childIdx, date: d });
        }
      }
    });

    // Filter to titles with 2+ distinct dates
    const rewatched: RewatchRow[] = [];
    for (const [title, data] of titleData) {
      const distinctDates = new Set<string>();
      for (const [watchKey] of data.watches) {
        const dk = watchKey.split('::')[0];
        distinctDates.add(dk);
      }
      if (distinctDates.size < 2) continue;

      const dots: RewatchRow['dots'] = [];
      for (const [, w] of data.watches) {
        dots.push({ date: w.date, dateKey: toDateKey(w.date), count: w.count, childIdx: w.childIdx });
      }
      dots.sort((a, b) => a.date.getTime() - b.date.getTime());

      rewatched.push({
        title,
        seriesTitle: data.seriesTitle,
        totalWatches: data.totalCount,
        dots,
      });
    }

    // Sort by total watches desc, take top MAX_ROWS
    rewatched.sort((a, b) => b.totalWatches - a.totalWatches);
    const rows = rewatched.slice(0, MAX_ROWS);

    // Week labels for x-axis
    const labels: { label: string; dayOffset: number }[] = [];
    for (let w = 0; w <= WEEKS; w += 2) {
      const d = new Date(start);
      d.setDate(d.getDate() + w * 7);
      labels.push({
        label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        dayOffset: w * 7,
      });
    }

    return { rows, startDate: start, endDate: today, weekLabels: labels, totalDays };
  }, [childData]);

  if (rows.length === 0) {
    return (
      <div className="rounded-xl p-5" style={{ backgroundColor: 'var(--chrome-surface)', border: '1px solid var(--chrome-border)' }}>
        <h3 className="text-sm font-semibold" style={{ color: 'var(--chrome-text)', marginBottom: 8 }}>
          Rewatch Radar
        </h3>
        <div style={{ textAlign: 'center', padding: '24px 0', fontSize: 12, color: 'var(--chrome-text-secondary)' }}>
          No rewatched titles detected in the last 12 weeks.
        </div>
      </div>
    );
  }

  const CHART_RIGHT = BADGE_WIDTH + 8;
  const SVG_WIDTH = 600;
  const chartWidth = SVG_WIDTH - CHART_LEFT - CHART_RIGHT;
  const SVG_HEIGHT = ROW_HEIGHT * rows.length + 28; // +28 for x-axis labels

  function dateToPx(d: Date): number {
    const dayOffset = Math.round((d.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    return CHART_LEFT + (dayOffset / totalDays) * chartWidth;
  }

  function dotRadius(count: number): number {
    if (count <= 1) return 3.5;
    if (count <= 3) return 5;
    if (count <= 5) return 6.5;
    return 8;
  }

  return (
    <div {...bindContainer} className="rounded-xl p-5" style={{ backgroundColor: 'var(--chrome-surface)', border: '1px solid var(--chrome-border)', ...touchChartContainerStyle }}>
      <h3 className="text-sm font-semibold" style={{ color: 'var(--chrome-text)', marginBottom: 12 }}>
        Rewatch Radar
      </h3>

      <div style={{ overflowX: 'auto', overflowY: rows.length > 6 ? 'auto' : 'visible', maxHeight: rows.length > 6 ? ROW_HEIGHT * 8 + 28 : undefined }}>
        <svg viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} width="100%" style={{ display: 'block', minWidth: 480 }}>
          {/* Row separator lines and labels */}
          {rows.map((row, i) => {
            const y = i * ROW_HEIGHT + ROW_HEIGHT / 2;
            return (
              <g key={`row-${i}`}>
                {/* Separator line */}
                {i > 0 && (
                  <line
                    x1={0}
                    y1={i * ROW_HEIGHT}
                    x2={SVG_WIDTH}
                    y2={i * ROW_HEIGHT}
                    stroke="var(--chrome-border)"
                    strokeWidth={0.5}
                    opacity={0.5}
                  />
                )}

                {/* Title label (left, truncated) */}
                <clipPath id={`clip-label-${i}`}>
                  <rect x={0} y={i * ROW_HEIGHT} width={LABEL_WIDTH} height={ROW_HEIGHT} />
                </clipPath>
                <text
                  x={4}
                  y={y}
                  dominantBaseline="central"
                  fontSize="10"
                  fill="var(--chrome-text)"
                  clipPath={`url(#clip-label-${i})`}
                  style={{ fontWeight: 500 }}
                >
                  {row.title}
                </text>

                {/* Rewatch count badge (right) */}
                <rect
                  x={SVG_WIDTH - BADGE_WIDTH}
                  y={y - 9}
                  width={BADGE_WIDTH - 4}
                  height={18}
                  rx={9}
                  fill="rgba(45,212,191,0.12)"
                />
                <text
                  x={SVG_WIDTH - BADGE_WIDTH + (BADGE_WIDTH - 4) / 2}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="10"
                  fill="#2dd4bf"
                  fontWeight="700"
                >
                  {row.totalWatches}x
                </text>

                {/* Dots */}
                {row.dots.map((dot, di) => {
                  const cx = dateToPx(dot.date);
                  const r = dotRadius(dot.count);
                  const color = childData.length > 1
                    ? CHILD_COLORS[dot.childIdx % CHILD_COLORS.length]
                    : '#2dd4bf';
                  const isHovered = hoveredDot?.rowIdx === i && hoveredDot?.dotIdx === di;
                  return (
                    <circle
                      key={`dot-${di}`}
                      cx={cx}
                      cy={y}
                      r={isHovered ? r + 1.5 : r}
                      fill={color}
                      opacity={isHovered ? 1 : 0.75}
                      style={{ transition: 'r 0.15s ease, opacity 0.15s ease' }}
                      {...bindElement({
                        rowIdx: i,
                        dotIdx: di,
                        x: cx,
                        y: i * ROW_HEIGHT,
                        title: row.title,
                        dateKey: dot.dateKey,
                        count: dot.count,
                        childName: childData[dot.childIdx]?.childName ?? '',
                      })}
                    />
                  );
                })}
              </g>
            );
          })}

          {/* Bottom separator */}
          <line
            x1={0}
            y1={rows.length * ROW_HEIGHT}
            x2={SVG_WIDTH}
            y2={rows.length * ROW_HEIGHT}
            stroke="var(--chrome-border)"
            strokeWidth={0.5}
            opacity={0.5}
          />

          {/* X-axis time labels */}
          {weekLabels.map((wl, i) => {
            const x = CHART_LEFT + (wl.dayOffset / totalDays) * chartWidth;
            return (
              <text
                key={`wl-${i}`}
                x={x}
                y={rows.length * ROW_HEIGHT + 16}
                fontSize="9"
                fill="var(--chrome-text-secondary)"
                textAnchor={i === 0 ? 'start' : i === weekLabels.length - 1 ? 'end' : 'middle'}
              >
                {wl.label}
              </text>
            );
          })}

          {/* Vertical grid lines (light, every 2 weeks) */}
          {weekLabels.map((wl, i) => {
            const x = CHART_LEFT + (wl.dayOffset / totalDays) * chartWidth;
            return (
              <line
                key={`vl-${i}`}
                x1={x}
                y1={0}
                x2={x}
                y2={rows.length * ROW_HEIGHT}
                stroke="var(--chrome-border)"
                strokeWidth={0.5}
                opacity={0.3}
              />
            );
          })}

          {/* Tooltip */}
          {hoveredDot && (() => {
            const multiChild = childData.length > 1;
            const label = multiChild
              ? `${hoveredDot.childName}: ${hoveredDot.title} (${hoveredDot.count}x on ${hoveredDot.dateKey})`
              : `${hoveredDot.title} (${hoveredDot.count}x on ${hoveredDot.dateKey})`;
            const displayLabel = label.length > 55 ? label.slice(0, 52) + '...' : label;
            const textWidth = displayLabel.length * 4.8;
            const boxW = textWidth + 12;
            const boxX = Math.max(2, Math.min(hoveredDot.x - boxW / 2, SVG_WIDTH - boxW - 2));
            const boxY = hoveredDot.y - 6;
            return (
              <g pointerEvents="none">
                <rect
                  x={boxX}
                  y={boxY}
                  width={boxW}
                  height={16}
                  rx={4}
                  fill="var(--chrome-bg)"
                  stroke="var(--chrome-border)"
                  strokeWidth={0.5}
                  opacity={0.95}
                />
                <text
                  x={boxX + 6}
                  y={boxY + 11}
                  fontSize="8"
                  fill="var(--chrome-text)"
                >
                  {displayLabel}
                </text>
              </g>
            );
          })()}
        </svg>
      </div>

      {/* Legend for multi-child */}
      {childData.length > 1 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 10, fontSize: 10, color: 'var(--chrome-text-secondary)' }}>
          {childData.map((child, i) => (
            <span key={child.childId} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{
                display: 'inline-block',
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: CHILD_COLORS[i % CHILD_COLORS.length],
              }} />
              {child.childName}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
