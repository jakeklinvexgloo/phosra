/**
 * CDP (Chrome DevTools Protocol) bridge utilities.
 *
 * Exposes the remote debugging port so that external tools (MCP server,
 * Playwright, Puppeteer, etc.) can connect to the running Electron browser
 * via the DevTools Protocol WebSocket endpoint.
 *
 * Security: A random auth token is generated at app startup and written to
 * ~/.phosra-browser/cdp-auth-token (mode 0600). Only processes that can read
 * that file (same user) are considered authorised CDP clients.
 */

import { app } from 'electron';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const DEFAULT_REMOTE_DEBUGGING_PORT = 9222;

// ---------------------------------------------------------------------------
// CDP Auth Token — generated once per app launch
// ---------------------------------------------------------------------------

const CDP_TOKEN_DIR = path.join(os.homedir(), '.phosra-browser');
const CDP_TOKEN_PATH = path.join(CDP_TOKEN_DIR, 'cdp-auth-token');

let cdpAuthToken: string | null = null;

/**
 * Generate a fresh CDP auth token and write it to disk.
 * Called once during app startup from index.ts.
 */
export function initCdpAuthToken(): string {
  cdpAuthToken = crypto.randomBytes(32).toString('hex');
  if (!fs.existsSync(CDP_TOKEN_DIR)) {
    fs.mkdirSync(CDP_TOKEN_DIR, { recursive: true, mode: 0o700 });
  }
  fs.writeFileSync(CDP_TOKEN_PATH, cdpAuthToken, { mode: 0o600 });
  console.log(`[CDP] Auth token written to ${CDP_TOKEN_PATH}`);
  return cdpAuthToken;
}

/**
 * Validate a candidate token against the current session token.
 * Uses timing-safe comparison to prevent side-channel attacks.
 */
export function validateCdpToken(candidate: string | undefined): boolean {
  if (!candidate || !cdpAuthToken) return false;
  const a = Buffer.from(candidate, 'utf8');
  const b = Buffer.from(cdpAuthToken, 'utf8');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

/** Returns the on-disk path where the CDP auth token is stored. */
export function getCdpTokenPath(): string {
  return CDP_TOKEN_PATH;
}

/**
 * Returns the remote debugging port that Electron was started with.
 *
 * The port is set via `--remote-debugging-port=NNNN` on the command line.
 * If no flag was provided, falls back to the default (9222).
 */
export function getRemoteDebuggingPort(): number {
  const flag = app.commandLine.getSwitchValue('remote-debugging-port');

  if (flag) {
    const parsed = parseInt(flag, 10);
    if (!isNaN(parsed) && parsed > 0 && parsed <= 65535) {
      return parsed;
    }
  }

  return DEFAULT_REMOTE_DEBUGGING_PORT;
}

/**
 * Returns the WebSocket URL for connecting to the CDP endpoint.
 *
 * Example: `ws://127.0.0.1:9222`
 */
export function getCdpUrl(): string {
  return `ws://127.0.0.1:${getRemoteDebuggingPort()}`;
}
