import { chromium } from 'playwright';

const BASE = 'https://www.phosra.com';
const OUT = '/Users/jakeklinvex/phosra/web/test-screenshots';

const pages = [
  { url: '/developers/guides/first-time-setup', name: '10-guide-setup' },
  { url: '/developers/guides/webhook-events', name: '11-guide-webhooks' },
  { url: '/developers/guides/mobile-integration', name: '12-guide-mobile' },
  { url: '/developers/sdks/typescript', name: '13-sdk-typescript' },
  { url: '/developers/sdks/mcp-server', name: '14-sdk-mcp' },
  { url: '/developers/sdks/ios', name: '15-sdk-ios' },
];

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });

for (const p of pages) {
  const page = await context.newPage();
  await page.goto(BASE + p.url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${OUT}/${p.name}.png`, fullPage: true });
  console.log(`✓ ${p.name}: ${p.url}`);
  await page.close();
}

await browser.close();
