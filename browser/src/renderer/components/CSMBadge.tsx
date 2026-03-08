import React, { useState } from 'react';
import type { CSMCachedReview } from '../lib/ipc';

interface CSMBadgeProps {
  review: CSMCachedReview;
  childAge?: number;
  compact?: boolean;
}

function getAgeColor(ageRangeMin: number, childAge?: number) {
  if (childAge == null) {
    return { bg: 'bg-white/[0.06]', text: 'text-white/40' };
  }
  const diff = ageRangeMin - childAge;
  if (diff <= 0) {
    return { bg: 'bg-emerald-500/20', text: 'text-emerald-400' };
  }
  if (diff <= 2) {
    return { bg: 'bg-amber-500/20', text: 'text-amber-400' };
  }
  return { bg: 'bg-red-500/20', text: 'text-red-400' };
}

function QualityStars({ count }: { count: number }) {
  const stars: string[] = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(i <= count ? '\u2605' : '\u2606');
  }
  return (
    <span className="text-[10px] text-white/30 leading-none tracking-tight">
      {stars.join('')}
    </span>
  );
}

export function CSMBadge({ review, childAge, compact = false }: CSMBadgeProps) {
  const [expanded, setExpanded] = useState(false);
  const color = getAgeColor(review.ageRangeMin, childAge);

  return (
    <div className="inline-flex flex-col">
      {/* Clickable badge row */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setExpanded(!expanded);
        }}
        className="inline-flex items-center gap-1 group"
        title={`CSM: Age ${review.ageRating} — click for details`}
      >
        {/* Age chip */}
        <span
          className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium leading-none ${color.bg} ${color.text} transition-colors duration-150 group-hover:brightness-125`}
        >
          {review.ageRating}
        </span>

        {/* Quality stars (non-compact) */}
        {!compact && review.qualityStars > 0 && (
          <QualityStars count={review.qualityStars} />
        )}
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="mt-1.5 ml-0.5 p-2 rounded-lg bg-white/[0.03] border border-white/[0.06] animate-fade-in max-w-[220px]">
          {/* Title + link */}
          <div className="flex items-center justify-between gap-1 mb-1.5">
            <span className="text-[10px] font-medium text-white/60 truncate">
              {review.title}
            </span>
            <a
              href={review.csmUrl}
              onClick={(e) => e.stopPropagation()}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[9px] text-teal-400 hover:text-teal-300 flex-shrink-0 transition-colors duration-150"
            >
              CSM
            </a>
          </div>

          {/* Age + Stars row */}
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium leading-none ${color.bg} ${color.text}`}
            >
              Age {review.ageRating}
            </span>
            {review.qualityStars > 0 && (
              <QualityStars count={review.qualityStars} />
            )}
            {review.isFamilyFriendly && (
              <span className="text-[9px] text-emerald-400/60">Family friendly</span>
            )}
          </div>

          {/* Parent summary */}
          {review.parentSummary && (
            <p className="text-[10px] text-white/40 leading-relaxed mb-1.5">
              {review.parentSummary}
            </p>
          )}

          {/* Content descriptors */}
          {review.descriptors.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {review.descriptors.map((d, i) => (
                <span
                  key={i}
                  className="text-[9px] px-1 py-0.5 rounded bg-white/[0.04] text-white/30"
                >
                  {d.category}: {d.level}
                </span>
              ))}
            </div>
          )}

          {/* Collapse button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(false);
            }}
            className="mt-1.5 text-[9px] text-white/20 hover:text-white/40 transition-colors duration-150"
          >
            Collapse
          </button>
        </div>
      )}
    </div>
  );
}
