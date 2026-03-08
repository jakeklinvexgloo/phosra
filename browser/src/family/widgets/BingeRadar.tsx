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

interface BingeSession {
  childName: string;
  childColor: string;
  seriesTitle: string;
  episodeCount: number;
  date: Date;
  dateKey: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const CHILD_COLORS = ['#2dd4bf', '#60a5fa', '#f472b6', '#a78bfa', '#fbbf24', '#34d399', '#f87171', '#818cf8'];

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

function getWeekStart(d: Date): Date {
  const copy = new Date(d);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function formatDateShort(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export default function BingeRadar({ childData }: { childData: ChildViewingData[] }) {
  const { active: hovered, bindElement, bindContainer } =
    useTouchInteraction<{ week: number; day: number; dateKey: string; count: number; binges: BingeSession[] }>('tap-toggle');
  const [expanded, setExpanded] = useState(false);

  const CELL = 11, GAP = 2, PITCH = 13;
  const LEFT = 24, TOP = 10, WEEKS = 16;
  const WIDTH = LEFT + WEEKS * PITCH + 20;
  const HEIGHT = TOP + 7 * PITCH + 16;

  const { grid, monthLabels, bingeSessions } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endWeekStart = getWeekStart(today);

    // Count episodes per day and detect binges
    const dailyCounts = new Map<string, number>();
    const bingeMap = new Map<string, BingeSession[]>(); // dateKey -> binges on that day
    const allBinges: BingeSession[] = [];

    childData.forEach((child, childIdx) => {
      // Group entries by (date, seriesTitle)
      const groups = new Map<string, number>();
      for (const entry of child.entries) {
        const d = parseNetflixDate(entry.date);
        const dk = toDateKey(d);
        const series = entry.seriesTitle || '';
        if (!series) continue; // skip non-series entries for binge detection

        const groupKey = `${dk}::${series}`;
        groups.set(groupKey, (groups.get(groupKey) ?? 0) + 1);

        // Also count daily totals
        dailyCounts.set(dk, (dailyCounts.get(dk) ?? 0) + 1);
      }

      // Also count non-series entries toward daily totals
      for (const entry of child.entries) {
        if (!entry.seriesTitle) {
          const d = parseNetflixDate(entry.date);
          const dk = toDateKey(d);
          dailyCounts.set(dk, (dailyCounts.get(dk) ?? 0) + 1);
        }
      }

      // Extract binge sessions (4+ episodes)
      for (const [groupKey, count] of groups) {
        if (count >= 4) {
          const [dk, series] = groupKey.split('::');
          const session: BingeSession = {
            childName: child.childName,
            childColor: CHILD_COLORS[childIdx % CHILD_COLORS.length],
            seriesTitle: series,
            episodeCount: count,
            date: new Date(dk + 'T00:00:00'),
            dateKey: dk,
          };
          allBinges.push(session);
          const existing = bingeMap.get(dk) ?? [];
          existing.push(session);
          bingeMap.set(dk, existing);
        }
      }
    });

    // Sort binges by episode count desc
    allBinges.sort((a, b) => b.episodeCount - a.episodeCount);

    // Build 16-week grid
    const grid: { dateKey: string; count: number; binges: BingeSession[] }[][] = [];
    const months: { label: string; weekIdx: number }[] = [];
    let lastMonth = -1;

    for (let w = 0; w < WEEKS; w++) {
      const weekData: { dateKey: string; count: number; binges: BingeSession[] }[] = [];
      for (let d = 0; d < 7; d++) {
        const cellDate = new Date(endWeekStart);
        cellDate.setDate(cellDate.getDate() - (WEEKS - 1 - w) * 7 + d);
        const key = toDateKey(cellDate);
        const cellBinges = bingeMap.get(key) ?? [];
        weekData.push({ dateKey: key, count: dailyCounts.get(key) ?? 0, binges: cellBinges });

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

    return { grid, monthLabels: months, bingeSessions: allBinges };
  }, [childData]);

  function cellFill(count: number): string {
    if (count === 0) return 'var(--chrome-bg)';
    if (count <= 2) return 'rgba(45,212,191,0.25)';
    if (count <= 5) return 'rgba(45,212,191,0.55)';
    return 'rgba(45,212,191,0.9)';
  }

  function bingeRingColor(binges: BingeSession[]): string | null {
    if (binges.length === 0) return null;
    const maxEps = Math.max(...binges.map(b => b.episodeCount));
    if (maxEps >= 6) return '#f87171'; // red for heavy binge
    return '#fbbf24'; // amber for standard binge
  }

  const DAY_LABELS = ['', 'M', '', 'W', '', 'F', ''];
  const visibleBinges = expanded ? bingeSessions : bingeSessions.slice(0, 5);

  return (
    <div {...bindContainer} className="rounded-xl p-5" style={{ backgroundColor: 'var(--chrome-surface)', border: '1px solid var(--chrome-border)', ...touchChartContainerStyle }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <h3 className="text-sm font-semibold" style={{ color: 'var(--chrome-text)', margin: 0 }}>
          Binge Radar
        </h3>
        {bingeSessions.length > 0 && (
          <span style={{
            fontSize: 11,
            color: '#fbbf24',
            backgroundColor: 'rgba(251,191,36,0.12)',
            padding: '2px 8px',
            borderRadius: 6,
            fontWeight: 600,
          }}>
            {bingeSessions.length} binge session{bingeSessions.length !== 1 ? 's' : ''} detected
          </span>
        )}
      </div>

      {/* Heatmap calendar */}
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width="100%" style={{ display: 'block' }}>
        {/* Day-of-week labels */}
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

        {/* Pulsing ring animation */}
        <defs>
          <style>{`
            @keyframes binge-pulse {
              0%, 100% { opacity: 0.7; }
              50% { opacity: 1; }
            }
            .binge-ring { animation: binge-pulse 2s ease-in-out infinite; }
          `}</style>
        </defs>

        {/* Grid cells */}
        {grid.map((week, w) =>
          week.map((cell, d) => {
            const x = LEFT + w * PITCH;
            const y = TOP + d * PITCH;
            const ringColor = bingeRingColor(cell.binges);
            return (
              <g key={`${w}-${d}`}>
                <rect
                  x={x}
                  y={y}
                  width={CELL}
                  height={CELL}
                  rx={2}
                  fill={cellFill(cell.count)}
                  stroke="var(--chrome-border)"
                  strokeWidth={0.5}
                  style={{ transition: 'fill 0.15s' }}
                  {...bindElement({ week: w, day: d, dateKey: cell.dateKey, count: cell.count, binges: cell.binges })}
                />
                {ringColor && (
                  <rect
                    className="binge-ring"
                    x={x - 1}
                    y={y - 1}
                    width={CELL + 2}
                    height={CELL + 2}
                    rx={3}
                    fill="none"
                    stroke={ringColor}
                    strokeWidth={1.5}
                    pointerEvents="none"
                  />
                )}
              </g>
            );
          })
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

        {/* Tooltip */}
        {hovered && (() => {
          const tx = LEFT + hovered.week * PITCH + CELL / 2;
          const ty = TOP + hovered.day * PITCH - 6;
          const bingeInfo = hovered.binges.length > 0
            ? ` | ${hovered.binges.map(b => `${b.seriesTitle} (${b.episodeCount}ep)`).join(', ')}`
            : '';
          const label = `${hovered.dateKey}: ${hovered.count} ep${hovered.count !== 1 ? 's' : ''}${bingeInfo}`;
          const textWidth = Math.min(label.length * 4.5, WIDTH - 16);
          const boxX = Math.max(2, Math.min(tx - textWidth / 2 - 4, WIDTH - textWidth - 12));
          const boxY = Math.max(0, ty - 14);
          return (
            <g pointerEvents="none">
              <rect
                x={boxX}
                y={boxY}
                width={textWidth + 8}
                height={16}
                rx={4}
                fill="var(--chrome-bg)"
                stroke="var(--chrome-border)"
                strokeWidth={0.5}
                opacity={0.95}
              />
              <text
                x={boxX + 4}
                y={boxY + 11}
                fontSize="8"
                fill="var(--chrome-text)"
              >
                {label.length > 60 ? label.slice(0, 57) + '...' : label}
              </text>
            </g>
          );
        })()}
      </svg>

      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8, fontSize: 10, color: 'var(--chrome-text-secondary)' }}>
        <span>Less</span>
        {[0, 2, 4, 7].map((count, i) => (
          <span
            key={i}
            style={{
              display: 'inline-block',
              width: 10,
              height: 10,
              borderRadius: 2,
              backgroundColor: cellFill(count),
              border: '0.5px solid var(--chrome-border)',
            }}
          />
        ))}
        <span>More</span>
        <span style={{ marginLeft: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, border: '1.5px solid #fbbf24' }} />
          Binge (4+)
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, border: '1.5px solid #f87171' }} />
          Heavy (6+)
        </span>
      </div>

      {/* Binge session list */}
      {bingeSessions.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--chrome-text-secondary)', marginBottom: 8 }}>
            Detected Binge Sessions
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {visibleBinges.map((session, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 10px',
                  borderRadius: 8,
                  backgroundColor: 'var(--chrome-bg)',
                  border: '1px solid var(--chrome-border)',
                  fontSize: 11,
                  transition: 'background-color 0.2s ease',
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: session.childColor,
                    flexShrink: 0,
                  }}
                />
                <span style={{ color: 'var(--chrome-text)', fontWeight: 500, flexShrink: 0 }}>
                  {session.childName}
                </span>
                <span style={{
                  color: 'var(--chrome-text-secondary)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  flex: 1,
                  minWidth: 0,
                }}>
                  {session.seriesTitle}
                </span>
                <span style={{
                  color: session.episodeCount >= 6 ? '#f87171' : '#fbbf24',
                  fontWeight: 700,
                  flexShrink: 0,
                }}>
                  {session.episodeCount} eps
                </span>
                <span style={{ color: 'var(--chrome-text-secondary)', flexShrink: 0 }}>
                  {formatDateShort(session.date)}
                </span>
              </div>
            ))}
          </div>

          {bingeSessions.length > 5 && (
            <button
              onClick={() => setExpanded(!expanded)}
              style={{
                marginTop: 8,
                background: 'none',
                border: 'none',
                color: '#2dd4bf',
                fontSize: 11,
                cursor: 'pointer',
                padding: '4px 0',
                fontWeight: 500,
              }}
            >
              {expanded ? 'Show less' : `Show ${bingeSessions.length - 5} more`}
            </button>
          )}
        </div>
      )}

      {bingeSessions.length === 0 && (
        <div style={{ textAlign: 'center', padding: '16px 0', fontSize: 12, color: 'var(--chrome-text-secondary)' }}>
          No binge sessions detected in the last 4 months.
        </div>
      )}
    </div>
  );
}
