import Link from "next/link"
import { ArrowRight } from "lucide-react"

interface LinkCardProps {
  title: string
  icon?: string
  href?: string
  children?: React.ReactNode
}

export function LinkCard({ title, icon, href, children }: LinkCardProps) {
  const content = (
    <div className="group relative rounded-lg border border-border bg-card p-5 transition-all hover:border-border/80 hover:shadow-sm">
      {icon && <span className="text-lg mb-2 block">{icon}</span>}
      <h3 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-1.5">
        {title}
        {href && <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />}
      </h3>
      {children && (
        <p className="text-sm text-muted-foreground leading-relaxed m-0">{children}</p>
      )}
    </div>
  )

  if (href) {
    const isExternal = href.startsWith("http")
    if (isExternal) {
      return <a href={href} target="_blank" rel="noopener noreferrer" className="no-underline">{content}</a>
    }
    // Map Mintlify-style relative links to /developers/ prefix
    const resolvedHref = href.startsWith("/") ? `/developers${href}` : href
    return <Link href={resolvedHref} className="no-underline">{content}</Link>
  }

  return content
}
