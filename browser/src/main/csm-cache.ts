/**
 * Local JSON file cache for Common Sense Media reviews.
 *
 * Follows the same file-based persistence pattern as ConfigStore:
 * - Stored in the user's profile directory as `csm-cache.json`
 * - Written with mode 0o600 (user-only read/write)
 * - Entries expire after 30 days
 */

import * as fs from 'fs';
import * as path from 'path';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CSMDescriptor {
  category: string;
  level: string;           // e.g. "Not present", "A lot"
  numericLevel: number;    // 0-5 from dot indicators
  description: string;     // full text description below the category
}

export interface CSMPositiveContent {
  category: string;        // e.g. "Educational Value", "Positive Messages"
  description: string;     // full text
}

export interface CSMCachedReview {
  csmSlug: string;
  csmUrl: string;
  csmMediaType: string;
  title: string;
  ageRating: string;       // e.g. "8+"
  ageRangeMin: number;
  qualityStars: number;
  isFamilyFriendly: boolean;
  reviewSummary: string;
  reviewBody: string;
  parentSummary: string;
  ageExplanation: string;  // "Why Age X+?" text
  descriptors: CSMDescriptor[];
  positiveContent: CSMPositiveContent[];
  scrapedAt: string;        // ISO 8601
}

interface CSMCacheFile {
  version: 1;
  reviews: Record<string, CSMCachedReview>; // keyed by csmSlug
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const FILENAME = 'csm-cache.json';
const STALE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

// ---------------------------------------------------------------------------
// Cache
// ---------------------------------------------------------------------------

export class CSMCache {
  private readonly filePath: string;

  constructor(profilePath: string) {
    this.filePath = path.join(profilePath, FILENAME);
  }

  /**
   * Get a cached review by slug.
   * Returns null if missing or stale (> 30 days old).
   */
  get(slug: string): CSMCachedReview | null {
    const data = this.load();
    const review = data.reviews[slug];
    if (!review) return null;

    if (this.isStale(review.scrapedAt)) return null;

    return review;
  }

  /** Upsert a review into the cache. */
  set(review: CSMCachedReview): void {
    const data = this.load();
    data.reviews[review.csmSlug] = review;
    this.save(data);
  }

  /** Get all cached reviews (including stale ones). */
  getAll(): CSMCachedReview[] {
    const data = this.load();
    return Object.values(data.reviews);
  }

  /** Get cache statistics. */
  getStats(): { total: number; fresh: number; stale: number } {
    const data = this.load();
    const all = Object.values(data.reviews);
    let stale = 0;
    for (const review of all) {
      if (this.isStale(review.scrapedAt)) stale++;
    }
    return {
      total: all.length,
      fresh: all.length - stale,
      stale,
    };
  }

  // -----------------------------------------------------------------------
  // Internal
  // -----------------------------------------------------------------------

  private isStale(scrapedAt: string): boolean {
    const scraped = new Date(scrapedAt).getTime();
    return Date.now() - scraped > STALE_MS;
  }

  private load(): CSMCacheFile {
    try {
      if (!fs.existsSync(this.filePath)) {
        return { version: 1, reviews: {} };
      }
      const raw = fs.readFileSync(this.filePath, 'utf-8');
      const data: CSMCacheFile = JSON.parse(raw);
      if (data.version !== 1) {
        return { version: 1, reviews: {} };
      }
      return data;
    } catch {
      return { version: 1, reviews: {} };
    }
  }

  private save(data: CSMCacheFile): void {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), {
        encoding: 'utf-8',
        mode: 0o600,
      });
    } catch {
      // Non-critical — silently ignore write failures
    }
  }
}
