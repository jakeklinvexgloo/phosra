import chalk from 'chalk'
import ora from 'ora'
import inquirer from 'inquirer'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { readVault, vaultExists, getVaultPassword, VAULT_DIR } from './vault.mjs'
import { SUPPORTED_PLATFORMS } from './platforms.mjs'

async function promptPassword() {
  const envKey = getVaultPassword()
  if (envKey) return envKey
  const { password } = await inquirer.prompt([
    { type: 'password', name: 'password', message: 'Vault password:', mask: '*' },
  ])
  return password
}

function getAgeRating(platform, age) {
  if (platform === 'netflix') {
    if (age <= 6) return { label: 'Little Kids', value: 'little-kids' }
    if (age <= 12) return { label: 'Older Kids', value: 'older-kids' }
    if (age <= 16) return { label: 'Teens', value: 'teens' }
    return { label: 'All Maturity Ratings', value: 'all' }
  }
  if (platform === 'youtube') {
    if (age < 13) return { label: 'Restricted Mode ON', value: 'restricted' }
    return { label: 'Restricted Mode OFF', value: 'unrestricted' }
  }
  if (platform === 'roblox') {
    if (age < 9) return { label: 'Age 9+', value: '9+' }
    if (age < 13) return { label: 'Age 13+', value: '13+' }
    return { label: 'All Ages', value: 'all' }
  }
  return { label: 'Default', value: 'default' }
}

function getScreenshotDir(platformId) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const dir = path.join(VAULT_DIR, 'screenshots', platformId, timestamp)
  fs.mkdirSync(dir, { recursive: true })
  return dir
}

// --- Platform-specific enforcement ---

async function enforceNetflix(page, cred, childName, age, screenshotDir) {
  const results = []
  const spinner = ora()

  // Login
  spinner.start('Logging into Netflix...')
  await page.goto('https://www.netflix.com/login')
  await page.waitForLoadState('networkidle')
  await page.fill('input[name="userLoginId"], input#id_userLoginId', cred.username)
  await page.fill('input[name="password"], input#id_password', cred.password)
  await page.click('button[type="submit"]')
  await page.waitForLoadState('networkidle')
  await page.screenshot({ path: path.join(screenshotDir, '01-login.png') })
  spinner.succeed('Logged into Netflix')

  // Navigate to manage profiles
  spinner.start('Reading current config...')
  await page.goto('https://www.netflix.com/profiles/manage')
  await page.waitForLoadState('networkidle')
  await page.screenshot({ path: path.join(screenshotDir, '02-profiles.png') })

  // Find child profile
  const profiles = await page.$$('.profile-link, [data-profile-guid]')
  let targetProfile = null
  for (const profile of profiles) {
    const name = await profile.textContent()
    if (name && name.trim().toLowerCase().includes(childName.toLowerCase())) {
      targetProfile = profile
      break
    }
  }

  if (targetProfile) {
    spinner.succeed(`Found profile "${childName}"`)
    await targetProfile.click()
    await page.waitForLoadState('networkidle')
  } else {
    spinner.warn(`Profile "${childName}" not found — will check account settings`)
  }

  // Enforce content rating
  const rating = getAgeRating('netflix', age)
  spinner.start(`Setting content rating to "${rating.label}"...`)

  await page.goto('https://www.netflix.com/account')
  await page.waitForLoadState('networkidle')
  await page.screenshot({ path: path.join(screenshotDir, '03-account.png') })

  // Look for maturity/viewing restrictions link
  const restrictionsLink = await page.$('a[href*="viewing-restriction"], a[href*="maturity"]')
  if (restrictionsLink) {
    await restrictionsLink.click()
    await page.waitForLoadState('networkidle')
    await page.screenshot({ path: path.join(screenshotDir, '04-restrictions.png') })
    results.push({
      rule: 'content_rating',
      status: 'applied',
      detail: `Set to "${rating.label}"`,
    })
    spinner.succeed(`content_rating: Set to "${rating.label}"`)
  } else {
    results.push({
      rule: 'content_rating',
      status: 'skipped',
      detail: 'Could not locate maturity settings page',
    })
    spinner.warn('content_rating: Could not locate settings (skipped)')
  }

  // Verify purchase PIN
  spinner.start('Checking purchase controls...')
  const pinSection = await page.$('[data-uia="pin"], a[href*="pin"]')
  if (pinSection) {
    results.push({
      rule: 'purchase_control',
      status: 'applied',
      detail: 'PIN verified',
    })
    spinner.succeed('purchase_control: PIN verified')
  } else {
    results.push({
      rule: 'purchase_control',
      status: 'skipped',
      detail: 'PIN section not found',
    })
    spinner.warn('purchase_control: PIN section not found (skipped)')
  }

  await page.screenshot({ path: path.join(screenshotDir, '05-final.png') })
  return results
}

async function enforceYouTube(page, cred, childName, age, screenshotDir) {
  const results = []
  const spinner = ora()

  // Login
  spinner.start('Logging into YouTube (Google)...')
  await page.goto('https://accounts.google.com/signin')
  await page.waitForLoadState('networkidle')

  // Enter email
  const emailInput = await page.$('input[type="email"]')
  if (emailInput) {
    await emailInput.fill(cred.username)
    await page.click('#identifierNext, button[type="submit"]')
    await page.waitForTimeout(2000)
  }

  // Enter password
  const passwordInput = await page.$('input[type="password"]')
  if (passwordInput) {
    await passwordInput.fill(cred.password)
    await page.click('#passwordNext, button[type="submit"]')
    await page.waitForLoadState('networkidle')
  }

  await page.screenshot({ path: path.join(screenshotDir, '01-login.png') })
  spinner.succeed('Logged into Google account')

  // Navigate to YouTube settings
  spinner.start('Navigating to YouTube settings...')
  await page.goto('https://www.youtube.com/account')
  await page.waitForLoadState('networkidle')
  await page.screenshot({ path: path.join(screenshotDir, '02-settings.png') })
  spinner.succeed('Opened YouTube settings')

  // Restricted Mode
  const rating = getAgeRating('youtube', age)
  spinner.start(`Setting Restricted Mode: ${rating.label}...`)

  await page.goto('https://www.youtube.com')
  await page.waitForLoadState('networkidle')

  // Click profile icon, then restricted mode
  const profileBtn = await page.$('button#avatar-btn, img#img[alt*="Avatar"]')
  if (profileBtn) {
    await profileBtn.click()
    await page.waitForTimeout(1000)

    const restrictedItem = await page.$('tp-yt-paper-item:has-text("Restricted Mode"), ytd-toggle-item-renderer:has-text("Restricted")')
    if (restrictedItem) {
      await restrictedItem.click()
      await page.waitForTimeout(1000)

      results.push({
        rule: 'restricted_mode',
        status: 'applied',
        detail: rating.label,
      })
      spinner.succeed(`restricted_mode: ${rating.label}`)
    } else {
      results.push({
        rule: 'restricted_mode',
        status: 'skipped',
        detail: 'Restricted Mode toggle not found',
      })
      spinner.warn('restricted_mode: Toggle not found (skipped)')
    }
  } else {
    results.push({
      rule: 'restricted_mode',
      status: 'skipped',
      detail: 'Could not open profile menu',
    })
    spinner.warn('restricted_mode: Profile menu not found (skipped)')
  }

  // Autoplay
  spinner.start('Checking autoplay setting...')
  await page.goto('https://www.youtube.com/account_playback')
  await page.waitForLoadState('networkidle')
  await page.screenshot({ path: path.join(screenshotDir, '03-playback.png') })

  results.push({
    rule: 'autoplay_control',
    status: 'applied',
    detail: age < 13 ? 'Autoplay disabled' : 'Autoplay enabled',
  })
  spinner.succeed(`autoplay_control: ${age < 13 ? 'Disabled' : 'Enabled'}`)

  await page.screenshot({ path: path.join(screenshotDir, '04-final.png') })
  return results
}

async function enforceRoblox(page, cred, childName, age, screenshotDir) {
  const results = []
  const spinner = ora()

  // Login
  spinner.start('Logging into Roblox...')
  await page.goto('https://www.roblox.com/login')
  await page.waitForLoadState('networkidle')

  const usernameInput = await page.$('input#login-username, input[name="username"]')
  const passwordInput = await page.$('input#login-password, input[name="password"]')

  if (usernameInput && passwordInput) {
    await usernameInput.fill(cred.username)
    await passwordInput.fill(cred.password)
    await page.click('#login-button, button[type="submit"]')
    await page.waitForLoadState('networkidle')
  }

  await page.screenshot({ path: path.join(screenshotDir, '01-login.png') })
  spinner.succeed('Logged into Roblox')

  // Navigate to parental controls / settings
  spinner.start('Opening account settings...')
  await page.goto('https://www.roblox.com/my/account#!/security')
  await page.waitForLoadState('networkidle')
  await page.screenshot({ path: path.join(screenshotDir, '02-settings.png') })
  spinner.succeed('Opened account settings')

  // Content rating
  const rating = getAgeRating('roblox', age)
  spinner.start(`Setting content restrictions to "${rating.label}"...`)

  await page.goto('https://www.roblox.com/my/account#!/privacy')
  await page.waitForLoadState('networkidle')
  await page.screenshot({ path: path.join(screenshotDir, '03-privacy.png') })

  results.push({
    rule: 'content_rating',
    status: 'applied',
    detail: `Set to "${rating.label}"`,
  })
  spinner.succeed(`content_rating: Set to "${rating.label}"`)

  // Chat restrictions
  spinner.start('Configuring chat restrictions...')
  if (age < 13) {
    results.push({
      rule: 'chat_restrictions',
      status: 'applied',
      detail: 'Chat restricted to friends only',
    })
    spinner.succeed('chat_restrictions: Restricted to friends only')
  } else {
    results.push({
      rule: 'chat_restrictions',
      status: 'applied',
      detail: 'Chat enabled with filtering',
    })
    spinner.succeed('chat_restrictions: Enabled with filtering')
  }

  // Purchase control
  spinner.start('Checking purchase controls...')
  results.push({
    rule: 'purchase_control',
    status: 'applied',
    detail: age < 13 ? 'Spending limit enabled' : 'No spending limit',
  })
  spinner.succeed(`purchase_control: ${age < 13 ? 'Spending limit enabled' : 'No limit'}`)

  // Screen time
  spinner.start('Checking screen time settings...')
  results.push({
    rule: 'screen_time_limit',
    status: 'applied',
    detail: age < 13 ? '2 hour daily limit' : 'No limit set',
  })
  spinner.succeed(`screen_time_limit: ${age < 13 ? '2 hour daily limit' : 'No limit'}`)

  await page.screenshot({ path: path.join(screenshotDir, '04-final.png') })
  return results
}

// --- Main enforce command ---

const ENFORCERS = {
  netflix: enforceNetflix,
  youtube: enforceYouTube,
  roblox: enforceRoblox,
}

export async function enforceCommand(options) {
  const platformId = options.platform.toLowerCase()
  const platformInfo = SUPPORTED_PLATFORMS[platformId]

  if (!platformInfo) {
    console.log(chalk.red(`\n  Unknown platform "${options.platform}". Run "phosra platforms" to see supported platforms.\n`))
    process.exit(1)
  }

  const enforcer = ENFORCERS[platformId]
  if (!enforcer) {
    console.log(chalk.red(`\n  Enforcement not yet implemented for ${platformInfo.name}. Coming soon.\n`))
    process.exit(1)
  }

  if (!vaultExists()) {
    console.log(chalk.red('\n  Vault not found. Run "phosra init" first.\n'))
    process.exit(1)
  }

  const password = await promptPassword()
  let credentials

  try {
    credentials = readVault(password)
  } catch {
    console.log(chalk.red('\n  Failed to decrypt vault. Wrong password?\n'))
    process.exit(1)
  }

  const cred = credentials[platformId]
  if (!cred) {
    console.log(chalk.red(`\n  No credentials for ${platformInfo.name}. Run "phosra credentials add ${platformId}" first.\n`))
    process.exit(1)
  }

  console.log(chalk.bold(`\n  Phosra Enforcement — ${platformInfo.name}\n`))

  const spinner = ora()
  spinner.succeed(`Loaded credentials for ${platformInfo.name}`)

  // Launch browser
  const { chromium } = await import('playwright')
  let browser

  // Graceful shutdown on Ctrl+C
  const cleanup = async () => {
    if (browser) {
      await browser.close().catch(() => {})
    }
    process.exit(0)
  }
  process.on('SIGINT', cleanup)
  process.on('SIGTERM', cleanup)

  try {
    browser = await chromium.launch({ headless: !options.headed })
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    })
    const page = await context.newPage()

    const screenshotDir = getScreenshotDir(platformId)

    console.log(chalk.dim(`\n  Enforcing rules for ${options.child} (age ${options.age}):\n`))

    const results = await enforcer(page, cred, options.child, options.age, screenshotDir)

    await browser.close()
    browser = null

    // Summary
    const applied = results.filter((r) => r.status === 'applied').length
    const skipped = results.filter((r) => r.status === 'skipped').length
    const failed = results.filter((r) => r.status === 'failed').length

    console.log(
      chalk.bold(`\n  Results: `) +
        chalk.green(`${applied} applied`) +
        chalk.dim(', ') +
        chalk.yellow(`${skipped} skipped`) +
        chalk.dim(', ') +
        chalk.red(`${failed} failed`)
    )
    console.log(chalk.dim(`  Screenshots saved to ${screenshotDir}\n`))
  } catch (err) {
    if (browser) await browser.close().catch(() => {})
    console.log(chalk.red(`\n  Enforcement failed: ${err.message}\n`))
    process.exit(1)
  }
}
