/**
 * HTTP execution layer for Phosra MCP tools.
 *
 * Each tool call is resolved to an HTTP request against the Phosra REST API,
 * executed via fetch(), and the response returned as a plain JSON object.
 */

import type { ToolDefinition, PhosraConfig } from "./types.js";
import { resolveToolPath } from "./tools.js";

/** The result returned from every tool execution. */
export interface ToolCallResult {
  /** True when the HTTP call returned a 2xx status. */
  ok: boolean;
  /** HTTP status code (0 if the request failed entirely). */
  status: number;
  /** Parsed response body (JSON object, or error object). */
  data: unknown;
}

/**
 * Execute a single tool call against the Phosra API.
 *
 * Never throws -- returns an error-shaped result on failure so the LLM
 * always receives structured feedback.
 */
export async function executeToolCall(
  toolDef: ToolDefinition,
  input: Record<string, unknown>,
  config: PhosraConfig
): Promise<ToolCallResult> {
  const { path, query, body } = resolveToolPath(toolDef, input);

  let url = `${config.baseUrl}${path}`;
  const queryStr = new URLSearchParams(query).toString();
  if (queryStr) url += `?${queryStr}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${config.apiKey}`,
  };

  const fetchOpts: RequestInit = {
    method: toolDef.http.method,
    headers,
  };

  if (body) {
    fetchOpts.body = JSON.stringify(body);
  }

  try {
    const res = await fetch(url, fetchOpts);
    const text = await res.text();

    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }

    return { ok: res.ok, status: res.status, data };
  } catch (err) {
    return {
      ok: false,
      status: 0,
      data: {
        error: "request_failed",
        message: err instanceof Error ? err.message : String(err),
      },
    };
  }
}
