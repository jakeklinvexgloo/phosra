"use client"

import { CodeBlock } from "@/components/marketing/compliance-page/CodeBlock"
import type { CodeExample } from "@/lib/compliance/types"

interface PhosraFeatureCardProps {
  regulation: string
  phosraFeature: string
  ruleCategory?: string
  description: string
  codeExample?: CodeExample
}

export function PhosraFeatureCard({
  regulation,
  phosraFeature,
  ruleCategory,
  description,
  codeExample,
}: PhosraFeatureCardProps) {
  // When code example is present, render two-panel layout
  if (codeExample) {
    return (
      <div className="plaid-card !p-0 overflow-hidden border-l-4 border-brand-green">
        <div className="grid lg:grid-cols-[2fr_3fr]">
          {/* Left — text description */}
          <div className="p-6 flex flex-col justify-center">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
              {regulation}
            </p>
            <p className="text-base font-semibold text-foreground mt-1">
              {phosraFeature}
            </p>
            {ruleCategory && (
              <span className="inline-block w-fit text-[10px] font-mono bg-muted px-2 py-0.5 rounded mt-1.5">
                {ruleCategory}
              </span>
            )}
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              {description}
            </p>
          </div>

          {/* Right — code block */}
          <div className="border-t lg:border-t-0 lg:border-l border-border">
            <CodeBlock
              title={codeExample.title}
              language={codeExample.language}
              code={codeExample.code}
              response={codeExample.response}
            />
          </div>
        </div>
      </div>
    )
  }

  // Default: original text-only card
  return (
    <div className="plaid-card border-l-4 border-brand-green">
      <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
        {regulation}
      </p>
      <p className="text-base font-semibold text-foreground mt-1">
        {phosraFeature}
      </p>
      {ruleCategory && (
        <span className="inline-block text-[10px] font-mono bg-muted px-2 py-0.5 rounded mt-1.5">
          {ruleCategory}
        </span>
      )}
      <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
        {description}
      </p>
    </div>
  )
}
