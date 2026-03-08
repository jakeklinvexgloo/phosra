import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { BrowserConnection } from '../server';
export declare function registerPageStateTools(server: McpServer, getBrowser: () => BrowserConnection | null): void;
