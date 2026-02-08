import Link from "next/link"

const FOOTER_SECTIONS = [
  {
    title: "Product",
    links: [
      { label: "Quick Setup", href: "/dashboard/setup" },
      { label: "Platforms", href: "/dashboard/platforms" },
      { label: "Enforcement", href: "/dashboard/enforcement" },
      { label: "Playground", href: "/dashboard/playground" },
      { label: "API Docs", href: "/dashboard/docs" },
    ],
  },
  {
    title: "Developers",
    links: [
      { label: "API Reference", href: "/dashboard/docs" },
      { label: "Quick Start", href: "/dashboard/setup" },
      { label: "Playground", href: "/dashboard/playground" },
      { label: "GitHub", href: "https://github.com" },
    ],
  },
  {
    title: "Compliance",
    links: [
      { label: "KOSA", href: "#compliance" },
      { label: "COPPA 2.0", href: "#compliance" },
      { label: "EU DSA", href: "#compliance" },
      { label: "Platform Standards", href: "#compliance" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Pricing", href: "#" },
      { label: "Contact", href: "#" },
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
    ],
  },
]

export function Footer() {
  return (
    <footer className="bg-[#111111] text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {FOOTER_SECTIONS.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-white mb-4">{section.title}</h3>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/50 hover:text-white/80 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center">
            <img src="/logo-white.svg" alt="Phosra" className="h-5" />
          </div>
          <p className="text-xs text-white/40">&copy; {new Date().getFullYear()} Phosra. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
