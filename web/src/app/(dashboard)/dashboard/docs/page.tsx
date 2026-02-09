"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function DashboardDocsPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/docs")
  }, [router])

  return (
    <div className="flex items-center justify-center py-20">
      <p className="text-muted-foreground text-sm">Redirecting to docs...</p>
    </div>
  )
}
