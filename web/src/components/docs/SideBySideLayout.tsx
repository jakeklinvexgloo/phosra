interface SideBySideLayoutProps {
  left: React.ReactNode
  right: React.ReactNode
}

export function SideBySideLayout({ left, right }: SideBySideLayoutProps) {
  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
      {/* Left: params/description */}
      <div className="w-full lg:flex-1 min-w-0">
        {left}
      </div>
      {/* Right: sticky code panel */}
      <div className="w-full lg:flex-1 min-w-0 lg:sticky lg:top-[120px]">
        {right}
      </div>
    </div>
  )
}
