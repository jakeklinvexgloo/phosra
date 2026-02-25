/**
 * Netflix Deep Dive - Parental Controls Inner Pages
 *
 * This script navigates into the actual parental controls settings
 * (maturity rating slider, title restrictions, PIN) which require
 * password re-authentication on Netflix.
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require('/Users/jakeklinvex/phosra/web/node_modules/playwright/index.js');
import fs from 'fs';
import path from 'path';

const SCREENSHOTS_DIR = '/Users/jakeklinvex/phosra/research/providers/tier1_adapter_exists/netflix/screenshots';
const EMAIL = 'jake.k.klinvex@gmail.com';
const PASSWORD = 'Penny8313!!';

// Profile IDs found from first run
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

async function handlePasswordGate(page) {
  const pwInput = page.locator('input[type="password"]');
  if (await pwInput.count() > 0) {
    console.log('  Password gate detected - entering password...');
    await pwInput.first().fill(PASSWORD);
    await sleep(500);
    const submitBtn = page.locator('button[type="submit"], button:has-text("Continue"), button:has-text("Submit")');
    if (await submitBtn.count() > 0) {
      await submitBtn.first().click();
      await page.waitForLoadState('networkidle').catch(() => {});
      await sleep(3000);
      return true;
    }
  }
  return false;
}

async function main() {
  console.log('=== Netflix Deep Dive - Parental Controls Inner Pages ===\n');

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
    if (url.includes('/api/') || url.includes('/shakti/') || url.includes('/pathEvaluator') ||
        url.includes('/pin/') || url.includes('/profiles') || url.includes('/settings') ||
        url.includes('/parental') || url.includes('/maturity') || url.includes('/restrict') ||
        url.includes('/account') || url.includes('/viewing')) {
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

    const emailInput = page.locator('input[name="userLoginId"], input[name="email"], input[type="email"], input[id="id_userLoginId"]');
    await emailInput.first().fill(EMAIL);
    const passwordInput = page.locator('input[name="password"], input[type="password"]');
    await passwordInput.first().fill(PASSWORD);
    const signInBtn = page.locator('button[type="submit"], button:has-text("Sign In")');
    await signInBtn.first().click();
    await page.waitForLoadState('networkidle').catch(() => {});
    await sleep(5000);
    console.log(`  Logged in. URL: ${page.url()}`);

    // ===== DEEP DIVE: Click "Adjust Parental Controls" from profile settings =====
    console.log('\n--- Deep Dive: Parental Controls for each profile ---');

    for (const profile of PROFILES) {
      console.log(`\nProfile: ${profile.name} (${profile.id})`);

      // Go to profile settings page
      await page.goto(`https://www.netflix.com/settings/${profile.id}`, { waitUntil: 'networkidle' });
      await sleep(2000);
      await screenshot(page, `deep-${profile.name}-settings`);

      // Click on "Adjust Parental Controls"
      const parentalLink = page.locator('a:has-text("Adjust Parental Controls"), button:has-text("Adjust Parental Controls"), [href*="parental"]');
      if (await parentalLink.count() > 0) {
        console.log('  Clicking "Adjust Parental Controls"...');
        await parentalLink.first().click();
        await page.waitForLoadState('networkidle').catch(() => {});
        await sleep(3000);
        await handlePasswordGate(page);
        await screenshot(page, `deep-${profile.name}-parental-controls`);
        console.log(`  URL: ${page.url()}`);

        // Scroll to see all content
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
        await sleep(1000);
        await screenshot(page, `deep-${profile.name}-parental-controls-mid`);

        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await sleep(1000);
        await screenshot(page, `deep-${profile.name}-parental-controls-bottom`);

        // Look for maturity rating slider
        const maturitySlider = page.locator('[class*="maturity"], [data-uia*="maturity"], input[type="range"], .slider');
        if (await maturitySlider.count() > 0) {
          console.log('  Found maturity rating control!');
          await screenshot(page, `deep-${profile.name}-maturity-slider`);
        }

        // Look for title restrictions
        const titleRestrictions = page.locator('[class*="restriction"], [data-uia*="restriction"], :text("Restrict specific")');
        if (await titleRestrictions.count() > 0) {
          console.log('  Found title restrictions!');
        }

        // Look for any expandable sections and click them
        const expandables = page.locator('details:not([open]) summary, [aria-expanded="false"], button:has-text("Show"), button:has-text("More")');
        const expandCount = await expandables.count();
        for (let i = 0; i < Math.min(expandCount, 5); i++) {
          try {
            await expandables.nth(i).click();
            await sleep(500);
          } catch (e) {}
        }
        if (expandCount > 0) {
          await sleep(1000);
          await screenshot(page, `deep-${profile.name}-parental-expanded`);
        }
      } else {
        console.log('  No "Adjust Parental Controls" link found on this page');
      }

      // Click on "Profile Lock"
      await page.goto(`https://www.netflix.com/settings/${profile.id}`, { waitUntil: 'networkidle' });
      await sleep(2000);
      const profileLockLink = page.locator('a:has-text("Profile Lock"), button:has-text("Profile Lock"), [href*="profile-lock"]');
      if (await profileLockLink.count() > 0) {
        console.log('  Clicking "Profile Lock"...');
        await profileLockLink.first().click();
        await page.waitForLoadState('networkidle').catch(() => {});
        await sleep(3000);
        await handlePasswordGate(page);
        await screenshot(page, `deep-${profile.name}-profile-lock`);
        console.log(`  URL: ${page.url()}`);
      }

      // Click on "Viewing activity"
      await page.goto(`https://www.netflix.com/settings/${profile.id}`, { waitUntil: 'networkidle' });
      await sleep(2000);
      const viewingLink = page.locator('a:has-text("Viewing activity"), button:has-text("Viewing activity"), [href*="viewing"]');
      if (await viewingLink.count() > 0) {
        console.log('  Clicking "Viewing activity"...');
        await viewingLink.first().click();
        await page.waitForLoadState('networkidle').catch(() => {});
        await sleep(3000);
        await handlePasswordGate(page);
        await screenshot(page, `deep-${profile.name}-viewing-activity`);
        console.log(`  URL: ${page.url()}`);
      }

      // Click on "Playback settings"
      await page.goto(`https://www.netflix.com/settings/${profile.id}`, { waitUntil: 'networkidle' });
      await sleep(2000);
      const playbackLink = page.locator('a:has-text("Playback settings"), button:has-text("Playback settings"), [href*="playback"]');
      if (await playbackLink.count() > 0) {
        console.log('  Clicking "Playback settings"...');
        await playbackLink.first().click();
        await page.waitForLoadState('networkidle').catch(() => {});
        await sleep(3000);
        await screenshot(page, `deep-${profile.name}-playback`);
        console.log(`  URL: ${page.url()}`);
      }

      // Click on "Privacy and data settings"
      await page.goto(`https://www.netflix.com/settings/${profile.id}`, { waitUntil: 'networkidle' });
      await sleep(2000);
      const privacyLink = page.locator('a:has-text("Privacy and data"), button:has-text("Privacy and data"), [href*="privacy"]');
      if (await privacyLink.count() > 0) {
        console.log('  Clicking "Privacy and data settings"...');
        await privacyLink.first().click();
        await page.waitForLoadState('networkidle').catch(() => {});
        await sleep(3000);
        await screenshot(page, `deep-${profile.name}-privacy`);
        console.log(`  URL: ${page.url()}`);

        // Scroll to see all privacy settings
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await sleep(1000);
        await screenshot(page, `deep-${profile.name}-privacy-bottom`);
      }
    }

    // ===== DEEP DIVE: Account-level security settings =====
    console.log('\n--- Deep Dive: Account Security Settings ---');
    await page.goto('https://www.netflix.com/account/security', { waitUntil: 'networkidle' });
    await sleep(3000);
    await screenshot(page, 'deep-account-security');
    console.log(`  URL: ${page.url()}`);

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await sleep(1000);
    await screenshot(page, 'deep-account-security-bottom');

    // ===== DEEP DIVE: Manage access and devices =====
    console.log('\n--- Deep Dive: Manage Access and Devices ---');
    await page.goto('https://www.netflix.com/account/devices', { waitUntil: 'networkidle' });
    await sleep(3000);
    await screenshot(page, 'deep-manage-devices');
    console.log(`  URL: ${page.url()}`);

    // ===== DEEP DIVE: Account profiles page =====
    console.log('\n--- Deep Dive: Account Profiles ---');
    await page.goto('https://www.netflix.com/account/profiles', { waitUntil: 'networkidle' });
    await sleep(3000);
    await screenshot(page, 'deep-account-profiles');
    console.log(`  URL: ${page.url()}`);

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await sleep(1000);
    await screenshot(page, 'deep-account-profiles-bottom');

    // ===== DEEP DIVE: Transfer profile page =====
    console.log('\n--- Deep Dive: Transfer Profile ---');
    await page.goto('https://www.netflix.com/account/profile/transfercontext', { waitUntil: 'networkidle' });
    await sleep(3000);
    await screenshot(page, 'deep-transfer-profile');
    console.log(`  URL: ${page.url()}`);

    console.log('\n=== Deep Dive Complete ===');
    console.log(`API endpoints captured: ${apiEndpoints.length}`);

  } catch (error) {
    console.error('Error:', error.message);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'deep-ERROR.png'), fullPage: true }).catch(() => {});
  } finally {
    // Merge new API endpoints with existing ones
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
