import { PARENTAL_CONTROLS_REGISTRY, getParentalControlBySlug } from "@/lib/parental-controls"
import { notFound } from "next/navigation"
import { ParentalControlDetailTemplate } from "@/components/parental-controls/ParentalControlDetailTemplate"

export function generateStaticParams() {
  return PARENTAL_CONTROLS_REGISTRY.map((p) => ({ slug: p.slug }))
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
