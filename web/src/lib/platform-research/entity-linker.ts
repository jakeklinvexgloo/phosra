/**
 * Entity linker for AI safety research chat responses.
 * Post-processes markdown text to inject links for known platforms, dimensions, and pages.
 */

interface EntityRule {
  pattern: RegExp
  url: string
}

const ENTITY_RULES: EntityRule[] = [
  // Platforms
  { pattern: /\bCharacter\.AI\b/i, url: "/research/ai-chatbots/character_ai" },
  { pattern: /\bChatGPT\b/i, url: "/research/ai-chatbots/chatgpt" },
  { pattern: /\bClaude\b/i, url: "/research/ai-chatbots/claude" },
  { pattern: /\bGemini\b/i, url: "/research/ai-chatbots/gemini" },
  { pattern: /\bGrok\b/i, url: "/research/ai-chatbots/grok" },
  { pattern: /\bCopilot\b/i, url: "/research/ai-chatbots/copilot" },
  { pattern: /\bPerplexity\b/i, url: "/research/ai-chatbots/perplexity" },
  { pattern: /\bReplika\b/i, url: "/research/ai-chatbots/replika" },

  // Dimensions
  { pattern: /\bage verification\b/i, url: "/research/ai-chatbots/dimensions/age-verification" },
  { pattern: /\bparental controls?\b/i, url: "/research/ai-chatbots/dimensions/parental-controls" },
  { pattern: /\bconversation controls?\b/i, url: "/research/ai-chatbots/dimensions/conversation-controls" },
  { pattern: /\bemotional safety\b/i, url: "/research/ai-chatbots/dimensions/emotional-safety" },
  { pattern: /\bacademic integrity\b/i, url: "/research/ai-chatbots/dimensions/academic-integrity" },
  { pattern: /\bprivacy (?:&|and) data\b/i, url: "/research/ai-chatbots/dimensions/privacy-data" },
  { pattern: /\bsafety testing\b/i, url: "/research/ai-chatbots/dimensions/safety-testing" },

  // Other pages
  { pattern: /\btest prompts?\b/i, url: "/research/ai-chatbots/prompts" },
  { pattern: /\bmethodology\b/i, url: "/research/ai-chatbots/methodology" },
  { pattern: /\bcompar(?:e|ison)\b/i, url: "/research/ai-chatbots/compare" },
]

/**
 * Post-process markdown text to inject links for known research entities.
 * Only links each entity once per message to avoid over-linking.
 */
export function linkifyResearchText(markdown: string): string {
  // Track which URLs we've already linked (one link per entity per message)
  const linked = new Set<string>()

  // Extract protected regions (existing markdown links and code blocks) so we don't modify them
  const protectedRegions: { start: number; end: number }[] = []
  let result = markdown

  // Collect existing markdown links [text](url)
  const linkRe = /\[[^\]]*\]\([^)]*\)/g
  let m: RegExpExecArray | null
  while ((m = linkRe.exec(result)) !== null) {
    protectedRegions.push({ start: m.index, end: m.index + m[0].length })
  }

  // Collect code blocks ``` ... ```
  const codeBlockRe = /```[\s\S]*?```/g
  while ((m = codeBlockRe.exec(result)) !== null) {
    protectedRegions.push({ start: m.index, end: m.index + m[0].length })
  }

  // Collect inline code `...`
  const inlineCodeRe = /`[^`]+`/g
  while ((m = inlineCodeRe.exec(result)) !== null) {
    protectedRegions.push({ start: m.index, end: m.index + m[0].length })
  }

  function isProtected(index: number, length: number): boolean {
    const end = index + length
    return protectedRegions.some((r) => index >= r.start && end <= r.end)
  }

  for (const rule of ENTITY_RULES) {
    if (linked.has(rule.url)) continue

    // Find first match that's not in a protected region
    const globalPattern = new RegExp(rule.pattern.source, rule.pattern.flags + (rule.pattern.flags.includes("g") ? "" : "g"))
    let match: RegExpExecArray | null
    while ((match = globalPattern.exec(result)) !== null) {
      if (isProtected(match.index, match[0].length)) continue

      // Replace this occurrence with a markdown link
      const replacement = `[${match[0]}](${rule.url})`
      result =
        result.slice(0, match.index) +
        replacement +
        result.slice(match.index + match[0].length)

      // Adjust protected regions after this insertion
      const delta = replacement.length - match[0].length
      for (const r of protectedRegions) {
        if (r.start > match.index) {
          r.start += delta
          r.end += delta
        }
      }

      // Protect the newly inserted link from future rules
      protectedRegions.push({
        start: match.index,
        end: match.index + replacement.length,
      })

      linked.add(rule.url)
      break // Only link first occurrence
    }
  }

  return result
}
