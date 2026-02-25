import { readFile } from "fs/promises"
import { existsSync } from "fs"
import { resolve } from "path"
import type { PlatformCredentials } from "./types"

const CREDENTIALS_FILENAME = "platform-credentials.local.json"

/** Full credentials file shape: platformId → PlatformCredentials */
export type CredentialsFile = Record<string, PlatformCredentials>

/**
 * Load platform credentials from the local (gitignored) credentials file.
 * Looks in the project root for platform-credentials.local.json.
 */
export async function loadCredentials(): Promise<CredentialsFile> {
  const filePath = resolveCredentialsPath()

  if (!existsSync(filePath)) {
    return {}
  }

  const raw = await readFile(filePath, "utf-8")
  const parsed = JSON.parse(raw) as CredentialsFile

  // Basic validation
  for (const [platformId, creds] of Object.entries(parsed)) {
    if (!creds.loginMethod) {
      throw new Error(`Missing loginMethod for platform "${platformId}" in ${CREDENTIALS_FILENAME}`)
    }
  }

  return parsed
}

/**
 * Get credentials for a specific platform.
 * Returns null if no credentials are configured.
 */
export async function getCredentials(platformId: string): Promise<PlatformCredentials | null> {
  const all = await loadCredentials()
  return all[platformId] ?? null
}

/**
 * Check which platforms have credentials configured.
 * Returns an array of platform IDs.
 */
export async function getConfiguredPlatformIds(): Promise<string[]> {
  const all = await loadCredentials()
  return Object.keys(all)
}

/**
 * Check if credentials file exists.
 */
export function credentialsFileExists(): boolean {
  return existsSync(resolveCredentialsPath())
}

function resolveCredentialsPath(): string {
  // Walk up from web/src/lib/platform-research/ to find project root
  return resolve(process.cwd(), CREDENTIALS_FILENAME)
}
