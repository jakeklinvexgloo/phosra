import type { Metadata } from "next"
import { BookOpen } from "lucide-react"
import { GLOSSARY } from "@/lib/glossary"
import { GlossaryClient } from "./GlossaryClient"

export const metadata: Metadata = {
  title: "Child Safety Glossary | 25+ Key Terms Defined | Phosra",
  description:
    "Comprehensive glossary of child safety terms including COPPA, KOSA, age verification, parental consent, and more. Essential reference for compliance professionals.",
  openGraph: {
    title: "Child Safety Glossary | 25+ Key Terms Defined | Phosra",
    description:
      "Comprehensive glossary of child safety terms including COPPA, KOSA, age verification, parental consent, and more.",
    url: "https://www.phosra.com/glossary",
    siteName: "Phosra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Child Safety Glossary | 25+ Key Terms Defined | Phosra",
    description:
      "Comprehensive glossary of child safety terms including COPPA, KOSA, age verification, parental consent, and more.",
  },
  alternates: {
    canonical: "https://www.phosra.com/glossary",
  },
}

export default function GlossaryPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    name: "Child Safety Glossary",
    description:
      "Key terms and definitions for child safety compliance, legislation, and technology",
    url: "https://www.phosra.com/glossary",
    hasDefinedTerm: GLOSSARY.map((entry) => ({
      "@type": "DefinedTerm",
      name: entry.term,
      description: entry.definition,
    })),
  }

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <section className="border-b border-border bg-gradient-to-b from-muted/50 to-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-8 py-16 sm:py-20">
          <div className="flex items-center gap-2 text-brand-green text-sm font-semibold tracking-wider uppercase mb-4">
            <BookOpen className="w-4 h-4" />
            Reference
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display text-foreground leading-tight">
            Child Safety Glossary
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground mt-4 leading-relaxed max-w-2xl">
            Key terms and definitions for child safety compliance, legislation,
            and technology. {GLOSSARY.length} terms covering the laws, tools, and
            policies that protect children online.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-4xl mx-auto px-4 sm:px-8 py-10 sm:py-14">
        <GlossaryClient />
      </section>
    </div>
  )
}
