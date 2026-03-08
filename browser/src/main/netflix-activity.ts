/**
 * Netflix viewing activity scraper.
 *
 * Navigates to each child's Netflix profile viewing activity page and
 * extracts full watch history (title, date, URL) by paginating through
 * the "Show More" button to fetch as far back as possible.
 *
 * Runs in the main process using `webContents.executeJavaScript()` on
 * the active tab, same pattern as the config agent.
 */

import * as fs from 'fs';
import * as path from 'path';
import type { WebContentsView } from 'electron';
import { NETFLIX_URLS, NETFLIX_SELECTORS } from './netflix-selectors';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ViewingEntry {
  title: string;
  date: string;
  titleUrl?: string;
  seriesTitle?: string;
}

export interface ChildActivity {
  childName: string;
  childId: string;
  profileName: string;
  profileGuid: string;
  avatarUrl: string;
  entries: ViewingEntry[];
  fetchedAt: string;
}

export interface ProfileMappingInput {
  childName: string;
  childId: string;
  profileGuid: string;
  profileName: string;
  avatarUrl: string;
}

// ---------------------------------------------------------------------------
// Local persistence
// ---------------------------------------------------------------------------

const ACTIVITY_FILENAME = 'netflix-activity-cache.json';

interface ActivityCacheFile {
  version: 1;
  activities: ChildActivity[];
  savedAt: string;
}

export class ActivityStore {
  private readonly filePath: string;

  constructor(profilePath: string) {
    this.filePath = path.join(profilePath, ACTIVITY_FILENAME);
  }

  save(activities: ChildActivity[]): void {
    const data: ActivityCacheFile = {
      version: 1,
      activities,
      savedAt: new Date().toISOString(),
    };
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), {
        encoding: 'utf-8',
        mode: 0o600,
      });
    } catch {
      // Non-critical
    }
  }

  load(): ChildActivity[] | null {
    try {
      if (!fs.existsSync(this.filePath)) return null;
      const raw = fs.readFileSync(this.filePath, 'utf-8');
      const data: ActivityCacheFile = JSON.parse(raw);
      if (data.version !== 1) return null;
      return data.activities;
    } catch {
      return null;
    }
  }
}

// ---------------------------------------------------------------------------
// Scraper
// ---------------------------------------------------------------------------

/** Max pages of "Show More" to click (each loads ~20 titles). */
const MAX_PAGES = 50;

/**
 * Fetch Netflix viewing activity for one or more child profiles.
 * Paginates through the full viewing history by clicking "Show More".
 *
 * @param view     - The WebContentsView of the active Netflix tab
 * @param mappings - Child-to-profile mappings to fetch activity for
 */
export async function fetchNetflixActivity(
  view: WebContentsView,
  mappings: ProfileMappingInput[],
): Promise<ChildActivity[]> {
  const results: ChildActivity[] = [];
  const wc = view.webContents;

  for (const mapping of mappings) {
    try {
      // 1. Switch to the child's Netflix profile
      const switchUrl = NETFLIX_URLS.switchProfile(mapping.profileGuid);
      await wc.loadURL(switchUrl);
      await waitForNavigation(wc, 5000);

      // 2. Navigate to viewing activity
      await wc.loadURL(NETFLIX_URLS.viewingActivity);
      await waitForNavigation(wc, 8000);

      // 3. Paginate: click "Show More" to load full history
      let page = 0;
      let prevCount = -1;
      while (page < MAX_PAGES) {
        const currentCount: number = await wc.executeJavaScript(
          `document.querySelectorAll('${NETFLIX_SELECTORS.viewingActivityRow}').length`,
        );
        if (currentCount === prevCount) break; // no new rows loaded
        prevCount = currentCount;

        const clicked: boolean = await wc.executeJavaScript(`
          (function() {
            var btn = document.querySelector('button[data-uia="viewing-activity-show-more"]');
            if (!btn) {
              var all = document.querySelectorAll('button');
              for (var i = 0; i < all.length; i++) {
                if ((all[i].textContent || '').trim().toLowerCase() === 'show more') {
                  btn = all[i]; break;
                }
              }
            }
            if (btn) { btn.click(); return true; }
            return false;
          })()
        `);
        if (!clicked) break; // no more "Show More" button

        await sleep(2000); // wait for new rows to load
        page++;
      }

      // 4. Scrape all rows
      const entries: ViewingEntry[] = await wc.executeJavaScript(`
        (function() {
          var rows = document.querySelectorAll('${NETFLIX_SELECTORS.viewingActivityRow}');
          var results = [];
          for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            var dateEl = row.querySelector('${NETFLIX_SELECTORS.viewingActivityDate}');
            var titleEl = row.querySelector('${NETFLIX_SELECTORS.viewingActivityTitle}');
            if (!dateEl || !titleEl) continue;
            var title = titleEl.textContent.trim();
            var date = dateEl.textContent.trim();
            var titleUrl = titleEl.getAttribute('href') || undefined;
            var seriesTitle = undefined;
            if (title.indexOf(':') !== -1) {
              seriesTitle = title.split(':')[0].trim();
            }
            results.push({ title: title, date: date, titleUrl: titleUrl, seriesTitle: seriesTitle });
          }
          return results;
        })()
      `);

      console.log(`[netflix-activity] ${mapping.childName}: ${entries.length} entries (${page} pages loaded)`);

      results.push({
        childName: mapping.childName,
        childId: mapping.childId,
        profileName: mapping.profileName,
        profileGuid: mapping.profileGuid,
        avatarUrl: mapping.avatarUrl,
        entries: entries || [],
        fetchedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error(`[netflix-activity] Failed to fetch activity for ${mapping.childName}:`, err);
      results.push({
        childName: mapping.childName,
        childId: mapping.childId,
        profileName: mapping.profileName,
        profileGuid: mapping.profileGuid,
        avatarUrl: mapping.avatarUrl,
        entries: [],
        fetchedAt: new Date().toISOString(),
      });
    }
  }

  return results;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function waitForNavigation(wc: Electron.WebContents, timeout: number): Promise<void> {
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
        // Give the page a moment to settle after navigation
        setTimeout(resolve, 1000);
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
