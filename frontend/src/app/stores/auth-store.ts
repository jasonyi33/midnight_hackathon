import { create } from 'zustand'
import { persist, type PersistStorage, type StorageValue } from 'zustand/middleware'
import { encryptTokens, decryptTokens } from '../lib/crypto/token-storage'
import { laceWallet } from '../lib/wallet/lace-wallet'
import { apiClient } from '../lib/api/client'
import { formatBalance } from '../utils/formatters'
import type { AuthTokens, UserProfile } from '../../types/auth'

type AuthState = {
  isAuthenticated: boolean
  user: UserProfile | null
  tokens: AuthTokens | null
  balance: string | null
  status: 'idle' | 'connecting' | 'ready' | 'error'
  error: unknown
  connectWallet: () => Promise<void>
  disconnect: () => void
  refreshAuth: () => Promise<void>
  setBalance: (balance: string | null) => void
}

type PersistedAuthState = {
  tokens: AuthTokens | null
}

const STORAGE_KEY = 'gp-auth'

const persistTokens = (tokens: AuthTokens | null) => {
  if (typeof window === 'undefined') return
  if (!tokens) {
    sessionStorage.removeItem('gp-access-token')
    return
  }
  sessionStorage.setItem('gp-access-token', tokens.accessToken)
}

const encryptedStorage: PersistStorage<PersistedAuthState> = {
  getItem: (name) => {
    if (typeof window === 'undefined') return null
    const encrypted = localStorage.getItem(name)
    if (!encrypted) {
      return null
    }
    const tokens = decryptTokens(encrypted)
    return { state: { tokens }, version: 0 }
  },
  setItem: (name, value) => {
    if (typeof window === 'undefined') return
    const storageValue = value as StorageValue<PersistedAuthState>
    const encrypted = encryptTokens(storageValue.state.tokens)
    localStorage.setItem(name, encrypted)
  },
  removeItem: (name) => {
    if (typeof window === 'undefined') return
    localStorage.removeItem(name)
  },
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      tokens: null,
      balance: null,
      status: 'idle',
      error: null,
      connectWallet: async () => {
        set({ status: 'connecting', error: null })
        try {
          const wallet = await laceWallet.connect()
          const { address, payload, signature } = await laceWallet.authenticate(wallet)
          const authResult = await apiClient.authenticate({
            walletAddress: address,
            message: payload.message,
            signature,
            role: 'patient'
          })
          const rawBalance = await laceWallet.getBalance(wallet)
          const tokens = { 
            accessToken: authResult.data.accessToken,
            refreshToken: '',
            expiresAt: Date.now() + 24 * 60 * 60 * 1000
          }
          const profile: UserProfile = {
            ...authResult.data.user,
            balance: formatBalance(rawBalance),
          }

          persistTokens(tokens)
          set({
            isAuthenticated: true,
            user: profile,
            tokens,
            balance: profile.balance,
            status: 'ready',
            error: null,
          })
        } catch (connectionError) {
          set({ status: 'error', error: connectionError })
          throw connectionError
        }
      },
      disconnect: () => {
        persistTokens(null)
        set({
          isAuthenticated: false,
          user: null,
          tokens: null,
          balance: null,
          status: 'idle',
          error: null,
        })
      },
      refreshAuth: async () => {
        const { tokens } = get()
        if (!tokens?.refreshToken) return

        const refreshed = await apiClient.refreshToken(tokens.refreshToken)
        persistTokens(refreshed)
        set({ tokens: refreshed })
      },
      setBalance: (balance) => {
        set({ balance })
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: ({ tokens }: AuthState): PersistedAuthState => ({ tokens }),
      storage: encryptedStorage,
      merge: (persisted, current) => {
        const tokens = (persisted as PersistedAuthState | undefined)?.tokens ?? null
        persistTokens(tokens)
        return {
          ...current,
          tokens,
          isAuthenticated: Boolean(tokens),
          status: tokens ? 'ready' : current.status,
        }
      },
    },
  ),
)
