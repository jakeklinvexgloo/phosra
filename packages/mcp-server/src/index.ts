#!/usr/bin/env node

/**
 * Phosra MCP server CLI entry point.
 *
 * Starts a stdio-based MCP server that exposes all 42 Phosra child-safety
 * tools to any MCP-compatible client (Claude Desktop, Cursor, etc.).
 *
 * Usage:
 *   phosra-mcp --api-key=YOUR_KEY
 *   phosra-mcp --api-key=YOUR_KEY --api-url=https://custom.endpoint/api/v1
 *
 * Environment variables (used as fallbacks):
 *   PHOSRA_API_KEY   - Phosra API key
 *   PHOSRA_API_URL   - Phosra API base URL
 */

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { buildServer } from "./server.js";

const DEFAULT_API_URL =
  "https://phosra-api-production.up.railway.app/api/v1";

// -- Parse CLI args --------------------------------------------------

function parseArgs(): { apiKey: string; apiUrl: string } {
  let apiKey: string | undefined;
  let apiUrl: string | undefined;

  for (const arg of process.argv.slice(2)) {
    if (arg.startsWith("--api-key=")) {
      apiKey = arg.slice("--api-key=".length);
    } else if (arg.startsWith("--api-url=")) {
      apiUrl = arg.slice("--api-url=".length);
    }
  }

  // Fall back to environment variables
  apiKey = apiKey || process.env.PHOSRA_API_KEY;
  apiUrl = apiUrl || process.env.PHOSRA_API_URL || DEFAULT_API_URL;

  if (!apiKey) {
    console.error(
      "Error: Phosra API key is required.\n\n" +
        "Provide it via:\n" +
        "  --api-key=YOUR_KEY   (CLI argument)\n" +
        "  PHOSRA_API_KEY       (environment variable)\n\n" +
        "Get your API key at https://phosra.com/dashboard/api-keys"
    );
    process.exit(1);
  }

  return { apiKey, apiUrl };
}

// -- Main ------------------------------------------------------------

async function main(): Promise<void> {
  const { apiKey, apiUrl } = parseArgs();

  const server = buildServer({ apiKey, baseUrl: apiUrl });
  const transport = new StdioServerTransport();

  console.error(`Phosra MCP server v0.1.0`);
  console.error(`API endpoint: ${apiUrl}`);
  console.error(`Registering 42 tools...`);

  await server.connect(transport);

  console.error("Server running on stdio. Ready for MCP client connections.");
}

main().catch((err) => {
  console.error("Fatal error starting Phosra MCP server:", err);
  process.exit(1);
});
