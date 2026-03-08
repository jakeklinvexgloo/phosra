/**
 * navigator.vendor evasion
 *
 * Chrome reports `navigator.vendor` as `'Google Inc.'`.  Some Electron /
 * headless builds may return an empty string.  We ensure the expected
 * value is present.
 */
export default function navigatorVendor(): void {
  try {
    Object.defineProperty(Object.getPrototypeOf(navigator), 'vendor', {
      get: () => 'Google Inc.',
      configurable: true,
      enumerable: true,
    });
  } catch (_e) {
    // Silently ignore
  }
}
