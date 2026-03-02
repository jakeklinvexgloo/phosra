import { LAW_REGISTRY, getLawById } from "@/lib/compliance"
import { notFound } from "next/navigation"
import { ComplianceLawTemplate } from "@/components/marketing/compliance-page/ComplianceLawTemplate"
import type { Metadata } from "next"

export function generateStaticParams() {
  return LAW_REGISTRY.map((law) => ({ slug: law.id }))
}

export function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Metadata {
  const law = getLawById(params.slug)
  if (!law) return {}

  const title = `${law.shortName} Compliance Guide | Phosra`
  const description = `${law.summary} Track requirements and Phosra enforcement features for ${law.fullName}.`.slice(0, 160)

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
  }
}

export default function ComplianceLawPage({
  params,
}: {
  params: { slug: string }
}) {
  const law = getLawById(params.slug)
  if (!law) notFound()

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.phosra.com" },
      { "@type": "ListItem", position: 2, name: "Compliance", item: "https://www.phosra.com/compliance" },
      { "@type": "ListItem", position: 3, name: law.shortName, item: `https://www.phosra.com/compliance/${params.slug}` },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ComplianceLawTemplate law={law} />
    </>
  )
}
