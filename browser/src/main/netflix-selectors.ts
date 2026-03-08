/**
 * Netflix-specific URLs and CSS selectors for the config agent.
 *
 * Isolated here so they can be easily updated when Netflix changes their UI.
 */

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

export const NETFLIX_SELECTORS = {
  /** Profile cards on the /profiles/manage page */
  profileCards: '[data-profile-guid], .profile-icon, .profile-button',
  profileName: '.profile-name, [class*="profileName"]',
  kidsIndicator: '.kids-marker, [data-uia="kids-profile-marker"], .kidsCharacter',

  /** MFA / password confirmation page */
  mfaPasswordButton: '[data-uia="account-mfa-button-PASSWORD+PressableListItem"]',
  mfaPasswordInput: '[data-uia="collect-password-input-modal-entry"], input[name="challengePassword"]',
  mfaSubmitButton: '[data-uia="collect-input-submit-cta"]',

  /** Profile lock button on /settings/<guid> page */
  profileLockButton: '[data-uia="menu-card+profile-lock"]',

  /** Password input (login + MFA reauth) */
  passwordInput: 'input[type="password"], input[name="password"], input[name="challengePassword"]',

  /** Login detection */
  loginForm: '[data-uia="login-page-container"], .login-form, form[data-uia="login-form"]',

  /** Viewing activity page */
  viewingActivityRow: '.retableRow, .viewing-activity-row, li.retableRow',
  viewingActivityDate: '.col.date, .date',
  viewingActivityTitle: '.col.title a, .title a',
};

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
