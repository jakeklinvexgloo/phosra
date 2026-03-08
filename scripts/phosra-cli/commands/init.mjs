import chalk from 'chalk'
import inquirer from 'inquirer'
import { createVault, vaultExists, getVaultPassword, VAULT_DIR } from './vault.mjs'

export async function initCommand() {
  console.log(chalk.bold('\n  Phosra CLI — Initialize Vault\n'))

  if (vaultExists()) {
    const { overwrite } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'overwrite',
        message: 'Vault already exists. Overwrite? (this will delete all stored credentials)',
        default: false,
      },
    ])
    if (!overwrite) {
      console.log(chalk.yellow('  Aborted.\n'))
      return
    }
  }

  let password = getVaultPassword()

  if (!password) {
    const answers = await inquirer.prompt([
      {
        type: 'password',
        name: 'password',
        message: 'Set a master password for the vault:',
        mask: '*',
        validate: (v) => (v.length >= 8 ? true : 'Password must be at least 8 characters'),
      },
      {
        type: 'password',
        name: 'confirm',
        message: 'Confirm master password:',
        mask: '*',
      },
    ])

    if (answers.password !== answers.confirm) {
      console.log(chalk.red('  Passwords do not match. Aborted.\n'))
      process.exit(1)
    }

    password = answers.password
  }

  createVault(password)

  console.log(chalk.green('  ✔ Vault created at ' + VAULT_DIR))
  console.log(chalk.dim('    Tip: set PHOSRA_VAULT_KEY env var to skip password prompts\n'))
}
