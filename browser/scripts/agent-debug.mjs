#!/usr/bin/env node

/**
 * Phosra Browser — Agent Debug CLI
 *
 * Connects to the browser's agent debug WebSocket server and streams
 * real-time events from the Netflix config agent (and future agents).
 *
 * Usage:
 *   node scripts/agent-debug.mjs              # default port 9333
 *   node scripts/agent-debug.mjs --port 9444  # custom port
 *   node scripts/agent-debug.mjs --json       # raw JSON output (for piping)
 *
 * The browser must be started with --agent-debug:
 *   npm start -- --agent-debug
 */

import WebSocket from 'ws';

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const portIdx = args.indexOf('--port');
const port = portIdx >= 0 && args[portIdx + 1] ? parseInt(args[portIdx + 1], 10) : 9333;
const jsonMode = args.includes('--json');

// ---------------------------------------------------------------------------
// Terminal colours
// ---------------------------------------------------------------------------

const C = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  bold: '\x1b[1m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
  blue: '\x1b[34m',
  white: '\x1b[37m',
  bgCyan: '\x1b[46m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgRed: '\x1b[41m',
};

function levelColor(level) {
  switch (level) {
    case 'info':  return C.cyan;
    case 'warn':  return C.yellow;
    case 'error': return C.red;
    case 'debug': return C.dim;
    case 'event': return C.green;
    default:      return C.reset;
  }
}

function levelIcon(level) {
  switch (level) {
    case 'info':  return 'i';
    case 'warn':  return '!';
    case 'error': return 'x';
    case 'debug': return '.';
    case 'event': return '*';
    default:      return ' ';
  }
}

// ---------------------------------------------------------------------------
// Pretty formatter
// ---------------------------------------------------------------------------

function formatEntry(entry) {
  const time = entry.ts?.slice(11, 23) || '??:??:??.???';
  const level = (entry.level || 'info').toUpperCase().padEnd(5);
  const lc = levelColor(entry.level);
  const icon = levelIcon(entry.level);
  const source = entry.source || '?';
  const event = entry.event || '';
  const msg = entry.message || '';

  let line = '';
  line += `${C.dim}${time}${C.reset} `;
  line += `${lc}${icon} ${level}${C.reset} `;
  line += `${C.bold}${source}${C.reset}`;
  if (event) line += `${C.dim}:${C.reset}${C.magenta}${event}${C.reset}`;
  line += ` ${msg}`;

  if (entry.data && Object.keys(entry.data).length > 0) {
    const dataStr = JSON.stringify(entry.data, null, 2);
    const indented = dataStr.split('\n').map((l) => `    ${l}`).join('\n');
    line += `\n${C.dim}${indented}${C.reset}`;
  }

  return line;
}

// ---------------------------------------------------------------------------
// Connection
// ---------------------------------------------------------------------------

const url = `ws://127.0.0.1:${port}`;

function connect() {
  if (!jsonMode) {
    console.log(`\n${C.bold}${C.cyan}Phosra Agent Debug CLI${C.reset}`);
    console.log(`${C.dim}Connecting to ${url}...${C.reset}\n`);
  }

  const ws = new WebSocket(url);
  let connected = false;

  ws.on('open', () => {
    connected = true;
    if (!jsonMode) {
      console.log(`${C.green}Connected.${C.reset} Streaming agent events...\n`);
      console.log(`${C.dim}${'─'.repeat(72)}${C.reset}\n`);
    }
  });

  ws.on('message', (data) => {
    try {
      const entry = JSON.parse(data.toString());
      if (jsonMode) {
        console.log(JSON.stringify(entry));
      } else {
        console.log(formatEntry(entry));
      }
    } catch {
      if (jsonMode) {
        console.log(data.toString());
      } else {
        console.log(`${C.dim}[raw]${C.reset} ${data.toString()}`);
      }
    }
  });

  ws.on('close', () => {
    if (!jsonMode) {
      console.log(`\n${C.yellow}Disconnected.${C.reset}`);
    }
    if (connected) {
      // Browser was running but closed — wait and retry
      if (!jsonMode) {
        console.log(`${C.dim}Reconnecting in 2s...${C.reset}`);
      }
      setTimeout(connect, 2000);
    }
  });

  ws.on('error', (err) => {
    if (!connected) {
      if (!jsonMode) {
        console.log(`${C.red}Cannot connect to browser.${C.reset}`);
        console.log(`${C.dim}Make sure the browser is running with --agent-debug:${C.reset}`);
        console.log(`  ${C.white}npm start -- --agent-debug${C.reset}\n`);
        console.log(`${C.dim}Retrying in 3s...${C.reset}`);
      }
      setTimeout(connect, 3000);
    }
  });
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  if (!jsonMode) {
    console.log(`\n${C.dim}Bye.${C.reset}`);
  }
  process.exit(0);
});

connect();
