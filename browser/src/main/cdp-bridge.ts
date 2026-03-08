/**
 * CDP (Chrome DevTools Protocol) bridge utilities.
 *
 * Exposes the remote debugging port so that external tools (MCP server,
 * Playwright, Puppeteer, etc.) can connect to the running Electron browser
 * via the DevTools Protocol WebSocket endpoint.
 */

import { app } from 'electron';

const DEFAULT_REMOTE_DEBUGGING_PORT = 9222;

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
