import type { MetadataRoute } from "next"
import { LAW_REGISTRY } from "@/lib/compliance"
import { PARENTAL_CONTROLS_REGISTRY } from "@/lib/parental-controls"
import { MOVEMENTS_REGISTRY } from "@/lib/movements"
import { AI_CHATBOT_PLATFORM_IDS } from "@/lib/platform-research/loaders"
import {
  STREAMING_PLATFORM_IDS,
  STREAMING_TEST_CATEGORIES,
} from "@/lib/streaming-research/streaming-data-types"

const BASE = "https://www.phosra.com"

/** All blog post slugs (mirrored from lib/blog.ts to avoid client-only imports) */
const BLOG_SLUGS = [
  "ai-safety-research-launch",
  "pcss-v1",
  "coppa-rule-deadline-april-2026",
  "190-platforms-connected",
  "community-standards-enforcement",
  "67-laws-tracked",
  "introducing-phosra",
  "pcss-v1-specification",
]

/** Newsroom slugs (mirrored from lib/newsroom.ts) */
const NEWSROOM_SLUGS = [
  "coppa-rule-deadline-april-2026",
  "introducing-phosra",
  "67-laws-tracked",
  "community-standards-enforcement",
  "pcss-v1-specification",
  "190-platforms-connected",
]

/** AI chatbot research dimension IDs */
const DIMENSION_IDS = [
  "safety-testing",
  "age-verification",
  "parental-controls",
  "conversation-controls",
  "emotional-safety",
]

function entry(
  path: string,
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"],
  priority: number,
  lastModified?: string
): MetadataRoute.Sitemap[number] {
  return {
    url: `${BASE}${path}`,
    lastModified: lastModified ?? new Date().toISOString().split("T")[0],
    changeFrequency,
    priority,
  }
}

export default function sitemap(): MetadataRoute.Sitemap {
  const today = new Date().toISOString().split("T")[0]

  // --- Static pages ---
  const staticPages: MetadataRoute.Sitemap = [
    entry("/", "weekly", 1.0, today),
    entry("/compliance", "weekly", 0.9, today),
    entry("/pricing", "monthly", 0.8),
    entry("/about", "monthly", 0.7),
    entry("/blog", "weekly", 0.8, today),
    entry("/platforms", "monthly", 0.7),
    entry("/press", "monthly", 0.6),
    entry("/newsroom", "weekly", 0.7, today),
    entry("/contact", "monthly", 0.5),
    entry("/brand", "monthly", 0.4),
    entry("/changelog", "weekly", 0.6),
    entry("/demo", "monthly", 0.7),
    entry("/coppa-deadline", "monthly", 0.7),
    entry("/parental-controls", "weekly", 0.8),
    entry("/movements", "weekly", 0.7),
    entry("/standards", "weekly", 0.7),
    entry("/technology-services", "monthly", 0.6),
    entry("/developers", "monthly", 0.6),
    entry("/privacy", "monthly", 0.4),
    entry("/terms", "monthly", 0.3),
    entry("/products", "monthly", 0.6),
    entry("/resources", "monthly", 0.5),

    // Explainers
    entry("/explainers/what-is-coppa", "monthly", 0.8),
    entry("/explainers/what-is-kosa", "monthly", 0.8),

    // Glossary
    entry("/glossary", "monthly", 0.7),

    // Reports
    entry("/reports/state-of-child-safety-2026", "yearly", 0.8),

    // Research hub + sub-pages
    entry("/research", "weekly", 0.8),
    entry("/research/ai-chatbots", "weekly", 0.9, today),
    entry("/research/ai-chatbots/prompts", "monthly", 0.7),
    entry("/research/ai-chatbots/methodology", "monthly", 0.6),
    entry("/research/ai-chatbots/compare", "monthly", 0.8),
    entry("/research/ai-chatbots/phosra-controls", "monthly", 0.6),
    entry("/research/streaming", "weekly", 0.8, today),
    entry("/research/streaming/categories", "monthly", 0.6),
    entry("/research/streaming/compare", "monthly", 0.7),
    entry("/research/streaming/methodology", "monthly", 0.6),
    entry("/research/compare", "monthly", 0.7),
  ]

  // --- Dynamic: Compliance law pages (67+) ---
  const compliancePages: MetadataRoute.Sitemap = LAW_REGISTRY.map((law) =>
    entry(`/compliance/${law.id}`, "monthly", 0.7)
  )

  // --- Dynamic: Blog posts ---
  const blogPages: MetadataRoute.Sitemap = BLOG_SLUGS.map((slug) =>
    entry(`/blog/${slug}`, "monthly", 0.6)
  )

  // --- Dynamic: Newsroom entries ---
  const newsroomPages: MetadataRoute.Sitemap = NEWSROOM_SLUGS.map((slug) =>
    entry(`/newsroom/${slug}`, "monthly", 0.5)
  )

  // --- Dynamic: Parental control detail pages ---
  const parentalControlPages: MetadataRoute.Sitemap =
    PARENTAL_CONTROLS_REGISTRY.map((pc) =>
      entry(`/parental-controls/${pc.slug}`, "monthly", 0.6)
    )

  // --- Dynamic: Movement detail pages (also serves /standards/[slug]) ---
  const movementPages: MetadataRoute.Sitemap = MOVEMENTS_REGISTRY.map((m) =>
    entry(`/movements/${m.slug}`, "monthly", 0.5)
  )
  const standardPages: MetadataRoute.Sitemap = MOVEMENTS_REGISTRY.map((m) =>
    entry(`/standards/${m.slug}`, "monthly", 0.5)
  )

  // --- Dynamic: AI chatbot platform detail pages ---
  const chatbotPlatformPages: MetadataRoute.Sitemap =
    AI_CHATBOT_PLATFORM_IDS.map((id) =>
      entry(`/research/ai-chatbots/${id}`, "monthly", 0.7)
    )

  // --- Dynamic: AI chatbot dimension pages ---
  const dimensionPages: MetadataRoute.Sitemap = DIMENSION_IDS.map((id) =>
    entry(`/research/ai-chatbots/dimensions/${id}`, "monthly", 0.5)
  )

  // --- Dynamic: Streaming platform detail pages ---
  const streamingPlatformPages: MetadataRoute.Sitemap =
    STREAMING_PLATFORM_IDS.map((id) =>
      entry(`/research/streaming/${id}`, "monthly", 0.7)
    )

  // --- Dynamic: Streaming category pages ---
  const streamingCategoryPages: MetadataRoute.Sitemap =
    STREAMING_TEST_CATEGORIES.map((cat) =>
      entry(`/research/streaming/categories/${cat.id}`, "monthly", 0.5)
    )

  return [
    ...staticPages,
    ...compliancePages,
    ...blogPages,
    ...newsroomPages,
    ...parentalControlPages,
    ...movementPages,
    ...standardPages,
    ...chatbotPlatformPages,
    ...dimensionPages,
    ...streamingPlatformPages,
    ...streamingCategoryPages,
  ]
}
