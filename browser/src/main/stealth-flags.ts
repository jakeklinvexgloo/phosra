/**
 * Chromium command-line flags for stealth operation.
 *
 * These flags disable automation-related Chromium features that fingerprinting
 * scripts use to detect headless / Electron-based browsers.  They are applied
 * via `app.commandLine.appendSwitch()` before the browser process launches.
 */

const isDev = process.env.NODE_ENV !== 'production';

/**
 * Returns an array of Chromium CLI flag strings (without the leading `--`).
 * Each entry is either `flag` or `flag=value`.
 */
export function getStealthFlags(): string[] {
  const flags: string[] = [
    // Core automation-detection mitigations
    'disable-blink-features=AutomationControlled',
    'disable-features=IsolateOrigins,site-per-process',
    'disable-site-isolation-trials',

    // Locale
    'lang=en-US,en',

    // Suppress Chrome-specific UI / first-run behaviour
    'disable-infobars',
    'no-first-run',
    'no-default-browser-check',

    // Reduce background noise / network fingerprints
    'disable-background-networking',
    'disable-breakpad',
    'disable-component-update',
    'disable-default-apps',
    'disable-extensions',
    'disable-hang-monitor',
    'disable-popup-blocking',
    'disable-prompt-on-repost',
    'disable-sync',
    'disable-translate',
    'metrics-recording-only',
    'safebrowsing-disable-auto-update',
  ];

  // Only disable web security in development (useful for cross-origin testing)
  if (isDev) {
    flags.push('disable-web-security');
  }

  return flags;
}
