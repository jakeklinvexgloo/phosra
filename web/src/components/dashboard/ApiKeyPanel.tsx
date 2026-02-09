"use client"

import { useState } from "react"
import { Copy, Check, Eye, EyeOff, RotateCw } from "lucide-react"
import { toast } from "@/hooks/use-toast"

// Mock API key for demo — in production this comes from the backend
const MOCK_KEY = "sk_live_phosra_a8f2b91c4d3e7f6a0b5c2d9e"
const MOCK_TEST_KEY = "sk_test_phosra_x7y3z8w2v1u0t9s6"

export function ApiKeyPanel() {
  const [revealed, setRevealed] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isLive, setIsLive] = useState(true)

  const key = isLive ? MOCK_KEY : MOCK_TEST_KEY

  const maskedKey = key.slice(0, 12) + "••••••••" + key.slice(-4)

  const handleCopy = () => {
    navigator.clipboard.writeText(key)
    setCopied(true)
    toast({ title: "API key copied", variant: "success" })
    setTimeout(() => setCopied(false), 2000)
  }

  const handleRegenerate = () => {
    toast({ title: "API key regenerated", description: "Your old key has been revoked.", variant: "success" })
  }

  return (
    <div className="plaid-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="section-header">API Keys</h3>
        <div className="flex items-center gap-1 bg-muted rounded-full p-0.5">
          <button
            onClick={() => setIsLive(true)}
            className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
              isLive ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            Live
          </button>
          <button
            onClick={() => setIsLive(false)}
            className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
              !isLive ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            Test
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 bg-muted/50 border border-border rounded-lg px-4 py-3">
        <code className="flex-1 text-sm font-mono text-foreground truncate">
          {revealed ? key : maskedKey}
        </code>
        <button
          onClick={() => setRevealed(!revealed)}
          className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
          title={revealed ? "Hide" : "Reveal"}
        >
          {revealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
        <button
          onClick={handleCopy}
          className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
          title="Copy"
        >
          {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>

      <div className="flex items-center justify-between mt-3">
        <p className="text-xs text-muted-foreground">
          Created Jan 15, 2025 &middot; Last used 2 minutes ago
        </p>
        <button
          onClick={handleRegenerate}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <RotateCw className="w-3 h-3" />
          Regenerate
        </button>
      </div>
    </div>
  )
}
