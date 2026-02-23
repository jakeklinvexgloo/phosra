/**
 * Shared types for the Phosra MCP server.
 */

/** A single MCP tool definition that maps 1:1 to a Phosra REST endpoint. */
export interface ToolDefinition {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
  http: {
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
    path: string; // with {param} placeholders
  };
}

/** Configuration required to connect to the Phosra API. */
export interface PhosraConfig {
  apiKey: string;
  baseUrl: string;
}
