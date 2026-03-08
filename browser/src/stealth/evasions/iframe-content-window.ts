/**
 * iframe.contentWindow evasion
 *
 * In headless Chrome, accessing `contentWindow` on a cross-origin iframe
 * may return `null`, whereas a real browser returns a restricted Window
 * proxy.  Some detection scripts create a temporary iframe and immediately
 * check `contentWindow` before the frame loads.
 *
 * We wrap the getter with a Proxy trap that returns a minimal Window-like
 * object when the native getter would return null.
 */
export default function iframeContentWindow(): void {
  try {
    const descriptor = Object.getOwnPropertyDescriptor(
      HTMLIFrameElement.prototype,
      'contentWindow',
    );

    if (!descriptor || !descriptor.get) return;

    const originalGet = descriptor.get;

    Object.defineProperty(HTMLIFrameElement.prototype, 'contentWindow', {
      get: function (): Window | null {
        const result = originalGet.call(this);
        if (result !== null) return result;

        // Return a Proxy that behaves like a restricted cross-origin Window.
        // Any property access returns undefined, any function call is a no-op,
        // which matches real browser behaviour for cross-origin frames.
        const handler: ProxyHandler<object> = {
          get: function (_target, prop) {
            // `postMessage` is the one API usable cross-origin
            if (prop === 'postMessage') {
              return function () {
                // no-op
              };
            }
            // `closed` is accessible cross-origin
            if (prop === 'closed') {
              return false;
            }
            // `frames`, `length` — accessible cross-origin
            if (prop === 'length') {
              return 0;
            }
            // toString / Symbol.toStringTag
            if (prop === Symbol.toStringTag) {
              return 'Window';
            }
            return undefined;
          },
        };

        return new Proxy({}, handler) as unknown as Window;
      },
      configurable: true,
      enumerable: true,
    });
  } catch (_e) {
    // Silently ignore
  }
}
