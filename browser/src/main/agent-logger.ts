/**
 * Agent Debug Logger — structured logging + WebSocket server for real-time
 * CLI monitoring of the config agent.
 *
 * When `--agent-debug` is passed on startup, a tiny WS server starts on
 * port 9333 (or `--agent-debug-port=NNNN`). The CLI script
 * `scripts/agent-debug.mjs` connects and renders events in real time.
 *
 * Without the flag, logs still go to stdout (visible in the terminal
 * where the browser was launched).
 */

import { WebSocketServer, WebSocket } from 'ws';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type LogLevel = 'info' | 'warn' | 'error' | 'debug' | 'event';

export interface AgentLogEntry {
  ts: string;           // ISO timestamp
  level: LogLevel;
  source: string;       // e.g. 'netflix-agent', 'config-agent'
  event: string;        // e.g. 'phase-change', 'profile-discovered'
  message: string;
  data?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Logger
// ---------------------------------------------------------------------------

const TAG = '[AgentDebug]';
const clients = new Set<WebSocket>();
let wss: WebSocketServer | null = null;

/** Pretty-print colours for terminal output. */
const COLORS = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
  bold: '\x1b[1m',
};

function levelColor(level: LogLevel): string {
  switch (level) {
    case 'info':  return COLORS.cyan;
    case 'warn':  return COLORS.yellow;
    case 'error': return COLORS.red;
    case 'debug': return COLORS.dim;
    case 'event': return COLORS.green;
    default:      return COLORS.reset;
  }
}

function formatForTerminal(entry: AgentLogEntry): string {
  const time = entry.ts.slice(11, 23); // HH:MM:SS.mmm
  const lvl = entry.level.toUpperCase().padEnd(5);
  const color = levelColor(entry.level);
  let line = `${COLORS.dim}${time}${COLORS.reset} ${color}${lvl}${COLORS.reset} ${COLORS.bold}[${entry.source}]${COLORS.reset} ${entry.message}`;
  if (entry.data && Object.keys(entry.data).length > 0) {
    line += ` ${COLORS.dim}${JSON.stringify(entry.data)}${COLORS.reset}`;
  }
  return line;
}

/**
 * Emit a structured log entry.
 *
 * - Always printed to stdout (visible when browser runs from terminal)
 * - If debug WS server is running, broadcast to all connected CLI clients
 */
export function agentLog(
  level: LogLevel,
  source: string,
  event: string,
  message: string,
  data?: Record<string, unknown>,
): void {
  const entry: AgentLogEntry = {
    ts: new Date().toISOString(),
    level,
    source,
    event,
    message,
    data,
  };

  // Always write to stdout
  console.log(formatForTerminal(entry));

  // Broadcast to WS clients
  if (clients.size > 0) {
    const json = JSON.stringify(entry);
    for (const ws of clients) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(json);
      }
    }
  }
}

// Convenience methods
export const agentDebug = (source: string, event: string, msg: string, data?: Record<string, unknown>) =>
  agentLog('debug', source, event, msg, data);

export const agentInfo = (source: string, event: string, msg: string, data?: Record<string, unknown>) =>
  agentLog('info', source, event, msg, data);

export const agentWarn = (source: string, event: string, msg: string, data?: Record<string, unknown>) =>
  agentLog('warn', source, event, msg, data);

export const agentError = (source: string, event: string, msg: string, data?: Record<string, unknown>) =>
  agentLog('error', source, event, msg, data);

export const agentEvent = (source: string, event: string, msg: string, data?: Record<string, unknown>) =>
  agentLog('event', source, event, msg, data);

// ---------------------------------------------------------------------------
// WebSocket debug server
// ---------------------------------------------------------------------------

/**
 * Start the debug WebSocket server.
 * Called from index.ts when `--agent-debug` is passed.
 */
export function startAgentDebugServer(port: number = 9333): void {
  if (wss) return; // already running

  try {
    wss = new WebSocketServer({ port, host: '127.0.0.1' });

    wss.on('connection', (ws) => {
      clients.add(ws);
      agentInfo('debug-server', 'client-connected', `CLI client connected (${clients.size} total)`);

      // Send a welcome message with current state info
      ws.send(JSON.stringify({
        ts: new Date().toISOString(),
        level: 'info',
        source: 'debug-server',
        event: 'welcome',
        message: 'Connected to Phosra Browser agent debug stream',
        data: { port, pid: process.pid },
      } satisfies AgentLogEntry));

      ws.on('close', () => {
        clients.delete(ws);
      });

      ws.on('error', () => {
        clients.delete(ws);
      });
    });

    wss.on('error', (err) => {
      console.error(`${TAG} Failed to start debug server:`, err.message);
      wss = null;
    });

    console.log(`${TAG} Debug WebSocket server listening on ws://127.0.0.1:${port}`);
  } catch (err) {
    console.error(`${TAG} Failed to start debug server:`, err);
  }
}

/**
 * Stop the debug server and disconnect all clients.
 */
export function stopAgentDebugServer(): void {
  if (!wss) return;
  for (const ws of clients) {
    ws.close();
  }
  clients.clear();
  wss.close();
  wss = null;
}
