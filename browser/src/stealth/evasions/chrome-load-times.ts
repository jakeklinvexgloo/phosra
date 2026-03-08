/**
 * chrome.loadTimes evasion
 *
 * `window.chrome.loadTimes()` is a Chrome-specific API that returns page
 * load timing data.  Although deprecated, many fingerprinting scripts
 * still check for its presence.
 */
export default function chromeLoadTimes(): void {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;

    if (!w.chrome) {
      w.chrome = {};
    }

    if (!w.chrome.loadTimes) {
      const loadTimes = function () {
        const perf =
          typeof performance !== 'undefined' ? performance : undefined;
        const navStart = perf?.timing?.navigationStart ?? Date.now();
        const navStartSec = navStart / 1000;

        return {
          commitLoadTime: navStartSec,
          connectionInfo: 'h2', // HTTP/2
          finishDocumentLoadTime: navStartSec + 0.1 + Math.random() * 0.05,
          finishLoadTime: navStartSec + 0.3 + Math.random() * 0.1,
          firstPaintAfterLoadTime: 0,
          firstPaintTime: navStartSec + 0.15 + Math.random() * 0.05,
          navigationType: 'Other',
          npnNegotiatedProtocol: 'h2',
          requestTime: navStartSec - 0.05,
          startLoadTime: navStartSec,
          wasAlternateProtocolAvailable: false,
          wasFetchedViaSpdy: true,
          wasNpnNegotiated: true,
        };
      };

      Object.defineProperty(w.chrome, 'loadTimes', {
        value: loadTimes,
        writable: false,
        configurable: false,
        enumerable: true,
      });
    }
  } catch (_e) {
    // Silently ignore
  }
}
