import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto"
import { readFile, writeFile, mkdir } from "fs/promises"
import { existsSync } from "fs"
import { dirname, join } from "path"
import { homedir } from "os"
import type { PlatformCredentials } from "./types"

const VAULT_PATH = join(homedir(), ".phosra", "credentials.vault")
const ALGORITHM = "aes-256-gcm"
const SALT_LENGTH = 32
const IV_LENGTH = 16
const AUTH_TAG_LENGTH = 16
const KEY_LENGTH = 32

interface VaultData {
  version: 1
  credentials: Record<string, EncryptedBlob>
}

interface EncryptedBlob {
  salt: string    // hex
  iv: string      // hex
  tag: string     // hex
  data: string    // hex
}

function deriveKey(password: string, salt: Buffer): Buffer {
  return scryptSync(password, salt, KEY_LENGTH)
}

function getVaultKey(): string {
  const key = process.env.PHOSRA_VAULT_KEY
  if (!key) {
    throw new Error(
      "PHOSRA_VAULT_KEY env var is not set. Set it or pass a master password to vault operations."
    )
  }
  return key
}

function encrypt(plaintext: string, password: string): EncryptedBlob {
  const salt = randomBytes(SALT_LENGTH)
  const key = deriveKey(password, salt)
  const iv = randomBytes(IV_LENGTH)

  const cipher = createCipheriv(ALGORITHM, key, iv)
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf-8"), cipher.final()])
  const tag = cipher.getAuthTag()

  return {
    salt: salt.toString("hex"),
    iv: iv.toString("hex"),
    tag: tag.toString("hex"),
    data: encrypted.toString("hex"),
  }
}

function decrypt(blob: EncryptedBlob, password: string): string {
  const salt = Buffer.from(blob.salt, "hex")
  const key = deriveKey(password, salt)
  const iv = Buffer.from(blob.iv, "hex")
  const tag = Buffer.from(blob.tag, "hex")
  const data = Buffer.from(blob.data, "hex")

  const decipher = createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(tag)
  return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf-8")
}

async function readVault(password: string): Promise<VaultData> {
  if (!existsSync(VAULT_PATH)) {
    return { version: 1, credentials: {} }
  }
  const raw = await readFile(VAULT_PATH, "utf-8")
  return JSON.parse(raw) as VaultData
}

async function writeVault(vault: VaultData): Promise<void> {
  await mkdir(dirname(VAULT_PATH), { recursive: true })
  await writeFile(VAULT_PATH, JSON.stringify(vault, null, 2), { mode: 0o600 })
}

/**
 * Save credentials for a platform, encrypted with AES-256-GCM.
 */
export async function saveCredentials(
  platformId: string,
  creds: PlatformCredentials,
  masterPassword?: string,
): Promise<void> {
  const password = masterPassword ?? getVaultKey()
  const vault = await readVault(password)
  vault.credentials[platformId] = encrypt(JSON.stringify(creds), password)
  await writeVault(vault)
}

/**
 * Load credentials for a platform.
 * Returns null if not found.
 */
export async function loadCredentials(
  platformId: string,
  masterPassword?: string,
): Promise<PlatformCredentials | null> {
  const password = masterPassword ?? getVaultKey()
  const vault = await readVault(password)
  const blob = vault.credentials[platformId]
  if (!blob) return null
  return JSON.parse(decrypt(blob, password)) as PlatformCredentials
}

/**
 * List all platform IDs that have stored credentials.
 */
export async function listPlatforms(masterPassword?: string): Promise<string[]> {
  const password = masterPassword ?? getVaultKey()
  const vault = await readVault(password)
  return Object.keys(vault.credentials)
}

/**
 * Remove credentials for a platform.
 */
export async function removeCredentials(
  platformId: string,
  masterPassword?: string,
): Promise<boolean> {
  const password = masterPassword ?? getVaultKey()
  const vault = await readVault(password)
  if (!(platformId in vault.credentials)) return false
  delete vault.credentials[platformId]
  await writeVault(vault)
  return true
}

/**
 * Fallback: load credentials from the existing platform-credentials.local.json format.
 */
export async function loadCredentialsFromFile(
  platformId: string,
  filePath?: string,
): Promise<PlatformCredentials | null> {
  const credPath = filePath ?? join(process.cwd(), "platform-credentials.local.json")
  if (!existsSync(credPath)) return null

  try {
    const raw = await readFile(credPath, "utf-8")
    const allCreds = JSON.parse(raw) as Record<string, PlatformCredentials>
    return allCreds[platformId] ?? null
  } catch {
    return null
  }
}
