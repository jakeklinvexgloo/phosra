"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function DashboardDocsRedirect({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  useEffect(() => {
    router.replace("/docs")
  }, [router])
  return null
}
