import { PARENTAL_CONTROLS_REGISTRY, getParentalControlBySlug } from "@/lib/parental-controls"
import { notFound } from "next/navigation"
import { ParentalControlDetailTemplate } from "@/components/parental-controls/ParentalControlDetailTemplate"
import type { Metadata } from "next"

export function generateStaticParams() {
  return PARENTAL_CONTROLS_REGISTRY.map((p) => ({ slug: p.slug }))
}

export function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Metadata {
  const entry = getParentalControlBySlug(params.slug)
  if (!entry) return {}

  const title = `${entry.name} Parental Controls Review | Phosra`
  const description = entry.description.slice(0, 160)

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical: `https://www.phosra.com/parental-controls/${params.slug}`,
    },
  }
}

export default function ParentalControlDetailPage({
  params,
}: {
  params: { slug: string }
}) {
  const entry = getParentalControlBySlug(params.slug)
  if (!entry) notFound()

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.phosra.com" },
      { "@type": "ListItem", position: 2, name: "Parental Controls", item: "https://www.phosra.com/parental-controls" },
      { "@type": "ListItem", position: 3, name: entry.name, item: `https://www.phosra.com/parental-controls/${params.slug}` },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ParentalControlDetailTemplate entry={entry} />
    </>
  )
}
