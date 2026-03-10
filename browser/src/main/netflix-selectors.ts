/**
 * Netflix-specific URLs and CSS selectors for the config agent.
 *
 * Isolated here so they can be easily updated when Netflix changes their UI.
 * Bump SELECTORS_VERSION whenever selectors are modified so callers can
 * detect stale cached snapshots.
 */

/** Selector schema version — bump on every selector change. */
export const SELECTORS_VERSION = '2026-03-10.1';

export const NETFLIX_URLS = {
  profileManage: 'https://www.netflix.com/profiles/manage',
  profileSettings: (guid: string) => `https://www.netflix.com/settings/${guid}`,
  restrictions: (guid: string) => `https://www.netflix.com/settings/restrictions/${guid}`,
  playback: (guid: string) => `https://www.netflix.com/settings/playback/${guid}`,
  accountProfiles: 'https://www.netflix.com/account/profiles',
  account: 'https://www.netflix.com/account',
  login: 'https://www.netflix.com/login',
  switchProfile: (guid: string) => `https://www.netflix.com/SwitchProfile?tkn=${guid}`,
  viewingActivity: 'https://www.netflix.com/viewingactivity',
};

// ---------------------------------------------------------------------------
// Selector definitions with ordered fallbacks
// ---------------------------------------------------------------------------

/**
 * A selector group: primary is tried first, then each fallback in order.
 * This lets the agent survive Netflix A/B tests and incremental UI changes.
 */
export interface SelectorGroup {
  primary: string;
  fallbacks: string[];
}

function sel(primary: string, ...fallbacks: string[]): SelectorGroup {
  return { primary, fallbacks };
}

/**
 * Netflix CSS selector groups with fallback chains.
 *
 * Use {@link queryWithFallback} to evaluate these against a DOM — it tries
 * each selector in order and logs misses so we can update stale selectors.
 */
export const NETFLIX_SELECTOR_GROUPS = {
  /** Profile cards on the /profiles/manage page */
  profileCards: sel('[data-profile-guid]', '.profile-icon', '.profile-button'),
  profileName: sel('.profile-name', '[class*="profileName"]'),
  kidsIndicator: sel('.kids-marker', '[data-uia="kids-profile-marker"]', '.kidsCharacter'),

  /** MFA / password confirmation page */
  mfaPasswordButton: sel('[data-uia="account-mfa-button-PASSWORD+PressableListItem"]'),
  mfaPasswordInput: sel('[data-uia="collect-password-input-modal-entry"]', 'input[name="challengePassword"]'),
  mfaSubmitButton: sel('[data-uia="collect-input-submit-cta"]'),

  /** Profile lock button on /settings/<guid> page */
  profileLockButton: sel('[data-uia="menu-card+profile-lock"]'),

  /** Password input (login + MFA reauth) */
  passwordInput: sel('input[type="password"]', 'input[name="password"]', 'input[name="challengePassword"]'),

  /** Login detection */
  loginForm: sel('[data-uia="login-page-container"]', '.login-form', 'form[data-uia="login-form"]'),

  /** Viewing activity page */
  viewingActivityRow: sel('.retableRow', '.viewing-activity-row', 'li.retableRow'),
  viewingActivityDate: sel('.col.date', '.date'),
  viewingActivityTitle: sel('.col.title a', '.title a'),
} as const;

/**
 * Flat comma-joined selectors (backwards-compatible with existing callers).
 * Each value is primary + fallbacks joined so `querySelector` tries them all.
 */
export const NETFLIX_SELECTORS: Record<keyof typeof NETFLIX_SELECTOR_GROUPS, string> = (() => {
  const flat = {} as Record<string, string>;
  for (const [key, group] of Object.entries(NETFLIX_SELECTOR_GROUPS)) {
    flat[key] = [group.primary, ...group.fallbacks].join(', ');
  }
  return flat as Record<keyof typeof NETFLIX_SELECTOR_GROUPS, string>;
})();

// ---------------------------------------------------------------------------
// Selector miss tracking
// ---------------------------------------------------------------------------

const selectorMisses: Map<string, number> = new Map();

/**
 * Try each selector in a {@link SelectorGroup} in order. Returns the first
 * match or `null`. Logs a warning when the primary selector misses.
 *
 * @param evaluate - Function that runs `document.querySelector(sel)` and
 *                   returns truthy if the selector matched (runs in CDP).
 * @param name     - Human-readable name for logging (e.g. "profileCards").
 * @param group    - The selector group to evaluate.
 */
export async function queryWithFallback(
  evaluate: (selector: string) => Promise<boolean>,
  name: string,
  group: SelectorGroup,
): Promise<string | null> {
  const all = [group.primary, ...group.fallbacks];
  for (let i = 0; i < all.length; i++) {
    const matched = await evaluate(all[i]);
    if (matched) {
      if (i > 0) {
        const count = (selectorMisses.get(name) ?? 0) + 1;
        selectorMisses.set(name, count);
        console.warn(
          `[netflix-selectors] Primary selector miss for "${name}" ` +
          `(fell back to index ${i}: "${all[i]}"). Miss count: ${count}`,
        );
      }
      return all[i];
    }
  }
  console.warn(`[netflix-selectors] All selectors missed for "${name}" (v${SELECTORS_VERSION})`);
  return null;
}

/** Return current selector miss counts for diagnostics. */
export function getSelectorMissStats(): Record<string, number> {
  return Object.fromEntries(selectorMisses);
}

// ---------------------------------------------------------------------------
// Maturity level helpers
// ---------------------------------------------------------------------------

/** Netflix maturity levels in order from most to least restrictive. */
export const NETFLIX_MATURITY_LEVELS = [
  { value: 'little-kids', label: 'Little Kids', maxAge: 6 },
  { value: 'older-kids', label: 'Older Kids', maxAge: 11 },
  { value: 'teens', label: 'Teens', maxAge: 16 },
  { value: 'all', label: 'All Maturity Ratings', maxAge: 99 },
] as const;

export type NetflixMaturityLevel = (typeof NETFLIX_MATURITY_LEVELS)[number]['value'];

/**
 * Map a child's age + family strictness to a recommended Netflix maturity level.
 *
 * | Age   | Relaxed     | Recommended  | Strict      |
 * |-------|-------------|--------------|-------------|
 * | 0-4   | Older Kids  | Little Kids  | Little Kids |
 * | 5-7   | Older Kids  | Little Kids  | Little Kids |
 * | 8-9   | Teens       | Older Kids   | Little Kids |
 * | 10-12 | Teens       | Older Kids   | Older Kids  |
 * | 13-15 | All         | Teens        | Older Kids  |
 * | 16-17 | All         | Teens        | Teens       |
 */
export function recommendMaturity(
  age: number,
  strictness: 'relaxed' | 'recommended' | 'strict',
): NetflixMaturityLevel {
  if (strictness === 'strict') {
    if (age <= 9) return 'little-kids';
    if (age <= 12) return 'older-kids';
    if (age <= 15) return 'older-kids';
    return 'teens';
  }
  if (strictness === 'recommended') {
    if (age <= 7) return 'little-kids';
    if (age <= 12) return 'older-kids';
    return 'teens';
  }
  // relaxed
  if (age <= 7) return 'older-kids';
  if (age <= 12) return 'teens';
  return 'all';
}
