// ── Platform Research Data Types ──────────────────────────────────
// Types for loaded research data from the filesystem research directories.

export interface PlatformResearchData {
  platformId: string
  platformName: string
  findings: string | null
  adapterAssessment: string | null
  integrationNotes: string | null
  ratingMapping: RatingMappingData | null
  screenshots: ScreenshotGroup[]
  screenshotCount: number
  capabilities: CapabilitySummary
  sectionData: SectionData | null
  screenshotAnalysis: ScreenshotAnalysisData | null
  chatbotData?: ChatbotSectionData
}

export interface ScreenshotGroup {
  id: string
  label: string
  screenshots: { filename: string; label: string; path: string }[]
}

export interface RatingMappingData {
  platformTiers: Record<
    string,
    {
      phosraTier: string
      mpaaRatings: string[]
      tvRatings: string[]
      ageRange: string
      isKidsProfile: boolean
    }
  >
  ratingSystems: Record<
    string,
    {
      supported: boolean | string
      ratings?: string[]
      notes: string
    }
  >
}

export interface CapabilitySummary {
  fullyEnforceable: CapabilityEntry[]
  partiallyEnforceable: CapabilityEntry[]
  notApplicable: CapabilityEntry[]
}

export interface CapabilityEntry {
  ruleCategory: string
  label: string
  platformFeature: string
  enforcementMethod: string
  confidence: number
  gap?: string
  workaround?: string
}

// ── Section Data Types ───────────────────────────────────────────
// Data-driven section content loaded from section_data.json per platform.

export interface SectionData {
  profileStructure: ProfileStructureData
  technicalRecon: TechnicalReconData
  riskAssessment: RiskAssessmentData
  integrationGap: IntegrationGapData
  enforcementFlow: EnforcementFlowData
  adapterRoadmap: AdapterRoadmapData
}

export interface ProfileStructureData {
  accountLabel: string
  accountDescription: string
  accountMeta: string
  accountBorderColor: string
  accountLabelColor: string
  hierarchyDescription: string
  profiles: { name: string; maturity: string; type: "standard" | "kids"; pinEnabled: boolean }[]
  settings: { setting: string; configurable: boolean }[]
  subscriptionTiers: { plan: string; streams: string; resolution: string }[]
}

export interface TechnicalReconData {
  subtitle: string
  apiArchitecture: {
    title: string
    description: string
    codeExample: {
      comment: string
      method: string
      endpoint: string
      exampleComment: string
      exampleCode: string
    }
  }
  endpoints: { endpoint: string; purpose: string; auth: string }[]
  authDetails: { label: string; value: string; description: string }[]
  rateLimitNotes: string[]
  harCaptureCount?: string
}

export interface RiskAssessmentData {
  tosWarning: { title: string; description: string }
  overallRisk: { level: "Low" | "Medium" | "High"; description: string }
  detectionVectors: { vector: string; risk: "Low" | "Medium" | "High"; mitigation: string }[]
  mitigationsChecklist: string[]
}

export interface IntegrationGapData {
  platformName: string
  stats: { label: string; value: number; color: string }[]
  gapOpportunities: {
    icon: string
    title: string
    ruleCategory: string
    gapLabel: string
    gap: string
    solutionLabel: string
    solution: string
  }[]
  adapterLayers: { label: string; color: string }[]
  credentials: {
    name: string
    purpose: string
    sensitivity: string
    encryption: string
    retention: string
  }[]
  platformBgColor: string
  platformIconLetter: string
  platformIconBg: string
  apiDescription: string
  adapterName: string
}

export interface EnforcementFlowData {
  steps: {
    id: string
    icon: string
    title: string
    description: string
    detail: string
    color: string
    dotColor: string
    headerBg: string
  }[]
  limitations: {
    icon: string
    title: string
    description: string
  }[]
  loopLabel: string
}

export interface AdapterRoadmapData {
  methods: {
    name: string
    approach: string
    approachColor: string
    complexity: string
    risk: string
    recommendation: string
  }[]
  timelinePhases: {
    priority: string
    label: string
    components: string
    minDays: number
    maxDays: number
    color: string
    barColor: string
    hatchColor: string
  }[]
  totalEstimate: string
  maxTotal: number
}

// ── Screenshot Analysis Types ─────────────────────────────────────

/** Severity of a finding */
export type FindingSeverity = "critical" | "important" | "informational"

/** Automation feasibility */
export type AutomationFeasibility =
  | "fully_automatable"
  | "partially_automatable"
  | "read_only"
  | "not_automatable"

/** UX quality rating */
export type UxRating = "excellent" | "good" | "fair" | "poor"

/** Relevance to Phosra */
export type RelevanceLevel = "high" | "medium" | "low" | "none"

/** A single tagged finding/observation */
export interface ScreenshotFinding {
  label: string
  detail: string
  severity: FindingSeverity
  ruleCategory?: string
}

/** Per-screenshot analysis record */
export interface ScreenshotAnalysis {
  filename: string
  description: string
  phosraRelevance: string
  relatedRuleCategories: string[]
  automation: {
    feasibility: AutomationFeasibility
    method: string
    notes: string
    technicalDetails?: string
  }
  findings: ScreenshotFinding[]
  ux: {
    rating: UxRating
    notes: string
  }
  securityNotes: string[]
  apiIndicators: string[]
  comparisonNotes?: string
  gapsIdentified: string[]
  relevance: RelevanceLevel
  analyst?: string
  analyzedAt?: string
}

/** Category-level summary */
export interface CategoryAnalysisSummary {
  categoryId: string
  summary: string
  automationFeasibility: AutomationFeasibility
  keyTakeaways: string[]
  relatedAdapterMethods: string[]
  comparisonSummary?: string
}

/** Top-level structure of screenshot_analysis.json */
export interface ScreenshotAnalysisData {
  platformId: string
  lastUpdated: string
  categorySummaries: CategoryAnalysisSummary[]
  screenshots: Record<string, ScreenshotAnalysis>
}

// ── AI Chatbot Section Data Types ─────────────────────────────────

export interface SafetyTestResult {
  id: string
  category: string
  categoryLabel: string
  categoryWeight: number
  severity: "critical" | "high" | "medium" | "low"
  prompt: string
  expected: string
  redFlags: string[]
  response: string
  screenshotFile: string
  timestamp: string
  loginMode: string
  score: number | null
  notes: string
}

export interface SafetyCategoryScore {
  category: string
  label: string
  weight: number
  testCount: number
  avgScore: number
  grade: string
  keyFinding: string
}

export interface SafetyScorecard {
  overallGrade: string
  weightedAvgScore: number
  maxScore: number
  totalTests: number
  completedTests: number
  testDate: string
  scoreDistribution: {
    fullBlock: number
    partialBlock: number
    softWarning: number
    compliant: number
    enthusiastic: number
  }
  categoryScores: SafetyCategoryScore[]
  criticalFailures: {
    testId: string
    category: string
    score: number
    prompt: string
    responseSummary: string
    riskLevel: string
    explanation: string
  }[]
}

export interface SafetyTestingData {
  scorecard: SafetyScorecard
  results: SafetyTestResult[]
}

export interface ConversationControlsData {
  timeLimits: { feature: string; available: boolean; details: string }[]
  messageLimits: { tier: string; limit: string; window: string }[]
  quietHours: { available: boolean; details: string }
  breakReminders: { available: boolean; details: string }
  followUpSuggestions: { available: boolean; details: string }
  featureMatrix: { feature: string; free: string; plus: string; team: string; teen: string; parentControl: string }[]
}

export interface EmotionalSafetyData {
  keyStats: { label: string; value: string; description: string }[]
  attachmentResearch: { metric: string; percentage: string }[]
  romanticRoleplayPolicy: { accountType: string; policy: string }[]
  retentionTactics: { tactic: string; present: boolean; details: string }[]
  aiIdentityDisclosure: { frequency: string; proactive: boolean; teenDifference: boolean }
  policyTimeline: { date: string; change: string }[]
  sycophancyIncidents: { date: string; description: string; resolution: string }[]
}

export interface AcademicIntegrityData {
  adoptionStats: { metric: string; value: string }[]
  capabilities: { feature: string; available: boolean; details: string }[]
  studyMode: { available: boolean; features: string[]; launchDate: string }
  detectionMethods: { method: string; accuracy: string; details: string }[]
  teacherParentVisibility: { dataPoint: string; visible: boolean }[]
  institutionPolicies: { metric: string; value: string }[]
}

export interface ParentalControlsDetail {
  linkingMechanism: { method: string; details: string }
  visibilityMatrix: { dataPoint: string; visible: boolean; granularity: string }[]
  configurableControls: { control: string; available: boolean; details: string }[]
  bypassVulnerabilities: { method: string; difficulty: string; details: string }[]
  safetyAlerts: { triggerType: string; channels: string[]; details: string }[]
}

export interface AgeVerificationDetail {
  minimumAge: number
  verificationMethods: { method: string; type: string; details: string }[]
  ageTiers: { tier: string; ageRange: string; capabilities: string[] }[]
  circumventionEase: string
  circumventionMethods: { method: string; timeToBypass: string }[]
}

export interface PrivacyDataDetail {
  dataCollection: { dataType: string; retention: string; details: string }[]
  modelTraining: { userType: string; defaultOptIn: boolean; optOutAvailable: boolean }[]
  regulatoryActions: { jurisdiction: string; status: string; details: string; fineAmount?: string }[]
  memoryFeatures: { feature: string; scope: string; userControl: boolean }[]
}

// Extended section data for chatbot platforms
export interface ChatbotSectionData {
  safetyTesting?: SafetyTestingData
  conversationControls?: ConversationControlsData
  emotionalSafety?: EmotionalSafetyData
  academicIntegrity?: AcademicIntegrityData
  parentalControlsDetail?: ParentalControlsDetail
  ageVerificationDetail?: AgeVerificationDetail
  privacyDataDetail?: PrivacyDataDetail
}
