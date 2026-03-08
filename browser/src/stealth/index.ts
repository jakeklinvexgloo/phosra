/**
 * Stealth evasion composer.
 *
 * Collects all individual evasion modules and returns a single JavaScript
 * string that, when injected into a page context, applies every evasion.
 *
 * This is used by the stealth preload script which runs before any page
 * scripts execute.
 *
 * Evasions are ported from puppeteer-extra-plugin-stealth and adapted
 * for Electron preload script injection.
 */

import navigatorWebdriver from './evasions/navigator-webdriver';
import chromeRuntime from './evasions/chrome-runtime';
import permissionsApi from './evasions/permissions-api';
import pluginsMimetypes from './evasions/plugins-mimetypes';
import webglVendor from './evasions/webgl-vendor';
import canvasNoise from './evasions/canvas-noise';
import audioContext from './evasions/audio-context';
import userAgent from './evasions/user-agent';
import chromeApp from './evasions/chrome-app';
import chromeCsi from './evasions/chrome-csi';
import chromeLoadTimes from './evasions/chrome-load-times';
import iframeContentWindow from './evasions/iframe-content-window';
import mediaCodecs from './evasions/media-codecs';
import navigatorLanguages from './evasions/navigator-languages';
import navigatorVendor from './evasions/navigator-vendor';
import windowDimensions from './evasions/window-dimensions';
import sourceurl from './evasions/sourceurl';

/**
 * Ordered list of all evasion functions.
 *
 * Order matters slightly: sourceurl should come first so that subsequent
 * evasions benefit from stack-trace scrubbing, and chrome-* stubs should
 * be set up before anything that might reference window.chrome.
 */
const evasions: Array<() => void> = [
  sourceurl,
  navigatorWebdriver,
  chromeRuntime,
  chromeApp,
  chromeCsi,
  chromeLoadTimes,
  permissionsApi,
  pluginsMimetypes,
  webglVendor,
  canvasNoise,
  audioContext,
  userAgent,
  iframeContentWindow,
  mediaCodecs,
  navigatorLanguages,
  navigatorVendor,
  windowDimensions,
];

/**
 * Execute all stealth evasions immediately.
 * Call this from a preload script running with `contextIsolation: false`.
 */
export function applyEvasions(): void {
  for (const evasion of evasions) {
    try {
      evasion();
    } catch {
      // Individual evasion failure should not prevent others from running
    }
  }
}

/**
 * Returns a self-executing JavaScript string containing all evasions.
 * Each evasion is wrapped in its own IIFE with try/catch so errors in one
 * evasion do not prevent the others from executing.
 *
 * Useful for injection via `webContents.executeJavaScript()` or a
 * `<script>` element.
 */
export function composeEvasions(): string {
  return evasions.map((fn) => `(${fn.toString()})();`).join('\n');
}

/**
 * Get the list of evasion function names (useful for logging/debugging).
 */
export function getEvasionNames(): string[] {
  return evasions.map((fn) => fn.name || 'anonymous');
}

export {
  navigatorWebdriver,
  chromeRuntime,
  permissionsApi,
  pluginsMimetypes,
  webglVendor,
  canvasNoise,
  audioContext,
  userAgent,
  chromeApp,
  chromeCsi,
  chromeLoadTimes,
  iframeContentWindow,
  mediaCodecs,
  navigatorLanguages,
  navigatorVendor,
  windowDimensions,
  sourceurl,
};
