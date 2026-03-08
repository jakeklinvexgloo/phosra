"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerPageStateTools = registerPageStateTools;
const zod_1 = require("zod");
const transport_1 = require("../transport");
function registerPageStateTools(server, getBrowser) {
    async function getPage() {
        const browser = getBrowser();
        if (!browser)
            throw new Error('Browser not connected');
        return (0, transport_1.getActivePageTarget)(browser);
    }
    server.tool('browser_console_logs', 'Get recent console messages from the page', {
        level: zod_1.z.enum(['error', 'warning', 'info', 'debug']).optional().describe('Minimum log level (default: info)'),
    }, async ({ level }) => {
        const page = await getPage();
        try {
            // Enable console and collect messages
            await page.send('Runtime.enable');
            const result = await page.send('Runtime.evaluate', {
                expression: `(() => {
            if (!window.__phosra_console_logs) return [];
            const minLevel = ${JSON.stringify(level || 'info')};
            const levels = { error: 0, warning: 1, info: 2, debug: 3 };
            const min = levels[minLevel] ?? 2;
            return window.__phosra_console_logs
              .filter(l => (levels[l.level] ?? 2) <= min)
              .slice(-100);
          })()`,
                returnByValue: true,
            });
            page.close();
            const logs = result.result.value;
            if (!logs || logs.length === 0) {
                return {
                    content: [{
                            type: 'text',
                            text: 'No console logs captured. Note: log capture requires the stealth preload to be injected.',
                        }],
                };
            }
            const lines = logs.map((l) => `[${l.level}] ${l.text}`);
            return { content: [{ type: 'text', text: lines.join('\n') }] };
        }
        catch (err) {
            page.close();
            return { content: [{ type: 'text', text: `Error: ${err.message}` }], isError: true };
        }
    });
    server.tool('browser_network_requests', 'Get recent network requests from the page', {
        urlFilter: zod_1.z.string().optional().describe('Filter requests by URL substring'),
        includeStatic: zod_1.z.boolean().optional().describe('Include static resources like images/fonts (default false)'),
    }, async ({ urlFilter, includeStatic }) => {
        const page = await getPage();
        try {
            const result = await page.send('Runtime.evaluate', {
                expression: `(() => {
            const entries = performance.getEntriesByType('resource');
            return entries.map(e => ({
              url: e.name,
              type: e.initiatorType,
              duration: Math.round(e.duration),
              size: e.transferSize || 0,
              status: e.responseStatus || 0,
            }));
          })()`,
                returnByValue: true,
            });
            page.close();
            let requests = result.result.value || [];
            // Filter out static resources unless requested
            if (!includeStatic) {
                const staticTypes = ['img', 'css', 'font', 'link'];
                const staticExts = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.woff', '.woff2', '.ttf', '.css', '.ico'];
                requests = requests.filter((r) => {
                    if (staticTypes.includes(r.type))
                        return false;
                    return !staticExts.some((ext) => r.url.toLowerCase().includes(ext));
                });
            }
            if (urlFilter) {
                requests = requests.filter((r) => r.url.includes(urlFilter));
            }
            if (requests.length === 0) {
                return { content: [{ type: 'text', text: 'No matching network requests found' }] };
            }
            const lines = requests.slice(0, 100).map((r) => {
                const size = r.size > 0 ? ` (${Math.round(r.size / 1024)}KB)` : '';
                return `[${r.type}] ${r.url}${size} ${r.duration}ms`;
            });
            let text = `${requests.length} requests`;
            if (requests.length > 100)
                text += ` (showing first 100)`;
            text += `:\n${lines.join('\n')}`;
            return { content: [{ type: 'text', text }] };
        }
        catch (err) {
            page.close();
            return { content: [{ type: 'text', text: `Error: ${err.message}` }], isError: true };
        }
    });
    server.tool('browser_get_page_info', 'Get current page title, URL, and metadata', {}, async () => {
        const page = await getPage();
        try {
            const result = await page.send('Runtime.evaluate', {
                expression: `({
            url: window.location.href,
            title: document.title,
            readyState: document.readyState,
            doctype: document.doctype ? document.doctype.name : null,
            contentType: document.contentType,
            characterSet: document.characterSet,
            meta: (() => {
              const metas = {};
              document.querySelectorAll('meta[name], meta[property]').forEach(m => {
                const key = m.getAttribute('name') || m.getAttribute('property');
                if (key) metas[key] = m.getAttribute('content');
              });
              return metas;
            })(),
          })`,
                returnByValue: true,
            });
            page.close();
            const info = result.result.value;
            const lines = [
                `URL: ${info.url}`,
                `Title: ${info.title}`,
                `Ready State: ${info.readyState}`,
                `Content Type: ${info.contentType}`,
                `Charset: ${info.characterSet}`,
            ];
            const metaEntries = Object.entries(info.meta || {});
            if (metaEntries.length > 0) {
                lines.push('', 'Meta:');
                for (const [key, value] of metaEntries.slice(0, 20)) {
                    lines.push(`  ${key}: ${value}`);
                }
            }
            return { content: [{ type: 'text', text: lines.join('\n') }] };
        }
        catch (err) {
            page.close();
            return { content: [{ type: 'text', text: `Error: ${err.message}` }], isError: true };
        }
    });
}
