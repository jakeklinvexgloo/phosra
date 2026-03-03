import { Metadata } from "next"
import Link from "next/link"
import { Shield, Zap, ArrowRight, ArrowLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "Safety Test Categories — Platform Scorecard — Phosra",
  description: "Explore 21 safety test categories across AI chatbots and streaming platforms. See how platforms rank in each specific area of child safety.",
}

interface CategoryDef {
  id: string
  label: string
  portal: "ai_chatbot" | "streaming"
  weight: number
  group: string
}

const CATEGORIES: CategoryDef[] = [
  { id: "self_harm", label: "Self-Harm & Suicide", portal: "ai_chatbot", weight: 5, group: "Critical Safety" },
  { id: "predatory_grooming", label: "Predatory & Grooming Patterns", portal: "ai_chatbot", weight: 5, group: "Critical Safety" },
  { id: "PE-01", label: "Profile Escape", portal: "streaming", weight: 5, group: "Critical Safety" },
  { id: "PL-01", label: "PIN/Lock Bypass", portal: "streaming", weight: 4, group: "Critical Safety" },
  { id: "KM-01", label: "Kids Mode Escape", portal: "streaming", weight: 3, group: "Critical Safety" },
  { id: "explicit_sexual", label: "Sexual & Explicit Content", portal: "ai_chatbot", weight: 4.5, group: "Content Safety" },
  { id: "violence_weapons", label: "Violence & Weapons", portal: "ai_chatbot", weight: 4, group: "Content Safety" },
  { id: "drugs_substances", label: "Drugs & Substance Use", portal: "ai_chatbot", weight: 4, group: "Content Safety" },
  { id: "radicalization", label: "Radicalization & Extremism", portal: "ai_chatbot", weight: 4, group: "Content Safety" },
  { id: "SD-01", label: "Search & Discovery", portal: "streaming", weight: 5, group: "Content Safety" },
  { id: "RL-01", label: "Recommendation Leakage", portal: "streaming", weight: 4, group: "Content Safety" },
  { id: "MF-01", label: "Maturity Filter Effectiveness", portal: "streaming", weight: 4, group: "Content Safety" },
  { id: "eating_disorders", label: "Eating Disorders & Body Image", portal: "ai_chatbot", weight: 3, group: "Wellbeing" },
  { id: "emotional_manipulation", label: "Emotional Manipulation & Parasocial", portal: "ai_chatbot", weight: 3.5, group: "Wellbeing" },
  { id: "cyberbullying", label: "Cyberbullying & Harassment", portal: "ai_chatbot", weight: 3.5, group: "Wellbeing" },
  { id: "pii_extraction", label: "Personal Information Extraction", portal: "ai_chatbot", weight: 3.5, group: "Privacy & Security" },
  { id: "jailbreak_resistance", label: "Jailbreak & Safety Bypass", portal: "ai_chatbot", weight: 3, group: "Privacy & Security" },
  { id: "DU-01", label: "Direct URL / Deep Link", portal: "streaming", weight: 3, group: "Privacy & Security" },
  { id: "academic_dishonesty", label: "Academic Integrity", portal: "ai_chatbot", weight: 2, group: "Other" },
  { id: "CB-01", label: "Cross-Profile Bleed", portal: "streaming", weight: 3, group: "Other" },
  { id: "CG-01", label: "Content Rating Gaps", portal: "streaming", weight: 2, group: "Other" },
]

function weightColor(w: number) {
  if (w >= 5) return "text-red-400"
  if (w >= 4) return "text-orange-400"
  if (w >= 3) return "text-amber-400"
  return "text-emerald-400"
}

export default function CategoriesIndexPage() {
  const grouped = CATEGORIES.reduce<Record<string, CategoryDef[]>>((acc, c) => {
    if (!acc[c.group]) acc[c.group] = []
    acc[c.group].push(c)
    return acc
  }, {})

  const groupOrder = ["Critical Safety", "Content Safety", "Wellbeing", "Privacy & Security", "Other"]

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
          <Shield className="w-6 h-6 text-[#00D47E] flex-shrink-0 mt-1" />
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#00D47E]/60 block mb-1">
              Platform Safety Scorecard
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Safety Test Categories</h1>
            <p className="text-sm text-white/50 max-w-2xl">
              21 test categories across AI chatbots (12) and streaming platforms (9).
              Each category has its own leaderboard showing how all tested platforms rank.
            </p>
          </div>
        </div>

        <div className="space-y-8">
          {groupOrder.map((groupName) => {
            const cats = grouped[groupName]
            if (!cats || cats.length === 0) return null
            return (
              <div key={groupName}>
                <h2 className="text-sm font-bold uppercase tracking-wider text-white/40 mb-3 flex items-center gap-2">
                  {groupName === "Critical Safety" && <Zap className="w-4 h-4 text-red-400" />}
                  {groupName}
                  <span className="text-white/20 font-normal">({cats.length})</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {cats.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/research/scores/categories/${cat.id}`}
                      className="group flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-[#00D47E]/30 hover:bg-white/[0.05] transition-all"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-white/80 group-hover:text-white transition truncate">
                            {cat.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${cat.portal === "ai_chatbot" ? "bg-violet-500/15 border-violet-500/25 text-violet-300" : "bg-sky-500/15 border-sky-500/25 text-sky-300"}`}>
                            {cat.portal === "ai_chatbot" ? "AI Chatbot" : "Streaming"}
                          </span>
                          <span className={`text-[10px] font-bold ${weightColor(cat.weight)}`}>
                            ×{cat.weight} weight
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-white/15 group-hover:text-[#00D47E] flex-shrink-0 transition" />
                    </Link>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/research/scores"
            className="px-4 py-2 rounded-lg text-sm font-medium bg-[#00D47E]/10 border border-[#00D47E]/20 text-[#00D47E] hover:bg-[#00D47E]/20 transition inline-flex items-center gap-2"
          >
            View Full Scorecard <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
