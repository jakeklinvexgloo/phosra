"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Scale,
  Loader2,
  CheckCircle2,
  Clock,
  AlertCircle,
  DollarSign,
  FileText,
  X,
} from "lucide-react"

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface SafeRecord {
  id: string
  investor_phone: string
  investor_name: string
  investor_email: string
  investor_company: string
  investment_amount_cents: string
  valuation_cap_cents: string
  status: string
  investor_signed_at: string | null
  company_signed_at: string | null
  created_at: string
}

interface SafeStats {
  total: number
  totalCommittedCents: number
  pending: number
  investorSigned: number
  countersigned: number
  voided: number
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function fmtDollars(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100)
}

function statusBadge(status: string) {
  switch (status) {
    case "pending_investor":
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
          <Clock className="w-2.5 h-2.5" />
          Pending
        </span>
      )
    case "investor_signed":
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
          <FileText className="w-2.5 h-2.5" />
          Signed
        </span>
      )
    case "countersigned":
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400">
          <CheckCircle2 className="w-2.5 h-2.5" />
          Executed
        </span>
      )
    case "voided":
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400">
          <X className="w-2.5 h-2.5" />
          Voided
        </span>
      )
    default:
      return <span className="text-xs text-muted-foreground">{status}</span>
  }
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function SafeManagement() {
  const [safes, setSafes] = useState<SafeRecord[]>([])
  const [stats, setStats] = useState<SafeStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [confirmAction, setConfirmAction] = useState<{
    safeId: string
    action: "countersign" | "void"
  } | null>(null)

  const headers = useCallback((extra?: Record<string, string>) => {
    const h: Record<string, string> = { "Content-Type": "application/json", ...extra }
    const sandbox = process.env.NEXT_PUBLIC_SANDBOX_MODE === "true" && typeof window !== "undefined" ? localStorage.getItem("sandbox-session") : null
    if (sandbox) h["X-Sandbox-Session"] = sandbox
    return h
  }, [])

  const fetchSafes = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/investors/admin/safe", { headers: headers() })
      if (res.ok) {
        const data = await res.json()
        setSafes(data.safes || [])
        setStats(data.stats || null)
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [headers])

  useEffect(() => {
    fetchSafes()
  }, [fetchSafes])

  const handleAction = async (safeId: string, action: "countersign" | "void") => {
    if (!confirmAction || confirmAction.safeId !== safeId || confirmAction.action !== action) {
      setConfirmAction({ safeId, action })
      return
    }
    setConfirmAction(null)
    setActionLoading(safeId)
    try {
      const res = await fetch("/api/investors/admin/safe", {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ safeId, action }),
      })
      if (res.ok) {
        fetchSafes()
      }
    } catch {
      // silently fail
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Scale className="w-5 h-5 text-brand-green" />
        <h3 className="text-sm font-semibold text-foreground">SAFE Agreements</h3>
      </div>

      {/* Stats bar */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="plaid-card !py-3 text-center">
            <div className="text-lg font-semibold text-foreground tabular-nums">{stats.total}</div>
            <div className="text-[10px] text-muted-foreground">Total SAFEs</div>
          </div>
          <div className="plaid-card !py-3 text-center">
            <div className="text-lg font-semibold text-brand-green tabular-nums">
              {fmtDollars(stats.totalCommittedCents)}
            </div>
            <div className="text-[10px] text-muted-foreground">Committed</div>
          </div>
          <div className="plaid-card !py-3 text-center">
            <div className="text-lg font-semibold text-amber-500 tabular-nums">{stats.pending}</div>
            <div className="text-[10px] text-muted-foreground">Pending</div>
          </div>
          <div className="plaid-card !py-3 text-center">
            <div className="text-lg font-semibold text-blue-500 tabular-nums">{stats.investorSigned}</div>
            <div className="text-[10px] text-muted-foreground">Awaiting Countersign</div>
          </div>
          <div className="plaid-card !py-3 text-center">
            <div className="text-lg font-semibold text-green-500 tabular-nums">{stats.countersigned}</div>
            <div className="text-[10px] text-muted-foreground">Executed</div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="plaid-card p-0 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : safes.length === 0 ? (
          <div className="text-center py-12">
            <Scale className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No SAFE agreements yet</p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Investors can create and sign SAFEs from the portal
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2.5 px-4 text-muted-foreground font-medium">Investor</th>
                  <th className="text-left py-2.5 px-4 text-muted-foreground font-medium">Company</th>
                  <th className="text-right py-2.5 px-4 text-muted-foreground font-medium">Amount</th>
                  <th className="text-left py-2.5 px-4 text-muted-foreground font-medium">Status</th>
                  <th className="text-left py-2.5 px-4 text-muted-foreground font-medium">Signed</th>
                  <th className="text-right py-2.5 px-4 text-muted-foreground font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {safes.map((s) => (
                  <tr key={s.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="py-2.5 px-4">
                      <div className="text-foreground font-medium">{s.investor_name}</div>
                      <div className="text-muted-foreground text-[10px]">{s.investor_email}</div>
                    </td>
                    <td className="py-2.5 px-4 text-muted-foreground">{s.investor_company || "—"}</td>
                    <td className="py-2.5 px-4 text-foreground font-medium tabular-nums text-right">
                      {fmtDollars(parseInt(s.investment_amount_cents, 10))}
                    </td>
                    <td className="py-2.5 px-4">{statusBadge(s.status)}</td>
                    <td className="py-2.5 px-4 text-muted-foreground">
                      {s.investor_signed_at
                        ? new Date(s.investor_signed_at).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      {actionLoading === s.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground inline" />
                      ) : confirmAction?.safeId === s.id ? (
                        <div className="inline-flex items-center gap-1">
                          <span className="text-[10px] text-muted-foreground mr-1">
                            {confirmAction.action === "countersign" ? "Countersign?" : "Void?"}
                          </span>
                          <button
                            onClick={() => handleAction(s.id, confirmAction.action)}
                            className={`text-[10px] font-medium px-2 py-1 rounded transition-colors ${
                              confirmAction.action === "countersign"
                                ? "text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20"
                                : "text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                            }`}
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => setConfirmAction(null)}
                            className="text-[10px] font-medium px-2 py-1 rounded text-muted-foreground hover:bg-muted/60 transition-colors"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1">
                          {s.status === "investor_signed" && (
                            <button
                              onClick={() => handleAction(s.id, "countersign")}
                              className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20 transition-colors"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              Countersign
                            </button>
                          )}
                          {s.status !== "voided" && s.status !== "countersigned" && (
                            <button
                              onClick={() => handleAction(s.id, "void")}
                              className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
                            >
                              <AlertCircle className="w-3 h-3" />
                              Void
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
