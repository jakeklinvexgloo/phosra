import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { BrowserConnection } from '../server';
export declare function registerDomTools(server: McpServer, getBrowser: () => BrowserConnection | null): void;
