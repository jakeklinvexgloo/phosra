import { cn } from "@/lib/utils"

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("animate-pulse rounded-md bg-muted", className)} />
  )
}

export function SkeletonText({ className }: SkeletonProps) {
  return <Skeleton className={cn("h-4 w-full", className)} />
}

export function SkeletonCard({ className }: SkeletonProps) {
  return (
    <div className={cn("rounded-lg border border-border p-6 space-y-3", className)}>
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-3 w-2/3" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  )
}

export function SkeletonAvatar({ className }: SkeletonProps) {
  return <Skeleton className={cn("h-8 w-8 rounded-full", className)} />
}

/** Full dashboard skeleton for initial loading state */
export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar skeleton */}
      <div className="hidden lg:flex w-[320px] border-r border-border bg-sidebar flex-col shrink-0">
        <div className="h-24 px-6 flex items-center border-b border-border">
          <Skeleton className="h-6 w-24" />
        </div>
        <div className="p-3 space-y-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2">
              <Skeleton className="h-[18px] w-[18px] rounded" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
          <div className="pt-4">
            <Skeleton className="h-3 w-28 mx-3 mb-3" />
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2">
                <Skeleton className="h-[18px] w-[18px] rounded" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1">
        {/* Header skeleton */}
        <div className="h-16 lg:h-24 border-b border-border bg-background flex items-center justify-between px-4 lg:px-8">
          <Skeleton className="h-9 w-64 rounded-md" />
          <div className="flex items-center gap-3">
            <SkeletonAvatar />
            <Skeleton className="h-4 w-20 hidden sm:block" />
          </div>
        </div>

        {/* Content skeleton */}
        <div className="max-w-[960px] px-4 sm:px-8 lg:px-12 py-6 sm:py-10 space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-5 w-96" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
