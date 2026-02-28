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

/** Normalize severity tags in blockquotes: "> [HIGH]" / "> [CRITICAL]" */
function normalizeSeverityTags(text: string): string {
  // Normalize various severity tag formats to consistent [TAG] prefix
  return text.replace(
    /^(>\s*)\[?\s*(CRITICAL|HIGH)\s*\]?[:\s-]*/gim,
    (_, prefix, severity) => `${prefix}[${severity.toUpperCase()}] `
  )
}

/** Convert inline ranking lists to platform-ranking code fences */
function convertRankingLists(text: string): string {
  // Match a numbered list of 3+ platforms with grades: "1. Platform: Grade (Score/100)"
  const rankingPattern = /(?:^|\n)((?:\d+\.\s+[A-Z][a-zA-Z.]+(?:\s+[A-Z][a-zA-Z.]*)*\s*(?::|—|–|-)\s*[A-F][+-]?\s*(?:\(\d+\/100\))\s*\n?){3,})/gm
  return text.replace(rankingPattern, (match, list) => {
    // Only convert if it's not already inside a code fence
    return `\n\`\`\`platform-ranking\n${list.trim()}\n\`\`\`\n`
  })
}

/** Auto-append CTA links when response mentions Phosra's features */
function appendCTAs(text: string): string {
  // Don't add if CTAs already exist
  if (/\]\(cta:/.test(text)) return text

  const lower = text.toLowerCase()
  const ctas: string[] = []

  if (lower.includes("compare") && lower.includes("platform")) {
    ctas.push("[Compare all platforms →](cta:compare)")
  }
  if (lower.includes("parental control")) {
    ctas.push("[Explore parental controls →](cta:parental-controls)")
  }
  if (lower.includes("phosra") && (lower.includes("sign up") || lower.includes("get started") || lower.includes("try"))) {
    ctas.push("[Get started with Phosra →](cta:sign-up)")
  }
  if (lower.includes("methodology") || lower.includes("how we test")) {
    ctas.push("[View our methodology →](cta:methodology)")
  }

  if (ctas.length > 0) {
    return text + "\n\n" + ctas.join("  ")
  }
  return text
}

/** Extract follow-up questions from the delimiter block and return cleaned text + questions */
export function extractFollowUps(text: string): { text: string; followUps: string[] } {
  const pattern = /\n?---follow-ups---\n([\s\S]*?)\n---end-follow-ups---\s*$/
  const match = text.match(pattern)

  if (!match) {
    return { text, followUps: [] }
  }

  const cleaned = text.replace(pattern, "").trimEnd()
  const questions = match[1]
    .split("\n")
    .map((q) => q.trim())
    .filter((q) => q.length > 0)
    .slice(0, 3)

  return { text: cleaned, followUps: questions }
}

/** Main preprocessing pipeline */
export function preprocessResearchText(text: string): string {
  let result = text
  result = normalizeChecks(result)
  result = convertScoreDistributions(result)
  result = normalizeSeverityTags(result)
  result = convertRankingLists(result)
  result = appendCTAs(result)
  return result
}
