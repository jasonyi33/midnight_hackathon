import { useCallback } from 'react'
import { useAuthStore } from '../../stores/auth-store'
import { laceWallet } from '../../lib/wallet/lace-wallet'

export type ConnectWalletGateProps = {
  requiredRole?: 'patient' | 'doctor' | 'researcher'
}

export const ConnectWalletGate = ({ requiredRole = 'patient' }: ConnectWalletGateProps) => {
  const { connectWallet, status, error } = useAuthStore((state) => ({
    connectWallet: state.connectWallet,
    status: state.status,
    error: state.error,
  }))

  const handleConnect = useCallback(async () => {
    try {
      await connectWallet()
    } catch (connectionError) {
      console.error('Wallet connection failed', connectionError)
    }
  }, [connectWallet])

  return (
    <div className="connect-gate">
      <div className="glass-panel">
        <h1>Connect Lace wallet</h1>
        <p>
          {requiredRole === 'patient'
            ? 'Authenticate with your Lace wallet to access the patient dashboard.'
            : `You need a ${requiredRole} wallet assignment to access this portal.`}
        </p>
        <button
          className="primary"
          type="button"
          disabled={status === 'connecting'}
          onClick={handleConnect}
        >
          {status === 'connecting' ? 'Connecting…' : 'Connect Lace wallet'}
        </button>
        {error ? <p className="error">{laceWallet.formatError(error)}</p> : null}
      </div>
    </div>
  )
}
