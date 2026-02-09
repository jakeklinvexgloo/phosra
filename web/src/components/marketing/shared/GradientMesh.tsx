interface GradientMeshProps {
  colors: string[]
  className?: string
}

export function GradientMesh({
  colors,
  className = "",
}: GradientMeshProps) {
  const [c1, c2, c3, c4] = [
    colors[0] || "#00D47E",
    colors[1] || "#26A8C9",
    colors[2] || "#7B5CB8",
    colors[3] || colors[0] || "#00D47E",
  ]

  return (
    <div
      className={`absolute inset-0 pointer-events-none ${className}`}
      aria-hidden="true"
      style={{
        background: `
          radial-gradient(ellipse 80% 60% at 15% 20%, ${c1}25 0%, transparent 55%),
          radial-gradient(ellipse 70% 50% at 85% 25%, ${c2}20 0%, transparent 50%),
          radial-gradient(ellipse 60% 70% at 50% 80%, ${c3}20 0%, transparent 55%),
          radial-gradient(ellipse 50% 40% at 80% 70%, ${c4}15 0%, transparent 45%)
        `,
        willChange: "transform",
      }}
    />
  )
}
