import { MOVEMENTS_REGISTRY, getMovementBySlug } from "@/lib/movements"
import { notFound } from "next/navigation"
import { MovementDetailTemplate } from "@/components/marketing/movements/MovementDetailTemplate"
import type { Metadata } from "next"

export function generateStaticParams() {
  return MOVEMENTS_REGISTRY.map((s) => ({ slug: s.slug }))
}

export function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Metadata {
  const movement = getMovementBySlug(params.slug)
  if (!movement) return {}

  const title = `${movement.name} | Community Movements | Phosra`
  const description = movement.description.slice(0, 160)

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

export default function MovementDetailPage({
  params,
}: {
  params: { slug: string }
}) {
  const movement = getMovementBySlug(params.slug)
  if (!movement) notFound()
  return <MovementDetailTemplate movement={movement} />
}
