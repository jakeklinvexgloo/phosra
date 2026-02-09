import { STANDARDS_REGISTRY, getStandardBySlug } from "@/lib/standards"
import { notFound } from "next/navigation"
import { StandardDetailTemplate } from "@/components/marketing/standards/StandardDetailTemplate"

export function generateStaticParams() {
  return STANDARDS_REGISTRY.map((s) => ({ slug: s.slug }))
}

export default function StandardDetailPage({
  params,
}: {
  params: { slug: string }
}) {
  const standard = getStandardBySlug(params.slug)
  if (!standard) notFound()
  return <StandardDetailTemplate standard={standard} />
}
