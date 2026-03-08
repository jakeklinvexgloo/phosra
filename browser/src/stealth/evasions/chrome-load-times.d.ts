/**
 * chrome.loadTimes evasion
 *
 * `window.chrome.loadTimes()` is a Chrome-specific API that returns page
 * load timing data.  Although deprecated, many fingerprinting scripts
 * still check for its presence.
 */
export default function chromeLoadTimes(): void;
