/**
 * Family Dashboard — full-page experience rendered at phosra://family.
 *
 * Layout: narrow sidebar (children list) + main content area.
 * Shows auth gate when not logged in, onboarding when no family,
 * and per-child insights when data is available.
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { FamilyHealthScore } from './widgets/FamilyHealthScore';
import { SpilloverDetector } from './widgets/SpilloverDetector';
import WatchTogetherRecs from './widgets/WatchTogetherRecs';
import ConversationCards from './widgets/ConversationCards';
import ContentRadar from './widgets/ContentRadar';
import SiblingOverlap from './widgets/SiblingOverlap';
import PositiveHighlights from './widgets/PositiveHighlights';
import AgeRatingDrift from './widgets/AgeRatingDrift';
import ViewingPulse from './widgets/ViewingPulse';
import ActivityHeatmap from './widgets/ActivityHeatmap';
import BingeRadar from './widgets/BingeRadar';
import RewatchRadar from './widgets/RewatchRadar';
import AgeDriftTracker from './widgets/AgeDriftTracker';
import ContentDietRibbon from './widgets/ContentDietRibbon';
import WeeklyDigest from './widgets/WeeklyDigest';
import EpisodeSparklines from './widgets/EpisodeSparklines';
import QualityOverTime from './widgets/QualityOverTime';
import MilestoneCards from './widgets/MilestoneCards';

// ---------------------------------------------------------------------------
// Collapsible Section (mobile accordion)
// ---------------------------------------------------------------------------

function CollapsibleSection({
  title,
  defaultOpen = true,
  children: content,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="md:contents">
      {/* Accordion header -- only visible on mobile */}
      <button
        onClick={() => setOpen(!open)}
        className="md:hidden w-full flex items-center justify-between py-2 text-xs font-semibold uppercase tracking-wider text-[var(--chrome-text-secondary)]"
      >
        {title}
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {/* On desktop: always visible. On mobile: toggled. */}
      <div className={`${open ? 'block' : 'hidden'} md:contents space-y-4 md:space-y-0`}>
        {content}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AuthInfo {
  email: string;
  isLoggedIn: boolean;
  expiresAt: string;
}

interface Family {
  id: string;
  name: string;
  created_at: string;
}

interface Child {
  id: string;
  name: string;
  birth_date: string;
}

interface FamilyMember {
  id: string;
  family_id: string;
  user_id: string;
  role: string;
  email?: string;
  name?: string;
  display_name?: string;
  joined_at: string;
}

interface ChildActivity {
  childName: string;
  childId: string;
  profileGuid: string;
  profileName: string;
  avatarUrl: string;
  entries: { title: string; seriesTitle?: string; date: string }[];
}

interface CSMDescriptor {
  category: string;
  level: string;
  numericLevel: number;
  description: string;
}

interface CSMPositiveContent {
  category: string;
  description: string;
}

interface CSMCachedReview {
  title: string;
  ageRating: string;
  ageRangeMin: number;
  qualityStars: number;
  isFamilyFriendly: boolean;
  parentSummary: string;
  ageExplanation: string;
  descriptors: CSMDescriptor[];
  positiveContent: CSMPositiveContent[];
}

interface ProfileChildMapEntry {
  profileGuid: string;
  profileName: string;
  children: { childId: string; childName: string }[];
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
  episodes: number;
  ageExplanation: string;
  parentSummary: string;
  descriptors: { category: string; level: string; numericLevel: number }[];
}

interface TitleWatchCount {
  title: string;
  displayTitle: string;
  episodes: number;
  ageMin: number | null;
  stars: number;
  isFamilyFriendly: boolean;
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
  titleWatchCounts: TitleWatchCount[];
}

// ---------------------------------------------------------------------------
// API bridge
// ---------------------------------------------------------------------------

declare global {
  interface Window {
    phosraFamily?: {
      getAuthStatus: () => Promise<AuthInfo>;
      logout: () => Promise<unknown>;
      onAuthStatusChanged: (cb: (data: AuthInfo) => void) => () => void;
      listFamilies: () => Promise<{ success: boolean; data?: Family[] }>;
      listFamilyChildren: (familyId: string) => Promise<{ success: boolean; data?: Child[] }>;
      listFamilyMembers: (familyId: string) => Promise<{ success: boolean; data?: FamilyMember[] }>;
      addChild: (familyId: string, name: string, birthDate: string) => Promise<{ success: boolean; data?: Child }>;
      updateChild: (childId: string, name: string, birthDate: string) => Promise<{ success: boolean }>;
      quickSetup: (req: unknown) => Promise<{ success: boolean; data?: unknown }>;
      loadNetflixActivity: () => Promise<{ success: boolean; data?: ChildActivity[] }>;
      loadProfileChildMap: () => Promise<{ success: boolean; data?: ProfileChildMapEntry[] }>;
      getCSMCachedReviews: () => Promise<{ success: boolean; data?: CSMCachedReview[] }>;
      getCSMShallowReviews: () => Promise<{ success: boolean; data?: { count: number; titles: string[] } }>;
      enrichCSMTitles: (titles: string[]) => Promise<{ success: boolean }>;
      onCSMEnrichmentUpdate: (cb: (data: { title: string; review?: CSMCachedReview }) => void) => () => void;
      onCSMEnrichmentComplete: (cb: () => void) => () => void;
      navigateTo: (url: string) => Promise<unknown>;
      listCredentials: () => Promise<{ serviceId: string; hasPassword: boolean }[]>;
    };
  }
}

const api = typeof window !== 'undefined' ? window.phosraFamily : undefined;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getChildAge(birthDate: string): number {
  const bd = new Date(birthDate);
  const now = new Date();
  let age = now.getFullYear() - bd.getFullYear();
  const monthDiff = now.getMonth() - bd.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < bd.getDate())) age--;
  return age;
}

function normalizeTitle(t: string): string {
  return t.toLowerCase().trim();
}

function computeInsights(
  kids: Child[],
  activities: ChildActivity[],
  profileChildMap: ProfileChildMapEntry[],
  reviews: Map<string, CSMCachedReview>,
): ChildInsight[] {
  return kids.map((child) => {
    const age = getChildAge(child.birth_date);

    const matchedActivities: ChildActivity[] = [];
    for (const act of activities) {
      const mapEntry = profileChildMap.find((m) => m.profileGuid === act.profileGuid);
      if (mapEntry) {
        if (mapEntry.children.some((c) => c.childId === child.id)) matchedActivities.push(act);
      } else {
        const cn = child.name.toLowerCase().trim();
        const an = act.childName.toLowerCase().trim();
        if (an === cn || an.endsWith(cn) || cn.endsWith(an)) matchedActivities.push(act);
      }
    }

    if (matchedActivities.length === 0) {
      return {
        child, age, totalEntries: 0, uniqueTitles: 0, matched: 0,
        aboveAge: [], ageBreakdown: [], highQuality: 0, familyFriendly: 0,
        topDescriptors: [], descriptorAverages: [], positiveContentSummary: [],
        titleWatchCounts: [],
      };
    }

    const allEntries = matchedActivities.flatMap((a) => a.entries);
    const uniqueTitleSet = new Set<string>();
    const titleReviewMap = new Map<string, CSMCachedReview>();
    // Track episode/watch counts per title
    const titleEpCounts = new Map<string, { display: string; count: number }>();

    for (const entry of allEntries) {
      const key = normalizeTitle(entry.seriesTitle || entry.title);
      uniqueTitleSet.add(key);
      const existing = titleEpCounts.get(key);
      if (existing) {
        existing.count++;
      } else {
        titleEpCounts.set(key, { display: entry.seriesTitle || entry.title, count: 1 });
      }
      if (!titleReviewMap.has(key)) {
        const review = reviews.get(key);
        if (review) titleReviewMap.set(key, review);
      }
    }

    const ageBuckets = new Map<number, { titles: Set<string>; episodes: number }>();
    const aboveAge: AboveAgeItem[] = [];
    let highQuality = 0;
    let familyFriendly = 0;
    const descriptorCounts = new Map<string, number>();
    const descriptorSums = new Map<string, { total: number; count: number }>();
    const positiveCounts = new Map<string, number>();

    for (const [title, review] of titleReviewMap) {
      const ageMin = review.ageRangeMin;
      if (!ageBuckets.has(ageMin)) ageBuckets.set(ageMin, { titles: new Set(), episodes: 0 });
      ageBuckets.get(ageMin)!.titles.add(title);
      const eps = allEntries.filter((e) => normalizeTitle(e.seriesTitle || e.title) === title).length;
      ageBuckets.get(ageMin)!.episodes += eps;

      if (ageMin > age) {
        const epCount = titleEpCounts.get(title)?.count || eps;
        aboveAge.push({
          title: review.title, ageMin, stars: review.qualityStars, episodes: epCount,
          ageExplanation: review.ageExplanation || '', parentSummary: review.parentSummary || '',
          descriptors: (review.descriptors || []).map((d) => ({ category: d.category, level: d.level, numericLevel: d.numericLevel })),
        });
      }
      if (review.qualityStars >= 4) highQuality++;
      if (review.isFamilyFriendly) familyFriendly++;

      for (const d of review.descriptors) {
        descriptorCounts.set(d.category, (descriptorCounts.get(d.category) || 0) + 1);
        if (d.numericLevel > 0) {
          const ex = descriptorSums.get(d.category) || { total: 0, count: 0 };
          ex.total += d.numericLevel;
          ex.count += 1;
          descriptorSums.set(d.category, ex);
        }
      }
      for (const p of (review.positiveContent || [])) {
        positiveCounts.set(p.category, (positiveCounts.get(p.category) || 0) + 1);
      }
    }

    return {
      child, age,
      totalEntries: allEntries.length,
      uniqueTitles: uniqueTitleSet.size,
      matched: titleReviewMap.size,
      aboveAge: aboveAge.sort((a, b) => b.ageMin - a.ageMin),
      ageBreakdown: Array.from(ageBuckets.entries())
        .map(([ageMin, d]) => ({ ageMin, uniqueTitles: d.titles.size, episodes: d.episodes }))
        .sort((a, b) => a.ageMin - b.ageMin),
      highQuality, familyFriendly,
      topDescriptors: Array.from(descriptorCounts.entries())
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count).slice(0, 6),
      descriptorAverages: Array.from(descriptorSums.entries())
        .map(([category, { total, count }]) => ({ category, avgLevel: count > 0 ? total / count : 0, titleCount: count }))
        .sort((a, b) => b.avgLevel - a.avgLevel),
      positiveContentSummary: Array.from(positiveCounts.entries())
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count),
      titleWatchCounts: Array.from(titleEpCounts.entries())
        .map(([key, { display, count }]) => {
          const review = titleReviewMap.get(key);
          return {
            title: key,
            displayTitle: review?.title || display,
            episodes: count,
            ageMin: review?.ageRangeMin ?? null,
            stars: review?.qualityStars ?? 0,
            isFamilyFriendly: review?.isFamilyFriendly ?? false,
          };
        })
        .sort((a, b) => b.episodes - a.episodes),
    };
  }).filter((i) => i.totalEntries > 0);
}

// ---------------------------------------------------------------------------
// Main Page Component
// ---------------------------------------------------------------------------

export function FamilyDashboardPage() {
  // Auth
  const [auth, setAuth] = useState<AuthInfo | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Family data
  const [families, setFamilies] = useState<Family[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [familyLoading, setFamilyLoading] = useState(false);

  // Viewing data
  const [activities, setActivities] = useState<ChildActivity[]>([]);
  const [profileChildMap, setProfileChildMap] = useState<ProfileChildMapEntry[]>([]);
  const [reviews, setReviews] = useState<Map<string, CSMCachedReview>>(new Map());
  const [shallowCount, setShallowCount] = useState(0);
  const [shallowTitles, setShallowTitles] = useState<string[]>([]);
  const [isEnriching, setIsEnriching] = useState(false);
  const [enrichedCount, setEnrichedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  // UI
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const mountedRef = useRef(true);

  // --- Auth ---
  useEffect(() => {
    mountedRef.current = true;
    if (!api) { setAuthLoading(false); return; }
    api.getAuthStatus().then((info) => {
      if (mountedRef.current) { setAuth(info); setAuthLoading(false); }
    });
    const unsub = api.onAuthStatusChanged((info) => {
      if (mountedRef.current) setAuth(info);
    });
    return () => { mountedRef.current = false; unsub(); };
  }, []);

  const isLoggedIn = auth?.isLoggedIn ?? false;

  // --- Family data ---
  const refreshFamily = useCallback(async () => {
    if (!api || !isLoggedIn) return;
    setFamilyLoading(true);
    try {
      const fRes = await api.listFamilies();
      if (fRes.success && fRes.data) {
        setFamilies(fRes.data);
        if (fRes.data.length > 0) {
          const fid = fRes.data[0].id;
          const [cRes, mRes] = await Promise.all([
            api.listFamilyChildren(fid),
            api.listFamilyMembers(fid),
          ]);
          if (cRes.success && cRes.data) setChildren(cRes.data);
          if (mRes.success && mRes.data) setMembers(mRes.data);
        }
      }
    } catch { /* ignore */ }
    setFamilyLoading(false);
  }, [isLoggedIn]);

  useEffect(() => { refreshFamily(); }, [refreshFamily]);

  // --- Activity + reviews ---
  useEffect(() => {
    if (!api || !isLoggedIn) return;
    Promise.all([
      api.loadNetflixActivity(),
      api.loadProfileChildMap(),
      api.getCSMCachedReviews(),
      api.getCSMShallowReviews(),
    ]).then(([actRes, mapRes, revRes, shallowRes]) => {
      if (actRes.success && actRes.data) setActivities(actRes.data);
      if (mapRes.success && mapRes.data) setProfileChildMap(mapRes.data);
      if (revRes.success && revRes.data) {
        const m = new Map<string, CSMCachedReview>();
        for (const r of revRes.data) m.set(normalizeTitle(r.title), r);
        setReviews(m);
      }
      if (shallowRes.success && shallowRes.data) {
        setShallowCount(shallowRes.data.count);
        setShallowTitles(shallowRes.data.titles);
      }
    });
  }, [isLoggedIn]);

  // --- CSM enrichment events ---
  useEffect(() => {
    if (!api) return;
    const unsub1 = api.onCSMEnrichmentUpdate((data) => {
      if (data.review) {
        setReviews((prev) => {
          const next = new Map(prev);
          next.set(normalizeTitle(data.title), data.review!);
          return next;
        });
      }
      setEnrichedCount((p) => p + 1);
    });
    const unsub2 = api.onCSMEnrichmentComplete(() => {
      setIsEnriching(false);
      // Refresh shallow count
      api.getCSMShallowReviews().then((res) => {
        if (res.success && res.data) {
          setShallowCount(res.data.count);
          setShallowTitles(res.data.titles);
        }
      });
    });
    return () => { unsub1(); unsub2(); };
  }, []);

  const triggerEnrichment = useCallback((titles: string[]) => {
    if (!api) return;
    const unique = Array.from(new Set(titles.map(normalizeTitle)));
    setTotalCount(unique.length);
    setEnrichedCount(0);
    setIsEnriching(true);
    api.enrichCSMTitles(unique).catch(() => setIsEnriching(false));
  }, []);

  // --- Compute insights ---
  const insights = useMemo(
    () => computeInsights(children, activities, profileChildMap, reviews),
    [children, activities, profileChildMap, reviews],
  );

  // Start on overview (no child selected) — user clicks a child to drill in

  const selectedInsight = insights.find((i) => i.child.id === selectedChildId);

  // --- Loading / Auth gate ---
  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[var(--chrome-accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-teal-400/10 flex items-center justify-center">
          <svg className="w-7 h-7 text-teal-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
        <h1 className="text-xl font-semibold">Family Dashboard</h1>
        <p className="text-sm text-[var(--chrome-text-secondary)] max-w-xs text-center">
          Sign in to Phosra to view your family's content insights and safety settings.
        </p>
        <button
          onClick={() => api?.navigateTo('https://www.phosra.com/login')}
          className="mt-2 px-6 py-2.5 rounded-xl bg-[var(--chrome-accent)] hover:bg-[var(--chrome-accent-hover)] text-white text-sm font-medium transition-colors"
        >
          Sign In
        </button>
      </div>
    );
  }

  if (familyLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[var(--chrome-accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (families.length === 0) {
    return <OnboardingView onComplete={refreshFamily} />;
  }

  const handleSelectChild = (id: string | null) => {
    setSelectedChildId(id);
    setSidebarOpen(false); // close drawer on mobile after selection
  };

  const selectedChildName = selectedInsight
    ? selectedInsight.child.name
    : selectedChildId
      ? children.find((c) => c.id === selectedChildId)?.name
      : null;

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — drawer on mobile, static on md+ */}
      <Sidebar
        children={children}
        members={members}
        insights={insights}
        selectedChildId={selectedChildId}
        onSelectChild={handleSelectChild}
        familyName={families[0]?.name}
        userEmail={auth?.email}
        onLogout={() => api?.logout().then(() => setAuth({ email: '', isLoggedIn: false, expiresAt: '' }))}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content */}
      <main className="flex-1 overflow-y-auto flex flex-col min-w-0">
        {/* Sticky mobile header — hidden on md+ */}
        <div className="sticky top-0 z-30 md:hidden flex items-center gap-3 px-4 py-3 border-b border-[var(--chrome-border)] bg-[var(--chrome-surface)]">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--chrome-hover)] transition-colors"
            aria-label="Open menu"
          >
            <svg className="w-5 h-5 text-[var(--chrome-text)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold truncate">
              {selectedChildName || families[0]?.name || 'Family'}
            </div>
            {selectedChildName && (
              <div className="text-[10px] text-[var(--chrome-text-secondary)]">
                {families[0]?.name || 'Family'}
              </div>
            )}
          </div>
          {selectedChildId && (
            <button
              onClick={() => handleSelectChild(null)}
              className="text-xs px-2.5 py-1 rounded-lg bg-[var(--chrome-hover)] text-[var(--chrome-text-secondary)] hover:text-[var(--chrome-text)] transition-colors"
            >
              Overview
            </button>
          )}
        </div>

        <div className="flex-1">
          {selectedInsight ? (
            <ChildDetailView
              insight={selectedInsight}
              isEnriching={isEnriching}
              enrichedCount={enrichedCount}
              totalCount={totalCount}
              shallowCount={shallowCount}
              onTriggerEnrichment={() => triggerEnrichment(shallowTitles)}
            />
          ) : selectedChildId ? (
            <div className="h-full flex flex-col items-center justify-center gap-3 text-[var(--chrome-text-secondary)]">
              <svg className="w-10 h-10 opacity-30" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
              <p className="text-sm">No viewing data yet for this child</p>
              <p className="text-xs opacity-50">Fetch Netflix activity to see insights</p>
            </div>
          ) : (
            <OverviewView
              insights={insights}
              onSelectChild={handleSelectChild}
              activities={activities}
              profileChildMap={profileChildMap}
              reviews={reviews}
              children={children}
              familyName={families[0]?.name}
            />
          )}
        </div>
      </main>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sidebar
// ---------------------------------------------------------------------------

function Sidebar({
  children: kids,
  members,
  insights,
  selectedChildId,
  onSelectChild,
  familyName,
  userEmail,
  onLogout,
  isOpen,
  onClose,
}: {
  children: Child[];
  members: FamilyMember[];
  insights: ChildInsight[];
  selectedChildId: string | null;
  onSelectChild: (id: string | null) => void;
  familyName?: string;
  userEmail?: string;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <aside className={`
      w-56 flex-shrink-0 border-r border-[var(--chrome-border)] bg-[var(--chrome-surface)] flex flex-col
      fixed inset-y-0 left-0 z-50 transition-transform duration-200 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      md:static md:translate-x-0 md:z-auto
    `}>
      {/* Header */}
      <div className="px-4 pt-5 pb-3">
        {/* Mobile close button */}
        <button
          onClick={onClose}
          className="md:hidden absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[var(--chrome-hover)] transition-colors"
          aria-label="Close menu"
        >
          <svg className="w-4 h-4 text-[var(--chrome-text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => onSelectChild(null)}>
          <div className="w-8 h-8 rounded-lg bg-teal-400/15 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-teal-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold truncate">{familyName || 'My Family'}</div>
            <div className="text-[10px] text-[var(--chrome-text-secondary)] truncate">{userEmail}</div>
          </div>
        </div>
      </div>

      {/* Children list */}
      <div className="px-2 flex-1 overflow-y-auto">
        <button
          onClick={() => onSelectChild(null)}
          className={`
            w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-colors mb-1
            ${selectedChildId === null
              ? 'bg-[var(--chrome-accent)]/10 text-[var(--chrome-accent)]'
              : 'hover:bg-[var(--chrome-hover)] text-[var(--chrome-text)]'
            }
          `}
        >
          <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
            selectedChildId === null ? 'bg-[var(--chrome-accent)]/20' : 'bg-teal-400/10'
          }`}>
            <svg className={`w-3.5 h-3.5 ${selectedChildId === null ? 'text-[var(--chrome-accent)]' : 'text-teal-400'}`} viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
          </div>
          <span className="text-[13px] font-medium">Overview</span>
        </button>

        <div className="px-2 py-1.5 text-[10px] font-semibold text-[var(--chrome-text-secondary)] uppercase tracking-wider">
          Children
        </div>
        {kids.map((child) => {
          const insight = insights.find((i) => i.child.id === child.id);
          const isSelected = child.id === selectedChildId;
          const age = getChildAge(child.birth_date);

          return (
            <button
              key={child.id}
              onClick={() => onSelectChild(child.id)}
              className={`
                w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-colors mb-0.5
                ${isSelected
                  ? 'bg-[var(--chrome-accent)]/10 text-[var(--chrome-accent)]'
                  : 'hover:bg-[var(--chrome-hover)] text-[var(--chrome-text)]'
                }
              `}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                isSelected ? 'bg-[var(--chrome-accent)]/20' : 'bg-teal-400/10'
              }`}>
                <span className={`text-xs font-bold ${isSelected ? 'text-[var(--chrome-accent)]' : 'text-teal-400'}`}>
                  {child.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-medium truncate">{child.name}</div>
                <div className="text-[10px] text-[var(--chrome-text-secondary)]">Age {age}</div>
              </div>
              {insight && insight.aboveAge.length > 0 && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-400/10 text-amber-400 tabular-nums flex-shrink-0">
                  {insight.aboveAge.length}
                </span>
              )}
            </button>
          );
        })}

        {kids.length === 0 && (
          <div className="px-3 py-4 text-center text-[11px] text-[var(--chrome-text-secondary)]">
            No children added yet
          </div>
        )}
      </div>

      {/* Members section */}
      {members.length > 0 && (
        <div className="px-2 pb-2 border-t border-[var(--chrome-border)]">
          <div className="px-2 py-1.5 mt-2 text-[10px] font-semibold text-[var(--chrome-text-secondary)] uppercase tracking-wider">
            Guardians
          </div>
          {members.map((m) => (
            <div key={m.id} className="flex items-center gap-2 px-3 py-1.5">
              <div className="w-5 h-5 rounded-full bg-[var(--chrome-hover)] flex items-center justify-center flex-shrink-0">
                <span className="text-[9px] font-medium text-[var(--chrome-text-secondary)]">
                  {(m.display_name || m.email || '?').charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-[11px] text-[var(--chrome-text-secondary)] truncate">
                {m.display_name || m.email || 'Unknown'}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Logout */}
      <div className="px-3 py-3 border-t border-[var(--chrome-border)]">
        <button
          onClick={onLogout}
          className="w-full text-[11px] text-[var(--chrome-text-secondary)] hover:text-[var(--chrome-text)] transition-colors text-left px-1"
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}

// ---------------------------------------------------------------------------
// Overview View (no child selected — shows family summary)
// ---------------------------------------------------------------------------

interface ChildViewingData {
  childId: string;
  childName: string;
  age: number;
  entries: { title: string; date: string; seriesTitle?: string }[];
}

function OverviewView({
  insights,
  onSelectChild,
  activities,
  profileChildMap,
  reviews,
  children: kids,
  familyName,
}: {
  insights: ChildInsight[];
  onSelectChild: (id: string) => void;
  activities: ChildActivity[];
  profileChildMap: ProfileChildMapEntry[];
  reviews: Map<string, CSMCachedReview>;
  children: Child[];
  familyName?: string;
}) {
  // Build childData for timeline widgets (maps activities to children with parsed dates)
  const childData: ChildViewingData[] = useMemo(() => {
    return kids.map((child, idx) => {
      const age = getChildAge(child.birth_date);
      const matchedActivities: ChildActivity[] = [];
      for (const act of activities) {
        const mapEntry = profileChildMap.find((m) => m.profileGuid === act.profileGuid);
        if (mapEntry) {
          if (mapEntry.children.some((c) => c.childId === child.id)) matchedActivities.push(act);
        } else {
          const cn = child.name.toLowerCase().trim();
          const an = act.childName.toLowerCase().trim();
          if (an === cn || an.endsWith(cn) || cn.endsWith(an)) matchedActivities.push(act);
        }
      }
      const allEntries = matchedActivities.flatMap((a) => a.entries);
      return {
        childId: child.id,
        childName: child.name,
        age,
        entries: allEntries.map((e) => ({
          title: e.title,
          date: e.date,
          seriesTitle: e.seriesTitle,
        })),
      };
    }).filter((c) => c.entries.length > 0);
  }, [kids, activities, profileChildMap]);

  // Build CSM review lookup for timeline widgets
  const reviewLookup = useMemo(() => {
    const map = new Map<string, { ageRangeMin: number; qualityStars: number; isFamilyFriendly?: boolean }>();
    for (const [key, review] of reviews) {
      map.set(key, {
        ageRangeMin: review.ageRangeMin,
        qualityStars: review.qualityStars,
        isFamilyFriendly: review.isFamilyFriendly,
      });
    }
    return map;
  }, [reviews]);

  if (insights.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6 md:px-8 md:py-8 animate-fade-in">
        <h2 className="text-lg font-semibold mb-6">Family Overview</h2>
        <div className="text-center py-12 text-[var(--chrome-text-secondary)]">
          <p className="text-sm">No viewing data available yet</p>
          <p className="text-xs mt-1 opacity-60">Connect Netflix and fetch activity to see insights</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 md:px-8 md:py-8 animate-fade-in space-y-4 md:space-y-6">
      {/* Weekly Digest — hero card */}
      <WeeklyDigest childData={childData} insights={insights} familyName={familyName} />

      {/* Row 1: Health Score + Spillover alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <FamilyHealthScore insights={insights} />
        <SpilloverDetector insights={insights} />
      </div>

      {/* Milestone achievements */}
      <MilestoneCards childData={childData} reviews={reviewLookup} />

      {/* Episode Sparklines — compact per-child overview */}
      <EpisodeSparklines childData={childData} />

      {/* Viewing Pulse — stacked area chart (full width) */}
      <ViewingPulse childData={childData} />

      {/* ── Viewing Patterns (collapsible on mobile) ── */}
      <CollapsibleSection title="Viewing Patterns" defaultOpen={true}>
        {/* Activity Heatmap — GitHub-style (full width) */}
        <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
          <ActivityHeatmap childData={childData} />
        </div>

        {/* Row 2: Age Drift + Quality Over Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <AgeDriftTracker childData={childData} reviews={reviewLookup} />
          <QualityOverTime childData={childData} reviews={reviewLookup} />
        </div>
      </CollapsibleSection>

      {/* ── Deep Dive (collapsed by default on mobile) ── */}
      <CollapsibleSection title="Deep Dive" defaultOpen={false}>
        {/* Binge Radar + Content Diet Ribbon */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <BingeRadar childData={childData} />
          <ContentDietRibbon childData={childData} />
        </div>

        {/* Rewatch Radar (full width) */}
        <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
          <RewatchRadar childData={childData} />
        </div>

        {/* Content Radar + Sibling Overlap */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <ContentRadar insights={insights} />
          <SiblingOverlap insights={insights} />
        </div>

        {/* Age Rating Drift (original, full width) */}
        <AgeRatingDrift insights={insights} />
      </CollapsibleSection>

      {/* ── Engagement (collapsed by default on mobile) ── */}
      <CollapsibleSection title="Engagement" defaultOpen={false}>
        {/* Watch Together Recommendations */}
        <WatchTogetherRecs insights={insights} />

        {/* Conversation Cards + Positive Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <ConversationCards insights={insights} />
          <PositiveHighlights insights={insights} />
        </div>
      </CollapsibleSection>

      {/* Per-child quick links */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--chrome-text-secondary)] mb-3">
          Individual Reports
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {insights.map((insight) => (
            <button
              key={insight.child.id}
              onClick={() => onSelectChild(insight.child.id)}
              className="flex items-center gap-3 p-3 rounded-xl border border-[var(--chrome-border)] bg-[var(--chrome-surface)] hover:bg-[var(--chrome-hover)] transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-full bg-teal-400/15 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-teal-400">
                  {insight.child.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">{insight.child.name}</div>
                <div className="text-[11px] text-[var(--chrome-text-secondary)]">
                  Age {insight.age} — {insight.uniqueTitles} titles
                </div>
              </div>
              {insight.aboveAge.length > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-400/10 text-amber-400 tabular-nums flex-shrink-0">
                  {insight.aboveAge.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Child Detail View
// ---------------------------------------------------------------------------

function ChildDetailView({
  insight,
  isEnriching,
  enrichedCount,
  totalCount,
  shallowCount,
  onTriggerEnrichment,
}: {
  insight: ChildInsight;
  isEnriching: boolean;
  enrichedCount: number;
  totalCount: number;
  shallowCount: number;
  onTriggerEnrichment: () => void;
}) {
  const matchPct = insight.uniqueTitles > 0
    ? Math.round((insight.matched / insight.uniqueTitles) * 100)
    : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:px-8 md:py-8 animate-fade-in">
      {/* Child header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-full bg-teal-400/15 flex items-center justify-center flex-shrink-0">
          <span className="text-lg font-bold text-teal-400">
            {insight.child.name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <h2 className="text-lg font-semibold">{insight.child.name}</h2>
          <p className="text-sm text-[var(--chrome-text-secondary)]">Age {insight.age}</p>
        </div>
      </div>

      {/* Enrichment progress */}
      {isEnriching && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-[var(--chrome-surface)] border border-[var(--chrome-border)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[var(--chrome-text-secondary)]">
              Rating titles... {enrichedCount} / {totalCount}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-[var(--chrome-hover)] overflow-hidden">
            <div
              className="h-full rounded-full bg-teal-400/60 transition-all duration-300"
              style={{ width: `${totalCount > 0 ? (enrichedCount / totalCount) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      {/* Shallow review banner */}
      {!isEnriching && shallowCount > 0 && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-amber-400/[0.06] border border-amber-400/[0.12] flex items-center justify-between gap-3">
          <span className="text-xs text-amber-400/80">
            {shallowCount} review{shallowCount !== 1 ? 's' : ''} need{shallowCount === 1 ? 's' : ''} deep data update
          </span>
          <button
            onClick={onTriggerEnrichment}
            className="text-xs px-3 py-1 rounded-lg bg-amber-400/15 text-amber-400/90 hover:bg-amber-400/25 transition-colors flex-shrink-0"
          >
            Refresh
          </button>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 mb-6">
        <StatCard label="Titles Tracked" value={insight.uniqueTitles} />
        <StatCard label="Rated" value={`${matchPct}%`} sub={`${insight.matched}/${insight.uniqueTitles}`} />
        <StatCard label="Quality 4+" value={insight.highQuality} color={insight.highQuality > 0 ? 'emerald' : undefined} />
        <StatCard
          label="Above Age"
          value={insight.aboveAge.length}
          color={insight.aboveAge.length > 0 ? 'amber' : 'emerald'}
        />
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Left: Charts */}
        <div className="space-y-6">
          {insight.ageBreakdown.length > 0 && (
            <ChartPanel title="Age Rating Breakdown">
              <div className="space-y-2.5">
                {insight.ageBreakdown.map((bucket) => {
                  const maxEps = Math.max(...insight.ageBreakdown.map((b) => b.episodes));
                  const pct = maxEps > 0 ? (bucket.episodes / maxEps) * 100 : 0;
                  const isAbove = bucket.ageMin > insight.age;

                  return (
                    <div key={bucket.ageMin} className="flex items-center gap-3">
                      <span className={`text-xs w-8 text-right tabular-nums font-medium ${isAbove ? 'text-amber-400' : 'text-[var(--chrome-text-secondary)]'}`}>
                        {bucket.ageMin}+
                      </span>
                      <div className="flex-1 h-5 rounded bg-[var(--chrome-hover)] overflow-hidden">
                        <div
                          className={`h-full rounded transition-all duration-500 ${isAbove ? 'bg-amber-400/50' : 'bg-teal-400/40'}`}
                          style={{ width: `${Math.max(pct, 4)}%` }}
                        />
                      </div>
                      <span className="text-[11px] text-[var(--chrome-text-secondary)] w-20 tabular-nums">
                        {bucket.uniqueTitles} title{bucket.uniqueTitles !== 1 ? 's' : ''} / {bucket.episodes} ep
                      </span>
                    </div>
                  );
                })}
              </div>
            </ChartPanel>
          )}

          {insight.descriptorAverages.length > 0 && (
            <ChartPanel title="Content Profile">
              <div className="space-y-2.5">
                {insight.descriptorAverages.map((d) => {
                  const pct = d.avgLevel > 0 ? (d.avgLevel / 5) * 100 : 0;
                  const isHigh = d.avgLevel >= 3;
                  return (
                    <div key={d.category} className="flex items-center gap-3">
                      <span className={`text-xs w-24 truncate ${isHigh ? 'text-amber-400/80' : 'text-[var(--chrome-text-secondary)]'}`}>
                        {d.category}
                      </span>
                      <div className="flex-1 h-5 rounded bg-[var(--chrome-hover)] overflow-hidden">
                        <div
                          className={`h-full rounded transition-all duration-500 ${isHigh ? 'bg-amber-400/50' : 'bg-teal-400/40'}`}
                          style={{ width: `${Math.max(pct, 4)}%` }}
                        />
                      </div>
                      <span className="text-[11px] text-[var(--chrome-text-secondary)] w-12 tabular-nums text-right">
                        {d.avgLevel > 0 ? d.avgLevel.toFixed(1) : '—'}/5
                      </span>
                    </div>
                  );
                })}
              </div>
            </ChartPanel>
          )}

          {/* Family friendly bar */}
          {insight.matched > 0 && (
            <ChartPanel title="Family Friendly">
              <div className="flex items-center gap-3">
                <div className="flex-1 h-3 rounded-full bg-[var(--chrome-hover)] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-400/50 transition-all duration-500"
                    style={{ width: `${(insight.familyFriendly / insight.matched) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-emerald-400 tabular-nums">
                  {Math.round((insight.familyFriendly / insight.matched) * 100)}%
                </span>
              </div>
            </ChartPanel>
          )}
        </div>

        {/* Right: Lists */}
        <div className="space-y-6">
          {insight.aboveAge.length > 0 && (
            <ChartPanel title="Above-Age Content" titleColor="text-amber-400/70">
              <AboveAgeList items={insight.aboveAge} />
            </ChartPanel>
          )}

          {insight.topDescriptors.length > 0 && (
            <ChartPanel title="Content Themes">
              <div className="flex flex-wrap gap-2">
                {insight.topDescriptors.map((d) => (
                  <span
                    key={d.category}
                    className="text-xs px-2.5 py-1 rounded-full bg-[var(--chrome-hover)] text-[var(--chrome-text-secondary)]"
                  >
                    {d.category} ({d.count})
                  </span>
                ))}
              </div>
            </ChartPanel>
          )}

          {insight.positiveContentSummary.length > 0 && (
            <ChartPanel title="Positive Content" titleColor="text-emerald-400/70">
              <div className="flex flex-wrap gap-2">
                {insight.positiveContentSummary.map((p) => (
                  <span
                    key={p.category}
                    className="text-xs px-2.5 py-1 rounded-full bg-emerald-400/10 text-emerald-400/70"
                  >
                    {p.category} ({p.count})
                  </span>
                ))}
              </div>
            </ChartPanel>
          )}
        </div>
      </div>

      {/* Most Watched — full width below the two-column layout */}
      {insight.titleWatchCounts.length > 0 && (
        <MostWatchedPanel items={insight.titleWatchCounts} childAge={insight.age} />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Most Watched Panel
// ---------------------------------------------------------------------------

function MostWatchedPanel({ items, childAge }: { items: TitleWatchCount[]; childAge: number }) {
  const [showAll, setShowAll] = useState(false);
  const displayed = showAll ? items : items.slice(0, 20);
  const maxEps = items.length > 0 ? items[0].episodes : 1;

  return (
    <ChartPanel title={`Viewing Log (${items.length} titles)`}>
      <div className="space-y-1">
        {displayed.map((item) => {
          const pct = (item.episodes / maxEps) * 100;
          const isAboveAge = item.ageMin !== null && item.ageMin > childAge;

          return (
            <div key={item.title} className="flex items-center gap-3 group">
              <span className={`text-xs w-[180px] truncate flex-shrink-0 ${
                isAboveAge ? 'text-amber-400/80' : 'text-[var(--chrome-text)]'
              }`} title={item.displayTitle}>
                {item.displayTitle}
              </span>
              <div className="flex-1 h-4 rounded bg-[var(--chrome-hover)] overflow-hidden">
                <div
                  className={`h-full rounded transition-all duration-300 ${
                    isAboveAge ? 'bg-amber-400/40' : 'bg-teal-400/30'
                  }`}
                  style={{ width: `${Math.max(pct, 2)}%` }}
                />
              </div>
              <span className="text-[11px] text-[var(--chrome-text-secondary)] tabular-nums w-12 text-right flex-shrink-0">
                {item.episodes === 1 ? '1 ep' : `${item.episodes} ep`}
              </span>
              {item.ageMin !== null && (
                <span className={`text-[10px] tabular-nums w-8 flex-shrink-0 ${
                  isAboveAge ? 'text-amber-400' : 'text-[var(--chrome-text-secondary)] opacity-50'
                }`}>
                  {item.ageMin}+
                </span>
              )}
            </div>
          );
        })}
      </div>
      {items.length > 20 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-3 text-xs text-[var(--chrome-accent)] hover:text-[var(--chrome-accent-hover)] transition-colors"
        >
          {showAll ? 'Show less' : `Show all ${items.length} titles`}
        </button>
      )}
    </ChartPanel>
  );
}

// ---------------------------------------------------------------------------
// Shared UI components
// ---------------------------------------------------------------------------

function StatCard({ label, value, sub, color }: {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}) {
  const colorClass = color === 'amber' ? 'text-amber-400' : color === 'emerald' ? 'text-emerald-400' : '';
  return (
    <div className="p-4 rounded-xl border border-[var(--chrome-border)] bg-[var(--chrome-surface)]">
      <div className={`text-xl font-bold tabular-nums ${colorClass}`}>{value}</div>
      <div className="text-[11px] text-[var(--chrome-text-secondary)] mt-1">{label}</div>
      {sub && <div className="text-[10px] text-[var(--chrome-text-secondary)] opacity-50 mt-0.5">{sub}</div>}
    </div>
  );
}

function ChartPanel({ title, titleColor, children }: {
  title: string;
  titleColor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="p-4 rounded-xl border border-[var(--chrome-border)] bg-[var(--chrome-surface)]">
      <h3 className={`text-xs font-semibold uppercase tracking-wider mb-3 ${titleColor || 'text-[var(--chrome-text-secondary)]'}`}>
        {title}
      </h3>
      {children}
    </div>
  );
}

function AboveAgeList({ items }: { items: AboveAgeItem[] }) {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  return (
    <div className="space-y-1.5">
      {items.map((item, i) => {
        const isExpanded = expandedIdx === i;
        const hasDetail = item.ageExplanation || item.parentSummary || item.descriptors.length > 0;

        return (
          <div key={i}>
            <div
              className={`flex items-center gap-2.5 py-1 ${hasDetail ? 'cursor-pointer hover:bg-[var(--chrome-hover)] -mx-1 px-1 rounded' : ''}`}
              onClick={() => hasDetail && setExpandedIdx(isExpanded ? null : i)}
            >
              {hasDetail && (
                <span className={`text-[10px] text-[var(--chrome-text-secondary)] transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}>
                  {'\u25B6'}
                </span>
              )}
              <span className="text-xs font-medium text-amber-400">{item.ageMin}+</span>
              <span className="text-xs text-[var(--chrome-text)] flex-1 truncate">{item.title}</span>
              <span className="text-[10px] text-[var(--chrome-text-secondary)] tabular-nums flex-shrink-0 opacity-60">
                {item.episodes === 1 ? '1x' : `${item.episodes}x`}
              </span>
              {item.stars > 0 && (
                <span className="text-[11px] text-[var(--chrome-text-secondary)] tabular-nums flex-shrink-0">
                  {'\u2605'.repeat(item.stars)}{'\u2606'.repeat(5 - item.stars)}
                </span>
              )}
            </div>

            {isExpanded && hasDetail && (
              <div className="ml-6 mt-2 mb-3 pl-3 border-l-2 border-[var(--chrome-border)] space-y-3 animate-fade-in">
                {item.ageExplanation && (
                  <div>
                    <div className="text-[10px] font-semibold text-amber-400/60 uppercase tracking-wider mb-1">
                      Why {item.ageMin}+?
                    </div>
                    <p className="text-xs text-[var(--chrome-text-secondary)] leading-relaxed">
                      {item.ageExplanation}
                    </p>
                  </div>
                )}
                {item.parentSummary && (
                  <div>
                    <div className="text-[10px] font-semibold text-[var(--chrome-text-secondary)] uppercase tracking-wider mb-1">
                      Parents Need to Know
                    </div>
                    <p className="text-xs text-[var(--chrome-text-secondary)] leading-relaxed">
                      {item.parentSummary}
                    </p>
                  </div>
                )}
                {item.descriptors.length > 0 && (
                  <div>
                    <div className="text-[10px] font-semibold text-[var(--chrome-text-secondary)] uppercase tracking-wider mb-1.5">
                      Content Levels
                    </div>
                    <div className="space-y-1.5">
                      {item.descriptors.map((d, di) => (
                        <div key={di} className="flex items-center gap-2">
                          <span className="text-[11px] text-[var(--chrome-text-secondary)] w-20 truncate">{d.category}</span>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((dot) => (
                              <div
                                key={dot}
                                className={`w-2 h-2 rounded-full ${
                                  dot <= d.numericLevel
                                    ? d.numericLevel >= 4 ? 'bg-amber-400' : d.numericLevel >= 3 ? 'bg-amber-400/50' : 'bg-teal-400/50'
                                    : 'bg-[var(--chrome-hover)]'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-[10px] text-[var(--chrome-text-secondary)] opacity-60">{d.level}</span>
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
  );
}

// ---------------------------------------------------------------------------
// Onboarding (no family created yet)
// ---------------------------------------------------------------------------

function OnboardingView({ onComplete }: { onComplete: () => void }) {
  const [childName, setChildName] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!api || !childName.trim() || !birthYear) return;
    setIsSubmitting(true);
    setError('');
    try {
      const birthDate = `${birthYear}-01-01`;
      const result = await api.quickSetup({
        familyName: 'My Family',
        children: [{ name: childName.trim(), birthDate }],
      });
      if (result.success) {
        onComplete();
      } else {
        setError('Failed to create family');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
    setIsSubmitting(false);
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 18 }, (_, i) => currentYear - i);

  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <div className="w-full max-w-sm px-6">
        <div className="w-14 h-14 rounded-2xl bg-teal-400/10 flex items-center justify-center mx-auto mb-6">
          <svg className="w-7 h-7 text-teal-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-center mb-2">Welcome to Phosra</h1>
        <p className="text-sm text-[var(--chrome-text-secondary)] text-center mb-8">
          Add your first child to get started with content safety insights.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5 text-[var(--chrome-text-secondary)]">Child's Name</label>
            <input
              type="text"
              value={childName}
              onChange={(e) => setChildName(e.target.value)}
              placeholder="e.g. Alex"
              className="w-full h-10 px-3 rounded-lg bg-[var(--chrome-surface)] border border-[var(--chrome-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--chrome-accent)]/50 placeholder:text-[var(--chrome-text-secondary)]/50"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5 text-[var(--chrome-text-secondary)]">Birth Year</label>
            <select
              value={birthYear}
              onChange={(e) => setBirthYear(e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-[var(--chrome-surface)] border border-[var(--chrome-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--chrome-accent)]/50"
            >
              <option value="">Select year</option>
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {error && (
            <div className="text-xs text-red-400 bg-red-400/10 px-3 py-2 rounded-lg">{error}</div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !childName.trim() || !birthYear}
            className="w-full h-10 rounded-lg bg-[var(--chrome-accent)] hover:bg-[var(--chrome-accent-hover)] disabled:opacity-40 text-white text-sm font-medium transition-colors"
          >
            {isSubmitting ? 'Creating...' : 'Get Started'}
          </button>
        </form>
      </div>
    </div>
  );
}
