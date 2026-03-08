#!/usr/bin/env node

import { Command } from 'commander'
import chalk from 'chalk'
import { initCommand } from './commands/init.mjs'
import { credentialsCommand } from './commands/credentials.mjs'
import { enforceCommand } from './commands/enforce.mjs'
import { statusCommand } from './commands/status.mjs'
import { platformsCommand } from './commands/platforms.mjs'

const program = new Command()

program
  .name('phosra')
  .description('Phosra parental controls enforcement CLI')
  .version('0.1.0')

program
  .command('init')
  .description('Initialize credential vault')
  .action(initCommand)

const creds = program
  .command('credentials')
  .description('Manage platform credentials')

creds
  .command('add <platform>')
  .description('Add credentials for a platform (interactive prompt)')
  .action(async (platform) => {
    await credentialsCommand('add', platform)
  })

creds
  .command('list')
  .description('List configured platforms')
  .action(async () => {
    await credentialsCommand('list')
  })

creds
  .command('remove <platform>')
  .description('Remove credentials for a platform')
  .action(async (platform) => {
    await credentialsCommand('remove', platform)
  })

program
  .command('enforce')
  .description('Enforce parental control rules on a platform')
  .requiredOption('--platform <id>', 'Platform to enforce (e.g. netflix, youtube, roblox)')
  .requiredOption('--child <name>', 'Child profile name')
  .requiredOption('--age <n>', 'Child age', parseInt)
  .option('--headed', 'Run browser in headed mode for debugging')
  .action(enforceCommand)

program
  .command('status')
  .description('Check current platform configuration')
  .requiredOption('--platform <id>', 'Platform to check')
  .option('--headed', 'Run browser in headed mode for debugging')
  .action(statusCommand)

program
  .command('platforms')
  .description('List supported platforms and their rule categories')
  .action(platformsCommand)

// Graceful shutdown
process.on('SIGINT', () => {
  console.log(chalk.yellow('\nShutting down...'))
  process.exit(0)
})

process.on('SIGTERM', () => {
  process.exit(0)
})

program.parse()
