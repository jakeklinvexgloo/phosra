"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = navigatorVendor;
/**
 * navigator.vendor evasion
 *
 * Chrome reports `navigator.vendor` as `'Google Inc.'`.  Some Electron /
 * headless builds may return an empty string.  We ensure the expected
 * value is present.
 */
function navigatorVendor() {
    try {
        Object.defineProperty(Object.getPrototypeOf(navigator), 'vendor', {
            get: () => 'Google Inc.',
            configurable: true,
            enumerable: true,
        });
    }
    catch (_e) {
        // Silently ignore
    }
}
