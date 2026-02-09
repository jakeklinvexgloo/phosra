"use client"

import { X, CheckCircle2, AlertCircle } from "lucide-react"
import type { ToastData, ToastVariant } from "@/hooks/use-toast"

const variantStyles: Record<ToastVariant, string> = {
  default: "bg-card border-border text-card-foreground",
  success: "bg-card border-success/30 text-card-foreground",
  destructive: "bg-card border-destructive/30 text-card-foreground",
}

const variantIcons: Record<ToastVariant, React.ReactNode> = {
  default: null,
  success: <CheckCircle2 className="w-4 h-4 text-success shrink-0" />,
  destructive: <AlertCircle className="w-4 h-4 text-destructive shrink-0" />,
}

interface ToastProps {
  toast: ToastData
  onDismiss: (id: string) => void
}

export function Toast({ toast, onDismiss }: ToastProps) {
  const variant = toast.variant || "default"

  return (
    <div
      className={`pointer-events-auto w-full max-w-[360px] rounded-lg border shadow-lg p-4 flex items-start gap-3 animate-in slide-in-from-bottom-2 fade-in duration-200 ${variantStyles[variant]}`}
      role="alert"
    >
      {variantIcons[variant]}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{toast.title}</p>
        {toast.description && (
          <p className="text-xs text-muted-foreground mt-1">{toast.description}</p>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
