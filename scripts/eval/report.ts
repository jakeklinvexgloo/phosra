/**
 * Phosra Eval Report — generates markdown summary from scores.
 *
 * Usage: npx tsx report.ts
 */

import { readFileSync, writeFileSync } from "fs"
import { resolve, dirname } from "path"

interface Score {
  promptId: string
  category: string
  title: string
  sessionId: string
  taskCompletion: number
  responseQuality: number
  combined: number
  assertionDetails: {
    toolsCalledPass: boolean
    toolsNotCalledPass: boolean
    mentionsPass: boolean
    minToolCallsPass: boolean
    noErrorPass: boolean
  }
  qualityDetails: {
    accuracy: number
    helpfulness: number
    completeness: number
    tone: number
    efficiency: number
  }
  error?: string
}

const SCORES_PATH = resolve(dirname(new URL(import.meta.url).pathname), "scores.json")
const REPORT_PATH = resolve(dirname(new URL(import.meta.url).pathname), "eval-report.md")

function main() {
  const scores: Score[] = JSON.parse(readFileSync(SCORES_PATH, "utf-8"))

  if (scores.length === 0) {
    console.error("No scores found. Run scorer.ts first.")
    process.exit(1)
  }

  // Group by category
  const categories = new Map<string, Score[]>()
  for (const s of scores) {
    const arr = categories.get(s.category) || []
    arr.push(s)
    categories.set(s.category, arr)
  }

  const avg = (arr: number[]) => Math.round(arr.reduce((a, b) => a + b, 0) / arr.length)

  // Overall stats
  const allCombined = scores.map((s) => s.combined)
  const allTC = scores.map((s) => s.taskCompletion)
  const allRQ = scores.map((s) => s.responseQuality)

  let md = `# Phosra Eval Report\n\n`
  md += `**Date:** ${new Date().toISOString().split("T")[0]}\n`
  md += `**Prompts scored:** ${scores.length}\n`
  md += `**Categories:** ${categories.size}\n\n`

  md += `## Overall Scores\n\n`
  md += `| Metric | Score |\n|--------|-------|\n`
  md += `| Combined | **${avg(allCombined)}** |\n`
  md += `| Task Completion | ${avg(allTC)} |\n`
  md += `| Response Quality | ${avg(allRQ)} |\n\n`

  // Quality dimension averages
  const allAcc = scores.map((s) => s.qualityDetails.accuracy)
  const allHelp = scores.map((s) => s.qualityDetails.helpfulness)
  const allComp = scores.map((s) => s.qualityDetails.completeness)
  const allTone = scores.map((s) => s.qualityDetails.tone)
  const allEff = scores.map((s) => s.qualityDetails.efficiency)

  md += `## Quality Dimensions (0-20 each)\n\n`
  md += `| Dimension | Avg |\n|-----------|-----|\n`
  md += `| Accuracy | ${avg(allAcc)} |\n`
  md += `| Helpfulness | ${avg(allHelp)} |\n`
  md += `| Completeness | ${avg(allComp)} |\n`
  md += `| Tone | ${avg(allTone)} |\n`
  md += `| Efficiency | ${avg(allEff)} |\n\n`

  // Per-category breakdown
  md += `## Scores by Category\n\n`
  md += `| Category | Count | Combined | TC | RQ |\n|----------|-------|----------|-----|----|\n`

  const sortedCats = Array.from(categories.entries()).sort(
    ([, a], [, b]) => avg(a.map((s) => s.combined)) - avg(b.map((s) => s.combined))
  )

  for (const [cat, catScores] of sortedCats) {
    const c = avg(catScores.map((s) => s.combined))
    const t = avg(catScores.map((s) => s.taskCompletion))
    const r = avg(catScores.map((s) => s.responseQuality))
    const flag = c < 70 ? " ⚠️" : c < 85 ? "" : " ✅"
    md += `| ${cat}${flag} | ${catScores.length} | **${c}** | ${t} | ${r} |\n`
  }
  md += `\n`

  // Worst performers (< 70)
  const worst = scores.filter((s) => s.combined < 70).sort((a, b) => a.combined - b.combined)
  if (worst.length > 0) {
    md += `## Worst Performers (< 70)\n\n`
    md += `| ID | Title | Combined | TC | RQ | Issue |\n|-----|-------|----------|-----|----|---------|\n`
    for (const s of worst) {
      const issues: string[] = []
      if (!s.assertionDetails.toolsCalledPass) issues.push("missing tools")
      if (!s.assertionDetails.noErrorPass) issues.push("error")
      if (!s.assertionDetails.minToolCallsPass) issues.push("too few tool calls")
      if (!s.assertionDetails.mentionsPass) issues.push("missing mentions")
      if (s.qualityDetails.accuracy < 12) issues.push("low accuracy")
      if (s.qualityDetails.completeness < 12) issues.push("incomplete")
      if (s.qualityDetails.efficiency < 12) issues.push("inefficient")
      md += `| ${s.promptId} | ${s.title} | ${s.combined} | ${s.taskCompletion} | ${s.responseQuality} | ${issues.join(", ")} |\n`
    }
    md += `\n`
  }

  // Errors
  const errored = scores.filter((s) => s.error)
  if (errored.length > 0) {
    md += `## Errors (${errored.length})\n\n`
    for (const s of errored) {
      md += `- **${s.promptId}**: ${s.error!.slice(0, 200)}\n`
    }
    md += `\n`
  }

  // Common failure patterns
  md += `## Assertion Failure Rates\n\n`
  const totalScored = scores.length
  const failRates = {
    "Tools not called": scores.filter((s) => !s.assertionDetails.toolsCalledPass).length,
    "Forbidden tools used": scores.filter((s) => !s.assertionDetails.toolsNotCalledPass).length,
    "Missing mentions": scores.filter((s) => !s.assertionDetails.mentionsPass).length,
    "Too few tool calls": scores.filter((s) => !s.assertionDetails.minToolCallsPass).length,
    "Errors": scores.filter((s) => !s.assertionDetails.noErrorPass).length,
  }
  md += `| Assertion | Failures | Rate |\n|-----------|----------|------|\n`
  for (const [name, count] of Object.entries(failRates)) {
    md += `| ${name} | ${count} | ${Math.round((count / totalScored) * 100)}% |\n`
  }
  md += `\n`

  // Top performers
  const best = scores.filter((s) => s.combined >= 90).sort((a, b) => b.combined - a.combined)
  if (best.length > 0) {
    md += `## Top Performers (≥ 90)\n\n`
    md += `${best.length} prompts scored 90+.\n\n`
  }

  writeFileSync(REPORT_PATH, md)
  console.log(`\n═══ Report Generated ═══`)
  console.log(`Path: ${REPORT_PATH}`)
  console.log(`Overall combined score: ${avg(allCombined)}`)
  console.log(`Worst category: ${sortedCats[0]?.[0]} (${avg(sortedCats[0]?.[1].map((s) => s.combined) || [0])})`)
  console.log(`Best category: ${sortedCats[sortedCats.length - 1]?.[0]} (${avg(sortedCats[sortedCats.length - 1]?.[1].map((s) => s.combined) || [0])})`)
  if (worst.length > 0) console.log(`Prompts < 70: ${worst.length}`)
  if (errored.length > 0) console.log(`Errors: ${errored.length}`)
}

main()
