import Link from "next/link"

const NAV_LINKS = [
  { href: "/compliance", label: "Compliance Hub" },
  { href: "/parental-controls", label: "Parental Controls" },
  { href: "/pricing", label: "Pricing" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
]

export default function NotFound() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4 sm:px-8 bg-gradient-to-br from-[#0D1B2A] via-[#0A2F2F] to-[#0D1B2A]">
      {/* 404 display */}
      <h1 className="font-display text-[8rem] sm:text-[12rem] leading-none font-bold bg-gradient-to-r from-[#00D47E] to-[#26A8C9] bg-clip-text text-transparent select-none">
        404
      </h1>

      {/* Heading */}
      <h2 className="text-2xl sm:text-3xl font-display text-white mt-2">
        Page Not Found
      </h2>

      {/* Description */}
      <p className="text-slate-400 text-center max-w-md mt-4 leading-relaxed">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>

      {/* Back to Home button */}
      <Link
        href="/"
        className="mt-8 inline-flex items-center px-8 py-3.5 bg-brand-green text-foreground text-sm font-semibold rounded-sm hover:opacity-90 transition hover:shadow-[0_0_30px_-6px_rgba(0,212,126,0.4)]"
      >
        Back to Home
      </Link>

      {/* Navigation links */}
      <nav className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-2">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  )
}
