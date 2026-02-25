import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full font-medium",
  {
    variants: {
      variant: {
        default: "bg-muted text-muted-foreground",
        success:
          "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
        warning:
          "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
        destructive:
          "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400",
        info: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
        brand: "bg-brand-green/10 text-brand-green",
        outline: "bg-transparent border border-border text-muted-foreground",
        purple:
          "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400",
        pink: "bg-pink-50 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400",
        orange:
          "bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400",
      },
      size: {
        sm: "text-[9px] px-1.5 py-0.5",
        md: "text-[10px] px-2 py-0.5",
        lg: "text-xs px-2.5 py-1",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean
  dotPulse?: boolean
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, dot, dotPulse, children, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full bg-current",
            dotPulse && "animate-pulse"
          )}
        />
      )}
      {children}
    </span>
  )
)
Badge.displayName = "Badge"

export { Badge, badgeVariants }
