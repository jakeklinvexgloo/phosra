/**
 * Bridge between suggested-sites.ts categories and credential data.
 * Provides category metadata (colors, icons) and credential matching utilities.
 */

import { suggestedSites, type SuggestedSite } from './suggested-sites';
import type { CredentialInfo } from './ipc';

export interface CategoryDef {
  name: string;
  color: string;       // Tailwind text color for dot/accents
  bgColor: string;     // Tailwind bg color for active chip
  ringColor: string;   // Tailwind ring color for active chip
  hoverGlow: string;   // Tailwind hover shadow for tiles
  panelGradient: string; // CSS radial gradient for expanded panel bg
  sites: SuggestedSite[];
}

/** Family category — rendered as the first chip, separate from provider categories. */
export const FAMILY_CATEGORY = {
  name: 'Family',
  color: 'text-teal-400',
  bgColor: 'bg-teal-400/12',
  ringColor: 'ring-teal-400/30',
  panelGradient: 'radial-gradient(ellipse at top left, rgba(45,212,191,0.06) 0%, transparent 60%)',
};

export const CATEGORIES: CategoryDef[] = [
  {
    name: 'Streaming',
    color: 'text-purple-400',
    bgColor: 'bg-purple-400/12',
    ringColor: 'ring-purple-400/30',
    hoverGlow: 'hover:shadow-[0_4px_20px_rgba(168,85,247,0.15)]',
    panelGradient: 'radial-gradient(ellipse at top left, rgba(168,85,247,0.06) 0%, transparent 60%)',
    sites: suggestedSites.filter((s) => s.category === 'Streaming'),
  },
  {
    name: 'AI',
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/12',
    ringColor: 'ring-blue-400/30',
    hoverGlow: 'hover:shadow-[0_4px_20px_rgba(96,165,250,0.15)]',
    panelGradient: 'radial-gradient(ellipse at top left, rgba(96,165,250,0.06) 0%, transparent 60%)',
    sites: suggestedSites.filter((s) => s.category === 'AI'),
  },
  {
    name: 'Social',
    color: 'text-pink-400',
    bgColor: 'bg-pink-400/12',
    ringColor: 'ring-pink-400/30',
    hoverGlow: 'hover:shadow-[0_4px_20px_rgba(244,114,182,0.15)]',
    panelGradient: 'radial-gradient(ellipse at top left, rgba(244,114,182,0.06) 0%, transparent 60%)',
    sites: suggestedSites.filter((s) => s.category === 'Social'),
  },
  {
    name: 'Kids & Education',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-400/12',
    ringColor: 'ring-emerald-400/30',
    hoverGlow: 'hover:shadow-[0_4px_20px_rgba(52,211,153,0.15)]',
    panelGradient: 'radial-gradient(ellipse at top left, rgba(52,211,153,0.06) 0%, transparent 60%)',
    sites: suggestedSites.filter((s) => s.category === 'Kids & Education'),
  },
];

/** Extract domain from a URL (e.g. "https://www.netflix.com/login" -> "netflix.com") */
export function getDomainFromUrl(url: string): string {
  try {
    const hostname = new URL(url).hostname;
    return hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

/** Find matching credential for a suggested site */
export function findCredentialForSite(
  site: SuggestedSite,
  credentials: CredentialInfo[],
): CredentialInfo | undefined {
  const siteDomain = getDomainFromUrl(site.url);
  return credentials.find((c) => {
    if (c.displayName.toLowerCase() === site.name.toLowerCase()) return true;
    if (c.loginUrl && getDomainFromUrl(c.loginUrl) === siteDomain) return true;
    if (c.serviceId.toLowerCase().includes(siteDomain.split('.')[0])) return true;
    return false;
  });
}
