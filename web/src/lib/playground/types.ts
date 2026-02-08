// Playground event types streamed via SSE from the API route

export interface HttpCapture {
  method: string
  url: string
  headers: Record<string, string>
  body?: unknown
  status?: number
  latency_ms?: number
}

export type PlaygroundEvent =
  | { type: "text_delta"; content: string }
  | { type: "tool_call_start"; id: string; name: string; input: Record<string, unknown> }
  | { type: "tool_call_http"; id: string; request: HttpCapture; response: HttpCapture }
  | { type: "tool_call_end"; id: string; result: unknown }
  | { type: "message_end"; usage: { input_tokens: number; output_tokens: number } }
  | { type: "state_update"; state: SandboxState }
  | { type: "error"; message: string }

export interface SandboxState {
  families: number
  children: number
  policies: number
  rules: number
  platforms_linked: number
}

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  toolCalls?: ToolCallInfo[]
  timestamp: number
}

export interface ToolCallInfo {
  id: string
  name: string
  input: Record<string, unknown>
  result?: unknown
  http?: {
    request: HttpCapture
    response: HttpCapture
  }
  status: "pending" | "running" | "complete" | "error"
}
