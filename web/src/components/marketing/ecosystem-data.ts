/*
 * Ecosystem Section — Platform Data & Icon Mappings
 *
 * Re-exports from the unified platform registry.
 * Consumer components (Ecosystem.tsx, LogoMarquee.tsx, CategoryGrid.tsx,
 * HubVisualization.tsx, PlatformIcon.tsx) import from this file unchanged.
 */

export type {
  PlatformEntry,
  PlatformCategory,
} from "@/lib/platforms/adapters/to-ecosystem-data"

export {
  CONTROL_SOURCES,
  ENFORCEMENT_TARGETS,
  SOURCE_COUNT,
  TARGET_COUNT,
  TOTAL_COUNT,
  CATEGORY_COUNT,
  MARQUEE_SOURCES,
  MARQUEE_TARGETS,
} from "@/lib/platforms/adapters/to-ecosystem-data"
