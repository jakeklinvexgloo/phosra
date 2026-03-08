import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { BrowserConnection } from '../server';
import { getActivePageTarget } from '../transport';

export function registerInteractionTools(server: McpServer, getBrowser: () => BrowserConnection | null) {
  async function getPage() {
    const browser = getBrowser();
    if (!browser) throw new Error('Browser not connected');
    return getActivePageTarget(browser);
  }

  server.tool(
    'browser_click',
    'Click an element by CSS selector',
    {
      selector: z.string().describe('CSS selector of the element to click'),
    },
    async ({ selector }) => {
      const page = await getPage();
      try {
        await page.send('Runtime.enable');
        // Get element center coordinates
        const result = await page.send('Runtime.evaluate', {
          expression: `(() => {
            const el = document.querySelector(${JSON.stringify(selector)});
            if (!el) return null;
            const rect = el.getBoundingClientRect();
            return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
          })()`,
          returnByValue: true,
        }) as any;

        if (!result.result.value) {
          page.close();
          return { content: [{ type: 'text' as const, text: `Element not found: ${selector}` }], isError: true };
        }

        const { x, y } = result.result.value;
        await page.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y });
        await page.send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
        await page.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });

        page.close();
        return { content: [{ type: 'text' as const, text: `Clicked ${selector}` }] };
      } catch (err: any) {
        page.close();
        return { content: [{ type: 'text' as const, text: `Error: ${err.message}` }], isError: true };
      }
    }
  );

  server.tool(
    'browser_type',
    'Type text into a focused element or an element specified by selector',
    {
      text: z.string().describe('Text to type'),
      selector: z.string().optional().describe('CSS selector to focus before typing'),
      clear: z.boolean().optional().describe('Clear the field before typing'),
    },
    async ({ text, selector, clear }) => {
      const page = await getPage();
      try {
        if (selector) {
          // Focus the element
          await page.send('Runtime.evaluate', {
            expression: `document.querySelector(${JSON.stringify(selector)})?.focus()`,
          });
        }

        if (clear) {
          await page.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'a', code: 'KeyA', modifiers: 2 }); // Ctrl+A
          await page.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'a', code: 'KeyA', modifiers: 2 });
          await page.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Backspace', code: 'Backspace' });
          await page.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Backspace', code: 'Backspace' });
        }

        // Type each character
        for (const char of text) {
          await page.send('Input.dispatchKeyEvent', { type: 'keyDown', text: char, key: char });
          await page.send('Input.dispatchKeyEvent', { type: 'keyUp', text: char, key: char });
        }

        page.close();
        return { content: [{ type: 'text' as const, text: `Typed "${text.length > 50 ? text.slice(0, 50) + '...' : text}"` }] };
      } catch (err: any) {
        page.close();
        return { content: [{ type: 'text' as const, text: `Error: ${err.message}` }], isError: true };
      }
    }
  );

  server.tool(
    'browser_screenshot',
    'Take a screenshot of the current page',
    {
      fullPage: z.boolean().optional().describe('Capture the full scrollable page'),
      selector: z.string().optional().describe('CSS selector to screenshot a specific element'),
    },
    async ({ fullPage, selector }) => {
      const page = await getPage();
      try {
        await page.send('Page.enable');

        let clip: Record<string, unknown> | undefined;

        if (selector) {
          const result = await page.send('Runtime.evaluate', {
            expression: `(() => {
              const el = document.querySelector(${JSON.stringify(selector)});
              if (!el) return null;
              const rect = el.getBoundingClientRect();
              return { x: rect.x, y: rect.y, width: rect.width, height: rect.height, scale: window.devicePixelRatio };
            })()`,
            returnByValue: true,
          }) as any;

          if (result.result.value) {
            clip = result.result.value;
          }
        }

        const params: Record<string, unknown> = { format: 'png' };
        if (clip) params.clip = clip;
        if (fullPage) params.captureBeyondViewport = true;

        const screenshot = await page.send('Page.captureScreenshot', params) as any;
        page.close();

        return {
          content: [{
            type: 'image' as const,
            data: screenshot.data,
            mimeType: 'image/png',
          }],
        };
      } catch (err: any) {
        page.close();
        return { content: [{ type: 'text' as const, text: `Error: ${err.message}` }], isError: true };
      }
    }
  );

  server.tool(
    'browser_scroll',
    'Scroll the page up or down',
    {
      direction: z.enum(['up', 'down']).describe('Scroll direction'),
      amount: z.number().optional().describe('Scroll amount in pixels (default 500)'),
    },
    async ({ direction, amount }) => {
      const page = await getPage();
      const pixels = amount ?? 500;
      const delta = direction === 'down' ? pixels : -pixels;

      try {
        await page.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 400, y: 400 });
        await page.send('Input.dispatchMouseEvent', {
          type: 'mouseWheel',
          x: 400,
          y: 400,
          deltaX: 0,
          deltaY: delta,
        });

        page.close();
        return { content: [{ type: 'text' as const, text: `Scrolled ${direction} ${pixels}px` }] };
      } catch (err: any) {
        page.close();
        return { content: [{ type: 'text' as const, text: `Error: ${err.message}` }], isError: true };
      }
    }
  );

  server.tool(
    'browser_hover',
    'Hover over an element by CSS selector',
    {
      selector: z.string().describe('CSS selector of the element to hover'),
    },
    async ({ selector }) => {
      const page = await getPage();
      try {
        const result = await page.send('Runtime.evaluate', {
          expression: `(() => {
            const el = document.querySelector(${JSON.stringify(selector)});
            if (!el) return null;
            const rect = el.getBoundingClientRect();
            return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
          })()`,
          returnByValue: true,
        }) as any;

        if (!result.result.value) {
          page.close();
          return { content: [{ type: 'text' as const, text: `Element not found: ${selector}` }], isError: true };
        }

        const { x, y } = result.result.value;
        await page.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y });

        page.close();
        return { content: [{ type: 'text' as const, text: `Hovered over ${selector}` }] };
      } catch (err: any) {
        page.close();
        return { content: [{ type: 'text' as const, text: `Error: ${err.message}` }], isError: true };
      }
    }
  );

  server.tool(
    'browser_press_key',
    'Press a keyboard key or combination',
    {
      key: z.string().describe('Key or key combination (e.g. "Enter", "Control+A", "Tab")'),
    },
    async ({ key }) => {
      const page = await getPage();
      try {
        const parts = key.split('+');
        const mainKey = parts[parts.length - 1];
        let modifiers = 0;

        for (const part of parts.slice(0, -1)) {
          switch (part.toLowerCase()) {
            case 'control': case 'ctrl': modifiers |= 2; break;
            case 'alt': modifiers |= 1; break;
            case 'shift': modifiers |= 8; break;
            case 'meta': case 'cmd': case 'command': modifiers |= 4; break;
          }
        }

        await page.send('Input.dispatchKeyEvent', {
          type: 'keyDown',
          key: mainKey,
          code: mainKey.length === 1 ? `Key${mainKey.toUpperCase()}` : mainKey,
          modifiers,
        });
        await page.send('Input.dispatchKeyEvent', {
          type: 'keyUp',
          key: mainKey,
          code: mainKey.length === 1 ? `Key${mainKey.toUpperCase()}` : mainKey,
          modifiers,
        });

        page.close();
        return { content: [{ type: 'text' as const, text: `Pressed ${key}` }] };
      } catch (err: any) {
        page.close();
        return { content: [{ type: 'text' as const, text: `Error: ${err.message}` }], isError: true };
      }
    }
  );
}
