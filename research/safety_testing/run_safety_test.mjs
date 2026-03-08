/**
 * Phosra SafetyProbe — Multi-Platform AI Safety Test Runner
 *
 * Tests AI chatbot content safety responses using a PERSISTENT BROWSER SESSION.
 * On first run, opens a visible browser and pauses for manual login.
 * On subsequent runs, reuses the saved session (cookies, localStorage, etc.).
 *
 * Usage:
 *   node research/safety_testing/run_safety_test.mjs --platform chatgpt
 *   node research/safety_testing/run_safety_test.mjs --platform gemini
 *   node research/safety_testing/run_safety_test.mjs --platform chatgpt --categories self_harm,explicit_sexual
 *   node research/safety_testing/run_safety_test.mjs --platform chatgpt --prompt-ids sh-01,ex-01
 */

import { chromium } from '../../web/node_modules/playwright/index.mjs';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createInterface } from 'readline';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..', '..');

// ---------------------------------------------------------------------------
// Platform configuration
// ---------------------------------------------------------------------------
const PLATFORM_CONFIG = {
  chatgpt: {
    name: 'ChatGPT',
    url: 'https://chatgpt.com',
    loginUrl: 'https://chatgpt.com/auth/login',
    newChatUrl: 'https://chatgpt.com',
    tier: 'tier1_highest_priority',
    inputSelectors: [
      '#prompt-textarea',
      'div[contenteditable="true"].ProseMirror',
      'div[contenteditable="true"]',
      'textarea[placeholder*="Ask"]',
      'textarea',
    ],
    sendSelectors: [
      'button[data-testid="send-button"]',
      'button[aria-label="Send prompt"]',
      'button[aria-label="Send"]',
      'form button[type="submit"]',
    ],
    responseSelector: '[data-message-author-role="assistant"]',
    responseFallbackSelector: '.markdown',
    stopSelectors: [
      'button[aria-label="Stop generating"]',
      'button[data-testid="stop-button"]',
    ],
    loginVerification: {
      // When logged in, ChatGPT shows a user avatar/menu button in the top-right
      selectors: [
        'button[data-testid="profile-button"]',
        'img[alt*="User"]',
        '[data-testid="user-menu"]',
        'button:has(img[referrerpolicy])',
        'nav button:has(div > div > img)',
      ],
      // If this text appears, we are NOT logged in (guest mode)
      notLoggedInIndicators: [
        'button:has-text("Log in")',
        'button:has-text("Sign up")',
        'a:has-text("Log in")',
      ],
    },
  },
  gemini: {
    name: 'Gemini',
    url: 'https://gemini.google.com',
    loginUrl: 'https://gemini.google.com',
    newChatUrl: 'https://gemini.google.com',
    tier: 'tier1_highest_priority',
    inputSelectors: [
      '.ql-editor',
      'div[contenteditable="true"]',
      'rich-textarea .textarea',
      'textarea',
    ],
    sendSelectors: [
      'button[aria-label="Send message"]',
      'button.send-button',
      'button[mattooltip="Send message"]',
    ],
    responseSelector: '.response-container .markdown',
    responseFallbackSelector: '.model-response-text',
    stopSelectors: ['button[aria-label="Stop generating"]'],
    loginVerification: {
      selectors: ['img[data-src*="googleusercontent"]', 'a[aria-label*="Google Account"]'],
      notLoggedInIndicators: ['button:has-text("Sign in")'],
    },
  },
  claude_ai: {
    name: 'Claude',
    url: 'https://claude.ai',
    loginUrl: 'https://claude.ai/login',
    newChatUrl: 'https://claude.ai/new',
    tier: 'tier2_major',
    outputFolder: 'claude', // folder name differs from platform key
    requireChrome: true, // claude.ai blocks Chromium
    inputSelectors: [
      'div[contenteditable="true"].ProseMirror',
      'div[contenteditable="true"]',
      'fieldset div[contenteditable]',
    ],
    sendSelectors: [
      'button[aria-label="Send Message"]',
      'button[aria-label="Send"]',
    ],
    responseSelector: '[data-testid="assistant-message"]',
    responseFallbackSelector: '.font-claude-message',
    stopSelectors: ['button[aria-label="Stop Response"]'],
    loginVerification: {
      selectors: ['button[data-testid="user-menu"]'],
      notLoggedInIndicators: ['button:has-text("Log in")', 'a:has-text("Sign up")'],
    },
  },
  copilot: {
    name: 'Microsoft Copilot',
    url: 'https://copilot.microsoft.com',
    loginUrl: 'https://copilot.microsoft.com',
    newChatUrl: 'https://copilot.microsoft.com',
    tier: 'tier2_major',
    inputSelectors: ['textarea#userInput', 'textarea', 'div[contenteditable="true"]'],
    sendSelectors: ['button[aria-label="Submit"]', 'button[title="Submit"]'],
    responseSelector: '.ac-textBlock',
    responseFallbackSelector: '[data-content="ai-message"]',
    stopSelectors: ['button[aria-label="Stop responding"]'],
    loginVerification: {
      selectors: ['button[aria-label*="Account"]', 'img.profile-image'],
      notLoggedInIndicators: ['button:has-text("Sign in")'],
    },
  },
  character_ai: {
    name: 'Character.AI',
    url: 'https://character.ai',
    loginUrl: 'https://character.ai',
    newChatUrl: 'https://character.ai',
    tier: 'tier1_highest_priority',
    inputSelectors: ['textarea[placeholder*="Message"]', 'textarea'],
    sendSelectors: ['button[aria-label="Send"]', 'button.send-btn'],
    responseSelector: '.msg-row .markdown-wrapper',
    responseFallbackSelector: '.msg-row',
    stopSelectors: [],
    loginVerification: {
      selectors: ['img.avatar'],
      notLoggedInIndicators: ['button:has-text("Sign Up")'],
    },
  },
  grok: {
    name: 'Grok',
    url: 'https://grok.com',
    loginUrl: 'https://grok.com',
    newChatUrl: 'https://grok.com',
    tier: 'tier4_specialized',
    inputSelectors: ['textarea', 'div[contenteditable="true"]'],
    sendSelectors: ['button[aria-label="Send"]', 'button[type="submit"]'],
    responseSelector: '.message-content',
    responseFallbackSelector: '.markdown',
    stopSelectors: ['button[aria-label="Stop"]'],
    loginVerification: {
      selectors: ['img[alt*="avatar"]'],
      notLoggedInIndicators: ['button:has-text("Sign in")'],
    },
  },
  perplexity: {
    name: 'Perplexity',
    url: 'https://www.perplexity.ai',
    loginUrl: 'https://www.perplexity.ai',
    newChatUrl: 'https://www.perplexity.ai',
    tier: 'tier4_specialized',
    inputSelectors: ['textarea[placeholder*="Ask"]', 'textarea'],
    sendSelectors: ['button[aria-label="Submit"]', 'button[type="submit"]'],
    responseSelector: '.prose',
    responseFallbackSelector: '.markdown',
    stopSelectors: ['button[aria-label="Stop"]'],
    loginVerification: {
      selectors: ['img[alt*="avatar"]', 'button[aria-label*="Profile"]'],
      notLoggedInIndicators: ['button:has-text("Sign in")', 'a:has-text("Log In")'],
    },
  },
  meta_ai: {
    name: 'Meta AI',
    url: 'https://www.meta.ai',
    loginUrl: 'https://www.meta.ai',
    newChatUrl: 'https://www.meta.ai',
    tier: 'tier1_highest_priority',
    inputSelectors: ['textarea', 'div[contenteditable="true"]'],
    sendSelectors: ['button[aria-label="Send"]', 'button[type="submit"]'],
    responseSelector: '.message-content',
    responseFallbackSelector: '.markdown',
    stopSelectors: ['button[aria-label="Stop"]'],
    loginVerification: {
      selectors: ['img[alt*="profile"]'],
      notLoggedInIndicators: ['button:has-text("Log in")'],
    },
  },
  mistral_le_chat: {
    name: 'Mistral Le Chat',
    url: 'https://chat.mistral.ai',
    loginUrl: 'https://chat.mistral.ai',
    newChatUrl: 'https://chat.mistral.ai',
    tier: 'tier4_specialized',
    inputSelectors: ['textarea', 'div[contenteditable="true"]'],
    sendSelectors: ['button[aria-label="Send"]', 'button[type="submit"]'],
    responseSelector: '.message-content',
    responseFallbackSelector: '.markdown',
    stopSelectors: ['button[aria-label="Stop"]'],
    loginVerification: {
      selectors: ['img[alt*="avatar"]'],
      notLoggedInIndicators: ['button:has-text("Sign in")'],
    },
  },
};

// ---------------------------------------------------------------------------
// CLI argument parsing
// ---------------------------------------------------------------------------
function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = {
    platform: null,
    categories: null,    // optional: comma-separated category filter
    promptIds: null,     // optional: comma-separated prompt ID filter
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--platform' && args[i + 1]) {
      parsed.platform = args[++i];
    } else if (args[i] === '--categories' && args[i + 1]) {
      parsed.categories = args[++i].split(',').map(s => s.trim());
    } else if (args[i] === '--prompt-ids' && args[i + 1]) {
      parsed.promptIds = args[++i].split(',').map(s => s.trim());
    } else if (args[i] === '--help' || args[i] === '-h') {
      console.log(`
Phosra SafetyProbe — AI Safety Test Runner

Usage:
  node run_safety_test.mjs --platform <platform>

Options:
  --platform <name>       Platform to test (required). One of:
                           ${Object.keys(PLATFORM_CONFIG).join(', ')}
  --categories <list>     Comma-separated category filter (e.g. self_harm,explicit_sexual)
  --prompt-ids <list>     Comma-separated prompt ID filter (e.g. sh-01,ex-01,pg-01)
  --help, -h              Show this help message

Examples:
  node run_safety_test.mjs --platform chatgpt
  node run_safety_test.mjs --platform gemini --categories self_harm,violence_weapons
  node run_safety_test.mjs --platform chatgpt --prompt-ids sh-01,ex-01
`);
      process.exit(0);
    }
  }

  if (!parsed.platform) {
    console.error('Error: --platform is required. Use --help for usage info.');
    process.exit(1);
  }

  if (!PLATFORM_CONFIG[parsed.platform]) {
    console.error(`Error: Unknown platform "${parsed.platform}". Available: ${Object.keys(PLATFORM_CONFIG).join(', ')}`);
    process.exit(1);
  }

  return parsed;
}

// ---------------------------------------------------------------------------
// Load test prompts from JSON
// ---------------------------------------------------------------------------
function loadTestPrompts(args) {
  // Try primary location first, then fallback
  const primaryPath = join(PROJECT_ROOT, 'research', 'providers', 'ai_chatbot', 'test_prompts.json');
  const fallbackPath = join(PROJECT_ROOT, 'research', 'safety_testing', 'test_prompts.json');

  let promptsFile;
  if (existsSync(primaryPath)) {
    promptsFile = primaryPath;
  } else if (existsSync(fallbackPath)) {
    promptsFile = fallbackPath;
  } else {
    console.error('Error: Could not find test_prompts.json in either:');
    console.error(`  ${primaryPath}`);
    console.error(`  ${fallbackPath}`);
    process.exit(1);
  }

  console.log(`Loading test prompts from: ${promptsFile}`);
  const data = JSON.parse(readFileSync(promptsFile, 'utf-8'));

  // Flatten all prompts from all categories
  const allPrompts = [];
  for (const [categoryKey, category] of Object.entries(data.categories)) {
    // Apply category filter if specified
    if (args.categories && !args.categories.includes(categoryKey)) {
      continue;
    }

    for (const prompt of category.prompts) {
      // Apply prompt ID filter if specified
      if (args.promptIds && !args.promptIds.includes(prompt.id)) {
        continue;
      }

      allPrompts.push({
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

  return { prompts: allPrompts, scoringRubric: data.scoring_rubric };
}

// ---------------------------------------------------------------------------
// Readline helper — wait for user to press Enter
// ---------------------------------------------------------------------------
function waitForEnter(message) {
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    rl.question(message, () => {
      rl.close();
      resolve();
    });
  });
}

// ---------------------------------------------------------------------------
// Browser session management
// ---------------------------------------------------------------------------
async function launchPersistentBrowser(platform) {
  const config = PLATFORM_CONFIG[platform];
  const profileDir = join(__dirname, 'browser_profiles', platform);
  mkdirSync(profileDir, { recursive: true });

  const useChrome = config.requireChrome || false;
  console.log(`Browser profile directory: ${profileDir}`);
  if (useChrome) {
    console.log(`Using installed Chrome (required by ${config.name} — blocks Chromium)`);
  }

  const launchOptions = {
    headless: false,
    slowMo: 500,
    viewport: { width: 1280, height: 900 },
    args: [
      '--disable-blink-features=AutomationControlled',
    ],
  };

  if (useChrome) {
    launchOptions.channel = 'chrome';
  }

  const context = await chromium.launchPersistentContext(profileDir, launchOptions);

  return context;
}

async function ensureLoggedIn(context, platformKey) {
  const config = PLATFORM_CONFIG[platformKey];
  const page = context.pages()[0] || await context.newPage();

  // Navigate to the platform
  console.log(`Navigating to ${config.name} (${config.url})...`);
  await page.goto(config.url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(5000);

  // Check if we are already logged in
  let isLoggedIn = false;

  // Method 1: Look for logged-in indicators
  for (const sel of config.loginVerification.selectors) {
    try {
      const count = await page.locator(sel).count();
      if (count > 0) {
        isLoggedIn = true;
        break;
      }
    } catch {
      // Selector might be invalid for current page state
    }
  }

  // Method 2: Check for NOT-logged-in indicators (if none of the logged-in indicators matched)
  if (!isLoggedIn) {
    let hasNotLoggedInIndicator = false;
    for (const sel of config.loginVerification.notLoggedInIndicators) {
      try {
        const count = await page.locator(sel).count();
        if (count > 0) {
          hasNotLoggedInIndicator = true;
          break;
        }
      } catch {
        // Selector might be invalid
      }
    }

    // If we don't see any not-logged-in indicators either, the user might still be logged in
    // (some platforms don't show login buttons once authenticated)
    if (!hasNotLoggedInIndicator) {
      // Check if the chat input is available — that often means we are in a usable state
      for (const sel of config.inputSelectors) {
        try {
          const count = await page.locator(sel).first().count();
          if (count > 0 && await page.locator(sel).first().isVisible()) {
            console.log('Chat input found — assuming logged-in or usable session.\n');
            isLoggedIn = true;
            break;
          }
        } catch {
          // continue
        }
      }
    }
  }

  if (isLoggedIn) {
    console.log(`Already logged into ${config.name} (session restored from profile).\n`);
    return page;
  }

  // Not logged in — navigate to login page and wait for manual login
  console.log(`\nNot logged into ${config.name}. Opening login page...`);
  await page.goto(config.loginUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(2000);

  await waitForEnter(
    `\nPlease log into ${config.name} in the browser window, then press Enter to continue...`
  );

  // Verify login succeeded
  await page.waitForTimeout(3000);

  // Navigate back to main page to verify
  await page.goto(config.url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(5000);

  // Quick check — look for chat input as a proxy for "usable"
  let verified = false;
  for (const sel of config.inputSelectors) {
    try {
      const loc = page.locator(sel).first();
      if (await loc.count() > 0 && await loc.isVisible()) {
        verified = true;
        break;
      }
    } catch {
      // continue
    }
  }

  if (!verified) {
    // Also accept logged-in indicators
    for (const sel of config.loginVerification.selectors) {
      try {
        if (await page.locator(sel).count() > 0) {
          verified = true;
          break;
        }
      } catch {
        // continue
      }
    }
  }

  if (verified) {
    console.log(`Login verified for ${config.name}. Session saved to browser profile.\n`);
  } else {
    console.log(`WARNING: Could not verify login. Proceeding anyway — the session may still work.\n`);
  }

  return page;
}

// ---------------------------------------------------------------------------
// Chat interaction helpers
// ---------------------------------------------------------------------------
async function waitForResponse(page, config, timeout = 90000) {
  try {
    // Wait for the response to START
    await page.waitForTimeout(3000);

    const startTime = Date.now();
    let lastText = '';
    let stableCount = 0;

    while (Date.now() - startTime < timeout) {
      // Check if there is a stop/generating indicator
      let isGenerating = false;
      for (const sel of config.stopSelectors) {
        try {
          if (await page.locator(sel).count() > 0) {
            isGenerating = true;
            break;
          }
        } catch {
          // continue
        }
      }

      if (!isGenerating) {
        // Double-check by seeing if text has stabilized
        const currentText = await getLastResponse(page, config);
        if (currentText && currentText === lastText) {
          stableCount++;
          if (stableCount >= 3) break; // Text stable for 3 consecutive checks
        } else {
          stableCount = 0;
        }
        lastText = currentText;
      }
      await page.waitForTimeout(1000);
    }
  } catch (e) {
    console.log('  (response wait timeout or error, capturing what we have)');
  }
}

async function getLastResponse(page, config) {
  // Try the primary response selector
  try {
    const responses = await page.locator(config.responseSelector).all();
    if (responses.length > 0) {
      return await responses[responses.length - 1].innerText();
    }
  } catch {
    // fall through
  }

  // Try the fallback selector
  try {
    const responses = await page.locator(config.responseFallbackSelector).all();
    if (responses.length > 0) {
      return await responses[responses.length - 1].innerText();
    }
  } catch {
    // fall through
  }

  return '';
}

async function sendPrompt(page, config, prompt) {
  let input = null;
  for (const sel of config.inputSelectors) {
    try {
      const loc = page.locator(sel).first();
      if (await loc.count() > 0 && await loc.isVisible()) {
        input = loc;
        console.log(`  Found input with selector: ${sel}`);
        break;
      }
    } catch {
      // continue
    }
  }

  if (!input) {
    throw new Error('Could not find chat input element');
  }

  await input.click();
  await page.waitForTimeout(300);

  // For contenteditable divs, use pressSequentially; for textareas, use fill
  const tagName = await input.evaluate(el => el.tagName.toLowerCase());
  if (tagName === 'div') {
    await input.pressSequentially(prompt, { delay: 10 });
  } else {
    await input.fill(prompt);
  }
  await page.waitForTimeout(500);

  // Try each send button selector
  for (const sel of config.sendSelectors) {
    try {
      const btn = page.locator(sel).first();
      if (await btn.count() > 0) {
        await btn.click({ timeout: 3000 });
        return;
      }
    } catch {
      // Try next selector
    }
  }

  // Fallback: press Enter
  await input.press('Enter');
}

async function startNewChat(page, config, platformKey) {
  // Strategy 1: Navigate to the new chat URL (most reliable)
  try {
    await page.goto(config.newChatUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(4000);

    // Dismiss any modals that might appear (login prompts, cookie banners, etc.)
    await dismissModals(page);

    // Verify the input is ready
    for (const sel of config.inputSelectors) {
      try {
        const loc = page.locator(sel).first();
        if (await loc.count() > 0 && await loc.isVisible()) {
          return; // Chat input is ready
        }
      } catch {
        // continue
      }
    }
  } catch {
    // fall through to retry
  }

  // Strategy 2: Try clicking a "New chat" button
  const newChatSelectors = [
    'a[href="/"]',
    'button:has-text("New chat")',
    'a:has-text("New chat")',
    'nav a:first-child',
    'button[data-testid="new-chat-button"]',
  ];

  for (const sel of newChatSelectors) {
    try {
      const btn = page.locator(sel).first();
      if (await btn.count() > 0 && await btn.isVisible()) {
        await btn.click();
        await page.waitForTimeout(3000);
        await dismissModals(page);
        return;
      }
    } catch {
      // continue
    }
  }

  // Strategy 3: Just navigate fresh
  await page.goto(config.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(5000);
  await dismissModals(page);
}

async function dismissModals(page) {
  // Dismiss common modals: login prompts, cookie banners, onboarding, etc.
  const dismissSelectors = [
    'button:has-text("Stay logged out")',
    'button:has-text("Try without account")',
    'button:has-text("Continue without")',
    'button:has-text("Maybe later")',
    'button:has-text("No thanks")',
    'button:has-text("Dismiss")',
    'button:has-text("Close")',
    'button[aria-label="Close"]',
    'button:has-text("Accept")',
    'button:has-text("Agree")',
    'button:has-text("OK")',
    'button:has-text("Got it")',
  ];

  for (const sel of dismissSelectors) {
    try {
      const btn = page.locator(sel).first();
      if (await btn.count() > 0 && await btn.isVisible()) {
        await btn.click();
        await page.waitForTimeout(1000);
      }
    } catch {
      // Ignore — modal may not exist
    }
  }
}

// ---------------------------------------------------------------------------
// Main test runner
// ---------------------------------------------------------------------------
async function main() {
  const args = parseArgs();
  const platformKey = args.platform;
  const config = PLATFORM_CONFIG[platformKey];

  const { prompts, scoringRubric } = loadTestPrompts(args);

  if (prompts.length === 0) {
    console.error('No test prompts matched the given filters. Check --categories or --prompt-ids.');
    process.exit(1);
  }

  // Output directories — use the platform's tier (default to tier1_highest_priority)
  const tier = config.tier || 'tier1_highest_priority';
  const folderName = config.outputFolder || platformKey;
  const resultsDir = join(
    PROJECT_ROOT, 'research', 'providers', 'ai_chatbot',
    tier, folderName
  );
  const screenshotsDir = join(resultsDir, 'screenshots');
  mkdirSync(screenshotsDir, { recursive: true });

  console.log('=== Phosra SafetyProbe — AI Safety Test Runner ===\n');
  console.log(`Platform:     ${config.name} (${platformKey})`);
  console.log(`Test prompts: ${prompts.length}`);
  console.log(`Results dir:  ${resultsDir}`);
  console.log(`Screenshots:  ${screenshotsDir}\n`);

  // Launch persistent browser
  const context = await launchPersistentBrowser(platformKey);
  const results = [];

  try {
    // Ensure we are logged in (or prompt for manual login)
    const page = await ensureLoggedIn(context, platformKey);

    // Dismiss any initial modals
    await dismissModals(page);

    // Take screenshot of initial state
    await page.screenshot({
      path: join(screenshotsDir, '00_initial_state.png'),
      fullPage: false,
    });
    console.log('Screenshot: initial state saved\n');

    // Run each test prompt
    for (let i = 0; i < prompts.length; i++) {
      const test = prompts[i];
      console.log(
        `--- Test ${i + 1}/${prompts.length}: [${test.id}] ${test.category} ` +
        `(${test.severity}) ---`
      );
      console.log(`Prompt: "${test.prompt.substring(0, 80)}..."`);

      // Start a new chat for each prompt
      if (i > 0) {
        await startNewChat(page, config, platformKey);
      }

      // Wait for input to be ready
      let inputReady = false;
      for (let attempt = 0; attempt < 3; attempt++) {
        for (const sel of config.inputSelectors) {
          try {
            const loc = page.locator(sel).first();
            if (await loc.count() > 0 && await loc.isVisible()) {
              inputReady = true;
              break;
            }
          } catch {
            // continue
          }
        }
        if (inputReady) break;
        console.log(`  Waiting for chat input (attempt ${attempt + 1}/3)...`);
        await page.waitForTimeout(3000);
        await dismissModals(page);
      }

      if (!inputReady) {
        console.log(`  WARNING: Chat input not found, attempting to proceed anyway...\n`);
      }

      try {
        // Send the prompt
        await sendPrompt(page, config, test.prompt);
        console.log('  Prompt sent, waiting for response...');

        // Wait for response to complete
        await waitForResponse(page, config, 90000);

        // Capture the response
        const response = await getLastResponse(page, config);
        console.log(
          `  Response (first 200 chars): "${response.substring(0, 200)}..."\n`
        );

        // Take screenshot
        const screenshotPath = join(screenshotsDir, `${test.id}_response.png`);
        await page.screenshot({ path: screenshotPath, fullPage: false });

        results.push({
          id: test.id,
          category: test.category,
          categoryLabel: test.categoryLabel,
          categoryWeight: test.categoryWeight,
          severity: test.severity,
          prompt: test.prompt,
          expected: test.expected,
          redFlags: test.redFlags,
          response: response,
          screenshotFile: `screenshots/${test.id}_response.png`,
          timestamp: new Date().toISOString(),
          loginMode: 'persistent session (logged in)',
          score: null,  // To be filled in during review
          notes: '',
        });
      } catch (err) {
        console.log(`  ERROR on test ${test.id}: ${err.message}\n`);
        const errorScreenshot = join(screenshotsDir, `${test.id}_error.png`);
        await page.screenshot({ path: errorScreenshot, fullPage: true });

        results.push({
          id: test.id,
          category: test.category,
          categoryLabel: test.categoryLabel,
          categoryWeight: test.categoryWeight,
          severity: test.severity,
          prompt: test.prompt,
          expected: test.expected,
          redFlags: test.redFlags,
          response: `ERROR: ${err.message}`,
          screenshotFile: `screenshots/${test.id}_error.png`,
          timestamp: new Date().toISOString(),
          loginMode: 'persistent session (logged in)',
          score: null,
          notes: 'Test encountered an error',
        });
      }

      // Brief pause between tests
      await page.waitForTimeout(2000);
    }
  } catch (err) {
    console.error('Fatal error:', err.message);
    const pages = context.pages();
    if (pages.length > 0) {
      await pages[0].screenshot({
        path: join(screenshotsDir, 'fatal_error.png'),
        fullPage: true,
      });
    }
  } finally {
    // Save results
    const completedTests = results.filter(r => !r.response.startsWith('ERROR'));
    const output = {
      platform: platformKey,
      platformName: config.name,
      testDate: new Date().toISOString(),
      loginMode: 'persistent session (logged in)',
      totalTests: prompts.length,
      completedTests: completedTests.length,
      scoringRubric: scoringRubric,
      results: results,
    };

    const outputPath = join(resultsDir, 'safety_test_results.json');
    writeFileSync(outputPath, JSON.stringify(output, null, 2));

    console.log(`\n=== Results saved to ${outputPath} ===`);
    console.log(`Screenshots saved to ${screenshotsDir}/`);
    console.log(
      `Completed: ${completedTests.length}/${prompts.length} tests`
    );

    await context.close();
  }
}

main().catch(console.error);
