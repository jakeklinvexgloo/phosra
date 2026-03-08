/**
 * Fuzzy title matching for Netflix titles against CSM search results.
 *
 * Uses Sorensen-Dice coefficient on bigrams for similarity scoring.
 * Exact normalised match = 1.0, Dice > 0.6 = accept.
 */

// ---------------------------------------------------------------------------
// Normalisation
// ---------------------------------------------------------------------------

const ARTICLES = /^(the|a|an)\s+/i;

/**
 * Normalise a title for comparison:
 * - lowercase
 * - strip leading articles (the, a, an)
 * - strip characters that aren't alphanumeric, spaces, or apostrophes
 * - collapse whitespace
 */
export function normalizeTitle(raw: string): string {
  return raw
    .toLowerCase()
    .replace(ARTICLES, '')
    .replace(/[^a-z0-9\s']/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// ---------------------------------------------------------------------------
// Bigrams & Dice coefficient
// ---------------------------------------------------------------------------

function bigrams(s: string): Set<string> {
  const set = new Set<string>();
  for (let i = 0; i < s.length - 1; i++) {
    set.add(s.substring(i, i + 2));
  }
  return set;
}

/**
 * Sorensen-Dice coefficient between two strings.
 * Returns a value in [0, 1] where 1 = identical bigram sets.
 */
export function diceCoefficient(a: string, b: string): number {
  if (a === b) return 1;
  if (a.length < 2 || b.length < 2) return 0;

  const bigramsA = bigrams(a);
  const bigramsB = bigrams(b);

  let intersection = 0;
  for (const bg of bigramsA) {
    if (bigramsB.has(bg)) intersection++;
  }

  return (2 * intersection) / (bigramsA.size + bigramsB.size);
}

// ---------------------------------------------------------------------------
// Title matching
// ---------------------------------------------------------------------------

export interface CSMSearchLink {
  href: string;
  text: string;
}

export interface MatchResult {
  href: string;
  confidence: number;
}

/**
 * Find the best matching CSM search result for a Netflix title.
 *
 * @returns The best match with confidence score, or null if nothing is close enough.
 */
export function matchTitle(
  netflixTitle: string,
  csmResults: CSMSearchLink[],
): MatchResult | null {
  if (csmResults.length === 0) return null;

  const normalised = normalizeTitle(netflixTitle);
  let bestMatch: MatchResult | null = null;
  let bestScore = 0;

  for (const result of csmResults) {
    const resultNorm = normalizeTitle(result.text);

    // Exact normalised match
    if (normalised === resultNorm) {
      return { href: result.href, confidence: 1.0 };
    }

    // Substring containment (one contains the other)
    if (normalised.includes(resultNorm) || resultNorm.includes(normalised)) {
      const score = 0.9;
      if (score > bestScore) {
        bestScore = score;
        bestMatch = { href: result.href, confidence: score };
      }
      continue;
    }

    // Dice coefficient
    const dice = diceCoefficient(normalised, resultNorm);
    if (dice > bestScore) {
      bestScore = dice;
      bestMatch = { href: result.href, confidence: dice };
    }
  }

  // Only accept matches above the threshold
  if (bestMatch && bestMatch.confidence >= 0.6) {
    return bestMatch;
  }

  return null;
}
