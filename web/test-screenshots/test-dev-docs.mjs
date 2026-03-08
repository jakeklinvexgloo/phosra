import { chromium } from 'playwright';

const pages = [
  { url: 'http://localhost:3000/developers', name: '01-introduction', label: 'Introduction' },
  { url: 'http://localhost:3000/developers/authentication', name: '02-authentication', label: 'Authentication' },
  { url: 'http://localhost:3000/developers/quickstart', name: '03-quickstart', label: 'Quickstart' },
  { url: 'http://localhost:3000/developers/errors', name: '04-errors', label: 'Errors' },
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });

  for (const p of pages) {
    const page = await context.newPage();
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', err => consoleErrors.push(err.message));

    console.log(`\n=== Testing: ${p.label} (${p.url}) ===`);

    try {
      const response = await page.goto(p.url, { waitUntil: 'networkidle', timeout: 30000 });
      console.log(`HTTP Status: ${response.status()}`);

      // Wait a bit for hydration
      await page.waitForTimeout(1000);

      // Check page title / heading
      const h1 = await page.$('h1');
      const h1Text = h1 ? await h1.textContent() : null;
      console.log(`H1 heading: ${h1Text || 'NOT FOUND'}`);

      // Check for sidebar navigation
      const sidebar = await page.$('nav, aside, [class*="sidebar"], [class*="Sidebar"]');
      const sidebarVisible = sidebar ? await sidebar.isVisible() : false;
      console.log(`Sidebar visible: ${sidebarVisible}`);

      // Check for sidebar nav links (more specific)
      const sidebarLinks = await page.$$('aside a, nav[class*="sidebar"] a, [class*="sidebar"] a, [class*="Sidebar"] a');
      console.log(`Sidebar link count: ${sidebarLinks.length}`);

      // Check top navigation for "Developers" link (NOT "Docs")
      const headerNav = await page.$('header');
      if (headerNav) {
        const headerText = await headerNav.textContent();
        const hasDevelopersLink = headerText.includes('Developers');
        const hasDocsLink = headerText.includes('Docs');
        console.log(`Header has "Developers" link: ${hasDevelopersLink}`);
        console.log(`Header has "Docs" link: ${hasDocsLink}`);
        if (hasDocsLink && !hasDevelopersLink) {
          console.log('WARNING: Header shows "Docs" instead of "Developers"');
        }
      } else {
        console.log('Header: NOT FOUND');
      }

      // Check for error page indicators
      const bodyText = await page.textContent('body');
      const is404 = bodyText.includes('404') && bodyText.includes('not found');
      const isError = bodyText.includes('Application error') || bodyText.includes('Internal Server Error');
      if (is404) console.log('ERROR: Page shows 404');
      if (isError) console.log('ERROR: Page shows application error');

      // Console errors
      if (consoleErrors.length > 0) {
        console.log(`Console errors (${consoleErrors.length}):`);
        consoleErrors.forEach(e => console.log(`  - ${e}`));
      } else {
        console.log('Console errors: none');
      }

      // Take screenshot
      await page.screenshot({
        path: `/Users/jakeklinvex/phosra/web/test-screenshots/${p.name}.png`,
        fullPage: false,
      });
      console.log(`Screenshot saved: ${p.name}.png`);

      // Overall pass/fail
      const passed = h1Text && sidebarVisible && !is404 && !isError && response.status() === 200;
      console.log(`RESULT: ${passed ? 'PASS' : 'FAIL'}`);

    } catch (err) {
      console.log(`ERROR: ${err.message}`);
      console.log('RESULT: FAIL');
    }

    await page.close();
  }

  await browser.close();
})();
