import chalk from 'chalk'

export const SUPPORTED_PLATFORMS = {
  netflix: {
    name: 'Netflix',
    url: 'https://www.netflix.com',
    ruleCategories: [
      'content_rating',
      'purchase_control',
      'profile_restrictions',
    ],
    description: 'Content maturity ratings, PIN-locked profiles, purchase controls',
  },
  youtube: {
    name: 'YouTube',
    url: 'https://www.youtube.com',
    ruleCategories: [
      'content_rating',
      'restricted_mode',
      'search_restrictions',
      'autoplay_control',
    ],
    description: 'Restricted Mode, search filtering, autoplay settings',
  },
  roblox: {
    name: 'Roblox',
    url: 'https://www.roblox.com',
    ruleCategories: [
      'content_rating',
      'chat_restrictions',
      'purchase_control',
      'screen_time_limit',
      'contact_restrictions',
    ],
    description: 'Age-based content, chat filters, spending limits, screen time',
  },
  disney_plus: {
    name: 'Disney+',
    url: 'https://www.disneyplus.com',
    ruleCategories: [
      'content_rating',
      'profile_restrictions',
      'purchase_control',
    ],
    description: 'Content ratings, kids profiles, purchase PIN',
  },
  tiktok: {
    name: 'TikTok',
    url: 'https://www.tiktok.com',
    ruleCategories: [
      'screen_time_limit',
      'content_rating',
      'dm_restrictions',
      'search_restrictions',
    ],
    description: 'Screen time, restricted mode, DM controls, search filtering',
  },
  instagram: {
    name: 'Instagram',
    url: 'https://www.instagram.com',
    ruleCategories: [
      'dm_restrictions',
      'content_sensitivity',
      'screen_time_limit',
      'account_privacy',
    ],
    description: 'DM restrictions, sensitive content, time limits, private accounts',
  },
}

export async function platformsCommand() {
  console.log(chalk.bold('\n  Supported Platforms\n'))

  const entries = Object.entries(SUPPORTED_PLATFORMS)

  for (const [id, platform] of entries) {
    console.log(`  ${chalk.cyan(platform.name.padEnd(16))} ${chalk.dim(id)}`)
    console.log(`  ${' '.repeat(16)} ${platform.description}`)
    console.log(
      `  ${' '.repeat(16)} Rules: ${platform.ruleCategories.map((r) => chalk.yellow(r)).join(', ')}`
    )
    console.log()
  }

  console.log(chalk.dim(`  ${entries.length} platforms supported\n`))
}
