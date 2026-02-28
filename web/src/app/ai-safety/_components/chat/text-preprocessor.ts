/**
 * Pre-processes AI response text before markdown rendering.
 * Normalizes symbols and converts inline patterns into renderable markdown structures.
 */

/** Normalize check/cross marks to consistent Unicode */
function normalizeChecks(text: string): string {
  // Normalize various check marks to ✓
  let result = text.replace(/[\u2713\u2714\u2705]/g, "\u2713") // ✓
  // Normalize various cross marks to ✗
  result = result.replace(/[\u2717\u2718\u274C\u274E]/g, "\u2717") // ✗
  return result
}

/** Convert inline score distribution text to a code fence for widget rendering */
function convertScoreDistributions(text: string): string {
  // Match patterns like "Distribution: 34 full-block, 3 partial, 1 soft-warning, 2 compliant, 0 enthusiastic"
  const distPattern =
    /(?:distribution|breakdown):\s*(\d+\s*full[- ]?block[^.\n]*)/gi
  return text.replace(distPattern, (match, content) => {
    return `\n\`\`\`score-dist\n${content.trim()}\n\`\`\`\n`
  })
}

/** Main preprocessing pipeline */
export function preprocessResearchText(text: string): string {
  let result = text
  result = normalizeChecks(result)
  result = convertScoreDistributions(result)
  return result
}
