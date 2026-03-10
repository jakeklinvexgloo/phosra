#!/usr/bin/env node

/**
 * MCP transport for Phosra Browser.
 * Runs as a standalone Node process, connects to the browser via CDP,
 * and exposes MCP tools over stdio.
 */

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import CDP from 'chrome-remote-interface';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createMcpServer, BrowserConnection } from './server';

const CDP_PORT = parseInt(process.env.PHOSRA_CDP_PORT || '9222', 10);

// ---------------------------------------------------------------------------
// CDP Authentication Token — read from disk (written by Electron main process)
// ---------------------------------------------------------------------------

const CDP_TOKEN_PATH = path.join(os.homedir(), '.phosra-browser', 'cdp-auth-token');

/**
 * Read the CDP auth token that the Electron main process wrote at startup.
 * Returns undefined if the file doesn't exist yet (browser not running).
 */
function readCdpToken(): string | undefined {
  try {
    return fs.readFileSync(CDP_TOKEN_PATH, 'utf8').trim();
  } catch {
    console.error(`[phosra-mcp] Could not read CDP auth token from ${CDP_TOKEN_PATH}`);
    return undefined;
  }
}

// ---------------------------------------------------------------------------
// Connection Pool — persistent CDP connection with auto-reconnect
// ---------------------------------------------------------------------------

let browserConnection: BrowserConnection | null = null;
let reconnecting = false;

async function connectToBrowser(): Promise<BrowserConnection> {
  const client = await CDP({ port: CDP_PORT });

  const connection: BrowserConnection = {
    send: async (method: string, params?: Record<string, unknown>) => {
      return (client as any).send(method, params);
    },
    on: (event: string, callback: (params: unknown) => void) => {
      (client as any).on(event, callback);
    },
    listTargets: async () => {
      const targets = await CDP.List({ port: CDP_PORT });
      return targets.map((t: any) => ({
        id: t.id,
        type: t.type,
        title: t.title,
        url: t.url,
        webSocketDebuggerUrl: t.webSocketDebuggerUrl,
      }));
    },
    connectToTarget: async (targetId: string) => {
      const targetClient = await CDP({ port: CDP_PORT, target: targetId });
      return {
        send: async (method: string, params?: Record<string, unknown>) => {
          return (targetClient as any).send(method, params);
        },
        on: (event: string, callback: (params: unknown) => void) => {
          (targetClient as any).on(event, callback);
        },
        listTargets: connection.listTargets,
        connectToTarget: connection.connectToTarget,
        close: () => (targetClient as any).close(),
      };
    },
    close: () => (client as any).close(),
  };

  // Listen for disconnect to trigger automatic reconnection
  (client as any).on('disconnect', () => {
    console.error('[phosra-mcp] CDP connection lost, scheduling reconnect…');
    browserConnection = null;
    scheduleReconnect();
  });

  return connection;
}

function scheduleReconnect(): void {
  if (reconnecting) return;
  reconnecting = true;

  const MAX_RETRIES = 10;
  const BASE_DELAY_MS = 500;
  let attempt = 0;

  const tryReconnect = async () => {
    attempt++;
    try {
      browserConnection = await connectToBrowser();
      reconnecting = false;
      console.error(`[phosra-mcp] Reconnected to browser on attempt ${attempt}`);
    } catch {
      if (attempt >= MAX_RETRIES) {
        reconnecting = false;
        console.error(`[phosra-mcp] Failed to reconnect after ${MAX_RETRIES} attempts. Tools will fail until browser is available.`);
        return;
      }
      const delay = Math.min(BASE_DELAY_MS * 2 ** (attempt - 1), 10_000);
      console.error(`[phosra-mcp] Reconnect attempt ${attempt} failed, retrying in ${delay}ms…`);
      setTimeout(tryReconnect, delay);
    }
  };

  setTimeout(tryReconnect, BASE_DELAY_MS);
}

async function getActivePageTarget(conn: BrowserConnection): Promise<BrowserConnection> {
  const targets = await conn.listTargets();
  const pageTarget = targets.find(
    (t) => t.type === 'page' && !t.url.startsWith('devtools://') && !t.url.startsWith('chrome-extension://')
  );
  if (!pageTarget) {
    throw new Error('No active page target found. Is the browser running with a tab open?');
  }
  return conn.connectToTarget(pageTarget.id);
}

function getBrowser(): BrowserConnection | null {
  return browserConnection;
}

async function main() {
  // Read auth token written by the Electron main process
  const token = readCdpToken();
  if (token) {
    console.error('[phosra-mcp] CDP auth token loaded from disk');
  } else {
    console.error('[phosra-mcp] Warning: No CDP auth token found — browser may not be running yet');
  }

  try {
    browserConnection = await connectToBrowser();
    console.error(`[phosra-mcp] Connected to browser on CDP port ${CDP_PORT}`);
  } catch (err) {
    console.error(`[phosra-mcp] Warning: Could not connect to browser on port ${CDP_PORT}. Tools will fail until browser is available.`);
    scheduleReconnect();
  }

  const server = createMcpServer(getBrowser);
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('[phosra-mcp] MCP server running on stdio');
}

main().catch((err) => {
  console.error('[phosra-mcp] Fatal error:', err);
  process.exit(1);
});

export { getActivePageTarget };
