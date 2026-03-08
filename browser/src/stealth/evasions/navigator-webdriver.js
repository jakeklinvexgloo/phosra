"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = navigatorWebdriver;
/**
 * navigator.webdriver evasion
 *
 * Chromium-based automation tools set `navigator.webdriver` to true.
 * This evasion removes/overrides that property so fingerprinting scripts
 * cannot trivially detect automation.
 */
function navigatorWebdriver() {
    try {
        // Delete the property first in case it was set on the instance
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const nav = navigator;
        if ('webdriver' in nav) {
            delete nav.webdriver;
        }
        // Re-define it on the prototype to return undefined, matching a
        // regular Chrome browser where the property does not exist.
        Object.defineProperty(Object.getPrototypeOf(navigator), 'webdriver', {
            get: () => undefined,
            configurable: true,
            enumerable: true,
        });
    }
    catch (_e) {
        // Silently ignore — some environments lock the navigator prototype.
    }
}
