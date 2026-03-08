"use strict";
const evasionPaths = [
  "../stealth/evasions/sourceurl",
  "../stealth/evasions/navigator-webdriver",
  "../stealth/evasions/chrome-runtime",
  "../stealth/evasions/chrome-app",
  "../stealth/evasions/chrome-csi",
  "../stealth/evasions/chrome-load-times",
  "../stealth/evasions/permissions-api",
  "../stealth/evasions/plugins-mimetypes",
  "../stealth/evasions/webgl-vendor",
  "../stealth/evasions/canvas-noise",
  "../stealth/evasions/audio-context",
  "../stealth/evasions/user-agent",
  "../stealth/evasions/iframe-content-window",
  "../stealth/evasions/media-codecs",
  "../stealth/evasions/navigator-languages",
  "../stealth/evasions/navigator-vendor",
  "../stealth/evasions/window-dimensions"
];
for (const p of evasionPaths) {
  try {
    const mod = require(p);
    const fn = mod.default || mod;
    if (typeof fn === "function") fn();
  } catch {
  }
}
