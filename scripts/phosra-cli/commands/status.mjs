import chalk from 'chalk'
import ora from 'ora'
import inquirer from 'inquirer'
import fs from 'node:fs'
import path from 'node:path'
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

async function readNetflixStatus(page, screenshotDir) {
  const spinner = ora()
  const config = {}

  spinner.start('Navigating to Netflix account...')
  await page.goto('https://www.netflix.com/account')
  await page.waitForLoadState('networkidle')
  await page.screenshot({ path: path.join(screenshotDir, 'account.png') })
  spinner.succeed('Loaded Netflix account page')

  // Check profiles
  spinner.start('Reading profiles...')
  await page.goto('https://www.netflix.com/profiles/manage')
  await page.waitForLoadState('networkidle')

  const profiles = await page.$$eval('.profile-link, [data-profile-guid]', (els) =>
    els.map((el) => el.textContent?.trim()).filter(Boolean)
  )
  config.profiles = profiles.length > 0 ? profiles : ['(could not read profiles)']
  spinner.succeed(`Found ${config.profiles.length} profiles`)

  await page.screenshot({ path: path.join(screenshotDir, 'profiles.png') })
  return config
}

async function readYouTubeStatus(page, screenshotDir) {
  const spinner = ora()
  const config = {}

  spinner.start('Navigating to YouTube...')
  await page.goto('https://www.youtube.com')
  await page.waitForLoadState('networkidle')
  await page.screenshot({ path: path.join(screenshotDir, 'home.png') })
  spinner.succeed('Loaded YouTube')

  config.restrictedMode = 'unknown'
  config.autoplay = 'unknown'
  return config
}

async function readRobloxStatus(page, screenshotDir) {
  const spinner = ora()
  const config = {}

  spinner.start('Navigating to Roblox settings...')
  await page.goto('https://www.roblox.com/my/account#!/privacy')
  await page.waitForLoadState('networkidle')
  await page.screenshot({ path: path.join(screenshotDir, 'privacy.png') })
  spinner.succeed('Loaded Roblox privacy settings')

  config.privacySettings = 'loaded (see screenshot)'
  return config
}

const STATUS_READERS = {
  netflix: readNetflixStatus,
  youtube: readYouTubeStatus,
  roblox: readRobloxStatus,
}

export async function statusCommand(options) {
  const platformId = options.platform.toLowerCase()
  const platformInfo = SUPPORTED_PLATFORMS[platformId]

  if (!platformInfo) {
    console.log(chalk.red(`\n  Unknown platform "${options.platform}". Run "phosra platforms" to see supported platforms.\n`))
    process.exit(1)
  }

  const reader = STATUS_READERS[platformId]
  if (!reader) {
    console.log(chalk.red(`\n  Status check not yet implemented for ${platformInfo.name}.\n`))
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

  console.log(chalk.bold(`\n  Phosra Status — ${platformInfo.name}\n`))

  const { chromium } = await import('playwright')
  let browser

  const cleanup = async () => {
    if (browser) await browser.close().catch(() => {})
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

    // Login first
    const spinner = ora()
    spinner.start(`Logging into ${platformInfo.name}...`)

    if (platformId === 'netflix') {
      await page.goto('https://www.netflix.com/login')
      await page.waitForLoadState('networkidle')
      await page.fill('input[name="userLoginId"], input#id_userLoginId', cred.username)
      await page.fill('input[name="password"], input#id_password', cred.password)
      await page.click('button[type="submit"]')
      await page.waitForLoadState('networkidle')
    } else if (platformId === 'youtube') {
      await page.goto('https://accounts.google.com/signin')
      await page.waitForLoadState('networkidle')
      const emailInput = await page.$('input[type="email"]')
      if (emailInput) {
        await emailInput.fill(cred.username)
        await page.click('#identifierNext, button[type="submit"]')
        await page.waitForTimeout(2000)
      }
      const passwordInput = await page.$('input[type="password"]')
      if (passwordInput) {
        await passwordInput.fill(cred.password)
        await page.click('#passwordNext, button[type="submit"]')
        await page.waitForLoadState('networkidle')
      }
    } else if (platformId === 'roblox') {
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
    }

    spinner.succeed(`Logged into ${platformInfo.name}`)

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const screenshotDir = path.join(VAULT_DIR, 'screenshots', platformId, `status-${timestamp}`)
    fs.mkdirSync(screenshotDir, { recursive: true })

    const config = await reader(page, screenshotDir)

    await browser.close()
    browser = null

    // Display config
    console.log(chalk.bold('\n  Current Configuration:\n'))
    for (const [key, value] of Object.entries(config)) {
      if (Array.isArray(value)) {
        console.log(`  ${chalk.cyan(key)}:`)
        for (const item of value) {
          console.log(`    - ${item}`)
        }
      } else {
        console.log(`  ${chalk.cyan(key)}: ${value}`)
      }
    }

    console.log(chalk.dim(`\n  Screenshots saved to ${screenshotDir}\n`))
  } catch (err) {
    if (browser) await browser.close().catch(() => {})
    console.log(chalk.red(`\n  Status check failed: ${err.message}\n`))
    process.exit(1)
  }
}
