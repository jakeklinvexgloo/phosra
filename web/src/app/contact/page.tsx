"use client"

import Link from "next/link"
import { Building2, Code, Handshake, Users, Shield, Newspaper, Mail, ExternalLink } from "lucide-react"

const CHANNELS = [
  {
    icon: Building2,
    title: "Enterprise & Sales",
    description: "Custom pricing, volume licensing, dedicated support, and SLA agreements for organizations.",
    email: "sales@phosra.com",
    cta: "Talk to Sales",
  },
  {
    icon: Code,
    title: "Developer Support",
    description: "API integration help, debugging assistance, and technical guidance for building with Phosra.",
    email: "support@phosra.com",
    link: { href: "/docs", label: "Read the Docs" },
  },
  {
    icon: Handshake,
    title: "Integrations",
    description: "Integrate Phosra into your parental control app, EdTech platform, or device management system.",
    email: "partners@phosra.com",
    cta: "Discuss Integration",
  },
  {
    icon: Users,
    title: "Community",
    description: "Connect with other developers building child safety features. Get help, share ideas, contribute.",
    links: [
      { href: "https://github.com/phosra", label: "GitHub" },
      { href: "https://discord.gg/phosra", label: "Discord" },
    ],
  },
  {
    icon: Shield,
    title: "Security Reporting",
    description: "Found a vulnerability? We take security seriously. Report issues responsibly and we'll respond within 24 hours.",
    email: "security@phosra.com",
    cta: "Report Vulnerability",
  },
  {
    icon: Newspaper,
    title: "Media & Press",
    description: "Press inquiries, media kits, spokesperson requests, and product announcements.",
    email: "press@phosra.com",
    cta: "Press Inquiries",
  },
]

export default function ContactPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-16 sm:py-20">
      {/* Hero */}
      <div className="text-center mb-12 sm:mb-16">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display text-foreground">
          Get in touch
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground mt-4 max-w-xl mx-auto">
          Whether you&apos;re building a parental control app, need enterprise support, or want to report a security issue — we&apos;re here to help.
        </p>
      </div>

      {/* Contact Cards Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {CHANNELS.map((channel) => {
          const Icon = channel.icon
          return (
            <div key={channel.title} className="plaid-card flex flex-col">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-brand-green" />
                </div>
                <h3 className="font-semibold text-foreground">{channel.title}</h3>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                {channel.description}
              </p>

              <div className="mt-4 pt-4 border-t border-border space-y-2">
                {channel.email && (
                  <a
                    href={`mailto:${channel.email}`}
                    className="flex items-center gap-2 text-sm text-foreground hover:text-brand-green transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    {channel.email}
                  </a>
                )}

                {channel.link && (
                  <Link
                    href={channel.link.href}
                    className="flex items-center gap-2 text-sm text-brand-green hover:underline"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    {channel.link.label}
                  </Link>
                )}

                {channel.links && (
                  <div className="flex gap-3">
                    {channel.links.map((link) => (
                      <a
                        key={link.label}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-sm text-brand-green hover:underline"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        {link.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* General Contact */}
      <div className="mt-12 text-center">
        <div className="inline-flex items-center gap-3 bg-muted/50 border border-border rounded-full px-6 py-3">
          <Mail className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">General inquiries:</span>
          <a href="mailto:hello@phosra.com" className="text-sm font-medium text-foreground hover:text-brand-green transition-colors">
            hello@phosra.com
          </a>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          We typically respond within one business day.
        </p>
      </div>
    </div>
  )
}
