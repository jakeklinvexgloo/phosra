/**
 * window dimensions evasion
 *
 * In headless Chrome `window.outerWidth === window.innerWidth` and
 * `window.outerHeight === window.innerHeight`, because there is no
 * browser chrome (toolbar, scrollbar, etc.).  A real browser always
 * has a difference.  We add a realistic offset to the outer dimensions.
 */
export default function windowDimensions(): void {
  try {
    // Typical Chrome on macOS: toolbar ~88px, side chrome ~0-16px
    const WIDTH_OFFSET = 0; // Chrome on mac: outerWidth often equals innerWidth
    const HEIGHT_OFFSET = 85; // ~85px for tabs + address bar + bookmarks bar

    Object.defineProperty(window, 'outerWidth', {
      get: () => window.innerWidth + WIDTH_OFFSET,
      configurable: true,
      enumerable: true,
    });

    Object.defineProperty(window, 'outerHeight', {
      get: () => window.innerHeight + HEIGHT_OFFSET,
      configurable: true,
      enumerable: true,
    });

    // Also ensure screenX/screenY are not 0,0 (another headless tell)
    if (window.screenX === 0 && window.screenY === 0) {
      Object.defineProperty(window, 'screenX', {
        get: () => 22,
        configurable: true,
        enumerable: true,
      });
      Object.defineProperty(window, 'screenY', {
        get: () => 44,
        configurable: true,
        enumerable: true,
      });
    }
  } catch (_e) {
    // Silently ignore
  }
}
