"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = chromeApp;
/**
 * chrome.app evasion
 *
 * Regular Chrome exposes `window.chrome.app` with several properties and
 * methods.  Headless / Electron environments lack this, which is a common
 * bot detection signal.
 */
function chromeApp() {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const w = window;
        if (!w.chrome) {
            w.chrome = {};
        }
        if (!w.chrome.app) {
            const app = {
                isInstalled: false,
                InstallState: {
                    DISABLED: 'disabled',
                    INSTALLED: 'installed',
                    NOT_INSTALLED: 'not_installed',
                },
                RunningState: {
                    CANNOT_RUN: 'cannot_run',
                    READY_TO_RUN: 'ready_to_run',
                    RUNNING: 'running',
                },
                getDetails: function () {
                    return null;
                },
                getIsInstalled: function () {
                    return false;
                },
                installState: function (callback) {
                    if (typeof callback === 'function') {
                        callback('not_installed');
                        return undefined;
                    }
                    return 'not_installed';
                },
            };
            Object.defineProperty(w.chrome, 'app', {
                value: app,
                writable: false,
                configurable: false,
                enumerable: true,
            });
        }
    }
    catch (_e) {
        // Silently ignore
    }
}
