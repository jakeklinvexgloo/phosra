"use client"

import { useState, useEffect, FormEvent } from "react"
import { X, Loader2, CheckCircle } from "lucide-react"

interface InterestModalProps {
  open: boolean
  onClose: () => void
}

type FormState = "idle" | "submitting" | "success" | "error"

export function InterestModal({ open, onClose }: InterestModalProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [company, setCompany] = useState("")
  const [title, setTitle] = useState("")
  const [intro, setIntro] = useState("")
  const [state, setState] = useState<FormState>("idle")
  const [errorMsg, setErrorMsg] = useState("")

  // Lock body scroll when open
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden"
    else document.body.style.overflow = ""
    return () => { document.body.style.overflow = "" }
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [open, onClose])

  if (!open) return null

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setState("submitting")
    setErrorMsg("")

    try {
      const res = await fetch("/api/investors/interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, company, title, intro }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Something went wrong.")
      }

      setState("success")
    } catch (err: unknown) {
      setState("error")
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.")
    }
  }

  function handleClose() {
    if (state === "success") {
      setName("")
      setEmail("")
      setCompany("")
      setTitle("")
      setIntro("")
      setState("idle")
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-background border border-border rounded-xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <div>
            <h2 className="text-lg font-display font-semibold text-foreground">
              Request Access
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Investor data room &amp; materials
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {state === "success" ? (
          <div className="px-6 py-12 text-center">
            <CheckCircle className="w-10 h-10 text-brand-green mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Request received
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              We&apos;ll review your request and follow up within 48 hours.
            </p>
            <button
              onClick={handleClose}
              className="mt-8 px-5 py-2.5 bg-brand-green text-[#0D1B2A] font-semibold rounded-lg hover:bg-brand-green/90 transition-colors text-sm"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 pb-6 pt-4 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="plaid-input text-sm"
                  placeholder="Jane Smith"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="plaid-input text-sm"
                  placeholder="jane@firm.vc"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Company
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="plaid-input text-sm"
                  placeholder="Acme Ventures"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Title / Role
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="plaid-input text-sm"
                  placeholder="Partner"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                How were you introduced to Phosra?
              </label>
              <textarea
                value={intro}
                onChange={(e) => setIntro(e.target.value)}
                rows={3}
                className="plaid-input text-sm resize-none"
                placeholder="Optional — referral source, how you heard about us, etc."
              />
            </div>

            {state === "error" && (
              <p className="text-sm text-red-500">{errorMsg}</p>
            )}

            <button
              type="submit"
              disabled={state === "submitting"}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-brand-green text-[#0D1B2A] font-semibold rounded-lg hover:bg-brand-green/90 transition-colors text-sm disabled:opacity-60"
            >
              {state === "submitting" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Submit Request"
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
