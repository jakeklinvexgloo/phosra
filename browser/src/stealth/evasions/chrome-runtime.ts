/**
 * chrome.runtime evasion
 *
 * Regular Chrome browsers expose `window.chrome.runtime` with stub methods.
 * Headless / Electron environments often lack this object entirely, which
 * fingerprinting scripts check for.  We add a minimal but realistic stub.
 */
export default function chromeRuntime(): void {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;

    if (!w.chrome) {
      w.chrome = {};
    }

    if (!w.chrome.runtime) {
      const runtime = {
        connect: function () {
          // In a real extension context this would connect to background.
          // For a regular page it simply returns undefined / throws.
          return undefined;
        },
        sendMessage: function (
          _message: unknown,
          _responseCallback?: (response: unknown) => void,
        ) {
          // No-op — regular pages cannot send extension messages.
          return undefined;
        },
        // OnInstalledReason enum stub — some scripts probe for it
        OnInstalledReason: {
          CHROME_UPDATE: 'chrome_update',
          INSTALL: 'install',
          SHARED_MODULE_UPDATE: 'shared_module_update',
          UPDATE: 'update',
        },
        // Provide an id property that is undefined (no extension loaded)
        id: undefined,
      };

      // Make it non-writable so detection scripts cannot overwrite & test
      Object.defineProperty(w.chrome, 'runtime', {
        value: runtime,
        writable: false,
        configurable: false,
        enumerable: true,
      });
    }

    // chrome.webstore stub — some fingerprinting scripts probe for it
    if (!w.chrome.webstore) {
      const webstore = {
        onInstallStageChanged: {},
        onDownloadProgress: {},
        install: function (
          _url?: string,
          _onSuccess?: () => void,
          _onFailure?: (error: string, errorCode?: string) => void,
        ) {
          // Deprecated but some detection scripts still check for it
        },
      };

      Object.defineProperty(w.chrome, 'webstore', {
        value: webstore,
        writable: false,
        configurable: false,
        enumerable: true,
      });
    }
  } catch (_e) {
    // Silently ignore
  }
}
