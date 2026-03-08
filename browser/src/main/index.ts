/**
 * Phosra Browser — Electron main process entry point.
 *
 * Startup sequence:
 * 1. Apply Chromium stealth flags before the browser process launches
 * 2. Configure remote debugging port for CDP/MCP access
 * 3. On app ready:
 *    a. Initialise ProfileManager (creates default profile)
 *    b. Build WindowManager with chrome UI and stealth preload paths
 *    c. Register IPC handlers
 *    d. Set application menu
 *    e. Open initial tab
 * 4. Handle macOS lifecycle (activate, window-all-closed)
 */

import { app, Menu, protocol, session, net, shell } from 'electron';
import * as path from 'path';
import { getStealthFlags } from './stealth-flags';
import { ProfileManager } from './profile-manager';
import { WindowManager } from './window-manager';
import { registerIpcHandlers } from './ipc-handlers';
import { buildApplicationMenu } from './menu';
import { getRemoteDebuggingPort } from './cdp-bridge';
import { CredentialManager } from './credential-manager';
import { AuthManager } from './auth-manager';
import { PhosraApiClient } from './phosra-api';
import { startAgentDebugServer } from './agent-logger';

// -------------------------------------------------------------------
// 1. Apply stealth CLI flags (must happen before app.whenReady)
// -------------------------------------------------------------------

const stealthFlags = getStealthFlags();
for (const flag of stealthFlags) {
  const eqIndex = flag.indexOf('=');
  if (eqIndex > 0) {
    const key = flag.substring(0, eqIndex);
    const value = flag.substring(eqIndex + 1);
    app.commandLine.appendSwitch(key, value);
  } else {
    app.commandLine.appendSwitch(flag);
  }
}

// -------------------------------------------------------------------
// 2. Remote debugging port
// -------------------------------------------------------------------

// Allow overriding via CLI argument: --cdp-port=NNNN
const cdpPortArg = process.argv.find((arg) => arg.startsWith('--cdp-port='));
const cdpPort = cdpPortArg
  ? parseInt(cdpPortArg.split('=')[1], 10) || 9222
  : 9222;

// Set the Chromium remote debugging port
app.commandLine.appendSwitch('remote-debugging-port', String(cdpPort));

// -------------------------------------------------------------------
// 2b. Agent debug server (--agent-debug / --agent-debug-port=NNNN)
// -------------------------------------------------------------------

const agentDebugEnabled = process.argv.some((arg) => arg.startsWith('--agent-debug'));
const agentDebugPortArg = process.argv.find((arg) => arg.startsWith('--agent-debug-port='));
const agentDebugPort = agentDebugPortArg
  ? parseInt(agentDebugPortArg.split('=')[1], 10) || 9333
  : 9333;

if (agentDebugEnabled) {
  startAgentDebugServer(agentDebugPort);
}

// -------------------------------------------------------------------
// 3. Register phosra:// as a privileged scheme (must happen before app.ready)
// -------------------------------------------------------------------

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'phosra',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: false,
    },
  },
]);

// Register phosra-browser:// as the default protocol client for deep-link auth.
// After Google OAuth in the system browser, phosra.com redirects to
// phosra-browser://auth?token=JWT, which macOS opens in this app.
app.setAsDefaultProtocolClient('phosra-browser');

// -------------------------------------------------------------------
// 4. Resolve preload paths
// -------------------------------------------------------------------

// In dev, compiled preloads live in dist/preload/.
// In production, they are bundled relative to __dirname.
const chromePreloadPath = path.join(__dirname, '..', 'preload', 'chrome-ui-preload.js');
const stealthPreloadPath = path.join(__dirname, '..', 'preload', 'stealth-preload.js');
const homePreloadPath = path.join(__dirname, '..', 'preload', 'home-preload.js');
const familyPreloadPath = path.join(__dirname, '..', 'preload', 'family-preload.js');

// -------------------------------------------------------------------
// 5. App lifecycle
// -------------------------------------------------------------------

let windowManager: WindowManager | null = null;
let profileManager: ProfileManager | null = null;
let credentialManager: CredentialManager | null = null;
let authManager: AuthManager | null = null;
let apiClient: PhosraApiClient | null = null;

// Clean Chrome User-Agent string (strips Electron and app name)
const CHROME_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';

app.whenReady().then(() => {
  // Override the default session user agent to hide Electron
  session.defaultSession.setUserAgent(CHROME_UA);

  // ---- Register phosra:// protocol handler ----
  // In dev: proxy to the Vite dev server (phosra://home -> http://localhost:PORT/home/index.html)
  // In prod: serve files from dist/home/ on disk
  const isDevMode = !!process.env.VITE_DEV_SERVER_URL;
  const distDir = path.join(__dirname, '..');   // dist/
  const homeDir = path.join(distDir, 'home');
  const familyDir = path.join(distDir, 'family');

  const phosraHandler = (request: GlobalRequest): Response | Promise<Response> => {
    const url = new URL(request.url);
    // url.hostname is the phosra:// host (e.g. "home", "family")
    const host = url.hostname;

    if (isDevMode && process.env.VITE_DEV_SERVER_URL) {
      const devBase = process.env.VITE_DEV_SERVER_URL.replace(/\/$/, '');
      let devPath: string;

      // Determine the page directory based on host
      const pageDir = host === 'family' ? 'family' : 'home';

      if (url.pathname === '/' || url.pathname === '') {
        devPath = `/${pageDir}/index.html`;
      } else if (url.pathname.startsWith('/@') || url.pathname.startsWith('/home/') || url.pathname.startsWith('/family/') || url.pathname.startsWith('/node_modules/')) {
        // Vite internal paths (@vite/client, @react-refresh, @fs/...) and
        // module imports already resolved by Vite — pass through directly
        devPath = url.pathname;
      } else {
        // Relative paths from HTML (e.g. ./index.tsx -> /index.tsx)
        // need page prefix since Vite root is src/
        devPath = `/${pageDir}${url.pathname}`;
      }
      const fetchUrl = `${devBase}${devPath}`;
      return net.fetch(fetchUrl);
    }

    // Production: The built pages reference JS/CSS via ../assets/
    // relative paths. The browser resolves ../assets/foo.js from phosra://home/
    // to phosra://home/assets/foo.js (pathname=/assets/foo.js). These assets
    // live in dist/assets/, so we serve non-page paths from dist/ directly.
    const pageDistDir = host === 'family' ? familyDir : homeDir;

    let filePath: string;
    if (url.pathname === '/' || url.pathname === '') {
      filePath = path.join(pageDistDir, 'index.html');
    } else {
      const safePath = path.normalize(url.pathname).replace(/^(\.\.[\/\\])+/, '');
      const resolved = path.join(distDir, safePath);
      // Security: ensure the resolved path stays within dist/
      if (!resolved.startsWith(distDir)) {
        return new Response('Forbidden', { status: 403 });
      }
      filePath = resolved;
    }
    return net.fetch(`file://${filePath}`);
  };

  // Register on the default session
  protocol.handle('phosra', phosraHandler);

  // a. Profile manager
  profileManager = new ProfileManager();
  const defaultProfilePath = profileManager.getDefaultProfilePath();

  // Register protocol handler on the profile's session partition
  // (tabs use persist:<profileName> sessions, not the default session)
  const profileName = path.basename(defaultProfilePath);
  const profileSession = session.fromPartition(`persist:${profileName}`, { cache: true });
  profileSession.protocol.handle('phosra', phosraHandler);

  // Fix: Ensure requests to phosra.com include proper Origin header.
  // Without this, Electron sends null Origin which Stytch SDK rejects.
  profileSession.webRequest.onBeforeSendHeaders(
    { urls: ['https://*.phosra.com/*', 'https://phosra.com/*'] },
    (details, callback) => {
      const headers = { ...details.requestHeaders };
      if (!headers['Origin'] && !headers['origin']) {
        headers['Origin'] = 'https://www.phosra.com';
      }
      if (!headers['Referer'] && !headers['referer']) {
        headers['Referer'] = 'https://www.phosra.com/';
      }
      callback({ requestHeaders: headers });
    },
  );

  // b. Credential manager (backed by OS keychain)
  credentialManager = new CredentialManager(defaultProfilePath);

  // b2. Auth manager (Phosra JWT, backed by OS keychain)
  authManager = new AuthManager(defaultProfilePath, profileSession);

  // b3. Phosra API client
  apiClient = new PhosraApiClient(() => authManager!.getToken()); // getToken() is now async

  // c. Window manager
  windowManager = new WindowManager(chromePreloadPath, stealthPreloadPath, homePreloadPath, familyPreloadPath, defaultProfilePath);
  windowManager.createWindow();

  // Wire credential manager into tab manager for auto-fill
  windowManager.getTabManager().setCredentialManager(credentialManager);

  // Wire auth manager into tab manager for token capture on phosra.com login
  windowManager.getTabManager().setAuthManager(authManager);

  // d. IPC handlers
  registerIpcHandlers(windowManager, profileManager, credentialManager, authManager, apiClient);

  // d. Application menu
  const menu = buildApplicationMenu(windowManager);
  Menu.setApplicationMenu(menu);

  // e. Initial tab
  const initialUrl = getInitialUrl();
  windowManager.getTabManager().createTab(initialUrl);

  console.log(`[Phosra Browser] Ready`);
  console.log(`[Phosra Browser] CDP port: ${getRemoteDebuggingPort()}`);
  console.log(`[Phosra Browser] Profile: ${defaultProfilePath}`);
});

// macOS: re-create window when dock icon is clicked and no windows exist
app.on('activate', () => {
  if (windowManager && !windowManager.getWindow().isDestroyed()) {
    windowManager.getWindow().show();
  } else if (profileManager) {
    const reactivateProfilePath = profileManager.getDefaultProfilePath();
    credentialManager = new CredentialManager(reactivateProfilePath);

    const reactivateProfileName = path.basename(reactivateProfilePath);
    const reactivateSession = session.fromPartition(`persist:${reactivateProfileName}`, { cache: true });
    authManager = new AuthManager(reactivateProfilePath, reactivateSession);
    apiClient = new PhosraApiClient(() => authManager!.getToken()); // getToken() is now async

    windowManager = new WindowManager(
      chromePreloadPath,
      stealthPreloadPath,
      homePreloadPath,
      familyPreloadPath,
      reactivateProfilePath,
    );
    windowManager.createWindow();
    windowManager.getTabManager().setCredentialManager(credentialManager);
    windowManager.getTabManager().setAuthManager(authManager);
    registerIpcHandlers(windowManager, profileManager, credentialManager, authManager, apiClient);

    const menu = buildApplicationMenu(windowManager);
    Menu.setApplicationMenu(menu);

    windowManager.getTabManager().createTab(getInitialUrl());
  }
});

// Quit when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// -------------------------------------------------------------------
// Deep-link auth: phosra-browser://auth?token=JWT
// macOS delivers custom protocol URLs via the 'open-url' event.
// -------------------------------------------------------------------

app.on('open-url', (event, url) => {
  event.preventDefault();
  handleDeepLinkAuth(url);
});

// On Windows/Linux, the URL comes as a CLI argument to a second instance.
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (_event, argv) => {
    // The deep-link URL is the last argument
    const deepLink = argv.find((arg) => arg.startsWith('phosra-browser://'));
    if (deepLink) {
      handleDeepLinkAuth(deepLink);
    }
    // Focus the existing window
    if (windowManager && !windowManager.getWindow().isDestroyed()) {
      const win = windowManager.getWindow();
      if (win.isMinimized()) win.restore();
      win.focus();
    }
  });
}

function handleDeepLinkAuth(url: string): void {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'phosra-browser:') return;
    if (!authManager) return;

    // Prefer session_token (long-lived, can be refreshed)
    const sessionToken = parsed.searchParams.get('session_token');
    const legacyJwt = parsed.searchParams.get('token');
    const email = parsed.searchParams.get('email') || undefined;

    if (sessionToken) {
      authManager.storeSessionToken(sessionToken, email);
      console.log('[DeepLink] Session token received and stored');
    } else if (legacyJwt) {
      authManager.storeToken(legacyJwt);
      console.log('[DeepLink] Legacy JWT received and stored');
    } else {
      return;
    }

    // Push status change to chrome UI
    if (windowManager) {
      const chromeView = windowManager.getChromeView();
      if (chromeView && !chromeView.webContents.isDestroyed()) {
        chromeView.webContents.send('auth:status-changed', authManager.getInfo());
      }
    }

    // Focus the window
    if (windowManager && !windowManager.getWindow().isDestroyed()) {
      const win = windowManager.getWindow();
      if (win.isMinimized()) win.restore();
      win.focus();
    }
  } catch (err) {
    console.error('[DeepLink] Failed to handle auth URL:', err);
  }
}

// -------------------------------------------------------------------
// Helpers
// -------------------------------------------------------------------

/**
 * Parse an initial URL from CLI arguments.
 * Usage: phosra-browser --url=https://example.com
 */
function getInitialUrl(): string {
  const urlArg = process.argv.find((arg) => arg.startsWith('--url='));
  if (urlArg) {
    return urlArg.split('=').slice(1).join('='); // handle URLs with = in them
  }
  return 'phosra://home';
}
