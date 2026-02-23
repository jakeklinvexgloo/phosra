import fs from "fs"
import path from "path"

const DOCS_DIR = path.join(process.cwd(), "..", "docs", "api")

/** Resolve a slug array to an MDX file path, or null if not found */
export function resolveSlugToMdxPath(slug: string[]): string | null {
  const relativePath = slug.join("/") + ".mdx"
  const fullPath = path.join(DOCS_DIR, relativePath)
  if (fs.existsSync(fullPath)) return fullPath
  return null
}

/** Read MDX file content by slug */
export function getMdxContent(slug: string[]): string | null {
  const filePath = resolveSlugToMdxPath(slug)
  if (!filePath) return null
  return fs.readFileSync(filePath, "utf-8")
}

/** List all MDX file slugs (for generateStaticParams) */
export function getAllMdxSlugs(): string[][] {
  const slugs: string[][] = []

  function walk(dir: string, prefix: string[] = []) {
    if (!fs.existsSync(dir)) return
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      if (entry.isDirectory()) {
        walk(path.join(dir, entry.name), [...prefix, entry.name])
      } else if (entry.name.endsWith(".mdx")) {
        const name = entry.name.replace(".mdx", "")
        slugs.push([...prefix, name])
      }
    }
  }

  walk(DOCS_DIR)
  return slugs
}

/** Extract h2/h3 headings from MDX content for TOC */
export function extractHeadings(content: string): { id: string; text: string; level: number }[] {
  const headingRegex = /^(#{2,3})\s+(.+)$/gm
  const headings: { id: string; text: string; level: number }[] = []
  let match

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length
    const text = match[2].trim()
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
    headings.push({ id, text, level })
  }

  return headings
}
