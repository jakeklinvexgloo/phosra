"use client"

import { useState } from "react"
import { Activity, Code2 } from "lucide-react"
import { ToolCallCard } from "./ToolCallCard"
import type { ToolCallInfo, HttpCapture } from "@/lib/playground/types"
import type { EntityMap } from "@/lib/playground/entity-registry"
import { toCurl, toJavaScript, toGo } from "@/lib/playground/codegen"

interface InspectorPanelProps {
  toolCalls: ToolCallInfo[]
  entities: EntityMap
}

type Tab = "timeline" | "code"
type CodeLang = "curl" | "javascript" | "go"

export function InspectorPanel({ toolCalls, entities }: InspectorPanelProps) {
  const [tab, setTab] = useState<Tab>("timeline")
  const [codeLang, setCodeLang] = useState<CodeLang>("curl")

  const tabs: { id: Tab; label: string; icon: typeof Activity }[] = [
    { id: "timeline", label: "Timeline", icon: Activity },
    { id: "code", label: "Code", icon: Code2 },
  ]

  return (
    <div className="h-full flex flex-col bg-sidebar">
      {/* Tab bar */}
      <div className="flex items-center border-b border-border px-4 h-12 gap-1 flex-shrink-0">
        {tabs.map((t) => {
          const Icon = t.icon
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                tab === t.id
                  ? "bg-white text-foreground border border-border shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          )
        })}
        {toolCalls.length > 0 && (
          <span className="ml-auto text-[10px] text-muted-foreground">
            {toolCalls.length} call{toolCalls.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {toolCalls.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <Activity className="w-8 h-8 mb-3 opacity-30" />
            <p className="text-sm">No tool calls yet</p>
            <p className="text-xs mt-1">
              Send a message and watch API calls appear here in real-time
            </p>
          </div>
        ) : tab === "timeline" ? (
          <div className="space-y-2">
            {toolCalls.map((tc) => (
              <ToolCallCard key={tc.id} toolCall={tc} entities={entities} />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {/* Language selector */}
            <div className="flex gap-1">
              {(["curl", "javascript", "go"] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setCodeLang(lang)}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                    codeLang === lang
                      ? "bg-white text-foreground border border-border shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {lang === "curl" ? "cURL" : lang === "javascript" ? "JavaScript" : "Go"}
                </button>
              ))}
            </div>

            {/* Code for each tool call */}
            {toolCalls
              .filter((tc) => tc.http?.request)
              .map((tc) => {
                const req = tc.http!.request
                const code =
                  codeLang === "curl"
                    ? toCurl(req)
                    : codeLang === "javascript"
                      ? toJavaScript(req)
                      : toGo(req)
                return (
                  <div key={tc.id} className="space-y-1">
                    <p className="text-[10px] font-mono text-muted-foreground">
                      # {tc.name}
                    </p>
                    <pre className="text-[11px] font-mono bg-slate-900 text-slate-100 p-3 rounded-lg overflow-x-auto">
                      {code}
                    </pre>
                  </div>
                )
              })}
          </div>
        )}
      </div>
    </div>
  )
}
