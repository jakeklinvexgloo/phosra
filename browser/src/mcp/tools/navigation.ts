import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { BrowserConnection } from '../server';
import { getActivePageTarget } from '../transport';

export function registerNavigationTools(server: McpServer, getBrowser: () => BrowserConnection | null) {
  async function getPage() {
    const browser = getBrowser();
    if (!browser) throw new Error('Browser not connected');
    return getActivePageTarget(browser);
  }

  server.tool(
    'browser_goto',
    'Navigate to a URL in the active tab',
    { url: z.string().describe('The URL to navigate to') },
    async ({ url }) => {
      const page = await getPage();
      try {
        await page.send('Page.enable');
        await page.send('Page.navigate', { url });
        await page.send('Page.loadEventFired');
        page.close();
        return { content: [{ type: 'text' as const, text: `Navigated to ${url}` }] };
      } catch (err: any) {
        page.close();
        return { content: [{ type: 'text' as const, text: `Navigation error: ${err.message}` }], isError: true };
      }
    }
  );

  server.tool(
    'browser_back',
    'Go back in browser history',
    {},
    async () => {
      const page = await getPage();
      try {
        const history = await page.send('Page.getNavigationHistory') as any;
        if (history.currentIndex > 0) {
          const entry = history.entries[history.currentIndex - 1];
          await page.send('Page.navigateToHistoryEntry', { entryId: entry.id });
        }
        page.close();
        return { content: [{ type: 'text' as const, text: 'Navigated back' }] };
      } catch (err: any) {
        page.close();
        return { content: [{ type: 'text' as const, text: `Error: ${err.message}` }], isError: true };
      }
    }
  );

  server.tool(
    'browser_forward',
    'Go forward in browser history',
    {},
    async () => {
      const page = await getPage();
      try {
        const history = await page.send('Page.getNavigationHistory') as any;
        if (history.currentIndex < history.entries.length - 1) {
          const entry = history.entries[history.currentIndex + 1];
          await page.send('Page.navigateToHistoryEntry', { entryId: entry.id });
        }
        page.close();
        return { content: [{ type: 'text' as const, text: 'Navigated forward' }] };
      } catch (err: any) {
        page.close();
        return { content: [{ type: 'text' as const, text: `Error: ${err.message}` }], isError: true };
      }
    }
  );

  server.tool(
    'browser_reload',
    'Reload the current page',
    { ignoreCache: z.boolean().optional().describe('Whether to ignore cache') },
    async ({ ignoreCache }) => {
      const page = await getPage();
      try {
        await page.send('Page.reload', { ignoreCache: ignoreCache ?? false });
        page.close();
        return { content: [{ type: 'text' as const, text: 'Page reloaded' }] };
      } catch (err: any) {
        page.close();
        return { content: [{ type: 'text' as const, text: `Error: ${err.message}` }], isError: true };
      }
    }
  );

  server.tool(
    'browser_get_url',
    'Get the current page URL',
    {},
    async () => {
      const page = await getPage();
      try {
        const result = await page.send('Runtime.evaluate', {
          expression: 'window.location.href',
          returnByValue: true,
        }) as any;
        page.close();
        return { content: [{ type: 'text' as const, text: result.result.value }] };
      } catch (err: any) {
        page.close();
        return { content: [{ type: 'text' as const, text: `Error: ${err.message}` }], isError: true };
      }
    }
  );

  server.tool(
    'browser_wait_for',
    'Wait for an element or text to appear on the page',
    {
      selector: z.string().optional().describe('CSS selector to wait for'),
      text: z.string().optional().describe('Text content to wait for'),
      timeout: z.number().optional().describe('Timeout in milliseconds (default 30000)'),
    },
    async ({ selector, text, timeout }) => {
      const page = await getPage();
      const ms = timeout ?? 30000;
      const startTime = Date.now();
      const pollInterval = 200;

      try {
        await page.send('Runtime.enable');

        while (Date.now() - startTime < ms) {
          let found = false;

          if (selector) {
            const result = await page.send('Runtime.evaluate', {
              expression: `!!document.querySelector(${JSON.stringify(selector)})`,
              returnByValue: true,
            }) as any;
            found = result.result.value === true;
          } else if (text) {
            const result = await page.send('Runtime.evaluate', {
              expression: `document.body && document.body.innerText.includes(${JSON.stringify(text)})`,
              returnByValue: true,
            }) as any;
            found = result.result.value === true;
          } else {
            page.close();
            return { content: [{ type: 'text' as const, text: 'Must specify either selector or text' }], isError: true };
          }

          if (found) {
            page.close();
            return { content: [{ type: 'text' as const, text: `Found ${selector ? `selector "${selector}"` : `text "${text}"`}` }] };
          }

          await new Promise((resolve) => setTimeout(resolve, pollInterval));
        }

        page.close();
        return { content: [{ type: 'text' as const, text: `Timeout waiting for ${selector ? `selector "${selector}"` : `text "${text}"`}` }], isError: true };
      } catch (err: any) {
        page.close();
        return { content: [{ type: 'text' as const, text: `Error: ${err.message}` }], isError: true };
      }
    }
  );
}
