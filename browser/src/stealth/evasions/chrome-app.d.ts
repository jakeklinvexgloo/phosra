/**
 * chrome.app evasion
 *
 * Regular Chrome exposes `window.chrome.app` with several properties and
 * methods.  Headless / Electron environments lack this, which is a common
 * bot detection signal.
 */
export default function chromeApp(): void;
