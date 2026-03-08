import { chromium } from 'playwright';

const BASE = 'http://localhost:3000';
const SCREENSHOT_DIR = '/Users/jakeklinvex/phosra/web/test-screenshots';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });

  // Quick investigation: what text contains "404" on the developer docs pages?
  const page = await context.newPage();
  await page.goto(`${BASE}/developers/concepts/families`, { waitUntil: 'networkidle', timeout: 30000 });

  // Check for "404" in the visible text
  const bodyText = await page.textContent('body');
  const idx = bodyText.indexOf('404');
  if (idx >= 0) {
    console.log('Found "404" in body text at index', idx);
    console.log('Context:', JSON.stringify(bodyText.substring(Math.max(0, idx - 100), idx + 100)));
  } else {
    console.log('No "404" found in body text');
  }

  // Check for "This page could not be found"
  const idx2 = bodyText.indexOf('This page could not be found');
  if (idx2 >= 0) {
    console.log('Found "This page could not be found" in body text');
  } else {
    console.log('No "This page could not be found" found');
  }

  // Check the login page
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle', timeout: 30000 });
  const loginBodyText = await page.textContent('body');
  const loginIdx = loginBodyText.indexOf('404');
  if (loginIdx >= 0) {
    console.log('\nLogin page: Found "404" at index', loginIdx);
    console.log('Context:', JSON.stringify(loginBodyText.substring(Math.max(0, loginIdx - 100), loginIdx + 100)));
  } else {
    console.log('\nLogin page: No "404" found');
  }
  const loginIdx2 = loginBodyText.indexOf('This page could not be found');
  if (loginIdx2 >= 0) {
    console.log('Login page: Found "This page could not be found"');
  }

  // Check what the login page actually shows
  const loginH1 = await page.$eval('h1', el => el.textContent).catch(() => 'no h1');
  console.log('Login H1:', loginH1);
  const loginFinalUrl = page.url();
  console.log('Login final URL:', loginFinalUrl);

  // Print first 500 chars of login page
  console.log('\nLogin page first 500 chars:');
  console.log(loginBodyText.substring(0, 500));

  await browser.close();
}

run().catch(console.error);
