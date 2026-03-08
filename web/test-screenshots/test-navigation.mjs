import { chromium } from 'playwright';

const BASE = 'https://www.phosra.com';
const OUT = '/Users/jakeklinvex/phosra/web/test-screenshots';

const browser = await chromium.launch();

// Test 1: Desktop navbar has "Developers" link
const desktopCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
let page = await desktopCtx.newPage();
await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForTimeout(1000);
await page.screenshot({ path: `${OUT}/22-navbar-homepage.png`, fullPage: false });
console.log('✓ 22-navbar-homepage');

// Test 2: Desktop developer docs with sidebar
page = await desktopCtx.newPage();
await page.goto(BASE + '/developers', { waitUntil: 'networkidle' });
await page.waitForTimeout(1000);
await page.screenshot({ path: `${OUT}/23-desktop-sidebar.png`, fullPage: false });
console.log('✓ 23-desktop-sidebar');

// Test 3: Navigate via sidebar to a different page
await page.click('a[href="/developers/quickstart"]');
await page.waitForTimeout(1500);
await page.screenshot({ path: `${OUT}/24-sidebar-navigation.png`, fullPage: false });
console.log('✓ 24-sidebar-navigation');

// Test 4: TOC on desktop (wide viewport with xl breakpoint)
page = await desktopCtx.newPage();
await page.goto(BASE + '/developers/quickstart', { waitUntil: 'networkidle' });
await page.waitForTimeout(1000);
await page.screenshot({ path: `${OUT}/25-desktop-toc.png`, fullPage: false });
console.log('✓ 25-desktop-toc');

await desktopCtx.close();

// Test 5: Mobile viewport - sidebar hidden, toggle button visible
const mobileCtx = await browser.newContext({ viewport: { width: 375, height: 812 } });
page = await mobileCtx.newPage();
await page.goto(BASE + '/developers', { waitUntil: 'networkidle' });
await page.waitForTimeout(1000);
await page.screenshot({ path: `${OUT}/26-mobile-default.png`, fullPage: false });
console.log('✓ 26-mobile-default');

// Test 6: Mobile - click sidebar toggle
const toggleBtn = page.locator('button:has-text("Navigation")');
if (await toggleBtn.isVisible()) {
  await toggleBtn.click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT}/27-mobile-sidebar-open.png`, fullPage: false });
  console.log('✓ 27-mobile-sidebar-open');
} else {
  console.log('⚠ No "Navigation" toggle button found on mobile');
  await page.screenshot({ path: `${OUT}/27-mobile-no-toggle.png`, fullPage: false });
}

// Test 7: Tablet viewport
const tabletCtx = await browser.newContext({ viewport: { width: 768, height: 1024 } });
page = await tabletCtx.newPage();
await page.goto(BASE + '/developers/concepts/families', { waitUntil: 'networkidle' });
await page.waitForTimeout(1000);
await page.screenshot({ path: `${OUT}/28-tablet-view.png`, fullPage: false });
console.log('✓ 28-tablet-view');

await mobileCtx.close();
await tabletCtx.close();
await browser.close();
