export type Role = 'patient' | 'doctor' | 'researcher'

export type AuthTokens = {
  accessToken: string
  refreshToken: string
  expiresAt: number
}

export type UserProfile = {
  id: string
  address: string
  role: Role
  balance: string
  displayName: string
}
