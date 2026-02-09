/**
 * AI SDK v6 tool adapter.
 *
 * Converts the existing TOOLS array (JSON-schema definitions + HTTP metadata)
 * into the record-of-tools format that `streamText()` expects.
 *
 * Each tool's `execute` function:
 *   1. Calls the real Phosra REST API (via the same `resolveToolPath` helper)
 *   2. Returns a JSON-serialisable result so Claude can reason over it
 *   3. Stashes the HTTP capture (req + res) in a side-channel so the
 *      frontend Inspector panel can display them.
 */

import { jsonSchema, type ToolSet } from "ai"
import { TOOLS, resolveToolPath, type ToolDefinition } from "./tools"
import type { HttpCapture } from "./types"

// ── Types ────────────────────────────────────────────

export interface ToolHttpCapture {
  toolCallId: string
  name: string
  input: Record<string, unknown>
  request: HttpCapture
  response: HttpCapture
}

// ── Build the tool record ────────────────────────────

const API_BASE = process.env.PHOSRA_API_URL || "http://localhost:8080/api/v1"

/**
 * Returns AI SDK tools keyed by name.
 *
 * @param sandboxToken  Bearer token for the Phosra API sandbox
 * @param onHttpCapture Called after each tool executes, carrying the HTTP
 *                      request/response pair so the route can stream it
 *                      to the Inspector panel.
 */
export function buildTools(
  sandboxToken: string,
  onHttpCapture: (capture: ToolHttpCapture) => void
) {
  const toolRecord: ToolSet = {}

  for (const def of TOOLS) {
    toolRecord[def.name] = {
      description: def.description,
      inputSchema: jsonSchema<Record<string, unknown>>(
        def.input_schema as Parameters<typeof jsonSchema>[0]
      ),
      execute: async (
        input: Record<string, unknown>,
        { toolCallId }: { toolCallId: string }
      ) => {
        const { result, httpReq, httpRes } = await executeToolCall(
          def,
          input,
          sandboxToken
        )

        // Side-channel: emit HTTP capture for Inspector panel
        onHttpCapture({
          toolCallId,
          name: def.name,
          input,
          request: httpReq,
          response: httpRes,
        })

        return result
      },
    }
  }

  return toolRecord
}

// ── HTTP execution (carried over from the old route) ──

async function executeToolCall(
  toolDef: ToolDefinition,
  input: Record<string, unknown>,
  token: string
): Promise<{ result: unknown; httpReq: HttpCapture; httpRes: HttpCapture }> {
  const { path, query, body } = resolveToolPath(toolDef, input)

  let url = `${API_BASE}${path}`
  const queryStr = new URLSearchParams(query).toString()
  if (queryStr) url += `?${queryStr}`

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    "X-Sandbox-Session": token.replace("sandbox-", ""),
  }

  const fetchOpts: RequestInit = {
    method: toolDef.http.method,
    headers,
  }
  if (body) {
    fetchOpts.body = JSON.stringify(body)
  }

  const httpReq: HttpCapture = {
    method: toolDef.http.method,
    url,
    headers: { ...headers, Authorization: "Bearer $SANDBOX_TOKEN" },
    body: body ?? undefined,
  }

  const start = Date.now()
  let result: unknown
  let status = 0

  try {
    const res = await fetch(url, fetchOpts)
    status = res.status
    const text = await res.text()
    try {
      result = JSON.parse(text)
    } catch {
      result = text
    }
  } catch (err) {
    result = { error: String(err) }
    status = 0
  }

  const httpRes: HttpCapture = {
    method: toolDef.http.method,
    url,
    headers: {},
    body: result,
    status,
    latency_ms: Date.now() - start,
  }

  return { result, httpReq, httpRes }
}
