import { chromium } from 'playwright';

const BASE = 'https://www.phosra.com';
const OUT = '/Users/jakeklinvex/phosra/web/test-screenshots';

const pages = [
  { url: '/developers', name: '01-introduction' },
  { url: '/developers/authentication', name: '02-authentication' },
  { url: '/developers/quickstart', name: '03-quickstart' },
  { url: '/developers/errors', name: '04-errors' },
];

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });

for (const p of pages) {
  const page = await context.newPage();
  await page.goto(BASE + p.url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${OUT}/${p.name}.png`, fullPage: true });
  console.log(`Done: ${p.name}: ${p.url}`);
  await page.close();
}

await browser.close();
console.log('All screenshots captured.');
