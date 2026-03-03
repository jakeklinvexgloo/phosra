import { loadAllChatbotResearch } from "@/lib/platform-research/loaders"
import { loadAllStreamingPlatforms } from "@/lib/streaming-research/loaders"

export const revalidate = 86400 // 24 hours

const SITE = "https://www.phosra.com"

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

export async function GET() {
  const [chatbotPlatforms, streamingPlatforms] = await Promise.all([
    loadAllChatbotResearch(),
    loadAllStreamingPlatforms(),
  ])

  interface FeedItem {
    title: string
    link: string
    description: string
    category: string
    guid: string
    pubDate: string
  }

  const items: FeedItem[] = []
  const now = new Date().toUTCString()

  // Platform report cards
  for (const p of chatbotPlatforms) {
    const sc = p.chatbotData?.safetyTesting?.scorecard
    if (!sc) continue
    items.push({
      title: `${p.platformName} Safety Report Card — ${sc.overallGrade} (${sc.numericalScore}/100)`,
      link: `${SITE}/research/scores/platforms/${p.platformId}`,
      description: `${p.platformName} scored ${sc.overallGrade} (${sc.numericalScore}/100) in the Phosra Safety Scorecard. ${sc.completedTests} tests across 12 categories. ${sc.criticalFailures?.length ?? 0} critical failures.`,
      category: "AI Chatbot",
      guid: `phosra-scorecard-${p.platformId}-v1`,
      pubDate: now,
    })
  }

  for (const p of streamingPlatforms) {
    items.push({
      title: `${p.platformName} Safety Report Card — ${p.overallGrade} (${p.overallScore}/100)`,
      link: `${SITE}/research/scores/platforms/${p.platformId}`,
      description: `${p.platformName} scored ${p.overallGrade} (${p.overallScore}/100) in the Phosra Safety Scorecard. Tested across ${p.profiles.length} profile types and 9 streaming safety categories.`,
      category: "Streaming",
      guid: `phosra-scorecard-${p.platformId}-v1`,
      pubDate: now,
    })
  }

  // Sort by title for stable ordering
  items.sort((a, b) => a.title.localeCompare(b.title))

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Phosra Safety Scorecard</title>
    <link>${SITE}/research/scores</link>
    <description>Independent child safety grades for AI chatbots and streaming platforms. ${items.length} platforms tested across 21 categories.</description>
    <language>en-us</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${SITE}/research/scores/feed.xml" rel="self" type="application/rss+xml" />
    <image>
      <url>${SITE}/favicon-32x32.png</url>
      <title>Phosra Safety Scorecard</title>
      <link>${SITE}/research/scores</link>
    </image>
${items.map((item) => `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${item.link}</link>
      <description>${escapeXml(item.description)}</description>
      <category>${escapeXml(item.category)}</category>
      <guid isPermaLink="false">${item.guid}</guid>
      <pubDate>${item.pubDate}</pubDate>
    </item>`).join("\n")}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  })
}
