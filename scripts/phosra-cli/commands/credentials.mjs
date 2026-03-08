import chalk from 'chalk'
import inquirer from 'inquirer'
import { readVault, writeVault, vaultExists, getVaultPassword } from './vault.mjs'
import { SUPPORTED_PLATFORMS } from './platforms.mjs'

async function promptPassword() {
  const envKey = getVaultPassword()
  if (envKey) return envKey

  const { password } = await inquirer.prompt([
    {
      type: 'password',
      name: 'password',
      message: 'Vault password:',
      mask: '*',
    },
  ])
  return password
}

export async function credentialsCommand(action, platform) {
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

  switch (action) {
    case 'add':
      await addCredential(credentials, password, platform)
      break
    case 'list':
      listCredentials(credentials)
      break
    case 'remove':
      await removeCredential(credentials, password, platform)
      break
  }
}

async function addCredential(credentials, password, platform) {
  const platformId = platform.toLowerCase()
  const platformInfo = SUPPORTED_PLATFORMS[platformId]

  if (!platformInfo) {
    console.log(chalk.red(`\n  Unknown platform "${platform}". Run "phosra platforms" to see supported platforms.\n`))
    process.exit(1)
  }

  console.log(chalk.bold(`\n  Add credentials for ${platformInfo.name}\n`))

  if (credentials[platformId]) {
    const { overwrite } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'overwrite',
        message: `Credentials for ${platformInfo.name} already exist. Overwrite?`,
        default: false,
      },
    ])
    if (!overwrite) {
      console.log(chalk.yellow('  Aborted.\n'))
      return
    }
  }

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'username',
      message: 'Username / Email:',
      validate: (v) => (v.length > 0 ? true : 'Required'),
    },
    {
      type: 'password',
      name: 'password',
      message: 'Password:',
      mask: '*',
      validate: (v) => (v.length > 0 ? true : 'Required'),
    },
    {
      type: 'input',
      name: 'totp',
      message: 'TOTP secret (optional, press Enter to skip):',
    },
  ])

  credentials[platformId] = {
    username: answers.username,
    password: answers.password,
    ...(answers.totp ? { totpSecret: answers.totp } : {}),
    addedAt: new Date().toISOString(),
  }

  writeVault(credentials, password)
  console.log(chalk.green(`  ✔ Credentials saved for ${platformInfo.name}\n`))
}

function listCredentials(credentials) {
  const keys = Object.keys(credentials)

  console.log(chalk.bold('\n  Configured Platforms\n'))

  if (keys.length === 0) {
    console.log(chalk.dim('  No credentials stored. Use "phosra credentials add <platform>" to add.\n'))
    return
  }

  for (const id of keys) {
    const cred = credentials[id]
    const platformInfo = SUPPORTED_PLATFORMS[id]
    const name = platformInfo ? platformInfo.name : id
    const hasTotp = cred.totpSecret ? chalk.green(' [TOTP]') : ''
    console.log(`  ${chalk.cyan(name.padEnd(16))} ${chalk.dim(cred.username)}${hasTotp}`)
  }
  console.log()
}

async function removeCredential(credentials, password, platform) {
  const platformId = platform.toLowerCase()

  if (!credentials[platformId]) {
    console.log(chalk.yellow(`\n  No credentials found for "${platform}".\n`))
    return
  }

  const platformInfo = SUPPORTED_PLATFORMS[platformId]
  const name = platformInfo ? platformInfo.name : platformId

  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: `Remove credentials for ${name}?`,
      default: false,
    },
  ])

  if (!confirm) {
    console.log(chalk.yellow('  Aborted.\n'))
    return
  }

  delete credentials[platformId]
  writeVault(credentials, password)
  console.log(chalk.green(`  ✔ Credentials removed for ${name}\n`))
}
