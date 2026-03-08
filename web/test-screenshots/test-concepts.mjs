import { chromium } from 'playwright';

const BASE = 'https://www.phosra.com';
const OUT = '/Users/jakeklinvex/phosra/web/test-screenshots';

const pages = [
  { url: '/developers/concepts/families', name: '05-concepts-families' },
  { url: '/developers/concepts/children-and-age', name: '06-concepts-children' },
  { url: '/developers/concepts/policies-and-rules', name: '07-concepts-policies' },
  { url: '/developers/concepts/enforcement', name: '08-concepts-enforcement' },
  { url: '/developers/concepts/strictness-levels', name: '09-concepts-strictness' },
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
