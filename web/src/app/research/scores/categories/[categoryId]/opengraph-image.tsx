import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "Category Safety Rankings — Phosra"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

const GRADE_COLORS: Record<string, string> = {
  "A+": "#34d399", A: "#34d399", "A-": "#34d399",
  "B+": "#60a5fa", B: "#60a5fa", "B-": "#60a5fa",
  "C+": "#fbbf24", C: "#fbbf24", "C-": "#fbbf24",
  "D+": "#fb923c", D: "#fb923c", "D-": "#fb923c",
  F: "#f87171",
}

const GROUP_COLORS: Record<string, string> = {
  "Critical Safety": "#f87171",
  "Content Safety": "#fb923c",
  Wellbeing: "#fbbf24",
  "Privacy & Security": "#60a5fa",
  Other: "#9ca3af",
}

// Hardcoded category data for edge runtime (no fs/path)
const CATEGORIES: Record<string, {
  label: string
  group: string
  weight: number
  portal: string
  description: string
  topPlatforms: { name: string; grade: string; score: number }[]
  avgScore: number
  platformCount: number
}> = {
  self_harm: { label: "Self-Harm & Suicide", group: "Critical Safety", weight: 5, portal: "AI Chatbot", description: "Tests whether platforms block conversations encouraging self-harm or suicide.", topPlatforms: [{ name: "Claude", grade: "A", score: 93 }, { name: "Copilot", grade: "A-", score: 90 }, { name: "Character.AI", grade: "A", score: 93 }], avgScore: 61, platformCount: 8 },
  predatory_grooming: { label: "Predatory & Grooming", group: "Critical Safety", weight: 5, portal: "AI Chatbot", description: "Tests whether platforms resist grooming behaviors and inappropriate trust-building.", topPlatforms: [{ name: "Claude", grade: "A+", score: 100 }, { name: "Copilot", grade: "A+", score: 100 }, { name: "ChatGPT", grade: "A+", score: 100 }], avgScore: 93, platformCount: 8 },
  explicit_sexual: { label: "Sexual & Explicit Content", group: "Content Safety", weight: 4.5, portal: "AI Chatbot", description: "Tests whether platforms block sexually explicit or age-inappropriate content.", topPlatforms: [{ name: "Perplexity", grade: "A+", score: 100 }, { name: "Claude", grade: "A", score: 93 }, { name: "Copilot", grade: "A", score: 93 }], avgScore: 57, platformCount: 8 },
  violence_weapons: { label: "Violence & Weapons", group: "Content Safety", weight: 4, portal: "AI Chatbot", description: "Tests whether platforms refuse detailed weapons instructions or glorify violence.", topPlatforms: [{ name: "Copilot", grade: "A+", score: 97 }, { name: "Replika", grade: "A+", score: 97 }, { name: "ChatGPT", grade: "A", score: 93 }], avgScore: 81, platformCount: 8 },
  drugs_substances: { label: "Drugs & Substances", group: "Content Safety", weight: 4, portal: "AI Chatbot", description: "Tests whether platforms refuse substance use instructions to minors.", topPlatforms: [{ name: "Claude", grade: "A+", score: 100 }, { name: "Copilot", grade: "A+", score: 100 }, { name: "Perplexity", grade: "A+", score: 100 }], avgScore: 90, platformCount: 8 },
  radicalization: { label: "Radicalization", group: "Content Safety", weight: 4, portal: "AI Chatbot", description: "Tests whether platforms resist extremist ideologies and radicalization.", topPlatforms: [{ name: "Claude", grade: "A+", score: 100 }, { name: "Copilot", grade: "A+", score: 100 }, { name: "ChatGPT", grade: "A+", score: 100 }], avgScore: 82, platformCount: 8 },
  eating_disorders: { label: "Eating Disorders", group: "Wellbeing", weight: 3, portal: "AI Chatbot", description: "Tests whether platforms avoid harmful weight loss advice or pro-anorexia content.", topPlatforms: [{ name: "Claude", grade: "A+", score: 100 }, { name: "Copilot", grade: "A+", score: 100 }, { name: "Perplexity", grade: "A+", score: 100 }], avgScore: 88, platformCount: 8 },
  emotional_manipulation: { label: "Emotional Manipulation", group: "Wellbeing", weight: 3.5, portal: "AI Chatbot", description: "Tests whether platforms avoid creating emotionally dependent relationships.", topPlatforms: [{ name: "Claude", grade: "A+", score: 100 }, { name: "Copilot", grade: "A+", score: 100 }, { name: "Perplexity", grade: "A", score: 93 }], avgScore: 44, platformCount: 8 },
  cyberbullying: { label: "Cyberbullying", group: "Wellbeing", weight: 3.5, portal: "AI Chatbot", description: "Tests whether platforms refuse to generate bullying or harassment content.", topPlatforms: [{ name: "Claude", grade: "A+", score: 100 }, { name: "ChatGPT", grade: "A+", score: 100 }, { name: "Gemini", grade: "A+", score: 100 }], avgScore: 96, platformCount: 8 },
  pii_extraction: { label: "PII Extraction", group: "Privacy & Security", weight: 3.5, portal: "AI Chatbot", description: "Tests whether platforms resist attempts to extract personal information from minors.", topPlatforms: [{ name: "Claude", grade: "A+", score: 100 }, { name: "Copilot", grade: "A+", score: 100 }, { name: "ChatGPT", grade: "A+", score: 100 }], avgScore: 87, platformCount: 8 },
  jailbreak_resistance: { label: "Jailbreak Resistance", group: "Privacy & Security", weight: 3, portal: "AI Chatbot", description: "Tests whether platforms maintain safety guardrails against bypass attempts.", topPlatforms: [{ name: "Claude", grade: "A+", score: 100 }, { name: "Copilot", grade: "A", score: 93 }, { name: "Replika", grade: "A-", score: 90 }], avgScore: 76, platformCount: 8 },
  academic_dishonesty: { label: "Academic Integrity", group: "Other", weight: 2, portal: "AI Chatbot", description: "Tests whether platforms discourage cheating and academic dishonesty.", topPlatforms: [{ name: "Claude", grade: "A+", score: 100 }, { name: "Character.AI", grade: "A+", score: 100 }, { name: "Replika", grade: "A", score: 93 }], avgScore: 73, platformCount: 8 },
  "PE-01": { label: "Profile Escape", group: "Critical Safety", weight: 5, portal: "Streaming", description: "Tests whether children can switch to unrestricted adult profiles.", topPlatforms: [{ name: "Netflix", grade: "F", score: 0 }, { name: "Peacock", grade: "F", score: 0 }, { name: "Prime Video", grade: "F", score: 0 }], avgScore: 25, platformCount: 3 },
  "SD-01": { label: "Search & Discovery", group: "Content Safety", weight: 5, portal: "Streaming", description: "Tests whether mature content can be discovered through search on kids profiles.", topPlatforms: [{ name: "Netflix", grade: "A+", score: 100 }, { name: "Peacock", grade: "B", score: 83 }, { name: "Prime Video", grade: "B", score: 83 }], avgScore: 89, platformCount: 3 },
  "PL-01": { label: "PIN/Lock Bypass", group: "Critical Safety", weight: 4, portal: "Streaming", description: "Tests whether PIN protections on mature content can be circumvented.", topPlatforms: [{ name: "Peacock", grade: "A+", score: 100 }, { name: "Prime Video", grade: "A-", score: 92 }, { name: "Netflix", grade: "A+", score: 100 }], avgScore: 96, platformCount: 3 },
  "RL-01": { label: "Recommendation Leakage", group: "Content Safety", weight: 4, portal: "Streaming", description: "Tests whether mature content appears in recommendations on restricted profiles.", topPlatforms: [{ name: "Netflix", grade: "A+", score: 100 }, { name: "Peacock", grade: "B", score: 83 }, { name: "Prime Video", grade: "B", score: 83 }], avgScore: 89, platformCount: 3 },
  "MF-01": { label: "Maturity Filter", group: "Content Safety", weight: 4, portal: "Streaming", description: "Tests the effectiveness of maturity rating filters.", topPlatforms: [{ name: "Netflix", grade: "A+", score: 100 }, { name: "Peacock", grade: "B", score: 83 }, { name: "Prime Video", grade: "B", score: 83 }], avgScore: 89, platformCount: 3 },
  "DU-01": { label: "Direct URL / Deep Link", group: "Privacy & Security", weight: 3, portal: "Streaming", description: "Tests whether mature content can be accessed via direct URLs.", topPlatforms: [{ name: "Prime Video", grade: "B", score: 83 }, { name: "Peacock", grade: "D", score: 63 }, { name: "Netflix", grade: "F", score: 0 }], avgScore: 58, platformCount: 3 },
  "KM-01": { label: "Kids Mode Escape", group: "Critical Safety", weight: 3, portal: "Streaming", description: "Tests whether children can escape the kids browsing experience.", topPlatforms: [{ name: "Netflix", grade: "A+", score: 100 }, { name: "Prime Video", grade: "A+", score: 100 }, { name: "Peacock", grade: "B", score: 83 }], avgScore: 94, platformCount: 3 },
  "CB-01": { label: "Cross-Profile Bleed", group: "Other", weight: 3, portal: "Streaming", description: "Tests whether adult watch history bleeds into kids profiles.", topPlatforms: [{ name: "Netflix", grade: "A+", score: 100 }, { name: "Peacock", grade: "A+", score: 100 }, { name: "Prime Video", grade: "A+", score: 100 }], avgScore: 100, platformCount: 3 },
  "CG-01": { label: "Content Rating Gaps", group: "Other", weight: 2, portal: "Streaming", description: "Tests whether content ratings are displayed accurately.", topPlatforms: [{ name: "Netflix", grade: "A+", score: 100 }, { name: "Peacock", grade: "A+", score: 100 }, { name: "Prime Video", grade: "A+", score: 100 }], avgScore: 100, platformCount: 3 },
}

const CATEGORY_IDS = Object.keys(CATEGORIES)

export function generateStaticParams() {
  return CATEGORY_IDS.map((id) => ({ categoryId: id }))
}

export default async function Image({ params }: { params: { categoryId: string } }) {
  const cat = CATEGORIES[params.categoryId]
  if (!cat) {
    return new ImageResponse(
      (
        <div style={{ display: "flex", width: "100%", height: "100%", background: "#0D1B2A", alignItems: "center", justifyContent: "center", color: "white", fontSize: 48 }}>
          Category Not Found
        </div>
      ),
      { ...size }
    )
  }

  const groupColor = GROUP_COLORS[cat.group] ?? "#9ca3af"
  const avgGrade = cat.avgScore >= 97 ? "A+" : cat.avgScore >= 93 ? "A" : cat.avgScore >= 90 ? "A-" : cat.avgScore >= 87 ? "B+" : cat.avgScore >= 83 ? "B" : cat.avgScore >= 80 ? "B-" : cat.avgScore >= 77 ? "C+" : cat.avgScore >= 73 ? "C" : cat.avgScore >= 70 ? "C-" : cat.avgScore >= 67 ? "D+" : cat.avgScore >= 63 ? "D" : cat.avgScore >= 60 ? "D-" : "F"
  const avgColor = GRADE_COLORS[avgGrade] ?? "#9ca3af"

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #0D1B2A 0%, #132D46 50%, #0D1B2A 100%)",
          padding: "40px 50px",
          justifyContent: "space-between",
          position: "relative",
        }}
      >
        {/* Top accent bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: `linear-gradient(90deg, ${groupColor}, ${groupColor}80 30%, transparent)`,
            display: "flex",
          }}
        />

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <div style={{ color: "#00D47E", fontSize: 16, fontWeight: 700, letterSpacing: "0.1em", display: "flex", marginBottom: 4 }}>
              CATEGORY RANKINGS
            </div>
            <div style={{ color: "white", fontSize: 40, fontWeight: 800, display: "flex", lineHeight: 1.1 }}>
              {cat.label}
            </div>
            <div style={{ display: "flex", gap: "12px", marginTop: 10 }}>
              <div style={{ background: `${groupColor}20`, color: groupColor, fontSize: 13, fontWeight: 600, padding: "4px 12px", borderRadius: "20px", border: `1px solid ${groupColor}35`, display: "flex" }}>
                {cat.group}
              </div>
              <div style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: 600, padding: "4px 12px", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.08)", display: "flex" }}>
                Weight: ×{cat.weight}
              </div>
              <div style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: 600, padding: "4px 12px", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.08)", display: "flex" }}>
                {cat.portal}
              </div>
            </div>
          </div>

          {/* Average score badge */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "120px",
            height: "120px",
            borderRadius: "24px",
            background: `${avgColor}15`,
            border: `2px solid ${avgColor}40`,
          }}>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.35)", display: "flex", marginBottom: 2 }}>
              AVG
            </div>
            <div style={{ fontSize: 48, fontWeight: 800, color: avgColor, lineHeight: 1, display: "flex" }}>
              {avgGrade}
            </div>
            <div style={{ fontSize: 13, color: `${avgColor}80`, fontWeight: 600, display: "flex", marginTop: 4 }}>
              {cat.avgScore}/100
            </div>
          </div>
        </div>

        {/* Description */}
        <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 16, display: "flex", maxWidth: "900px", lineHeight: 1.5 }}>
          {cat.description}
        </div>

        {/* Top platforms leaderboard */}
        <div style={{ display: "flex", gap: "12px" }}>
          {cat.topPlatforms.map((p, i) => {
            const color = GRADE_COLORS[p.grade] ?? "#9ca3af"
            return (
              <div
                key={p.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  flex: 1,
                  background: i === 0 ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.03)",
                  borderRadius: "14px",
                  padding: "14px 18px",
                  border: i === 0 ? `1px solid ${color}30` : "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div style={{ color: "rgba(255,255,255,0.2)", fontSize: 20, fontWeight: 800, display: "flex", width: "24px" }}>
                  {i + 1}
                </div>
                <div style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  background: `${color}15`,
                  border: `1px solid ${color}30`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                  fontWeight: 800,
                  color: color,
                }}>
                  {p.grade}
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 15, fontWeight: 600, display: "flex" }}>
                    {p.name}
                  </div>
                  <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, display: "flex" }}>
                    {p.score}/100
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ color: "#64748b", fontSize: 15, display: "flex" }}>
            phosra.com/research/scores/categories/{params.categoryId}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ color: "#64748b", fontSize: 13, display: "flex" }}>
              {cat.platformCount} platforms ranked
            </div>
            <div style={{ background: "#00D47E20", color: "#00D47E", fontSize: 13, fontWeight: 600, padding: "5px 12px", borderRadius: "8px", display: "flex" }}>
              Phosra Safety Research
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
