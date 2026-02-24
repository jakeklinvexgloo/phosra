import fs from "fs"
import path from "path"
import { compileMDX } from "next-mdx-remote/rsc"
import remarkGfm from "remark-gfm"
import rehypePrettyCode from "rehype-pretty-code"
import { notFound } from "next/navigation"
import { getMdxContent, getAllMdxSlugs, extractHeadings } from "@/lib/developers/mdx-utils"
import { mdxComponents } from "@/components/developers/mdx"
import { ApiEndpointPage } from "@/components/developers/ApiEndpointPage"
import { DevDocsToc } from "@/components/developers/DevDocsToc"
import { DevDocsHeader } from "@/components/developers/DevDocsHeader"
import type { Metadata } from "next"

/* ── Rehype plugin: add id attributes to headings ──────────────── */

function getTextContent(node: any): string {
  if (node.type === "text") return node.value || ""
  if (node.children) return node.children.map(getTextContent).join("")
  return ""
}

/** Adds id attributes to h1–h6 using the same algorithm as extractHeadings */
function rehypeHeadingIds() {
  return (tree: any) => {
    function visit(node: any) {
      if (node.type === "element" && /^h[1-6]$/.test(node.tagName)) {
        const text = getTextContent(node)
        const id = text
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")
        node.properties = { ...node.properties, id }
      }
      if (node.children) {
        node.children.forEach(visit)
      }
    }
    visit(tree)
  }
}

function loadApiReferenceData(): any {
  try {
    const filePath = path.join(process.cwd(), "src", "lib", "developers", "generated", "api-reference.json")
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, "utf-8"))
    }
  } catch {}
  return null
}

const apiReferenceData = loadApiReferenceData()

interface PageProps {
  params: { slug?: string[] }
}

function getEffectiveSlug(slug?: string[]): string[] {
  if (!slug || slug.length === 0) return ["introduction"]
  return slug
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const slug = getEffectiveSlug(params.slug)

  // Check MDX
  const content = getMdxContent(slug)
  if (content) {
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/)
    if (frontmatterMatch) {
      const title = frontmatterMatch[1].match(/title:\s*['"](.+?)['"]/)?.[1]
      const description = frontmatterMatch[1].match(/description:\s*['"](.+?)['"]/)?.[1]
      return {
        title: title ? `${title} | Phosra Developers` : "Phosra Developers",
        description: description || "Phosra developer documentation",
      }
    }
  }

  // Check API reference
  if (apiReferenceData && slug[0] === "api-reference" && slug.length >= 3) {
    const endpointSlug = slug.slice(1).join("/")
    const endpoint = apiReferenceData.endpoints?.find((e: any) => e.slug === endpointSlug)
    if (endpoint) {
      return {
        title: `${endpoint.summary} | Phosra API Reference`,
        description: endpoint.description,
      }
    }
  }

  return { title: "Phosra Developers" }
}

export function generateStaticParams() {
  const params: { slug: string[] }[] = []

  // Root page (introduction)
  params.push({ slug: [] })

  // All MDX pages
  const mdxSlugs = getAllMdxSlugs()
  for (const slug of mdxSlugs) {
    // Skip introduction since it's handled by the root
    if (slug.length === 1 && slug[0] === "introduction") continue
    params.push({ slug })
  }

  // All API reference endpoints
  if (apiReferenceData?.endpoints) {
    for (const endpoint of apiReferenceData.endpoints) {
      params.push({ slug: ["api-reference", ...endpoint.slug.split("/")] })
    }
  }

  return params
}

export default async function DeveloperDocsPage({ params }: PageProps) {
  const slug = getEffectiveSlug(params.slug)

  // Try MDX content first
  const mdxSource = getMdxContent(slug)
  if (mdxSource) {
    const headings = extractHeadings(mdxSource)

    const { content, frontmatter } = await compileMDX<{ title?: string; description?: string; hideHeader?: boolean }>({
      source: mdxSource,
      components: mdxComponents,
      options: {
        parseFrontmatter: true,
        mdxOptions: {
          remarkPlugins: [remarkGfm],
          rehypePlugins: [
            rehypeHeadingIds,
            [rehypePrettyCode, {
              theme: "github-dark",
              keepBackground: true,
            }],
          ],
        },
      },
    })

    return (
      <div className="flex gap-6">
        <div className="flex-1 min-w-0">
          {!frontmatter.hideHeader && (
            <DevDocsHeader
              title={frontmatter.title}
              slug={slug}
            />
          )}
          <div className="prose-developers">
            {content}
          </div>
        </div>
        {headings.length > 0 && (
          <DevDocsToc headings={headings} />
        )}
      </div>
    )
  }

  // Try API reference endpoint
  if (slug[0] === "api-reference" && slug.length >= 3 && apiReferenceData) {
    const endpointSlug = slug.slice(1).join("/")
    const endpoint = apiReferenceData.endpoints?.find((e: any) => e.slug === endpointSlug)
    if (endpoint) {
      return (
        <div>
          <DevDocsHeader
            title={endpoint.summary}
            slug={slug}
          />
          <ApiEndpointPage endpoint={endpoint} />
        </div>
      )
    }
  }

  notFound()
}
