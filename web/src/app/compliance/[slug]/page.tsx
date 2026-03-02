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
  return <ComplianceLawTemplate law={law} />
}
