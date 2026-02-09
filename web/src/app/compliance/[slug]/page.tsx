import { LAW_REGISTRY, getLawById } from "@/lib/compliance"
import { notFound } from "next/navigation"
import { ComplianceLawTemplate } from "@/components/marketing/compliance-page/ComplianceLawTemplate"

export function generateStaticParams() {
  return LAW_REGISTRY.map((law) => ({ slug: law.id }))
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
