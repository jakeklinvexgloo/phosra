interface SideBySideLayoutProps {
  left: React.ReactNode
  right: React.ReactNode
}

export function SideBySideLayout({ left, right }: SideBySideLayoutProps) {
  return (
    <div className="flex gap-8 items-start">
      {/* Left: params/description */}
      <div className="flex-1 min-w-0">
        {left}
      </div>
      {/* Right: sticky code panel */}
      <div className="flex-1 min-w-0 sticky top-[120px]">
        {right}
      </div>
    </div>
  )
}
