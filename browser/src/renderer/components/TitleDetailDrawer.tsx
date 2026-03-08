/**
 * TitleDetailDrawer — slide-up panel showing full CSM review data for a single title.
 * Triggered when a title is clicked from InsightsPanel.
 */

import React, { useState, useEffect } from 'react';
import type { CSMCachedReview } from '../lib/ipc';

interface TitleDetailDrawerProps {
  review: CSMCachedReview;
  childAge: number;
  onClose: () => void;
}

export function TitleDetailDrawer({ review, childAge, onClose }: TitleDetailDrawerProps) {
  const [visible, setVisible] = useState(false);

  // Trigger slide-up animation on mount
  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const isAboveAge = review.ageRangeMin > childAge;

  function handleClose() {
    setVisible(false);
    setTimeout(onClose, 200);
  }

  return (
    <div
      className={`absolute inset-x-0 bottom-0 z-50 max-h-[85%] flex flex-col rounded-t-xl border border-white/[0.08] bg-[#1a1a2e] shadow-2xl transition-transform duration-200 ease-out ${
        visible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-start gap-2 px-3 py-2.5 border-b border-white/[0.06] flex-shrink-0">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-semibold text-white/90 truncate">
              {review.title}
            </span>
            {/* Age rating badge */}
            <span
              className={`text-[9px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${
                isAboveAge
                  ? 'bg-amber-400/20 text-amber-400'
                  : 'bg-teal-400/20 text-teal-300'
              }`}
            >
              {review.ageRangeMin}+
            </span>
          </div>

          {/* Quality stars */}
          <div className="mt-0.5">
            <span className="text-[10px] tabular-nums">
              {Array.from({ length: 5 }, (_, i) => (
                <span
                  key={i}
                  className={i < review.qualityStars ? 'text-amber-400' : 'text-white/15'}
                >
                  {'\u2605'}
                </span>
              ))}
            </span>
            {review.csmMediaType && (
              <span className="text-[9px] text-white/25 ml-2">{review.csmMediaType}</span>
            )}
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          className="w-6 h-6 rounded-full bg-white/[0.06] flex items-center justify-center flex-shrink-0 hover:bg-white/[0.12] transition-colors"
        >
          <svg className="w-3 h-3 text-white/40" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 2l8 8M10 2l-8 8" />
          </svg>
        </button>
      </div>

      {/* ── Scrollable content ─────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-3 py-2.5 space-y-3 scrollbar-thin">

        {/* Parents Need to Know */}
        {review.parentSummary && (
          <Section title="Parents Need to Know">
            <p className="text-[10px] leading-[1.5] text-white/60">{review.parentSummary}</p>
          </Section>
        )}

        {/* Why Age X+? */}
        {review.ageExplanation && (
          <Section title={`Why Age ${review.ageRangeMin}+?`}>
            <p className="text-[10px] leading-[1.5] text-white/60">{review.ageExplanation}</p>
          </Section>
        )}

        {/* Content Descriptors */}
        {review.descriptors.length > 0 && (
          <Section title="Content Descriptors">
            <div className="space-y-2">
              {review.descriptors.map((d, i) => (
                <div key={i}>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-white/50 w-24 flex-shrink-0 truncate">
                      {d.category}
                    </span>
                    {/* Dot indicators */}
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }, (_, j) => (
                        <span
                          key={j}
                          className={`inline-block w-1.5 h-1.5 rounded-full ${
                            j < d.numericLevel ? 'bg-teal-400/70' : 'bg-white/10'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[9px] text-white/30 flex-shrink-0">{d.level}</span>
                  </div>
                  {d.description && (
                    <p className="text-[9px] leading-[1.4] text-white/35 mt-0.5 pl-[104px]">
                      {d.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Positive Content */}
        {review.positiveContent.length > 0 && (
          <Section title="Positive Content">
            <div className="space-y-1.5">
              {review.positiveContent.map((pc, i) => (
                <div key={i}>
                  <span className="text-[10px] font-medium text-teal-300/70">{pc.category}</span>
                  {pc.description && (
                    <p className="text-[9px] leading-[1.4] text-white/40 mt-0.5">{pc.description}</p>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Review Summary */}
        {review.reviewBody && (
          <Section title="Review Summary">
            <p className="text-[10px] leading-[1.5] text-white/60">{review.reviewBody}</p>
          </Section>
        )}

        {/* Bottom padding for scroll comfort */}
        <div className="h-2" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section — reusable heading + content block
// ---------------------------------------------------------------------------

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="text-[10px] font-semibold text-white/30 uppercase tracking-wider">
        {title}
      </span>
      <div className="mt-1">{children}</div>
    </div>
  );
}
