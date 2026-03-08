/**
 * iframe.contentWindow evasion
 *
 * In headless Chrome, accessing `contentWindow` on a cross-origin iframe
 * may return `null`, whereas a real browser returns a restricted Window
 * proxy.  Some detection scripts create a temporary iframe and immediately
 * check `contentWindow` before the frame loads.
 *
 * We wrap the getter with a Proxy trap that returns a minimal Window-like
 * object when the native getter would return null.
 */
export default function iframeContentWindow(): void;
