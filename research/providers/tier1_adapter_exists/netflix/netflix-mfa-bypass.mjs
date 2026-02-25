/**
 * Netflix MFA Bypass - Get past the parental controls MFA gate
 * by clicking "Confirm password" option and entering the account password.
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require('/Users/jakeklinvex/phosra/web/node_modules/playwright/index.js');
import fs from 'fs';
import path from 'path';

const SCREENSHOTS_DIR = '/Users/jakeklinvex/phosra/research/providers/tier1_adapter_exists/netflix/screenshots';
const EMAIL = 'jake.k.klinvex@gmail.com';
const PASSWORD = 'Penny8313!!';

const PROFILES = [
  { name: 'Ramsay', id: '2CLVMNZPRFEOBK32A26RG4FNJQ' },
  { name: 'MomAndDad', id: '4GSBFXDY4FGBDJLJMCAVJDROXA' },
  { name: 'Samson', id: 'IUJ4RFGSNBB37IVR2DMKPSEKHQ' },
  { name: 'Chap', id: 'FTVLJUZKORCHFF4PHAFU5ZVDPQ' },
  { name: 'Banana', id: '63N6R2CUCBCONFXN3YQXV3JGRI' },
];

const apiEndpoints = [];

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function screenshot(page, name) {
  const filePath = path.join(SCREENSHOTS_DIR, `${name}.png`);
  await page.screenshot({ path: filePath, fullPage: true });
  console.log(`  Screenshot: ${name}.png`);
}

async function passMfaGate(page) {
  // Look for the MFA page "Confirm password" option
  const confirmPwBtn = page.locator('button:has-text("Confirm password"), a:has-text("Confirm password"), div:has-text("Confirm password")').first();
  if (await confirmPwBtn.isVisible().catch(() => false)) {
    console.log('  MFA gate detected - clicking "Confirm password"...');
    await confirmPwBtn.click();
    await sleep(3000);

    // Now enter password
    const pwInput = page.locator('input[type="password"]');
    if (await pwInput.count() > 0) {
      await pwInput.first().fill(PASSWORD);
      await sleep(500);

      // Click submit/continue
      const submitBtn = page.locator('button[type="submit"], button:has-text("Submit"), button:has-text("Continue"), button:has-text("Confirm")');
      if (await submitBtn.count() > 0) {
        await submitBtn.first().click();
        await page.waitForLoadState('networkidle').catch(() => {});
        await sleep(5000);
        return true;
      }
    }
  }
  return false;
}

async function main() {
  console.log('=== Netflix MFA Bypass - Parental Controls Deep Access ===\n');

  const browser = await chromium.launch({
    headless: true,
    slowMo: 500,
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });

  // Track API requests
  context.on('request', (request) => {
    const url = request.url();
    const method = request.method();
    if (!url.includes('/dnm/') && !url.includes('.css') && !url.includes('.js') && !url.includes('.woff') &&
        !url.includes('.png') && !url.includes('.jpg') && !url.includes('.webp') && !url.includes('.svg') &&
        (url.includes('/api/') || url.includes('/shakti/') || url.includes('/pathEvaluator') ||
         url.includes('/pin') || url.includes('/profiles') || url.includes('/settings') ||
         url.includes('/parental') || url.includes('/maturity') || url.includes('/restrict') ||
         url.includes('/account') || url.includes('/viewing') || url.includes('/mfa') ||
         url.includes('/lock') || url.includes('/nq/'))) {
      apiEndpoints.push({
        method,
        url,
        postData: request.postData()?.substring(0, 500) || null,
        timestamp: new Date().toISOString(),
      });
    }
  });

  const page = await context.newPage();
  page.setDefaultTimeout(30000);

  try {
    // ===== LOGIN =====
    console.log('Logging in...');
    await page.goto('https://www.netflix.com/login', { waitUntil: 'networkidle' });
    await sleep(2000);
    await page.locator('input[name="userLoginId"], input[name="email"], input[type="email"]').first().fill(EMAIL);
    await page.locator('input[name="password"], input[type="password"]').first().fill(PASSWORD);
    await page.locator('button[type="submit"]').first().click();
    await page.waitForLoadState('networkidle').catch(() => {});
    await sleep(5000);
    console.log(`  Logged in. URL: ${page.url()}`);

    // ===== TRY MFA BYPASS FOR PARENTAL CONTROLS =====
    console.log('\n--- Attempting to access Parental Controls via "Confirm password" MFA ---');

    // Go to Account > Profiles page, click "Adjust parental controls"
    await page.goto('https://www.netflix.com/account/profiles', { waitUntil: 'networkidle' });
    await sleep(2000);
    await screenshot(page, 'mfa-01-profiles-page');

    // Click "Adjust parental controls"
    const adjustLink = page.locator('a:has-text("Adjust parental controls"), button:has-text("Adjust parental controls")');
    if (await adjustLink.count() > 0) {
      console.log('  Clicking "Adjust parental controls"...');
      await adjustLink.first().click();
      await page.waitForLoadState('networkidle').catch(() => {});
      await sleep(3000);
      await screenshot(page, 'mfa-02-mfa-page');
      console.log(`  URL: ${page.url()}`);

      // Click "Confirm password"
      const passed = await passMfaGate(page);
      await screenshot(page, 'mfa-03-after-password');
      console.log(`  MFA passed: ${passed}, URL: ${page.url()}`);

      if (page.url().includes('parental') || page.url().includes('settings')) {
        console.log('  SUCCESS - Reached parental controls!');

        // Screenshot full page
        await screenshot(page, 'mfa-04-parental-controls-main');

        // Scroll through
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 3));
        await sleep(1000);
        await screenshot(page, 'mfa-05-parental-controls-scroll1');

        await page.evaluate(() => window.scrollTo(0, (document.body.scrollHeight * 2) / 3));
        await sleep(1000);
        await screenshot(page, 'mfa-06-parental-controls-scroll2');

        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await sleep(1000);
        await screenshot(page, 'mfa-07-parental-controls-scroll3');

        // Try clicking on each profile's parental control settings
        for (const profile of PROFILES) {
          console.log(`\n  Checking profile: ${profile.name}`);

          // Look for profile-specific links
          const profileLink = page.locator(`a:has-text("${profile.name}"), button:has-text("${profile.name}")`);
          if (await profileLink.count() > 0) {
            console.log(`    Clicking on ${profile.name}...`);
            await profileLink.first().click();
            await page.waitForLoadState('networkidle').catch(() => {});
            await sleep(3000);
            await screenshot(page, `mfa-profile-${profile.name}-parental`);
            console.log(`    URL: ${page.url()}`);

            // Scroll to capture all settings
            const height = await page.evaluate(() => document.body.scrollHeight);
            if (height > 1000) {
              await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
              await sleep(1000);
              await screenshot(page, `mfa-profile-${profile.name}-parental-mid`);

              await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
              await sleep(1000);
              await screenshot(page, `mfa-profile-${profile.name}-parental-bottom`);
            }

            // Go back
            await page.goBack().catch(() => {});
            await sleep(2000);
          }
        }
      } else {
        console.log('  Could not get past MFA - trying direct URL approach...');

        // Try direct parental controls URLs that might work after the MFA session
        const directUrls = [
          'https://www.netflix.com/settings/parental-controls/profile',
          'https://www.netflix.com/account/parental-controls',
          'https://www.netflix.com/settings/maturity',
        ];

        for (const url of directUrls) {
          await page.goto(url, { waitUntil: 'networkidle' }).catch(() => {});
          await sleep(3000);
          const pageName = url.split('/').pop();
          await screenshot(page, `mfa-direct-${pageName}`);
          console.log(`  Direct URL ${pageName}: ${page.url()}`);

          // Try MFA gate again if present
          await passMfaGate(page);
          await sleep(2000);
          await screenshot(page, `mfa-direct-${pageName}-after`);
        }
      }
    }

    // ===== ALSO: Capture the manage profiles edit screen (with Kids toggle) =====
    console.log('\n--- Capture ManageProfiles edit screens with Kids toggle ---');
    await page.goto('https://www.netflix.com/ManageProfiles', { waitUntil: 'networkidle' });
    await sleep(3000);
    await screenshot(page, 'mfa-manage-profiles');

    // Click edit icon on each profile
    const editBtns = page.locator('.profile-button, [class*="profile-entry"], a[href*="ManageSubProfile"], .profile-edit');
    const editCount = await editBtns.count();
    console.log(`  Found ${editCount} profile edit buttons`);

    for (let i = 0; i < Math.min(editCount, 6); i++) {
      try {
        await editBtns.nth(i).click();
        await sleep(3000);
        await screenshot(page, `mfa-manage-profile-${i}-edit`);
        console.log(`  Profile ${i} edit URL: ${page.url()}`);

        // Look for Kids checkbox/toggle
        const kidsEl = page.locator('#isKids, input[name="isKids"], [data-uia*="kids"], label:has-text("Kids"), .isKids-button');
        if (await kidsEl.count() > 0) {
          console.log(`  Found Kids toggle for profile ${i}!`);
        }

        // Go back to manage profiles
        await page.goto('https://www.netflix.com/ManageProfiles', { waitUntil: 'networkidle' });
        await sleep(2000);
      } catch (e) {
        console.log(`  Profile ${i} error: ${e.message}`);
      }
    }

    console.log('\n=== MFA Bypass Attempt Complete ===');
    console.log(`API endpoints captured: ${apiEndpoints.length}`);

  } catch (error) {
    console.error('Error:', error.message);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'mfa-ERROR.png'), fullPage: true }).catch(() => {});
  } finally {
    // Append new API endpoints
    const existingPath = '/Users/jakeklinvex/phosra/research/providers/tier1_adapter_exists/netflix/api_endpoints.json';
    let existing = [];
    try { existing = JSON.parse(fs.readFileSync(existingPath, 'utf8')); } catch (e) {}
    const merged = [...existing, ...apiEndpoints];
    fs.writeFileSync(existingPath, JSON.stringify(merged, null, 2));
    console.log(`Total API endpoints: ${merged.length}`);

    await context.close();
    await browser.close();
    console.log('Browser closed.');
  }
}

main().catch(console.error);
