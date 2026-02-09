import { useState, useCallback } from "react"

export type ToastVariant = "default" | "success" | "destructive"

export interface ToastData {
  id: string
  title: string
  description?: string
  variant?: ToastVariant
}

let toastCount = 0
const listeners: Array<(toast: ToastData) => void> = []

export function toast({ title, description, variant = "default" }: Omit<ToastData, "id">) {
  const id = `toast-${++toastCount}`
  const data: ToastData = { id, title, description, variant }
  listeners.forEach((listener) => listener(data))
  return id
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastData[]>([])

  const addToast = useCallback((data: ToastData) => {
    setToasts((prev) => [...prev.slice(-2), data]) // Keep max 3
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== data.id))
    }, 4000)
  }, [])

  // Register listener on first render
  useState(() => {
    listeners.push(addToast)
    return () => {
      const index = listeners.indexOf(addToast)
      if (index > -1) listeners.splice(index, 1)
    }
  })

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return { toasts, dismiss }
}
