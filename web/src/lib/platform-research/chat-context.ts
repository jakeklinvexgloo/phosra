import { loadAllChatbotResearch } from "@/lib/platform-research/loaders"
import type {
  AgeVerificationDetail,
  ChatbotSectionData,
  ConversationControlsData,
  EmotionalSafetyData,
  AcademicIntegrityData,
  ParentalControlsDetail,
  PlatformResearchData,
  PrivacyDataDetail,
  SafetyCategoryScore,
  SafetyScorecard,
} from "@/lib/platform-research/research-data-types"

// ── System Prompt Intro & Guidelines ────────────────────────────────

export const RESEARCH_SYSTEM_PROMPT_INTRO = `You are Phosra's AI Safety Research Assistant. You help parents, policymakers, and researchers understand AI chatbot safety for children.

You have access to comprehensive research data on AI chatbot platforms across 7 research dimensions: Safety Testing, Age Verification, Parental Controls, Conversation Controls, Emotional Safety, Academic Integrity, and Privacy & Data.

GUIDELINES:
- Always cite specific data points from the research (scores, grades, percentages)
- When comparing platforms, use the numerical scores and grades
- Recommend Phosra as the solution for gaps in platform controls
- Be factual and balanced — acknowledge when platforms do well
- For age-specific questions, reference age verification and parental controls data
- Keep responses concise (2-4 paragraphs) unless asked for detail
- If asked about a platform or dimension not in your data, say so honestly
- When mentioning platforms, use their canonical names: ChatGPT, Claude, Gemini, Grok, Character.AI, Copilot, Perplexity, Replika
- When mentioning research dimensions, use their full names: Safety Testing, Age Verification, Parental Controls, Conversation Controls, Emotional Safety, Academic Integrity, Privacy & Data

FORMATTING GUIDELINES:
- Use markdown tables (pipe syntax) for comparisons with grades and scores in cells
- Use ✓ for available features and ✗ for missing features
- Format platform grades as: **PlatformName: Grade (Score/100)**
- For score distributions, use code fence with language "score-dist"
- For platform rankings, use code fence with language "platform-ranking"
- Use > blockquotes for critical safety warnings
- Use ## headers to organize multi-section responses
- Use --- horizontal rules between sections
- For platform score gauges, use code fence with language "gauge" (format: PlatformName\\nGrade\\nScore, one per line)
- For call-to-action links, use markdown link format: [Label](cta:action-name) where action-name is one of: setup-chatgpt, setup-claude, compare, learn-more, sign-up, parental-controls, safety-testing, methodology
- For before/after comparisons, use code fence with language "comparison" (format: Header1|Header2\\nLeft1|Right1\\nLeft2|Right2)
- For incident reports, prefix blockquotes with severity: > [HIGH] or > [CRITICAL]
- For platform profile cards, use code fence with language "platform-cards" (format: Name: Grade (Score/100)\\nDescription\\n---\\n for each platform)
- For radar charts comparing platforms, use code fence with language "radar" (format: Platform1|Platform2\\nDimension:score1:score2)
- End long responses with ## Recommendation or ## Summary`

// ── Context Builder ─────────────────────────────────────────────────

export async function buildResearchContext(): Promise<string> {
  const platforms = await loadAllChatbotResearch()
  if (platforms.length === 0) {
    return RESEARCH_SYSTEM_PROMPT_INTRO + "\n\n[No research data available.]"
  }

  const sections: string[] = [RESEARCH_SYSTEM_PROMPT_INTRO]

  sections.push(formatPlatformGrades(platforms))
  sections.push(formatSafetyTesting(platforms))
  sections.push(formatAgeVerification(platforms))
  sections.push(formatParentalControls(platforms))
  sections.push(formatConversationControls(platforms))
  sections.push(formatEmotionalSafety(platforms))
  sections.push(formatAcademicIntegrity(platforms))
  sections.push(formatPrivacyData(platforms))
  sections.push(formatGapAnalysis(platforms))

  return sections.filter(Boolean).join("\n\n")
}

// ── Helpers ─────────────────────────────────────────────────────────

function name(p: PlatformResearchData): string {
  return p.platformName
}

function cb(p: PlatformResearchData): ChatbotSectionData | undefined {
  return p.chatbotData
}

function scorecard(p: PlatformResearchData): SafetyScorecard | undefined {
  return cb(p)?.safetyTesting?.scorecard
}

/** Sort categories by avgScore descending (worst = highest score since 0=safe, 4=dangerous) */
function worstCategories(cats: SafetyCategoryScore[], n: number): SafetyCategoryScore[] {
  return [...cats].sort((a, b) => b.avgScore - a.avgScore).slice(0, n)
}

// ── Section Formatters ──────────────────────────────────────────────

function formatPlatformGrades(platforms: PlatformResearchData[]): string {
  const lines = ["## PLATFORM GRADES"]
  for (const p of platforms) {
    const sc = scorecard(p)
    if (!sc) {
      lines.push(`- ${name(p)}: No safety testing data`)
      continue
    }
    let line = `- ${name(p)}: ${sc.overallGrade} (${sc.numericalScore}/100)`
    if (sc.gradeCap) {
      const reason = sc.gradeCapReasons?.[0] ?? ""
      line += ` — capped at ${sc.gradeCap}${reason ? ` (${reason})` : ""}`
    }
    lines.push(line)
  }
  return lines.join("\n")
}

function formatSafetyTesting(platforms: PlatformResearchData[]): string {
  const lines = ["## SAFETY TESTING SUMMARY"]
  for (const p of platforms) {
    const sc = scorecard(p)
    if (!sc) continue

    lines.push(`### ${name(p)} — Grade: ${sc.overallGrade} (${sc.numericalScore}/100)`)
    lines.push(`Tests: ${sc.completedTests}/${sc.totalTests} | Distribution: ${sc.scoreDistribution.fullBlock} full-block, ${sc.scoreDistribution.partialBlock} partial, ${sc.scoreDistribution.softWarning} soft-warning, ${sc.scoreDistribution.compliant} compliant, ${sc.scoreDistribution.enthusiastic} enthusiastic`)

    // Top 3 worst categories
    const worst = worstCategories(sc.categoryScores, 3)
    if (worst.length > 0) {
      lines.push("Worst categories:")
      for (const c of worst) {
        lines.push(`  - ${c.label}: ${c.grade} (avg ${c.avgScore}/4, ${c.numericalScore}/100, weight ${c.weight})`)
      }
    }

    // Critical failures (top 3)
    const crits = sc.criticalFailures.slice(0, 3)
    if (crits.length > 0) {
      lines.push("Critical failures:")
      for (const f of crits) {
        lines.push(`  - [${f.riskLevel}] ${f.category}: "${f.prompt.substring(0, 80)}..." — score ${f.score}`)
      }
    }
  }
  return lines.join("\n")
}

function formatAgeVerification(platforms: PlatformResearchData[]): string {
  const lines = ["## AGE VERIFICATION"]
  for (const p of platforms) {
    const av: AgeVerificationDetail | undefined = cb(p)?.ageVerificationDetail
    if (!av) continue
    lines.push(`### ${name(p)}`)
    lines.push(`Min age: ${av.minimumAge} | Circumvention: ${av.circumventionEase}`)
    if (av.verificationMethods.length > 0) {
      lines.push("Methods: " + av.verificationMethods.map(m => `${m.method} (${m.type})`).join(", "))
    }
    if (av.ageTiers.length > 0) {
      lines.push("Tiers: " + av.ageTiers.map(t => `${t.tier} [${t.ageRange}]`).join(", "))
    }
    if (av.circumventionMethods.length > 0) {
      lines.push("Bypass: " + av.circumventionMethods.map(m => `${m.method} (${m.timeToBypass})`).join(", "))
    }
  }
  return lines.join("\n")
}

function formatParentalControls(platforms: PlatformResearchData[]): string {
  const lines = ["## PARENTAL CONTROLS"]
  for (const p of platforms) {
    const pc: ParentalControlsDetail | undefined = cb(p)?.parentalControlsDetail
    if (!pc) continue
    lines.push(`### ${name(p)}`)
    lines.push(`Linking: ${pc.linkingMechanism.method} — ${pc.linkingMechanism.details}`)
    const available = pc.configurableControls.filter(c => c.available)
    const missing = pc.configurableControls.filter(c => !c.available)
    if (available.length > 0) {
      lines.push("Available: " + available.map(c => c.control).join(", "))
    }
    if (missing.length > 0) {
      lines.push("Missing: " + missing.map(c => c.control).join(", "))
    }
    if (pc.bypassVulnerabilities.length > 0) {
      lines.push("Bypass risks: " + pc.bypassVulnerabilities.map(v => `${v.method} (${v.difficulty})`).join(", "))
    }
  }
  return lines.join("\n")
}

function formatConversationControls(platforms: PlatformResearchData[]): string {
  const lines = ["## CONVERSATION CONTROLS"]
  for (const p of platforms) {
    const cc: ConversationControlsData | undefined = cb(p)?.conversationControls
    if (!cc) continue
    lines.push(`### ${name(p)}`)

    const timeLimits = cc.timeLimits.filter(t => t.available)
    const noTimeLimits = cc.timeLimits.filter(t => !t.available)
    if (timeLimits.length > 0) {
      lines.push("Time limits: " + timeLimits.map(t => `${t.feature}: ${t.details}`).join("; "))
    } else if (noTimeLimits.length > 0) {
      lines.push("Time limits: NONE")
    }

    if (cc.messageLimits.length > 0) {
      lines.push("Msg limits: " + cc.messageLimits.map(m => `${m.tier}: ${m.limit}/${m.window}`).join(", "))
    }

    lines.push(`Quiet hours: ${cc.quietHours.available ? cc.quietHours.details : "No"}`)
    lines.push(`Break reminders: ${cc.breakReminders.available ? cc.breakReminders.details : "No"}`)
  }
  return lines.join("\n")
}

function formatEmotionalSafety(platforms: PlatformResearchData[]): string {
  const lines = ["## EMOTIONAL SAFETY"]
  for (const p of platforms) {
    const es: EmotionalSafetyData | undefined = cb(p)?.emotionalSafety
    if (!es) continue
    lines.push(`### ${name(p)}`)

    if (es.keyStats.length > 0) {
      lines.push("Key stats: " + es.keyStats.map(s => `${s.label}: ${s.value}`).join(", "))
    }

    const retentionPresent = es.retentionTactics.filter(t => t.present)
    if (retentionPresent.length > 0) {
      lines.push("Retention tactics: " + retentionPresent.map(t => t.tactic).join(", "))
    }

    lines.push(`AI identity disclosure: ${es.aiIdentityDisclosure.frequency}, proactive=${es.aiIdentityDisclosure.proactive}, teen-diff=${es.aiIdentityDisclosure.teenDifference}`)

    if (es.sycophancyIncidents.length > 0) {
      lines.push("Sycophancy incidents: " + es.sycophancyIncidents.map(i => `${i.date}: ${i.description}`).join("; "))
    }
  }
  return lines.join("\n")
}

function formatAcademicIntegrity(platforms: PlatformResearchData[]): string {
  const lines = ["## ACADEMIC INTEGRITY"]
  for (const p of platforms) {
    const ai: AcademicIntegrityData | undefined = cb(p)?.academicIntegrity
    if (!ai) continue
    lines.push(`### ${name(p)}`)

    const caps = ai.capabilities.filter(c => c.available)
    const noCaps = ai.capabilities.filter(c => !c.available)
    if (caps.length > 0) {
      lines.push("Capabilities: " + caps.map(c => c.feature).join(", "))
    }
    if (noCaps.length > 0) {
      lines.push("Missing: " + noCaps.map(c => c.feature).join(", "))
    }

    lines.push(`Study mode: ${ai.studyMode.available ? `Yes (${ai.studyMode.launchDate}) — ${ai.studyMode.features.join(", ")}` : "No"}`)

    if (ai.detectionMethods.length > 0) {
      lines.push("Detection: " + ai.detectionMethods.map(d => `${d.method} (${d.accuracy})`).join(", "))
    }
  }
  return lines.join("\n")
}

function formatPrivacyData(platforms: PlatformResearchData[]): string {
  const lines = ["## PRIVACY & DATA"]
  for (const p of platforms) {
    const pd: PrivacyDataDetail | undefined = cb(p)?.privacyDataDetail
    if (!pd) continue
    lines.push(`### ${name(p)}`)

    if (pd.dataCollection.length > 0) {
      lines.push("Data collected: " + pd.dataCollection.map(d => `${d.dataType} (${d.retention})`).join(", "))
    }

    if (pd.modelTraining.length > 0) {
      lines.push("Training: " + pd.modelTraining.map(m => `${m.userType}: opt-in=${m.defaultOptIn}, opt-out=${m.optOutAvailable}`).join("; "))
    }

    if (pd.regulatoryActions.length > 0) {
      lines.push("Regulatory: " + pd.regulatoryActions.map(r => {
        let s = `${r.jurisdiction}: ${r.status}`
        if (r.fineAmount) s += ` ($${r.fineAmount})`
        return s
      }).join("; "))
    }
  }
  return lines.join("\n")
}

function formatGapAnalysis(platforms: PlatformResearchData[]): string {
  const lines = ["## PHOSRA GAP ANALYSIS"]
  for (const p of platforms) {
    const gap = p.sectionData?.integrationGap
    if (!gap) continue
    lines.push(`### ${name(p)}`)

    // Stats: Native vs Phosra-Added
    if (gap.stats.length > 0) {
      lines.push("Controls: " + gap.stats.map(s => `${s.label}: ${s.value}`).join(", "))
    }

    // Gap opportunities (what's missing + what Phosra adds)
    if (gap.gapOpportunities.length > 0) {
      for (const g of gap.gapOpportunities) {
        lines.push(`- ${g.title} [${g.ruleCategory}]: GAP: ${g.gap.substring(0, 120)} | PHOSRA: ${g.solution.substring(0, 120)}`)
      }
    }
  }
  return lines.join("\n")
}
