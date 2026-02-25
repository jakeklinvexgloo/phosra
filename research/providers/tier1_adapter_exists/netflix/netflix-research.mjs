/**
 * Netflix Parental Controls Research Script
 *
 * This script uses Playwright to navigate Netflix and capture:
 * - Login flow
 * - Profile picker
 * - Account settings overview
 * - Parental controls (maturity ratings, PIN, title restrictions)
 * - Per-profile settings
 * - Viewing activity/history
 * - Kids profile experience
 *
 * Outputs: screenshots, HAR file, API endpoints
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require('/Users/jakeklinvex/phosra/web/node_modules/playwright/index.js');
import fs from 'fs';
import path from 'path';

const SCREENSHOTS_DIR = '/Users/jakeklinvex/phosra/research/providers/tier1_adapter_exists/netflix/screenshots';
const NETWORK_LOGS_DIR = '/Users/jakeklinvex/phosra/research/providers/tier1_adapter_exists/netflix/network_logs';
const HAR_PATH = path.join(NETWORK_LOGS_DIR, 'netflix.har');
const API_ENDPOINTS_PATH = '/Users/jakeklinvex/phosra/research/providers/tier1_adapter_exists/netflix/api_endpoints.json';

// Netflix credentials
const EMAIL = 'jake.k.klinvex@gmail.com';
const PASSWORD = 'Penny8313!!';

// Collected API endpoints
const apiEndpoints = [];

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function screenshot(page, name) {
  const filePath = path.join(SCREENSHOTS_DIR, `${name}.png`);
  await page.screenshot({ path: filePath, fullPage: true });
  console.log(`  Screenshot: ${name}.png`);
}

async function waitAndScreenshot(page, name, waitMs = 2000) {
  await sleep(waitMs);
  await screenshot(page, name);
}

async function main() {
  console.log('=== Netflix Parental Controls Research ===\n');

  const browser = await chromium.launch({
    headless: true,
    slowMo: 500,
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    recordHar: {
      path: HAR_PATH,
      mode: 'full',
      content: 'omit', // omit binary content to keep HAR file manageable
    },
  });

  // Track API requests
  context.on('request', (request) => {
    const url = request.url();
    const method = request.method();
    // Capture Netflix API calls
    if (url.includes('/api/') || url.includes('/shakti/') || url.includes('/pathEvaluator') ||
        url.includes('/accountaccess') || url.includes('/pin/') || url.includes('/profiles') ||
        url.includes('/settings') || url.includes('/parental') || url.includes('/viewingactivity') ||
        url.includes('/maturity') || url.includes('/restrict') || url.includes('/account')) {
      const postData = request.postData();
      apiEndpoints.push({
        method,
        url,
        postData: postData ? postData.substring(0, 500) : null,
        timestamp: new Date().toISOString(),
        resourceType: request.resourceType(),
      });
    }
  });

  const page = await context.newPage();
  page.setDefaultTimeout(30000);

  try {
    // ===== STEP 1: LOGIN =====
    console.log('Step 1: Login...');
    await page.goto('https://www.netflix.com/login', { waitUntil: 'networkidle' });
    await waitAndScreenshot(page, '01-login-page', 3000);

    // Fill email
    const emailInput = page.locator('input[name="userLoginId"], input[name="email"], input[type="email"], input[id="id_userLoginId"]');
    await emailInput.first().fill(EMAIL);
    await sleep(500);

    // Fill password
    const passwordInput = page.locator('input[name="password"], input[type="password"]');
    await passwordInput.first().fill(PASSWORD);
    await sleep(500);
    await screenshot(page, '02-login-filled');

    // Click sign in
    const signInBtn = page.locator('button[type="submit"], button:has-text("Sign In")');
    await signInBtn.first().click();

    // Wait for navigation after login
    await page.waitForLoadState('networkidle').catch(() => {});
    await sleep(5000);
    await screenshot(page, '03-after-login');
    console.log(`  Current URL: ${page.url()}`);

    // Check if we need to handle any intermediate pages (like "Who's watching?")
    const currentUrl = page.url();

    // ===== STEP 2: PROFILE PICKER =====
    console.log('\nStep 2: Profile picker...');
    if (currentUrl.includes('/browse') || currentUrl.includes('/profiles')) {
      // We may already be on profile picker or browse
      await screenshot(page, '04-profile-picker');
    } else {
      await page.goto('https://www.netflix.com/profiles/manage', { waitUntil: 'networkidle' });
      await waitAndScreenshot(page, '04-profile-picker', 3000);
    }

    // Try navigating to profile management
    await page.goto('https://www.netflix.com/profiles/manage', { waitUntil: 'networkidle' });
    await waitAndScreenshot(page, '05-manage-profiles', 3000);
    console.log(`  Current URL: ${page.url()}`);

    // ===== STEP 3: ACCOUNT SETTINGS =====
    console.log('\nStep 3: Account settings...');
    await page.goto('https://www.netflix.com/account', { waitUntil: 'networkidle' });
    await waitAndScreenshot(page, '06-account-overview', 3000);
    console.log(`  Current URL: ${page.url()}`);

    // Scroll down to capture full account page
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 3));
    await sleep(1000);
    await screenshot(page, '07-account-overview-mid');

    await page.evaluate(() => window.scrollTo(0, (document.body.scrollHeight * 2) / 3));
    await sleep(1000);
    await screenshot(page, '08-account-overview-bottom');

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await sleep(1000);
    await screenshot(page, '09-account-overview-end');

    // ===== STEP 4: PARENTAL CONTROLS =====
    console.log('\nStep 4: Parental controls...');
    await page.goto('https://www.netflix.com/settings/parental-controls', { waitUntil: 'networkidle' });
    await sleep(3000);
    await screenshot(page, '10-parental-controls-landing');
    console.log(`  Current URL: ${page.url()}`);

    // Netflix may require re-authentication for parental controls
    // Check if there's a password prompt
    const passwordGate = page.locator('input[type="password"]');
    if (await passwordGate.count() > 0) {
      console.log('  Password gate detected - re-authenticating...');
      await passwordGate.first().fill(PASSWORD);
      await sleep(500);
      await screenshot(page, '11-parental-controls-password-gate');

      const continueBtn = page.locator('button[type="submit"], button:has-text("Continue"), button:has-text("Submit")');
      if (await continueBtn.count() > 0) {
        await continueBtn.first().click();
        await page.waitForLoadState('networkidle').catch(() => {});
        await sleep(3000);
      }
    }

    await screenshot(page, '12-parental-controls-main');
    console.log(`  Current URL: ${page.url()}`);

    // Try to expand/click on each profile's parental control settings
    // Netflix often shows profile list with expand buttons
    const profileSections = page.locator('[class*="profile"], [data-uia*="profile"], .profile-gate-list .profile-entry, .profile-link, a[href*="profile"]');
    const profileCount = await profileSections.count();
    console.log(`  Found ${profileCount} profile sections`);

    // Scroll through parental controls page
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await sleep(1000);
    await screenshot(page, '13-parental-controls-mid');

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await sleep(1000);
    await screenshot(page, '14-parental-controls-bottom');

    // ===== STEP 5: PROFILE-SPECIFIC PARENTAL CONTROLS =====
    console.log('\nStep 5: Profile-specific settings...');

    // Navigate to the parental controls profile page directly
    // Netflix URL pattern: /settings/parental-controls/profile/<profileId>
    // First let's try the account page to find profile links
    await page.goto('https://www.netflix.com/account', { waitUntil: 'networkidle' });
    await sleep(2000);

    // Find all profile-related links on account page
    const allLinks = await page.locator('a').all();
    const profileLinks = [];
    for (const link of allLinks) {
      const href = await link.getAttribute('href').catch(() => '');
      const text = await link.textContent().catch(() => '');
      if (href && (href.includes('profile') || href.includes('parental') || href.includes('viewing-activity') || href.includes('maturity'))) {
        profileLinks.push({ href, text: text.trim() });
      }
    }
    console.log('  Profile-related links found:', JSON.stringify(profileLinks, null, 2));

    // ===== STEP 6: TRY INDIVIDUAL PARENTAL CONTROL PAGES =====
    console.log('\nStep 6: Individual parental control pages...');

    // Common Netflix parental control URLs
    const parentalUrls = [
      'https://www.netflix.com/settings/parental-controls',
      'https://www.netflix.com/settings/viewing-restrictions',
      'https://www.netflix.com/settings/pin',
      'https://www.netflix.com/settings/viewing-activity',
      'https://www.netflix.com/YourAccount',
      'https://www.netflix.com/profiles/manage',
    ];

    let urlIndex = 15;
    for (const url of parentalUrls) {
      const urlName = url.split('/').pop() || 'page';
      console.log(`  Visiting: ${url}`);
      await page.goto(url, { waitUntil: 'networkidle' }).catch(() => {});
      await sleep(3000);

      // Handle any password gates
      const pwGate = page.locator('input[type="password"]');
      if (await pwGate.count() > 0) {
        await pwGate.first().fill(PASSWORD);
        const submitBtn = page.locator('button[type="submit"]');
        if (await submitBtn.count() > 0) {
          await submitBtn.first().click();
          await page.waitForLoadState('networkidle').catch(() => {});
          await sleep(3000);
        }
      }

      await screenshot(page, `${urlIndex}-${urlName}`);
      console.log(`    Current URL: ${page.url()}`);
      urlIndex++;

      // Scroll to capture full page
      const scrollHeight = await page.evaluate(() => document.body.scrollHeight);
      if (scrollHeight > 1000) {
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await sleep(1000);
        await screenshot(page, `${urlIndex}-${urlName}-scrolled`);
        urlIndex++;
      }
    }

    // ===== STEP 7: PROFILE MANAGEMENT =====
    console.log('\nStep 7: Profile management...');
    await page.goto('https://www.netflix.com/profiles/manage', { waitUntil: 'networkidle' });
    await sleep(3000);
    await screenshot(page, `${urlIndex++}-profiles-manage`);

    // Click on each profile to see its edit page
    const profileEls = page.locator('.profile-button, .choose-profile .profile, [data-uia="profile-button"], li.profile, a[href*="profiles"]');
    const numProfiles = await profileEls.count();
    console.log(`  Found ${numProfiles} profile elements on manage page`);

    // Try to click on individual profiles
    if (numProfiles > 0) {
      for (let i = 0; i < Math.min(numProfiles, 6); i++) {
        try {
          const profileEl = profileEls.nth(i);
          const text = await profileEl.textContent().catch(() => `Profile ${i}`);
          console.log(`  Clicking profile: ${text.trim()}`);
          await profileEl.click();
          await sleep(3000);
          await screenshot(page, `${urlIndex++}-profile-${i}-edit`);
          console.log(`    URL: ${page.url()}`);

          // Check for kids toggle, maturity settings, etc.
          const kidsToggle = page.locator('[data-uia*="kids"], input[name*="kids"], .kids-profile');
          if (await kidsToggle.count() > 0) {
            console.log('    Found kids profile toggle!');
            await screenshot(page, `${urlIndex++}-profile-${i}-kids-toggle`);
          }

          // Scroll down for more settings
          await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
          await sleep(1000);
          await screenshot(page, `${urlIndex++}-profile-${i}-edit-bottom`);

          // Go back to manage profiles
          await page.goto('https://www.netflix.com/profiles/manage', { waitUntil: 'networkidle' });
          await sleep(2000);
        } catch (e) {
          console.log(`  Error with profile ${i}: ${e.message}`);
        }
      }
    }

    // ===== STEP 8: VIEWING ACTIVITY =====
    console.log('\nStep 8: Viewing activity...');
    // Netflix viewing activity URL per profile
    await page.goto('https://www.netflix.com/settings/viewed/', { waitUntil: 'networkidle' });
    await sleep(3000);

    // Handle password gate
    const vaPasswordGate = page.locator('input[type="password"]');
    if (await vaPasswordGate.count() > 0) {
      await vaPasswordGate.first().fill(PASSWORD);
      const submitBtn = page.locator('button[type="submit"]');
      if (await submitBtn.count() > 0) {
        await submitBtn.first().click();
        await page.waitForLoadState('networkidle').catch(() => {});
        await sleep(3000);
      }
    }

    await screenshot(page, `${urlIndex++}-viewing-activity`);
    console.log(`  Current URL: ${page.url()}`);

    // Scroll for more activity
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await sleep(1000);
    await screenshot(page, `${urlIndex++}-viewing-activity-bottom`);

    // Also try viewing-activity directly
    await page.goto('https://www.netflix.com/viewingactivity', { waitUntil: 'networkidle' });
    await sleep(3000);
    await screenshot(page, `${urlIndex++}-viewing-activity-alt`);

    // ===== STEP 9: KIDS PROFILE EXPERIENCE =====
    console.log('\nStep 9: Kids profile experience...');
    // Go to browse page and look for Kids profile
    await page.goto('https://www.netflix.com/browse', { waitUntil: 'networkidle' });
    await sleep(3000);

    // Look for a profile switcher
    await screenshot(page, `${urlIndex++}-browse-main`);

    // Try to switch to kids profile via the profile switcher dropdown
    // Netflix has a profile menu in the top-right corner
    const profileMenu = page.locator('.profile-icon, [data-uia="profile-menu-icon"], .account-menu-item');
    if (await profileMenu.count() > 0) {
      await profileMenu.first().hover();
      await sleep(1500);
      await screenshot(page, `${urlIndex++}-profile-dropdown`);

      // Look for kids profile in dropdown
      const kidsOption = page.locator('a:has-text("Kids"), span:has-text("Kids"), [data-uia*="kids"]');
      if (await kidsOption.count() > 0) {
        console.log('  Found Kids profile option, clicking...');
        await kidsOption.first().click();
        await page.waitForLoadState('networkidle').catch(() => {});
        await sleep(5000);
        await screenshot(page, `${urlIndex++}-kids-browse`);
        console.log(`  Kids URL: ${page.url()}`);

        // Scroll the Kids experience
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
        await sleep(1000);
        await screenshot(page, `${urlIndex++}-kids-browse-mid`);

        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await sleep(1000);
        await screenshot(page, `${urlIndex++}-kids-browse-bottom`);
      }
    }

    // Also try direct kids URL
    await page.goto('https://www.netflix.com/kids', { waitUntil: 'networkidle' });
    await sleep(3000);
    await screenshot(page, `${urlIndex++}-kids-direct`);
    console.log(`  Kids direct URL: ${page.url()}`);

    // ===== STEP 10: MATURITY RATING SETTINGS =====
    console.log('\nStep 10: Maturity rating settings...');
    await page.goto('https://www.netflix.com/settings/maturity-level', { waitUntil: 'networkidle' });
    await sleep(3000);

    const mlPasswordGate = page.locator('input[type="password"]');
    if (await mlPasswordGate.count() > 0) {
      await mlPasswordGate.first().fill(PASSWORD);
      const submitBtn = page.locator('button[type="submit"]');
      if (await submitBtn.count() > 0) {
        await submitBtn.first().click();
        await page.waitForLoadState('networkidle').catch(() => {});
        await sleep(3000);
      }
    }

    await screenshot(page, `${urlIndex++}-maturity-settings`);
    console.log(`  Current URL: ${page.url()}`);

    // ===== STEP 11: ADDITIONAL SETTINGS PAGES =====
    console.log('\nStep 11: Additional settings...');

    const additionalUrls = [
      'https://www.netflix.com/settings/profile-lock',
      'https://www.netflix.com/settings/autoplay',
      'https://www.netflix.com/ManageProfiles',
      'https://www.netflix.com/switchprofiles',
    ];

    for (const url of additionalUrls) {
      const pageName = url.split('/').pop() || 'page';
      console.log(`  Visiting: ${url}`);
      try {
        await page.goto(url, { waitUntil: 'networkidle' }).catch(() => {});
        await sleep(3000);

        // Handle password gates
        const pwGate2 = page.locator('input[type="password"]');
        if (await pwGate2.count() > 0) {
          await pwGate2.first().fill(PASSWORD);
          const submitBtn = page.locator('button[type="submit"]');
          if (await submitBtn.count() > 0) {
            await submitBtn.first().click();
            await page.waitForLoadState('networkidle').catch(() => {});
            await sleep(3000);
          }
        }

        await screenshot(page, `${urlIndex++}-${pageName}`);
        console.log(`    Current URL: ${page.url()}`);
      } catch (e) {
        console.log(`    Error: ${e.message}`);
      }
    }

    // ===== STEP 12: EXPLORE ACCOUNT SETTINGS IN DETAIL =====
    console.log('\nStep 12: Detailed account exploration...');
    await page.goto('https://www.netflix.com/account', { waitUntil: 'networkidle' });
    await sleep(3000);

    // Find and click on all expandable sections and links on the account page
    const expandBtns = page.locator('[data-uia*="expand"], [aria-expanded], button.section-header, .accordion-toggle, details summary');
    const expandCount = await expandBtns.count();
    console.log(`  Found ${expandCount} expandable sections`);

    for (let i = 0; i < Math.min(expandCount, 10); i++) {
      try {
        await expandBtns.nth(i).click();
        await sleep(1000);
      } catch (e) {
        // ignore click errors
      }
    }
    await screenshot(page, `${urlIndex++}-account-all-expanded`);

    // Capture all links on account page for documentation
    const accountLinks = await page.locator('a').evaluateAll(links =>
      links.map(l => ({ href: l.href, text: l.textContent?.trim() }))
        .filter(l => l.href && !l.href.includes('javascript'))
    );
    console.log('\n  Account page links:');
    for (const link of accountLinks) {
      if (link.text && link.text.length > 0 && link.text.length < 100) {
        console.log(`    ${link.text}: ${link.href}`);
      }
    }

    console.log('\n=== Research Complete ===');
    console.log(`Screenshots saved to: ${SCREENSHOTS_DIR}`);
    console.log(`HAR file saved to: ${HAR_PATH}`);
    console.log(`API endpoints captured: ${apiEndpoints.length}`);

  } catch (error) {
    console.error('Error during research:', error.message);
    // Take error screenshot
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'ERROR.png'), fullPage: true }).catch(() => {});
  } finally {
    // Save API endpoints
    fs.writeFileSync(API_ENDPOINTS_PATH, JSON.stringify(apiEndpoints, null, 2));
    console.log(`API endpoints written to: ${API_ENDPOINTS_PATH}`);

    // Close context (this triggers HAR file write)
    await context.close();
    await browser.close();
    console.log('Browser closed.');
  }
}

main().catch(console.error);
