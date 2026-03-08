import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
export interface BrowserConnection {
    send: (method: string, params?: Record<string, unknown>) => Promise<unknown>;
    on: (event: string, callback: (params: unknown) => void) => void;
    listTargets: () => Promise<Array<{
        id: string;
        type: string;
        title: string;
        url: string;
        webSocketDebuggerUrl?: string;
    }>>;
    connectToTarget: (targetId: string) => Promise<BrowserConnection>;
    close: () => void;
}
export declare function createMcpServer(getBrowser: () => BrowserConnection | null): McpServer;
