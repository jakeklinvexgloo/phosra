export interface SuggestedSite {
  name: string;
  url: string;
  /** Direct login URL — used for auto-fill navigation when credentials are saved. */
  loginUrl?: string;
  category: string;
}

export const suggestedSites: SuggestedSite[] = [
  // Streaming Services
  { name: 'Netflix', url: 'https://www.netflix.com', loginUrl: 'https://www.netflix.com/login', category: 'Streaming' },
  { name: 'Disney+', url: 'https://www.disneyplus.com', loginUrl: 'https://www.disneyplus.com/login', category: 'Streaming' },
  { name: 'Hulu', url: 'https://www.hulu.com', loginUrl: 'https://auth.hulu.com/web/login', category: 'Streaming' },
  { name: 'Max', url: 'https://www.max.com', loginUrl: 'https://www.max.com/login', category: 'Streaming' },
  { name: 'Paramount+', url: 'https://www.paramountplus.com', loginUrl: 'https://www.paramountplus.com/account/signin/', category: 'Streaming' },
  { name: 'YouTube', url: 'https://www.youtube.com', loginUrl: 'https://accounts.google.com/v3/signin/identifier?service=youtube', category: 'Streaming' },
  { name: 'YouTube Kids', url: 'https://www.youtubekids.com', category: 'Streaming' },
  { name: 'Apple TV+', url: 'https://tv.apple.com', loginUrl: 'https://tv.apple.com/login', category: 'Streaming' },
  { name: 'Amazon Prime Video', url: 'https://www.primevideo.com', loginUrl: 'https://www.amazon.com/gp/video/profiles/ref=atv_profile_redirect_pid_locked?switchRurl=%2Fgp%2Fvideo%2Fstorefront%3Fie%3DUTF8%26node%3D2858778011', category: 'Streaming' },
  { name: 'Peacock', url: 'https://www.peacocktv.com', category: 'Streaming' },
  { name: 'Crunchyroll', url: 'https://www.crunchyroll.com', category: 'Streaming' },
  { name: 'Tubi', url: 'https://tubitv.com', category: 'Streaming' },

  // AI Platforms
  { name: 'ChatGPT', url: 'https://chat.openai.com', category: 'AI' },
  { name: 'Claude', url: 'https://claude.ai', category: 'AI' },
  { name: 'Gemini', url: 'https://gemini.google.com', category: 'AI' },
  { name: 'Perplexity', url: 'https://www.perplexity.ai', category: 'AI' },
  { name: 'Character.ai', url: 'https://character.ai', category: 'AI' },
  { name: 'Replika', url: 'https://replika.com', category: 'AI' },
  { name: 'Copilot', url: 'https://copilot.microsoft.com', category: 'AI' },
  { name: 'Meta AI', url: 'https://www.meta.ai', category: 'AI' },
  { name: 'Grok', url: 'https://grok.x.ai', category: 'AI' },
  { name: 'Midjourney', url: 'https://www.midjourney.com', category: 'AI' },

  // Social Media
  { name: 'Instagram', url: 'https://www.instagram.com', category: 'Social' },
  { name: 'TikTok', url: 'https://www.tiktok.com', category: 'Social' },
  { name: 'Snapchat', url: 'https://www.snapchat.com', category: 'Social' },
  { name: 'X / Twitter', url: 'https://x.com', category: 'Social' },
  { name: 'Facebook', url: 'https://www.facebook.com', category: 'Social' },
  { name: 'Reddit', url: 'https://www.reddit.com', category: 'Social' },
  { name: 'Discord', url: 'https://discord.com', category: 'Social' },
  { name: 'Twitch', url: 'https://www.twitch.tv', category: 'Social' },
  { name: 'Pinterest', url: 'https://www.pinterest.com', category: 'Social' },
  { name: 'BeReal', url: 'https://bereal.com', category: 'Social' },
  { name: 'Threads', url: 'https://www.threads.net', category: 'Social' },

  // Kids & Education
  { name: 'PBS Kids', url: 'https://pbskids.org', category: 'Kids & Education' },
  { name: 'Khan Academy', url: 'https://www.khanacademy.org', category: 'Kids & Education' },
  { name: 'ABCmouse', url: 'https://www.abcmouse.com', category: 'Kids & Education' },
  { name: 'Roblox', url: 'https://www.roblox.com', category: 'Kids & Education' },
  { name: 'Minecraft.net', url: 'https://www.minecraft.net', category: 'Kids & Education' },
  { name: 'Common Sense Media', url: 'https://www.commonsensemedia.org', category: 'Kids & Education' },
];

const defaultCategories = ['Streaming', 'AI'];

export function getDefaultSuggestions(): SuggestedSite[] {
  return suggestedSites.filter((s) => defaultCategories.includes(s.category));
}

export function filterSuggestions(query: string, max = 8): SuggestedSite[] {
  if (!query.trim()) return getDefaultSuggestions().slice(0, max);
  const q = query.toLowerCase();
  return suggestedSites
    .filter((s) => s.name.toLowerCase().includes(q) || s.url.toLowerCase().includes(q))
    .slice(0, max);
}
