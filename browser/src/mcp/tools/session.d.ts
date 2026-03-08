import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { BrowserConnection } from '../server';
export declare function registerSessionTools(server: McpServer, getBrowser: () => BrowserConnection | null): void;
