const textEncoder = new TextEncoder()

const toBase64 = (source: ArrayBuffer | Uint8Array): string => {
  const bytes = source instanceof Uint8Array ? source : new Uint8Array(source)
  let binary = ''
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })
  return btoa(binary)
}

const fromString = (value: string) => textEncoder.encode(value)

const randomBytes = (length: number): Uint8Array => {
  return crypto.getRandomValues(new Uint8Array(length))
}

const importKey = async (passphrase: string, salt: Uint8Array) => {
  const keyMaterial = await crypto.subtle.importKey('raw', fromString(passphrase), 'PBKDF2', false, [
    'deriveKey',
  ])
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as unknown as BufferSource,
      iterations: 250_000,
      hash: 'SHA-256',
    },
    keyMaterial,
    {
      name: 'AES-GCM',
      length: 256,
    },
    false,
    ['encrypt'],
  )
}

export type EncryptedGenomePayload = {
  encryptedData: string
  iv: string
  salt: string
}

export const encryptGenome = async (json: string, passphrase: string): Promise<EncryptedGenomePayload> => {
  const salt = randomBytes(16)
  const iv = randomBytes(12)
  const key = await importKey(passphrase, salt)
  const data = textEncoder.encode(json)
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv as unknown as BufferSource }, key, data)
  return {
    encryptedData: toBase64(encrypted),
    iv: toBase64(iv),
    salt: toBase64(salt),
  }
}
