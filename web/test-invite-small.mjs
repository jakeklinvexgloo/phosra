import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });

  // Test multiple small viewports
  const viewports = [
    { name: 'iPhone SE', width: 375, height: 667 },
    { name: 'iPhone Mini', width: 360, height: 780 },
    { name: 'Galaxy S8', width: 320, height: 658 },
    { name: 'iPhone 14 Pro Max', width: 430, height: 932 },
  ];

  for (const vp of viewports) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    });
    const page = await context.newPage();

    // Track invite API calls
    let inviteApiCalled = false;
    let inviteApiResponse = null;
    page.on('response', async res => {
      if (res.url().includes('/invite/alex')) {
        inviteApiCalled = true;
        try {
          inviteApiResponse = await res.json();
        } catch {}
      }
    });
    page.on('pageerror', err => console.log(`  PAGE ERROR (${vp.name}):`, err.message));

    console.log(`\n--- ${vp.name} (${vp.width}x${vp.height}) ---`);
    await page.goto('https://phosra.com/investors/portal?invite=alex-phosra-invite-2024', {
      waitUntil: 'networkidle',
      timeout: 30000,
    });

    console.log('  Final URL:', page.url());

    // Wait for invite validation
    await page.waitForTimeout(4000);

    console.log('  Invite API called:', inviteApiCalled);
    console.log('  Invite API response:', JSON.stringify(inviteApiResponse));

    const bodyText = await page.textContent('body');
    console.log('  Has "Welcome Jake":', bodyText.includes('Welcome Jake'));
    console.log('  Has "Alex Phosra":', bodyText.includes('Alex Phosra'));
    console.log('  Has normal login:', bodyText.includes('Enter your phone number to sign in'));
    console.log('  Has invite login:', bodyText.includes('verify your identity'));

    const filename = `invite-${vp.name.replace(/\s/g, '-').toLowerCase()}.png`;
    await page.screenshot({ path: filename, fullPage: false });
    console.log('  Screenshot:', filename);

    await context.close();
  }

  await browser.close();
})();
