/**
 * Application menu for macOS.
 *
 * Provides standard menu items (App, File, Edit, View, Window, Help) with
 * keyboard shortcuts.  Menu actions delegate to the WindowManager / TabManager.
 */

import { Menu, MenuItemConstructorOptions, app } from 'electron';
import { WindowManager } from './window-manager';

export function buildApplicationMenu(windowManager: WindowManager): Menu {
  const appName = app.name || 'Phosra Browser';

  const template: MenuItemConstructorOptions[] = [
    // ---- App menu (macOS) ----
    {
      label: appName,
      submenu: [
        { role: 'about', label: `About ${appName}` },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide', label: `Hide ${appName}` },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit', label: `Quit ${appName}` },
      ],
    },

    // ---- File menu ----
    {
      label: 'File',
      submenu: [
        {
          label: 'New Tab',
          accelerator: 'CmdOrCtrl+T',
          click: () => {
            windowManager.getTabManager().createTab();
          },
        },
        {
          label: 'Close Tab',
          accelerator: 'CmdOrCtrl+W',
          click: () => {
            const tabManager = windowManager.getTabManager();
            const activeTab = tabManager.getActiveTab();
            if (activeTab) {
              tabManager.closeTab(activeTab.id);
            }

            // If no tabs remain, close the window
            if (tabManager.getAllTabs().length === 0) {
              windowManager.getWindow().close();
            }
          },
        },
        {
          label: 'Close Window',
          accelerator: 'CmdOrCtrl+Shift+W',
          click: () => {
            windowManager.getWindow().close();
          },
        },
      ],
    },

    // ---- Edit menu ----
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' },
      ],
    },

    // ---- View menu ----
    {
      label: 'View',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            const activeTab = windowManager.getTabManager().getActiveTab();
            if (activeTab) {
              activeTab.view.webContents.reload();
            }
          },
        },
        {
          label: 'Force Reload',
          accelerator: 'CmdOrCtrl+Shift+R',
          click: () => {
            const activeTab = windowManager.getTabManager().getActiveTab();
            if (activeTab) {
              activeTab.view.webContents.reloadIgnoringCache();
            }
          },
        },
        {
          label: 'Toggle Developer Tools',
          accelerator: 'CmdOrCtrl+Alt+I',
          click: () => {
            const activeTab = windowManager.getTabManager().getActiveTab();
            if (activeTab) {
              activeTab.view.webContents.toggleDevTools();
            }
          },
        },
        { type: 'separator' },
        {
          label: 'Zoom In',
          accelerator: 'CmdOrCtrl+Plus',
          click: () => {
            const activeTab = windowManager.getTabManager().getActiveTab();
            if (activeTab) {
              const wc = activeTab.view.webContents;
              wc.setZoomLevel(wc.getZoomLevel() + 0.5);
            }
          },
        },
        {
          label: 'Zoom Out',
          accelerator: 'CmdOrCtrl+-',
          click: () => {
            const activeTab = windowManager.getTabManager().getActiveTab();
            if (activeTab) {
              const wc = activeTab.view.webContents;
              wc.setZoomLevel(wc.getZoomLevel() - 0.5);
            }
          },
        },
        {
          label: 'Reset Zoom',
          accelerator: 'CmdOrCtrl+0',
          click: () => {
            const activeTab = windowManager.getTabManager().getActiveTab();
            if (activeTab) {
              activeTab.view.webContents.setZoomLevel(0);
            }
          },
        },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },

    // ---- Window menu ----
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' },
      ],
    },

    // ---- Help menu ----
    {
      label: 'Help',
      submenu: [
        {
          label: `${appName} Help`,
          click: () => {
            windowManager.getTabManager().createTab('https://www.phosra.com');
          },
        },
      ],
    },
  ];

  return Menu.buildFromTemplate(template);
}
