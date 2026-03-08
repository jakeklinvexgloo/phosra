import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { BrowserConnection } from '../server';
import { getActivePageTarget } from '../transport';

export function registerDomTools(server: McpServer, getBrowser: () => BrowserConnection | null) {
  async function getPage() {
    const browser = getBrowser();
    if (!browser) throw new Error('Browser not connected');
    return getActivePageTarget(browser);
  }

  server.tool(
    'browser_snapshot',
    'Get a structured accessibility snapshot of all interactive elements on the page',
    {},
    async () => {
      const page = await getPage();
      try {
        await page.send('Accessibility.enable');
        const tree = await page.send('Accessibility.getFullAXTree') as any;
        page.close();

        // Flatten to interactive elements
        const interactive: string[] = [];
        const nodes = tree.nodes || [];

        for (const node of nodes) {
          const role = node.role?.value;
          const name = node.name?.value;
          const value = node.value?.value;
          const desc = node.description?.value;

          if (!role || role === 'none' || role === 'generic') continue;

          const interactiveRoles = [
            'button', 'link', 'textbox', 'checkbox', 'radio', 'combobox',
            'menuitem', 'tab', 'switch', 'slider', 'spinbutton', 'searchbox',
            'option', 'menuitemcheckbox', 'menuitemradio',
          ];

          if (interactiveRoles.includes(role) || node.focused?.value) {
            let line = `[${role}]`;
            if (name) line += ` "${name}"`;
            if (value) line += ` value="${value}"`;
            if (desc) line += ` (${desc})`;
            if (node.focused?.value) line += ' *focused*';
            interactive.push(line);
          }
        }

        const output = interactive.length > 0
          ? interactive.join('\n')
          : 'No interactive elements found on the page';

        return { content: [{ type: 'text' as const, text: output }] };
      } catch (err: any) {
        page.close();
        return { content: [{ type: 'text' as const, text: `Error: ${err.message}` }], isError: true };
      }
    }
  );

  server.tool(
    'browser_query_selector',
    'Find elements matching a CSS selector and return their text content',
    {
      selector: z.string().describe('CSS selector'),
      limit: z.number().optional().describe('Maximum number of results (default 10)'),
    },
    async ({ selector, limit }) => {
      const page = await getPage();
      const maxResults = limit ?? 10;

      try {
        const result = await page.send('Runtime.evaluate', {
          expression: `(() => {
            const els = document.querySelectorAll(${JSON.stringify(selector)});
            const results = [];
            for (let i = 0; i < Math.min(els.length, ${maxResults}); i++) {
              const el = els[i];
              results.push({
                tag: el.tagName.toLowerCase(),
                text: el.textContent?.trim().slice(0, 200) || '',
                id: el.id || undefined,
                className: el.className || undefined,
                href: el.getAttribute('href') || undefined,
              });
            }
            return { total: els.length, results };
          })()`,
          returnByValue: true,
        }) as any;

        page.close();
        const data = result.result.value;
        if (!data || data.total === 0) {
          return { content: [{ type: 'text' as const, text: `No elements found matching "${selector}"` }] };
        }

        const lines = data.results.map((el: any, i: number) => {
          let line = `${i + 1}. <${el.tag}`;
          if (el.id) line += ` id="${el.id}"`;
          if (el.className) line += ` class="${el.className}"`;
          if (el.href) line += ` href="${el.href}"`;
          line += `>`;
          if (el.text) line += ` "${el.text}"`;
          return line;
        });

        return {
          content: [{ type: 'text' as const, text: `Found ${data.total} elements (showing ${data.results.length}):\n${lines.join('\n')}` }],
        };
      } catch (err: any) {
        page.close();
        return { content: [{ type: 'text' as const, text: `Error: ${err.message}` }], isError: true };
      }
    }
  );

  server.tool(
    'browser_get_text',
    'Extract text content from an element or the entire page',
    {
      selector: z.string().optional().describe('CSS selector (defaults to body)'),
    },
    async ({ selector }) => {
      const page = await getPage();
      const sel = selector || 'body';

      try {
        const result = await page.send('Runtime.evaluate', {
          expression: `(() => {
            const el = document.querySelector(${JSON.stringify(sel)});
            if (!el) return null;
            return el.innerText || el.textContent || '';
          })()`,
          returnByValue: true,
        }) as any;

        page.close();

        if (result.result.value === null) {
          return { content: [{ type: 'text' as const, text: `Element not found: ${sel}` }], isError: true };
        }

        // Truncate very long text
        let text = result.result.value;
        if (text.length > 10000) {
          text = text.slice(0, 10000) + '\n\n... (truncated, use a more specific selector)';
        }

        return { content: [{ type: 'text' as const, text }] };
      } catch (err: any) {
        page.close();
        return { content: [{ type: 'text' as const, text: `Error: ${err.message}` }], isError: true };
      }
    }
  );

  server.tool(
    'browser_evaluate',
    'Execute JavaScript in the page context and return the result',
    {
      expression: z.string().describe('JavaScript expression or code to evaluate'),
    },
    async ({ expression }) => {
      const page = await getPage();
      try {
        const result = await page.send('Runtime.evaluate', {
          expression,
          returnByValue: true,
          awaitPromise: true,
        }) as any;

        page.close();

        if (result.exceptionDetails) {
          return {
            content: [{ type: 'text' as const, text: `Error: ${result.exceptionDetails.text || JSON.stringify(result.exceptionDetails)}` }],
            isError: true,
          };
        }

        const value = result.result.value;
        const text = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
        return { content: [{ type: 'text' as const, text: text ?? 'undefined' }] };
      } catch (err: any) {
        page.close();
        return { content: [{ type: 'text' as const, text: `Error: ${err.message}` }], isError: true };
      }
    }
  );
}
