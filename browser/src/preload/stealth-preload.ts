/**
 * Stealth preload script.
 *
 * Runs in every browser tab's WebContentsView with:
 *   - contextIsolation: false
 *   - sandbox: false
 *
 * Because context isolation is disabled, this script shares the same
 * JavaScript context as the page.  We import and immediately execute all
 * stealth evasions so they take effect before any page scripts run.
 *
 * The evasions patch browser APIs (navigator.webdriver, chrome.runtime,
 * plugins, permissions, etc.) to make the Electron browser indistinguishable
 * from a regular Chrome desktop browser.
 */

// Dynamically require each evasion to avoid Rollup ESM default-export
// resolution issues in vite-plugin-electron's preload build.

// Execute all evasions immediately on preload.
// This runs in the page's JavaScript context before any page scripts.
const evasionPaths = [
  '../stealth/evasions/sourceurl',
  '../stealth/evasions/navigator-webdriver',
  '../stealth/evasions/chrome-runtime',
  '../stealth/evasions/chrome-app',
  '../stealth/evasions/chrome-csi',
  '../stealth/evasions/chrome-load-times',
  '../stealth/evasions/permissions-api',
  '../stealth/evasions/plugins-mimetypes',
  '../stealth/evasions/webgl-vendor',
  '../stealth/evasions/canvas-noise',
  '../stealth/evasions/audio-context',
  '../stealth/evasions/user-agent',
  '../stealth/evasions/iframe-content-window',
  '../stealth/evasions/media-codecs',
  '../stealth/evasions/navigator-languages',
  '../stealth/evasions/navigator-vendor',
  '../stealth/evasions/window-dimensions',
];

for (const p of evasionPaths) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require(p);
    const fn = mod.default || mod;
    if (typeof fn === 'function') fn();
  } catch {
    // Individual evasion failure is non-fatal
  }
}
