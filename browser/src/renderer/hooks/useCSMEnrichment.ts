import { useState, useEffect, useCallback, useRef } from 'react';
import { ipc } from '../lib/ipc';
import type { CSMCachedReview } from '../lib/ipc';

export interface UseCSMEnrichmentResult {
  reviews: Map<string, CSMCachedReview>;
  isEnriching: boolean;
  enrichedCount: number;
  totalCount: number;
  triggerEnrichment: (titles: string[]) => void;
}

function normalizeTitle(title: string): string {
  return title.toLowerCase().trim();
}

export function useCSMEnrichment(): UseCSMEnrichmentResult {
  const [reviews, setReviews] = useState<Map<string, CSMCachedReview>>(new Map());
  const [isEnriching, setIsEnriching] = useState(false);
  const [enrichedCount, setEnrichedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const mountedRef = useRef(true);

  // Load cached reviews on mount
  useEffect(() => {
    mountedRef.current = true;

    if (!ipc) return;

    ipc.getCSMCachedReviews().then((result) => {
      if (!mountedRef.current) return;
      if (result.success && result.data) {
        const map = new Map<string, CSMCachedReview>();
        for (const review of result.data) {
          map.set(normalizeTitle(review.title), review);
        }
        setReviews(map);
        setEnrichedCount(result.data.length);
      }
    });

    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Subscribe to enrichment events
  useEffect(() => {
    if (!ipc) return;

    const unsubUpdate = ipc.onCSMEnrichmentUpdate((data) => {
      if (!mountedRef.current) return;
      if (data.review) {
        setReviews((prev) => {
          const next = new Map(prev);
          next.set(normalizeTitle(data.title), data.review!);
          return next;
        });
      }
      setEnrichedCount((prev) => prev + 1);
    });

    const unsubComplete = ipc.onCSMEnrichmentComplete(() => {
      if (!mountedRef.current) return;
      setIsEnriching(false);
    });

    return () => {
      unsubUpdate();
      unsubComplete();
    };
  }, []);

  const triggerEnrichment = useCallback((titles: string[]) => {
    if (!ipc) return;

    const unique = Array.from(new Set(titles.map(normalizeTitle)));
    setTotalCount(unique.length);
    setEnrichedCount(0);
    setIsEnriching(true);

    ipc.enrichCSMTitles(unique).catch(() => {
      if (mountedRef.current) {
        setIsEnriching(false);
      }
    });
  }, []);

  return { reviews, isEnriching, enrichedCount, totalCount, triggerEnrichment };
}
