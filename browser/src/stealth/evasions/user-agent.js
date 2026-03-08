"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = userAgent;
/**
 * User-Agent evasion (no-op placeholder)
 *
 * The user-agent string is set externally via Chromium command-line flags
 * (--user-agent) when launching the Electron BrowserWindow.  No runtime
 * override is needed here.
 *
 * This file exists so the evasion list is complete and the flag-based
 * approach is documented in one place.
 */
function userAgent() {
    // Intentionally empty — user-agent is configured via Chromium flags.
}
