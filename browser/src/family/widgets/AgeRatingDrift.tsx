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

const AGE_TICKS = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18];
const MAX_AGE = 18;

const TEAL = '#2dd4bf';
const AMBER = '#f59e0b';

const LANE_HEIGHT = 36;
const LANE_GAP = 12;
const LABEL_WIDTH = 100;
const RIGHT_PAD = 16;
const HEADER_HEIGHT = 28;
const LEGEND_HEIGHT = 32;
const AXIS_HEIGHT = 24;

function getChildColor(index: number): string {
  return CHILD_COLORS[index % CHILD_COLORS.length];
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function AgeRatingDrift({ insights }: { insights: ChildInsight[] }) {
  const { active: hoveredSegment, bindElement, bindContainer } =
    useTouchInteraction<string>('tap-toggle');

  const chartData = useMemo(() => {
    return insights.map((insight, idx) => {
      const totalEpisodes = insight.ageBreakdown.reduce((sum, b) => sum + b.episodes, 0);
      const segments = insight.ageBreakdown
        .filter((b) => b.episodes > 0)
        .sort((a, b) => a.ageMin - b.ageMin)
        .map((bucket) => ({
          ageMin: bucket.ageMin,
          episodes: bucket.episodes,
          fraction: totalEpisodes > 0 ? bucket.episodes / totalEpisodes : 0,
          aboveAge: bucket.ageMin > insight.age,
        }));

      return {
        childId: insight.child.id,
        name: insight.child.name,
        age: insight.age,
        color: getChildColor(idx),
        segments,
        totalEpisodes,
      };
    });
  }, [insights]);

  if (insights.length === 0) {
    return (
      <div
        className="rounded-xl p-5"
        style={{
          backgroundColor: 'var(--chrome-surface)',
          border: '1px solid var(--chrome-border)',
        }}
      >
        <h3 className="text-sm font-semibold" style={{ color: 'var(--chrome-text)' }}>
          Age Rating Distribution
        </h3>
        <p
          className="text-sm mt-3 text-center py-6"
          style={{ color: 'var(--chrome-text-secondary)' }}
        >
          No viewing data available yet.
        </p>
      </div>
    );
  }

  const svgHeight = HEADER_HEIGHT + insights.length * (LANE_HEIGHT + LANE_GAP) + AXIS_HEIGHT + LEGEND_HEIGHT;

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
      <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--chrome-text)' }}>
        Age Rating Distribution
      </h3>

      <svg
        width="100%"
        viewBox={`0 0 600 ${svgHeight}`}
        className="overflow-visible"
        style={{ display: 'block' }}
      >
        {/* X-axis tick labels */}
        {AGE_TICKS.map((age) => {
          const x = LABEL_WIDTH + (age / MAX_AGE) * (600 - LABEL_WIDTH - RIGHT_PAD);
          return (
            <text
              key={`tick-${age}`}
              x={x}
              y={HEADER_HEIGHT - 4}
              textAnchor="middle"
              fontSize="10"
              fill="var(--chrome-text-secondary)"
            >
              {age}+
            </text>
          );
        })}

        {/* Swim lanes */}
        {chartData.map((child, laneIdx) => {
          const laneY = HEADER_HEIGHT + laneIdx * (LANE_HEIGHT + LANE_GAP);
          const barAreaWidth = 600 - LABEL_WIDTH - RIGHT_PAD;

          // Age line position
          const ageLineX = LABEL_WIDTH + (child.age / MAX_AGE) * barAreaWidth;

          return (
            <g key={child.childId}>
              {/* Child label */}
              <text
                x={LABEL_WIDTH - 8}
                y={laneY + LANE_HEIGHT / 2 + 1}
                textAnchor="end"
                dominantBaseline="middle"
                fontSize="11"
                fontWeight="600"
                fill="var(--chrome-text)"
              >
                {child.name}
              </text>
              <text
                x={LABEL_WIDTH - 8}
                y={laneY + LANE_HEIGHT / 2 + 13}
                textAnchor="end"
                dominantBaseline="middle"
                fontSize="9"
                fill="var(--chrome-text-secondary)"
              >
                age {child.age}
              </text>

              {/* Lane background */}
              <rect
                x={LABEL_WIDTH}
                y={laneY}
                width={barAreaWidth}
                height={LANE_HEIGHT}
                rx="4"
                fill="var(--chrome-bg)"
                opacity="0.5"
              />

              {/* Segments positioned by their ageMin on the x-axis */}
              {child.segments.map((seg) => {
                const segX = LABEL_WIDTH + (seg.ageMin / MAX_AGE) * barAreaWidth;
                // Each segment width is proportional to 2-year bucket width
                const bucketWidth = (2 / MAX_AGE) * barAreaWidth;
                // Scale height by fraction of total episodes
                const segWidth = Math.max(bucketWidth * 0.9, 0);
                const segKey = `${child.childId}-${seg.ageMin}`;
                const isHovered = hoveredSegment === segKey;
                const fillColor = seg.aboveAge ? AMBER : TEAL;
                const fillOpacity = isHovered ? 0.95 : 0.7;

                return (
                  <g key={segKey}>
                    <rect
                      x={segX + (bucketWidth - segWidth) / 2}
                      y={laneY + 2}
                      width={segWidth}
                      height={LANE_HEIGHT - 4}
                      rx="3"
                      fill={fillColor}
                      opacity={fillOpacity}
                      style={{ transition: 'opacity 0.2s' }}
                      {...bindElement(segKey)}
                    />
                    {/* Episode count inside segment */}
                    {seg.episodes > 0 && segWidth > 16 && (
                      <text
                        x={segX + bucketWidth / 2}
                        y={laneY + LANE_HEIGHT / 2 + 1}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize="9"
                        fontWeight="600"
                        fill={seg.aboveAge ? '#78350f' : '#042f2e'}
                        opacity={isHovered ? 1 : 0.8}
                      >
                        {seg.episodes}
                      </text>
                    )}
                    {/* Tooltip on hover */}
                    {isHovered && (
                      <g>
                        <rect
                          x={segX + bucketWidth / 2 - 40}
                          y={laneY - 22}
                          width="80"
                          height="18"
                          rx="4"
                          fill="var(--chrome-bg)"
                          stroke="var(--chrome-border)"
                          strokeWidth="1"
                        />
                        <text
                          x={segX + bucketWidth / 2}
                          y={laneY - 10}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fontSize="9"
                          fill="var(--chrome-text)"
                        >
                          {seg.ageMin}+: {seg.episodes} ep{seg.episodes !== 1 ? 's' : ''}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* Child's actual age marker - dashed vertical line */}
              <line
                x1={ageLineX}
                y1={laneY - 2}
                x2={ageLineX}
                y2={laneY + LANE_HEIGHT + 2}
                stroke="var(--chrome-text)"
                strokeWidth="1.5"
                strokeDasharray="3 2"
                opacity="0.6"
              />
            </g>
          );
        })}

        {/* Legend */}
        {(() => {
          const legendY = HEADER_HEIGHT + insights.length * (LANE_HEIGHT + LANE_GAP) + AXIS_HEIGHT;
          return (
            <g>
              {/* Teal legend */}
              <rect
                x={LABEL_WIDTH}
                y={legendY}
                width="12"
                height="12"
                rx="2"
                fill={TEAL}
                opacity="0.7"
              />
              <text
                x={LABEL_WIDTH + 16}
                y={legendY + 6}
                dominantBaseline="middle"
                fontSize="10"
                fill="var(--chrome-text-secondary)"
              >
                Age appropriate
              </text>

              {/* Amber legend */}
              <rect
                x={LABEL_WIDTH + 110}
                y={legendY}
                width="12"
                height="12"
                rx="2"
                fill={AMBER}
                opacity="0.7"
              />
              <text
                x={LABEL_WIDTH + 126}
                y={legendY + 6}
                dominantBaseline="middle"
                fontSize="10"
                fill="var(--chrome-text-secondary)"
              >
                Above age
              </text>

              {/* Dashed line legend */}
              <line
                x1={LABEL_WIDTH + 210}
                y1={legendY + 6}
                x2={LABEL_WIDTH + 224}
                y2={legendY + 6}
                stroke="var(--chrome-text)"
                strokeWidth="1.5"
                strokeDasharray="3 2"
                opacity="0.6"
              />
              <text
                x={LABEL_WIDTH + 228}
                y={legendY + 6}
                dominantBaseline="middle"
                fontSize="10"
                fill="var(--chrome-text-secondary)"
              >
                Child's age
              </text>
            </g>
          );
        })()}
      </svg>
    </div>
  );
}
