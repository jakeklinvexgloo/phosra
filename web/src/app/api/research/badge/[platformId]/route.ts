import { NextRequest, NextResponse } from "next/server"
import { loadPlatformResearch } from "@/lib/platform-research/loaders"
import { loadStreamingPlatform } from "@/lib/streaming-research/loaders"
import type { StreamingPlatformId } from "@/lib/streaming-research/streaming-data-types"
import { gradeHexColor } from "@/lib/shared/grade-colors"

export const revalidate = 3600

const STREAMING_IDS = new Set(["netflix", "peacock", "prime_video"])

const PLATFORM_NAMES: Record<string, string> = {
  chatgpt: "ChatGPT",
  claude: "Claude",
  gemini: "Gemini",
  grok: "Grok",
  character_ai: "Character.AI",
  copilot: "Copilot",
  perplexity: "Perplexity",
  replika: "Replika",
  netflix: "Netflix",
  peacock: "Peacock",
  prime_video: "Prime Video",
}

interface PlatformGradeInfo {
  name: string
  grade: string
  score: number
  tests: number
}

async function getPlatformGrade(platformId: string): Promise<PlatformGradeInfo | null> {
  if (STREAMING_IDS.has(platformId)) {
    try {
      const data = await loadStreamingPlatform(platformId as StreamingPlatformId)
      return {
        name: data.platformName,
        grade: data.overallGrade,
        score: data.overallScore,
        tests: data.profiles.reduce((sum, p) => sum + p.tests.length, 0),
      }
    } catch {
      return null
    }
  }

  const data = await loadPlatformResearch(platformId)
  const scorecard = data?.chatbotData?.safetyTesting?.scorecard
  if (!scorecard) return null

  return {
    name: data.platformName,
    grade: scorecard.overallGrade,
    score: scorecard.numericalScore,
    tests: scorecard.completedTests,
  }
}

function generateBadgeSvg(
  grade: string,
  score: number,
  style: string,
  label: string,
): string {
  const gradeColor = gradeHexColor(grade)
  const labelText = label
  const gradeText = `${grade} · ${score}`

  // Measure text widths (approximate: 6.5px per char for label, 7.5px for grade)
  const labelWidth = Math.max(labelText.length * 7 + 20, 80)
  const gradeWidth = Math.max(gradeText.length * 7.5 + 20, 60)
  const totalWidth = labelWidth + gradeWidth

  if (style === "flat-square") {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="22" role="img" aria-label="${labelText}: ${grade}">
  <title>${labelText}: ${grade} (${score}/100)</title>
  <g shape-rendering="crispEdges">
    <rect width="${labelWidth}" height="22" fill="#1e293b"/>
    <rect x="${labelWidth}" width="${gradeWidth}" height="22" fill="${gradeColor}"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" text-rendering="geometricPrecision" font-size="11">
    <text x="${labelWidth / 2}" y="15">${escapeXml(labelText)}</text>
    <text x="${labelWidth + gradeWidth / 2}" y="15" font-weight="bold">${escapeXml(gradeText)}</text>
  </g>
</svg>`
  }

  if (style === "plastic") {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="20" role="img" aria-label="${labelText}: ${grade}">
  <title>${labelText}: ${grade} (${score}/100)</title>
  <linearGradient id="a" x2="0" y2="100%">
    <stop offset="0" stop-opacity=".1" stop-color="#fff"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <clipPath id="r"><rect width="${totalWidth}" height="20" rx="4" fill="#fff"/></clipPath>
  <g clip-path="url(#r)">
    <rect width="${labelWidth}" height="20" fill="#1e293b"/>
    <rect x="${labelWidth}" width="${gradeWidth}" height="20" fill="${gradeColor}"/>
    <rect width="${totalWidth}" height="20" fill="url(#a)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" text-rendering="geometricPrecision" font-size="11">
    <text x="${labelWidth / 2}" y="14">${escapeXml(labelText)}</text>
    <text x="${labelWidth + gradeWidth / 2}" y="14" font-weight="bold">${escapeXml(gradeText)}</text>
  </g>
</svg>`
  }

  // Default: flat style (with rounded corners and subtle gradient)
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="20" role="img" aria-label="${labelText}: ${grade}">
  <title>${labelText}: ${grade} (${score}/100)</title>
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <clipPath id="r"><rect width="${totalWidth}" height="20" rx="3" fill="#fff"/></clipPath>
  <g clip-path="url(#r)">
    <rect width="${labelWidth}" height="20" fill="#0f172a"/>
    <rect x="${labelWidth}" width="${gradeWidth}" height="20" fill="${gradeColor}"/>
    <rect width="${totalWidth}" height="20" fill="url(#s)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" text-rendering="geometricPrecision" font-size="11">
    <text aria-hidden="true" x="${labelWidth / 2 + 1}" y="15" fill="#010101" fill-opacity=".3">${escapeXml(labelText)}</text>
    <text x="${labelWidth / 2}" y="14">${escapeXml(labelText)}</text>
    <text aria-hidden="true" x="${labelWidth + gradeWidth / 2 + 1}" y="15" fill="#010101" fill-opacity=".3">${escapeXml(gradeText)}</text>
    <text x="${labelWidth + gradeWidth / 2}" y="14" font-weight="bold">${escapeXml(gradeText)}</text>
  </g>
</svg>`
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ platformId: string }> }
) {
  const { platformId } = await params
  const info = await getPlatformGrade(platformId)

  if (!info) {
    return new NextResponse(
      generateBadgeSvg("?", 0, "flat", "Phosra Safety"),
      {
        status: 404,
        headers: {
          "Content-Type": "image/svg+xml",
          "Cache-Control": "public, max-age=60",
        },
      }
    )
  }

  const url = new URL(req.url)
  const style = url.searchParams.get("style") ?? "flat"
  const label = url.searchParams.get("label") ?? "Phosra Safety"

  const svg = generateBadgeSvg(
    info.grade,
    Math.round(info.score * 10) / 10,
    style,
    label,
  )

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
      "Access-Control-Allow-Origin": "*",
    },
  })
}
