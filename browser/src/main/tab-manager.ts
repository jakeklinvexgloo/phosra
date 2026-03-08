/**
 * Tab manager — owns one WebContentsView per tab inside the BaseWindow.
 *
 * The chrome UI occupies a fixed-height strip at the top of the window.
 * Each browser tab is a separate WebContentsView positioned below it.
 * Only the active tab's view is visible; the rest are hidden by setting
 * their bounds to zero.
 */

import { BaseWindow, WebContentsView, session } from 'electron';
import * as path from 'path';
import type { CredentialManager } from './credential-manager';
import type { AuthManager } from './auth-manager';

export interface Tab {
  id: number;
  view: WebContentsView;
  title: string;
  url: string;
  favicon: string;
  isLoading: boolean;
  canGoBack: boolean;
  canGoForward: boolean;
}

/** Serialisable subset sent to the renderer over IPC. */
export interface TabInfo {
  id: number;
  title: string;
  url: string;
  favicon: string;
  isLoading: boolean;
  canGoBack: boolean;
  canGoForward: boolean;
}

export class TabManager {
  private tabs: Map<number, Tab> = new Map();
  private activeTabId: number | null = null;
  private nextId = 1;

  private readonly parentWindow: BaseWindow;
  private readonly chromeHeight: number;
  private readonly stealthPreloadPath: string;
  private readonly homePreloadPath: string;
  private readonly familyPreloadPath: string;
  private readonly profilePath: string;
  private readonly profilePartition: string;

  /**
   * Reference to the chrome UI view so we can push tab-state-update events.
   * Set after construction via `setChromeView()`.
   */
  private chromeView: WebContentsView | null = null;

  /** Credential manager for auto-fill. Set via `setCredentialManager()`. */
  private credentialManager: CredentialManager | null = null;

  /** Auth manager for Phosra token capture. Set via `setAuthManager()`. */
  private authManager: AuthManager | null = null;

  constructor(
    parentWindow: BaseWindow,
    stealthPreloadPath: string,
    homePreloadPath: string,
    familyPreloadPath: string,
    profilePath: string,
    chromeHeight = 80,
  ) {
    this.parentWindow = parentWindow;
    this.stealthPreloadPath = stealthPreloadPath;
    this.homePreloadPath = homePreloadPath;
    this.familyPreloadPath = familyPreloadPath;
    this.profilePath = profilePath;
    this.chromeHeight = chromeHeight;

    // Derive a stable partition name from the profile directory name
    const profileName = path.basename(profilePath);
    this.profilePartition = `persist:${profileName}`;
  }

  /** Inject the chrome view so we can send IPC events to it. */
  setChromeView(view: WebContentsView): void {
    this.chromeView = view;
  }

  /** Inject the credential manager for auto-fill support. */
  setCredentialManager(manager: CredentialManager): void {
    this.credentialManager = manager;
  }

  /** Inject the auth manager for Phosra token capture. */
  setAuthManager(manager: AuthManager): void {
    this.authManager = manager;
  }

  /** Right-side inset (pixels) reserved for a drawer panel. */
  private rightInset = 0;

  /** Set the right inset to shrink tabs and make room for a side panel. */
  setRightInset(px: number): void {
    this.rightInset = Math.max(0, px);
  }

  // -------------------------------------------------------------------
  // Tab CRUD
  // -------------------------------------------------------------------

  createTab(url?: string): Tab {
    const id = this.nextId++;
    const targetUrl = url || 'phosra://home';

    // Determine if this tab should use a phosra:// preload
    const isPhosraUrl = targetUrl.startsWith('phosra://');
    const isFamilyUrl = targetUrl.startsWith('phosra://family');

    // Select the appropriate preload script
    let preloadPath: string;
    if (isFamilyUrl) {
      preloadPath = this.familyPreloadPath;
    } else if (isPhosraUrl) {
      preloadPath = this.homePreloadPath;
    } else {
      preloadPath = this.stealthPreloadPath;
    }

    // Obtain (or create) a persistent session for this profile
    const ses = session.fromPartition(this.profilePartition, {
      cache: true,
    });

    // Set clean Chrome UA on the session (hides Electron identifier)
    const CHROME_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';
    ses.setUserAgent(CHROME_UA);

    const view = new WebContentsView({
      webPreferences: {
        preload: preloadPath,
        sandbox: isPhosraUrl ? true : false,
        contextIsolation: true,
        plugins: isPhosraUrl ? false : true,
        session: ses,
        nodeIntegration: false,
      },
    });

    const tab: Tab = {
      id,
      view,
      title: 'New Tab',
      url: targetUrl,
      favicon: '',
      isLoading: true,
      canGoBack: false,
      canGoForward: false,
    };

    // Attach webContents listeners before navigation
    this.attachListeners(tab);

    // Add the view to the window and position it
    this.parentWindow.contentView.addChildView(view);

    const tab_ = tab; // capture for closure safety
    this.tabs.set(id, tab_);

    // If this is the first tab, make it active
    if (this.activeTabId === null) {
      this.activeTabId = id;
    }

    // Lay out all tabs (new tab starts hidden unless it is the active one)
    this.updateLayout(this.getWindowBounds());

    // Navigate
    view.webContents.loadURL(targetUrl).catch((err: Error) => {
      console.error(`[TabManager] Failed to load ${targetUrl}:`, err.message);
    });

    this.pushStateUpdate();
    return tab_;
  }

  closeTab(id: number): void {
    const tab = this.tabs.get(id);
    if (!tab) return;

    // Remove the view from the window
    this.parentWindow.contentView.removeChildView(tab.view);

    // Destroy the underlying webContents (cleans up renderer process)
    try {
      (tab.view.webContents as any).close();
    } catch {
      // Already destroyed — ignore
    }

    this.tabs.delete(id);

    // If we closed the active tab, switch to another one
    if (this.activeTabId === id) {
      const remaining = Array.from(this.tabs.keys());
      this.activeTabId = remaining.length > 0 ? remaining[remaining.length - 1] : null;
      this.updateLayout(this.getWindowBounds());
    }

    this.pushStateUpdate();
  }

  switchTab(id: number): void {
    if (!this.tabs.has(id)) return;
    this.activeTabId = id;
    this.updateLayout(this.getWindowBounds());
    this.pushStateUpdate();
  }

  getTab(id: number): Tab | undefined {
    return this.tabs.get(id);
  }

  getActiveTab(): Tab | undefined {
    if (this.activeTabId === null) return undefined;
    return this.tabs.get(this.activeTabId);
  }

  getAllTabs(): Tab[] {
    return Array.from(this.tabs.values());
  }

  getActiveTabId(): number | null {
    return this.activeTabId;
  }

  // -------------------------------------------------------------------
  // Layout
  // -------------------------------------------------------------------

  updateLayout(windowBounds: { width: number; height: number }): void {
    const contentWidth = Math.max(windowBounds.width - this.rightInset, 0);
    const contentHeight = windowBounds.height - this.chromeHeight;

    for (const [id, tab] of this.tabs) {
      if (id === this.activeTabId) {
        tab.view.setBounds({
          x: 0,
          y: this.chromeHeight,
          width: Math.max(contentWidth, 0),
          height: Math.max(contentHeight, 0),
        });
        tab.view.setVisible(true);
      } else {
        // Hide inactive tabs by making them invisible
        tab.view.setVisible(false);
      }
    }
  }

  // -------------------------------------------------------------------
  // Serialisation helpers
  // -------------------------------------------------------------------

  toTabInfoList(): TabInfo[] {
    return this.getAllTabs().map((t) => this.toTabInfo(t));
  }

  // -------------------------------------------------------------------
  // Private helpers
  // -------------------------------------------------------------------

  private toTabInfo(tab: Tab): TabInfo {
    return {
      id: tab.id,
      title: tab.title,
      url: tab.url,
      favicon: tab.favicon,
      isLoading: tab.isLoading,
      canGoBack: tab.canGoBack,
      canGoForward: tab.canGoForward,
    };
  }

  private attachListeners(tab: Tab): void {
    const wc = tab.view.webContents;

    wc.on('did-navigate', (_event, url) => {
      tab.url = url;
      tab.canGoBack = wc.navigationHistory.canGoBack();
      tab.canGoForward = wc.navigationHistory.canGoForward();
      this.pushStateUpdate();
      this.attemptAutoFill(tab, url);
      this.attemptTokenCapture(url);
    });

    wc.on('did-navigate-in-page', (_event, url) => {
      tab.url = url;
      tab.canGoBack = wc.navigationHistory.canGoBack();
      tab.canGoForward = wc.navigationHistory.canGoForward();
      this.pushStateUpdate();
      // Client-side navigations (e.g. Next.js router.push) fire here, not did-navigate.
      // After email/password login, Stytch sets the cookie then router.push('/dashboard').
      this.attemptTokenCapture(url);
      // Multi-step logins (e.g. Amazon email→password) may use in-page navigation
      this.attemptAutoFill(tab, url);
    });

    wc.on('page-title-updated', (_event, title) => {
      tab.title = title;
      this.pushStateUpdate();
    });

    wc.on('page-favicon-updated', (_event, favicons) => {
      if (favicons && favicons.length > 0) {
        tab.favicon = favicons[0];
        this.pushStateUpdate();
      }
    });

    wc.on('did-start-loading', () => {
      tab.isLoading = true;
      this.pushStateUpdate();
    });

    wc.on('did-stop-loading', () => {
      tab.isLoading = false;
      tab.canGoBack = wc.navigationHistory.canGoBack();
      tab.canGoForward = wc.navigationHistory.canGoForward();
      this.pushStateUpdate();
    });

    wc.on('did-fail-load', (_event, _errorCode, errorDescription, validatedURL) => {
      tab.isLoading = false;
      tab.url = validatedURL;
      tab.title = `Failed: ${errorDescription}`;
      this.pushStateUpdate();
    });

    // Open links that would create a new window in a new tab instead
    wc.setWindowOpenHandler(({ url }) => {
      this.createTab(url);
      return { action: 'deny' };
    });
  }

  private pushStateUpdate(): void {
    if (!this.chromeView || this.chromeView.webContents.isDestroyed()) return;
    try {
      this.chromeView.webContents.send('tab:state-update', {
        tabs: this.toTabInfoList(),
        activeTabId: this.activeTabId,
      });
    } catch {
      // Chrome view may have been destroyed — ignore
    }
  }

  private getWindowBounds(): { width: number; height: number } {
    const bounds = this.parentWindow.getBounds();
    return { width: bounds.width, height: bounds.height };
  }

  // -------------------------------------------------------------------
  // Phosra auth token capture
  // -------------------------------------------------------------------

  private attemptTokenCapture(url: string): void {
    if (!this.authManager) return;

    // Detect navigation to phosra.com/dashboard (login success)
    try {
      const parsed = new URL(url);
      const isPhosra = parsed.hostname === 'www.phosra.com' || parsed.hostname === 'phosra.com';
      if (isPhosra && parsed.pathname.startsWith('/dashboard')) {
        this.authManager.captureTokenFromSession().then((captured) => {
          if (captured) {
            this.pushAuthStatusChanged();
          }
        }).catch((err) => {
          console.error('[TabManager] Token capture failed:', err);
        });
      }
    } catch {
      // Invalid URL — ignore
    }
  }

  private pushAuthStatusChanged(): void {
    if (!this.chromeView || this.chromeView.webContents.isDestroyed()) return;
    if (!this.authManager) return;
    try {
      this.chromeView.webContents.send('auth:status-changed', this.authManager.getInfo());
    } catch {
      // Chrome view may be destroyed
    }
  }

  // -------------------------------------------------------------------
  // Auto-fill
  // -------------------------------------------------------------------

  private attemptAutoFill(tab: Tab, url: string): void {
    if (!this.credentialManager) return;

    // Notify chrome UI whether credentials are available for this URL
    const match = this.credentialManager.hasCredentialForUrl(url);
    this.pushAutoFillNotification(tab.id, match);

    if (!match) return;

    const data = this.credentialManager.getAutoFillData(url);
    if (!data) return;

    const { service, username, password } = data;
    const { selectors } = service;

    // Build a fill script that handles multi-step logins (e.g. Amazon: email → password).
    // Only fills fields that exist on the current page and returns what was filled.
    const submitSelector = selectors.submit ?? null;
    const fillScript = `
      (function() {
        function fill(selector, value) {
          var el = document.querySelector(selector);
          if (!el || el.offsetParent === null) return false;
          var nativeSet = Object.getOwnPropertyDescriptor(
            window.HTMLInputElement.prototype, 'value'
          );
          if (nativeSet && nativeSet.set) {
            nativeSet.set.call(el, value);
          } else {
            el.value = value;
          }
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
          el.dispatchEvent(new Event('blur', { bubbles: true }));
          return true;
        }
        var filledUser = fill(${JSON.stringify(selectors.username)}, ${JSON.stringify(username)});
        var filledPass = fill(${JSON.stringify(selectors.password)}, ${JSON.stringify(password)});
        return { filledUser: filledUser, filledPass: filledPass };
      })();
    `;

    // Script to find and click the submit button after fields are filled
    const submitScript = `
      (function() {
        var submitSelector = ${JSON.stringify(submitSelector)};
        var btn = submitSelector ? document.querySelector(submitSelector) : null;
        if (!btn) {
          btn = document.querySelector('button[type="submit"]')
            || document.querySelector('input[type="submit"]')
            || document.querySelector('form button:not([type="button"])');
        }
        if (btn) { btn.click(); return true; }
        return false;
      })();
    `;

    // Delay slightly to let the page render its login form
    setTimeout(() => {
      try {
        if (!tab.view.webContents.isDestroyed()) {
          tab.view.webContents.executeJavaScript(fillScript).then((result: { filledUser: boolean; filledPass: boolean }) => {
            // Only submit if we actually filled at least one field
            if (!result.filledUser && !result.filledPass) return;
            // Click submit 500ms after fill so frameworks can process the input events
            setTimeout(() => {
              if (!tab.view.webContents.isDestroyed()) {
                tab.view.webContents.executeJavaScript(submitScript).catch(() => {});
              }
            }, 500);
          }).catch(() => {
            // Page may have navigated away — ignore
          });

          // After fill + submit, check for MFA challenge after 5s
          const serviceName = service.displayName ?? service.id ?? 'This service';
          setTimeout(() => {
            this.detectMfaChallenge(tab, serviceName);
          }, 5000);
        }
      } catch {
        // View may be destroyed
      }
    }, 1500);
  }

  // -------------------------------------------------------------------
  // MFA detection
  // -------------------------------------------------------------------

  private detectMfaChallenge(tab: Tab, serviceName: string): void {
    if (tab.view.webContents.isDestroyed()) return;

    const currentUrl = tab.url.toLowerCase();
    const currentTitle = (tab.title || '').toLowerCase();

    // Check URL and title for MFA indicators
    const mfaIndicators = ['verify', 'two-factor', '2fa', 'mfa', 'otp', 'code', 'challenge', 'authentication', 'confirm'];
    const hasMfaSignal = mfaIndicators.some(
      (indicator) => currentUrl.includes(indicator) || currentTitle.includes(indicator),
    );

    if (hasMfaSignal) {
      this.pushMfaNotification(tab.id, serviceName);
    }
  }

  private pushMfaNotification(tabId: number, serviceName: string): void {
    if (!this.chromeView || this.chromeView.webContents.isDestroyed()) return;
    try {
      this.chromeView.webContents.send('mfa:challenge-detected', {
        tabId,
        serviceName,
      });
    } catch {
      // Chrome view may be destroyed
    }
  }

  private pushAutoFillNotification(
    tabId: number,
    match: { serviceId: string; displayName: string } | null,
  ): void {
    if (!this.chromeView || this.chromeView.webContents.isDestroyed()) return;
    try {
      this.chromeView.webContents.send('credentials:autofill-available', {
        tabId,
        service: match,
      });
    } catch {
      // Chrome view may be destroyed
    }
  }
}
