/**
 * CSM Scraper — scrapes Common Sense Media reviews using a hidden
 * WebContentsView in the Electron main process.
 *
 * Uses `webContents.executeJavaScript()` (not CDP WebSocket) to extract
 * data from search results and review pages, matching the pattern used
 * by netflix-activity.ts and the config agent.
 */

import { BaseWindow, WebContentsView, session } from 'electron';
import { CSMRateLimiter } from './csm-rate-limiter';
import { CSMCache } from './csm-cache';
import type { CSMCachedReview } from './csm-cache';
import { matchTitle } from './csm-title-matcher';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CSMScrapeResult {
  title: string;
  found: boolean;
  confidence?: number;
  review?: CSMCachedReview;
  error?: string;
}

// ---------------------------------------------------------------------------
// Scraping JS snippets (ported from csm-poc.cjs)
// ---------------------------------------------------------------------------

const SEARCH_RESULTS_JS = `(function(){
  var links = [];
  document.querySelectorAll('a[href]').forEach(function(a) {
    var href = a.getAttribute('href') || '';
    if (href.match(/^\\/(tv|movie|app|game|book|website|youtube|podcast)-reviews\\/[a-z0-9-]+/) &&
        !links.some(function(l) { return l.href === href; })) {
      var text = (a.textContent || '').trim();
      if (text && text !== 'See full review' && text.length > 1) {
        links.push({ href: href, text: text.substring(0, 80) });
      }
    }
  });
  return links.slice(0, 5);
})()`;

const REVIEW_PAGE_JS = `(function(){
  var r = { url: location.href };

  // --- LD+JSON structured data ---
  var ldScripts = document.querySelectorAll('script[type="application/ld+json"]');
  ldScripts.forEach(function(s) {
    try {
      var data = JSON.parse(s.textContent);
      var graph = data['@graph'] || [data];
      graph.forEach(function(item) {
        if (item['@type'] === 'Review') {
          r.csmTitle = item.name || '';
          r.ageRange = item.typicalAgeRange || '';
          r.isFamilyFriendly = item.isFamilyFriendly || '';
          r.qualityRating = item.reviewRating ? item.reviewRating.ratingValue : '';
          r.reviewSummary = item.description || '';
          r.reviewBody = item.reviewBody || '';
          r.mediaType = item.itemReviewed ? item.itemReviewed['@type'] : '';
          r.datePublished = item.datePublished || '';
        }
      });
    } catch(e) {}
  });

  // --- Age badge ---
  var ageBadge = document.querySelector('.rating__age');
  if (ageBadge) r.ageBadge = ageBadge.textContent.trim();

  // --- Parents Need to Know (full text) ---
  var headings = document.querySelectorAll('h2, h3, h4');
  for (var i = 0; i < headings.length; i++) {
    var hText = (headings[i].textContent || '').toLowerCase();
    if (hText.includes('parents need to know')) {
      var next = headings[i].nextElementSibling;
      if (next) r.parentSummary = next.textContent.trim();
      break;
    }
  }

  // --- "Why Age X+?" explanation ---
  for (var i = 0; i < headings.length; i++) {
    var hText = (headings[i].textContent || '').toLowerCase();
    if (hText.includes('why age') || hText.includes('what age')) {
      var next = headings[i].nextElementSibling;
      if (next) r.ageExplanation = next.textContent.trim();
      break;
    }
  }

  // --- Content descriptors with descriptions and numeric levels ---
  r.descriptors = [];
  // Try the content-grid based layout first (newer CSM pages)
  var gridItems = document.querySelectorAll('[class*="content-grid"] [class*="content-grid-item"], [class*="review-content"] [class*="descriptor"]');
  if (gridItems.length === 0) {
    // Fallback: rating-based selectors
    gridItems = document.querySelectorAll('[class*="rating__"] .rating__label, .csm-green-btn + ul li, [class*="ContentGrid"] > div');
  }

  // Primary approach: find labeled sections with dot indicators
  document.querySelectorAll('.rating__label').forEach(function(label) {
    var container = label.closest('[class*="rating"]') || label.parentElement;
    var score = container ? container.querySelector('.rating__score, .rating__teaser-short') : null;
    var levelText = score ? score.textContent.trim() : '';

    // Count filled dots/circles for numeric level (0-5)
    var numericLevel = 0;
    if (container) {
      var dots = container.querySelectorAll('[class*="dot"], [class*="circle"], [class*="fill"], svg circle');
      var filledDots = container.querySelectorAll('[class*="dot--filled"], [class*="dot--active"], [class*="circle--filled"], [class*="filled"]');
      if (filledDots.length > 0) {
        numericLevel = filledDots.length;
      } else if (dots.length > 0) {
        // Try aria or style-based detection
        dots.forEach(function(d) {
          var cl = d.getAttribute('class') || '';
          var style = d.getAttribute('style') || '';
          if (cl.indexOf('active') >= 0 || cl.indexOf('filled') >= 0 || style.indexOf('opacity: 1') >= 0 || style.indexOf('fill:') >= 0) {
            numericLevel++;
          }
        });
      }
      // Fallback: parse level text
      if (numericLevel === 0 && levelText) {
        var lv = levelText.toLowerCase();
        if (lv === 'not present' || lv === 'none') numericLevel = 0;
        else if (lv === 'a little' || lv === 'some') numericLevel = 1;
        else if (lv === 'a lot') numericLevel = 3;
        else if (lv === 'iffy') numericLevel = 2;
        else if (lv === 'pause') numericLevel = 2;
      }
    }

    // Get the description text (usually in a sibling or nested element)
    var description = '';
    if (container) {
      var descEl = container.querySelector('.rating__teaser, [class*="teaser"], [class*="description"], p');
      if (descEl && descEl !== score && descEl !== label) {
        description = descEl.textContent.trim();
      }
      // If no explicit description element, check for text after the label/score
      if (!description) {
        var allText = container.textContent.trim();
        var catText = label.textContent.trim();
        var scoreText = levelText;
        // Remove category and score from full text to get description
        var remainder = allText;
        if (catText) remainder = remainder.replace(catText, '').trim();
        if (scoreText) remainder = remainder.replace(scoreText, '').trim();
        if (remainder.length > 10) description = remainder;
      }
    }

    r.descriptors.push({
      category: label.textContent.trim(),
      level: levelText,
      numericLevel: numericLevel,
      description: description
    });
  });

  // --- Positive Content section ---
  r.positiveContent = [];
  for (var i = 0; i < headings.length; i++) {
    var hText = (headings[i].textContent || '').toLowerCase();
    if (hText.includes('positive') || hText.includes('any good')) {
      // Look for sub-sections after this heading
      var sibling = headings[i].nextElementSibling;
      while (sibling) {
        var tag = sibling.tagName.toLowerCase();
        if (tag === 'h2' || tag === 'h3') break; // next major section

        // Check for labeled items (e.g. "Educational Value", "Positive Messages")
        var subLabels = sibling.querySelectorAll('[class*="label"], [class*="rating__label"], strong, b, dt, h4, h5');
        if (subLabels.length > 0) {
          subLabels.forEach(function(sl) {
            var cat = sl.textContent.trim();
            var desc = '';
            // Get description from next sibling or parent text
            var descSibling = sl.nextElementSibling;
            if (descSibling) {
              desc = descSibling.textContent.trim();
            } else if (sl.parentElement) {
              var parentText = sl.parentElement.textContent.trim();
              desc = parentText.replace(cat, '').trim();
            }
            if (cat && (desc || cat.length > 5)) {
              r.positiveContent.push({ category: cat, description: desc });
            }
          });
        } else if (sibling.textContent.trim().length > 10) {
          // Plain text paragraph describing positive content
          r.positiveContent.push({ category: 'General', description: sibling.textContent.trim() });
        }
        sibling = sibling.nextElementSibling;
      }
      break;
    }
  }

  return r;
})()`;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const CSM_BASE = 'https://www.commonsensemedia.org';
const JS_RENDER_DELAY_MS = 3_000;
const LOAD_TIMEOUT_MS = 15_000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function waitForLoad(wc: Electron.WebContents, timeout: number): Promise<void> {
  return new Promise((resolve) => {
    let resolved = false;

    const timer = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        resolve();
      }
    }, timeout);

    const handler = () => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timer);
        resolve();
      }
    };

    wc.once('did-finish-load', handler);
    wc.once('did-fail-load', () => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timer);
        resolve();
      }
    });
  });
}

/**
 * Extract the slug from a CSM review href.
 * e.g. "/tv-reviews/bluey" -> "bluey"
 */
function extractSlug(href: string): string {
  const parts = href.split('/');
  return parts[parts.length - 1] || href;
}

/**
 * Extract the media type from a CSM review href.
 * e.g. "/tv-reviews/bluey" -> "tv"
 */
function extractMediaType(href: string): string {
  const match = href.match(/^\/(tv|movie|app|game|book|website|youtube|podcast)-reviews\//);
  return match ? match[1] : '';
}

/**
 * Parse the age range min from a string like "8+" or "8-12".
 */
function parseAgeMin(ageStr: string): number {
  const match = ageStr.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

// ---------------------------------------------------------------------------
// Scraper
// ---------------------------------------------------------------------------

export class CSMScraper {
  private readonly parentWindow: BaseWindow;
  private readonly view: WebContentsView;
  private readonly cache: CSMCache;
  private readonly limiter: CSMRateLimiter;
  private destroyed = false;

  private queue: Array<{ title: string; callback: (result: CSMScrapeResult) => void }> = [];
  private processing = false;

  constructor(
    parentWindow: BaseWindow,
    stealthPreloadPath: string,
    profilePath: string,
  ) {
    this.parentWindow = parentWindow;
    this.cache = new CSMCache(profilePath);
    this.limiter = new CSMRateLimiter();

    // Create a hidden WebContentsView with an isolated session
    const ses = session.fromPartition('csm-scraper', { cache: true });
    const CHROME_UA =
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';
    ses.setUserAgent(CHROME_UA);

    this.view = new WebContentsView({
      webPreferences: {
        preload: stealthPreloadPath,
        sandbox: false,
        contextIsolation: true,
        session: ses,
        nodeIntegration: false,
      },
    });

    // Add to parent window but make it invisible (zero bounds + hidden)
    this.parentWindow.contentView.addChildView(this.view);
    this.view.setBounds({ x: 0, y: 0, width: 0, height: 0 });
    this.view.setVisible(false);
  }

  /**
   * Queue titles for lookup. Calls callback per result as they complete.
   */
  enqueue(titles: string[], callback: (result: CSMScrapeResult) => void): void {
    for (const title of titles) {
      this.queue.push({ title, callback });
    }
    this.processQueue();
  }

  /** Destroy the hidden view and clean up resources. */
  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;

    this.limiter.destroy();
    this.queue = [];

    try {
      this.parentWindow.contentView.removeChildView(this.view);
    } catch {
      // Window may already be destroyed
    }

    try {
      (this.view.webContents as any).close();
    } catch {
      // Already destroyed
    }
  }

  // -----------------------------------------------------------------------
  // Queue processing
  // -----------------------------------------------------------------------

  private async processQueue(): Promise<void> {
    if (this.processing || this.destroyed) return;
    this.processing = true;

    while (this.queue.length > 0 && !this.destroyed) {
      const item = this.queue.shift()!;
      const result = await this.scrapeTitle(item.title);

      try {
        item.callback(result);
      } catch {
        // Callback errors should not stop the queue
      }
    }

    this.processing = false;
  }

  // -----------------------------------------------------------------------
  // Single title scraping
  // -----------------------------------------------------------------------

  private async scrapeTitle(title: string): Promise<CSMScrapeResult> {
    const wc = this.view.webContents;

    try {
      // Step 1: Rate-limit, then search CSM
      await this.limiter.acquire();

      if (this.destroyed || wc.isDestroyed()) {
        return { title, found: false, error: 'Scraper destroyed' };
      }

      const searchUrl = `${CSM_BASE}/search/${encodeURIComponent(title)}`;
      const loadPromise = waitForLoad(wc, LOAD_TIMEOUT_MS);
      await wc.loadURL(searchUrl);
      await loadPromise;
      await sleep(JS_RENDER_DELAY_MS);

      if (this.destroyed || wc.isDestroyed()) {
        return { title, found: false, error: 'Scraper destroyed' };
      }

      // Step 2: Extract search result links
      const searchResults: Array<{ href: string; text: string }> =
        await wc.executeJavaScript(SEARCH_RESULTS_JS);

      if (!searchResults || searchResults.length === 0) {
        return { title, found: false };
      }

      // Step 3: Find best title match
      const match = matchTitle(title, searchResults);
      if (!match) {
        return { title, found: false };
      }

      // Step 4: Rate-limit, then navigate to review page
      await this.limiter.acquire();

      if (this.destroyed || wc.isDestroyed()) {
        return { title, found: false, error: 'Scraper destroyed' };
      }

      const reviewUrl = `${CSM_BASE}${match.href}`;
      const reviewLoadPromise = waitForLoad(wc, LOAD_TIMEOUT_MS);
      await wc.loadURL(reviewUrl);
      await reviewLoadPromise;
      await sleep(JS_RENDER_DELAY_MS);

      if (this.destroyed || wc.isDestroyed()) {
        return { title, found: false, error: 'Scraper destroyed' };
      }

      // Step 5: Extract review data
      const reviewData: Record<string, any> =
        await wc.executeJavaScript(REVIEW_PAGE_JS);

      // Step 6: Build cached review
      const ageRating = reviewData.ageRange || reviewData.ageBadge || '';
      const slug = extractSlug(match.href);

      const review: CSMCachedReview = {
        csmSlug: slug,
        csmUrl: reviewData.url || reviewUrl,
        csmMediaType: reviewData.mediaType || extractMediaType(match.href),
        title: reviewData.csmTitle || title,
        ageRating,
        ageRangeMin: parseAgeMin(ageRating),
        qualityStars: reviewData.qualityRating ? Number(reviewData.qualityRating) : 0,
        isFamilyFriendly: reviewData.isFamilyFriendly === true || reviewData.isFamilyFriendly === 'true',
        reviewSummary: reviewData.reviewSummary || '',
        reviewBody: reviewData.reviewBody || '',
        parentSummary: reviewData.parentSummary || '',
        ageExplanation: reviewData.ageExplanation || '',
        descriptors: (reviewData.descriptors || []).map((d: any) => ({
          category: String(d.category || ''),
          level: String(d.level || ''),
          numericLevel: Number(d.numericLevel || 0),
          description: String(d.description || ''),
        })),
        positiveContent: (reviewData.positiveContent || []).map((p: any) => ({
          category: String(p.category || ''),
          description: String(p.description || ''),
        })),
        scrapedAt: new Date().toISOString(),
      };

      // Step 7: Persist to cache
      this.cache.set(review);

      return {
        title,
        found: true,
        confidence: match.confidence,
        review,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[csm-scraper] Error scraping "${title}":`, message);
      return { title, found: false, error: message };
    }
  }
}
