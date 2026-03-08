/**
 * chrome.runtime evasion
 *
 * Regular Chrome browsers expose `window.chrome.runtime` with stub methods.
 * Headless / Electron environments often lack this object entirely, which
 * fingerprinting scripts check for.  We add a minimal but realistic stub.
 */
export default function chromeRuntime(): void;
