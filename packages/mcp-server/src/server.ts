/**
 * MCP server factory for Phosra.
 *
 * Registers all 42 Phosra tools with the MCP SDK so that any
 * MCP-compatible client (Claude Desktop, Cursor, etc.) can call them.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z, type ZodTypeAny } from "zod";
import { TOOLS } from "./tools.js";
import { executeToolCall } from "./api-client.js";
import type { PhosraConfig } from "./types.js";

// -- JSON Schema to Zod conversion ----------------------------------

interface JsonSchemaProp {
  type?: string;
  description?: string;
  enum?: string[];
  items?: JsonSchemaProp;
}

/**
 * Convert a single JSON Schema property descriptor to a Zod schema.
 *
 * Handles the types that appear in the Phosra tool definitions:
 *   string, integer, number, boolean, array, object
 */
function jsonSchemaToZod(prop: JsonSchemaProp): ZodTypeAny {
  let schema: ZodTypeAny;

  switch (prop.type) {
    case "string":
      if (prop.enum && prop.enum.length > 0) {
        // z.enum requires at least one element
        schema = z.enum(prop.enum as [string, ...string[]]);
      } else {
        schema = z.string();
      }
      break;
    case "integer":
    case "number":
      schema = z.number();
      break;
    case "boolean":
      schema = z.boolean();
      break;
    case "array":
      if (prop.items) {
        schema = z.array(jsonSchemaToZod(prop.items));
      } else {
        schema = z.array(z.unknown());
      }
      break;
    case "object":
      // Generic object -- we can't know the shape at this level
      schema = z.record(z.unknown());
      break;
    default:
      schema = z.unknown();
  }

  if (prop.description) {
    schema = schema.describe(prop.description);
  }

  return schema;
}

/**
 * Convert a tool's JSON Schema `properties` block into a Zod object shape.
 * All properties are marked optional (the Phosra API performs its own validation).
 */
function buildZodShape(
  properties: Record<string, JsonSchemaProp>
): Record<string, ZodTypeAny> {
  const shape: Record<string, ZodTypeAny> = {};

  for (const [key, prop] of Object.entries(properties)) {
    shape[key] = jsonSchemaToZod(prop).optional();
  }

  return shape;
}

// -- Server factory --------------------------------------------------

/**
 * Build and return a configured MCP server with all Phosra tools registered.
 *
 * Usage:
 * ```ts
 * import { buildServer } from "@phosra/mcp";
 * import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
 *
 * const server = buildServer({ apiKey: "...", baseUrl: "..." });
 * await server.connect(new StdioServerTransport());
 * ```
 */
export function buildServer(config: PhosraConfig): McpServer {
  const server = new McpServer({
    name: "phosra",
    version: "0.1.0",
  });

  for (const tool of TOOLS) {
    const properties = (tool.input_schema.properties ?? {}) as Record<
      string,
      JsonSchemaProp
    >;

    const zodShape = buildZodShape(properties);

    server.tool(
      tool.name,
      tool.description,
      zodShape,
      async (params) => {
        const result = await executeToolCall(
          tool,
          params as Record<string, unknown>,
          config
        );

        const text = JSON.stringify(result.data, null, 2);

        return {
          content: [{ type: "text" as const, text }],
          isError: !result.ok,
        };
      }
    );
  }

  return server;
}
