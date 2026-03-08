/**
 * Home page preload script (phosra://home).
 *
 * Runs in the home page WebContentsView with `contextIsolation: true`.
 * Exposes a `phosraHome` API on the window object via contextBridge,
 * allowing the home page UI to interact with credentials, navigation,
 * and browser chrome features.
 */

import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('phosraHome', {
  /** Retrieve the list of saved credentials (passwords are NOT included). */
  getCredentials: () => ipcRenderer.invoke('credentials:list'),

  /** Navigate the active tab to the given URL. */
  navigateTo: (url: string) => ipcRenderer.invoke('tab:navigate', url),

  /** Focus the address bar in the chrome UI. */
  focusAddressBar: () => ipcRenderer.send('chrome:focus-address-bar'),

  /** Get recently used service URLs (returns empty array for v1). */
  getRecentServices: () => Promise.resolve([]),
});
