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
export default function sourceurl(): void {
  try {
    const PATTERNS = [
      /__puppeteer_evaluation_script__/,
      /__playwright_evaluation_script__/,
      /__electron_evaluation_script__/,
      /# sourceURL=pptr:/,
      /# sourceURL=playwright:/,
    ];

    function containsSuspiciousSource(str: string): boolean {
      return PATTERNS.some((p) => p.test(str));
    }

    // ---- patch Error stack traces (V8) ----
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ErrorConstructor = Error as any;
    const origPrepareStackTrace = ErrorConstructor.prepareStackTrace;

    ErrorConstructor.prepareStackTrace = function (
      error: Error,
      structuredStackTrace: NodeJS.CallSite[],
    ): string {
      // Filter out frames with suspicious file names
      const filtered = structuredStackTrace.filter((frame) => {
        const fileName = frame.getFileName();
        if (fileName && containsSuspiciousSource(fileName)) return false;
        return true;
      });

      if (origPrepareStackTrace) {
        return origPrepareStackTrace(error, filtered);
      }

      // Default V8 formatting
      const lines = filtered.map((frame) => `    at ${frame.toString()}`);
      return `${error.name}: ${error.message}\n${lines.join('\n')}`;
    };

    // ---- patch Function.prototype.toString ----
    const origFnToString = Function.prototype.toString;
    const sourceUrlPattern = /\/\/[#@]\s*sourceURL=.*$/gm;

    Function.prototype.toString = function (): string {
      const result = origFnToString.call(this);
      // Strip sourceURL comments that could reveal injection
      return result.replace(sourceUrlPattern, '');
    };
  } catch (_e) {
    // Silently ignore
  }
}
