"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = navigatorLanguages;
/**
 * navigator.languages evasion
 *
 * Ensures `navigator.languages` returns a realistic array.  Headless
 * environments sometimes return an empty array or only `['en']`, which
 * is a detection signal.
 */
function navigatorLanguages() {
    try {
        const languages = Object.freeze(['en-US', 'en']);
        Object.defineProperty(Object.getPrototypeOf(navigator), 'languages', {
            get: () => languages,
            configurable: true,
            enumerable: true,
        });
        // Also ensure navigator.language is consistent
        Object.defineProperty(Object.getPrototypeOf(navigator), 'language', {
            get: () => 'en-US',
            configurable: true,
            enumerable: true,
        });
    }
    catch (_e) {
        // Silently ignore
    }
}
