#!/usr/bin/env node

/**
 * MCP transport for Phosra Browser.
 * Runs as a standalone Node process, connects to the browser via CDP,
 * and exposes MCP tools over stdio.
 */

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import CDP from 'chrome-remote-interface';
import { createMcpServer, BrowserConnection } from './server';

const CDP_PORT = parseInt(process.env.PHOSRA_CDP_PORT || '9222', 10);

let browserConnection: BrowserConnection | null = null;

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

  return connection;
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
  try {
    browserConnection = await connectToBrowser();
    console.error(`[phosra-mcp] Connected to browser on CDP port ${CDP_PORT}`);
  } catch (err) {
    console.error(`[phosra-mcp] Warning: Could not connect to browser on port ${CDP_PORT}. Tools will fail until browser is available.`);
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
