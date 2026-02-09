import Link from "next/link"
import { PhosraBurst } from "./shared"

const FOOTER_SECTIONS = [
  {
    title: "Product",
    links: [
      { label: "Platforms", href: "/platforms" },
      { label: "Playground", href: "/playground" },
      { label: "Pricing", href: "/pricing" },
      { label: "Demo", href: "/demo" },
      { label: "Changelog", href: "/changelog" },
    ],
  },
  {
    title: "Developers",
    links: [
      { label: "API Docs", href: "/docs" },
      { label: "API Reference", href: "/docs" },
      { label: "Playground", href: "/playground" },
      { label: "GitHub", href: "https://github.com" },
    ],
  },
  {
    title: "Compliance",
    links: [
      { label: "KOSA", href: "/compliance/kosa" },
      { label: "COPPA 2.0", href: "/compliance/coppa" },
      { label: "EU DSA", href: "/compliance/dsa" },
      { label: "Platform Standards", href: "/platforms" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Pricing", href: "/pricing" },
      { label: "Contact", href: "/contact" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
]

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-gradient-to-b from-[#0D1B2A] to-[#060D16] text-white">
      {/* Brand mark watermark */}
      <div className="absolute -bottom-10 -right-10">
        <PhosraBurst size={300} color="#ffffff" opacity={0.03} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {FOOTER_SECTIONS.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-white mb-4">{section.title}</h3>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/40 hover:text-brand-green transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Gradient divider */}
        <div className="mt-12 mb-8 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center">
            <img src="/logo-white.svg" alt="Phosra" className="h-5" />
          </div>
          <p className="text-xs text-white/30">&copy; {new Date().getFullYear()} Phosra. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
