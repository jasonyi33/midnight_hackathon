import type { UserProfile } from '../../../types/auth'
import { useAuthStore } from '../../stores/auth-store'

export type WalletSummaryProps = {
  user?: UserProfile | null
}

export const WalletSummary = ({ user }: WalletSummaryProps) => {
  const { balance } = useAuthStore((state) => ({ balance: state.balance }))

  if (!user) {
    return (
      <div className="wallet-summary ghost">
        <p className="label">Wallet</p>
        <p>Not connected</p>
      </div>
    )
  }

  return (
    <div className="wallet-summary">
      <p className="label">Wallet</p>
      <p className="address">{user.displayName}</p>
      <p className="balance">{balance ?? user.balance}</p>
    </div>
  )
}
