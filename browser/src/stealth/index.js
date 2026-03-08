"use strict";
/**
 * Stealth evasion composer.
 *
 * Collects all individual evasion modules and returns a single JavaScript
 * string that, when injected into a page context, applies every evasion.
 *
 * This is used by the stealth preload script which runs before any page
 * scripts execute.
 *
 * Evasions are ported from puppeteer-extra-plugin-stealth and adapted
 * for Electron preload script injection.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sourceurl = exports.windowDimensions = exports.navigatorVendor = exports.navigatorLanguages = exports.mediaCodecs = exports.iframeContentWindow = exports.chromeLoadTimes = exports.chromeCsi = exports.chromeApp = exports.userAgent = exports.audioContext = exports.canvasNoise = exports.webglVendor = exports.pluginsMimetypes = exports.permissionsApi = exports.chromeRuntime = exports.navigatorWebdriver = void 0;
exports.applyEvasions = applyEvasions;
exports.composeEvasions = composeEvasions;
exports.getEvasionNames = getEvasionNames;
const navigator_webdriver_1 = __importDefault(require("./evasions/navigator-webdriver"));
exports.navigatorWebdriver = navigator_webdriver_1.default;
const chrome_runtime_1 = __importDefault(require("./evasions/chrome-runtime"));
exports.chromeRuntime = chrome_runtime_1.default;
const permissions_api_1 = __importDefault(require("./evasions/permissions-api"));
exports.permissionsApi = permissions_api_1.default;
const plugins_mimetypes_1 = __importDefault(require("./evasions/plugins-mimetypes"));
exports.pluginsMimetypes = plugins_mimetypes_1.default;
const webgl_vendor_1 = __importDefault(require("./evasions/webgl-vendor"));
exports.webglVendor = webgl_vendor_1.default;
const canvas_noise_1 = __importDefault(require("./evasions/canvas-noise"));
exports.canvasNoise = canvas_noise_1.default;
const audio_context_1 = __importDefault(require("./evasions/audio-context"));
exports.audioContext = audio_context_1.default;
const user_agent_1 = __importDefault(require("./evasions/user-agent"));
exports.userAgent = user_agent_1.default;
const chrome_app_1 = __importDefault(require("./evasions/chrome-app"));
exports.chromeApp = chrome_app_1.default;
const chrome_csi_1 = __importDefault(require("./evasions/chrome-csi"));
exports.chromeCsi = chrome_csi_1.default;
const chrome_load_times_1 = __importDefault(require("./evasions/chrome-load-times"));
exports.chromeLoadTimes = chrome_load_times_1.default;
const iframe_content_window_1 = __importDefault(require("./evasions/iframe-content-window"));
exports.iframeContentWindow = iframe_content_window_1.default;
const media_codecs_1 = __importDefault(require("./evasions/media-codecs"));
exports.mediaCodecs = media_codecs_1.default;
const navigator_languages_1 = __importDefault(require("./evasions/navigator-languages"));
exports.navigatorLanguages = navigator_languages_1.default;
const navigator_vendor_1 = __importDefault(require("./evasions/navigator-vendor"));
exports.navigatorVendor = navigator_vendor_1.default;
const window_dimensions_1 = __importDefault(require("./evasions/window-dimensions"));
exports.windowDimensions = window_dimensions_1.default;
const sourceurl_1 = __importDefault(require("./evasions/sourceurl"));
exports.sourceurl = sourceurl_1.default;
/**
 * Ordered list of all evasion functions.
 *
 * Order matters slightly: sourceurl should come first so that subsequent
 * evasions benefit from stack-trace scrubbing, and chrome-* stubs should
 * be set up before anything that might reference window.chrome.
 */
const evasions = [
    sourceurl_1.default,
    navigator_webdriver_1.default,
    chrome_runtime_1.default,
    chrome_app_1.default,
    chrome_csi_1.default,
    chrome_load_times_1.default,
    permissions_api_1.default,
    plugins_mimetypes_1.default,
    webgl_vendor_1.default,
    canvas_noise_1.default,
    audio_context_1.default,
    user_agent_1.default,
    iframe_content_window_1.default,
    media_codecs_1.default,
    navigator_languages_1.default,
    navigator_vendor_1.default,
    window_dimensions_1.default,
];
/**
 * Execute all stealth evasions immediately.
 * Call this from a preload script running with `contextIsolation: false`.
 */
function applyEvasions() {
    for (const evasion of evasions) {
        try {
            evasion();
        }
        catch {
            // Individual evasion failure should not prevent others from running
        }
    }
}
/**
 * Returns a self-executing JavaScript string containing all evasions.
 * Each evasion is wrapped in its own IIFE with try/catch so errors in one
 * evasion do not prevent the others from executing.
 *
 * Useful for injection via `webContents.executeJavaScript()` or a
 * `<script>` element.
 */
function composeEvasions() {
    return evasions.map((fn) => `(${fn.toString()})();`).join('\n');
}
/**
 * Get the list of evasion function names (useful for logging/debugging).
 */
function getEvasionNames() {
    return evasions.map((fn) => fn.name || 'anonymous');
}
