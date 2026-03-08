import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { BrowserConnection } from '../server';
export declare function registerTabTools(server: McpServer, getBrowser: () => BrowserConnection | null): void;
