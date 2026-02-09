#!/usr/bin/env node

/**
 * Legislation Scanner
 *
 * Reads the current law registry, constructs a research prompt,
 * calls the Claude API to check for new/updated child safety legislation,
 * and generates a report.
 *
 * Environment variables:
 *   ANTHROPIC_API_KEY - Required. Claude API key for research queries.
 *   FORCE_REPORT      - Optional. Set to "true" to generate report even if no changes.
 */

import { readFileSync, writeFileSync, existsSync } from "fs"
import { resolve, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const REGISTRY_PATH = resolve(__dirname, "../web/src/lib/compliance/law-registry.ts")
const REPORT_PATH = resolve(__dirname, "legislation-report.md")

// Extract current law inventory from registry
function extractCurrentLaws() {
  const content = readFileSync(REGISTRY_PATH, "utf-8")
  const laws = []

  // Match id, shortName, status patterns
  const idRegex = /id:\s*"([^"]+)"/g
  const nameRegex = /shortName:\s*"([^"]+)"/g
  const statusRegex = /status:\s*"([^"]+)"/g

  const ids = [...content.matchAll(idRegex)].map((m) => m[1])
  const names = [...content.matchAll(nameRegex)].map((m) => m[1])
  const statuses = [...content.matchAll(statusRegex)].map((m) => m[1])

  for (let i = 0; i < ids.length; i++) {
    laws.push({
      id: ids[i],
      shortName: names[i] || ids[i],
      status: statuses[i] || "unknown",
    })
  }

  return laws
}

// Build the research prompt
function buildResearchPrompt(laws) {
  const lawList = laws
    .map((l) => `- ${l.shortName} (${l.id}): ${l.status}`)
    .join("\n")

  return `You are a legislative research analyst specializing in child online safety laws worldwide.

## Current Law Registry (${laws.length} laws)
${lawList}

## Task
Please research and report on any changes to child online safety legislation since the last update. Specifically:

1. **New Laws**: Identify any new child online safety laws enacted, proposed, or introduced globally that are NOT in the current registry above. Focus on:
   - US Federal bills (new or reintroduced)
   - US State laws (new states enacting child safety legislation)
   - EU/UK regulatory updates
   - Asia-Pacific legislation (Australia, India, Japan, South Korea, Singapore, Indonesia)
   - Americas (Canada, Brazil, Mexico, Chile)
   - Middle East & Africa (UAE, Saudi Arabia, Philippines)

2. **Status Changes**: For laws already in the registry, report any status changes:
   - Bills that have been signed into law
   - Laws that have taken effect (new effective dates)
   - Court injunctions issued or lifted
   - Amendments or significant regulatory updates

3. **Upcoming Deadlines**: Note any compliance deadlines in the next 6 months.

## Output Format
Respond in this exact JSON format:
\`\`\`json
{
  "scanDate": "YYYY-MM-DD",
  "newLaws": [
    {
      "suggestedId": "xx-law-name",
      "shortName": "XX Law",
      "fullName": "Full Legal Name",
      "jurisdiction": "Jurisdiction",
      "jurisdictionGroup": "us-federal|us-state|eu|uk|asia-pacific|americas|middle-east-africa",
      "country": "XX",
      "status": "enacted|passed|pending|proposed",
      "summary": "One sentence summary",
      "significance": "high|medium|low"
    }
  ],
  "statusChanges": [
    {
      "lawId": "existing-id",
      "currentStatus": "current",
      "newStatus": "updated",
      "details": "What changed"
    }
  ],
  "upcomingDeadlines": [
    {
      "lawId": "existing-id",
      "date": "YYYY-MM-DD",
      "description": "What happens"
    }
  ],
  "summary": "2-3 sentence overview of findings"
}
\`\`\`

Only include confirmed, verifiable legislative changes. Do not speculate or include unverified reports.`
}

// Call Claude API
async function callClaude(prompt) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    console.error("Error: ANTHROPIC_API_KEY environment variable is required")
    process.exit(1)
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Claude API error ${response.status}: ${error}`)
  }

  const data = await response.json()
  return data.content[0].text
}

// Parse Claude response and extract JSON
function parseResponse(responseText) {
  const jsonMatch = responseText.match(/```json\s*([\s\S]*?)```/)
  if (!jsonMatch) {
    // Try parsing the entire response as JSON
    try {
      return JSON.parse(responseText)
    } catch {
      console.error("Could not parse Claude response as JSON")
      return null
    }
  }
  return JSON.parse(jsonMatch[1])
}

// Generate markdown report
function generateReport(scanResult, currentLawCount) {
  const now = new Date().toISOString().split("T")[0]

  let report = `# Legislation Scan Report\n\n`
  report += `**Scan Date:** ${now}\n`
  report += `**Current Registry:** ${currentLawCount} laws\n`
  report += `**Scanner Version:** 1.0.0\n\n`

  if (scanResult.summary) {
    report += `## Summary\n\n${scanResult.summary}\n\n`
  }

  // New laws
  if (scanResult.newLaws?.length > 0) {
    report += `## New Laws Identified (${scanResult.newLaws.length})\n\n`
    for (const law of scanResult.newLaws) {
      report += `### ${law.shortName} — ${law.fullName}\n`
      report += `- **Jurisdiction:** ${law.jurisdiction}\n`
      report += `- **Status:** ${law.status}\n`
      report += `- **Significance:** ${law.significance}\n`
      report += `- **Summary:** ${law.summary}\n`
      report += `- **Suggested ID:** \`${law.suggestedId}\`\n\n`
    }
  } else {
    report += `## New Laws\n\nNo new laws identified.\n\n`
  }

  // Status changes
  if (scanResult.statusChanges?.length > 0) {
    report += `## Status Changes (${scanResult.statusChanges.length})\n\n`
    for (const change of scanResult.statusChanges) {
      report += `- **${change.lawId}**: ${change.currentStatus} → ${change.newStatus} — ${change.details}\n`
    }
    report += `\n`
  } else {
    report += `## Status Changes\n\nNo status changes detected.\n\n`
  }

  // Upcoming deadlines
  if (scanResult.upcomingDeadlines?.length > 0) {
    report += `## Upcoming Deadlines\n\n`
    for (const deadline of scanResult.upcomingDeadlines) {
      report += `- **${deadline.date}** — ${deadline.lawId}: ${deadline.description}\n`
    }
    report += `\n`
  }

  report += `---\n*Generated by legislation-scanner.mjs*\n`

  return report
}

// Main
async function main() {
  console.log("🔍 Starting legislation scan...")

  // 1. Extract current laws
  const currentLaws = extractCurrentLaws()
  console.log(`📋 Found ${currentLaws.length} laws in registry`)

  // 2. Build research prompt
  const prompt = buildResearchPrompt(currentLaws)

  // 3. Call Claude API
  console.log("🤖 Querying Claude API for legislation updates...")
  let responseText
  try {
    responseText = await callClaude(prompt)
  } catch (error) {
    console.error(`❌ API call failed: ${error.message}`)
    process.exit(1)
  }

  // 4. Parse response
  console.log("📝 Parsing response...")
  const scanResult = parseResponse(responseText)
  if (!scanResult) {
    console.error("❌ Could not parse scan results")
    process.exit(1)
  }

  // 5. Generate report
  const hasChanges =
    (scanResult.newLaws?.length > 0) ||
    (scanResult.statusChanges?.length > 0)

  const forceReport = process.env.FORCE_REPORT === "true"

  if (hasChanges || forceReport) {
    const report = generateReport(scanResult, currentLaws.length)
    writeFileSync(REPORT_PATH, report, "utf-8")
    console.log(`📄 Report written to ${REPORT_PATH}`)

    if (scanResult.newLaws?.length > 0) {
      console.log(`\n🆕 New laws found: ${scanResult.newLaws.length}`)
      for (const law of scanResult.newLaws) {
        console.log(`   - ${law.shortName} (${law.jurisdiction}) [${law.significance}]`)
      }
    }

    if (scanResult.statusChanges?.length > 0) {
      console.log(`\n🔄 Status changes: ${scanResult.statusChanges.length}`)
      for (const change of scanResult.statusChanges) {
        console.log(`   - ${change.lawId}: ${change.currentStatus} → ${change.newStatus}`)
      }
    }
  } else {
    console.log("✅ No changes detected. Registry is up to date.")
  }

  console.log("\n✅ Legislation scan complete.")
}

main().catch((error) => {
  console.error("Fatal error:", error)
  process.exit(1)
})
