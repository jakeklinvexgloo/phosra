import { chromium, devices } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    ...devices['iPhone 14'],
  });
  const page = await context.newPage();

  page.on('console', msg => console.log('CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  // Track network requests to see if invite API call happens
  page.on('request', req => {
    if (req.url().includes('/invite/')) {
      console.log('REQUEST:', req.method(), req.url());
    }
  });
  page.on('response', res => {
    if (res.url().includes('/invite/')) {
      console.log('RESPONSE:', res.status(), res.url());
    }
  });

  console.log('Navigating to invite link (mobile)...');
  await page.goto('https://phosra.com/investors/portal?invite=alex-phosra-invite-2024', {
    waitUntil: 'networkidle',
    timeout: 30000,
  });

  // Check what URL we ended up on
  console.log('Final URL:', page.url());

  // Check if the invite param survived the redirect
  const url = new URL(page.url());
  console.log('Query params:', url.searchParams.toString());

  await page.waitForTimeout(3000);

  await page.screenshot({ path: 'invite-test-mobile.png', fullPage: true });
  console.log('Screenshot saved to invite-test-mobile.png');

  const bodyText = await page.textContent('body');
  const hasWelcome = bodyText.includes('Welcome Jake Klinvex');
  const hasAlexPhosra = bodyText.includes('Alex Phosra');
  const hasPhoneInput = bodyText.includes('Send Verification Code');
  const hasNormalLogin = bodyText.includes('Enter your phone number to sign in');

  console.log('Has "Welcome Jake Klinvex":', hasWelcome);
  console.log('Has "Alex Phosra":', hasAlexPhosra);
  console.log('Has phone input:', hasPhoneInput);
  console.log('Has normal login (no invite):', hasNormalLogin);

  await browser.close();
})();
