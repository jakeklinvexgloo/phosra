import { chromium } from 'playwright';

const BASE = 'https://www.phosra.com';
const OUT = '/Users/jakeklinvex/phosra/web/test-screenshots';

// Test the overview MDX page + a representative sample of auto-generated endpoint pages
// using the actual slugs from the generated api-reference.json
const pages = [
  // Overview MDX page
  { url: '/developers/api-reference/overview', name: '16-api-overview' },
  // Auth endpoints (using actual generated slugs)
  { url: '/developers/api-reference/auth/post-auth-register', name: '17-api-auth-register' },
  { url: '/developers/api-reference/auth/post-auth-login', name: '18-api-auth-login' },
  // Families
  { url: '/developers/api-reference/families/get-families', name: '19-api-families-list' },
  // Children
  { url: '/developers/api-reference/children/post-families-children', name: '20-api-children-create' },
  // Policies
  { url: '/developers/api-reference/policies/get-children-policies', name: '21-api-policies-list' },
  // Also test nav-style short URLs to see if they resolve or 404
  { url: '/developers/api-reference/auth/register', name: '22-api-nav-auth-register' },
  { url: '/developers/api-reference/families/list', name: '23-api-nav-families-list' },
  { url: '/developers/api-reference/children/create', name: '24-api-nav-children-create' },
];

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });

for (const p of pages) {
  const page = await context.newPage();
  try {
    const response = await page.goto(BASE + p.url, { waitUntil: 'networkidle', timeout: 30000 });
    const status = response?.status() || 'unknown';
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${OUT}/${p.name}.png`, fullPage: true });
    console.log(`OK ${p.name}: ${p.url} (status: ${status})`);
  } catch (err) {
    console.log(`ERR ${p.name}: ${p.url} - ${err.message}`);
    // Take screenshot even on error
    try {
      await page.screenshot({ path: `${OUT}/${p.name}.png`, fullPage: true });
    } catch {}
  }
  await page.close();
}

await browser.close();
console.log('\nDone. Screenshots saved to:', OUT);
