/**
 * Window manager — owns the BaseWindow, the chrome UI view, and the TabManager.
 *
 * Layout:
 * ┌──────────────────────────────────┐
 * │  Chrome UI (WebContentsView)     │ ← 112 px
 * ├──────────────────────────────────┤
 * │                                  │
 * │  Active Tab (WebContentsView)    │ ← fills remainder
 * │                                  │
 * └──────────────────────────────────┘
 */

import { BaseWindow, WebContentsView } from 'electron';
import * as path from 'path';
import { TabManager } from './tab-manager';

const CHROME_HEIGHT = 130;
const DEFAULT_WIDTH = 1280;
const DEFAULT_HEIGHT = 900;

export class WindowManager {
  private window!: BaseWindow;
  private chromeView!: WebContentsView;
  private tabManager!: TabManager;
  private currentChromeHeight = CHROME_HEIGHT;
  private isExpanded = false;

  private readonly chromePreloadPath: string;
  private readonly stealthPreloadPath: string;
  private readonly homePreloadPath: string;
  private readonly familyPreloadPath: string;
  private readonly profilePath: string;

  constructor(
    chromePreloadPath: string,
    stealthPreloadPath: string,
    homePreloadPath: string,
    familyPreloadPath: string,
    profilePath: string,
  ) {
    this.chromePreloadPath = chromePreloadPath;
    this.stealthPreloadPath = stealthPreloadPath;
    this.homePreloadPath = homePreloadPath;
    this.familyPreloadPath = familyPreloadPath;
    this.profilePath = profilePath;
  }

  /**
   * Build the window, chrome UI view, and tab manager.
   * Call this once after construction.
   */
  createWindow(): void {
    // ---- BaseWindow ----
    this.window = new BaseWindow({
      width: DEFAULT_WIDTH,
      height: DEFAULT_HEIGHT,
      minWidth: 480,
      minHeight: 360,
      titleBarStyle: 'hiddenInset',
      show: false, // show after chrome view is ready
    });

    // ---- Chrome UI view ----
    this.chromeView = new WebContentsView({
      webPreferences: {
        preload: this.chromePreloadPath,
        contextIsolation: true,
        nodeIntegration: false,
      },
    });

    this.window.contentView.addChildView(this.chromeView);
    this.chromeView.setBounds({
      x: 0,
      y: 0,
      width: DEFAULT_WIDTH,
      height: CHROME_HEIGHT,
    });

    // Load the chrome UI renderer
    this.loadChromeUI();

    // ---- TabManager ----
    this.tabManager = new TabManager(
      this.window,
      this.stealthPreloadPath,
      this.homePreloadPath,
      this.familyPreloadPath,
      this.profilePath,
      CHROME_HEIGHT,
    );
    this.tabManager.setChromeView(this.chromeView);

    // ---- Resize handling ----
    this.window.on('resize', () => {
      this.relayout();
    });

    // Show window once the chrome view has painted
    this.chromeView.webContents.on('did-finish-load', () => {
      if (!this.window.isDestroyed()) {
        this.window.show();
      }
    });
  }

  getWindow(): BaseWindow {
    return this.window;
  }

  getTabManager(): TabManager {
    return this.tabManager;
  }

  getChromeView(): WebContentsView {
    return this.chromeView;
  }

  /** Expand or collapse the chrome view to allow dropdowns to overflow. */
  setChromeExpanded(expanded: boolean): void {
    if (this.window.isDestroyed()) return;
    this.isExpanded = expanded;
    const bounds = this.window.getBounds();

    if (expanded) {
      // Start at full window height so content can render and ResizeObserver
      // can measure it. The observer will then shrink to the actual content size.
      this.currentChromeHeight = bounds.height;
      // Bring chrome view to top of z-order so it overlays tab content
      this.window.contentView.addChildView(this.chromeView);
    } else {
      // Reset to collapsed height
      this.currentChromeHeight = CHROME_HEIGHT;
      // Move chrome view behind tab views so tabs receive input
      this.window.contentView.removeChildView(this.chromeView);
      this.window.contentView.addChildView(this.chromeView, 0);
    }

    this.chromeView.setBounds({
      x: 0,
      y: 0,
      width: bounds.width,
      height: expanded ? bounds.height : CHROME_HEIGHT,
    });
  }

  /** Dynamically set the chrome view height (called from renderer via IPC). */
  setChromeHeight(height: number): void {
    if (this.window.isDestroyed()) return;
    const bounds = this.window.getBounds();
    const clamped = Math.max(CHROME_HEIGHT, Math.min(height, bounds.height));
    this.currentChromeHeight = clamped;

    if (this.isExpanded) {
      this.chromeView.setBounds({
        x: 0,
        y: 0,
        width: bounds.width,
        height: clamped,
      });
    }
  }

  /**
   * Inset the active tab from the right edge to make room for a drawer panel.
   * Pass `{ right: 0 }` to restore full width.
   */
  setTabInset(inset: { right: number }): void {
    if (this.window.isDestroyed()) return;
    this.tabManager.setRightInset(inset.right);
    this.tabManager.updateLayout(this.getWindowBounds());
  }

  private getWindowBounds(): { width: number; height: number } {
    const bounds = this.window.getBounds();
    return { width: bounds.width, height: bounds.height };
  }

  // -------------------------------------------------------------------
  // Private helpers
  // -------------------------------------------------------------------

  private loadChromeUI(): void {
    const isDev = process.env.NODE_ENV !== 'production' || !!process.env.VITE_DEV_SERVER_URL;

    if (isDev && process.env.VITE_DEV_SERVER_URL) {
      // In dev mode the Vite dev server serves the renderer
      // Root is src/, so renderer entry is at /renderer/index.html
      const devUrl = process.env.VITE_DEV_SERVER_URL.replace(/\/$/, '') + '/renderer/index.html';
      this.chromeView.webContents
        .loadURL(devUrl)
        .catch((err: Error) => {
          console.error('[WindowManager] Failed to load Vite dev server:', err.message);
        });
    } else {
      // In production load the built HTML from dist/renderer
      const indexPath = path.join(__dirname, '..', 'renderer', 'index.html');
      this.chromeView.webContents
        .loadFile(indexPath)
        .catch((err: Error) => {
          console.error('[WindowManager] Failed to load renderer HTML:', err.message);
        });
    }
  }

  private relayout(): void {
    if (this.window.isDestroyed()) return;
    const bounds = this.window.getBounds();

    // Resize chrome bar — preserve expanded height if expanded
    const chromeH = this.isExpanded
      ? Math.min(this.currentChromeHeight, bounds.height)
      : CHROME_HEIGHT;
    this.chromeView.setBounds({
      x: 0,
      y: 0,
      width: bounds.width,
      height: chromeH,
    });

    // Resize active tab
    this.tabManager.updateLayout({
      width: bounds.width,
      height: bounds.height,
    });
  }
}
