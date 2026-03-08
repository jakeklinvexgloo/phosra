/**
 * InsightsPanel — viewing analytics dashboard showing age-rating breakdown,
 * content quality, and above-age flags per child.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { ipc } from '../lib/ipc';
import type { CSMCachedReview, ChildActivity, ProfileChildMapEntry } from '../lib/ipc';

interface Child {
  id: string;
  name: string;
  birth_date: string;
}

interface InsightsPanelProps {
  children: Child[];
  reviews: Map<string, CSMCachedReview>;
  isEnriching: boolean;
  enrichedCount: number;
  totalCount: number;
  onTriggerEnrichment?: (titles: string[]) => void;
}

interface AgeBreakdown {
  ageMin: number;
  uniqueTitles: number;
  episodes: number;
}

interface AboveAgeItem {
  title: string;
  ageMin: number;
  stars: number;
  ageExplanation: string;
  parentSummary: string;
  descriptors: { category: string; level: string; numericLevel: number }[];
}

interface DescriptorAverage {
  category: string;
  avgLevel: number;
  titleCount: number;
}

interface PositiveContentSummary {
  category: string;
  count: number;
}

interface ChildInsight {
  child: Child;
  age: number;
  totalEntries: number;
  uniqueTitles: number;
  matched: number;
  aboveAge: AboveAgeItem[];
  ageBreakdown: AgeBreakdown[];
  highQuality: number;
  familyFriendly: number;
  topDescriptors: { category: string; count: number }[];
  descriptorAverages: DescriptorAverage[];
  positiveContentSummary: PositiveContentSummary[];
}

function getChildAge(birthDate: string): number {
  const bd = new Date(birthDate);
  const now = new Date();
  let age = now.getFullYear() - bd.getFullYear();
  const monthDiff = now.getMonth() - bd.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < bd.getDate())) {
    age--;
  }
  return age;
}

export function InsightsPanel({ children: kids, reviews, isEnriching, enrichedCount, totalCount, onTriggerEnrichment }: InsightsPanelProps) {
  const [activities, setActivities] = useState<ChildActivity[]>([]);
  const [profileChildMap, setProfileChildMap] = useState<ProfileChildMapEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [shallowCount, setShallowCount] = useState(0);
  const [shallowTitles, setShallowTitles] = useState<string[]>([]);

  // Load persisted viewing activity and profile-child map
  useEffect(() => {
    if (!ipc) { setLoading(false); return; }
    Promise.all([
      ipc.loadNetflixActivity(),
      ipc.loadProfileChildMap(),
    ]).then(([actResult, mapResult]) => {
      if (actResult.success && actResult.data) {
        setActivities(actResult.data);
      }
      if (mapResult.success && mapResult.data) {
        setProfileChildMap(mapResult.data);
      }
      setLoading(false);
    });
  }, []);

  // Check for shallow reviews (missing deep fields)
  useEffect(() => {
    if (!ipc) return;
    ipc.getCSMShallowReviews().then((result) => {
      if (result.success && result.data) {
        setShallowCount(result.data.count);
        setShallowTitles(result.data.titles);
      }
    });
  }, [isEnriching]); // re-check after enrichment finishes

  // Compute per-child insights
  const insights: ChildInsight[] = useMemo(() => {
    return kids.map((child) => {
      const age = getChildAge(child.birth_date);

      // Find matching activities via profile-child map (supports 1 child → multiple profiles
      // and 1 profile → multiple children)
      const matchedActivities: ChildActivity[] = [];
      for (const act of activities) {
        const mapEntry = profileChildMap.find((m) => m.profileGuid === act.profileGuid);
        if (mapEntry) {
          // Check if this child is in the map entry
          if (mapEntry.children.some((c) => c.childId === child.id)) {
            matchedActivities.push(act);
          }
        } else {
          // Fallback: match by name
          const childNameLower = child.name.toLowerCase().trim();
          const n = act.childName.toLowerCase().trim();
          if (n === childNameLower || n.endsWith(childNameLower) || childNameLower.endsWith(n)) {
            matchedActivities.push(act);
          }
        }
      }

      if (matchedActivities.length === 0) {
        return {
          child, age, totalEntries: 0, uniqueTitles: 0, matched: 0,
          aboveAge: [], ageBreakdown: [], highQuality: 0, familyFriendly: 0,
          topDescriptors: [], descriptorAverages: [], positiveContentSummary: [],
        };
      }

      // Merge all matched activities into one
      const allEntries = matchedActivities.flatMap((a) => a.entries);

      const uniqueTitleSet = new Set<string>();
      const titleReviewMap = new Map<string, CSMCachedReview>();

      for (const entry of allEntries) {
        const key = (entry.seriesTitle || entry.title).toLowerCase().trim();
        uniqueTitleSet.add(key);
        if (!titleReviewMap.has(key)) {
          const review = reviews.get(key);
          if (review) titleReviewMap.set(key, review);
        }
      }

      // Age breakdown
      const ageBuckets = new Map<number, { titles: Set<string>; episodes: number }>();
      const aboveAge: AboveAgeItem[] = [];
      let highQuality = 0;
      let familyFriendly = 0;
      const descriptorCounts = new Map<string, number>();
      // For descriptor averages: accumulate totals per category
      const descriptorSums = new Map<string, { total: number; count: number }>();
      // For positive content summary
      const positiveCounts = new Map<string, number>();

      for (const [title, review] of titleReviewMap) {
        const ageMin = review.ageRangeMin;
        if (!ageBuckets.has(ageMin)) {
          ageBuckets.set(ageMin, { titles: new Set(), episodes: 0 });
        }
        ageBuckets.get(ageMin)!.titles.add(title);

        // Count episodes for this title
        const eps = allEntries.filter((e) =>
          (e.seriesTitle || e.title).toLowerCase().trim() === title
        ).length;
        ageBuckets.get(ageMin)!.episodes += eps;

        if (ageMin > age) {
          aboveAge.push({
            title: review.title,
            ageMin,
            stars: review.qualityStars,
            ageExplanation: review.ageExplanation || '',
            parentSummary: review.parentSummary || '',
            descriptors: (review.descriptors || []).map((d) => ({
              category: d.category,
              level: d.level,
              numericLevel: d.numericLevel,
            })),
          });
        }
        if (review.qualityStars >= 4) highQuality++;
        if (review.isFamilyFriendly) familyFriendly++;

        for (const d of review.descriptors) {
          descriptorCounts.set(d.category, (descriptorCounts.get(d.category) || 0) + 1);
          const nl = d.numericLevel || 0;
          if (nl > 0) {
            const existing = descriptorSums.get(d.category) || { total: 0, count: 0 };
            existing.total += nl;
            existing.count += 1;
            descriptorSums.set(d.category, existing);
          }
        }

        for (const p of (review.positiveContent || [])) {
          positiveCounts.set(p.category, (positiveCounts.get(p.category) || 0) + 1);
        }
      }

      const ageBreakdown = Array.from(ageBuckets.entries())
        .map(([ageMin, data]) => ({
          ageMin,
          uniqueTitles: data.titles.size,
          episodes: data.episodes,
        }))
        .sort((a, b) => a.ageMin - b.ageMin);

      const topDescriptors = Array.from(descriptorCounts.entries())
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6);

      const descriptorAverages: DescriptorAverage[] = Array.from(descriptorSums.entries())
        .map(([category, { total, count }]) => ({
          category,
          avgLevel: count > 0 ? total / count : 0,
          titleCount: count,
        }))
        .sort((a, b) => b.avgLevel - a.avgLevel);

      const positiveContentSummary: PositiveContentSummary[] = Array.from(positiveCounts.entries())
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count);

      return {
        child, age,
        totalEntries: allEntries.length,
        uniqueTitles: uniqueTitleSet.size,
        matched: titleReviewMap.size,
        aboveAge: aboveAge.sort((a, b) => b.ageMin - a.ageMin),
        ageBreakdown,
        highQuality,
        familyFriendly,
        topDescriptors,
        descriptorAverages,
        positiveContentSummary,
      };
    }).filter((i) => i.totalEntries > 0);
  }, [kids, activities, reviews]);

  if (loading) {
    return (
      <div className="py-6 text-center">
        <span className="text-[12px] text-white/40 animate-pulse">Loading insights...</span>
      </div>
    );
  }

  if (insights.length === 0) {
    return (
      <div className="py-6 text-center animate-fade-in">
        <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-white/[0.04] flex items-center justify-center">
          <svg className="w-5 h-5 text-white/20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
          </svg>
        </div>
        <p className="text-[12px] text-white/40">No viewing data yet</p>
        <p className="text-[10px] text-white/25 mt-1">Fetch Netflix activity from the Activity tab first</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Enrichment progress */}
      {isEnriching && (
        <div className="px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06]">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-white/40">
              Rating titles... {enrichedCount} / {totalCount}
            </span>
          </div>
          <div className="h-1 rounded-full bg-white/[0.04] overflow-hidden">
            <div
              className="h-full rounded-full bg-teal-400/40 transition-all duration-300"
              style={{ width: `${totalCount > 0 ? (enrichedCount / totalCount) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      {/* Shallow review banner */}
      {!isEnriching && shallowCount > 0 && (
        <div className="px-3 py-2 rounded-lg bg-amber-400/[0.06] border border-amber-400/[0.12] flex items-center justify-between gap-2">
          <span className="text-[10px] text-amber-300/70">
            {shallowCount} review{shallowCount !== 1 ? 's' : ''} need{shallowCount === 1 ? 's' : ''} deep data update
          </span>
          <button
            onClick={() => {
              if (onTriggerEnrichment && shallowTitles.length > 0) {
                onTriggerEnrichment(shallowTitles);
              }
            }}
            className="text-[10px] px-2 py-0.5 rounded bg-amber-400/15 text-amber-300/80 hover:bg-amber-400/25 transition-colors flex-shrink-0"
          >
            Refresh
          </button>
        </div>
      )}

      {insights.map((insight) => (
        <ChildInsightCard key={insight.child.id} insight={insight} defaultExpanded={insights.length === 1} />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ChildInsightCard
// ---------------------------------------------------------------------------

function ChildInsightCard({ insight, defaultExpanded }: { insight: ChildInsight; defaultExpanded: boolean }) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const matchPct = insight.uniqueTitles > 0
    ? Math.round((insight.matched / insight.uniqueTitles) * 100)
    : 0;

  const hasBarCharts = insight.ageBreakdown.length > 0 || insight.descriptorAverages.length > 0;
  const hasTextSections = insight.aboveAge.length > 0 || insight.topDescriptors.length > 0 || insight.positiveContentSummary.length > 0;

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden animate-field-enter">
      {/* Header — clickable to collapse/expand */}
      <div
        className="flex items-center gap-2.5 px-3 py-2.5 cursor-pointer select-none hover:bg-white/[0.02] transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="w-7 h-7 rounded-full bg-teal-400/15 flex items-center justify-center flex-shrink-0">
          <span className="text-[11px] font-bold text-teal-300">
            {insight.child.name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[12px] font-medium text-white truncate">{insight.child.name}</div>
          <div className="text-[10px] text-white/30">Age {insight.age}</div>
        </div>
        {/* Collapsed summary badges */}
        {!expanded && (
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/[0.04] text-white/40 tabular-nums">
              {insight.uniqueTitles} titles
            </span>
            {insight.aboveAge.length > 0 && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-400/10 text-amber-400/70 tabular-nums">
                {insight.aboveAge.length} above-age
              </span>
            )}
          </div>
        )}
        <span className={`text-[10px] text-white/20 transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-90' : ''}`}>
          {'\u25B6'}
        </span>
      </div>

      {expanded && (
        <>
          {/* Stats grid */}
          <div className="grid grid-cols-4 gap-px bg-white/[0.03] border-t border-white/[0.04]">
            <StatCell label="Titles" value={insight.uniqueTitles} />
            <StatCell label="Rated" value={`${matchPct}%`} sub={`${insight.matched}/${insight.uniqueTitles}`} />
            <StatCell
              label="Quality 4+"
              value={insight.highQuality}
              color={insight.highQuality > 0 ? 'text-emerald-400' : undefined}
            />
            <StatCell
              label="Above Age"
              value={insight.aboveAge.length}
              color={insight.aboveAge.length > 0 ? 'text-amber-400' : 'text-emerald-400'}
            />
          </div>

          {/* Two-column layout for desktop (~900px panel) */}
          {(hasBarCharts || hasTextSections) && (
            <div className="grid grid-cols-2 border-t border-white/[0.04]">
              {/* Left column: bar charts (age breakdown + content profile) */}
              <div className="border-r border-white/[0.04]">
                {/* Age rating breakdown bar chart */}
                {insight.ageBreakdown.length > 0 && (
                  <div className="px-3 py-2.5">
                    <span className="text-[10px] font-semibold text-white/30 uppercase tracking-wider">
                      Age Rating Breakdown
                    </span>
                    <div className="mt-2 space-y-1.5">
                      {insight.ageBreakdown.map((bucket) => {
                        const maxEps = Math.max(...insight.ageBreakdown.map((b) => b.episodes));
                        const pct = maxEps > 0 ? (bucket.episodes / maxEps) * 100 : 0;
                        const isAbove = bucket.ageMin > insight.age;

                        return (
                          <div key={bucket.ageMin} className="flex items-center gap-2">
                            <span className={`text-[10px] w-8 text-right tabular-nums ${isAbove ? 'text-amber-400' : 'text-white/40'}`}>
                              {bucket.ageMin}+
                            </span>
                            <div className="flex-1 h-3 rounded-sm bg-white/[0.04] overflow-hidden">
                              <div
                                className={`h-full rounded-sm transition-all duration-500 ${
                                  isAbove ? 'bg-amber-400/40' : 'bg-teal-400/30'
                                }`}
                                style={{ width: `${Math.max(pct, 4)}%` }}
                              />
                            </div>
                            <span className="text-[9px] text-white/25 w-16 tabular-nums">
                              {bucket.uniqueTitles}t / {bucket.episodes}ep
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Content Profile — descriptor averages */}
                {insight.descriptorAverages.length > 0 && (
                  <div className={`px-3 py-2.5 ${insight.ageBreakdown.length > 0 ? 'border-t border-white/[0.04]' : ''}`}>
                    <span className="text-[10px] font-semibold text-white/30 uppercase tracking-wider">
                      Content Profile
                    </span>
                    <div className="mt-2 space-y-1.5">
                      {insight.descriptorAverages.map((d) => {
                        const pct = d.avgLevel > 0 ? (d.avgLevel / 5) * 100 : 0;
                        const isHigh = d.avgLevel >= 3;
                        return (
                          <div key={d.category} className="flex items-center gap-2">
                            <span className={`text-[10px] w-20 truncate ${isHigh ? 'text-amber-400/70' : 'text-white/40'}`}>
                              {d.category}
                            </span>
                            <div className="flex-1 h-3 rounded-sm bg-white/[0.04] overflow-hidden">
                              <div
                                className={`h-full rounded-sm transition-all duration-500 ${
                                  isHigh ? 'bg-amber-400/40' : 'bg-teal-400/30'
                                }`}
                                style={{ width: `${Math.max(pct, 4)}%` }}
                              />
                            </div>
                            <span className="text-[9px] text-white/25 w-14 tabular-nums text-right">
                              {d.avgLevel > 0 ? d.avgLevel.toFixed(1) : '—'} / 5
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Right column: text-heavy sections */}
              <div>
                {/* Above-age flags (expandable) */}
                {insight.aboveAge.length > 0 && (
                  <AboveAgeSection items={insight.aboveAge} />
                )}

                {/* Content themes */}
                {insight.topDescriptors.length > 0 && (
                  <div className={`px-3 py-2.5 ${insight.aboveAge.length > 0 ? 'border-t border-white/[0.04]' : ''}`}>
                    <span className="text-[10px] font-semibold text-white/30 uppercase tracking-wider">
                      Content Themes
                    </span>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {insight.topDescriptors.map((d) => (
                        <span
                          key={d.category}
                          className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/[0.04] text-white/35"
                        >
                          {d.category} ({d.count})
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Positive Content summary */}
                {insight.positiveContentSummary.length > 0 && (
                  <div className={`px-3 py-2.5 ${(insight.aboveAge.length > 0 || insight.topDescriptors.length > 0) ? 'border-t border-white/[0.04]' : ''}`}>
                    <span className="text-[10px] font-semibold text-emerald-400/60 uppercase tracking-wider">
                      Positive Content
                    </span>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {insight.positiveContentSummary.map((p) => (
                        <span
                          key={p.category}
                          className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-400/[0.08] text-emerald-400/50"
                        >
                          {p.category} ({p.count})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Family friendly summary — full width bottom bar */}
          {insight.matched > 0 && (
            <div className="px-3 py-2 border-t border-white/[0.04] flex items-center gap-2">
              <div className="flex-1 h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-400/40 transition-all duration-500"
                  style={{ width: `${(insight.familyFriendly / insight.matched) * 100}%` }}
                />
              </div>
              <span className="text-[9px] text-emerald-400/60 flex-shrink-0">
                {Math.round((insight.familyFriendly / insight.matched) * 100)}% family friendly
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// AboveAgeSection — expandable above-age content list
// ---------------------------------------------------------------------------

function AboveAgeSection({ items }: { items: AboveAgeItem[] }) {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  return (
    <div className="px-3 py-2.5">
      <span className="text-[10px] font-semibold text-amber-400/60 uppercase tracking-wider">
        Above-Age Content
      </span>
      <div className="mt-1.5 space-y-1">
        {items.map((item, i) => {
          const isExpanded = expandedIdx === i;
          const hasDetail = item.ageExplanation || item.parentSummary || item.descriptors.length > 0;

          return (
            <div key={i}>
              <div
                className={`flex items-center gap-2 ${hasDetail ? 'cursor-pointer hover:bg-white/[0.02] -mx-1 px-1 rounded' : ''}`}
                onClick={() => hasDetail && setExpandedIdx(isExpanded ? null : i)}
              >
                {hasDetail && (
                  <span className={`text-[8px] text-white/20 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}>
                    {'\u25B6'}
                  </span>
                )}
                <span className="text-[10px] text-amber-400/80">
                  {item.ageMin}+
                </span>
                <span className="text-[10px] text-white/50 flex-1 truncate">
                  {item.title}
                </span>
                {item.stars > 0 && (
                  <span className="text-[9px] text-white/25 tabular-nums flex-shrink-0">
                    {'\u2605'.repeat(item.stars)}{'\u2606'.repeat(5 - item.stars)}
                  </span>
                )}
              </div>

              {/* Expandable detail */}
              {isExpanded && hasDetail && (
                <div className="ml-4 mt-1.5 mb-2 pl-2 border-l border-white/[0.06] space-y-2 animate-fade-in">
                  {item.ageExplanation && (
                    <div>
                      <span className="text-[9px] font-semibold text-amber-400/50 uppercase tracking-wider">
                        Why {item.ageMin}+?
                      </span>
                      <p className="text-[10px] text-white/40 mt-0.5 leading-relaxed">
                        {item.ageExplanation}
                      </p>
                    </div>
                  )}
                  {item.parentSummary && (
                    <div>
                      <span className="text-[9px] font-semibold text-white/30 uppercase tracking-wider">
                        Parents Need to Know
                      </span>
                      <p className="text-[10px] text-white/40 mt-0.5 leading-relaxed">
                        {item.parentSummary}
                      </p>
                    </div>
                  )}
                  {item.descriptors.length > 0 && (
                    <div>
                      <span className="text-[9px] font-semibold text-white/30 uppercase tracking-wider">
                        Content Levels
                      </span>
                      <div className="mt-1 space-y-1">
                        {item.descriptors.map((d, di) => (
                          <div key={di} className="flex items-center gap-1.5">
                            <span className="text-[9px] text-white/35 w-16 truncate">{d.category}</span>
                            <div className="flex gap-0.5">
                              {[1, 2, 3, 4, 5].map((dot) => (
                                <div
                                  key={dot}
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    dot <= d.numericLevel
                                      ? d.numericLevel >= 4 ? 'bg-amber-400/70' : d.numericLevel >= 3 ? 'bg-amber-400/40' : 'bg-teal-400/40'
                                      : 'bg-white/[0.06]'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-[8px] text-white/20">{d.level}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// StatCell
// ---------------------------------------------------------------------------

function StatCell({ label, value, sub, color }: {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}) {
  return (
    <div className="px-2.5 py-2 text-center bg-white/[0.01]">
      <div className={`text-[14px] font-semibold tabular-nums ${color || 'text-white/80'}`}>
        {value}
      </div>
      <div className="text-[9px] text-white/25 mt-0.5">{label}</div>
      {sub && <div className="text-[8px] text-white/15 mt-0.5">{sub}</div>}
    </div>
  );
}
