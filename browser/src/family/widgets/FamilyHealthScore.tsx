import React, { useMemo } from 'react';

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

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function scoreColor(score: number): string {
  if (score < 40) return '#ef4444';
  if (score < 70) return '#f59e0b';
  return '#10b981';
}

function scoreLabel(score: number): string {
  if (score < 40) return 'Needs Attention';
  if (score < 70) return 'Fair';
  if (score < 85) return 'Good';
  return 'Excellent';
}

interface BreakdownBarProps {
  label: string;
  value: number;
  color: string;
}

function BreakdownBar({ label, value, color }: BreakdownBarProps) {
  const clamped = clamp(Math.round(value), 0, 100);
  return (
    <div className="flex items-center gap-3">
      <span
        className="text-xs w-[120px] text-right shrink-0"
        style={{ color: 'var(--chrome-text-secondary)' }}
      >
        {label}
      </span>
      <div
        className="flex-1 h-2 rounded-full overflow-hidden"
        style={{ backgroundColor: 'var(--chrome-border)' }}
      >
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${clamped}%`, backgroundColor: color }}
        />
      </div>
      <span
        className="text-xs w-8 tabular-nums"
        style={{ color: 'var(--chrome-text-secondary)' }}
      >
        {clamped}
      </span>
    </div>
  );
}

export function FamilyHealthScore({ insights }: { insights: ChildInsight[] }) {
  const { overall, ageScore, qualityScore, positiveScore } = useMemo(() => {
    const totalAboveAge = insights.reduce((sum, i) => sum + i.aboveAge.length, 0);
    const totalMatched = insights.reduce((sum, i) => sum + i.matched, 0);
    const totalHighQuality = insights.reduce((sum, i) => sum + i.highQuality, 0);
    const totalPositiveCategories = insights.reduce(
      (sum, i) => sum + i.positiveContentSummary.reduce((s, p) => s + p.count, 0),
      0
    );

    if (totalMatched === 0) {
      return { overall: 100, ageScore: 100, qualityScore: 100, positiveScore: 100 };
    }

    const age = clamp(100 - (totalAboveAge / totalMatched) * 100, 0, 100);
    const quality = clamp((totalHighQuality / totalMatched) * 100, 0, 100);
    const positive = clamp((totalPositiveCategories / (totalMatched * 6)) * 100, 0, 100);
    const composite = clamp(Math.round(age * 0.4 + quality * 0.3 + positive * 0.3), 0, 100);

    return { overall: composite, ageScore: age, qualityScore: quality, positiveScore: positive };
  }, [insights]);

  // SVG arc parameters
  const width = 200;
  const height = 120;
  const cx = 100;
  const cy = 105;
  const radius = 80;
  const strokeWidth = 14;

  // Arc from 180deg to 0deg (left to right semicircle)
  const startAngle = Math.PI;
  const endAngle = 0;
  const sweepAngle = startAngle - endAngle;
  const filledAngle = startAngle - sweepAngle * (overall / 100);

  const arcX1 = cx + radius * Math.cos(startAngle);
  const arcY1 = cy - radius * Math.sin(startAngle);
  const arcX2 = cx + radius * Math.cos(endAngle);
  const arcY2 = cy - radius * Math.sin(endAngle);

  const filledX = cx + radius * Math.cos(filledAngle);
  const filledY = cy - radius * Math.sin(filledAngle);
  const largeArc = overall > 50 ? 1 : 0;

  const bgPath = `M ${arcX1} ${arcY1} A ${radius} ${radius} 0 1 1 ${arcX2} ${arcY2}`;
  const filledPath = `M ${arcX1} ${arcY1} A ${radius} ${radius} 0 ${largeArc} 1 ${filledX} ${filledY}`;

  const color = scoreColor(overall);

  return (
    <div
      className="rounded-xl p-5"
      style={{
        backgroundColor: 'var(--chrome-surface)',
        border: '1px solid var(--chrome-border)',
      }}
    >
      <h3
        className="text-sm font-semibold mb-4"
        style={{ color: 'var(--chrome-text)' }}
      >
        Family Health Score
      </h3>

      <div className="flex justify-center">
        <svg className="w-full max-w-[200px]" style={{ aspectRatio: `${width} / ${height}` }} viewBox={`0 0 ${width} ${height}`}>
          {/* Background arc */}
          <path
            d={bgPath}
            fill="none"
            stroke="var(--chrome-border)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Filled arc */}
          {overall > 0 && (
            <path
              d={filledPath}
              fill="none"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
          )}
          {/* Score text */}
          <text
            x={cx}
            y={cy - 20}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={color}
            fontSize="36"
            fontWeight="700"
            fontFamily="system-ui, sans-serif"
          >
            {overall}
          </text>
          <text
            x={cx}
            y={cy + 6}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="var(--chrome-text-secondary)"
            fontSize="12"
            fontFamily="system-ui, sans-serif"
          >
            {scoreLabel(overall)}
          </text>
        </svg>
      </div>

      <div className="flex flex-col gap-2 mt-4">
        <BreakdownBar
          label="Age Appropriate"
          value={ageScore}
          color={scoreColor(ageScore)}
        />
        <BreakdownBar
          label="Content Quality"
          value={qualityScore}
          color={scoreColor(qualityScore)}
        />
        <BreakdownBar
          label="Positive Content"
          value={positiveScore}
          color={scoreColor(positiveScore)}
        />
      </div>
    </div>
  );
}
