/**
 * CSM Enrichment Service — orchestrates cache lookups and background
 * scraping to enrich Netflix viewing history with Common Sense Media
 * age ratings and content descriptors.
 *
 * Pushes incremental updates to the chrome UI via IPC as each title
 * is resolved (cached or freshly scraped).
 */

import type { BaseWindow, WebContentsView } from 'electron';
import { CSMCache } from './csm-cache';
import type { CSMCachedReview } from './csm-cache';
import { CSMScraper } from './csm-scraper';
import type { CSMScrapeResult } from './csm-scraper';
import type { PhosraApiClient } from './phosra-api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CSMEnrichmentUpdate {
  title: string;
  status: 'cached' | 'scraped' | 'not-found' | 'error';
  review?: CSMCachedReview;
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export class CSMEnrichmentService {
  private readonly cache: CSMCache;
  private scraper: CSMScraper | null = null;

  private readonly parentWindow: BaseWindow;
  private readonly stealthPreloadPath: string;
  private readonly profilePath: string;
  private readonly apiClient: PhosraApiClient | null;
  private readonly chromeView: WebContentsView | null;

  constructor(
    parentWindow: BaseWindow,
    stealthPreloadPath: string,
    profilePath: string,
    apiClient: PhosraApiClient | null,
    chromeView: WebContentsView | null,
  ) {
    this.parentWindow = parentWindow;
    this.stealthPreloadPath = stealthPreloadPath;
    this.profilePath = profilePath;
    this.apiClient = apiClient;
    this.chromeView = chromeView;

    this.cache = new CSMCache(profilePath);
  }

  /**
   * Enrich a list of titles with CSM data.
   *
   * - Titles with a fresh cache hit are pushed immediately.
   * - Remaining titles are queued for background scraping.
   * - Updates are pushed via IPC as each title resolves.
   * - A final `csm:enrichment-complete` event is sent when all titles are done.
   */
  enrichTitles(titles: string[], forceRescrape = false): void {
    // Deduplicate titles
    const unique = [...new Set(titles)];
    const toScrape: string[] = [];
    const cachedReviews: CSMCachedReview[] = [];
    const scrapedBatch: CSMCachedReview[] = [];
    let pending = unique.length;
    const SYNC_BATCH_SIZE = 25; // sync to backend every 25 scraped reviews

    for (const title of unique) {
      const cached = this.findCachedByTitle(title);

      if (cached && !forceRescrape) {
        cachedReviews.push(cached);
        this.sendToChrome('csm:enrichment-update', {
          title,
          status: 'cached',
          review: cached,
        } as CSMEnrichmentUpdate);
        pending--;
      } else {
        toScrape.push(title);
      }
    }

    // Sync cached reviews to backend immediately
    if (cachedReviews.length > 0) {
      this.syncToBackend(cachedReviews);
    }

    // Nothing to scrape — we're done
    if (toScrape.length === 0) {
      this.sendToChrome('csm:enrichment-complete', {});
      return;
    }

    // Lazily create the scraper
    if (!this.scraper) {
      this.scraper = new CSMScraper(
        this.parentWindow,
        this.stealthPreloadPath,
        this.profilePath,
      );
    }

    // Enqueue titles for scraping
    this.scraper.enqueue(toScrape, (result: CSMScrapeResult) => {
      let update: CSMEnrichmentUpdate;

      if (result.found && result.review) {
        update = { title: result.title, status: 'scraped', review: result.review };
        scrapedBatch.push(result.review);

        // Sync in batches
        if (scrapedBatch.length >= SYNC_BATCH_SIZE) {
          this.syncToBackend([...scrapedBatch]);
          scrapedBatch.length = 0;
        }
      } else if (result.error) {
        update = { title: result.title, status: 'error' };
      } else {
        update = { title: result.title, status: 'not-found' };
      }

      this.sendToChrome('csm:enrichment-update', update);
      pending--;
      if (pending <= 0) {
        this.sendToChrome('csm:enrichment-complete', {});
        // Flush remaining scraped reviews
        if (scrapedBatch.length > 0) {
          this.syncToBackend([...scrapedBatch]);
          scrapedBatch.length = 0;
        }
      }
    });
  }

  /** Get all cached reviews (including stale ones). */
  getCachedReviews(): CSMCachedReview[] {
    return this.cache.getAll();
  }

  /** Get cache stats (total, fresh, stale). */
  getCacheStats(): { total: number; fresh: number; stale: number } {
    return this.cache.getStats();
  }

  /**
   * Identify "shallow" reviews — those missing deep fields added by the
   * enhanced scraper (ageExplanation, positiveContent, descriptor descriptions).
   */
  getShallowReviews(): { count: number; titles: string[] } {
    const all = this.cache.getAll();
    const shallow: string[] = [];

    for (const review of all) {
      // A review is "shallow" if it was scraped by the old scraper —
      // i.e. it lacks the positiveContent array entirely (not just empty)
      // and has no numericLevel on any descriptor.
      const hasDeepFields = 'positiveContent' in review
        && 'reviewBody' in review
        && review.descriptors.some((d) => 'numericLevel' in d);

      if (!hasDeepFields) {
        shallow.push(review.title);
      }
    }

    return { count: shallow.length, titles: shallow };
  }

  /** Destroy the scraper and free resources. */
  destroy(): void {
    if (this.scraper) {
      this.scraper.destroy();
      this.scraper = null;
    }
  }

  // -----------------------------------------------------------------------
  // Internal
  // -----------------------------------------------------------------------

  /**
   * Search the cache by title (case-insensitive).
   * Returns the first fresh match, or null.
   */
  private findCachedByTitle(title: string): CSMCachedReview | null {
    const normalised = title.toLowerCase().trim();
    const all = this.cache.getAll();

    for (const review of all) {
      if (review.title.toLowerCase().trim() === normalised) {
        // Check freshness (reuse the 30-day rule)
        const scraped = new Date(review.scrapedAt).getTime();
        if (Date.now() - scraped <= 30 * 24 * 60 * 60 * 1000) {
          return review;
        }
      }
    }

    return null;
  }

  /**
   * Sync CSM reviews to the backend DB, then link viewing_history entries.
   * Batches at 25 reviews per request to avoid payload/param limits.
   */
  private syncToBackend(reviews: CSMCachedReview[]): void {
    if (!this.apiClient || reviews.length === 0) return;

    const BATCH = 25;
    const allPayload = reviews.map((r) => ({
      csm_slug: r.csmSlug,
      csm_url: r.csmUrl,
      csm_media_type: r.csmMediaType,
      title: r.title,
      age_rating: r.ageRating,
      age_range_min: r.ageRangeMin,
      quality_stars: r.qualityStars,
      is_family_friendly: r.isFamilyFriendly,
      review_summary: r.reviewSummary,
      review_body: r.reviewBody || '',
      parent_summary: r.parentSummary,
      age_explanation: r.ageExplanation || '',
      descriptors_json: r.descriptors,
      positive_content: r.positiveContent || [],
    }));

    console.log(`[csm-enrichment] Syncing ${allPayload.length} reviews to backend in batches of ${BATCH}...`);

    // Send batches sequentially to avoid overwhelming the backend
    const sendBatches = async () => {
      let totalUpserted = 0;
      for (let i = 0; i < allPayload.length; i += BATCH) {
        const batch = allPayload.slice(i, i + BATCH);
        try {
          const res = await this.apiClient!.syncCSMReviews(batch);
          totalUpserted += res.upserted;
          console.log(`[csm-enrichment] Batch ${Math.floor(i / BATCH) + 1}: synced ${res.upserted} reviews`);
        } catch (err: any) {
          console.error(`[csm-enrichment] Batch ${Math.floor(i / BATCH) + 1} failed:`, err?.message || err);
          if (batch.length > 0) {
            console.error('[csm-enrichment] Sample payload:', JSON.stringify(batch[0]).substring(0, 200));
          }
        }
      }
      console.log(`[csm-enrichment] Total synced: ${totalUpserted} reviews`);

      // Link viewing_history entries to CSM reviews by title match
      try {
        const linkRes = await this.apiClient!.linkViewingHistoryCSM();
        console.log(`[csm-enrichment] Linked ${linkRes.linked} viewing history entries to CSM reviews`);
      } catch (err: any) {
        console.error('[csm-enrichment] Link CSM failed:', err?.message || err);
      }
    };

    sendBatches();
  }

  private sendToChrome(channel: string, data: unknown): void {
    if (!this.chromeView || this.chromeView.webContents.isDestroyed()) return;
    try {
      this.chromeView.webContents.send(channel, data);
    } catch {
      // Chrome view may be destroyed
    }
  }
}
