import Link from "next/link"
import { ChevronRight, Pencil } from "lucide-react"

interface DevDocsHeaderProps {
  title?: string
  slug: string[]
}

export function DevDocsHeader({ title, slug }: DevDocsHeaderProps) {
  // Build breadcrumbs from slug
  const breadcrumbs = slug.map((segment, i) => ({
    label: segment
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase()),
    href: "/developers/" + slug.slice(0, i + 1).join("/"),
  }))

  const githubEditUrl = `https://github.com/jakeklinvexgloo/phosra/edit/main/docs/api/${slug.join("/")}.mdx`

  return (
    <div className="mb-8">
      {/* Breadcrumbs */}
      {slug.length > 0 && slug[0] !== "introduction" && (
        <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
          <Link href="/developers" className="hover:text-foreground transition-colors">
            Docs
          </Link>
          {breadcrumbs.map((crumb, i) => (
            <span key={crumb.href} className="flex items-center gap-1">
              <ChevronRight className="w-3.5 h-3.5" />
              {i === breadcrumbs.length - 1 ? (
                <span className="text-foreground">{crumb.label}</span>
              ) : (
                <Link href={crumb.href} className="hover:text-foreground transition-colors">
                  {crumb.label}
                </Link>
              )}
            </span>
          ))}
        </nav>
      )}

      {/* Title + Edit link */}
      <div className="flex items-start justify-between gap-4">
        {title && (
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            {title}
          </h1>
        )}
        <a
          href={githubEditUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 mt-2"
        >
          <Pencil className="w-3.5 h-3.5" />
          Edit
        </a>
      </div>
    </div>
  )
}
