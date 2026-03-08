"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMcpServer = createMcpServer;
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const navigation_1 = require("./tools/navigation");
const interaction_1 = require("./tools/interaction");
const dom_1 = require("./tools/dom");
const tabs_1 = require("./tools/tabs");
const session_1 = require("./tools/session");
const page_state_1 = require("./tools/page-state");
function createMcpServer(getBrowser) {
    const server = new mcp_js_1.McpServer({
        name: 'phosra-browser',
        version: '0.1.0',
    });
    (0, navigation_1.registerNavigationTools)(server, getBrowser);
    (0, interaction_1.registerInteractionTools)(server, getBrowser);
    (0, dom_1.registerDomTools)(server, getBrowser);
    (0, tabs_1.registerTabTools)(server, getBrowser);
    (0, session_1.registerSessionTools)(server, getBrowser);
    (0, page_state_1.registerPageStateTools)(server, getBrowser);
    return server;
}
