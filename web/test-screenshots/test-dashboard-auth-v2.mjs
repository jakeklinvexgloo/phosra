import { chromium } from 'playwright';

const BASE = 'http://localhost:3000';
const SCREENSHOT_DIR = '/Users/jakeklinvex/phosra/web/test-screenshots';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const results = [];

  async function testPage(name, url, opts = {}) {
    const page = await context.newPage();

    // Collect console errors
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    // Collect page errors (uncaught exceptions)
    const pageErrors = [];
    page.on('pageerror', err => {
      pageErrors.push(err.message);
    });

    try {
      const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      const finalUrl = page.url();
      const status = response?.status() || 'unknown';

      // More precise error detection
      const bodyText = await page.textContent('body').catch(() => '');
      const hasApplicationError = bodyText.includes('Application error');
      const has404 = bodyText.includes('This page could not be found') || bodyText.includes('404');
      const hasNextError = await page.$('#__next-build-error').catch(() => null);

      // Check for actual error overlays
      const hasErrorOverlay = await page.$('nextjs-portal').catch(() => null);

      const result = {
        name,
        url,
        finalUrl,
        status,
        hasApplicationError,
        has404,
        hasNextError: !!hasNextError,
        hasErrorOverlay: !!hasErrorOverlay,
        consoleErrors: consoleErrors.slice(0, 3),
        pageErrors: pageErrors.slice(0, 3),
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

      // Only fail on real errors, not content that happens to contain "500"
      if (opts.expectNoError) {
        if (hasApplicationError) {
          result.pass = false;
          result.notes += ' [APPLICATION ERROR on page]';
        }
        if (has404) {
          result.pass = false;
          result.notes += ' [404 NOT FOUND]';
        }
        if (status >= 400) {
          result.pass = false;
          result.notes += ` [HTTP ${status}]`;
        }
        if (pageErrors.length > 0) {
          result.notes += ` [${pageErrors.length} JS error(s)]`;
        }
      }

      // Check page has meaningful content (not blank)
      const contentLength = bodyText.trim().length;
      if (opts.expectNoError && contentLength < 50) {
        result.pass = false;
        result.notes += ' [Page appears blank]';
      }

      // Get page title
      const title = await page.title();
      result.notes += ` Title: "${title}"`;

      // Take screenshot
      if (opts.screenshot) {
        const screenshotPath = `${SCREENSHOT_DIR}/${opts.screenshot}`;
        await page.screenshot({ path: screenshotPath, fullPage: false });
        result.notes += ` Screenshot: ${opts.screenshot}`;
      }

      // Get first heading for context
      const h1 = await page.$eval('h1', el => el.textContent).catch(() => null);
      if (h1) result.notes += ` H1: "${h1.trim().substring(0, 80)}"`;

      results.push(result);
      console.log(`${result.pass ? 'PASS' : 'FAIL'} | ${name} | ${result.notes.trim()}`);
      if (consoleErrors.length > 0) {
        console.log(`       Console errors: ${consoleErrors.slice(0, 2).join(' | ')}`);
      }
      if (pageErrors.length > 0) {
        console.log(`       Page errors: ${pageErrors.slice(0, 2).join(' | ')}`);
      }
    } catch (err) {
      results.push({ name, url, pass: false, notes: `Error: ${err.message}` });
      console.log(`FAIL | ${name} | Error: ${err.message}`);
    } finally {
      await page.close();
    }
  }

  // Test 1: Dashboard developers redirect (unauthenticated)
  console.log('\n=== Test 1: Unauthenticated /dashboard/developers redirect ===');
  await testPage(
    'Dashboard Developers (unauth)',
    `${BASE}/dashboard/developers`,
    { expectRedirectTo: '/login', screenshot: 'test1-dashboard-developers-redirect.png' }
  );

  // Test 2: Dashboard home redirect (unauthenticated)
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
    { expectNoError: true, screenshot: 'test4-concepts-children.png' }
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
    { expectNoError: true, screenshot: 'test5-guide-webhooks.png' }
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
  console.log('\n\n========================================');
  console.log('           FINAL SUMMARY');
  console.log('========================================');
  const passed = results.filter(r => r.pass).length;
  const failed = results.filter(r => !r.pass).length;
  console.log(`Total: ${results.length} | Passed: ${passed} | Failed: ${failed}\n`);

  for (const r of results) {
    const icon = r.pass ? 'PASS' : 'FAIL';
    console.log(`${icon} | ${r.name}`);
    if (r.notes) console.log(`       ${r.notes.trim()}`);
    console.log('');
  }

  await browser.close();
}

run().catch(err => {
  console.error('Script error:', err);
  process.exit(1);
});
