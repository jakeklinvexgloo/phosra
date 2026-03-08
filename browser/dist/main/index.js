"use strict";
var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
const electron = require("electron");
const path = require("path");
const fs = require("fs");
const ws = require("ws");
function _interopNamespaceDefault(e) {
  const n = Object.create(null, { [Symbol.toStringTag]: { value: "Module" } });
  if (e) {
    for (const k in e) {
      if (k !== "default") {
        const d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: () => e[k]
        });
      }
    }
  }
  n.default = e;
  return Object.freeze(n);
}
const path__namespace = /* @__PURE__ */ _interopNamespaceDefault(path);
const fs__namespace = /* @__PURE__ */ _interopNamespaceDefault(fs);
const isDev = process.env.NODE_ENV !== "production";
function getStealthFlags() {
  const flags = [
    // Core automation-detection mitigations
    "disable-blink-features=AutomationControlled",
    "disable-features=IsolateOrigins,site-per-process",
    "disable-site-isolation-trials",
    // Locale
    "lang=en-US,en",
    // Suppress Chrome-specific UI / first-run behaviour
    "disable-infobars",
    "no-first-run",
    "no-default-browser-check",
    // Reduce background noise / network fingerprints
    "disable-background-networking",
    "disable-breakpad",
    "disable-component-update",
    "disable-default-apps",
    "disable-extensions",
    "disable-hang-monitor",
    "disable-popup-blocking",
    "disable-prompt-on-repost",
    "disable-sync",
    "disable-translate",
    "metrics-recording-only",
    "safebrowsing-disable-auto-update"
  ];
  if (isDev) {
    flags.push("disable-web-security");
  }
  return flags;
}
const DEFAULT_PROFILE_NAME = "default";
class ProfileManager {
  constructor() {
    __publicField(this, "profilesDir");
    const userData = electron.app.getPath("userData");
    this.profilesDir = path__namespace.join(userData, "profiles");
    if (!fs__namespace.existsSync(this.profilesDir)) {
      fs__namespace.mkdirSync(this.profilesDir, { recursive: true });
    }
    this.ensureProfile(DEFAULT_PROFILE_NAME);
  }
  /**
   * Returns the absolute filesystem path for the given profile name.
   */
  getProfilePath(name) {
    return path__namespace.join(this.profilesDir, this.sanitizeName(name));
  }
  /**
   * Returns all available profile names (directory names under profilesDir).
   */
  listProfiles() {
    try {
      return fs__namespace.readdirSync(this.profilesDir, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
    } catch {
      return [];
    }
  }
  /**
   * Creates a new profile directory.  Returns the absolute path.
   * If the profile already exists, returns its path without error.
   */
  createProfile(name) {
    const profilePath = this.getProfilePath(name);
    this.ensureProfile(name);
    return profilePath;
  }
  /**
   * Deletes a profile directory and all its contents.
   * Throws if the caller tries to delete the default profile.
   */
  deleteProfile(name) {
    const sanitized = this.sanitizeName(name);
    if (sanitized === DEFAULT_PROFILE_NAME) {
      throw new Error("Cannot delete the default profile");
    }
    const profilePath = this.getProfilePath(name);
    if (fs__namespace.existsSync(profilePath)) {
      fs__namespace.rmSync(profilePath, { recursive: true, force: true });
    }
  }
  /**
   * Convenience accessor for the default profile path.
   */
  getDefaultProfilePath() {
    return this.getProfilePath(DEFAULT_PROFILE_NAME);
  }
  // ---- private helpers ----
  sanitizeName(name) {
    return name.replace(/[^a-zA-Z0-9_-]/g, "_") || DEFAULT_PROFILE_NAME;
  }
  ensureProfile(name) {
    const profilePath = this.getProfilePath(name);
    if (!fs__namespace.existsSync(profilePath)) {
      fs__namespace.mkdirSync(profilePath, { recursive: true });
    }
  }
}
class TabManager {
  constructor(parentWindow, stealthPreloadPath2, homePreloadPath2, familyPreloadPath2, profilePath, chromeHeight = 80) {
    __publicField(this, "tabs", /* @__PURE__ */ new Map());
    __publicField(this, "activeTabId", null);
    __publicField(this, "nextId", 1);
    __publicField(this, "parentWindow");
    __publicField(this, "chromeHeight");
    __publicField(this, "stealthPreloadPath");
    __publicField(this, "homePreloadPath");
    __publicField(this, "familyPreloadPath");
    __publicField(this, "profilePath");
    __publicField(this, "profilePartition");
    /**
     * Reference to the chrome UI view so we can push tab-state-update events.
     * Set after construction via `setChromeView()`.
     */
    __publicField(this, "chromeView", null);
    /** Credential manager for auto-fill. Set via `setCredentialManager()`. */
    __publicField(this, "credentialManager", null);
    /** Auth manager for Phosra token capture. Set via `setAuthManager()`. */
    __publicField(this, "authManager", null);
    /** Right-side inset (pixels) reserved for a drawer panel. */
    __publicField(this, "rightInset", 0);
    this.parentWindow = parentWindow;
    this.stealthPreloadPath = stealthPreloadPath2;
    this.homePreloadPath = homePreloadPath2;
    this.familyPreloadPath = familyPreloadPath2;
    this.profilePath = profilePath;
    this.chromeHeight = chromeHeight;
    const profileName = path__namespace.basename(profilePath);
    this.profilePartition = `persist:${profileName}`;
  }
  /** Inject the chrome view so we can send IPC events to it. */
  setChromeView(view) {
    this.chromeView = view;
  }
  /** Inject the credential manager for auto-fill support. */
  setCredentialManager(manager) {
    this.credentialManager = manager;
  }
  /** Inject the auth manager for Phosra token capture. */
  setAuthManager(manager) {
    this.authManager = manager;
  }
  /** Set the right inset to shrink tabs and make room for a side panel. */
  setRightInset(px) {
    this.rightInset = Math.max(0, px);
  }
  // -------------------------------------------------------------------
  // Tab CRUD
  // -------------------------------------------------------------------
  createTab(url) {
    const id = this.nextId++;
    const targetUrl = url || "phosra://home";
    const isPhosraUrl = targetUrl.startsWith("phosra://");
    const isFamilyUrl = targetUrl.startsWith("phosra://family");
    let preloadPath;
    if (isFamilyUrl) {
      preloadPath = this.familyPreloadPath;
    } else if (isPhosraUrl) {
      preloadPath = this.homePreloadPath;
    } else {
      preloadPath = this.stealthPreloadPath;
    }
    const ses = electron.session.fromPartition(this.profilePartition, {
      cache: true
    });
    const CHROME_UA2 = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";
    ses.setUserAgent(CHROME_UA2);
    const view = new electron.WebContentsView({
      webPreferences: {
        preload: preloadPath,
        sandbox: isPhosraUrl ? true : false,
        contextIsolation: true,
        plugins: isPhosraUrl ? false : true,
        session: ses,
        nodeIntegration: false
      }
    });
    const tab = {
      id,
      view,
      title: "New Tab",
      url: targetUrl,
      favicon: "",
      isLoading: true,
      canGoBack: false,
      canGoForward: false
    };
    this.attachListeners(tab);
    this.parentWindow.contentView.addChildView(view);
    const tab_ = tab;
    this.tabs.set(id, tab_);
    if (this.activeTabId === null) {
      this.activeTabId = id;
    }
    this.updateLayout(this.getWindowBounds());
    view.webContents.loadURL(targetUrl).catch((err) => {
      console.error(`[TabManager] Failed to load ${targetUrl}:`, err.message);
    });
    this.pushStateUpdate();
    return tab_;
  }
  closeTab(id) {
    const tab = this.tabs.get(id);
    if (!tab) return;
    this.parentWindow.contentView.removeChildView(tab.view);
    try {
      tab.view.webContents.close();
    } catch {
    }
    this.tabs.delete(id);
    if (this.activeTabId === id) {
      const remaining = Array.from(this.tabs.keys());
      this.activeTabId = remaining.length > 0 ? remaining[remaining.length - 1] : null;
      this.updateLayout(this.getWindowBounds());
    }
    this.pushStateUpdate();
  }
  switchTab(id) {
    if (!this.tabs.has(id)) return;
    this.activeTabId = id;
    this.updateLayout(this.getWindowBounds());
    this.pushStateUpdate();
  }
  getTab(id) {
    return this.tabs.get(id);
  }
  getActiveTab() {
    if (this.activeTabId === null) return void 0;
    return this.tabs.get(this.activeTabId);
  }
  getAllTabs() {
    return Array.from(this.tabs.values());
  }
  getActiveTabId() {
    return this.activeTabId;
  }
  // -------------------------------------------------------------------
  // Layout
  // -------------------------------------------------------------------
  updateLayout(windowBounds) {
    const contentWidth = Math.max(windowBounds.width - this.rightInset, 0);
    const contentHeight = windowBounds.height - this.chromeHeight;
    for (const [id, tab] of this.tabs) {
      if (id === this.activeTabId) {
        tab.view.setBounds({
          x: 0,
          y: this.chromeHeight,
          width: Math.max(contentWidth, 0),
          height: Math.max(contentHeight, 0)
        });
        tab.view.setVisible(true);
      } else {
        tab.view.setVisible(false);
      }
    }
  }
  // -------------------------------------------------------------------
  // Serialisation helpers
  // -------------------------------------------------------------------
  toTabInfoList() {
    return this.getAllTabs().map((t) => this.toTabInfo(t));
  }
  // -------------------------------------------------------------------
  // Private helpers
  // -------------------------------------------------------------------
  toTabInfo(tab) {
    return {
      id: tab.id,
      title: tab.title,
      url: tab.url,
      favicon: tab.favicon,
      isLoading: tab.isLoading,
      canGoBack: tab.canGoBack,
      canGoForward: tab.canGoForward
    };
  }
  attachListeners(tab) {
    const wc = tab.view.webContents;
    wc.on("did-navigate", (_event, url) => {
      tab.url = url;
      tab.canGoBack = wc.navigationHistory.canGoBack();
      tab.canGoForward = wc.navigationHistory.canGoForward();
      this.pushStateUpdate();
      this.attemptAutoFill(tab, url);
      this.attemptTokenCapture(url);
    });
    wc.on("did-navigate-in-page", (_event, url) => {
      tab.url = url;
      tab.canGoBack = wc.navigationHistory.canGoBack();
      tab.canGoForward = wc.navigationHistory.canGoForward();
      this.pushStateUpdate();
      this.attemptTokenCapture(url);
      this.attemptAutoFill(tab, url);
    });
    wc.on("page-title-updated", (_event, title) => {
      tab.title = title;
      this.pushStateUpdate();
    });
    wc.on("page-favicon-updated", (_event, favicons) => {
      if (favicons && favicons.length > 0) {
        tab.favicon = favicons[0];
        this.pushStateUpdate();
      }
    });
    wc.on("did-start-loading", () => {
      tab.isLoading = true;
      this.pushStateUpdate();
    });
    wc.on("did-stop-loading", () => {
      tab.isLoading = false;
      tab.canGoBack = wc.navigationHistory.canGoBack();
      tab.canGoForward = wc.navigationHistory.canGoForward();
      this.pushStateUpdate();
    });
    wc.on("did-fail-load", (_event, _errorCode, errorDescription, validatedURL) => {
      tab.isLoading = false;
      tab.url = validatedURL;
      tab.title = `Failed: ${errorDescription}`;
      this.pushStateUpdate();
    });
    wc.setWindowOpenHandler(({ url }) => {
      this.createTab(url);
      return { action: "deny" };
    });
  }
  pushStateUpdate() {
    if (!this.chromeView || this.chromeView.webContents.isDestroyed()) return;
    try {
      this.chromeView.webContents.send("tab:state-update", {
        tabs: this.toTabInfoList(),
        activeTabId: this.activeTabId
      });
    } catch {
    }
  }
  getWindowBounds() {
    const bounds = this.parentWindow.getBounds();
    return { width: bounds.width, height: bounds.height };
  }
  // -------------------------------------------------------------------
  // Phosra auth token capture
  // -------------------------------------------------------------------
  attemptTokenCapture(url) {
    if (!this.authManager) return;
    try {
      const parsed = new URL(url);
      const isPhosra = parsed.hostname === "www.phosra.com" || parsed.hostname === "phosra.com";
      if (isPhosra && parsed.pathname.startsWith("/dashboard")) {
        this.authManager.captureTokenFromSession().then((captured) => {
          if (captured) {
            this.pushAuthStatusChanged();
          }
        }).catch((err) => {
          console.error("[TabManager] Token capture failed:", err);
        });
      }
    } catch {
    }
  }
  pushAuthStatusChanged() {
    if (!this.chromeView || this.chromeView.webContents.isDestroyed()) return;
    if (!this.authManager) return;
    try {
      this.chromeView.webContents.send("auth:status-changed", this.authManager.getInfo());
    } catch {
    }
  }
  // -------------------------------------------------------------------
  // Auto-fill
  // -------------------------------------------------------------------
  attemptAutoFill(tab, url) {
    if (!this.credentialManager) return;
    const match = this.credentialManager.hasCredentialForUrl(url);
    this.pushAutoFillNotification(tab.id, match);
    if (!match) return;
    const data = this.credentialManager.getAutoFillData(url);
    if (!data) return;
    const { service, username, password } = data;
    const { selectors } = service;
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
    setTimeout(() => {
      try {
        if (!tab.view.webContents.isDestroyed()) {
          tab.view.webContents.executeJavaScript(fillScript).then((result) => {
            if (!result.filledUser && !result.filledPass) return;
            setTimeout(() => {
              if (!tab.view.webContents.isDestroyed()) {
                tab.view.webContents.executeJavaScript(submitScript).catch(() => {
                });
              }
            }, 500);
          }).catch(() => {
          });
          const serviceName = service.displayName ?? service.id ?? "This service";
          setTimeout(() => {
            this.detectMfaChallenge(tab, serviceName);
          }, 5e3);
        }
      } catch {
      }
    }, 1500);
  }
  // -------------------------------------------------------------------
  // MFA detection
  // -------------------------------------------------------------------
  detectMfaChallenge(tab, serviceName) {
    if (tab.view.webContents.isDestroyed()) return;
    const currentUrl = tab.url.toLowerCase();
    const currentTitle = (tab.title || "").toLowerCase();
    const mfaIndicators = ["verify", "two-factor", "2fa", "mfa", "otp", "code", "challenge", "authentication", "confirm"];
    const hasMfaSignal = mfaIndicators.some(
      (indicator) => currentUrl.includes(indicator) || currentTitle.includes(indicator)
    );
    if (hasMfaSignal) {
      this.pushMfaNotification(tab.id, serviceName);
    }
  }
  pushMfaNotification(tabId, serviceName) {
    if (!this.chromeView || this.chromeView.webContents.isDestroyed()) return;
    try {
      this.chromeView.webContents.send("mfa:challenge-detected", {
        tabId,
        serviceName
      });
    } catch {
    }
  }
  pushAutoFillNotification(tabId, match) {
    if (!this.chromeView || this.chromeView.webContents.isDestroyed()) return;
    try {
      this.chromeView.webContents.send("credentials:autofill-available", {
        tabId,
        service: match
      });
    } catch {
    }
  }
}
const CHROME_HEIGHT = 130;
const DEFAULT_WIDTH = 1280;
const DEFAULT_HEIGHT = 900;
class WindowManager {
  constructor(chromePreloadPath2, stealthPreloadPath2, homePreloadPath2, familyPreloadPath2, profilePath) {
    __publicField(this, "window");
    __publicField(this, "chromeView");
    __publicField(this, "tabManager");
    __publicField(this, "currentChromeHeight", CHROME_HEIGHT);
    __publicField(this, "isExpanded", false);
    __publicField(this, "chromePreloadPath");
    __publicField(this, "stealthPreloadPath");
    __publicField(this, "homePreloadPath");
    __publicField(this, "familyPreloadPath");
    __publicField(this, "profilePath");
    this.chromePreloadPath = chromePreloadPath2;
    this.stealthPreloadPath = stealthPreloadPath2;
    this.homePreloadPath = homePreloadPath2;
    this.familyPreloadPath = familyPreloadPath2;
    this.profilePath = profilePath;
  }
  /**
   * Build the window, chrome UI view, and tab manager.
   * Call this once after construction.
   */
  createWindow() {
    this.window = new electron.BaseWindow({
      width: DEFAULT_WIDTH,
      height: DEFAULT_HEIGHT,
      minWidth: 480,
      minHeight: 360,
      titleBarStyle: "hiddenInset",
      show: false
      // show after chrome view is ready
    });
    this.chromeView = new electron.WebContentsView({
      webPreferences: {
        preload: this.chromePreloadPath,
        contextIsolation: true,
        nodeIntegration: false
      }
    });
    this.window.contentView.addChildView(this.chromeView);
    this.chromeView.setBounds({
      x: 0,
      y: 0,
      width: DEFAULT_WIDTH,
      height: CHROME_HEIGHT
    });
    this.loadChromeUI();
    this.tabManager = new TabManager(
      this.window,
      this.stealthPreloadPath,
      this.homePreloadPath,
      this.familyPreloadPath,
      this.profilePath,
      CHROME_HEIGHT
    );
    this.tabManager.setChromeView(this.chromeView);
    this.window.on("resize", () => {
      this.relayout();
    });
    this.chromeView.webContents.on("did-finish-load", () => {
      if (!this.window.isDestroyed()) {
        this.window.show();
      }
    });
  }
  getWindow() {
    return this.window;
  }
  getTabManager() {
    return this.tabManager;
  }
  getChromeView() {
    return this.chromeView;
  }
  /** Expand or collapse the chrome view to allow dropdowns to overflow. */
  setChromeExpanded(expanded) {
    if (this.window.isDestroyed()) return;
    this.isExpanded = expanded;
    const bounds = this.window.getBounds();
    if (expanded) {
      this.currentChromeHeight = bounds.height;
      this.window.contentView.addChildView(this.chromeView);
    } else {
      this.currentChromeHeight = CHROME_HEIGHT;
      this.window.contentView.removeChildView(this.chromeView);
      this.window.contentView.addChildView(this.chromeView, 0);
    }
    this.chromeView.setBounds({
      x: 0,
      y: 0,
      width: bounds.width,
      height: expanded ? bounds.height : CHROME_HEIGHT
    });
  }
  /** Dynamically set the chrome view height (called from renderer via IPC). */
  setChromeHeight(height) {
    if (this.window.isDestroyed()) return;
    const bounds = this.window.getBounds();
    const clamped = Math.max(CHROME_HEIGHT, Math.min(height, bounds.height));
    this.currentChromeHeight = clamped;
    if (this.isExpanded) {
      this.chromeView.setBounds({
        x: 0,
        y: 0,
        width: bounds.width,
        height: clamped
      });
    }
  }
  /**
   * Inset the active tab from the right edge to make room for a drawer panel.
   * Pass `{ right: 0 }` to restore full width.
   */
  setTabInset(inset) {
    if (this.window.isDestroyed()) return;
    this.tabManager.setRightInset(inset.right);
    this.tabManager.updateLayout(this.getWindowBounds());
  }
  getWindowBounds() {
    const bounds = this.window.getBounds();
    return { width: bounds.width, height: bounds.height };
  }
  // -------------------------------------------------------------------
  // Private helpers
  // -------------------------------------------------------------------
  loadChromeUI() {
    const isDev2 = process.env.NODE_ENV !== "production" || !!process.env.VITE_DEV_SERVER_URL;
    if (isDev2 && process.env.VITE_DEV_SERVER_URL) {
      const devUrl = process.env.VITE_DEV_SERVER_URL.replace(/\/$/, "") + "/renderer/index.html";
      this.chromeView.webContents.loadURL(devUrl).catch((err) => {
        console.error("[WindowManager] Failed to load Vite dev server:", err.message);
      });
    } else {
      const indexPath = path__namespace.join(__dirname, "..", "renderer", "index.html");
      this.chromeView.webContents.loadFile(indexPath).catch((err) => {
        console.error("[WindowManager] Failed to load renderer HTML:", err.message);
      });
    }
  }
  relayout() {
    if (this.window.isDestroyed()) return;
    const bounds = this.window.getBounds();
    const chromeH = this.isExpanded ? Math.min(this.currentChromeHeight, bounds.height) : CHROME_HEIGHT;
    this.chromeView.setBounds({
      x: 0,
      y: 0,
      width: bounds.width,
      height: chromeH
    });
    this.tabManager.updateLayout({
      width: bounds.width,
      height: bounds.height
    });
  }
}
const NETFLIX_URLS = {
  profileManage: "https://www.netflix.com/profiles/manage",
  profileSettings: (guid) => `https://www.netflix.com/settings/${guid}`,
  restrictions: (guid) => `https://www.netflix.com/settings/restrictions/${guid}`,
  playback: (guid) => `https://www.netflix.com/settings/playback/${guid}`,
  accountProfiles: "https://www.netflix.com/account/profiles",
  account: "https://www.netflix.com/account",
  login: "https://www.netflix.com/login",
  switchProfile: (guid) => `https://www.netflix.com/SwitchProfile?tkn=${guid}`,
  viewingActivity: "https://www.netflix.com/viewingactivity"
};
const NETFLIX_SELECTORS = {
  /** Profile cards on the /profiles/manage page */
  profileCards: "[data-profile-guid], .profile-icon, .profile-button",
  profileName: '.profile-name, [class*="profileName"]',
  kidsIndicator: '.kids-marker, [data-uia="kids-profile-marker"], .kidsCharacter',
  /** MFA / password confirmation page */
  mfaPasswordButton: '[data-uia="account-mfa-button-PASSWORD+PressableListItem"]',
  mfaPasswordInput: '[data-uia="collect-password-input-modal-entry"], input[name="challengePassword"]',
  mfaSubmitButton: '[data-uia="collect-input-submit-cta"]',
  /** Profile lock button on /settings/<guid> page */
  profileLockButton: '[data-uia="menu-card+profile-lock"]',
  /** Password input (login + MFA reauth) */
  passwordInput: 'input[type="password"], input[name="password"], input[name="challengePassword"]',
  /** Login detection */
  loginForm: '[data-uia="login-page-container"], .login-form, form[data-uia="login-form"]',
  /** Viewing activity page */
  viewingActivityRow: ".retableRow, .viewing-activity-row, li.retableRow",
  viewingActivityDate: ".col.date, .date",
  viewingActivityTitle: ".col.title a, .title a"
};
const NETFLIX_MATURITY_LEVELS = [
  { value: "little-kids", label: "Little Kids", maxAge: 6 },
  { value: "older-kids", label: "Older Kids", maxAge: 11 },
  { value: "teens", label: "Teens", maxAge: 16 },
  { value: "all", label: "All Maturity Ratings", maxAge: 99 }
];
const TAG = "[AgentDebug]";
const clients = /* @__PURE__ */ new Set();
let wss = null;
const COLORS = {
  reset: "\x1B[0m",
  dim: "\x1B[2m",
  cyan: "\x1B[36m",
  green: "\x1B[32m",
  yellow: "\x1B[33m",
  red: "\x1B[31m",
  bold: "\x1B[1m"
};
function levelColor(level) {
  switch (level) {
    case "info":
      return COLORS.cyan;
    case "warn":
      return COLORS.yellow;
    case "error":
      return COLORS.red;
    case "debug":
      return COLORS.dim;
    case "event":
      return COLORS.green;
    default:
      return COLORS.reset;
  }
}
function formatForTerminal(entry) {
  const time = entry.ts.slice(11, 23);
  const lvl = entry.level.toUpperCase().padEnd(5);
  const color = levelColor(entry.level);
  let line = `${COLORS.dim}${time}${COLORS.reset} ${color}${lvl}${COLORS.reset} ${COLORS.bold}[${entry.source}]${COLORS.reset} ${entry.message}`;
  if (entry.data && Object.keys(entry.data).length > 0) {
    line += ` ${COLORS.dim}${JSON.stringify(entry.data)}${COLORS.reset}`;
  }
  return line;
}
function agentLog(level, source, event, message, data) {
  const entry = {
    ts: (/* @__PURE__ */ new Date()).toISOString(),
    level,
    source,
    event,
    message,
    data
  };
  console.log(formatForTerminal(entry));
  if (clients.size > 0) {
    const json = JSON.stringify(entry);
    for (const ws$1 of clients) {
      if (ws$1.readyState === ws.WebSocket.OPEN) {
        ws$1.send(json);
      }
    }
  }
}
const agentDebug = (source, event, msg, data) => agentLog("debug", source, event, msg, data);
const agentInfo = (source, event, msg, data) => agentLog("info", source, event, msg, data);
const agentWarn = (source, event, msg, data) => agentLog("warn", source, event, msg, data);
const agentError = (source, event, msg, data) => agentLog("error", source, event, msg, data);
const agentEvent = (source, event, msg, data) => agentLog("event", source, event, msg, data);
function startAgentDebugServer(port = 9333) {
  if (wss) return;
  try {
    wss = new ws.WebSocketServer({ port, host: "127.0.0.1" });
    wss.on("connection", (ws2) => {
      clients.add(ws2);
      agentInfo("debug-server", "client-connected", `CLI client connected (${clients.size} total)`);
      ws2.send(JSON.stringify({
        ts: (/* @__PURE__ */ new Date()).toISOString(),
        level: "info",
        source: "debug-server",
        event: "welcome",
        message: "Connected to Phosra Browser agent debug stream",
        data: { port, pid: process.pid }
      }));
      ws2.on("close", () => {
        clients.delete(ws2);
      });
      ws2.on("error", () => {
        clients.delete(ws2);
      });
    });
    wss.on("error", (err) => {
      console.error(`${TAG} Failed to start debug server:`, err.message);
      wss = null;
    });
    console.log(`${TAG} Debug WebSocket server listening on ws://127.0.0.1:${port}`);
  } catch (err) {
    console.error(`${TAG} Failed to start debug server:`, err);
  }
}
const LOG_SRC = "netflix-agent";
class NetflixAgent {
  constructor(opts) {
    __publicField(this, "step", "idle");
    __publicField(this, "profiles", []);
    __publicField(this, "mappings", []);
    __publicField(this, "changes", []);
    __publicField(this, "applyProgress", []);
    __publicField(this, "error");
    __publicField(this, "discoveryPhase");
    __publicField(this, "discoveryProfilesRead", 0);
    __publicField(this, "discoveryProfilesTotal", 0);
    __publicField(this, "chromeView");
    __publicField(this, "getActiveTab");
    __publicField(this, "credentialManager");
    this.chromeView = opts.chromeView;
    this.getActiveTab = opts.getActiveTab;
    this.credentialManager = opts.credentialManager;
  }
  // -------------------------------------------------------------------
  // Public API (called from IPC handlers)
  // -------------------------------------------------------------------
  /** Restore agent from a previously saved state (skips discovery). */
  restore(saved) {
    agentEvent(LOG_SRC, "restore", `Restoring agent at step: ${saved.step}`);
    this.step = saved.step;
    this.profiles = saved.profiles;
    this.mappings = saved.mappings;
    this.changes = saved.changes;
    this.applyProgress = saved.applyProgress;
    this.error = saved.error;
    this.discoveryPhase = saved.discoveryPhase;
    this.discoveryProfilesRead = saved.discoveryProfilesRead ?? 0;
    this.discoveryProfilesTotal = saved.discoveryProfilesTotal ?? 0;
    this.pushStatus();
    return this.getStatus();
  }
  async start() {
    agentEvent(LOG_SRC, "start", "Starting Netflix configuration agent");
    this.step = "discovering";
    this.profiles = [];
    this.mappings = [];
    this.changes = [];
    this.applyProgress = [];
    this.error = void 0;
    this.discoveryPhase = "navigating";
    this.discoveryProfilesRead = 0;
    this.discoveryProfilesTotal = 0;
    this.pushStatus();
    try {
      const tab = this.getActiveTab();
      if (!tab) throw new Error("No active tab");
      this.discoveryPhase = "navigating";
      this.pushStatus();
      agentInfo(LOG_SRC, "phase", `Navigating to ${NETFLIX_URLS.profileManage}`);
      await tab.view.webContents.loadURL(NETFLIX_URLS.profileManage);
      await this.waitForNavigation(tab.view);
      agentDebug(LOG_SRC, "nav-done", `Navigation complete, URL: ${tab.view.webContents.getURL()}`);
      this.discoveryPhase = "checking-login";
      this.pushStatus();
      agentInfo(LOG_SRC, "phase", "Checking login status");
      const isLogin = await this.isLoginPage(tab.view);
      agentDebug(LOG_SRC, "login-check", `Login page detected: ${isLogin}`);
      if (isLogin) {
        this.discoveryPhase = "logging-in";
        this.pushStatus();
        agentInfo(LOG_SRC, "phase", "Auto-filling Netflix credentials");
        await this.handleLogin(tab.view);
        agentInfo(LOG_SRC, "login-done", "Login submitted, reloading profile page");
        await tab.view.webContents.loadURL(NETFLIX_URLS.profileManage);
        await this.waitForNavigation(tab.view);
      }
      this.discoveryPhase = "loading-profiles";
      this.pushStatus();
      agentInfo(LOG_SRC, "phase", "Waiting for profile page to render");
      await this.delay(1e3);
      this.profiles = await this.discoverProfiles(tab.view);
      agentEvent(LOG_SRC, "profiles-discovered", `Discovered ${this.profiles.length} profiles`, {
        profiles: this.profiles.map((p) => ({ name: p.name, isKids: p.isKids, maturity: p.maturityLevel }))
      });
      this.discoveryPhase = "done";
      this.step = "awaiting-mapping";
      this.pushStatus();
      agentEvent(LOG_SRC, "step-change", "Discovery complete, awaiting profile mapping");
      return this.getStatus();
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      agentError(LOG_SRC, "start-error", `Agent failed: ${errMsg}`);
      this.step = "error";
      this.error = errMsg;
      this.discoveryPhase = void 0;
      this.pushStatus();
      return this.getStatus();
    }
  }
  /** Pre-load mappings from saved state without advancing the step. */
  confirmMappingsPreload(mappings) {
    this.mappings = mappings;
    this.pushStatus();
  }
  confirmMappings(mappings) {
    agentEvent(LOG_SRC, "step-change", `Mappings confirmed (${mappings.length} profiles mapped)`, {
      mappings: mappings.map((m) => ({ profile: m.netflixProfile.name, member: m.familyMemberName, type: m.familyMemberType }))
    });
    this.mappings = mappings;
    this.step = "awaiting-maturity";
    this.pushStatus();
    return this.getStatus();
  }
  confirmMaturity(mappings) {
    agentEvent(LOG_SRC, "step-change", "Maturity settings confirmed");
    this.mappings = mappings;
    this.step = "awaiting-pins";
    this.pushStatus();
    return this.getStatus();
  }
  confirmPins(profileGuids, pin) {
    for (const guid of profileGuids) {
      const profile = this.profiles.find((p) => p.guid === guid);
      if (profile) {
        this.changes.push({
          id: `pin-${guid}`,
          type: "pin",
          profileGuid: guid,
          profileName: profile.name,
          description: `Set 4-digit PIN on "${profile.name}"`,
          enabled: true,
          pin
        });
      }
    }
    this.step = "awaiting-locks";
    this.pushStatus();
    return this.getStatus();
  }
  confirmLocks(profileGuids) {
    for (const guid of profileGuids) {
      const profile = this.profiles.find((p) => p.guid === guid);
      if (profile) {
        this.changes.push({
          id: `lock-${guid}`,
          type: "lock",
          profileGuid: guid,
          profileName: profile.name,
          description: `Lock profile "${profile.name}"`,
          enabled: true
        });
      }
    }
    this.step = "awaiting-autoplay";
    this.pushStatus();
    return this.getStatus();
  }
  confirmAutoplay(settings) {
    for (const setting of settings) {
      if (!setting.disable) continue;
      const profile = this.profiles.find((p) => p.guid === setting.profileGuid);
      if (profile) {
        this.changes.push({
          id: `autoplay-${setting.profileGuid}`,
          type: "autoplay",
          profileGuid: setting.profileGuid,
          profileName: profile.name,
          description: `Disable autoplay on "${profile.name}"`,
          enabled: true
        });
      }
    }
    for (const mapping of this.mappings) {
      if (mapping.familyMemberType === "child" && mapping.recommendedMaturity && mapping.recommendedMaturity !== mapping.netflixProfile.maturityLevel) {
        this.changes.push({
          id: `maturity-${mapping.netflixProfile.guid}`,
          type: "maturity",
          profileGuid: mapping.netflixProfile.guid,
          profileName: mapping.netflixProfile.name,
          description: `Set maturity to "${this.maturityLabel(mapping.recommendedMaturity)}" on "${mapping.netflixProfile.name}"`,
          enabled: true,
          fromLevel: mapping.netflixProfile.maturityLevel,
          toLevel: mapping.recommendedMaturity
        });
      }
    }
    this.step = "reviewing";
    this.pushStatus();
    return this.getStatus();
  }
  updateChanges(changes) {
    this.changes = changes;
    this.pushStatus();
    return this.getStatus();
  }
  async applyChanges() {
    const enabledChanges = this.changes.filter((c) => c.enabled);
    agentEvent(LOG_SRC, "apply-start", `Applying ${enabledChanges.length} changes`, {
      changes: enabledChanges.map((c) => ({ id: c.id, type: c.type, profile: c.profileName }))
    });
    this.step = "applying";
    this.applyProgress = enabledChanges.map((c) => ({
      changeId: c.id,
      status: "pending"
    }));
    this.pushStatus();
    for (const change of enabledChanges) {
      const progress = this.applyProgress.find((p) => p.changeId === change.id);
      if (!progress) continue;
      progress.status = "applying";
      this.pushStatus();
      agentInfo(LOG_SRC, "apply-change", `Applying: ${change.description}`, { changeId: change.id, type: change.type });
      try {
        await this.applyChange(change);
        progress.status = "success";
        agentEvent(LOG_SRC, "apply-success", `Success: ${change.description}`);
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err);
        progress.status = "failed";
        progress.error = errMsg;
        agentError(LOG_SRC, "apply-failed", `Failed: ${change.description} — ${errMsg}`);
      }
      this.pushStatus();
    }
    const anyFailed = this.applyProgress.some((p) => p.status === "failed");
    this.step = anyFailed ? "error" : "complete";
    if (anyFailed) {
      this.error = "Some changes failed to apply. See details above.";
      agentWarn(LOG_SRC, "apply-partial", "Some changes failed to apply");
    } else {
      agentEvent(LOG_SRC, "apply-complete", "All changes applied successfully");
    }
    this.pushStatus();
    return this.getStatus();
  }
  cancel() {
    this.step = "idle";
    this.profiles = [];
    this.mappings = [];
    this.changes = [];
    this.applyProgress = [];
    this.error = void 0;
    this.pushStatus();
  }
  getStatus() {
    return {
      step: this.step,
      profiles: this.profiles,
      mappings: this.mappings,
      changes: this.changes,
      applyProgress: this.applyProgress,
      error: this.error,
      discoveryPhase: this.discoveryPhase,
      discoveryProfilesRead: this.discoveryProfilesRead,
      discoveryProfilesTotal: this.discoveryProfilesTotal
    };
  }
  // -------------------------------------------------------------------
  // Profile discovery
  // -------------------------------------------------------------------
  async discoverProfiles(view) {
    this.discoveryPhase = "extracting-cache";
    this.pushStatus();
    agentInfo(LOG_SRC, "phase", "Attempting Falcor cache extraction");
    try {
      const falcorProfiles = await this.extractFromFalcorCache(view);
      if (falcorProfiles.length > 0) {
        agentEvent(LOG_SRC, "falcor-success", `Falcor cache: found ${falcorProfiles.length} profiles`);
        this.discoveryProfilesTotal = falcorProfiles.length;
        this.discoveryProfilesRead = falcorProfiles.length;
        this.pushStatus();
        return falcorProfiles;
      }
      agentDebug(LOG_SRC, "falcor-empty", "Falcor cache returned 0 profiles, falling back to DOM");
    } catch (err) {
      agentWarn(LOG_SRC, "falcor-failed", `Falcor extraction failed: ${err instanceof Error ? err.message : err}`);
    }
    this.discoveryPhase = "scraping-dom";
    this.pushStatus();
    agentInfo(LOG_SRC, "phase", "Falling back to DOM scraping");
    const profiles = await this.scrapeProfilesFromDOM(view);
    agentEvent(LOG_SRC, "dom-scrape-done", `DOM scraping: found ${profiles.length} profiles`);
    this.discoveryProfilesTotal = profiles.length;
    this.discoveryProfilesRead = profiles.length;
    this.pushStatus();
    return profiles;
  }
  async extractFromFalcorCache(view) {
    const script = `
      (async function() {
        try {
          const cache = window.netflix?.falcorCache;
          if (!cache || !cache.profiles) return JSON.stringify([]);

          // Helper: convert an image URL to a data URI via canvas
          function toDataUri(url) {
            if (!url) return Promise.resolve('');
            return new Promise(resolve => {
              const img = new Image();
              img.crossOrigin = 'anonymous';
              img.onload = () => {
                try {
                  const c = document.createElement('canvas');
                  c.width = img.naturalWidth;
                  c.height = img.naturalHeight;
                  c.getContext('2d').drawImage(img, 0, 0);
                  resolve(c.toDataURL('image/png'));
                } catch (e) { resolve(url); }
              };
              img.onerror = () => resolve(url);
              setTimeout(() => resolve(url), 3000);
              img.src = url;
            });
          }

          const profiles = [];
          const profileKeys = Object.keys(cache.profiles);
          for (const key of profileKeys) {
            if (key === '$size' || key === 'length') continue;
            const p = cache.profiles[key];
            if (!p || !p.summary || !p.summary.value) continue;
            const s = p.summary.value;

            // Try multiple paths for avatar URL
            let avatarUrl = s.avatarUrl || '';
            if (!avatarUrl && p.avatar?.value?.url) {
              avatarUrl = p.avatar.value.url;
            }
            if (!avatarUrl && p.avatar?.value?.images?.byWidth) {
              const widths = Object.keys(p.avatar.value.images.byWidth);
              const best = widths.sort((a, b) => Number(b) - Number(a))[0];
              if (best) avatarUrl = p.avatar.value.images.byWidth[best]?.value || '';
            }
            if (!avatarUrl && s.avatarName) {
              // Netflix CDN pattern for known avatar names
              avatarUrl = 'https://occ-0-2794-3646.1.nflxso.net/dnm/api/v6/vN7bi_My87NPKvsBoib006Llxga/AAAABW-' + s.avatarName + '.png';
            }

            // Extract maturity — handle object, string, or numeric
            let maturityRaw = 'all';
            if (s.maturityLevel?.value !== undefined) {
              maturityRaw = String(s.maturityLevel.value);
            } else if (s.maturity?.value?.level !== undefined) {
              maturityRaw = String(s.maturity.value.level);
            } else if (typeof s.maturityLevel === 'string') {
              maturityRaw = s.maturityLevel;
            }

            // Detect kids profile from multiple Falcor fields
            const isKids = !!(
              s.isKids ||
              s.isKid ||
              s.kidsModeEnabled ||
              s.experience === 'kids' ||
              s.experience === 'jfk' ||
              s.type === 'kids' ||
              s.profileType === 'kids'
            );

            // Detect PIN from multiple Falcor fields
            const hasPIN = !!(
              s.hasPIN ||
              s.hasPin ||
              s.pinProtected ||
              s.isPinProtected ||
              s.profileLock?.hasPin ||
              s.profileLock?.value?.hasPin ||
              p.profileLock?.value?.hasPin ||
              p.pin?.value
            );

            // Detect lock from multiple fields
            const isLocked = !!(
              s.isLocked ||
              s.locked ||
              s.profileLock?.isLocked ||
              s.profileLock?.value?.isLocked ||
              p.profileLock?.value?.isLocked
            );

            profiles.push({
              guid: s.guid || key,
              name: s.profileName || 'Unknown',
              avatarUrl: avatarUrl,
              isKids: isKids,
              maturityLevel: maturityRaw,
              hasPIN: hasPIN,
              isLocked: isLocked,
              autoplayEnabled: s.autoplayEnabled !== false,
            });
          }

          // Also try to grab avatar URLs from DOM profile cards if Falcor missed them
          const domCards = document.querySelectorAll('[data-profile-guid], .profile-icon, .profile-button');
          for (const card of domCards) {
            const guid = card.getAttribute('data-profile-guid') || card.getAttribute('data-guid') || '';
            const img = card.querySelector('img');
            if (guid && img?.src) {
              const profile = profiles.find(p => p.guid === guid);
              if (profile && !profile.avatarUrl) {
                profile.avatarUrl = img.src;
              }
            }
          }

          // Convert avatar URLs to data URIs so they work outside Netflix context
          await Promise.all(profiles.map(async (p) => {
            if (p.avatarUrl && !p.avatarUrl.startsWith('data:')) {
              p.avatarUrl = await toDataUri(p.avatarUrl);
            }
          }));

          return JSON.stringify(profiles);
        } catch (e) {
          return JSON.stringify([]);
        }
      })()
    `;
    const result = await view.webContents.executeJavaScript(script);
    const profiles = JSON.parse(result);
    return profiles.map((p) => ({
      ...p,
      maturityLevel: this.normaliseMaturityLevel(p.maturityLevel)
    }));
  }
  async scrapeProfilesFromDOM(view) {
    const script = `
      (async function() {
        function toDataUri(url) {
          if (!url) return Promise.resolve('');
          return new Promise(resolve => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
              try {
                const c = document.createElement('canvas');
                c.width = img.naturalWidth;
                c.height = img.naturalHeight;
                c.getContext('2d').drawImage(img, 0, 0);
                resolve(c.toDataURL('image/png'));
              } catch (e) { resolve(url); }
            };
            img.onerror = () => resolve(url);
            setTimeout(() => resolve(url), 3000);
            img.src = url;
          });
        }

        const profiles = [];
        const cards = document.querySelectorAll('${NETFLIX_SELECTORS.profileCards}');
        cards.forEach(card => {
          const nameEl = card.querySelector('${NETFLIX_SELECTORS.profileName}') || card.closest('[class*="profile"]')?.querySelector('[class*="name"]');
          const isKids = !!card.querySelector('${NETFLIX_SELECTORS.kidsIndicator}');
          const guid = card.getAttribute('data-profile-guid') || card.getAttribute('data-guid') || '';
          const avatarImg = card.querySelector('img');

          profiles.push({
            guid: guid,
            name: nameEl?.textContent?.trim() || 'Unknown',
            avatarUrl: avatarImg?.src || '',
            isKids: isKids,
            maturityLevel: isKids ? 'older-kids' : 'all',
            hasPIN: false,
            isLocked: false,
            autoplayEnabled: true,
          });
        });

        // Convert avatar URLs to data URIs
        await Promise.all(profiles.map(async (p) => {
          if (p.avatarUrl && !p.avatarUrl.startsWith('data:')) {
            p.avatarUrl = await toDataUri(p.avatarUrl);
          }
        }));

        return JSON.stringify(profiles);
      })()
    `;
    const result = await view.webContents.executeJavaScript(script);
    return JSON.parse(result);
  }
  // -------------------------------------------------------------------
  // Apply changes
  // -------------------------------------------------------------------
  async applyChange(change) {
    const tab = this.getActiveTab();
    if (!tab) throw new Error("No active tab");
    switch (change.type) {
      case "maturity":
        await this.applyMaturityChange(tab.view, change);
        break;
      case "pin":
        await this.applyPinChange(tab.view, change);
        break;
      case "lock":
        await this.applyLockChange(tab.view, change);
        break;
      case "autoplay":
        await this.applyAutoplayChange(tab.view, change);
        break;
    }
  }
  async applyMaturityChange(view, change) {
    agentInfo(LOG_SRC, "maturity", `Navigating to restrictions page for ${change.profileName}`);
    await view.webContents.loadURL(NETFLIX_URLS.restrictions(change.profileGuid));
    await this.waitForNavigation(view);
    await this.delay(2e3);
    await this.handleMfaGate(view);
    await this.delay(2e3);
    agentInfo(LOG_SRC, "maturity", `Setting maturity to ${change.toLevel}`);
    const maturitySet = await view.webContents.executeJavaScript(`
      (function() {
        var targetMap = {
          'little-kids': '50',
          'older-kids': '70',
          'teens': '90',
          'all': '1000000'
        };
        var target = ${JSON.stringify(change.toLevel)};
        var targetValue = targetMap[target];
        if (!targetValue) return null;

        // Find the radio button by data-uia or value
        var radio = document.querySelector('[data-uia="maturity-' + targetValue + '-radio"]');
        if (!radio) {
          radio = document.querySelector('input[name="maturity-rating"][value="' + targetValue + '"]');
        }
        if (radio) {
          radio.click();
          return 'radio:' + targetValue;
        }

        // Fallback: try all maturity radios and match by value
        var radios = document.querySelectorAll('input[name="maturity-rating"]');
        for (var i = 0; i < radios.length; i++) {
          if (radios[i].value === targetValue) {
            radios[i].click();
            return 'fallback-radio:' + targetValue;
          }
        }

        return null;
      })()
    `);
    if (!maturitySet) {
      agentWarn(LOG_SRC, "maturity", "Could not find maturity control on page");
      throw new Error("Could not find maturity rating control on Netflix restrictions page");
    }
    agentInfo(LOG_SRC, "maturity", `Maturity set via: ${maturitySet}`);
    await this.delay(1e3);
    await this.clickSaveButton(view);
    await this.delay(2e3);
  }
  async applyPinChange(view, change) {
    if (!change.pin) return;
    agentInfo(LOG_SRC, "pin", `Navigating to profile settings for ${change.profileName}`);
    await view.webContents.loadURL(NETFLIX_URLS.profileSettings(change.profileGuid));
    await this.waitForNavigation(view);
    await this.delay(2e3);
    agentInfo(LOG_SRC, "pin", "Clicking Profile Lock button");
    await this.clickButton(view, NETFLIX_SELECTORS.profileLockButton);
    await this.delay(2e3);
    await this.handleMfaGate(view);
    await this.delay(2e3);
    agentInfo(LOG_SRC, "pin", "Filling PIN");
    const pinFilled = await view.webContents.executeJavaScript(`
      (function() {
        // Look for PIN input fields (often 4 separate inputs or one input)
        var pinInputs = document.querySelectorAll('input[type="tel"], input[type="number"], input[inputmode="numeric"], input[maxlength="4"], input[maxlength="1"]');
        if (pinInputs.length === 0) {
          pinInputs = document.querySelectorAll('input[type="text"]');
        }

        var pin = ${JSON.stringify(change.pin)};
        var setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;

        if (pinInputs.length === 4) {
          // 4 separate digit inputs
          for (var i = 0; i < 4; i++) {
            setter.call(pinInputs[i], pin[i]);
            pinInputs[i].dispatchEvent(new Event('input', { bubbles: true }));
            pinInputs[i].dispatchEvent(new Event('change', { bubbles: true }));
          }
          return 'filled-4-inputs';
        } else if (pinInputs.length >= 1) {
          // Single PIN input
          setter.call(pinInputs[0], pin);
          pinInputs[0].dispatchEvent(new Event('input', { bubbles: true }));
          pinInputs[0].dispatchEvent(new Event('change', { bubbles: true }));
          return 'filled-single-input';
        }
        return null;
      })()
    `);
    if (!pinFilled) {
      throw new Error("Could not find PIN input fields on Netflix Profile Lock page");
    }
    agentInfo(LOG_SRC, "pin", `PIN filled: ${pinFilled}`);
    await this.delay(500);
    await this.clickSaveButton(view);
    await this.delay(2e3);
  }
  async applyLockChange(view, change) {
    agentInfo(LOG_SRC, "lock", `Navigating to profile settings for ${change.profileName}`);
    await view.webContents.loadURL(NETFLIX_URLS.profileSettings(change.profileGuid));
    await this.waitForNavigation(view);
    await this.delay(2e3);
    agentInfo(LOG_SRC, "lock", "Clicking Profile Lock button");
    await this.clickButton(view, NETFLIX_SELECTORS.profileLockButton);
    await this.delay(2e3);
    await this.handleMfaGate(view);
    await this.delay(2e3);
    const locked = await view.webContents.executeJavaScript(`
      (function() {
        // Look for toggle/checkbox for profile lock
        var toggles = document.querySelectorAll('input[type="checkbox"], [role="switch"]');
        for (var i = 0; i < toggles.length; i++) {
          var label = toggles[i].closest('label') || document.querySelector('label[for="' + toggles[i].id + '"]');
          var parent = toggles[i].closest('[class*="lock"], [class*="Lock"], [data-uia*="lock"]');
          if (label || parent) {
            if (!toggles[i].checked) toggles[i].click();
            return true;
          }
        }

        // Try clicking a button that enables the lock
        var btns = document.querySelectorAll('button');
        for (var j = 0; j < btns.length; j++) {
          var text = (btns[j].textContent || '').toLowerCase();
          if (text.includes('enable') || text.includes('lock') || text.includes('turn on')) {
            btns[j].click();
            return true;
          }
        }
        return false;
      })()
    `);
    if (!locked) {
      throw new Error("Could not find profile lock toggle on Netflix settings page");
    }
    await this.delay(500);
    await this.clickSaveButton(view);
    await this.delay(2e3);
  }
  async applyAutoplayChange(view, change) {
    agentInfo(LOG_SRC, "autoplay", `Navigating to playback settings for ${change.profileName}`);
    await view.webContents.loadURL(NETFLIX_URLS.playback(change.profileGuid));
    await this.waitForNavigation(view);
    await this.delay(2e3);
    const disabled = await view.webContents.executeJavaScript(`
      (function() {
        var results = [];

        // Find all checkboxes/toggles on the page
        var toggles = document.querySelectorAll('input[type="checkbox"], [role="switch"]');
        var pageText = document.body.innerText.toLowerCase();

        for (var i = 0; i < toggles.length; i++) {
          var label = toggles[i].closest('label') || document.querySelector('label[for="' + toggles[i].id + '"]');
          var parent = toggles[i].parentElement;
          var context = '';
          if (label) context = label.textContent.toLowerCase();
          else if (parent) context = parent.textContent.toLowerCase();

          // Check if this toggle is related to autoplay
          var isAutoplay = context.includes('autoplay') ||
            toggles[i].getAttribute('data-uia')?.includes('autoplay') ||
            toggles[i].name?.includes('autoplay');

          if (isAutoplay && toggles[i].checked) {
            toggles[i].click();
            results.push('toggled: ' + context.substring(0, 40));
          }
        }

        // Also check for "Autoplay next episode" and "Autoplay previews" text
        // Netflix renders these as toggle rows
        var rows = document.querySelectorAll('[class*="toggle"], [class*="Toggle"], [class*="switch"], [class*="Switch"]');
        for (var j = 0; j < rows.length; j++) {
          var rowText = (rows[j].textContent || '').toLowerCase();
          if (rowText.includes('autoplay')) {
            var toggle = rows[j].querySelector('input[type="checkbox"], [role="switch"]');
            if (toggle && toggle.checked) {
              toggle.click();
              results.push('row-toggled: ' + rowText.substring(0, 40));
            }
          }
        }

        return results.length > 0 ? JSON.stringify(results) : null;
      })()
    `);
    if (!disabled) {
      agentWarn(LOG_SRC, "autoplay", "No autoplay toggles found or already disabled");
    } else {
      agentInfo(LOG_SRC, "autoplay", `Autoplay disabled: ${disabled}`);
    }
    await this.delay(1e3);
    await this.clickSaveButton(view);
    await this.delay(2e3);
  }
  // -------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------
  async isLoginPage(view) {
    const url = view.webContents.getURL().toLowerCase();
    if (url.includes("netflix.com/login")) return true;
    const hasLoginForm = await view.webContents.executeJavaScript(`
      !!document.querySelector('${NETFLIX_SELECTORS.loginForm}')
    `);
    return !!hasLoginForm;
  }
  async handleLogin(view) {
    if (!this.credentialManager) {
      throw new Error("Not logged in to Netflix. Please sign in first.");
    }
    const data = this.credentialManager.getAutoFillData("https://www.netflix.com/login");
    if (!data) {
      throw new Error("No Netflix credentials stored. Please sign in to Netflix first.");
    }
    const { username, password, service } = data;
    const fillScript = `
      (function() {
        function fill(selector, value) {
          const el = document.querySelector(selector);
          if (!el) return false;
          const nativeSetter = Object.getOwnPropertyDescriptor(
            window.HTMLInputElement.prototype, 'value'
          )?.set;
          if (nativeSetter) {
            nativeSetter.call(el, value);
          } else {
            el.value = value;
          }
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
          return true;
        }
        fill(${JSON.stringify(service.selectors.username)}, ${JSON.stringify(username)});
        fill(${JSON.stringify(service.selectors.password)}, ${JSON.stringify(password)});
      })()
    `;
    await this.delay(1500);
    await view.webContents.executeJavaScript(fillScript);
    await this.delay(500);
    const submitSelector = service.selectors.submit ?? 'button[type="submit"]';
    await this.clickButton(view, submitSelector);
    await this.delay(5e3);
  }
  /**
   * Handle Netflix's MFA gate that appears before sensitive settings pages.
   * Detects the MFA page, clicks "Confirm password", fills the password, and submits.
   * No-ops if no MFA gate is detected.
   */
  async handleMfaGate(view) {
    const url = view.webContents.getURL();
    const isMfaPage = url.includes("/mfa");
    const hasMfaText = await view.webContents.executeJavaScript(`
      (function() {
        var text = (document.body.innerText || '').toLowerCase();
        return text.includes('make sure') || text.includes('confirm password') || text.includes('verify your identity');
      })()
    `);
    if (!isMfaPage && !hasMfaText) {
      agentDebug(LOG_SRC, "mfa", "No MFA gate detected, continuing");
      return;
    }
    agentInfo(LOG_SRC, "mfa", "MFA gate detected, handling password confirmation");
    const clickedPasswordOption = await view.webContents.executeJavaScript(`
      (function() {
        // Try the specific data-uia selector first
        var btn = document.querySelector('${NETFLIX_SELECTORS.mfaPasswordButton}');
        if (btn) { btn.click(); return 'data-uia'; }

        // Fallback: find button with "password" or "Confirm password" text
        var btns = document.querySelectorAll('button');
        for (var i = 0; i < btns.length; i++) {
          var text = (btns[i].textContent || '').toLowerCase();
          if (text.includes('confirm password') || text.includes('password')) {
            btns[i].click();
            return 'text:' + text.substring(0, 30);
          }
        }
        return null;
      })()
    `);
    if (clickedPasswordOption) {
      agentDebug(LOG_SRC, "mfa", `Clicked password option: ${clickedPasswordOption}`);
      await this.delay(2e3);
    }
    if (!this.credentialManager) {
      throw new Error("MFA gate requires Netflix password but no credential manager available");
    }
    const data = this.credentialManager.getAutoFillData("https://www.netflix.com/login");
    if (!data) {
      throw new Error("MFA gate requires Netflix password but no credentials stored");
    }
    const passwordFilled = await view.webContents.executeJavaScript(`
      (function() {
        var el = document.querySelector(${JSON.stringify(NETFLIX_SELECTORS.mfaPasswordInput)});
        if (!el) {
          // Broader fallback
          el = document.querySelector(${JSON.stringify(NETFLIX_SELECTORS.passwordInput)});
        }
        if (!el) return false;

        var setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
        setter.call(el, ${JSON.stringify(data.password)});
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
      })()
    `);
    if (!passwordFilled) {
      throw new Error("Could not find password input on MFA page");
    }
    agentInfo(LOG_SRC, "mfa", "Password filled");
    await this.delay(500);
    const submitted = await view.webContents.executeJavaScript(`
      (function() {
        // Try specific MFA submit button
        var btn = document.querySelector(${JSON.stringify(NETFLIX_SELECTORS.mfaSubmitButton)});
        if (btn) { btn.click(); return 'data-uia'; }

        // Fallback to any submit button
        btn = document.querySelector('button[type="submit"]');
        if (btn) { btn.click(); return 'submit-btn'; }

        // Fallback to button with submit-like text
        var btns = document.querySelectorAll('button');
        for (var i = 0; i < btns.length; i++) {
          var text = (btns[i].textContent || '').toLowerCase();
          if (text.includes('continue') || text.includes('submit') || text.includes('confirm') || text.includes('verify')) {
            btns[i].click();
            return 'text:' + text.substring(0, 30);
          }
        }
        return null;
      })()
    `);
    if (!submitted) {
      throw new Error("Could not find submit button on MFA page");
    }
    agentInfo(LOG_SRC, "mfa", `MFA submitted via: ${submitted}`);
    await this.delay(4e3);
    await this.waitForNavigation(view);
  }
  /**
   * Find and click a save/submit button on the current Netflix settings page.
   * Silently no-ops if no save button is found (some pages auto-save).
   */
  async clickSaveButton(view) {
    const clicked = await view.webContents.executeJavaScript(`
      (function() {
        // Try submit button first
        var btn = document.querySelector('button[type="submit"]');
        if (btn) { btn.click(); return 'submit'; }

        // Try data-uia save button
        btn = document.querySelector('[data-uia*="save"], [data-uia*="submit"]');
        if (btn) { btn.click(); return 'data-uia'; }

        // Try button text
        var btns = document.querySelectorAll('button');
        for (var i = 0; i < btns.length; i++) {
          var text = (btns[i].textContent || '').toLowerCase().trim();
          if (text === 'save' || text === 'save changes' || text === 'submit' || text === 'done' || text === 'apply') {
            btns[i].click();
            return 'text:' + text;
          }
        }
        return null;
      })()
    `);
    if (clicked) {
      agentInfo(LOG_SRC, "save", `Clicked save button: ${clicked}`);
    } else {
      agentDebug(LOG_SRC, "save", "No save button found (page may auto-save)");
    }
  }
  async clickButton(view, selector) {
    await view.webContents.executeJavaScript(`
      (function() {
        const btn = document.querySelector(${JSON.stringify(selector)});
        if (btn) { btn.click(); return true; }
        return false;
      })()
    `);
  }
  async waitForNavigation(view) {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => resolve(), 1e4);
      const handler = () => {
        clearTimeout(timeout);
        resolve();
      };
      view.webContents.once("did-stop-loading", handler);
    });
  }
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  normaliseMaturityLevel(raw) {
    const lower = (raw || "").toLowerCase().replace(/[\s_]/g, "-");
    const num = Number(raw);
    if (!isNaN(num) && num > 0) {
      if (num <= 50) return "little-kids";
      if (num <= 70) return "older-kids";
      if (num <= 90) return "teens";
      return "all";
    }
    if (lower.includes("little")) return "little-kids";
    if (lower.includes("older")) return "older-kids";
    if (lower.includes("teen")) return "teens";
    return "all";
  }
  maturityLabel(level) {
    const found = NETFLIX_MATURITY_LEVELS.find((m) => m.value === level);
    return (found == null ? void 0 : found.label) ?? level;
  }
  pushStatus() {
    if (!this.chromeView || this.chromeView.webContents.isDestroyed()) return;
    try {
      this.chromeView.webContents.send("config-agent:status-update", this.getStatus());
    } catch {
    }
  }
}
const FILENAME$1 = "config-agent-state.json";
const MAPPINGS_FILENAME = "netflix-profile-mappings.json";
const RESUMABLE_STEPS = [
  "awaiting-mapping",
  "awaiting-maturity",
  "awaiting-pins",
  "awaiting-locks",
  "awaiting-autoplay",
  "reviewing"
];
class ConfigStore {
  constructor(profilePath) {
    __publicField(this, "filePath");
    this.filePath = path__namespace.join(profilePath, FILENAME$1);
  }
  /** Save agent status to disk (strips PINs for security). */
  save(status) {
    if (!RESUMABLE_STEPS.includes(status.step)) return;
    const sanitised = {
      ...status,
      changes: status.changes.map((c) => {
        if (c.pin) return { ...c, pin: void 0 };
        return c;
      })
    };
    const stored = {
      status: sanitised,
      savedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    try {
      fs__namespace.writeFileSync(this.filePath, JSON.stringify(stored, null, 2), {
        encoding: "utf-8",
        mode: 384
      });
    } catch {
    }
  }
  /** Load previously saved state, or null if none exists / is stale. */
  load() {
    const result = this.loadWithTimestamp();
    return (result == null ? void 0 : result.state) ?? null;
  }
  /** Load previously saved state with its timestamp for comparison. */
  loadWithTimestamp() {
    try {
      if (!fs__namespace.existsSync(this.filePath)) return null;
      const raw = fs__namespace.readFileSync(this.filePath, "utf-8");
      const stored = JSON.parse(raw);
      if (!RESUMABLE_STEPS.includes(stored.status.step)) {
        this.clear();
        return null;
      }
      const savedAt = new Date(stored.savedAt).getTime();
      if (Date.now() - savedAt > 7 * 24 * 60 * 60 * 1e3) {
        this.clear();
        return null;
      }
      return { state: stored.status, savedAt: stored.savedAt };
    } catch {
      this.clear();
      return null;
    }
  }
  /** Delete persisted state. */
  clear() {
    try {
      if (fs__namespace.existsSync(this.filePath)) {
        fs__namespace.unlinkSync(this.filePath);
      }
    } catch {
    }
  }
  // -------------------------------------------------------------------------
  // Profile mappings — persisted separately so they survive wizard completion
  // -------------------------------------------------------------------------
  get mappingsPath() {
    return path__namespace.join(path__namespace.dirname(this.filePath), MAPPINGS_FILENAME);
  }
  /** Save profile mappings (persists across wizard completion). */
  saveMappings(mappings) {
    const assignedMappings = mappings.filter(
      (m) => m.familyMemberType !== "unassigned" && m.familyMemberId
    );
    if (assignedMappings.length === 0) return;
    try {
      fs__namespace.writeFileSync(
        this.mappingsPath,
        JSON.stringify({ mappings: assignedMappings, savedAt: (/* @__PURE__ */ new Date()).toISOString() }, null, 2),
        { encoding: "utf-8", mode: 384 }
      );
    } catch {
    }
  }
  /** Load saved profile mappings, or null if none exist. */
  loadMappings() {
    try {
      if (!fs__namespace.existsSync(this.mappingsPath)) return null;
      const raw = fs__namespace.readFileSync(this.mappingsPath, "utf-8");
      const data = JSON.parse(raw);
      return data.mappings ?? null;
    } catch {
      return null;
    }
  }
  /** Save which profile GUIDs have PINs enabled. */
  savePinStatus(guids) {
    try {
      const existing = this.loadMappingsRaw();
      existing.pinnedGuids = guids;
      fs__namespace.writeFileSync(this.mappingsPath, JSON.stringify(existing, null, 2), {
        encoding: "utf-8",
        mode: 384
      });
    } catch {
    }
  }
  /** Load profile GUIDs that have PINs enabled. */
  loadPinStatus() {
    try {
      const data = this.loadMappingsRaw();
      return data.pinnedGuids ?? [];
    } catch {
      return [];
    }
  }
  loadMappingsRaw() {
    try {
      if (!fs__namespace.existsSync(this.mappingsPath)) return {};
      return JSON.parse(fs__namespace.readFileSync(this.mappingsPath, "utf-8"));
    } catch {
      return {};
    }
  }
  // -------------------------------------------------------------------------
  // Profile → Child mapping (maps Netflix profile GUIDs to DB child IDs)
  // Supports one profile → multiple children (shared profiles)
  // -------------------------------------------------------------------------
  get profileChildMapPath() {
    return path__namespace.join(path__namespace.dirname(this.filePath), "profile-child-map.json");
  }
  /** A single mapping entry: Netflix profile GUID → one or more DB child IDs + names. */
  saveProfileChildMap(map) {
    try {
      fs__namespace.writeFileSync(
        this.profileChildMapPath,
        JSON.stringify({ map, savedAt: (/* @__PURE__ */ new Date()).toISOString() }, null, 2),
        { encoding: "utf-8", mode: 384 }
      );
    } catch {
    }
  }
  loadProfileChildMap() {
    try {
      if (!fs__namespace.existsSync(this.profileChildMapPath)) return null;
      const raw = fs__namespace.readFileSync(this.profileChildMapPath, "utf-8");
      const data = JSON.parse(raw);
      return data.map ?? null;
    } catch {
      return null;
    }
  }
}
const ACTIVITY_FILENAME = "netflix-activity-cache.json";
class ActivityStore {
  constructor(profilePath) {
    __publicField(this, "filePath");
    this.filePath = path__namespace.join(profilePath, ACTIVITY_FILENAME);
  }
  save(activities) {
    const data = {
      version: 1,
      activities,
      savedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    try {
      fs__namespace.writeFileSync(this.filePath, JSON.stringify(data, null, 2), {
        encoding: "utf-8",
        mode: 384
      });
    } catch {
    }
  }
  load() {
    try {
      if (!fs__namespace.existsSync(this.filePath)) return null;
      const raw = fs__namespace.readFileSync(this.filePath, "utf-8");
      const data = JSON.parse(raw);
      if (data.version !== 1) return null;
      return data.activities;
    } catch {
      return null;
    }
  }
}
const MAX_PAGES = 50;
async function fetchNetflixActivity(view, mappings) {
  const results = [];
  const wc = view.webContents;
  for (const mapping of mappings) {
    try {
      const switchUrl = NETFLIX_URLS.switchProfile(mapping.profileGuid);
      await wc.loadURL(switchUrl);
      await waitForNavigation(wc, 5e3);
      await wc.loadURL(NETFLIX_URLS.viewingActivity);
      await waitForNavigation(wc, 8e3);
      let page = 0;
      let prevCount = -1;
      while (page < MAX_PAGES) {
        const currentCount = await wc.executeJavaScript(
          `document.querySelectorAll('${NETFLIX_SELECTORS.viewingActivityRow}').length`
        );
        if (currentCount === prevCount) break;
        prevCount = currentCount;
        const clicked = await wc.executeJavaScript(`
          (function() {
            var btn = document.querySelector('button[data-uia="viewing-activity-show-more"]');
            if (!btn) {
              var all = document.querySelectorAll('button');
              for (var i = 0; i < all.length; i++) {
                if ((all[i].textContent || '').trim().toLowerCase() === 'show more') {
                  btn = all[i]; break;
                }
              }
            }
            if (btn) { btn.click(); return true; }
            return false;
          })()
        `);
        if (!clicked) break;
        await sleep$1(2e3);
        page++;
      }
      const entries = await wc.executeJavaScript(`
        (function() {
          var rows = document.querySelectorAll('${NETFLIX_SELECTORS.viewingActivityRow}');
          var results = [];
          for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            var dateEl = row.querySelector('${NETFLIX_SELECTORS.viewingActivityDate}');
            var titleEl = row.querySelector('${NETFLIX_SELECTORS.viewingActivityTitle}');
            if (!dateEl || !titleEl) continue;
            var title = titleEl.textContent.trim();
            var date = dateEl.textContent.trim();
            var titleUrl = titleEl.getAttribute('href') || undefined;
            var seriesTitle = undefined;
            if (title.indexOf(':') !== -1) {
              seriesTitle = title.split(':')[0].trim();
            }
            results.push({ title: title, date: date, titleUrl: titleUrl, seriesTitle: seriesTitle });
          }
          return results;
        })()
      `);
      console.log(`[netflix-activity] ${mapping.childName}: ${entries.length} entries (${page} pages loaded)`);
      results.push({
        childName: mapping.childName,
        childId: mapping.childId,
        profileName: mapping.profileName,
        profileGuid: mapping.profileGuid,
        avatarUrl: mapping.avatarUrl,
        entries: entries || [],
        fetchedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (err) {
      console.error(`[netflix-activity] Failed to fetch activity for ${mapping.childName}:`, err);
      results.push({
        childName: mapping.childName,
        childId: mapping.childId,
        profileName: mapping.profileName,
        profileGuid: mapping.profileGuid,
        avatarUrl: mapping.avatarUrl,
        entries: [],
        fetchedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
  }
  return results;
}
function sleep$1(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
function waitForNavigation(wc, timeout) {
  return new Promise((resolve) => {
    let resolved = false;
    const timer = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        resolve();
      }
    }, timeout);
    const handler = () => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timer);
        setTimeout(resolve, 1e3);
      }
    };
    wc.once("did-finish-load", handler);
    wc.once("did-fail-load", () => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timer);
        resolve();
      }
    });
  });
}
const FILENAME = "csm-cache.json";
const STALE_MS = 30 * 24 * 60 * 60 * 1e3;
class CSMCache {
  constructor(profilePath) {
    __publicField(this, "filePath");
    this.filePath = path__namespace.join(profilePath, FILENAME);
  }
  /**
   * Get a cached review by slug.
   * Returns null if missing or stale (> 30 days old).
   */
  get(slug) {
    const data = this.load();
    const review = data.reviews[slug];
    if (!review) return null;
    if (this.isStale(review.scrapedAt)) return null;
    return review;
  }
  /** Upsert a review into the cache. */
  set(review) {
    const data = this.load();
    data.reviews[review.csmSlug] = review;
    this.save(data);
  }
  /** Get all cached reviews (including stale ones). */
  getAll() {
    const data = this.load();
    return Object.values(data.reviews);
  }
  /** Get cache statistics. */
  getStats() {
    const data = this.load();
    const all = Object.values(data.reviews);
    let stale = 0;
    for (const review of all) {
      if (this.isStale(review.scrapedAt)) stale++;
    }
    return {
      total: all.length,
      fresh: all.length - stale,
      stale
    };
  }
  // -----------------------------------------------------------------------
  // Internal
  // -----------------------------------------------------------------------
  isStale(scrapedAt) {
    const scraped = new Date(scrapedAt).getTime();
    return Date.now() - scraped > STALE_MS;
  }
  load() {
    try {
      if (!fs__namespace.existsSync(this.filePath)) {
        return { version: 1, reviews: {} };
      }
      const raw = fs__namespace.readFileSync(this.filePath, "utf-8");
      const data = JSON.parse(raw);
      if (data.version !== 1) {
        return { version: 1, reviews: {} };
      }
      return data;
    } catch {
      return { version: 1, reviews: {} };
    }
  }
  save(data) {
    try {
      fs__namespace.writeFileSync(this.filePath, JSON.stringify(data, null, 2), {
        encoding: "utf-8",
        mode: 384
      });
    } catch {
    }
  }
}
const REFILL_INTERVAL_MS = 4e3;
const MAX_TOKENS = 3;
class CSMRateLimiter {
  constructor() {
    __publicField(this, "tokens");
    __publicField(this, "lastRefill");
    __publicField(this, "waitQueue", []);
    __publicField(this, "refillTimerId", null);
    this.tokens = MAX_TOKENS;
    this.lastRefill = Date.now();
  }
  /** Wait until a token is available, then consume it. */
  acquire() {
    this.refill();
    if (this.tokens >= 1) {
      this.tokens -= 1;
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      this.waitQueue.push(resolve);
      this.scheduleRefill();
    });
  }
  // -----------------------------------------------------------------------
  // Internal
  // -----------------------------------------------------------------------
  refill() {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    const newTokens = Math.floor(elapsed / REFILL_INTERVAL_MS);
    if (newTokens > 0) {
      this.tokens = Math.min(MAX_TOKENS, this.tokens + newTokens);
      this.lastRefill += newTokens * REFILL_INTERVAL_MS;
    }
  }
  scheduleRefill() {
    if (this.refillTimerId !== null) return;
    this.refillTimerId = setTimeout(() => {
      this.refillTimerId = null;
      this.refill();
      while (this.tokens >= 1 && this.waitQueue.length > 0) {
        this.tokens -= 1;
        const next = this.waitQueue.shift();
        next();
      }
      if (this.waitQueue.length > 0) {
        this.scheduleRefill();
      }
    }, REFILL_INTERVAL_MS);
  }
  /** Cancel pending waiters and clear timers. */
  destroy() {
    if (this.refillTimerId !== null) {
      clearTimeout(this.refillTimerId);
      this.refillTimerId = null;
    }
    this.waitQueue = [];
  }
}
const ARTICLES = /^(the|a|an)\s+/i;
function normalizeTitle(raw) {
  return raw.toLowerCase().replace(ARTICLES, "").replace(/[^a-z0-9\s']/g, "").replace(/\s+/g, " ").trim();
}
function bigrams(s) {
  const set = /* @__PURE__ */ new Set();
  for (let i = 0; i < s.length - 1; i++) {
    set.add(s.substring(i, i + 2));
  }
  return set;
}
function diceCoefficient(a, b) {
  if (a === b) return 1;
  if (a.length < 2 || b.length < 2) return 0;
  const bigramsA = bigrams(a);
  const bigramsB = bigrams(b);
  let intersection = 0;
  for (const bg of bigramsA) {
    if (bigramsB.has(bg)) intersection++;
  }
  return 2 * intersection / (bigramsA.size + bigramsB.size);
}
function matchTitle(netflixTitle, csmResults) {
  if (csmResults.length === 0) return null;
  const normalised = normalizeTitle(netflixTitle);
  let bestMatch = null;
  let bestScore = 0;
  for (const result of csmResults) {
    const resultNorm = normalizeTitle(result.text);
    if (normalised === resultNorm) {
      return { href: result.href, confidence: 1 };
    }
    if (normalised.includes(resultNorm) || resultNorm.includes(normalised)) {
      const score = 0.9;
      if (score > bestScore) {
        bestScore = score;
        bestMatch = { href: result.href, confidence: score };
      }
      continue;
    }
    const dice = diceCoefficient(normalised, resultNorm);
    if (dice > bestScore) {
      bestScore = dice;
      bestMatch = { href: result.href, confidence: dice };
    }
  }
  if (bestMatch && bestMatch.confidence >= 0.6) {
    return bestMatch;
  }
  return null;
}
const SEARCH_RESULTS_JS = `(function(){
  var links = [];
  document.querySelectorAll('a[href]').forEach(function(a) {
    var href = a.getAttribute('href') || '';
    if (href.match(/^\\/(tv|movie|app|game|book|website|youtube|podcast)-reviews\\/[a-z0-9-]+/) &&
        !links.some(function(l) { return l.href === href; })) {
      var text = (a.textContent || '').trim();
      if (text && text !== 'See full review' && text.length > 1) {
        links.push({ href: href, text: text.substring(0, 80) });
      }
    }
  });
  return links.slice(0, 5);
})()`;
const REVIEW_PAGE_JS = `(function(){
  var r = { url: location.href };

  // --- LD+JSON structured data ---
  var ldScripts = document.querySelectorAll('script[type="application/ld+json"]');
  ldScripts.forEach(function(s) {
    try {
      var data = JSON.parse(s.textContent);
      var graph = data['@graph'] || [data];
      graph.forEach(function(item) {
        if (item['@type'] === 'Review') {
          r.csmTitle = item.name || '';
          r.ageRange = item.typicalAgeRange || '';
          r.isFamilyFriendly = item.isFamilyFriendly || '';
          r.qualityRating = item.reviewRating ? item.reviewRating.ratingValue : '';
          r.reviewSummary = item.description || '';
          r.reviewBody = item.reviewBody || '';
          r.mediaType = item.itemReviewed ? item.itemReviewed['@type'] : '';
          r.datePublished = item.datePublished || '';
        }
      });
    } catch(e) {}
  });

  // --- Age badge ---
  var ageBadge = document.querySelector('.rating__age');
  if (ageBadge) r.ageBadge = ageBadge.textContent.trim();

  // --- Parents Need to Know (full text) ---
  var headings = document.querySelectorAll('h2, h3, h4');
  for (var i = 0; i < headings.length; i++) {
    var hText = (headings[i].textContent || '').toLowerCase();
    if (hText.includes('parents need to know')) {
      var next = headings[i].nextElementSibling;
      if (next) r.parentSummary = next.textContent.trim();
      break;
    }
  }

  // --- "Why Age X+?" explanation ---
  for (var i = 0; i < headings.length; i++) {
    var hText = (headings[i].textContent || '').toLowerCase();
    if (hText.includes('why age') || hText.includes('what age')) {
      var next = headings[i].nextElementSibling;
      if (next) r.ageExplanation = next.textContent.trim();
      break;
    }
  }

  // --- Content descriptors with descriptions and numeric levels ---
  r.descriptors = [];
  // Try the content-grid based layout first (newer CSM pages)
  var gridItems = document.querySelectorAll('[class*="content-grid"] [class*="content-grid-item"], [class*="review-content"] [class*="descriptor"]');
  if (gridItems.length === 0) {
    // Fallback: rating-based selectors
    gridItems = document.querySelectorAll('[class*="rating__"] .rating__label, .csm-green-btn + ul li, [class*="ContentGrid"] > div');
  }

  // Primary approach: find labeled sections with dot indicators
  document.querySelectorAll('.rating__label').forEach(function(label) {
    var container = label.closest('[class*="rating"]') || label.parentElement;
    var score = container ? container.querySelector('.rating__score, .rating__teaser-short') : null;
    var levelText = score ? score.textContent.trim() : '';

    // Count filled dots/circles for numeric level (0-5)
    var numericLevel = 0;
    if (container) {
      var dots = container.querySelectorAll('[class*="dot"], [class*="circle"], [class*="fill"], svg circle');
      var filledDots = container.querySelectorAll('[class*="dot--filled"], [class*="dot--active"], [class*="circle--filled"], [class*="filled"]');
      if (filledDots.length > 0) {
        numericLevel = filledDots.length;
      } else if (dots.length > 0) {
        // Try aria or style-based detection
        dots.forEach(function(d) {
          var cl = d.getAttribute('class') || '';
          var style = d.getAttribute('style') || '';
          if (cl.indexOf('active') >= 0 || cl.indexOf('filled') >= 0 || style.indexOf('opacity: 1') >= 0 || style.indexOf('fill:') >= 0) {
            numericLevel++;
          }
        });
      }
      // Fallback: parse level text
      if (numericLevel === 0 && levelText) {
        var lv = levelText.toLowerCase();
        if (lv === 'not present' || lv === 'none') numericLevel = 0;
        else if (lv === 'a little' || lv === 'some') numericLevel = 1;
        else if (lv === 'a lot') numericLevel = 3;
        else if (lv === 'iffy') numericLevel = 2;
        else if (lv === 'pause') numericLevel = 2;
      }
    }

    // Get the description text (usually in a sibling or nested element)
    var description = '';
    if (container) {
      var descEl = container.querySelector('.rating__teaser, [class*="teaser"], [class*="description"], p');
      if (descEl && descEl !== score && descEl !== label) {
        description = descEl.textContent.trim();
      }
      // If no explicit description element, check for text after the label/score
      if (!description) {
        var allText = container.textContent.trim();
        var catText = label.textContent.trim();
        var scoreText = levelText;
        // Remove category and score from full text to get description
        var remainder = allText;
        if (catText) remainder = remainder.replace(catText, '').trim();
        if (scoreText) remainder = remainder.replace(scoreText, '').trim();
        if (remainder.length > 10) description = remainder;
      }
    }

    r.descriptors.push({
      category: label.textContent.trim(),
      level: levelText,
      numericLevel: numericLevel,
      description: description
    });
  });

  // --- Positive Content section ---
  r.positiveContent = [];
  for (var i = 0; i < headings.length; i++) {
    var hText = (headings[i].textContent || '').toLowerCase();
    if (hText.includes('positive') || hText.includes('any good')) {
      // Look for sub-sections after this heading
      var sibling = headings[i].nextElementSibling;
      while (sibling) {
        var tag = sibling.tagName.toLowerCase();
        if (tag === 'h2' || tag === 'h3') break; // next major section

        // Check for labeled items (e.g. "Educational Value", "Positive Messages")
        var subLabels = sibling.querySelectorAll('[class*="label"], [class*="rating__label"], strong, b, dt, h4, h5');
        if (subLabels.length > 0) {
          subLabels.forEach(function(sl) {
            var cat = sl.textContent.trim();
            var desc = '';
            // Get description from next sibling or parent text
            var descSibling = sl.nextElementSibling;
            if (descSibling) {
              desc = descSibling.textContent.trim();
            } else if (sl.parentElement) {
              var parentText = sl.parentElement.textContent.trim();
              desc = parentText.replace(cat, '').trim();
            }
            if (cat && (desc || cat.length > 5)) {
              r.positiveContent.push({ category: cat, description: desc });
            }
          });
        } else if (sibling.textContent.trim().length > 10) {
          // Plain text paragraph describing positive content
          r.positiveContent.push({ category: 'General', description: sibling.textContent.trim() });
        }
        sibling = sibling.nextElementSibling;
      }
      break;
    }
  }

  return r;
})()`;
const CSM_BASE = "https://www.commonsensemedia.org";
const JS_RENDER_DELAY_MS = 3e3;
const LOAD_TIMEOUT_MS = 15e3;
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
function waitForLoad(wc, timeout) {
  return new Promise((resolve) => {
    let resolved = false;
    const timer = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        resolve();
      }
    }, timeout);
    const handler = () => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timer);
        resolve();
      }
    };
    wc.once("did-finish-load", handler);
    wc.once("did-fail-load", () => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timer);
        resolve();
      }
    });
  });
}
function extractSlug(href) {
  const parts = href.split("/");
  return parts[parts.length - 1] || href;
}
function extractMediaType(href) {
  const match = href.match(/^\/(tv|movie|app|game|book|website|youtube|podcast)-reviews\//);
  return match ? match[1] : "";
}
function parseAgeMin(ageStr) {
  const match = ageStr.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}
class CSMScraper {
  constructor(parentWindow, stealthPreloadPath2, profilePath) {
    __publicField(this, "parentWindow");
    __publicField(this, "view");
    __publicField(this, "cache");
    __publicField(this, "limiter");
    __publicField(this, "destroyed", false);
    __publicField(this, "queue", []);
    __publicField(this, "processing", false);
    this.parentWindow = parentWindow;
    this.cache = new CSMCache(profilePath);
    this.limiter = new CSMRateLimiter();
    const ses = electron.session.fromPartition("csm-scraper", { cache: true });
    const CHROME_UA2 = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";
    ses.setUserAgent(CHROME_UA2);
    this.view = new electron.WebContentsView({
      webPreferences: {
        preload: stealthPreloadPath2,
        sandbox: false,
        contextIsolation: true,
        session: ses,
        nodeIntegration: false
      }
    });
    this.parentWindow.contentView.addChildView(this.view);
    this.view.setBounds({ x: 0, y: 0, width: 0, height: 0 });
    this.view.setVisible(false);
  }
  /**
   * Queue titles for lookup. Calls callback per result as they complete.
   */
  enqueue(titles, callback) {
    for (const title of titles) {
      this.queue.push({ title, callback });
    }
    this.processQueue();
  }
  /** Destroy the hidden view and clean up resources. */
  destroy() {
    if (this.destroyed) return;
    this.destroyed = true;
    this.limiter.destroy();
    this.queue = [];
    try {
      this.parentWindow.contentView.removeChildView(this.view);
    } catch {
    }
    try {
      this.view.webContents.close();
    } catch {
    }
  }
  // -----------------------------------------------------------------------
  // Queue processing
  // -----------------------------------------------------------------------
  async processQueue() {
    if (this.processing || this.destroyed) return;
    this.processing = true;
    while (this.queue.length > 0 && !this.destroyed) {
      const item = this.queue.shift();
      const result = await this.scrapeTitle(item.title);
      try {
        item.callback(result);
      } catch {
      }
    }
    this.processing = false;
  }
  // -----------------------------------------------------------------------
  // Single title scraping
  // -----------------------------------------------------------------------
  async scrapeTitle(title) {
    const wc = this.view.webContents;
    try {
      await this.limiter.acquire();
      if (this.destroyed || wc.isDestroyed()) {
        return { title, found: false, error: "Scraper destroyed" };
      }
      const searchUrl = `${CSM_BASE}/search/${encodeURIComponent(title)}`;
      const loadPromise = waitForLoad(wc, LOAD_TIMEOUT_MS);
      await wc.loadURL(searchUrl);
      await loadPromise;
      await sleep(JS_RENDER_DELAY_MS);
      if (this.destroyed || wc.isDestroyed()) {
        return { title, found: false, error: "Scraper destroyed" };
      }
      const searchResults = await wc.executeJavaScript(SEARCH_RESULTS_JS);
      if (!searchResults || searchResults.length === 0) {
        return { title, found: false };
      }
      const match = matchTitle(title, searchResults);
      if (!match) {
        return { title, found: false };
      }
      await this.limiter.acquire();
      if (this.destroyed || wc.isDestroyed()) {
        return { title, found: false, error: "Scraper destroyed" };
      }
      const reviewUrl = `${CSM_BASE}${match.href}`;
      const reviewLoadPromise = waitForLoad(wc, LOAD_TIMEOUT_MS);
      await wc.loadURL(reviewUrl);
      await reviewLoadPromise;
      await sleep(JS_RENDER_DELAY_MS);
      if (this.destroyed || wc.isDestroyed()) {
        return { title, found: false, error: "Scraper destroyed" };
      }
      const reviewData = await wc.executeJavaScript(REVIEW_PAGE_JS);
      const ageRating = reviewData.ageRange || reviewData.ageBadge || "";
      const slug = extractSlug(match.href);
      const review = {
        csmSlug: slug,
        csmUrl: reviewData.url || reviewUrl,
        csmMediaType: reviewData.mediaType || extractMediaType(match.href),
        title: reviewData.csmTitle || title,
        ageRating,
        ageRangeMin: parseAgeMin(ageRating),
        qualityStars: reviewData.qualityRating ? Number(reviewData.qualityRating) : 0,
        isFamilyFriendly: reviewData.isFamilyFriendly === true || reviewData.isFamilyFriendly === "true",
        reviewSummary: reviewData.reviewSummary || "",
        reviewBody: reviewData.reviewBody || "",
        parentSummary: reviewData.parentSummary || "",
        ageExplanation: reviewData.ageExplanation || "",
        descriptors: (reviewData.descriptors || []).map((d) => ({
          category: String(d.category || ""),
          level: String(d.level || ""),
          numericLevel: Number(d.numericLevel || 0),
          description: String(d.description || "")
        })),
        positiveContent: (reviewData.positiveContent || []).map((p) => ({
          category: String(p.category || ""),
          description: String(p.description || "")
        })),
        scrapedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      this.cache.set(review);
      return {
        title,
        found: true,
        confidence: match.confidence,
        review
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[csm-scraper] Error scraping "${title}":`, message);
      return { title, found: false, error: message };
    }
  }
}
class CSMEnrichmentService {
  constructor(parentWindow, stealthPreloadPath2, profilePath, apiClient2, chromeView) {
    __publicField(this, "cache");
    __publicField(this, "scraper", null);
    __publicField(this, "parentWindow");
    __publicField(this, "stealthPreloadPath");
    __publicField(this, "profilePath");
    __publicField(this, "apiClient");
    __publicField(this, "chromeView");
    this.parentWindow = parentWindow;
    this.stealthPreloadPath = stealthPreloadPath2;
    this.profilePath = profilePath;
    this.apiClient = apiClient2;
    this.chromeView = chromeView;
    this.cache = new CSMCache(profilePath);
  }
  /**
   * Enrich a list of titles with CSM data.
   *
   * - Titles with a fresh cache hit are pushed immediately.
   * - Remaining titles are queued for background scraping.
   * - Updates are pushed via IPC as each title resolves.
   * - A final `csm:enrichment-complete` event is sent when all titles are done.
   */
  enrichTitles(titles, forceRescrape = false) {
    const unique = [...new Set(titles)];
    const toScrape = [];
    const cachedReviews = [];
    const scrapedBatch = [];
    let pending = unique.length;
    const SYNC_BATCH_SIZE = 25;
    for (const title of unique) {
      const cached = this.findCachedByTitle(title);
      if (cached && !forceRescrape) {
        cachedReviews.push(cached);
        this.sendToChrome("csm:enrichment-update", {
          title,
          status: "cached",
          review: cached
        });
        pending--;
      } else {
        toScrape.push(title);
      }
    }
    if (cachedReviews.length > 0) {
      this.syncToBackend(cachedReviews);
    }
    if (toScrape.length === 0) {
      this.sendToChrome("csm:enrichment-complete", {});
      return;
    }
    if (!this.scraper) {
      this.scraper = new CSMScraper(
        this.parentWindow,
        this.stealthPreloadPath,
        this.profilePath
      );
    }
    this.scraper.enqueue(toScrape, (result) => {
      let update;
      if (result.found && result.review) {
        update = { title: result.title, status: "scraped", review: result.review };
        scrapedBatch.push(result.review);
        if (scrapedBatch.length >= SYNC_BATCH_SIZE) {
          this.syncToBackend([...scrapedBatch]);
          scrapedBatch.length = 0;
        }
      } else if (result.error) {
        update = { title: result.title, status: "error" };
      } else {
        update = { title: result.title, status: "not-found" };
      }
      this.sendToChrome("csm:enrichment-update", update);
      pending--;
      if (pending <= 0) {
        this.sendToChrome("csm:enrichment-complete", {});
        if (scrapedBatch.length > 0) {
          this.syncToBackend([...scrapedBatch]);
          scrapedBatch.length = 0;
        }
      }
    });
  }
  /** Get all cached reviews (including stale ones). */
  getCachedReviews() {
    return this.cache.getAll();
  }
  /** Get cache stats (total, fresh, stale). */
  getCacheStats() {
    return this.cache.getStats();
  }
  /**
   * Identify "shallow" reviews — those missing deep fields added by the
   * enhanced scraper (ageExplanation, positiveContent, descriptor descriptions).
   */
  getShallowReviews() {
    const all = this.cache.getAll();
    const shallow = [];
    for (const review of all) {
      const hasDeepFields = "positiveContent" in review && "reviewBody" in review && review.descriptors.some((d) => "numericLevel" in d);
      if (!hasDeepFields) {
        shallow.push(review.title);
      }
    }
    return { count: shallow.length, titles: shallow };
  }
  /** Destroy the scraper and free resources. */
  destroy() {
    if (this.scraper) {
      this.scraper.destroy();
      this.scraper = null;
    }
  }
  // -----------------------------------------------------------------------
  // Internal
  // -----------------------------------------------------------------------
  /**
   * Search the cache by title (case-insensitive).
   * Returns the first fresh match, or null.
   */
  findCachedByTitle(title) {
    const normalised = title.toLowerCase().trim();
    const all = this.cache.getAll();
    for (const review of all) {
      if (review.title.toLowerCase().trim() === normalised) {
        const scraped = new Date(review.scrapedAt).getTime();
        if (Date.now() - scraped <= 30 * 24 * 60 * 60 * 1e3) {
          return review;
        }
      }
    }
    return null;
  }
  /**
   * Sync CSM reviews to the backend DB, then link viewing_history entries.
   * Batches at 25 reviews per request to avoid payload/param limits.
   */
  syncToBackend(reviews) {
    if (!this.apiClient || reviews.length === 0) return;
    const BATCH = 25;
    const allPayload = reviews.map((r) => ({
      csm_slug: r.csmSlug,
      csm_url: r.csmUrl,
      csm_media_type: r.csmMediaType,
      title: r.title,
      age_rating: r.ageRating,
      age_range_min: r.ageRangeMin,
      quality_stars: r.qualityStars,
      is_family_friendly: r.isFamilyFriendly,
      review_summary: r.reviewSummary,
      review_body: r.reviewBody || "",
      parent_summary: r.parentSummary,
      age_explanation: r.ageExplanation || "",
      descriptors_json: r.descriptors,
      positive_content: r.positiveContent || []
    }));
    console.log(`[csm-enrichment] Syncing ${allPayload.length} reviews to backend in batches of ${BATCH}...`);
    const sendBatches = async () => {
      let totalUpserted = 0;
      for (let i = 0; i < allPayload.length; i += BATCH) {
        const batch = allPayload.slice(i, i + BATCH);
        try {
          const res = await this.apiClient.syncCSMReviews(batch);
          totalUpserted += res.upserted;
          console.log(`[csm-enrichment] Batch ${Math.floor(i / BATCH) + 1}: synced ${res.upserted} reviews`);
        } catch (err) {
          console.error(`[csm-enrichment] Batch ${Math.floor(i / BATCH) + 1} failed:`, (err == null ? void 0 : err.message) || err);
          if (batch.length > 0) {
            console.error("[csm-enrichment] Sample payload:", JSON.stringify(batch[0]).substring(0, 200));
          }
        }
      }
      console.log(`[csm-enrichment] Total synced: ${totalUpserted} reviews`);
      try {
        const linkRes = await this.apiClient.linkViewingHistoryCSM();
        console.log(`[csm-enrichment] Linked ${linkRes.linked} viewing history entries to CSM reviews`);
      } catch (err) {
        console.error("[csm-enrichment] Link CSM failed:", (err == null ? void 0 : err.message) || err);
      }
    };
    sendBatches();
  }
  sendToChrome(channel, data) {
    if (!this.chromeView || this.chromeView.webContents.isDestroyed()) return;
    try {
      this.chromeView.webContents.send(channel, data);
    } catch {
    }
  }
}
const CHANNELS = [
  "tab:create",
  "tab:close",
  "tab:switch",
  "tab:list",
  "tab:navigate",
  "tab:go-back",
  "tab:go-forward",
  "tab:reload",
  "chrome:set-expanded",
  "chrome:set-height",
  "profile:list",
  "profile:switch",
  "credentials:check",
  "credentials:list",
  "credentials:save",
  "credentials:save-custom",
  "credentials:delete",
  "auth:status",
  "auth:logout",
  "auth:login-navigate",
  "family:quick-setup",
  "family:list",
  "family:children",
  "family:child-policies",
  "family:add-child",
  "family:members",
  "family:add-member",
  "family:remove-member",
  "family:update-child",
  "family:update-member",
  "config-agent:start",
  "config-agent:resume",
  "config-agent:check-saved",
  "config-agent:confirm-mappings",
  "config-agent:confirm-maturity",
  "config-agent:confirm-pins",
  "config-agent:confirm-locks",
  "config-agent:confirm-autoplay",
  "config-agent:update-changes",
  "config-agent:apply",
  "config-agent:cancel",
  "config-agent:set-tab-inset",
  "netflix:fetch-activity",
  "netflix:load-activity",
  "netflix:load-mappings",
  "netflix:resync-backend",
  "csm:enrich-titles",
  "csm:get-cached",
  "csm:get-cache-stats",
  "csm:get-shallow-reviews",
  "csm:rescrape-shallow",
  "profile-child-map:save",
  "profile-child-map:load"
];
const ON_CHANNELS = [
  "chrome:focus-address-bar"
];
function registerIpcHandlers(windowManager2, profileManager2, credentialManager2, authManager2, apiClient2) {
  for (const channel of CHANNELS) {
    electron.ipcMain.removeHandler(channel);
  }
  for (const channel of ON_CHANNELS) {
    electron.ipcMain.removeAllListeners(channel);
  }
  const tabManager = windowManager2.getTabManager();
  electron.ipcMain.handle("tab:create", (_event, url) => {
    const tab = tabManager.createTab(url);
    return {
      id: tab.id,
      title: tab.title,
      url: tab.url,
      isLoading: tab.isLoading,
      canGoBack: tab.canGoBack,
      canGoForward: tab.canGoForward
    };
  });
  electron.ipcMain.handle("tab:close", (_event, id) => {
    tabManager.closeTab(id);
    return { success: true };
  });
  electron.ipcMain.handle("tab:switch", (_event, id) => {
    tabManager.switchTab(id);
    return { success: true };
  });
  electron.ipcMain.handle("tab:list", () => {
    return {
      tabs: tabManager.toTabInfoList(),
      activeTabId: tabManager.getActiveTabId()
    };
  });
  electron.ipcMain.handle("tab:navigate", (_event, url) => {
    const activeTab = tabManager.getActiveTab();
    if (!activeTab) {
      return { success: false, error: "No active tab" };
    }
    const targetUrl = normaliseUrl(url);
    activeTab.view.webContents.loadURL(targetUrl).catch((err) => {
      console.error("[IPC] tab:navigate failed:", err.message);
    });
    return { success: true };
  });
  electron.ipcMain.handle("tab:go-back", () => {
    const activeTab = tabManager.getActiveTab();
    if (!activeTab) {
      return { success: false, error: "No active tab" };
    }
    if (activeTab.view.webContents.navigationHistory.canGoBack()) {
      activeTab.view.webContents.navigationHistory.goBack();
    }
    return { success: true };
  });
  electron.ipcMain.handle("tab:go-forward", () => {
    const activeTab = tabManager.getActiveTab();
    if (!activeTab) {
      return { success: false, error: "No active tab" };
    }
    if (activeTab.view.webContents.navigationHistory.canGoForward()) {
      activeTab.view.webContents.navigationHistory.goForward();
    }
    return { success: true };
  });
  electron.ipcMain.handle("tab:reload", () => {
    const activeTab = tabManager.getActiveTab();
    if (!activeTab) {
      return { success: false, error: "No active tab" };
    }
    activeTab.view.webContents.reload();
    return { success: true };
  });
  electron.ipcMain.handle("chrome:set-expanded", (_event, expanded) => {
    windowManager2.setChromeExpanded(expanded);
    return { success: true };
  });
  electron.ipcMain.handle("chrome:set-height", (_event, height) => {
    windowManager2.setChromeHeight(height);
    return { success: true };
  });
  electron.ipcMain.on("chrome:focus-address-bar", () => {
    const chromeView = windowManager2.getChromeView();
    if (chromeView && !chromeView.webContents.isDestroyed()) {
      chromeView.webContents.send("chrome:focus-address-bar");
    }
  });
  electron.ipcMain.handle("profile:list", () => {
    return profileManager2.listProfiles();
  });
  electron.ipcMain.handle("profile:switch", (_event, name) => {
    try {
      const profilePath = profileManager2.createProfile(name);
      return { success: true, profilePath };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { success: false, error: message };
    }
  });
  if (credentialManager2) {
    electron.ipcMain.handle("credentials:check", () => {
      return credentialManager2.isAvailable();
    });
    electron.ipcMain.handle("credentials:list", () => {
      return credentialManager2.list();
    });
    electron.ipcMain.handle("credentials:save", (_event, serviceId, username, password) => {
      try {
        const info = credentialManager2.save(serviceId, username, password);
        return { success: true, credential: info };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { success: false, error: message };
      }
    });
    electron.ipcMain.handle("credentials:save-custom", (_event, name, loginUrl, username, password, existingServiceId) => {
      try {
        const info = credentialManager2.saveCustom(name, loginUrl, username, password, existingServiceId);
        return { success: true, credential: info };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { success: false, error: message };
      }
    });
    electron.ipcMain.handle("credentials:delete", (_event, serviceId) => {
      const deleted = credentialManager2.delete(serviceId);
      return { success: deleted };
    });
  }
  if (authManager2) {
    electron.ipcMain.handle("auth:status", () => {
      return authManager2.getInfo();
    });
    electron.ipcMain.handle("auth:logout", () => {
      authManager2.logout();
      return { success: true };
    });
    electron.ipcMain.handle("auth:login-navigate", async () => {
      try {
        await electron.shell.openExternal("https://www.phosra.com/login?from=phosra-browser");
        return { success: true };
      } catch (err) {
        console.error("[Auth] Failed to open login URL:", err);
        return { success: false, error: "Failed to open browser" };
      }
    });
  }
  if (apiClient2) {
    electron.ipcMain.handle("family:quick-setup", async (_event, req) => {
      try {
        const result = await apiClient2.quickSetup(req);
        return { success: true, data: result };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { success: false, error: message };
      }
    });
    electron.ipcMain.handle("family:list", async () => {
      try {
        const families = await apiClient2.listFamilies();
        return { success: true, data: families };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { success: false, error: message };
      }
    });
    electron.ipcMain.handle("family:children", async (_event, familyId) => {
      try {
        const children = await apiClient2.listChildren(familyId);
        return { success: true, data: children };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { success: false, error: message };
      }
    });
    electron.ipcMain.handle("family:child-policies", async (_event, childId) => {
      try {
        const policies = await apiClient2.listPolicies(childId);
        return { success: true, data: policies };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { success: false, error: message };
      }
    });
    electron.ipcMain.handle("family:add-child", async (_event, familyId, name, birthDate) => {
      try {
        const child = await apiClient2.addChild(familyId, name, birthDate);
        return { success: true, data: child };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { success: false, error: message };
      }
    });
    electron.ipcMain.handle("family:members", async (_event, familyId) => {
      try {
        const members = await apiClient2.listMembers(familyId);
        return { success: true, data: members };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { success: false, error: message };
      }
    });
    electron.ipcMain.handle("family:add-member", async (_event, familyId, email, role, displayName) => {
      try {
        const member = await apiClient2.addMember(familyId, email, role, displayName);
        return { success: true, data: member };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { success: false, error: message };
      }
    });
    electron.ipcMain.handle("family:remove-member", async (_event, familyId, memberId) => {
      try {
        await apiClient2.removeMember(familyId, memberId);
        return { success: true };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { success: false, error: message };
      }
    });
    electron.ipcMain.handle("family:update-child", async (_event, childId, name, birthDate) => {
      try {
        const child = await apiClient2.updateChild(childId, { name, birth_date: birthDate });
        return { success: true, data: child };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { success: false, error: message };
      }
    });
    electron.ipcMain.handle("family:update-member", async (_event, familyId, memberId, displayName, role) => {
      try {
        const member = await apiClient2.updateMember(familyId, memberId, { display_name: displayName, role });
        return { success: true, data: member };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { success: false, error: message };
      }
    });
  }
  let netflixAgent = null;
  const configStore = new ConfigStore(profileManager2.getDefaultProfilePath());
  function makeAgent() {
    const tabManager2 = windowManager2.getTabManager();
    return new NetflixAgent({
      chromeView: windowManager2.getChromeView(),
      getActiveTab: () => tabManager2.getActiveTab(),
      credentialManager: credentialManager2 ?? null
    });
  }
  function persistStatus(agent) {
    const status = agent.getStatus();
    configStore.save(status);
    apiClient2 == null ? void 0 : apiClient2.saveConfigState("netflix", status).catch(() => {
    });
  }
  electron.ipcMain.handle("config-agent:check-saved", async () => {
    const local = configStore.loadWithTimestamp();
    let remote = null;
    try {
      const r = await (apiClient2 == null ? void 0 : apiClient2.getConfigState("netflix"));
      const rAny = r;
      if ((rAny == null ? void 0 : rAny.state) && (rAny == null ? void 0 : rAny.savedAt)) remote = { state: rAny.state, savedAt: rAny.savedAt };
      else if (rAny == null ? void 0 : rAny.state) remote = { state: rAny.state, savedAt: "" };
    } catch {
    }
    if (remote && local) {
      const remoteTime = remote.savedAt ? new Date(remote.savedAt).getTime() : 0;
      const localTime = local.savedAt ? new Date(local.savedAt).getTime() : 0;
      return { success: true, data: localTime >= remoteTime ? local.state : remote.state };
    }
    if (remote) return { success: true, data: remote.state };
    if (local) return { success: true, data: local.state };
    return { success: true, data: null };
  });
  electron.ipcMain.handle("config-agent:start", async () => {
    try {
      netflixAgent = makeAgent();
      const status = await netflixAgent.start();
      const savedPins = new Set(configStore.loadPinStatus());
      if (savedPins.size > 0) {
        for (const profile of status.profiles) {
          if (savedPins.has(profile.guid)) {
            profile.hasPIN = true;
          }
        }
      }
      const savedMappings = configStore.loadMappings();
      if (savedMappings && savedMappings.length > 0 && status.profiles.length > 0) {
        const prePopulated = status.profiles.map((profile) => {
          const saved = savedMappings.find((m) => m.netflixProfile.guid === profile.guid);
          if (saved) {
            return {
              ...saved,
              netflixProfile: profile
              // use freshly-scraped profile data
            };
          }
          return {
            netflixProfile: profile,
            familyMemberType: "unassigned"
          };
        });
        netflixAgent.confirmMappingsPreload(prePopulated);
      }
      persistStatus(netflixAgent);
      return { success: true, data: netflixAgent.getStatus() };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { success: false, error: message };
    }
  });
  electron.ipcMain.handle("config-agent:resume", async () => {
    const local = configStore.loadWithTimestamp();
    let remote = null;
    try {
      const r = await (apiClient2 == null ? void 0 : apiClient2.getConfigState("netflix"));
      const rAny = r;
      if ((rAny == null ? void 0 : rAny.state) && (rAny == null ? void 0 : rAny.savedAt)) remote = { state: rAny.state, savedAt: rAny.savedAt };
      else if (rAny == null ? void 0 : rAny.state) remote = { state: rAny.state, savedAt: "" };
    } catch {
    }
    let saved = null;
    if (remote && local) {
      const remoteTime = remote.savedAt ? new Date(remote.savedAt).getTime() : 0;
      const localTime = local.savedAt ? new Date(local.savedAt).getTime() : 0;
      saved = localTime >= remoteTime ? local.state : remote.state;
    } else if (remote) {
      saved = remote.state;
    } else if (local) {
      saved = local.state;
    }
    if (!saved) return { success: false, error: "No saved state" };
    netflixAgent = makeAgent();
    const status = netflixAgent.restore(saved);
    return { success: true, data: status };
  });
  electron.ipcMain.handle("config-agent:confirm-mappings", (_event, mappings) => {
    if (!netflixAgent) return { success: false, error: "Agent not started" };
    const status = netflixAgent.confirmMappings(mappings);
    persistStatus(netflixAgent);
    configStore.saveMappings(mappings);
    return { success: true, data: status };
  });
  electron.ipcMain.handle("config-agent:confirm-maturity", (_event, mappings) => {
    if (!netflixAgent) return { success: false, error: "Agent not started" };
    const status = netflixAgent.confirmMaturity(mappings);
    persistStatus(netflixAgent);
    return { success: true, data: status };
  });
  electron.ipcMain.handle("config-agent:confirm-pins", (_event, profileGuids, pin) => {
    if (!netflixAgent) return { success: false, error: "Agent not started" };
    const status = netflixAgent.confirmPins(profileGuids, pin);
    persistStatus(netflixAgent);
    if (profileGuids.length > 0) {
      const existing = new Set(configStore.loadPinStatus());
      for (const g of profileGuids) existing.add(g);
      configStore.savePinStatus(Array.from(existing));
    }
    return { success: true, data: status };
  });
  electron.ipcMain.handle("config-agent:confirm-locks", (_event, profileGuids) => {
    if (!netflixAgent) return { success: false, error: "Agent not started" };
    const status = netflixAgent.confirmLocks(profileGuids);
    persistStatus(netflixAgent);
    return { success: true, data: status };
  });
  electron.ipcMain.handle("config-agent:confirm-autoplay", (_event, settings) => {
    if (!netflixAgent) return { success: false, error: "Agent not started" };
    const status = netflixAgent.confirmAutoplay(settings);
    persistStatus(netflixAgent);
    return { success: true, data: status };
  });
  electron.ipcMain.handle("config-agent:update-changes", (_event, changes) => {
    if (!netflixAgent) return { success: false, error: "Agent not started" };
    const status = netflixAgent.updateChanges(changes);
    persistStatus(netflixAgent);
    return { success: true, data: status };
  });
  electron.ipcMain.handle("config-agent:apply", async () => {
    if (!netflixAgent) return { success: false, error: "Agent not started" };
    try {
      const status = await netflixAgent.applyChanges();
      if (status.step === "complete") {
        configStore.saveMappings(status.mappings);
        configStore.clear();
        apiClient2 == null ? void 0 : apiClient2.deleteConfigState("netflix").catch(() => {
        });
      }
      return { success: true, data: status };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { success: false, error: message };
    }
  });
  electron.ipcMain.handle("config-agent:cancel", () => {
    if (netflixAgent) {
      netflixAgent.cancel();
      netflixAgent = null;
    }
    configStore.clear();
    apiClient2 == null ? void 0 : apiClient2.deleteConfigState("netflix").catch(() => {
    });
    return { success: true };
  });
  electron.ipcMain.handle("config-agent:set-tab-inset", (_event, right) => {
    windowManager2.setTabInset({ right });
    return { success: true };
  });
  electron.ipcMain.handle("netflix:load-mappings", () => {
    const mappings = configStore.loadMappings();
    return { success: true, data: mappings };
  });
  electron.ipcMain.handle("profile-child-map:save", (_event, map) => {
    configStore.saveProfileChildMap(map);
    return { success: true };
  });
  electron.ipcMain.handle("profile-child-map:load", () => {
    const map = configStore.loadProfileChildMap();
    return { success: true, data: map };
  });
  const activityStore = new ActivityStore(profileManager2.getDefaultProfilePath());
  electron.ipcMain.handle("netflix:fetch-activity", async (_event, mappings) => {
    const activeTab = tabManager.getActiveTab();
    if (!activeTab) {
      return { success: false, error: "No active tab — open Netflix first" };
    }
    try {
      const activities = await fetchNetflixActivity(activeTab.view, mappings);
      activityStore.save(activities);
      if (apiClient2) {
        const profileChildMap = configStore.loadProfileChildMap();
        const BATCH_SIZE = 500;
        for (const act of activities) {
          const mapEntry = profileChildMap == null ? void 0 : profileChildMap.find((m) => m.profileGuid === act.profileGuid);
          const targets = (mapEntry == null ? void 0 : mapEntry.children) ?? [{ childId: act.childId, childName: act.childName }];
          for (const target of targets) {
            const allEntries = act.entries.map((e) => ({
              child_id: target.childId,
              child_name: target.childName,
              platform: "netflix",
              title: e.title,
              series_title: e.seriesTitle || null,
              watched_date: parseNetflixDate(e.date),
              netflix_profile: act.profileGuid
            }));
            for (let i = 0; i < allEntries.length; i += BATCH_SIZE) {
              const batch = allEntries.slice(i, i + BATCH_SIZE);
              apiClient2.syncViewingHistory(batch).catch((err) => {
                console.error(`[netflix-activity] Backend sync batch failed (${target.childName}):`, err);
              });
            }
          }
        }
      }
      return { success: true, data: activities };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { success: false, error: message };
    }
  });
  electron.ipcMain.handle("netflix:load-activity", () => {
    const saved = activityStore.load();
    return { success: true, data: saved };
  });
  electron.ipcMain.handle("netflix:resync-backend", async () => {
    if (!apiClient2) return { success: false, error: "Not authenticated" };
    const saved = activityStore.load();
    if (!saved || saved.length === 0) return { success: false, error: "No persisted activity" };
    const profileChildMap = configStore.loadProfileChildMap();
    const BATCH_SIZE = 500;
    let totalSynced = 0;
    let totalSkipped = 0;
    for (const act of saved) {
      const mapEntry = profileChildMap == null ? void 0 : profileChildMap.find((m) => m.profileGuid === act.profileGuid);
      const targets = (mapEntry == null ? void 0 : mapEntry.children) ?? [{ childId: act.childId, childName: act.childName }];
      for (const target of targets) {
        const allEntries = act.entries.map((e) => ({
          child_id: target.childId,
          child_name: target.childName,
          platform: "netflix",
          title: e.title,
          series_title: e.seriesTitle || null,
          watched_date: parseNetflixDate(e.date),
          netflix_profile: act.profileGuid
        }));
        console.log(`[resync] ${act.profileName} → ${target.childName}: ${allEntries.length} entries`);
        for (let i = 0; i < allEntries.length; i += BATCH_SIZE) {
          const batch = allEntries.slice(i, i + BATCH_SIZE);
          try {
            await apiClient2.syncViewingHistory(batch);
            totalSynced += batch.length;
          } catch (err) {
            console.error(`[resync] Batch failed (${target.childName}):`, err);
            totalSkipped += batch.length;
          }
        }
      }
    }
    console.log(`[resync] Done: ${totalSynced} synced, ${totalSkipped} skipped`);
    return { success: true, synced: totalSynced, skipped: totalSkipped };
  });
  let csmService = null;
  function ensureCSMService() {
    if (!csmService) {
      const mainWindow = windowManager2.getWindow();
      const stealthPreload = path__namespace.join(__dirname, "..", "preload", "stealth-preload.js");
      const profilePath = profileManager2.getDefaultProfilePath();
      csmService = new CSMEnrichmentService(
        mainWindow,
        stealthPreload,
        profilePath,
        apiClient2 ?? null,
        windowManager2.getChromeView()
      );
    }
    return csmService;
  }
  electron.ipcMain.handle("csm:enrich-titles", async (_event, titles) => {
    try {
      const service = ensureCSMService();
      service.enrichTitles(titles);
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { success: false, error: message };
    }
  });
  electron.ipcMain.handle("csm:get-cached", () => {
    try {
      const service = ensureCSMService();
      return { success: true, data: service.getCachedReviews() };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { success: false, error: message };
    }
  });
  electron.ipcMain.handle("csm:get-cache-stats", () => {
    try {
      const service = ensureCSMService();
      return { success: true, data: service.getCacheStats() };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { success: false, error: message };
    }
  });
  electron.ipcMain.handle("csm:get-shallow-reviews", () => {
    try {
      const service = ensureCSMService();
      return { success: true, data: service.getShallowReviews() };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { success: false, error: message };
    }
  });
  electron.ipcMain.handle("csm:rescrape-shallow", () => {
    try {
      const service = ensureCSMService();
      const { count, titles } = service.getShallowReviews();
      if (count === 0) {
        return { success: true, count: 0 };
      }
      service.enrichTitles(titles, true);
      return { success: true, count };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { success: false, error: message };
    }
  });
}
function parseNetflixDate(dateStr) {
  if (!dateStr) return null;
  const parts = dateStr.split("/");
  if (parts.length !== 3) return null;
  const month = parseInt(parts[0], 10);
  const day = parseInt(parts[1], 10);
  let year = parseInt(parts[2], 10);
  if (isNaN(month) || isNaN(day) || isNaN(year)) return null;
  if (year < 100) year += 2e3;
  const m = String(month).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${year}-${m}-${d}`;
}
function normaliseUrl(input) {
  const trimmed = input.trim();
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(trimmed)) {
    return trimmed;
  }
  if (/^(about|file|data|javascript):/.test(trimmed)) {
    return trimmed;
  }
  if (/^[^\s]+\.[^\s]+$/.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return `https://www.google.com/search?q=${encodeURIComponent(trimmed)}`;
}
function buildApplicationMenu(windowManager2) {
  const appName = electron.app.name || "Phosra Browser";
  const template = [
    // ---- App menu (macOS) ----
    {
      label: appName,
      submenu: [
        { role: "about", label: `About ${appName}` },
        { type: "separator" },
        { role: "services" },
        { type: "separator" },
        { role: "hide", label: `Hide ${appName}` },
        { role: "hideOthers" },
        { role: "unhide" },
        { type: "separator" },
        { role: "quit", label: `Quit ${appName}` }
      ]
    },
    // ---- File menu ----
    {
      label: "File",
      submenu: [
        {
          label: "New Tab",
          accelerator: "CmdOrCtrl+T",
          click: () => {
            windowManager2.getTabManager().createTab();
          }
        },
        {
          label: "Close Tab",
          accelerator: "CmdOrCtrl+W",
          click: () => {
            const tabManager = windowManager2.getTabManager();
            const activeTab = tabManager.getActiveTab();
            if (activeTab) {
              tabManager.closeTab(activeTab.id);
            }
            if (tabManager.getAllTabs().length === 0) {
              windowManager2.getWindow().close();
            }
          }
        },
        {
          label: "Close Window",
          accelerator: "CmdOrCtrl+Shift+W",
          click: () => {
            windowManager2.getWindow().close();
          }
        }
      ]
    },
    // ---- Edit menu ----
    {
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        { role: "selectAll" }
      ]
    },
    // ---- View menu ----
    {
      label: "View",
      submenu: [
        {
          label: "Reload",
          accelerator: "CmdOrCtrl+R",
          click: () => {
            const activeTab = windowManager2.getTabManager().getActiveTab();
            if (activeTab) {
              activeTab.view.webContents.reload();
            }
          }
        },
        {
          label: "Force Reload",
          accelerator: "CmdOrCtrl+Shift+R",
          click: () => {
            const activeTab = windowManager2.getTabManager().getActiveTab();
            if (activeTab) {
              activeTab.view.webContents.reloadIgnoringCache();
            }
          }
        },
        {
          label: "Toggle Developer Tools",
          accelerator: "CmdOrCtrl+Alt+I",
          click: () => {
            const activeTab = windowManager2.getTabManager().getActiveTab();
            if (activeTab) {
              activeTab.view.webContents.toggleDevTools();
            }
          }
        },
        { type: "separator" },
        {
          label: "Zoom In",
          accelerator: "CmdOrCtrl+Plus",
          click: () => {
            const activeTab = windowManager2.getTabManager().getActiveTab();
            if (activeTab) {
              const wc = activeTab.view.webContents;
              wc.setZoomLevel(wc.getZoomLevel() + 0.5);
            }
          }
        },
        {
          label: "Zoom Out",
          accelerator: "CmdOrCtrl+-",
          click: () => {
            const activeTab = windowManager2.getTabManager().getActiveTab();
            if (activeTab) {
              const wc = activeTab.view.webContents;
              wc.setZoomLevel(wc.getZoomLevel() - 0.5);
            }
          }
        },
        {
          label: "Reset Zoom",
          accelerator: "CmdOrCtrl+0",
          click: () => {
            const activeTab = windowManager2.getTabManager().getActiveTab();
            if (activeTab) {
              activeTab.view.webContents.setZoomLevel(0);
            }
          }
        },
        { type: "separator" },
        { role: "togglefullscreen" }
      ]
    },
    // ---- Window menu ----
    {
      label: "Window",
      submenu: [
        { role: "minimize" },
        { role: "close" }
      ]
    },
    // ---- Help menu ----
    {
      label: "Help",
      submenu: [
        {
          label: `${appName} Help`,
          click: () => {
            windowManager2.getTabManager().createTab("https://www.phosra.com");
          }
        }
      ]
    }
  ];
  return electron.Menu.buildFromTemplate(template);
}
const DEFAULT_REMOTE_DEBUGGING_PORT = 9222;
function getRemoteDebuggingPort() {
  const flag = electron.app.commandLine.getSwitchValue("remote-debugging-port");
  if (flag) {
    const parsed = parseInt(flag, 10);
    if (!isNaN(parsed) && parsed > 0 && parsed <= 65535) {
      return parsed;
    }
  }
  return DEFAULT_REMOTE_DEBUGGING_PORT;
}
const STREAMING_SERVICES = [
  {
    id: "netflix",
    displayName: "Netflix",
    loginUrls: ["netflix.com/login"],
    selectors: {
      username: 'input[name="userLoginId"], input[data-uia="login-field"]',
      password: 'input[name="password"], input[data-uia="password-field"]',
      submit: 'button[data-uia="login-submit-button"], button[type="submit"]'
    }
  },
  {
    id: "disneyplus",
    displayName: "Disney+",
    loginUrls: ["disneyplus.com/login", "disneyplus.com/identity"],
    selectors: {
      username: 'input[type="email"], input[data-testid="email-input"]',
      password: 'input[type="password"], input[data-testid="password-input"]'
    }
  },
  {
    id: "hulu",
    displayName: "Hulu",
    loginUrls: ["auth.hulu.com", "hulu.com/login"],
    selectors: {
      username: 'input[type="email"], input[name="email"]',
      password: 'input[type="password"], input[name="password"]'
    }
  },
  {
    id: "max",
    displayName: "Max",
    loginUrls: ["max.com/login", "max.com/sign-in"],
    selectors: {
      username: 'input[type="email"], input[name="email"]',
      password: 'input[type="password"], input[name="password"]'
    }
  },
  {
    id: "paramountplus",
    displayName: "Paramount+",
    loginUrls: ["paramountplus.com/account/signin", "paramountplus.com/login"],
    selectors: {
      username: 'input[type="email"], input[name="email"]',
      password: 'input[type="password"], input[name="password"]'
    }
  },
  {
    id: "youtube",
    displayName: "YouTube",
    loginUrls: ["accounts.google.com/v3/signin", "accounts.google.com/signin"],
    selectors: {
      username: 'input[type="email"], input[name="identifier"]',
      password: 'input[type="password"], input[name="Passwd"]'
    }
  },
  {
    id: "appletv",
    displayName: "Apple TV+",
    loginUrls: ["idmsa.apple.com/appleauth", "tv.apple.com/login"],
    selectors: {
      username: 'input[type="text"]#account_name_text_field, input[id="appleId"]',
      password: 'input[type="password"]#password_text_field, input[id="password"]'
    }
  },
  {
    id: "primevideo",
    displayName: "Amazon Prime Video",
    loginUrls: ["amazon.com/ap/signin", "amazon.com/ap/mfa", "amazon.com/gp/video/profiles", "primevideo.com/auth/signin"],
    selectors: {
      username: 'input[name="email"], input[type="email"], input#ap_email',
      password: 'input[name="password"], input[type="password"], input#ap_password',
      submit: 'input#signInSubmit, input#continue, button#signInSubmit, button[type="submit"]'
    }
  }
];
const SERVICE_MAP = new Map(
  STREAMING_SERVICES.map((s) => [s.id, s])
);
const DEFAULT_SELECTORS = {
  username: 'input[type="email"], input[name="email"], input[name="username"], input[type="text"][autocomplete="username"]',
  password: 'input[type="password"], input[name="password"]'
};
function matchUrlToService(url, customServices) {
  const lower = url.toLowerCase();
  const builtIn = STREAMING_SERVICES.find(
    (s) => s.loginUrls.some((pattern) => lower.includes(pattern))
  );
  if (builtIn) return builtIn;
  if (customServices) {
    return customServices.find(
      (s) => s.loginUrls.some((pattern) => lower.includes(pattern))
    );
  }
  return void 0;
}
function getServiceById(id) {
  return SERVICE_MAP.get(id);
}
function isBuiltInService(id) {
  return SERVICE_MAP.has(id);
}
class CredentialManager {
  constructor(profilePath) {
    __publicField(this, "filePath");
    __publicField(this, "credentials", /* @__PURE__ */ new Map());
    this.filePath = path__namespace.join(profilePath, "credentials.json");
    this.load();
  }
  // -----------------------------------------------------------------------
  // Public API
  // -----------------------------------------------------------------------
  /** Check whether safeStorage encryption is available on this machine. */
  isAvailable() {
    return electron.safeStorage.isEncryptionAvailable();
  }
  /** List all credentials (safe for renderer — no passwords). */
  list() {
    const builtIn = STREAMING_SERVICES.map((svc) => {
      const cred = this.credentials.get(svc.id);
      return {
        serviceId: svc.id,
        displayName: svc.displayName,
        username: (cred == null ? void 0 : cred.username) ?? "",
        hasPassword: !!(cred == null ? void 0 : cred.encryptedPassword),
        updatedAt: (cred == null ? void 0 : cred.updatedAt) ?? "",
        isCustom: false
      };
    });
    const custom = [];
    for (const cred of this.credentials.values()) {
      if (!isBuiltInService(cred.serviceId) && cred.customName) {
        custom.push({
          serviceId: cred.serviceId,
          displayName: cred.customName,
          username: cred.username,
          hasPassword: !!cred.encryptedPassword,
          updatedAt: cred.updatedAt,
          isCustom: true,
          loginUrl: cred.customLoginUrl
        });
      }
    }
    return [...builtIn, ...custom];
  }
  /** Save (create or update) a credential for a built-in streaming service. */
  save(serviceId, username, password) {
    if (!this.isAvailable()) {
      throw new Error("OS keychain encryption is not available");
    }
    const svc = getServiceById(serviceId);
    if (!svc) {
      throw new Error(`Unknown service: ${serviceId}`);
    }
    const encrypted = electron.safeStorage.encryptString(password);
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const existing = this.credentials.get(serviceId);
    const stored = {
      serviceId,
      username,
      encryptedPassword: encrypted.toString("base64"),
      createdAt: (existing == null ? void 0 : existing.createdAt) ?? now,
      updatedAt: now
    };
    this.credentials.set(serviceId, stored);
    this.persist();
    return {
      serviceId,
      displayName: svc.displayName,
      username,
      hasPassword: true,
      updatedAt: now,
      isCustom: false
    };
  }
  /** Save a credential for a custom provider. */
  saveCustom(name, loginUrl, username, password, existingServiceId) {
    if (!this.isAvailable()) {
      throw new Error("OS keychain encryption is not available");
    }
    const serviceId = existingServiceId ?? `custom-${Date.now()}`;
    const encrypted = electron.safeStorage.encryptString(password);
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const existing = this.credentials.get(serviceId);
    const stored = {
      serviceId,
      username,
      encryptedPassword: encrypted.toString("base64"),
      createdAt: (existing == null ? void 0 : existing.createdAt) ?? now,
      updatedAt: now,
      customName: name,
      customLoginUrl: loginUrl
    };
    this.credentials.set(serviceId, stored);
    this.persist();
    return {
      serviceId,
      displayName: name,
      username,
      hasPassword: true,
      updatedAt: now,
      isCustom: true,
      loginUrl
    };
  }
  /** Delete a stored credential. */
  delete(serviceId) {
    const deleted = this.credentials.delete(serviceId);
    if (deleted) {
      this.persist();
    }
    return deleted;
  }
  /** Match a URL to a service and return the decrypted password (main process only). */
  getAutoFillData(url) {
    const customServices = this.getCustomAsStreamingServices();
    const svc = matchUrlToService(url, customServices);
    if (!svc) return null;
    const cred = this.credentials.get(svc.id);
    if (!cred || !cred.encryptedPassword) return null;
    try {
      const buffer = Buffer.from(cred.encryptedPassword, "base64");
      const password = electron.safeStorage.decryptString(buffer);
      return { service: svc, username: cred.username, password };
    } catch {
      console.error(`[CredentialManager] Failed to decrypt password for ${svc.id}`);
      return null;
    }
  }
  /** Check if a URL matches a service that has stored credentials. */
  hasCredentialForUrl(url) {
    const customServices = this.getCustomAsStreamingServices();
    const svc = matchUrlToService(url, customServices);
    if (!svc) return null;
    const cred = this.credentials.get(svc.id);
    if (!cred || !cred.encryptedPassword) return null;
    return { serviceId: svc.id, displayName: svc.displayName };
  }
  // -----------------------------------------------------------------------
  // Helpers
  // -----------------------------------------------------------------------
  /** Convert custom credentials into StreamingService objects for URL matching. */
  getCustomAsStreamingServices() {
    const custom = [];
    for (const cred of this.credentials.values()) {
      if (!isBuiltInService(cred.serviceId) && cred.customLoginUrl) {
        custom.push({
          id: cred.serviceId,
          displayName: cred.customName ?? "Custom",
          loginUrls: [cred.customLoginUrl],
          selectors: DEFAULT_SELECTORS
        });
      }
    }
    return custom;
  }
  // -----------------------------------------------------------------------
  // Persistence
  // -----------------------------------------------------------------------
  load() {
    try {
      if (!fs__namespace.existsSync(this.filePath)) return;
      const raw = fs__namespace.readFileSync(this.filePath, "utf-8");
      const entries = JSON.parse(raw);
      for (const entry of entries) {
        this.credentials.set(entry.serviceId, entry);
      }
    } catch {
      console.error("[CredentialManager] Failed to load credentials file");
    }
  }
  persist() {
    try {
      const dir = path__namespace.dirname(this.filePath);
      if (!fs__namespace.existsSync(dir)) {
        fs__namespace.mkdirSync(dir, { recursive: true });
      }
      const data = JSON.stringify(Array.from(this.credentials.values()), null, 2);
      fs__namespace.writeFileSync(this.filePath, data, { encoding: "utf-8", mode: 384 });
    } catch (err) {
      console.error("[CredentialManager] Failed to persist credentials:", err);
    }
  }
}
const STYTCH_PROJECT_ID = "project-live-2ba56535-d746-4f35-9d26-acfadd5e8c99";
const STYTCH_SECRET = "secret-live-BVWsDsGndQ7Vefiellq3tOO2pBRdFdgLGE8=";
const STYTCH_API_URL = "https://api.stytch.com/v1/sessions/authenticate";
class AuthManager {
  constructor(profilePath, session) {
    __publicField(this, "filePath");
    __publicField(this, "session");
    __publicField(this, "stored", null);
    // JWT cache (in-memory only, never persisted)
    __publicField(this, "cachedJwt", null);
    __publicField(this, "cachedJwtExpiry", 0);
    this.filePath = path__namespace.join(profilePath, "auth-token.json");
    this.session = session;
    this.load();
  }
  // -----------------------------------------------------------------------
  // Public API
  // -----------------------------------------------------------------------
  /** Whether the user is currently logged in (has a non-expired session). */
  isLoggedIn() {
    if (!this.stored) return false;
    return new Date(this.stored.expiresAt) > /* @__PURE__ */ new Date();
  }
  /** Auth info safe for the renderer (no secrets). */
  getInfo() {
    if (!this.stored || !this.isLoggedIn()) {
      return { email: "", isLoggedIn: false, expiresAt: "" };
    }
    return {
      email: this.stored.email,
      isLoggedIn: true,
      expiresAt: this.stored.expiresAt
    };
  }
  /**
   * Get a fresh Stytch JWT for API calls.
   * Returns a cached JWT if still valid, otherwise exchanges the
   * session_token for a new one via the Stytch API.
   */
  async getToken() {
    if (!this.stored || !this.isLoggedIn()) return null;
    if (this.cachedJwt && Date.now() < this.cachedJwtExpiry - 6e4) {
      return this.cachedJwt;
    }
    return this.refreshJwt();
  }
  /**
   * Store a session_token from the deep-link auth flow.
   * Called when phosra-browser://auth?session_token=... is received.
   */
  storeSessionToken(sessionToken, email) {
    if (!electron.safeStorage.isEncryptionAvailable()) {
      console.error("[AuthManager] safeStorage encryption not available");
      return false;
    }
    const encrypted = electron.safeStorage.encryptString(sessionToken);
    this.stored = {
      encryptedSessionToken: encrypted.toString("base64"),
      email: email || "",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3).toISOString(),
      savedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.cachedJwt = null;
    this.cachedJwtExpiry = 0;
    this.persist();
    console.log(`[AuthManager] Session token stored for ${email || "unknown user"}`);
    return true;
  }
  /**
   * Legacy: store a JWT directly (from cookie capture flow).
   * Kept for backwards compatibility with the tab-manager cookie capture.
   */
  storeToken(jwt) {
    if (!electron.safeStorage.isEncryptionAvailable()) {
      console.error("[AuthManager] safeStorage encryption not available");
      return false;
    }
    const email = this.extractEmailFromJwt(jwt);
    const encrypted = electron.safeStorage.encryptString(jwt);
    this.stored = {
      encryptedSessionToken: encrypted.toString("base64"),
      email,
      expiresAt: new Date(Date.now() + 5 * 60 * 1e3).toISOString(),
      // 5 min
      savedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.cachedJwt = jwt;
    this.cachedJwtExpiry = Date.now() + 4 * 60 * 1e3;
    this.persist();
    console.log(`[AuthManager] JWT stored for ${email || "unknown user"}`);
    return true;
  }
  /**
   * Read the stytch_session cookie from the Electron session's cookie jar.
   * Called by TabManager when navigation to phosra.com/dashboard is detected.
   */
  async captureTokenFromSession() {
    try {
      const sessionTokenCookies = await this.session.cookies.get({
        name: "stytch_session",
        domain: ".phosra.com"
      });
      if (sessionTokenCookies.length > 0) {
        return this.storeSessionToken(sessionTokenCookies[0].value);
      }
      const sessionTokenCookies2 = await this.session.cookies.get({
        name: "stytch_session",
        domain: "phosra.com"
      });
      if (sessionTokenCookies2.length > 0) {
        return this.storeSessionToken(sessionTokenCookies2[0].value);
      }
      const jwtCookies = await this.session.cookies.get({
        name: "stytch_session_jwt",
        domain: ".phosra.com"
      });
      if (jwtCookies.length > 0) {
        return this.storeToken(jwtCookies[0].value);
      }
      console.log("[AuthManager] No Stytch cookies found");
      return false;
    } catch (err) {
      console.error("[AuthManager] Failed to capture token:", err);
      return false;
    }
  }
  /** Clear stored token and log out. */
  logout() {
    this.stored = null;
    this.cachedJwt = null;
    this.cachedJwtExpiry = 0;
    try {
      if (fs__namespace.existsSync(this.filePath)) {
        fs__namespace.unlinkSync(this.filePath);
      }
    } catch (err) {
      console.error("[AuthManager] Failed to delete auth file:", err);
    }
  }
  // -----------------------------------------------------------------------
  // Private: Stytch token refresh
  // -----------------------------------------------------------------------
  async refreshJwt() {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const sessionToken = this.getSessionToken();
    if (!sessionToken) return null;
    try {
      const basicAuth = Buffer.from(`${STYTCH_PROJECT_ID}:${STYTCH_SECRET}`).toString("base64");
      const res = await electron.net.fetch(STYTCH_API_URL, {
        method: "POST",
        headers: {
          "Authorization": `Basic ${basicAuth}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ session_token: sessionToken })
      });
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        console.error(`[AuthManager] Stytch refresh failed: ${res.status} ${body}`);
        if (res.status === 401 || res.status === 404) {
          this.logout();
        }
        return null;
      }
      const data = await res.json();
      this.cachedJwt = data.session_jwt;
      this.cachedJwtExpiry = Date.now() + 4 * 60 * 1e3;
      if (data.session_token && data.session_token !== sessionToken) {
        const email = ((_c = (_b = (_a = data.user) == null ? void 0 : _a.emails) == null ? void 0 : _b[0]) == null ? void 0 : _c.email) || ((_d = this.stored) == null ? void 0 : _d.email) || "";
        this.storeSessionToken(data.session_token, email);
      }
      if (((_g = (_f = (_e = data.user) == null ? void 0 : _e.emails) == null ? void 0 : _f[0]) == null ? void 0 : _g.email) && this.stored) {
        this.stored.email = data.user.emails[0].email;
        this.persist();
      }
      if (((_h = data.session) == null ? void 0 : _h.expires_at) && this.stored) {
        this.stored.expiresAt = data.session.expires_at;
        this.persist();
      }
      console.log("[AuthManager] JWT refreshed successfully");
      return this.cachedJwt;
    } catch (err) {
      console.error("[AuthManager] Failed to refresh JWT:", err);
      return null;
    }
  }
  /** Decrypt the stored session token. */
  getSessionToken() {
    if (!this.stored) return null;
    try {
      const buffer = Buffer.from(this.stored.encryptedSessionToken, "base64");
      return electron.safeStorage.decryptString(buffer);
    } catch {
      console.error("[AuthManager] Failed to decrypt session token");
      return null;
    }
  }
  extractEmailFromJwt(jwt) {
    var _a, _b, _c, _d;
    try {
      const parts = jwt.split(".");
      if (parts.length < 2) return "";
      const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
      const decoded = JSON.parse(Buffer.from(payload, "base64").toString("utf-8"));
      return decoded.email || decoded.sub || ((_d = (_c = (_b = (_a = decoded["https://stytch.com/session"]) == null ? void 0 : _a.authentication_factors) == null ? void 0 : _b[0]) == null ? void 0 : _c.email_factor) == null ? void 0 : _d.email_address) || "";
    } catch {
      return "";
    }
  }
  // -----------------------------------------------------------------------
  // Persistence
  // -----------------------------------------------------------------------
  load() {
    try {
      if (!fs__namespace.existsSync(this.filePath)) return;
      const raw = fs__namespace.readFileSync(this.filePath, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed.encryptedToken && !parsed.encryptedSessionToken) {
        console.log("[AuthManager] Clearing stale v1 auth token — re-login required");
        fs__namespace.unlinkSync(this.filePath);
        return;
      }
      this.stored = parsed;
    } catch {
      console.error("[AuthManager] Failed to load auth file");
    }
  }
  persist() {
    try {
      const dir = path__namespace.dirname(this.filePath);
      if (!fs__namespace.existsSync(dir)) {
        fs__namespace.mkdirSync(dir, { recursive: true });
      }
      fs__namespace.writeFileSync(this.filePath, JSON.stringify(this.stored, null, 2), {
        encoding: "utf-8",
        mode: 384
      });
    } catch (err) {
      console.error("[AuthManager] Failed to persist auth:", err);
    }
  }
}
const API_BASE = "https://phosra-api.fly.dev/api/v1";
class PhosraApiClient {
  constructor(getToken) {
    this.getToken = getToken;
  }
  async quickSetup(req) {
    return this.post("/setup/quick", req);
  }
  async listFamilies() {
    return this.get("/families");
  }
  async listChildren(familyId) {
    return this.get(`/families/${familyId}/children`);
  }
  async getChild(childId) {
    return this.get(`/children/${childId}`);
  }
  async listPolicies(childId) {
    return this.get(`/children/${childId}/policies`);
  }
  async addChild(familyId, name, birthDate) {
    return this.post(`/families/${familyId}/children`, { name, birth_date: birthDate });
  }
  async listMembers(familyId) {
    return this.get(`/families/${familyId}/members`);
  }
  async addMember(familyId, email, role, displayName) {
    return this.post(`/families/${familyId}/members`, { email, role, display_name: displayName || "" });
  }
  async removeMember(familyId, memberId) {
    return this.del(`/families/${familyId}/members/${memberId}`);
  }
  async updateChild(childId, data) {
    return this.put(`/children/${childId}`, data);
  }
  async updateMember(familyId, memberId, data) {
    return this.put(`/families/${familyId}/members/${memberId}`, data);
  }
  // -----------------------------------------------------------------------
  // Viewing History Sync
  // -----------------------------------------------------------------------
  async syncViewingHistory(entries) {
    await this.post("/viewing-history/sync", { entries });
  }
  // -----------------------------------------------------------------------
  // CSM Reviews Sync
  // -----------------------------------------------------------------------
  async syncCSMReviews(reviews) {
    return this.post("/csm/reviews/bulk", { reviews });
  }
  async linkViewingHistoryCSM() {
    return this.post("/viewing-history/link-csm", {});
  }
  // -----------------------------------------------------------------------
  // Config Agent State
  // -----------------------------------------------------------------------
  async saveConfigState(platform, state) {
    await this.put(`/config-agent/state/${platform}`, { state });
  }
  async getConfigState(platform) {
    try {
      return await this.get(`/config-agent/state/${platform}`);
    } catch {
      return null;
    }
  }
  async deleteConfigState(platform) {
    await this.del(`/config-agent/state/${platform}`);
  }
  // -----------------------------------------------------------------------
  // HTTP helpers
  // -----------------------------------------------------------------------
  async get(path2) {
    const token = await this.getToken();
    if (!token) throw new Error("Not authenticated");
    const res = await electron.net.fetch(`${API_BASE}${path2}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`API ${res.status}: ${body || res.statusText}`);
    }
    return res.json();
  }
  async del(path2) {
    const token = await this.getToken();
    if (!token) throw new Error("Not authenticated");
    const res = await electron.net.fetch(`${API_BASE}${path2}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`API ${res.status}: ${body || res.statusText}`);
    }
  }
  async put(path2, body) {
    const token = await this.getToken();
    if (!token) throw new Error("Not authenticated");
    const res = await electron.net.fetch(`${API_BASE}${path2}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`API ${res.status}: ${text || res.statusText}`);
    }
    return res.json();
  }
  async post(path2, body) {
    const token = await this.getToken();
    if (!token) throw new Error("Not authenticated");
    const res = await electron.net.fetch(`${API_BASE}${path2}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`API ${res.status}: ${text || res.statusText}`);
    }
    return res.json();
  }
}
const stealthFlags = getStealthFlags();
for (const flag of stealthFlags) {
  const eqIndex = flag.indexOf("=");
  if (eqIndex > 0) {
    const key = flag.substring(0, eqIndex);
    const value = flag.substring(eqIndex + 1);
    electron.app.commandLine.appendSwitch(key, value);
  } else {
    electron.app.commandLine.appendSwitch(flag);
  }
}
const cdpPortArg = process.argv.find((arg) => arg.startsWith("--cdp-port="));
const cdpPort = cdpPortArg ? parseInt(cdpPortArg.split("=")[1], 10) || 9222 : 9222;
electron.app.commandLine.appendSwitch("remote-debugging-port", String(cdpPort));
const agentDebugEnabled = process.argv.some((arg) => arg.startsWith("--agent-debug"));
const agentDebugPortArg = process.argv.find((arg) => arg.startsWith("--agent-debug-port="));
const agentDebugPort = agentDebugPortArg ? parseInt(agentDebugPortArg.split("=")[1], 10) || 9333 : 9333;
if (agentDebugEnabled) {
  startAgentDebugServer(agentDebugPort);
}
electron.protocol.registerSchemesAsPrivileged([
  {
    scheme: "phosra",
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: false
    }
  }
]);
electron.app.setAsDefaultProtocolClient("phosra-browser");
const chromePreloadPath = path__namespace.join(__dirname, "..", "preload", "chrome-ui-preload.js");
const stealthPreloadPath = path__namespace.join(__dirname, "..", "preload", "stealth-preload.js");
const homePreloadPath = path__namespace.join(__dirname, "..", "preload", "home-preload.js");
const familyPreloadPath = path__namespace.join(__dirname, "..", "preload", "family-preload.js");
let windowManager = null;
let profileManager = null;
let credentialManager = null;
let authManager = null;
let apiClient = null;
const CHROME_UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";
electron.app.whenReady().then(() => {
  electron.session.defaultSession.setUserAgent(CHROME_UA);
  const isDevMode = !!process.env.VITE_DEV_SERVER_URL;
  const distDir = path__namespace.join(__dirname, "..");
  const homeDir = path__namespace.join(distDir, "home");
  const familyDir = path__namespace.join(distDir, "family");
  const phosraHandler = (request) => {
    const url = new URL(request.url);
    const host = url.hostname;
    if (isDevMode && process.env.VITE_DEV_SERVER_URL) {
      const devBase = process.env.VITE_DEV_SERVER_URL.replace(/\/$/, "");
      let devPath;
      const pageDir = host === "family" ? "family" : "home";
      if (url.pathname === "/" || url.pathname === "") {
        devPath = `/${pageDir}/index.html`;
      } else if (url.pathname.startsWith("/@") || url.pathname.startsWith("/home/") || url.pathname.startsWith("/family/") || url.pathname.startsWith("/node_modules/")) {
        devPath = url.pathname;
      } else {
        devPath = `/${pageDir}${url.pathname}`;
      }
      const fetchUrl = `${devBase}${devPath}`;
      return electron.net.fetch(fetchUrl);
    }
    const pageDistDir = host === "family" ? familyDir : homeDir;
    let filePath;
    if (url.pathname === "/" || url.pathname === "") {
      filePath = path__namespace.join(pageDistDir, "index.html");
    } else {
      const safePath = path__namespace.normalize(url.pathname).replace(/^(\.\.[\/\\])+/, "");
      const resolved = path__namespace.join(distDir, safePath);
      if (!resolved.startsWith(distDir)) {
        return new Response("Forbidden", { status: 403 });
      }
      filePath = resolved;
    }
    return electron.net.fetch(`file://${filePath}`);
  };
  electron.protocol.handle("phosra", phosraHandler);
  profileManager = new ProfileManager();
  const defaultProfilePath = profileManager.getDefaultProfilePath();
  const profileName = path__namespace.basename(defaultProfilePath);
  const profileSession = electron.session.fromPartition(`persist:${profileName}`, { cache: true });
  profileSession.protocol.handle("phosra", phosraHandler);
  credentialManager = new CredentialManager(defaultProfilePath);
  authManager = new AuthManager(defaultProfilePath, profileSession);
  apiClient = new PhosraApiClient(() => authManager.getToken());
  windowManager = new WindowManager(chromePreloadPath, stealthPreloadPath, homePreloadPath, familyPreloadPath, defaultProfilePath);
  windowManager.createWindow();
  windowManager.getTabManager().setCredentialManager(credentialManager);
  windowManager.getTabManager().setAuthManager(authManager);
  registerIpcHandlers(windowManager, profileManager, credentialManager, authManager, apiClient);
  const menu = buildApplicationMenu(windowManager);
  electron.Menu.setApplicationMenu(menu);
  const initialUrl = getInitialUrl();
  windowManager.getTabManager().createTab(initialUrl);
  console.log(`[Phosra Browser] Ready`);
  console.log(`[Phosra Browser] CDP port: ${getRemoteDebuggingPort()}`);
  console.log(`[Phosra Browser] Profile: ${defaultProfilePath}`);
});
electron.app.on("activate", () => {
  if (windowManager && !windowManager.getWindow().isDestroyed()) {
    windowManager.getWindow().show();
  } else if (profileManager) {
    const reactivateProfilePath = profileManager.getDefaultProfilePath();
    credentialManager = new CredentialManager(reactivateProfilePath);
    const reactivateProfileName = path__namespace.basename(reactivateProfilePath);
    const reactivateSession = electron.session.fromPartition(`persist:${reactivateProfileName}`, { cache: true });
    authManager = new AuthManager(reactivateProfilePath, reactivateSession);
    apiClient = new PhosraApiClient(() => authManager.getToken());
    windowManager = new WindowManager(
      chromePreloadPath,
      stealthPreloadPath,
      homePreloadPath,
      familyPreloadPath,
      reactivateProfilePath
    );
    windowManager.createWindow();
    windowManager.getTabManager().setCredentialManager(credentialManager);
    windowManager.getTabManager().setAuthManager(authManager);
    registerIpcHandlers(windowManager, profileManager, credentialManager, authManager, apiClient);
    const menu = buildApplicationMenu(windowManager);
    electron.Menu.setApplicationMenu(menu);
    windowManager.getTabManager().createTab(getInitialUrl());
  }
});
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    electron.app.quit();
  }
});
electron.app.on("open-url", (event, url) => {
  event.preventDefault();
  handleDeepLinkAuth(url);
});
const gotTheLock = electron.app.requestSingleInstanceLock();
if (!gotTheLock) {
  electron.app.quit();
} else {
  electron.app.on("second-instance", (_event, argv) => {
    const deepLink = argv.find((arg) => arg.startsWith("phosra-browser://"));
    if (deepLink) {
      handleDeepLinkAuth(deepLink);
    }
    if (windowManager && !windowManager.getWindow().isDestroyed()) {
      const win = windowManager.getWindow();
      if (win.isMinimized()) win.restore();
      win.focus();
    }
  });
}
function handleDeepLinkAuth(url) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "phosra-browser:") return;
    if (!authManager) return;
    const sessionToken = parsed.searchParams.get("session_token");
    const legacyJwt = parsed.searchParams.get("token");
    const email = parsed.searchParams.get("email") || void 0;
    if (sessionToken) {
      authManager.storeSessionToken(sessionToken, email);
      console.log("[DeepLink] Session token received and stored");
    } else if (legacyJwt) {
      authManager.storeToken(legacyJwt);
      console.log("[DeepLink] Legacy JWT received and stored");
    } else {
      return;
    }
    if (windowManager) {
      const chromeView = windowManager.getChromeView();
      if (chromeView && !chromeView.webContents.isDestroyed()) {
        chromeView.webContents.send("auth:status-changed", authManager.getInfo());
      }
    }
    if (windowManager && !windowManager.getWindow().isDestroyed()) {
      const win = windowManager.getWindow();
      if (win.isMinimized()) win.restore();
      win.focus();
    }
  } catch (err) {
    console.error("[DeepLink] Failed to handle auth URL:", err);
  }
}
function getInitialUrl() {
  const urlArg = process.argv.find((arg) => arg.startsWith("--url="));
  if (urlArg) {
    return urlArg.split("=").slice(1).join("=");
  }
  return "phosra://home";
}
