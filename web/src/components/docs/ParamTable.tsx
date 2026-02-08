"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"

export interface FieldDef {
  name: string
  type: string
  required?: boolean
  description: string
  children?: FieldDef[]
}

interface ParamTableProps {
  fields: FieldDef[]
  title?: string
}

function FieldRow({ field, depth = 0 }: { field: FieldDef; depth?: number }) {
  const [expanded, setExpanded] = useState(false)
  const hasChildren = field.children && field.children.length > 0
  const indent = depth * 20

  return (
    <>
      <div
        className="group border-b border-border/30 last:border-b-0"
        style={{ paddingLeft: indent }}
      >
        <div className="flex items-start justify-between py-3 px-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {hasChildren && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="flex items-center text-muted-foreground hover:text-foreground transition-colors -ml-1"
                >
                  {expanded ? (
                    <ChevronDown className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5" />
                  )}
                </button>
              )}
              <code className="text-[13px] font-semibold font-mono text-foreground">
                {field.name}
              </code>
            </div>
            <p className="text-[12px] text-muted-foreground mt-1 leading-relaxed">
              {field.description}
            </p>
          </div>
          <div className="flex items-center gap-2 ml-4 flex-shrink-0 mt-0.5">
            <span className="text-[11px] text-muted-foreground font-mono">{field.type}</span>
            {field.required && (
              <span className="text-[10px] font-bold text-amber-600 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded">
                required
              </span>
            )}
          </div>
        </div>
      </div>
      {hasChildren && expanded && field.children!.map((child) => (
        <FieldRow key={child.name} field={child} depth={depth + 1} />
      ))}
    </>
  )
}

export function ParamTable({ fields, title }: ParamTableProps) {
  if (fields.length === 0) return null

  return (
    <div>
      {title && (
        <h4 className="text-[13px] font-semibold text-foreground mb-3 tracking-wide uppercase">
          {title}
        </h4>
      )}
      <div className="border border-border/50 rounded-lg overflow-hidden">
        {fields.map((field) => (
          <FieldRow key={field.name} field={field} />
        ))}
      </div>
    </div>
  )
}
