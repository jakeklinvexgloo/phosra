export interface LegislationEntry {
  id: string
  law: string
  summary: string
  jurisdiction: string
  introduced: string
  stage: string
  categories: string[]
  keyProvisions: string[]
}

export interface RecipeStep {
  number: number
  method: "GET" | "POST" | "PUT" | "DELETE"
  endpoint: string
  description: string
  requestBody?: string
  responseBody?: string
  whatHappens: string
}

export interface Recipe {
  id: string
  title: string
  summary: string
  icon: string
  tags: string[]
  scenario: string
  actors: string[]
  flowDiagram: string
  steps: RecipeStep[]
  keyTeachingPoint: string
}

export type PlatformSupport = "full" | "partial" | "none"

export interface CategoryField {
  name: string
  type: string
  required: boolean
  default: string
  constraints: string
  description: string
}

export interface AgeDefault {
  range: string
  enabled: boolean
  summary: string
}

export interface PlatformInfo {
  name: string
  support: PlatformSupport
}

export interface CategoryReference {
  id: string
  name: string
  group: string
  description: string
  rationale: string
  laws: string[]
  fields: CategoryField[]
  exampleConfig: string
  ageDefaults: AgeDefault[]
  platforms: PlatformInfo[]
}

/** @deprecated Import DOCS_PLATFORM_NAMES from '@/lib/platforms/adapters/to-docs-support' instead */
export { DOCS_PLATFORM_NAMES as PLATFORM_NAMES } from "@/lib/platforms/adapters/to-docs-support"

export interface DocSection {
  id: string
  title: string
}
