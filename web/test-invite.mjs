import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Listen for console messages
  page.on('console', msg => console.log('CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  console.log('Navigating to invite link...');
  await page.goto('https://phosra.com/investors/portal?invite=alex-phosra-invite-2024', {
    waitUntil: 'networkidle',
    timeout: 30000,
  });

  // Wait a bit for the invite validation fetch to complete
  await page.waitForTimeout(3000);

  // Take a screenshot
  await page.screenshot({ path: 'invite-test.png', fullPage: true });
  console.log('Screenshot saved to invite-test.png');

  // Get the page text
  const bodyText = await page.textContent('body');
  console.log('\n--- PAGE TEXT ---');
  console.log(bodyText);
  console.log('--- END ---\n');

  // Check for specific elements
  const hasWelcome = bodyText.includes('Welcome');
  const hasAlexPhosra = bodyText.includes('Alex Phosra');
  const hasJakeKlinvex = bodyText.includes('Jake Klinvex');
  const hasPhoneInput = bodyText.includes('Send Verification Code');
  const hasInviteLoading = bodyText.includes('Loading invite');

  console.log('Has "Welcome":', hasWelcome);
  console.log('Has "Alex Phosra":', hasAlexPhosra);
  console.log('Has "Jake Klinvex":', hasJakeKlinvex);
  console.log('Has phone input:', hasPhoneInput);
  console.log('Has invite loading:', hasInviteLoading);

  await browser.close();
})();
