/**
 * ActivityPanel — shows per-child Netflix viewing history.
 * Rendered inside the FamilyOverview "Activity" tab.
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { ipc } from '../lib/ipc';
import type { ChildActivity, ProfileMappingInput, CSMCachedReview } from '../lib/ipc';
import { useCSMEnrichment } from '../hooks/useCSMEnrichment';
import { CSMBadge } from './CSMBadge';

interface ActivityPanelProps {
  hasNetflixCreds: boolean;
  hasMappings: boolean;
  childMappings: ProfileMappingInput[];
}

export function ActivityPanel({ hasNetflixCreds, hasMappings, childMappings }: ActivityPanelProps) {
  const [activities, setActivities] = useState<ChildActivity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const { reviews, isEnriching, enrichedCount, totalCount, triggerEnrichment } = useCSMEnrichment();

  // Load persisted activity on mount
  useEffect(() => {
    if (!ipc || activities.length > 0) return;
    ipc.loadNetflixActivity().then((result) => {
      if (result.success && result.data && result.data.length > 0) {
        setActivities(result.data);
        // Show when it was last fetched
        const mostRecent = result.data.reduce((latest, act) =>
          act.fetchedAt > latest ? act.fetchedAt : latest, '');
        if (mostRecent) setLastFetched(new Date(mostRecent));
      }
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchActivity = useCallback(async () => {
    if (!ipc) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await ipc.fetchNetflixActivity(childMappings);
      if (result.success && result.data) {
        setActivities(result.data);
        setLastFetched(new Date());
      } else {
        setError(result.error || 'Failed to fetch activity');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch activity');
    } finally {
      setIsLoading(false);
    }
  }, [childMappings]);

  // Auto-trigger CSM enrichment when activities are fetched
  useEffect(() => {
    if (activities.length === 0) return;
    const titles = new Set<string>();
    for (const act of activities) {
      for (const entry of act.entries) {
        titles.add(entry.seriesTitle || entry.title);
      }
    }
    if (titles.size > 0) {
      triggerEnrichment(Array.from(titles));
    }
  }, [activities, triggerEnrichment]);

  if (!hasNetflixCreds) {
    return (
      <div className="py-6 text-center animate-fade-in">
        <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-white/[0.04] flex items-center justify-center">
          <svg className="w-5 h-5 text-white/20" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
        </div>
        <p className="text-[12px] text-white/40">Sign in to Netflix first</p>
        <p className="text-[10px] text-white/25 mt-1">Save your Netflix credentials in the streaming services panel</p>
      </div>
    );
  }

  if (!hasMappings || childMappings.length === 0) {
    return (
      <div className="py-6 text-center animate-fade-in">
        <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-white/[0.04] flex items-center justify-center">
          <svg className="w-5 h-5 text-white/20" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
          </svg>
        </div>
        <p className="text-[12px] text-white/40">Configure Netflix first</p>
        <p className="text-[10px] text-white/25 mt-1">Run the Netflix config wizard to map profiles to children</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header with fetch button */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {lastFetched && (
            <span className="text-[10px] text-white/25">
              Updated {formatTimeAgo(lastFetched)}
            </span>
          )}
        </div>
        <button
          onClick={fetchActivity}
          disabled={isLoading}
          className="text-[11px] text-teal-400 hover:text-teal-300 active:text-teal-500 transition-colors duration-150 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <span className="animate-spin inline-block w-3 h-3 border border-teal-400/30 border-t-teal-400 rounded-full" />
              Fetching...
            </>
          ) : (
            <>
              <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              {activities.length > 0 ? 'Refresh' : 'Fetch Activity'}
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="mb-3 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 animate-fade-in">
          <span className="text-[11px] text-red-400">{error}</span>
        </div>
      )}

      {/* Activity cards per child */}
      {activities.length > 0 ? (
        <div className="space-y-3">
          {activities.map((activity) => (
            <ChildActivityCard
              key={activity.childId}
              activity={activity}
              reviews={reviews}
              isEnriching={isEnriching}
              enrichedCount={enrichedCount}
              totalCount={totalCount}
            />
          ))}
        </div>
      ) : !isLoading ? (
        <div className="py-4 text-center">
          <p className="text-[11px] text-white/30">
            Click &ldquo;Fetch Activity&rdquo; to see what your children have been watching
          </p>
        </div>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ChildActivityCard
// ---------------------------------------------------------------------------

interface ChildActivityCardProps {
  activity: ChildActivity;
  reviews: Map<string, CSMCachedReview>;
  isEnriching: boolean;
  enrichedCount: number;
  totalCount: number;
}

function ChildActivityCard({ activity, reviews, isEnriching, enrichedCount, totalCount }: ChildActivityCardProps) {
  const [expanded, setExpanded] = useState(false);
  const displayEntries = expanded ? activity.entries : activity.entries.slice(0, 10);

  // Compute per-child CSM summary
  const csmSummary = useMemo(() => {
    let rated = 0;
    let appropriate = 0;
    const uniqueTitles = new Set<string>();
    for (const entry of activity.entries) {
      const key = (entry.seriesTitle || entry.title).toLowerCase().trim();
      if (uniqueTitles.has(key)) continue;
      uniqueTitles.add(key);
      const review = reviews.get(key);
      if (review) {
        rated++;
        // Consider age-appropriate if ageRangeMin <= 13 (rough default since we don't have childAge here)
        if (review.isFamilyFriendly) {
          appropriate++;
        }
      }
    }
    return { rated, total: uniqueTitles.size, appropriate };
  }, [activity.entries, reviews]);

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden animate-field-enter">
      {/* Child header */}
      <div className="flex items-center gap-2.5 px-3 py-2.5 border-b border-white/[0.04]">
        {activity.avatarUrl ? (
          <img
            src={activity.avatarUrl}
            alt={activity.childName}
            className="w-7 h-7 rounded-full flex-shrink-0"
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-teal-400/15 flex items-center justify-center flex-shrink-0">
            <span className="text-[11px] font-bold text-teal-300">
              {activity.childName.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="text-[12px] font-medium text-white truncate">{activity.childName}</div>
          <div className="text-[10px] text-white/30 truncate">
            Netflix profile: {activity.profileName}
          </div>
        </div>
        <span className="text-[10px] text-white/20 flex-shrink-0">
          {activity.entries.length} titles
        </span>
      </div>

      {/* CSM enrichment summary bar */}
      {(csmSummary.rated > 0 || isEnriching) && (
        <div className="px-3 py-2 border-b border-white/[0.04] animate-fade-in">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-white/40">
              {isEnriching
                ? `Rating titles... ${enrichedCount} / ${totalCount}`
                : `${csmSummary.rated} of ${csmSummary.total} unique titles rated`}
            </span>
            {csmSummary.rated > 0 && (
              <span className="text-[10px] text-emerald-400/70">
                {csmSummary.appropriate} family friendly
              </span>
            )}
          </div>
          {/* Progress bar */}
          <div className="h-1 rounded-full bg-white/[0.04] overflow-hidden">
            <div
              className="h-full rounded-full bg-teal-400/40 transition-all duration-300"
              style={{
                width: `${totalCount > 0 ? (enrichedCount / totalCount) * 100 : (csmSummary.rated / Math.max(csmSummary.total, 1)) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Entries list */}
      {activity.entries.length > 0 ? (
        <div className="divide-y divide-white/[0.03]">
          {displayEntries.map((entry, i) => {
            const lookupKey = (entry.seriesTitle || entry.title).toLowerCase().trim();
            const review = reviews.get(lookupKey);

            return (
              <div key={i} className="flex items-start gap-2.5 px-3 py-2 hover:bg-white/[0.02] transition-colors">
                <span className="text-[10px] text-white/25 w-14 flex-shrink-0 pt-0.5 tabular-nums">
                  {entry.date}
                </span>
                <div className="min-w-0 flex-1">
                  <span className="text-[11px] text-white/70 break-words">
                    {entry.title}
                  </span>
                </div>
                <div className="flex-shrink-0 pt-0.5">
                  {review ? (
                    <CSMBadge review={review} compact />
                  ) : isEnriching ? (
                    <span className="inline-block w-2.5 h-2.5 rounded-full border border-white/10 border-t-white/30 animate-spin" />
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="px-3 py-3 text-center">
          <span className="text-[11px] text-white/25">No recent viewing activity</span>
        </div>
      )}

      {/* Show more / less */}
      {activity.entries.length > 10 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full px-3 py-2 text-[10px] text-teal-400 hover:text-teal-300 hover:bg-white/[0.02] transition-colors border-t border-white/[0.04]"
        >
          {expanded ? 'Show less' : `Show all ${activity.entries.length} titles...`}
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}
