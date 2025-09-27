import type { AuthTokens, UserProfile } from '../../../types/auth'
import { formatAddress, formatBalance } from '../../utils/formatters'
import CryptoJS from 'crypto-js'

const WALLET_NOT_INSTALLED_ERROR = 'WalletNotInstalled'
const SIGNING_UNAVAILABLE_ERROR = 'SigningUnavailable'

export class WalletError extends Error {
  public readonly code: string

  constructor(code: string, message: string) {
    super(message)
    this.name = 'WalletError'
    this.code = code
  }
}

type Cip30WalletApi = {
  getUsedAddresses: () => Promise<string[]>
  getBalance: () => Promise<string>
  signData: (address: string, payload: string) => Promise<{ signature: string }>
}

type LaceProvider = {
  enable: () => Promise<Cip30WalletApi>
}

type LaceWindow = typeof window & {
  cardano?: {
    lace?: LaceProvider
  }
}

const getLaceProvider = (): LaceProvider => {
  if (typeof window === 'undefined') {
    throw new WalletError(
      WALLET_NOT_INSTALLED_ERROR,
      'Wallet APIs are unavailable in this environment.',
    )
  }
  const lace = (window as LaceWindow | undefined)?.cardano?.lace
  if (!lace) {
    throw new WalletError(
      WALLET_NOT_INSTALLED_ERROR,
      'Lace wallet extension is not installed or not accessible.',
    )
  }
  return lace
}

const getPrimaryAddress = async (api: Cip30WalletApi): Promise<string> => {
  const addresses = await api.getUsedAddresses()
  if (!addresses.length) {
    throw new WalletError(
      SIGNING_UNAVAILABLE_ERROR,
      'No used addresses found in Lace wallet.',
    )
  }
  return addresses[0]
}

const messageToHex = (message: string): string => {
  return Array.from(new TextEncoder().encode(message))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

const hashAddress = (address: string): string => {
  return CryptoJS.SHA256(address).toString(CryptoJS.enc.Hex)
}

const createAuthTokens = (address: string, signature: string): AuthTokens => {
  const expiryMs = Date.now() + 60 * 60 * 1000
  return {
    accessToken: `${address}.${signature}`,
    refreshToken: signature,
    expiresAt: expiryMs,
  }
}

const createAuthMessage = () => {
  const nonce = crypto.randomUUID()
  const timestamp = new Date().toISOString()
  const message = `GenomicPrivacy::Auth::${timestamp}::${nonce}`
  const payload = messageToHex(message)
  return { message, payload }
}

export const laceWallet = {
  connect: async (): Promise<Cip30WalletApi> => {
    const lace = getLaceProvider()
    const api = await lace.enable()
    return api
  },
  getPrimaryAddress,
  getBalance: async (api: Cip30WalletApi): Promise<string> => {
    return api.getBalance()
  },
  buildUserProfile: async (api: Cip30WalletApi, role: UserProfile['role'] = 'patient'): Promise<UserProfile> => {
    const address = await getPrimaryAddress(api)
    const rawBalance = await api.getBalance()
    return {
      id: hashAddress(address).slice(0, 32),
      address,
      displayName: formatAddress(address),
      role,
      balance: formatBalance(rawBalance),
    }
  },
  authenticate: async (api: Cip30WalletApi): Promise<{ address: string; payload: { message: string; payload: string }; signature: string }> => {
    const address = await getPrimaryAddress(api)
    if (!api.signData) {
      throw new WalletError(
        SIGNING_UNAVAILABLE_ERROR,
        'Lace wallet does not expose signData capability.',
      )
    }
    const authPayload = createAuthMessage()
    const signatureResult = await api.signData(address, authPayload.payload)
    return { address, payload: authPayload, signature: signatureResult.signature }
  },
  refresh: async (refreshToken: string): Promise<AuthTokens> => {
    const expiryMs = Date.now() + 60 * 60 * 1000
    return {
      accessToken: `${refreshToken}.${expiryMs}`,
      refreshToken,
      expiresAt: expiryMs,
    }
  },
  hashAddress,
  toDeterministicId: (address: string): string => hashAddress(address).slice(0, 32),
  createAuthTokens,
  formatError: (error: unknown): string => {
    if (error instanceof WalletError) {
      if (error.code === WALLET_NOT_INSTALLED_ERROR) {
        return 'Lace wallet is required. Please install the Lace browser extension and refresh.'
      }
      if (error.code === SIGNING_UNAVAILABLE_ERROR) {
        return 'We could not access signing capabilities in Lace. Please ensure you are on the Midnight testnet.'
      }
      return error.message
    }
    if (error instanceof Error) {
      return error.message
    }
    return 'An unexpected wallet error occurred.'
  },
}
