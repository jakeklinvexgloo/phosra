import { MOVEMENTS_REGISTRY, getMovementBySlug } from "@/lib/movements"
import { notFound } from "next/navigation"
import { MovementDetailTemplate } from "@/components/marketing/movements/MovementDetailTemplate"

export function generateStaticParams() {
  return MOVEMENTS_REGISTRY.map((s) => ({ slug: s.slug }))
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
