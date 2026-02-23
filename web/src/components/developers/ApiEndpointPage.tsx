import { MethodBadge } from "@/components/docs/MethodBadge"
import { ParamTable, type FieldDef } from "@/components/docs/ParamTable"
import { SideBySideLayout } from "@/components/docs/SideBySideLayout"
import { CodePanel } from "@/components/docs/CodePanel"
import type { ApiEndpoint } from "@/lib/developers/openapi-types"

interface ApiEndpointPageProps {
  endpoint: ApiEndpoint
}

export function ApiEndpointPage({ endpoint }: ApiEndpointPageProps) {
  // Convert ApiField[] to FieldDef[] (they're compatible)
  const requestFields: FieldDef[] = endpoint.requestBody?.fields || []
  const responseFields: FieldDef[] =
    endpoint.responses?.["200"]?.fields ||
    endpoint.responses?.["201"]?.fields ||
    endpoint.responses?.["202"]?.fields ||
    []
  const pathParams: FieldDef[] = endpoint.parameters
    .filter((p) => p.in === "path")
    .map((p) => ({
      name: p.name,
      type: p.type,
      required: p.required,
      description: p.description,
    }))
  const queryParams: FieldDef[] = endpoint.parameters
    .filter((p) => p.in === "query")
    .map((p) => ({
      name: p.name,
      type: p.type,
      required: p.required,
      description: p.description,
    }))

  return (
    <div className="space-y-8">
      {/* Method + Path */}
      <div className="flex items-center gap-3">
        <MethodBadge method={endpoint.method} />
        <code className="text-base font-semibold font-mono text-foreground">
          {endpoint.path}
        </code>
      </div>

      {/* Description */}
      {endpoint.description && (
        <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
          {endpoint.description}
        </p>
      )}

      {/* Auth */}
      {endpoint.auth && endpoint.auth !== "none" && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Auth:</span>
          <code className="bg-muted px-2 py-0.5 rounded text-xs font-mono">
            {endpoint.auth}
          </code>
        </div>
      )}

      {/* Side by side: params left, code right */}
      <SideBySideLayout
        left={
          <div className="space-y-6">
            {pathParams.length > 0 && (
              <ParamTable fields={pathParams} title="Path parameters" />
            )}
            {queryParams.length > 0 && (
              <ParamTable fields={queryParams} title="Query parameters" />
            )}
            {requestFields.length > 0 && (
              <ParamTable fields={requestFields} title="Request body" />
            )}
            {responseFields.length > 0 && (
              <ParamTable fields={responseFields} title="Response" />
            )}
          </div>
        }
        right={
          <div className="space-y-4">
            <CodePanel title="Request" code={endpoint.curlExample} language="bash" />
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
