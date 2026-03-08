import { chromium } from 'playwright';

const pages = [
  { name: 'overview', url: 'http://localhost:3000/developers/api-reference/overview', screenshot: true },
  { name: 'auth-post-register', url: 'http://localhost:3000/developers/api-reference/auth/post-auth-register', screenshot: true },
  { name: 'families-get', url: 'http://localhost:3000/developers/api-reference/families/get-families', screenshot: true },
  { name: 'children-post', url: 'http://localhost:3000/developers/api-reference/children/post-families-children', screenshot: false },
  { name: 'policies-get', url: 'http://localhost:3000/developers/api-reference/policies/get-policies', screenshot: false },
  { name: 'rules-post', url: 'http://localhost:3000/developers/api-reference/rules/post-policies-rules', screenshot: false },
  { name: 'enforcement-post', url: 'http://localhost:3000/developers/api-reference/enforcement/post-children-enforce', screenshot: true },
  { name: 'webhooks-post', url: 'http://localhost:3000/developers/api-reference/webhooks/post-webhooks', screenshot: false },
  { name: 'standards-get', url: 'http://localhost:3000/developers/api-reference/standards/get-standards', screenshot: false },
  { name: 'devices-get', url: 'http://localhost:3000/developers/api-reference/devices/get-children-devices', screenshot: false },
];

async function testPages() {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const results = [];

  for (const pageInfo of pages) {
    const page = await context.newPage();
    const errors = [];
    const consoleLogs = [];

    // Capture console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleLogs.push(msg.text());
      }
    });

    // Capture page errors
    page.on('pageerror', err => {
      errors.push(err.message);
    });

    try {
      const response = await page.goto(pageInfo.url, { waitUntil: 'networkidle', timeout: 30000 });
      const status = response?.status();

      // Wait for content to render
      await page.waitForTimeout(1000);

      // Check for Next.js error overlay
      const hasErrorOverlay = await page.$('#__next-build-error') !== null ||
                               await page.$('[data-nextjs-dialog]') !== null;

      // Check for error text in the page
      const bodyText = await page.textContent('body');
      const has404 = bodyText?.includes('404') && bodyText?.includes('not found');
      const has500 = bodyText?.includes('500') && bodyText?.includes('Internal Server Error');
      const hasUnhandled = bodyText?.includes('Unhandled Runtime Error');
      const hasApplicationError = bodyText?.includes('Application error');

      // Check page has meaningful content (not just an error page)
      const hasContent = bodyText && bodyText.length > 200;

      // Get page title or heading
      const heading = await page.$eval('h1, h2', el => el.textContent).catch(() => 'No heading found');

      const result = {
        name: pageInfo.name,
        url: pageInfo.url,
        status,
        hasErrorOverlay,
        has404,
        has500,
        hasUnhandled,
        hasApplicationError,
        hasContent,
        heading: heading?.trim()?.substring(0, 100),
        jsErrors: errors,
        consoleErrors: consoleLogs.filter(l => !l.includes('Download the React DevTools')),
        pass: status === 200 && !hasErrorOverlay && !has404 && !has500 && !hasUnhandled && !hasApplicationError && hasContent,
      };

      results.push(result);

      if (pageInfo.screenshot) {
        await page.screenshot({
          path: `test-screenshots/api-sample-${pageInfo.name}.png`,
          fullPage: false
        });
      }

    } catch (err) {
      results.push({
        name: pageInfo.name,
        url: pageInfo.url,
        error: err.message,
        pass: false,
      });
    }

    await page.close();
  }

  // Print results
  console.log('\n=== API Reference Page Test Results ===\n');
  for (const r of results) {
    const status = r.pass ? 'PASS' : 'FAIL';
    console.log(`[${status}] ${r.name}`);
    console.log(`  URL: ${r.url}`);
    console.log(`  HTTP Status: ${r.status || 'N/A'}`);
    console.log(`  Heading: ${r.heading || 'N/A'}`);
    if (r.jsErrors?.length > 0) console.log(`  JS Errors: ${JSON.stringify(r.jsErrors)}`);
    if (r.consoleErrors?.length > 0) console.log(`  Console Errors: ${JSON.stringify(r.consoleErrors)}`);
    if (r.error) console.log(`  Load Error: ${r.error}`);
    if (r.hasErrorOverlay) console.log(`  Next.js Error Overlay: YES`);
    if (r.has404) console.log(`  404 Error: YES`);
    if (r.has500) console.log(`  500 Error: YES`);
    if (r.hasUnhandled) console.log(`  Unhandled Error: YES`);
    if (r.hasApplicationError) console.log(`  Application Error: YES`);
    console.log('');
  }

  const passCount = results.filter(r => r.pass).length;
  const failCount = results.filter(r => !r.pass).length;
  console.log(`\nSummary: ${passCount} passed, ${failCount} failed out of ${results.length} pages`);

  await browser.close();
}

testPages().catch(console.error);
