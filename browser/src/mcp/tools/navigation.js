"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerNavigationTools = registerNavigationTools;
const zod_1 = require("zod");
const transport_1 = require("../transport");
function registerNavigationTools(server, getBrowser) {
    async function getPage() {
        const browser = getBrowser();
        if (!browser)
            throw new Error('Browser not connected');
        return (0, transport_1.getActivePageTarget)(browser);
    }
    server.tool('browser_goto', 'Navigate to a URL in the active tab', { url: zod_1.z.string().describe('The URL to navigate to') }, async ({ url }) => {
        const page = await getPage();
        try {
            await page.send('Page.enable');
            await page.send('Page.navigate', { url });
            await page.send('Page.loadEventFired');
            page.close();
            return { content: [{ type: 'text', text: `Navigated to ${url}` }] };
        }
        catch (err) {
            page.close();
            return { content: [{ type: 'text', text: `Navigation error: ${err.message}` }], isError: true };
        }
    });
    server.tool('browser_back', 'Go back in browser history', {}, async () => {
        const page = await getPage();
        try {
            const history = await page.send('Page.getNavigationHistory');
            if (history.currentIndex > 0) {
                const entry = history.entries[history.currentIndex - 1];
                await page.send('Page.navigateToHistoryEntry', { entryId: entry.id });
            }
            page.close();
            return { content: [{ type: 'text', text: 'Navigated back' }] };
        }
        catch (err) {
            page.close();
            return { content: [{ type: 'text', text: `Error: ${err.message}` }], isError: true };
        }
    });
    server.tool('browser_forward', 'Go forward in browser history', {}, async () => {
        const page = await getPage();
        try {
            const history = await page.send('Page.getNavigationHistory');
            if (history.currentIndex < history.entries.length - 1) {
                const entry = history.entries[history.currentIndex + 1];
                await page.send('Page.navigateToHistoryEntry', { entryId: entry.id });
            }
            page.close();
            return { content: [{ type: 'text', text: 'Navigated forward' }] };
        }
        catch (err) {
            page.close();
            return { content: [{ type: 'text', text: `Error: ${err.message}` }], isError: true };
        }
    });
    server.tool('browser_reload', 'Reload the current page', { ignoreCache: zod_1.z.boolean().optional().describe('Whether to ignore cache') }, async ({ ignoreCache }) => {
        const page = await getPage();
        try {
            await page.send('Page.reload', { ignoreCache: ignoreCache ?? false });
            page.close();
            return { content: [{ type: 'text', text: 'Page reloaded' }] };
        }
        catch (err) {
            page.close();
            return { content: [{ type: 'text', text: `Error: ${err.message}` }], isError: true };
        }
    });
    server.tool('browser_get_url', 'Get the current page URL', {}, async () => {
        const page = await getPage();
        try {
            const result = await page.send('Runtime.evaluate', {
                expression: 'window.location.href',
                returnByValue: true,
            });
            page.close();
            return { content: [{ type: 'text', text: result.result.value }] };
        }
        catch (err) {
            page.close();
            return { content: [{ type: 'text', text: `Error: ${err.message}` }], isError: true };
        }
    });
    server.tool('browser_wait_for', 'Wait for an element or text to appear on the page', {
        selector: zod_1.z.string().optional().describe('CSS selector to wait for'),
        text: zod_1.z.string().optional().describe('Text content to wait for'),
        timeout: zod_1.z.number().optional().describe('Timeout in milliseconds (default 30000)'),
    }, async ({ selector, text, timeout }) => {
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
                    });
                    found = result.result.value === true;
                }
                else if (text) {
                    const result = await page.send('Runtime.evaluate', {
                        expression: `document.body && document.body.innerText.includes(${JSON.stringify(text)})`,
                        returnByValue: true,
                    });
                    found = result.result.value === true;
                }
                else {
                    page.close();
                    return { content: [{ type: 'text', text: 'Must specify either selector or text' }], isError: true };
                }
                if (found) {
                    page.close();
                    return { content: [{ type: 'text', text: `Found ${selector ? `selector "${selector}"` : `text "${text}"`}` }] };
                }
                await new Promise((resolve) => setTimeout(resolve, pollInterval));
            }
            page.close();
            return { content: [{ type: 'text', text: `Timeout waiting for ${selector ? `selector "${selector}"` : `text "${text}"`}` }], isError: true };
        }
        catch (err) {
            page.close();
            return { content: [{ type: 'text', text: `Error: ${err.message}` }], isError: true };
        }
    });
}
