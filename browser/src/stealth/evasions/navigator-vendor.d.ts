/**
 * navigator.vendor evasion
 *
 * Chrome reports `navigator.vendor` as `'Google Inc.'`.  Some Electron /
 * headless builds may return an empty string.  We ensure the expected
 * value is present.
 */
export default function navigatorVendor(): void;
