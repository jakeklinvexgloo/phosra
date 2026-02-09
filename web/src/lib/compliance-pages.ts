/**
 * Re-exports from the unified compliance registry.
 * This file is kept for backward compatibility — all data now
 * lives in @/lib/compliance/law-registry.ts
 */
export {
  getCompliancePages,
  toCompliancePage,
  type CompliancePageData,
} from "@/lib/compliance/adapters/to-compliance-page"

import { getCompliancePages } from "@/lib/compliance/adapters/to-compliance-page"

/** Pre-computed pages record (backward compat) */
export const COMPLIANCE_PAGES = getCompliancePages()
