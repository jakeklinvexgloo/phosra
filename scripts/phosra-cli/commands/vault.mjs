import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'

export const VAULT_DIR = path.join(os.homedir(), '.phosra')
export const VAULT_PATH = path.join(VAULT_DIR, 'credentials.vault')
const ALGORITHM = 'aes-256-gcm'

function deriveKey(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha512')
}

function encrypt(data, password) {
  const salt = crypto.randomBytes(16)
  const key = deriveKey(password, salt)
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(data), 'utf8'),
    cipher.final(),
  ])
  const authTag = cipher.getAuthTag()
  return {
    salt: salt.toString('base64'),
    iv: iv.toString('base64'),
    authTag: authTag.toString('base64'),
    data: encrypted.toString('base64'),
  }
}

function decrypt(vault, password) {
  const salt = Buffer.from(vault.salt, 'base64')
  const key = deriveKey(password, salt)
  const iv = Buffer.from(vault.iv, 'base64')
  const authTag = Buffer.from(vault.authTag, 'base64')
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(authTag)
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(vault.data, 'base64')),
    decipher.final(),
  ])
  return JSON.parse(decrypted.toString('utf8'))
}

export function getVaultPassword() {
  return process.env.PHOSRA_VAULT_KEY || null
}

export function ensureVaultDir() {
  if (!fs.existsSync(VAULT_DIR)) {
    fs.mkdirSync(VAULT_DIR, { recursive: true, mode: 0o700 })
  }
}

export function vaultExists() {
  return fs.existsSync(VAULT_PATH)
}

export function createVault(password) {
  ensureVaultDir()
  const vaultData = encrypt({}, password)
  fs.writeFileSync(VAULT_PATH, JSON.stringify(vaultData, null, 2), {
    mode: 0o600,
  })
}

export function readVault(password) {
  if (!vaultExists()) {
    throw new Error(
      'Vault not found. Run "phosra init" first.'
    )
  }
  const raw = JSON.parse(fs.readFileSync(VAULT_PATH, 'utf8'))
  return decrypt(raw, password)
}

export function writeVault(data, password) {
  ensureVaultDir()
  const vaultData = encrypt(data, password)
  fs.writeFileSync(VAULT_PATH, JSON.stringify(vaultData, null, 2), {
    mode: 0o600,
  })
}
