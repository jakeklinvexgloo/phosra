import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary: "bg-foreground text-background hover:bg-foreground/90",
        secondary: "bg-muted text-foreground hover:bg-muted/80",
        outline:
          "border border-border bg-background text-foreground hover:bg-muted/50",
        ghost: "text-muted-foreground hover:text-foreground hover:bg-muted/50",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        accent: "bg-purple-600 text-white hover:bg-purple-700",
        link: "text-foreground underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        sm: "h-7 px-3 text-xs",
        md: "h-8 px-4 text-sm",
        lg: "h-9 px-5 text-sm",
        icon: "h-8 w-8 p-0",
        "icon-sm": "h-7 w-7 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
)

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, loading, asChild, disabled, children, ...props },
    ref
  ) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
