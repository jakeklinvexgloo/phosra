import React, { useState, useMemo } from 'react';
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

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const CHILD_COLORS = ['#2dd4bf', '#60a5fa', '#f472b6', '#a78bfa', '#fbbf24', '#34d399', '#f87171', '#818cf8'];

const CELL = 11;
const GAP = 2;
const PITCH = 13;
const LEFT = 24;
const TOP = 10;
const WEEKS = 52;
const WIDTH = 720;
const HEIGHT = 120;

const DAY_LABELS = ['', 'M', '', 'W', '', 'F', ''];

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

/** Get ISO date string for a Date (YYYY-MM-DD) */
function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
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

/** Color intensity for a given count */
function cellFill(count: number): string {
  if (count === 0) return 'var(--chrome-bg)';
  if (count <= 2) return 'rgba(45,212,191,0.25)';
  if (count <= 5) return 'rgba(45,212,191,0.55)';
  return 'rgba(45,212,191,0.9)';
}

/** Format a date key for tooltip display */
function formatDateLabel(dateKey: string): string {
  const d = new Date(dateKey + 'T00:00:00');
  return d.toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export default function ActivityHeatmap({ childData }: { childData: ChildViewingData[] }) {
  const [mode, setMode] = useState<'family' | string>('family');
  // Touch-friendly tap-toggle interaction for cells
  const { active: hovered, bindElement, bindContainer } =
    useTouchInteraction<{ week: number; day: number; date: string; count: number }>('tap-toggle');

  // Build the 52x7 grid data
  const { grid, monthLabels } = useMemo(() => {
    // Select entries based on mode
    const entries = mode === 'family'
      ? childData.flatMap(c => c.entries)
      : childData.find(c => c.childId === mode)?.entries ?? [];

    // Build date -> count map
    const countMap = new Map<string, number>();
    for (const e of entries) {
      const parsed = parseNetflixDate(e.date);
      const key = toDateKey(parsed);
      countMap.set(key, (countMap.get(key) ?? 0) + 1);
    }

    // Compute 52-week window ending at the current week
    const today = new Date();
    const endWeekStart = getWeekStart(today);

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

  return (
    <div
      {...bindContainer}
      className="rounded-xl p-5"
      style={{ backgroundColor: 'var(--chrome-surface)', border: '1px solid var(--chrome-border)', ...touchChartContainerStyle }}
    >
      {/* Header with mode toggle */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold" style={{ color: 'var(--chrome-text)' }}>
          Activity Heatmap
        </h3>
        <div className="flex items-center gap-1">
          <button
            className="text-xs px-2 py-0.5 rounded transition-colors cursor-pointer border-none"
            style={{
              backgroundColor: mode === 'family' ? 'var(--chrome-hover)' : 'transparent',
              color: mode === 'family' ? 'var(--chrome-text)' : 'var(--chrome-text-secondary)',
            }}
            onClick={() => setMode('family')}
          >
            Family
          </button>
          {childData.map((child, idx) => (
            <button
              key={child.childId}
              className="text-xs px-2 py-0.5 rounded transition-colors cursor-pointer border-none flex items-center gap-1"
              style={{
                backgroundColor: mode === child.childId ? 'var(--chrome-hover)' : 'transparent',
                color: mode === child.childId ? 'var(--chrome-text)' : 'var(--chrome-text-secondary)',
              }}
              onClick={() => setMode(child.childId)}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0 inline-block"
                style={{ backgroundColor: CHILD_COLORS[idx % CHILD_COLORS.length] }}
              />
              {child.childName}
            </button>
          ))}
        </div>
      </div>

      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width="100%" style={{ display: 'block' }}>
        {/* Day-of-week labels (left edge) */}
        {DAY_LABELS.map((label, d) =>
          label ? (
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
          ) : null
        )}

        {/* Grid cells -- 52 x 7 = 364 rects */}
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
              {...bindElement({ week: w, day: d, date: cell.date, count: cell.count })}
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

        {/* Tooltip -- single floating element */}
        {hovered &&
          (() => {
            const tx = LEFT + hovered.week * PITCH + CELL / 2;
            const ty = TOP + hovered.day * PITCH - 6;
            const label = `${formatDateLabel(hovered.date)}: ${hovered.count} ep${hovered.count !== 1 ? 's' : ''}`;
            const textWidth = label.length * 5.5;
            // Clamp tooltip X so it doesn't overflow viewBox
            const boxX = Math.max(2, Math.min(tx - textWidth / 2 - 4, WIDTH - textWidth - 8));
            // If near the top, show tooltip below the cell instead
            const boxY = ty - 14 < 0 ? TOP + hovered.day * PITCH + CELL + 4 : ty - 14;
            return (
              <g>
                <rect
                  x={boxX}
                  y={boxY}
                  width={textWidth + 8}
                  height={16}
                  rx={4}
                  fill="var(--chrome-bg)"
                  stroke="var(--chrome-border)"
                  strokeWidth={1}
                />
                <text
                  x={boxX + 4}
                  y={boxY + 8}
                  fontSize="9"
                  fill="var(--chrome-text)"
                  dominantBaseline="central"
                >
                  {label}
                </text>
              </g>
            );
          })()}
      </svg>

      {/* Color legend */}
      <div className="flex items-center justify-end gap-1.5 mt-2">
        <span className="text-xs" style={{ color: 'var(--chrome-text-secondary)' }}>Less</span>
        {[0, 1, 3, 6].map(count => (
          <div
            key={count}
            className="rounded-sm"
            style={{
              width: 10,
              height: 10,
              backgroundColor: cellFill(count),
              border: '0.5px solid var(--chrome-border)',
            }}
          />
        ))}
        <span className="text-xs" style={{ color: 'var(--chrome-text-secondary)' }}>More</span>
      </div>
    </div>
  );
}
