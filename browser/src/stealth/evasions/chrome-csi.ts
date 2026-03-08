/**
 * chrome.csi evasion
 *
 * `window.chrome.csi()` is present in regular Chrome and returns page load
 * timing information.  Its absence is used as an automation indicator.
 */
export default function chromeCsi(): void {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;

    if (!w.chrome) {
      w.chrome = {};
    }

    if (!w.chrome.csi) {
      const csi = function () {
        const perf =
          typeof performance !== 'undefined' ? performance : undefined;
        const navStart = perf?.timing?.navigationStart ?? Date.now();

        return {
          onloadT: 0,
          startE: navStart,
          pageT: Date.now() - navStart,
          tran: 15, // transition type: normal navigation
        };
      };

      Object.defineProperty(w.chrome, 'csi', {
        value: csi,
        writable: false,
        configurable: false,
        enumerable: true,
      });
    }
  } catch (_e) {
    // Silently ignore
  }
}
