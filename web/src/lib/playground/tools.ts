// Re-export canonical tool definitions from @phosra/mcp.
// This file previously contained a duplicated copy of the tools array.
// The single source of truth now lives in packages/mcp-server/src/tools.ts.

export { TOOLS, toAnthropicTools, resolveToolPath } from "@phosra/mcp/tools"
export type { ToolDefinition } from "@phosra/mcp/tools"
