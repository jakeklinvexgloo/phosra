"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("phosraHome", {
  /** Retrieve the list of saved credentials (passwords are NOT included). */
  getCredentials: () => electron.ipcRenderer.invoke("credentials:list"),
  /** Navigate the active tab to the given URL. */
  navigateTo: (url) => electron.ipcRenderer.invoke("tab:navigate", url),
  /** Focus the address bar in the chrome UI. */
  focusAddressBar: () => electron.ipcRenderer.send("chrome:focus-address-bar"),
  /** Get recently used service URLs (returns empty array for v1). */
  getRecentServices: () => Promise.resolve([])
});
