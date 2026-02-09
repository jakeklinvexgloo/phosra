interface SideBySideLayoutProps {
  left: React.ReactNode
  right: React.ReactNode
}

export function SideBySideLayout({ left, right }: SideBySideLayoutProps) {
  return (
    <div className="flex flex-col xl:flex-row gap-6 xl:gap-8 items-start">
      {/* Left: params/description — takes up ~55% on wide screens */}
      <div className="w-full xl:w-[55%] min-w-0">
        {left}
      </div>
      {/* Right: code panel — takes up ~45%, sticky */}
      <div className="w-full xl:w-[45%] min-w-0 xl:sticky xl:top-[120px]">
        {right}
      </div>
    </div>
  )
}
