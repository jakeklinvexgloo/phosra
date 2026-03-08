import React, { useMemo } from 'react';
import { useTouchInteraction, touchChartContainerStyle } from './useTouchInteraction';

interface ChildInsight {
  child: { id: string; name: string; birth_date: string };
  age: number;
  totalEntries: number;
  uniqueTitles: number;
  matched: number;
  aboveAge: { title: string; ageMin: number; stars: number; episodes: number; ageExplanation: string; parentSummary: string; descriptors: { category: string; level: string; numericLevel: number }[] }[];
  ageBreakdown: { ageMin: number; uniqueTitles: number; episodes: number }[];
  highQuality: number;
  familyFriendly: number;
  topDescriptors: { category: string; count: number }[];
  descriptorAverages: { category: string; avgLevel: number; titleCount: number }[];
  positiveContentSummary: { category: string; count: number }[];
  titleWatchCounts: { title: string; displayTitle: string; episodes: number; ageMin: number | null; stars: number; isFamilyFriendly: boolean }[];
}

const CHILD_COLORS = ['#2dd4bf', '#60a5fa', '#f472b6', '#a78bfa', '#fbbf24', '#34d399', '#f87171', '#818cf8'];

const AXES: { label: string; key: string; matchCategories: string[] }[] = [
  { label: 'Violence', key: 'violence', matchCategories: ['Violence', 'Violence & Scariness'] },
  { label: 'Language', key: 'language', matchCategories: ['Language'] },
  { label: 'Sex', key: 'sex', matchCategories: ['Sex', 'Sexy Stuff'] },
  { label: 'Drinking', key: 'drinking', matchCategories: ['Drinking, Drugs & Smoking'] },
  { label: 'Consumerism', key: 'consumerism', matchCategories: ['Consumerism', 'Products & Purchases'] },
  { label: 'Positive', key: 'positive', matchCategories: [] },
];

const NUM_AXES = AXES.length;
const MAX_VALUE = 5;
const CENTER_X = 140;
const CENTER_Y = 140;
const RADIUS = 100;
const RINGS = [1, 2, 3, 4, 5];
const LABEL_OFFSET = 18;

function angleForAxis(index: number): number {
  // Start from top (-PI/2), go clockwise
  return (Math.PI * 2 * index) / NUM_AXES - Math.PI / 2;
}

function pointOnAxis(index: number, value: number): { x: number; y: number } {
  const angle = angleForAxis(index);
  const r = (value / MAX_VALUE) * RADIUS;
  return {
    x: CENTER_X + r * Math.cos(angle),
    y: CENTER_Y + r * Math.sin(angle),
  };
}

function getAxisValue(insight: ChildInsight, axisIndex: number): number {
  const axis = AXES[axisIndex];

  if (axis.key === 'positive') {
    const count = insight.positiveContentSummary?.length ?? 0;
    return Math.min((count / 6) * 5, 5);
  }

  for (const cat of axis.matchCategories) {
    const found = insight.descriptorAverages?.find(
      (d) => d.category.toLowerCase() === cat.toLowerCase()
    );
    if (found) return Math.min(found.avgLevel, 5);
  }
  return 0;
}

function polygonPoints(insight: ChildInsight): string {
  return AXES.map((_, i) => {
    const val = getAxisValue(insight, i);
    const pt = pointOnAxis(i, val);
    return `${pt.x},${pt.y}`;
  }).join(' ');
}

interface ContentRadarProps {
  insights: ChildInsight[];
}

export default function ContentRadar({ insights }: ContentRadarProps) {
  const { active: hoveredChild, bindElement: bindLegendItem, bindContainer } =
    useTouchInteraction<string>('tap-hold');

  const axisEndpoints = useMemo(
    () => AXES.map((_, i) => pointOnAxis(i, MAX_VALUE)),
    []
  );

  const labelPositions = useMemo(
    () =>
      AXES.map((axis, i) => {
        const angle = angleForAxis(i);
        return {
          x: CENTER_X + (RADIUS + LABEL_OFFSET) * Math.cos(angle),
          y: CENTER_Y + (RADIUS + LABEL_OFFSET) * Math.sin(angle),
          label: axis.label,
        };
      }),
    []
  );

  const ringPolygons = useMemo(
    () =>
      RINGS.map((ring) => {
        const pts = AXES.map((_, i) => {
          const pt = pointOnAxis(i, ring);
          return `${pt.x},${pt.y}`;
        }).join(' ');
        return pts;
      }),
    []
  );

  if (!insights || insights.length === 0) {
    return (
      <div
        className="rounded-xl p-5"
        style={{ backgroundColor: 'var(--chrome-surface)', border: '1px solid var(--chrome-border)' }}
      >
        <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--chrome-text)' }}>
          Content Radar
        </h3>
        <p className="text-xs" style={{ color: 'var(--chrome-text-secondary)' }}>
          No data available yet.
        </p>
      </div>
    );
  }

  return (
    <div
      {...bindContainer}
      className="rounded-xl p-5"
      style={{ backgroundColor: 'var(--chrome-surface)', border: '1px solid var(--chrome-border)', ...touchChartContainerStyle }}
    >
      <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--chrome-text)' }}>
        Content Radar
      </h3>

      <div className="flex justify-center">
        <svg viewBox="0 0 280 280" className="w-full max-w-[280px]" style={{ aspectRatio: '1 / 1' }}>
          {/* Concentric ring polygons */}
          {ringPolygons.map((pts, i) => (
            <polygon
              key={`ring-${i}`}
              points={pts}
              fill="none"
              stroke="var(--chrome-border)"
              strokeWidth={i === RINGS.length - 1 ? 1 : 0.5}
              opacity={0.6}
            />
          ))}

          {/* Axis lines from center to edge */}
          {axisEndpoints.map((pt, i) => (
            <line
              key={`axis-${i}`}
              x1={CENTER_X}
              y1={CENTER_Y}
              x2={pt.x}
              y2={pt.y}
              stroke="var(--chrome-border)"
              strokeWidth={0.5}
              opacity={0.5}
            />
          ))}

          {/* Child polygons */}
          {insights.map((insight, idx) => {
            const color = CHILD_COLORS[idx % CHILD_COLORS.length];
            const isHovered = hoveredChild === insight.child.id;
            const isOtherHovered = hoveredChild !== null && !isHovered;
            return (
              <polygon
                key={insight.child.id}
                points={polygonPoints(insight)}
                fill={color}
                fillOpacity={isOtherHovered ? 0.05 : 0.2}
                stroke={color}
                strokeWidth={isHovered ? 2.5 : 1.5}
                strokeOpacity={isOtherHovered ? 0.3 : 0.7}
                strokeLinejoin="round"
                style={{ transition: 'all 0.2s ease' }}
              />
            );
          })}

          {/* Data point dots */}
          {insights.map((insight, idx) => {
            const color = CHILD_COLORS[idx % CHILD_COLORS.length];
            const isOtherHovered = hoveredChild !== null && hoveredChild !== insight.child.id;
            return AXES.map((_, ai) => {
              const val = getAxisValue(insight, ai);
              if (val === 0) return null;
              const pt = pointOnAxis(ai, val);
              return (
                <circle
                  key={`dot-${insight.child.id}-${ai}`}
                  cx={pt.x}
                  cy={pt.y}
                  r={3}
                  fill={color}
                  opacity={isOtherHovered ? 0.2 : 0.9}
                  style={{ transition: 'opacity 0.2s ease' }}
                />
              );
            });
          })}

          {/* Axis labels */}
          {labelPositions.map((lp, i) => {
            const angle = angleForAxis(i);
            const angleDeg = (angle * 180) / Math.PI;
            let textAnchor: string = 'middle';
            if (angleDeg > 10 && angleDeg < 170) textAnchor = 'start';
            else if (angleDeg > -170 && angleDeg < -10) textAnchor = 'end';
            // Fix: angles near 0 (right) -> start, near 180 (left) -> end
            const cosA = Math.cos(angle);
            if (cosA > 0.3) textAnchor = 'start';
            else if (cosA < -0.3) textAnchor = 'end';
            else textAnchor = 'middle';

            return (
              <text
                key={`label-${i}`}
                x={lp.x}
                y={lp.y}
                textAnchor={textAnchor as 'start' | 'middle' | 'end'}
                dominantBaseline="central"
                fill="var(--chrome-text-secondary)"
                fontSize={10}
                fontFamily="inherit"
              >
                {lp.label}
              </text>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-3">
        {insights.map((insight, idx) => {
          const color = CHILD_COLORS[idx % CHILD_COLORS.length];
          return (
            <button
              key={insight.child.id}
              className="flex items-center gap-1.5 text-xs px-1 py-0.5 rounded hover:opacity-80 transition-opacity cursor-pointer bg-transparent border-none"
              style={{ color: 'var(--chrome-text)' }}
              {...bindLegendItem(insight.child.id)}
            >
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: color }}
              />
              {insight.child.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
