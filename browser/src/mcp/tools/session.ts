import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { BrowserConnection } from '../server';
import { getActivePageTarget } from '../transport';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const PROFILES_DIR = path.join(os.homedir(), '.phosra-browser', 'profiles');

export function registerSessionTools(server: McpServer, getBrowser: () => BrowserConnection | null) {
  async function getPage() {
    const browser = getBrowser();
    if (!browser) throw new Error('Browser not connected');
    return getActivePageTarget(browser);
  }

  server.tool(
    'browser_list_profiles',
    'List all saved browser profiles',
    {},
    async () => {
      try {
        if (!fs.existsSync(PROFILES_DIR)) {
          return { content: [{ type: 'text' as const, text: 'No profiles found' }] };
        }

        const entries = fs.readdirSync(PROFILES_DIR, { withFileTypes: true });
        const profiles = entries.filter((e) => e.isDirectory()).map((e) => e.name);

        if (profiles.length === 0) {
          return { content: [{ type: 'text' as const, text: 'No profiles found' }] };
        }

        return { content: [{ type: 'text' as const, text: `Profiles:\n${profiles.map((p) => `  - ${p}`).join('\n')}` }] };
      } catch (err: any) {
        return { content: [{ type: 'text' as const, text: `Error: ${err.message}` }], isError: true };
      }
    }
  );

  server.tool(
    'browser_save_cookies',
    'Save current cookies to a profile',
    {
      profileName: z.string().describe('Profile name to save cookies under'),
    },
    async ({ profileName }) => {
      const page = await getPage();
      try {
        const result = await page.send('Network.getAllCookies') as any;
        page.close();

        const profileDir = path.join(PROFILES_DIR, profileName);
        fs.mkdirSync(profileDir, { recursive: true });
        fs.writeFileSync(
          path.join(profileDir, 'cookies.json'),
          JSON.stringify(result.cookies, null, 2)
        );

        return { content: [{ type: 'text' as const, text: `Saved ${result.cookies.length} cookies to profile "${profileName}"` }] };
      } catch (err: any) {
        page.close();
        return { content: [{ type: 'text' as const, text: `Error: ${err.message}` }], isError: true };
      }
    }
  );

  server.tool(
    'browser_load_cookies',
    'Load cookies from a saved profile',
    {
      profileName: z.string().describe('Profile name to load cookies from'),
    },
    async ({ profileName }) => {
      const page = await getPage();
      try {
        const cookiesPath = path.join(PROFILES_DIR, profileName, 'cookies.json');
        if (!fs.existsSync(cookiesPath)) {
          page.close();
          return { content: [{ type: 'text' as const, text: `Profile "${profileName}" has no saved cookies` }], isError: true };
        }

        const cookies = JSON.parse(fs.readFileSync(cookiesPath, 'utf-8'));
        await page.send('Network.setCookies', { cookies });
        page.close();

        return { content: [{ type: 'text' as const, text: `Loaded ${cookies.length} cookies from profile "${profileName}"` }] };
      } catch (err: any) {
        page.close();
        return { content: [{ type: 'text' as const, text: `Error: ${err.message}` }], isError: true };
      }
    }
  );

  server.tool(
    'browser_clear_cache',
    'Clear browser cache and optionally cookies',
    {
      includeCookies: z.boolean().optional().describe('Also clear cookies (default false)'),
    },
    async ({ includeCookies }) => {
      const page = await getPage();
      try {
        await page.send('Network.clearBrowserCache');
        if (includeCookies) {
          await page.send('Network.clearBrowserCookies');
        }
        page.close();

        return {
          content: [{
            type: 'text' as const,
            text: `Cleared cache${includeCookies ? ' and cookies' : ''}`,
          }],
        };
      } catch (err: any) {
        page.close();
        return { content: [{ type: 'text' as const, text: `Error: ${err.message}` }], isError: true };
      }
    }
  );

  server.tool(
    'browser_get_cookies',
    'Get all cookies for the current page or a specific domain',
    {
      domain: z.string().optional().describe('Filter cookies by domain'),
    },
    async ({ domain }) => {
      const page = await getPage();
      try {
        const result = await page.send('Network.getAllCookies') as any;
        page.close();

        let cookies = result.cookies;
        if (domain) {
          cookies = cookies.filter((c: any) => c.domain.includes(domain));
        }

        if (cookies.length === 0) {
          return { content: [{ type: 'text' as const, text: 'No cookies found' }] };
        }

        // Summarize cookies
        const lines = cookies.slice(0, 50).map((c: any) =>
          `${c.name} = ${c.value.slice(0, 60)}${c.value.length > 60 ? '...' : ''} (${c.domain}, ${c.httpOnly ? 'httpOnly' : ''} ${c.secure ? 'secure' : ''})`
        );

        let text = `${cookies.length} cookies found`;
        if (cookies.length > 50) text += ` (showing first 50)`;
        text += `:\n${lines.join('\n')}`;

        return { content: [{ type: 'text' as const, text }] };
      } catch (err: any) {
        page.close();
        return { content: [{ type: 'text' as const, text: `Error: ${err.message}` }], isError: true };
      }
    }
  );
}
