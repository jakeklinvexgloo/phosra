"use client"

interface PhosraFeatureCardProps {
  regulation: string
  phosraFeature: string
  ruleCategory?: string
  description: string
}

export function PhosraFeatureCard({
  regulation,
  phosraFeature,
  ruleCategory,
  description,
}: PhosraFeatureCardProps) {
  return (
    <div className="plaid-card border-l-4 border-brand-green">
      {/* Regulation label */}
      <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
        {regulation}
      </p>

      {/* Phosra feature name */}
      <p className="text-base font-semibold text-foreground mt-1">
        {phosraFeature}
      </p>

      {/* Optional rule category badge */}
      {ruleCategory && (
        <span className="inline-block text-[10px] font-mono bg-muted px-2 py-0.5 rounded mt-1.5">
          {ruleCategory}
        </span>
      )}

      {/* Description */}
      <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
        {description}
      </p>
    </div>
  )
}
