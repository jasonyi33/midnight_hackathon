import CryptoJS from 'crypto-js'
import type { AuthTokens } from '../../../types/auth'

const TOKEN_SECRET = import.meta.env.VITE_TOKEN_SECRET ?? 'gp-fallback-secret'

export const encryptTokens = (tokens: AuthTokens | null): string => {
  const payload = JSON.stringify(tokens)
  const ciphertext = CryptoJS.AES.encrypt(payload, TOKEN_SECRET).toString()
  return ciphertext
}

export const decryptTokens = (encrypted: string | null): AuthTokens | null => {
  if (!encrypted) return null
  try {
    const bytes = CryptoJS.AES.decrypt(encrypted, TOKEN_SECRET)
    const plaintext = bytes.toString(CryptoJS.enc.Utf8)
    if (!plaintext) return null
    return JSON.parse(plaintext) as AuthTokens | null
  } catch (error) {
    console.error('Failed to decrypt auth tokens', error)
    return null
  }
}
