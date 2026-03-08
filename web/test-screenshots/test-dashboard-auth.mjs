import { chromium } from 'playwright';

const BASE = 'http://localhost:3000';
const SCREENSHOT_DIR = '/Users/jakeklinvex/phosra/web/test-screenshots';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const results = [];

  // Helper to test a page
  async function testPage(name, url, opts = {}) {
    const page = await context.newPage();
    try {
      const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      const finalUrl = page.url();
      const status = response?.status() || 'unknown';

      // Check for error indicators on page
      const bodyText = await page.textContent('body').catch(() => '');
      const hasError = bodyText.includes('Application error') ||
                       bodyText.includes('500') ||
                       bodyText.includes('Internal Server Error') ||
                       bodyText.includes('This page could not be found');

      const result = {
        name,
        url,
        finalUrl,
        status,
        hasError,
        redirected: finalUrl !== url,
        pass: true,
        notes: ''
      };

      // Check redirect expectations
      if (opts.expectRedirectTo) {
        const expectedPath = opts.expectRedirectTo;
        const finalPath = new URL(finalUrl).pathname;
        if (!finalPath.startsWith(expectedPath)) {
          result.pass = false;
          result.notes = `Expected redirect to ${expectedPath}, got ${finalPath}`;
        } else {
          result.notes = `Correctly redirected to ${finalPath}`;
        }
      }

      // Check that page loaded without errors
      if (opts.expectNoError && hasError) {
        result.pass = false;
        result.notes += ' Page has error content.';
      }

      // Take screenshot if requested
      if (opts.screenshot) {
        const screenshotPath = `${SCREENSHOT_DIR}/${opts.screenshot}`;
        await page.screenshot({ path: screenshotPath, fullPage: false });
        result.notes += ` Screenshot: ${opts.screenshot}`;
      }

      results.push(result);
      console.log(`${result.pass ? 'PASS' : 'FAIL'} | ${name} | ${result.notes}`);
    } catch (err) {
      results.push({
        name,
        url,
        pass: false,
        notes: `Error: ${err.message}`
      });
      console.log(`FAIL | ${name} | Error: ${err.message}`);
    } finally {
      await page.close();
    }
  }

  // Test 1: Dashboard developers redirect
  console.log('\n=== Test 1: Unauthenticated /dashboard/developers redirect ===');
  await testPage(
    'Dashboard Developers (unauth)',
    `${BASE}/dashboard/developers`,
    { expectRedirectTo: '/login', screenshot: 'test1-dashboard-developers-redirect.png' }
  );

  // Test 2: Dashboard home redirect
  console.log('\n=== Test 2: Unauthenticated /dashboard redirect ===');
  await testPage(
    'Dashboard Home (unauth)',
    `${BASE}/dashboard`,
    { expectRedirectTo: '/login', screenshot: 'test2-dashboard-redirect.png' }
  );

  // Test 3: Login page
  console.log('\n=== Test 3: Login page ===');
  await testPage(
    'Login Page',
    `${BASE}/login`,
    { expectNoError: true, screenshot: 'test3-login-page.png' }
  );

  // Test 4: Concept pages
  console.log('\n=== Test 4: Concept pages ===');
  await testPage(
    'Concepts: Families',
    `${BASE}/developers/concepts/families`,
    { expectNoError: true, screenshot: 'test4-concepts-families.png' }
  );
  await testPage(
    'Concepts: Children and Age',
    `${BASE}/developers/concepts/children-and-age`,
    { expectNoError: true }
  );
  await testPage(
    'Concepts: Policies and Rules',
    `${BASE}/developers/concepts/policies-and-rules`,
    { expectNoError: true, screenshot: 'test4-concepts-policies.png' }
  );

  // Test 5: Guide pages
  console.log('\n=== Test 5: Guide pages ===');
  await testPage(
    'Guide: First Time Setup',
    `${BASE}/developers/guides/first-time-setup`,
    { expectNoError: true, screenshot: 'test5-guide-setup.png' }
  );
  await testPage(
    'Guide: Webhook Events',
    `${BASE}/developers/guides/webhook-events`,
    { expectNoError: true }
  );

  // Test 6: SDK pages
  console.log('\n=== Test 6: SDK pages ===');
  await testPage(
    'SDK: Overview',
    `${BASE}/developers/sdks/overview`,
    { expectNoError: true, screenshot: 'test6-sdk-overview.png' }
  );
  await testPage(
    'SDK: TypeScript',
    `${BASE}/developers/sdks/typescript`,
    { expectNoError: true, screenshot: 'test6-sdk-typescript.png' }
  );

  // Summary
  console.log('\n\n========== SUMMARY ==========');
  const passed = results.filter(r => r.pass).length;
  const failed = results.filter(r => !r.pass).length;
  console.log(`Total: ${results.length} | Passed: ${passed} | Failed: ${failed}\n`);

  for (const r of results) {
    console.log(`${r.pass ? 'PASS' : 'FAIL'} | ${r.name}`);
    if (r.finalUrl) console.log(`       URL: ${r.url} -> ${r.finalUrl}`);
    if (r.status) console.log(`       Status: ${r.status}`);
    if (r.notes) console.log(`       Notes: ${r.notes}`);
    console.log('');
  }

  await browser.close();
}

run().catch(err => {
  console.error('Script error:', err);
  process.exit(1);
});
