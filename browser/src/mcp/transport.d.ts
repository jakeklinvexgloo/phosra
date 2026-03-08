#!/usr/bin/env node
/**
 * MCP transport for Phosra Browser.
 * Runs as a standalone Node process, connects to the browser via CDP,
 * and exposes MCP tools over stdio.
 */
import { BrowserConnection } from './server';
declare function getActivePageTarget(conn: BrowserConnection): Promise<BrowserConnection>;
export { getActivePageTarget };
