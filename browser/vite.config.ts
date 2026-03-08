import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import electron from 'vite-plugin-electron';
import electronRenderer from 'vite-plugin-electron-renderer';
import { resolve } from 'path';
import { readFileSync } from 'fs';
import { execSync } from 'child_process';

// Load .env from browser/ directory for build-time injection
function loadDotEnv(): Record<string, string> {
  const vars: Record<string, string> = {};
  try {
    const content = readFileSync(resolve(__dirname, '.env'), 'utf-8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx > 0) {
        vars[trimmed.substring(0, eqIdx).trim()] = trimmed.substring(eqIdx + 1).trim();
      }
    }
  } catch { /* .env not found */ }
  return vars;
}

const dotenv = loadDotEnv();

// Build label: git short hash + date + optional tag from BUILD_TAG env or build-tag.txt
function generateBuildLabel(): string {
  let gitHash = 'unknown';
  try { gitHash = execSync('git rev-parse --short=7 HEAD', { cwd: __dirname }).toString().trim(); } catch {}
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  // Read optional human-readable tag (e.g. "prime-video-autofill-fix")
  let tag = process.env.BUILD_TAG || '';
  if (!tag) {
    try { tag = readFileSync(resolve(__dirname, 'build-tag.txt'), 'utf-8').trim(); } catch {}
  }
  // Format: 0.1.0-20260308-a1b2c3d (prime-video-autofill-fix)
  const base = `0.1.0-${date}-${gitHash}`;
  return tag ? `${base} (${tag})` : base;
}

const BUILD_LABEL = generateBuildLabel();

export default defineConfig({
  plugins: [
    react(),
    electron([
      {
        entry: resolve(__dirname, 'src/main/index.ts'),
        onstart({ startup }) {
          startup();
        },
        vite: {
          define: {
            '__STYTCH_PROJECT_ID__': JSON.stringify(dotenv.STYTCH_PROJECT_ID || ''),
            '__STYTCH_SECRET__': JSON.stringify(dotenv.STYTCH_SECRET || ''),
            '__BUILD_LABEL__': JSON.stringify(BUILD_LABEL),
          },
          build: {
            outDir: resolve(__dirname, 'dist/main'),
            rollupOptions: {
              external: ['electron', 'chrome-remote-interface', 'ws', 'bufferutil', 'utf-8-validate'],
            },
          },
        },
      },
      {
        entry: resolve(__dirname, 'src/preload/chrome-ui-preload.ts'),
        onstart() { /* preload - no startup needed */ },
        vite: {
          build: {
            outDir: resolve(__dirname, 'dist/preload'),
            rollupOptions: {
              external: ['electron'],
            },
          },
        },
      },
      {
        entry: resolve(__dirname, 'src/preload/stealth-preload.ts'),
        onstart() { /* preload - no startup needed */ },
        vite: {
          build: {
            outDir: resolve(__dirname, 'dist/preload'),
            rollupOptions: {
              external: ['electron'],
            },
          },
        },
      },
      {
        entry: resolve(__dirname, 'src/preload/home-preload.ts'),
        onstart() { /* preload - no startup needed */ },
        vite: {
          build: {
            outDir: resolve(__dirname, 'dist/preload'),
            rollupOptions: {
              external: ['electron'],
            },
          },
        },
      },
      {
        entry: resolve(__dirname, 'src/preload/family-preload.ts'),
        onstart() { /* preload - no startup needed */ },
        vite: {
          build: {
            outDir: resolve(__dirname, 'dist/preload'),
            rollupOptions: {
              external: ['electron'],
            },
          },
        },
      },
    ]),
    electronRenderer(),
  ],
  root: resolve(__dirname, 'src'),
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        renderer: resolve(__dirname, 'src/renderer/index.html'),
        home: resolve(__dirname, 'src/home/index.html'),
        family: resolve(__dirname, 'src/family/index.html'),
      },
    },
  },
  define: {
    '__BUILD_LABEL__': JSON.stringify(BUILD_LABEL),
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
