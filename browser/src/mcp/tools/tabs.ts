import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { BrowserConnection } from '../server';

export function registerTabTools(server: McpServer, getBrowser: () => BrowserConnection | null) {
  function getConn() {
    const browser = getBrowser();
    if (!browser) throw new Error('Browser not connected');
    return browser;
  }

  server.tool(
    'browser_list_tabs',
    'List all open browser tabs',
    {},
    async () => {
      const conn = getConn();
      try {
        const targets = await conn.listTargets();
        const pages = targets.filter(
          (t) => t.type === 'page' && !t.url.startsWith('devtools://') && !t.url.startsWith('chrome-extension://')
        );

        if (pages.length === 0) {
          return { content: [{ type: 'text' as const, text: 'No tabs open' }] };
        }

        const lines = pages.map((t, i) => `${i + 1}. [${t.id}] ${t.title || '(untitled)'} — ${t.url}`);
        return { content: [{ type: 'text' as const, text: lines.join('\n') }] };
      } catch (err: any) {
        return { content: [{ type: 'text' as const, text: `Error: ${err.message}` }], isError: true };
      }
    }
  );

  server.tool(
    'browser_new_tab',
    'Open a new browser tab',
    {
      url: z.string().optional().describe('URL to open (defaults to about:blank)'),
    },
    async ({ url }) => {
      const conn = getConn();
      try {
        const result = await conn.send('Target.createTarget', {
          url: url || 'about:blank',
        }) as any;

        return { content: [{ type: 'text' as const, text: `New tab created: ${result.targetId}` }] };
      } catch (err: any) {
        return { content: [{ type: 'text' as const, text: `Error: ${err.message}` }], isError: true };
      }
    }
  );

  server.tool(
    'browser_close_tab',
    'Close a browser tab by target ID',
    {
      targetId: z.string().describe('The target ID of the tab to close'),
    },
    async ({ targetId }) => {
      const conn = getConn();
      try {
        await conn.send('Target.closeTarget', { targetId });
        return { content: [{ type: 'text' as const, text: `Closed tab ${targetId}` }] };
      } catch (err: any) {
        return { content: [{ type: 'text' as const, text: `Error: ${err.message}` }], isError: true };
      }
    }
  );

  server.tool(
    'browser_switch_tab',
    'Switch to a specific tab by target ID',
    {
      targetId: z.string().describe('The target ID of the tab to activate'),
    },
    async ({ targetId }) => {
      const conn = getConn();
      try {
        await conn.send('Target.activateTarget', { targetId });
        return { content: [{ type: 'text' as const, text: `Switched to tab ${targetId}` }] };
      } catch (err: any) {
        return { content: [{ type: 'text' as const, text: `Error: ${err.message}` }], isError: true };
      }
    }
  );
}
