/**
 * sourceURL stripping evasion
 *
 * When Chromium injects scripts via `evaluateOnNewDocument` or
 * `executeScript`, it often appends a `//# sourceURL=__puppeteer_evaluation_script__`
 * or similar comment.  Detection scripts scan for these markers in
 * `Error().stack` or via `document.scripts`.
 *
 * This evasion overrides `Error.prepareStackTrace` (V8-specific) to strip
 * suspicious sourceURL markers from stack traces, and patches
 * `Function.prototype.toString` to strip sourceURL comments from
 * stringified function bodies.
 */
export default function sourceurl(): void;
