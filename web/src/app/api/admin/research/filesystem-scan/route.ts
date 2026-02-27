import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import { requireAdmin } from "@/lib/stytch-auth"

export const runtime = "nodejs"

const RESEARCH_PATHS = [
  path.resolve(process.cwd(), "../research/providers/tier1_adapter_exists"),
  path.resolve(process.cwd(), "../research/providers/ai_chatbot/tier1_highest_priority"),
  path.resolve(process.cwd(), "../research/providers/ai_chatbot/tier2_major"),
]

/** Scan filesystem for platforms that have research data on disk */
export async function GET() {
  const auth = await requireAdmin()
  if (!auth.authorized)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const researched: { platformId: string; hasFindings: boolean; hasSafety: boolean; hasChatbotData: boolean }[] = []
  const seen = new Set<string>()

  for (const basePath of RESEARCH_PATHS) {
    if (!fs.existsSync(basePath)) continue
    const dirs = fs.readdirSync(basePath, { withFileTypes: true }).filter(d => d.isDirectory())

    for (const dir of dirs) {
      if (seen.has(dir.name)) continue
      const platformDir = path.join(basePath, dir.name)
      const hasFindings = fs.existsSync(path.join(platformDir, "findings.md"))
      const hasSafety = fs.existsSync(path.join(platformDir, "safety_test_results.json"))
      const hasChatbotData = fs.existsSync(path.join(platformDir, "chatbot_section_data.json"))

      if (hasFindings || hasSafety || hasChatbotData) {
        seen.add(dir.name)
        researched.push({ platformId: dir.name, hasFindings, hasSafety, hasChatbotData })
      }
    }
  }

  return NextResponse.json(researched)
}
