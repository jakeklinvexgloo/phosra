"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight, Clock, CheckCircle2, XCircle, Loader2 } from "lucide-react"
import type { ToolCallInfo } from "@/lib/playground/types"
import type { EntityMap } from "@/lib/playground/entity-registry"
import { annotateInput, summarizeToolCall } from "@/lib/playground/entity-registry"

interface ToolCallCardProps {
  toolCall: ToolCallInfo
  entities: EntityMap
}

const METHOD_COLORS: Record<string, string> = {
  GET: "bg-blue-100 text-blue-700",
  POST: "bg-green-100 text-green-700",
  PUT: "bg-amber-100 text-amber-700",
  DELETE: "bg-red-100 text-red-700",
}

const ENTITY_TYPE_COLORS: Record<string, string> = {
  child: "bg-purple-100 text-purple-700",
  family: "bg-blue-100 text-blue-700",
  policy: "bg-amber-100 text-amber-700",
  enforcement_job: "bg-green-100 text-green-700",
  platform_link: "bg-cyan-100 text-cyan-700",
  rule: "bg-rose-100 text-rose-700",
  webhook: "bg-orange-100 text-orange-700",
}

export function ToolCallCard({ toolCall, entities }: ToolCallCardProps) {
  const [expanded, setExpanded] = useState(false)

  const statusIcon = {
    pending: <Loader2 className="w-3.5 h-3.5 text-muted-foreground animate-spin" />,
    running: <Loader2 className="w-3.5 h-3.5 text-brand-green animate-spin" />,
    complete: <CheckCircle2 className="w-3.5 h-3.5 text-brand-green" />,
    error: <XCircle className="w-3.5 h-3.5 text-red-500" />,
  }[toolCall.status]

  const method = toolCall.http?.request?.method || "GET"
  const latency = toolCall.http?.response?.latency_ms
  const httpStatus = toolCall.http?.response?.status
  const summary = summarizeToolCall(toolCall.name, toolCall.input, entities)
  const annotatedParams = annotateInput(toolCall.input, entities)

  return (
    <div className="border border-border rounded-lg bg-white overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-muted/50 transition-colors"
      >
        {expanded ? (
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
        )}
        {statusIcon}
        <div className="min-w-0 flex-1">
          <span className="font-mono text-xs font-medium text-foreground truncate block">
            {toolCall.name}
          </span>
          {summary && (
            <span className="text-[10px] text-muted-foreground truncate block mt-0.5">
              {summary}
            </span>
          )}
        </div>
        <span className="ml-auto flex items-center gap-2 flex-shrink-0">
          {method && (
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${METHOD_COLORS[method] || "bg-gray-100 text-gray-600"}`}
            >
              {method}
            </span>
          )}
          {httpStatus && (
            <span
              className={`text-[10px] font-mono ${httpStatus < 400 ? "text-green-600" : "text-red-500"}`}
            >
              {httpStatus}
            </span>
          )}
          {latency != null && (
            <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
              <Clock className="w-2.5 h-2.5" />
              {latency}ms
            </span>
          )}
        </span>
      </button>

      {expanded && (
        <div className="border-t border-border px-3 py-2 space-y-3 max-h-[400px] overflow-auto">
          {/* Annotated Input */}
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-1">
              Input
            </p>
            {annotatedParams.length === 0 ? (
              <p className="text-[11px] font-mono text-muted-foreground italic">No parameters</p>
            ) : (
              <div className="space-y-1">
                {annotatedParams.map((param) => (
                  <div key={param.key} className="flex items-start gap-1.5 text-[11px] font-mono">
                    <span className="text-muted-foreground flex-shrink-0">{param.key}:</span>
                    <div className="min-w-0">
                      {param.entity ? (
                        <span className="inline-flex items-center gap-1 flex-wrap">
                          <span
                            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${
                              ENTITY_TYPE_COLORS[param.entity.type] || "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {param.entity.label}
                            {param.entity.detail && (
                              <span className="opacity-70">({param.entity.detail})</span>
                            )}
                          </span>
                          <span className="text-muted-foreground/50 text-[9px] truncate max-w-[180px]">
                            {String(param.value)}
                          </span>
                        </span>
                      ) : (
                        <span className="text-foreground break-all">
                          {typeof param.value === "string"
                            ? `"${param.value}"`
                            : JSON.stringify(param.value)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* HTTP Request */}
          {toolCall.http?.request && (
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-1">
                HTTP Request
              </p>
              <div className="text-[11px] font-mono bg-slate-50 p-2 rounded overflow-x-auto">
                <span className={`font-bold ${METHOD_COLORS[method]?.split(" ")[1] || ""}`}>
                  {method}
                </span>{" "}
                {toolCall.http.request.url}
                {toolCall.http.request.body != null && (
                  <pre className="mt-1 text-muted-foreground">
                    {JSON.stringify(toolCall.http.request.body as Record<string, unknown>, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          )}

          {/* HTTP Response */}
          {toolCall.http?.response && (
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-1">
                Response ({httpStatus})
              </p>
              <pre className="text-[11px] font-mono bg-slate-50 p-2 rounded overflow-x-auto max-h-[200px]">
                {JSON.stringify(toolCall.http.response.body, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
