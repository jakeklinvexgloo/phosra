import { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, ArrowRight, Code, ExternalLink } from "lucide-react"

export const metadata: Metadata = {
  title: "Scorecard API — Platform Safety Scorecard — Phosra",
  description:
    "Free public API for Phosra Safety Scorecard data. Access platform grades, category scores, safety badges, CSV exports, and RSS feeds programmatically.",
}

interface Endpoint {
  method: string
  path: string
  description: string
  example: string
  params?: { name: string; type: string; description: string }[]
  response: string
}

const ENDPOINTS: Endpoint[] = [
  {
    method: "GET",
    path: "/api/research/scores",
    description: "All platform scores with grades, regulatory exposure, and compliance gaps.",
    example: "https://www.phosra.com/api/research/scores",
    response: `{
  "meta": { "totalPlatforms": 11, "totalTests": 437, "testCategories": 21 },
  "platforms": [
    {
      "rank": 1, "platformId": "gemini", "platformName": "Gemini",
      "category": "ai_chatbot", "overallGrade": "A", "numericalScore": 94.3,
      "categoryScores": [...], "regulatory": {...}, "complianceGap": {...}
    }, ...
  ],
  "regulatoryLandscape": {...}
}`,
  },
  {
    method: "GET",
    path: "/api/research/scores/platforms/:platformId",
    description: "Detailed report card for a single platform.",
    example: "https://www.phosra.com/api/research/scores/platforms/chatgpt",
    params: [
      { name: "platformId", type: "string", description: "chatgpt, claude, gemini, grok, character_ai, copilot, perplexity, replika, netflix, prime_video, peacock" },
    ],
    response: `{
  "platformId": "chatgpt", "platformName": "ChatGPT",
  "category": "ai_chatbot", "overallGrade": "B+", "numericalScore": 87.3,
  "rank": 3, "totalPlatforms": 11,
  "categoryScores": [
    { "categoryId": "self_harm", "label": "Self-Harm & Suicide", "grade": "A-", "score": 93.7, "weight": 5 }, ...
  ],
  "regulatory": { "exposureLevel": "Very High", "applicableLawCount": 14, ... },
  "complianceGap": { "coveragePercent": 85.7, "totalGaps": 3, ... }
}`,
  },
  {
    method: "GET",
    path: "/api/research/scores/categories",
    description: "All 21 test categories with average scores and platform counts.",
    example: "https://www.phosra.com/api/research/scores/categories",
    response: `{
  "meta": { "totalCategories": 21, "aiChatbotCategories": 12, "streamingCategories": 9 },
  "categories": [
    {
      "categoryId": "self_harm", "label": "Self-Harm & Suicide",
      "group": "Critical Safety", "portal": "ai_chatbot", "weight": 5,
      "averageScore": 60.9, "averageGrade": "D-",
      "highestScore": 93.7, "lowestScore": 18.4, "platformCount": 8
    }, ...
  ]
}`,
  },
  {
    method: "GET",
    path: "/api/research/scores/categories/:categoryId",
    description: "Category leaderboard showing how all platforms rank in a specific test area.",
    example: "https://www.phosra.com/api/research/scores/categories/self_harm",
    params: [
      { name: "categoryId", type: "string", description: "AI: self_harm, predatory_grooming, explicit_sexual, violence_weapons, drugs_substances, radicalization, eating_disorders, emotional_manipulation, cyberbullying, pii_extraction, jailbreak_resistance, academic_dishonesty. Streaming: PE-01, SD-01, PL-01, RL-01, MF-01, DU-01, KM-01, CB-01, CG-01" },
    ],
    response: `{
  "categoryId": "self_harm", "label": "Self-Harm & Suicide",
  "group": "Critical Safety", "weight": 5,
  "averageScore": 60.9, "averageGrade": "D-", "platformCount": 8,
  "platforms": [
    { "rank": 1, "platformId": "gemini", "platformName": "Gemini", "grade": "A-", "score": 93.7 }, ...
  ]
}`,
  },
  {
    method: "GET",
    path: "/api/research/badge/:platformId",
    description: "Dynamic SVG safety badge for embedding. Supports multiple styles.",
    example: "https://www.phosra.com/api/research/badge/chatgpt?style=flat",
    params: [
      { name: "platformId", type: "string", description: "Any valid platform ID" },
      { name: "style", type: "query", description: "flat (default), flat-square, or plastic" },
      { name: "label", type: "query", description: "Custom label text (default: 'Phosra Safety')" },
    ],
    response: "SVG image (image/svg+xml). CORS enabled for embedding.",
  },
  {
    method: "GET",
    path: "/api/research/scores/csv",
    description: "Download all scorecard data as a CSV file.",
    example: "https://www.phosra.com/api/research/scores/csv",
    response: "CSV file download with platform grades, scores, and category breakdowns.",
  },
  {
    method: "GET",
    path: "/research/scores/feed.xml",
    description: "RSS 2.0 feed with all platform report cards. Auto-discovery enabled.",
    example: "https://www.phosra.com/research/scores/feed.xml",
    response: "RSS 2.0 XML feed with Atom namespace.",
  },
]

export default function ScorecardApiPage() {
  return (
    <div className="min-h-screen bg-[#0D1B2A] text-white">
      <div className="max-w-5xl mx-auto px-4 pt-8 pb-16">
        <Link
          href="/research/scores"
          className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/60 transition mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Scorecard
        </Link>

        <div className="flex items-start gap-3 mb-8">
          <Code className="w-6 h-6 text-[#00D47E] flex-shrink-0 mt-1" />
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#00D47E]/60 block mb-1">
              Platform Safety Scorecard
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Scorecard API</h1>
            <p className="text-sm text-white/50 max-w-2xl">
              Free, public REST API for accessing Phosra Safety Scorecard data.
              All endpoints return JSON (unless noted) with 1-hour ISR caching.
              No authentication required.
            </p>
          </div>
        </div>

        {/* Quick start */}
        <div className="mb-10 p-5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <h2 className="text-sm font-bold uppercase tracking-wider text-white/40 mb-3">Quick Start</h2>
          <div className="font-mono text-sm bg-black/30 rounded-lg p-4 overflow-x-auto">
            <div className="text-white/40"># Get all platform scores</div>
            <div className="text-[#00D47E]">curl https://www.phosra.com/api/research/scores</div>
            <div className="text-white/40 mt-3"># Embed a safety badge</div>
            <div className="text-[#00D47E]">{'<img src="https://www.phosra.com/api/research/badge/chatgpt" alt="Safety Badge" />'}</div>
          </div>
        </div>

        {/* Endpoints */}
        <div className="space-y-6">
          {ENDPOINTS.map((ep, i) => (
            <div key={i} className="rounded-xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
              {/* Header */}
              <div className="flex items-center gap-3 px-5 py-3 border-b border-white/[0.06] bg-white/[0.02]">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/25 text-emerald-400">
                  {ep.method}
                </span>
                <code className="text-sm font-mono text-white/80">{ep.path}</code>
              </div>

              <div className="p-5">
                <p className="text-sm text-white/60 mb-4">{ep.description}</p>

                {/* Parameters */}
                {ep.params && ep.params.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white/30 mb-2">Parameters</h3>
                    <div className="space-y-1.5">
                      {ep.params.map((p) => (
                        <div key={p.name} className="flex items-start gap-3 text-sm">
                          <code className="text-xs font-mono px-1.5 py-0.5 rounded bg-white/5 text-amber-400 flex-shrink-0">
                            {p.name}
                          </code>
                          <span className="text-[10px] text-white/20 uppercase mt-0.5 flex-shrink-0">{p.type}</span>
                          <span className="text-white/40 text-xs">{p.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Example */}
                <div className="mb-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white/30 mb-2">Try it</h3>
                  <a
                    href={ep.example}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-[#00D47E]/70 hover:text-[#00D47E] transition font-mono"
                  >
                    {ep.example} <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {/* Response preview */}
                {ep.response.startsWith("{") ? (
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white/30 mb-2">Response</h3>
                    <pre className="text-xs font-mono bg-black/30 rounded-lg p-4 overflow-x-auto text-white/50 whitespace-pre-wrap">
                      {ep.response}
                    </pre>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white/30 mb-2">Response</h3>
                    <p className="text-xs text-white/40">{ep.response}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Badge examples */}
        <div className="mt-10 p-5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <h2 className="text-sm font-bold uppercase tracking-wider text-white/40 mb-4">Badge Embed Examples</h2>
          <div className="space-y-4">
            <div>
              <div className="text-xs text-white/30 mb-2">Markdown</div>
              <code className="text-xs font-mono text-[#00D47E]/70 bg-black/30 p-3 rounded-lg block overflow-x-auto">
                {'[![Phosra Safety](https://www.phosra.com/api/research/badge/chatgpt)](https://www.phosra.com/research/scores/platforms/chatgpt)'}
              </code>
            </div>
            <div>
              <div className="text-xs text-white/30 mb-2">HTML</div>
              <code className="text-xs font-mono text-[#00D47E]/70 bg-black/30 p-3 rounded-lg block overflow-x-auto">
                {'<a href="https://www.phosra.com/research/scores/platforms/chatgpt"><img src="https://www.phosra.com/api/research/badge/chatgpt" alt="Phosra Safety Badge" /></a>'}
              </code>
            </div>
          </div>
        </div>

        {/* Rate limits */}
        <div className="mt-6 p-5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <h2 className="text-sm font-bold uppercase tracking-wider text-white/40 mb-3">Usage Notes</h2>
          <ul className="space-y-2 text-sm text-white/50">
            <li>All JSON endpoints are cached for 1 hour (ISR). Badge SVGs are cached for 1 hour.</li>
            <li>No authentication required. CORS is enabled on badge endpoints for client-side embedding.</li>
            <li>Data is updated when new testing rounds are published. Check the RSS feed for updates.</li>
            <li>Attribution: Link back to <code className="text-xs font-mono text-[#00D47E]/70">phosra.com/research/scores</code> when displaying data.</li>
          </ul>
        </div>

        {/* Bottom navigation */}
        <div className="flex flex-wrap justify-center gap-3 mt-10">
          <Link
            href="/research/scores"
            className="px-4 py-2 rounded-lg text-sm font-medium bg-[#00D47E]/10 border border-[#00D47E]/20 text-[#00D47E] hover:bg-[#00D47E]/20 transition inline-flex items-center gap-2"
          >
            View Scorecard <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/research/scores/methodology"
            className="px-4 py-2 rounded-lg text-sm font-medium bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 transition inline-flex items-center gap-2"
          >
            Methodology <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/developers/playground"
            className="px-4 py-2 rounded-lg text-sm font-medium bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 transition inline-flex items-center gap-2"
          >
            API Playground <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
