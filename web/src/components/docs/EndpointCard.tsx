"use client"

import { MethodBadge } from "./MethodBadge"
import { CodePanel } from "./CodePanel"
import { ParamTable, type FieldDef } from "./ParamTable"
import { SideBySideLayout } from "./SideBySideLayout"

export interface EndpointDef {
  id: string
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
  path: string
  section: string
  summary: string
  description: string
  requestFields?: FieldDef[]
  responseFields?: FieldDef[]
  curlExample: string
  responseExample: string
}

export function EndpointCard({ endpoint }: { endpoint: EndpointDef }) {
  return (
    <div id={endpoint.id} className="py-8 border-b border-border/40 last:border-b-0">
      {/* Endpoint heading */}
      <div className="flex items-center gap-3 mb-2">
        <MethodBadge method={endpoint.method} />
        <code className="text-[16px] font-semibold font-mono text-foreground">
          {endpoint.path}
        </code>
      </div>

      {/* Summary */}
      <p className="text-[14px] text-muted-foreground mb-6 max-w-xl leading-relaxed">
        {endpoint.description}
      </p>

      {/* Side-by-side: params left, code right */}
      <SideBySideLayout
        left={
          <div className="space-y-6">
            {endpoint.requestFields && endpoint.requestFields.length > 0 && (
              <ParamTable fields={endpoint.requestFields} title="Request fields" />
            )}
            {endpoint.responseFields && endpoint.responseFields.length > 0 && (
              <ParamTable fields={endpoint.responseFields} title="Response fields" />
            )}
          </div>
        }
        right={
          <div className="space-y-4">
            <CodePanel
              title="Request"
              code={endpoint.curlExample}
              language="curl"
            />
            {endpoint.responseExample && (
              <CodePanel
                title="Response"
                code={endpoint.responseExample}
                language="json"
              />
            )}
          </div>
        }
      />
    </div>
  )
}
