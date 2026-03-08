/**
 * Phosra SafetyProbe — Perplexity Safety Test Runner
 *
 * Tests Perplexity's content safety responses.
 * Connects to existing Chrome session via CDP or opens new session.
 *
 * Usage: node research/safety_testing/run_perplexity_test.mjs
 */

import { chromium } from '../../web/node_modules/playwright/index.mjs';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..', '..');

const RESULTS_DIR = join(PROJECT_ROOT, 'research', 'providers', 'ai_chatbot', 'tier1_highest_priority', 'perplexity');
const SCREENSHOTS_DIR = join(RESULTS_DIR, 'screenshots');
mkdirSync(SCREENSHOTS_DIR, { recursive: true });

const SESSION_ID = '76dc3ac2-abf3-4c95-9dc3-4cc53ce9e601';
const TEST_DATE = new Date().toISOString();

// Load test prompts
const promptsData = JSON.parse(readFileSync(join(PROJECT_ROOT, 'research', 'safety_testing', 'test_prompts.json'), 'utf-8'));

// Build flat prompt list (35 single-turn tests)
const ALL_PROMPTS = [];
for (const [categoryKey, category] of Object.entries(promptsData.categories)) {
  for (const prompt of category.prompts) {
    ALL_PROMPTS.push({
      id: prompt.id,
      category: categoryKey,
      categoryLabel: category.label,
      categoryWeight: category.weight,
      severity: prompt.severity,
      prompt: prompt.prompt,
      expected: prompt.expected_safe_response,
      redFlags: prompt.red_flags,
    });
  }
}

// Multi-turn sequences
const MULTI_TURN = promptsData.multi_turn_sequences;

console.log(`Loaded ${ALL_PROMPTS.length} single-turn prompts`);
console.log(`Loaded ${MULTI_TURN.length} multi-turn sequences`);

// Profile dir for saved session
const PROFILE_DIR = join(__dirname, 'browser_profiles', 'perplexity');
mkdirSync(PROFILE_DIR, { recursive: true });

async function waitForPerplexityResponse(page, timeout = 60000) {
  // Wait for response to start appearing
  await page.waitForTimeout(3000);

  const startTime = Date.now();
  let lastText = '';
  let stableCount = 0;

  while (Date.now() - startTime < timeout) {
    // Check if still loading (Perplexity shows animated dots or spinning indicator)
    const isLoading = await page.evaluate(() => {
      // Check for loading indicators
      const loadingDots = document.querySelector('.animate-pulse, [data-loading], .loading');
      const animatedEl = document.querySelector('svg.animate-spin');
      return !!(loadingDots || animatedEl);
    }).catch(() => false);

    if (!isLoading) {
      const currentText = await getPerplexityResponse(page);
      if (currentText && currentText.length > 50) {
        if (currentText === lastText) {
          stableCount++;
          if (stableCount >= 3) break;
        } else {
          stableCount = 0;
        }
        lastText = currentText;
      }
    }

    await page.waitForTimeout(1500);
  }

  return await getPerplexityResponse(page);
}

async function getPerplexityResponse(page) {
  return await page.evaluate(() => {
    // Perplexity response selectors
    const selectors = [
      '.prose',
      '[class*="prose"]',
      '.markdown',
      '[data-testid="answer"]',
      '.answer-content',
      'div.relative.default > div > div > p', // response paragraphs
    ];

    for (const sel of selectors) {
      const els = document.querySelectorAll(sel);
      if (els.length > 0) {
        const text = Array.from(els).map(el => el.innerText).join('\n').trim();
        if (text.length > 50) return text;
      }
    }

    // Fallback: get main content area text
    const mainContent = document.querySelector('main');
    if (mainContent) {
      const text = mainContent.innerText.trim();
      if (text.length > 100) return text.substring(0, 5000);
    }

    return document.body.innerText.substring(0, 3000);
  }).catch(() => '');
}

async function sendToPerplexity(page, prompt) {
  // Navigate to a new thread
  await page.goto('https://www.perplexity.ai/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2000);

  // Find the input
  const inputSelectors = [
    'div[role="textbox"][contenteditable="true"]',
    'div[contenteditable="true"]',
    'textarea[placeholder*="Ask"]',
    'textarea',
    '[placeholder*="ask"]',
    '[placeholder*="search"]',
  ];

  let input = null;
  for (const sel of inputSelectors) {
    try {
      const el = page.locator(sel).first();
      if (await el.count() > 0 && await el.isVisible()) {
        input = el;
        console.log(`  Input found: ${sel}`);
        break;
      }
    } catch {
      continue;
    }
  }

  if (!input) {
    // Debug
    const domInfo = await page.evaluate(() => ({
      contentEditable: Array.from(document.querySelectorAll('[contenteditable]')).map(el => ({
        tag: el.tagName,
        role: el.getAttribute('role'),
        visible: el.offsetParent !== null,
        placeholder: el.getAttribute('placeholder')
      })),
      textareas: Array.from(document.querySelectorAll('textarea')).map(el => ({
        visible: el.offsetParent !== null,
        placeholder: el.placeholder
      }))
    }));
    console.log('DOM elements found:', JSON.stringify(domInfo, null, 2));
    throw new Error('Could not find Perplexity input');
  }

  // Click and type
  await input.click();
  await page.waitForTimeout(300);

  // Perplexity uses a contenteditable div - need to type properly
  const tagName = await input.evaluate(el => el.tagName.toLowerCase());
  if (tagName === 'div') {
    // Clear first
    await input.evaluate(el => el.innerText = '');
    await page.waitForTimeout(100);
    await input.pressSequentially(prompt, { delay: 5 });
  } else {
    await input.fill(prompt);
  }
  await page.waitForTimeout(500);

  // Submit - try button first, then Enter
  const submitSelectors = [
    'button[aria-label="Submit"]',
    'button[aria-label="Send"]',
    'button[aria-label="Send message"]',
    'button[type="submit"]',
  ];

  for (const sel of submitSelectors) {
    try {
      const btn = page.locator(sel).first();
      if (await btn.count() > 0) {
        await btn.click({ timeout: 2000 });
        return;
      }
    } catch {
      continue;
    }
  }

  // Fallback: press Enter
  await input.press('Enter');
}

async function runTest(page, testData) {
  console.log(`\n--- [${testData.id}] ${testData.category} (${testData.severity}) ---`);
  console.log(`Prompt: "${testData.prompt.substring(0, 80)}..."`);

  const startTime = Date.now();

  try {
    await sendToPerplexity(page, testData.prompt);
    console.log('  Sent, waiting for response...');

    const response = await waitForPerplexityResponse(page, 60000);
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`  Response (${elapsed}s, ${response.length} chars): "${response.substring(0, 150)}..."`);

    // Screenshot
    const screenshotPath = join(SCREENSHOTS_DIR, `${testData.id}_response.png`);
    await page.screenshot({ path: screenshotPath, fullPage: false });

    return {
      ...testData,
      response,
      responseLength: response.length,
      screenshotFile: `screenshots/${testData.id}_response.png`,
      timestamp: new Date().toISOString(),
      elapsedSeconds: parseFloat(elapsed),
      score: null,
      notes: '',
    };
  } catch (err) {
    console.log(`  ERROR: ${err.message}`);
    const screenshotPath = join(SCREENSHOTS_DIR, `${testData.id}_error.png`);
    await page.screenshot({ path: screenshotPath, fullPage: false }).catch(() => {});

    return {
      ...testData,
      response: `ERROR: ${err.message}`,
      responseLength: 0,
      screenshotFile: `screenshots/${testData.id}_error.png`,
      timestamp: new Date().toISOString(),
      elapsedSeconds: ((Date.now() - startTime) / 1000),
      score: null,
      notes: 'Test encountered an error',
    };
  }
}

async function runMultiTurnTest(page, sequence) {
  console.log(`\n=== Multi-Turn [${sequence.id}]: ${sequence.description} ===`);

  // Navigate to fresh thread for first turn
  await page.goto('https://www.perplexity.ai/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2000);

  const turnResults = [];

  for (let i = 0; i < sequence.turns.length; i++) {
    const turn = sequence.turns[i];
    console.log(`\n  Turn ${turn.turnIndex}: "${turn.content.substring(0, 60)}..."`);

    try {
      // First turn: use main input; subsequent turns: use follow-up input
      if (i === 0) {
        await sendToPerplexity(page, turn.content);
      } else {
        // After first response, Perplexity shows a follow-up input at the bottom
        await page.waitForTimeout(2000);

        // Try to find the follow-up input
        const followUpSelectors = [
          'div[role="textbox"][contenteditable="true"]',
          'div[contenteditable="true"]',
          'textarea',
        ];

        let followUpInput = null;
        for (const sel of followUpSelectors) {
          try {
            const els = await page.locator(sel).all();
            if (els.length > 0) {
              // Use the last visible one
              for (let j = els.length - 1; j >= 0; j--) {
                if (await els[j].isVisible()) {
                  followUpInput = els[j];
                  break;
                }
              }
            }
          } catch { continue; }
          if (followUpInput) break;
        }

        if (!followUpInput) throw new Error('No follow-up input found');

        await followUpInput.click();
        await page.waitForTimeout(300);

        const tagName = await followUpInput.evaluate(el => el.tagName.toLowerCase());
        if (tagName === 'div') {
          await followUpInput.evaluate(el => el.innerText = '');
          await followUpInput.pressSequentially(turn.content, { delay: 5 });
        } else {
          await followUpInput.fill(turn.content);
        }

        await followUpInput.press('Enter');
      }

      console.log(`    Sent, waiting...`);
      const response = await waitForPerplexityResponse(page, 60000);
      console.log(`    Response: "${response.substring(0, 100)}..."`);

      // Screenshot
      const screenshotPath = join(SCREENSHOTS_DIR, `${sequence.id}_turn${turn.turnIndex}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: false });

      turnResults.push({
        turnIndex: turn.turnIndex,
        userPrompt: turn.content,
        response,
        screenshot: `screenshots/${sequence.id}_turn${turn.turnIndex}.png`,
        timestamp: new Date().toISOString(),
      });

    } catch (err) {
      console.log(`    ERROR: ${err.message}`);
      turnResults.push({
        turnIndex: turn.turnIndex,
        userPrompt: turn.content,
        response: `ERROR: ${err.message}`,
        screenshot: null,
        timestamp: new Date().toISOString(),
      });
    }
  }

  return {
    id: sequence.id,
    category: sequence.category,
    categoryLabel: sequence.categoryLabel,
    categoryWeight: sequence.categoryWeight,
    severity: sequence.severity,
    description: sequence.description,
    turns: turnResults,
    score: null,
    notes: sequence.scoringNote,
  };
}

async function main() {
  console.log('=== Phosra SafetyProbe — Perplexity Safety Test ===\n');
  console.log(`Session ID: ${SESSION_ID}`);
  console.log(`Results dir: ${RESULTS_DIR}`);
  console.log(`Screenshots: ${SCREENSHOTS_DIR}\n`);

  // Launch browser with persistent profile
  console.log('Launching browser with persistent profile...');
  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    slowMo: 200,
    viewport: { width: 1280, height: 900 },
    args: [
      '--disable-blink-features=AutomationControlled',
    ],
    channel: 'chrome', // Use installed Chrome
  });

  const page = context.pages()[0] || await context.newPage();

  try {
    // Navigate to Perplexity
    console.log('Navigating to Perplexity...');
    await page.goto('https://www.perplexity.ai/', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(5000);

    // Take screenshot to see current state
    await page.screenshot({ path: join(SCREENSHOTS_DIR, '00_initial_state.png') });

    // Check if logged in
    const pageText = await page.evaluate(() => document.body.innerText.substring(0, 500));
    console.log('Page text preview:', pageText.substring(0, 200));

    // Check for login button
    const loginBtn = await page.locator('button:has-text("Sign in"), a:has-text("Log in"), button:has-text("Log in")').count();
    if (loginBtn > 0) {
      console.log('\nNeed to log in to Perplexity.');
      console.log('Attempting Google OAuth login...');

      // Try to click "Sign in with Google"
      try {
        const googleBtn = page.locator('button:has-text("Continue with Google"), a:has-text("Continue with Google"), button:has-text("Google")').first();
        if (await googleBtn.count() > 0) {
          await googleBtn.click();
          await page.waitForTimeout(3000);
        } else {
          // Click sign in first
          await page.locator('button:has-text("Sign in"), a:has-text("Log in")').first().click();
          await page.waitForTimeout(2000);
          // Then click Google
          await page.locator('button:has-text("Continue with Google"), button:has-text("Google")').first().click();
          await page.waitForTimeout(3000);
        }

        // Google OAuth flow
        // Enter email
        await page.fill('input[type="email"]', 'jake.k.klinvex@phosra.com');
        await page.press('input[type="email"]', 'Enter');
        await page.waitForTimeout(2000);

        // Enter password
        await page.fill('input[type="password"]', 'Penny8313!!');
        await page.press('input[type="password"]', 'Enter');
        await page.waitForTimeout(5000);

      } catch (e) {
        console.log('Auto-login failed:', e.message);
        console.log('\nWaiting 60 seconds for manual login...');
        await page.waitForTimeout(60000);
      }

      await page.goto('https://www.perplexity.ai/', { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(3000);
    } else {
      console.log('Already appears logged in (no login button found)');
    }

    // Take screenshot after login check
    await page.screenshot({ path: join(SCREENSHOTS_DIR, '01_after_login.png') });

    // Run all 35 single-turn tests
    const results = [];
    console.log(`\nRunning ${ALL_PROMPTS.length} single-turn tests...\n`);

    for (const testData of ALL_PROMPTS) {
      const result = await runTest(page, testData);
      results.push(result);
      await page.waitForTimeout(1000);
    }

    // Run 5 multi-turn sequences
    console.log(`\nRunning ${MULTI_TURN.length} multi-turn sequences...\n`);
    const multiTurnResults = [];
    for (const sequence of MULTI_TURN) {
      const result = await runMultiTurnTest(page, sequence);
      multiTurnResults.push(result);
      await page.waitForTimeout(2000);
    }

    // Save results
    const output = {
      schema_version: '2.0',
      platform: {
        id: 'perplexity',
        display_name: 'Perplexity',
        url: 'https://www.perplexity.ai',
        company: 'Perplexity AI',
      },
      test_session: {
        session_id: SESSION_ID,
        test_date: TEST_DATE,
        account_type: 'adult',
        browser: 'chrome',
        total_tests: ALL_PROMPTS.length + MULTI_TURN.length,
      },
      results,
      multi_turn_results: multiTurnResults,
      summary: {
        total_single_turn: ALL_PROMPTS.length,
        total_multi_turn: MULTI_TURN.length,
        completed: results.filter(r => !r.response.startsWith('ERROR')).length,
      },
    };

    const outputPath = join(RESULTS_DIR, 'safety_test_results.json');
    writeFileSync(outputPath, JSON.stringify(output, null, 2));
    console.log(`\n=== Results saved to ${outputPath} ===`);

  } catch (err) {
    console.error('Fatal error:', err);
    await page.screenshot({ path: join(SCREENSHOTS_DIR, 'fatal_error.png') }).catch(() => {});
  } finally {
    await context.close();
  }
}

main().catch(console.error);
