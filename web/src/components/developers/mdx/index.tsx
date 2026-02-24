import type { MDXComponents } from "mdx/types"
import { Callout } from "./Callout"
import { CardGrid } from "./CardGrid"
import { LinkCard } from "./LinkCard"
import { CodeTabs } from "./CodeTabs"
import { CodeBlock } from "./CodeBlock"
import { Steps, Step } from "./Steps"
import { Accordion, AccordionGroup } from "./Accordion"
import { SmartLink } from "./SmartLink"
import { ProseTable } from "./ProseTable"
import { Tabs, Tab } from "./Tabs"

// Reference components (from /docs migration)
import { SpecificationView } from "@/components/developers/reference/SpecificationView"
import { CategoryBrowser } from "@/components/developers/reference/CategoryBrowser"
import { RatingsBrowser } from "@/components/developers/reference/RatingsBrowser"
import { PlatformMatrix } from "@/components/developers/reference/PlatformMatrix"
import { LegislationBrowser } from "@/components/developers/reference/LegislationBrowser"

// Recipe components
import { RecipeViewer } from "@/components/developers/recipes/RecipeViewer"
import { RecipeIndex } from "@/components/developers/recipes/RecipeIndex"

// Map Mintlify component names to our implementations
export const mdxComponents: MDXComponents = {
  // Mintlify callouts
  Info: (props: any) => <Callout variant="info" {...props} />,
  Warning: (props: any) => <Callout variant="warning" {...props} />,
  Tip: (props: any) => <Callout variant="tip" {...props} />,
  Note: (props: any) => <Callout variant="note" {...props} />,

  // Mintlify card/grid
  CardGroup: CardGrid as any,
  Card: LinkCard as any,

  // Mintlify code
  CodeGroup: CodeTabs as any,

  // Mintlify steps
  Steps: Steps as any,
  Step: Step as any,

  // Mintlify accordion
  Accordion: Accordion as any,
  AccordionGroup: AccordionGroup as any,

  // Mintlify tabs
  Tabs: Tabs as any,
  Tab: Tab as any,

  // Reference components
  SpecificationView: SpecificationView as any,
  CategoryBrowser: CategoryBrowser as any,
  RatingsBrowser: RatingsBrowser as any,
  PlatformMatrix: PlatformMatrix as any,
  LegislationBrowser: LegislationBrowser as any,

  // Recipe components
  RecipeViewer: RecipeViewer as any,
  RecipeIndex: RecipeIndex as any,

  // HTML element overrides
  h1: () => null, // Suppress MDX H1 — DevDocsHeader renders the title from frontmatter
  a: SmartLink as any,
  table: ProseTable as any,
  pre: CodeBlock as any,
}

export {
  Callout,
  CardGrid,
  LinkCard,
  CodeTabs,
  CodeBlock,
  Steps,
  Step,
  Accordion,
  AccordionGroup,
  SmartLink,
  ProseTable,
  Tabs,
  Tab,
  SpecificationView,
  CategoryBrowser,
  RatingsBrowser,
  PlatformMatrix,
  LegislationBrowser,
  RecipeViewer,
  RecipeIndex,
}
