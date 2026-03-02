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
  }
}

export default function ParentalControlDetailPage({
  params,
}: {
  params: { slug: string }
}) {
  const entry = getParentalControlBySlug(params.slug)
  if (!entry) notFound()
  return <ParentalControlDetailTemplate entry={entry} />
}
