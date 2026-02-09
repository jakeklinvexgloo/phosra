"use client"

interface LegalSectionProps {
  id: string
  number: number
  title: string
  content: string
}

export function LegalSection({ id, number, title, content }: LegalSectionProps) {
  const paragraphs = content.split("\n\n")

  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="text-lg font-semibold text-foreground mb-3">
        {number}. {title}
      </h2>
      {paragraphs.map((paragraph, i) => (
        <p
          key={i}
          className="text-sm text-muted-foreground leading-relaxed mb-4"
        >
          {paragraph}
        </p>
      ))}
    </section>
  )
}
