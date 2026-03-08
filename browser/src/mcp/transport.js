#!/usr/bin/env node
"use strict";
/**
 * MCP transport for Phosra Browser.
 * Runs as a standalone Node process, connects to the browser via CDP,
 * and exposes MCP tools over stdio.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActivePageTarget = getActivePageTarget;
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const chrome_remote_interface_1 = __importDefault(require("chrome-remote-interface"));
const server_1 = require("./server");
const CDP_PORT = parseInt(process.env.PHOSRA_CDP_PORT || '9222', 10);
let browserConnection = null;
async function connectToBrowser() {
    const client = await (0, chrome_remote_interface_1.default)({ port: CDP_PORT });
    const connection = {
        send: async (method, params) => {
            return client.send(method, params);
        },
        on: (event, callback) => {
            client.on(event, callback);
        },
        listTargets: async () => {
            const targets = await chrome_remote_interface_1.default.List({ port: CDP_PORT });
            return targets.map((t) => ({
                id: t.id,
                type: t.type,
                title: t.title,
                url: t.url,
                webSocketDebuggerUrl: t.webSocketDebuggerUrl,
            }));
        },
        connectToTarget: async (targetId) => {
            const targetClient = await (0, chrome_remote_interface_1.default)({ port: CDP_PORT, target: targetId });
            return {
                send: async (method, params) => {
                    return targetClient.send(method, params);
                },
                on: (event, callback) => {
                    targetClient.on(event, callback);
                },
                listTargets: connection.listTargets,
                connectToTarget: connection.connectToTarget,
                close: () => targetClient.close(),
            };
        },
        close: () => client.close(),
    };
    return connection;
}
async function getActivePageTarget(conn) {
    const targets = await conn.listTargets();
    const pageTarget = targets.find((t) => t.type === 'page' && !t.url.startsWith('devtools://') && !t.url.startsWith('chrome-extension://'));
    if (!pageTarget) {
        throw new Error('No active page target found. Is the browser running with a tab open?');
    }
    return conn.connectToTarget(pageTarget.id);
}
function getBrowser() {
    return browserConnection;
}
async function main() {
    try {
        browserConnection = await connectToBrowser();
        console.error(`[phosra-mcp] Connected to browser on CDP port ${CDP_PORT}`);
    }
    catch (err) {
        console.error(`[phosra-mcp] Warning: Could not connect to browser on port ${CDP_PORT}. Tools will fail until browser is available.`);
    }
    const server = (0, server_1.createMcpServer)(getBrowser);
    const transport = new stdio_js_1.StdioServerTransport();
    await server.connect(transport);
    console.error('[phosra-mcp] MCP server running on stdio');
}
main().catch((err) => {
    console.error('[phosra-mcp] Fatal error:', err);
    process.exit(1);
});
