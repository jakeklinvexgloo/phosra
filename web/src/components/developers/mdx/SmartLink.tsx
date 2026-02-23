import Link from "next/link"

interface SmartLinkProps {
  href?: string
  children: React.ReactNode
  className?: string
  [key: string]: any
}

export function SmartLink({ href, children, className, ...props }: SmartLinkProps) {
  if (!href) return <span className={className} {...props}>{children}</span>

  const isExternal = href.startsWith("http") || href.startsWith("//")

  if (isExternal) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className} {...props}>
        {children}
      </a>
    )
  }

  return (
    <Link href={href} className={className} {...props}>
      {children}
    </Link>
  )
}
