"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { api } from "@/lib/api"
import { useApi } from "@/lib/useApi"

export default function GoogleOAuthCallback() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { getToken } = useApi()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const code = searchParams.get("code")
    const error = searchParams.get("error")

    if (error) {
      setStatus("error")
      setMessage(`Google OAuth error: ${error}`)
      return
    }

    if (!code) {
      setStatus("error")
      setMessage("No authorization code received from Google.")
      return
    }

    async function exchangeCode() {
      try {
        const token = (await getToken()) ?? undefined
        const result = await api.submitGoogleCallback(code!, token)
        setStatus("success")
        setMessage(`Connected as ${result.email}`)
        // Redirect to Gmail page after 2 seconds
        setTimeout(() => router.push("/dashboard/admin/gmail"), 2000)
      } catch (err: unknown) {
        setStatus("error")
        setMessage(err instanceof Error ? err.message : "Failed to connect Google account")
      }
    }

    exchangeCode()
  }, [searchParams, getToken, router])

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="plaid-card max-w-md w-full text-center py-12">
        {status === "loading" && (
          <>
            <Loader2 className="w-8 h-8 text-muted-foreground animate-spin mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-foreground mb-2">Connecting Google Account</h2>
            <p className="text-sm text-muted-foreground">Exchanging authorization code...</p>
          </>
        )}
        {status === "success" && (
          <>
            <CheckCircle2 className="w-8 h-8 text-brand-green mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-foreground mb-2">Connected!</h2>
            <p className="text-sm text-muted-foreground">{message}</p>
            <p className="text-xs text-muted-foreground/60 mt-2">Redirecting to Gmail...</p>
          </>
        )}
        {status === "error" && (
          <>
            <XCircle className="w-8 h-8 text-destructive mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-foreground mb-2">Connection Failed</h2>
            <p className="text-sm text-muted-foreground mb-4">{message}</p>
            <button
              onClick={() => router.push("/dashboard/admin/gmail")}
              className="text-sm text-foreground underline hover:no-underline"
            >
              Go back to Gmail
            </button>
          </>
        )}
      </div>
    </div>
  )
}
