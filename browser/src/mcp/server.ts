import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerNavigationTools } from './tools/navigation';
import { registerInteractionTools } from './tools/interaction';
import { registerDomTools } from './tools/dom';
import { registerTabTools } from './tools/tabs';
import { registerSessionTools } from './tools/session';
import { registerPageStateTools } from './tools/page-state';

export interface BrowserConnection {
  send: (method: string, params?: Record<string, unknown>) => Promise<unknown>;
  on: (event: string, callback: (params: unknown) => void) => void;
  listTargets: () => Promise<Array<{ id: string; type: string; title: string; url: string; webSocketDebuggerUrl?: string }>>;
  connectToTarget: (targetId: string) => Promise<BrowserConnection>;
  close: () => void;
}

export function createMcpServer(getBrowser: () => BrowserConnection | null): McpServer {
  const server = new McpServer({
    name: 'phosra-browser',
    version: '0.1.0',
  });

  registerNavigationTools(server, getBrowser);
  registerInteractionTools(server, getBrowser);
  registerDomTools(server, getBrowser);
  registerTabTools(server, getBrowser);
  registerSessionTools(server, getBrowser);
  registerPageStateTools(server, getBrowser);

  return server;
}
