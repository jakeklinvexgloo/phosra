import type { LawEntry } from "./types"

/**
 * Auto-generates an MCP enforcement snippet from law metadata.
 * Used for laws that don't have a hand-crafted mcpSnippet.
 */
export function generateMcpSnippet(law: LawEntry): string {
  const rulesList = law.ruleCategories
    .slice(0, 4)
    .map((r) => `          "${r}"`)
    .join(",\n")

  const platformResults = law.platforms
    .slice(0, 4)
    .map((p) => {
      const padded = p.padEnd(12)
      return `→ ${padded} enforcement applied     ✓`
    })
    .join("\n")

  const lawConst = law.id.toUpperCase().replace(/-/g, "_")

  return `// Enforce ${law.shortName} compliance
tool: trigger_child_enforcement
input: {
  child_id: "ch_emma_01",
  law: "${lawConst}",
  rules: [\n${rulesList}]
}

${platformResults}`
}
