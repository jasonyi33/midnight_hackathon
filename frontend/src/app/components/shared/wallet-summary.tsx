import { useAuthStore, type User } from '../../../store/authStore';
import { RoleSwitcher } from './role-switcher';
import './wallet-summary.css';

export interface WalletSummaryProps {
  user?: User | null;
  showRoleSwitcher?: boolean;
}

/**
 * Wallet Summary Component
 * Displays wallet address and balance information
 */
export const WalletSummary = ({ user, showRoleSwitcher = true }: WalletSummaryProps) => {
  const { logout } = useAuthStore();

  if (!user) {
    return (
      <div className="wallet-summary wallet-not-connected">
        <p className="wallet-label">Wallet</p>
        <p className="wallet-status">Not connected</p>
      </div>
    );
  }

  // Format address to show only first 6 and last 4 characters
  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="wallet-container">
      <div className="wallet-summary">
        <div className="wallet-info">
          <p className="wallet-label">Connected as</p>
          <p className="wallet-address">
            {user.displayName || 'User'}
          </p>
          <p className="wallet-address-hex">
            {formatAddress(user.walletAddress)}
          </p>
          {user.balance && <p className="wallet-balance">{user.balance}</p>}
          <div className="disconnect-button-container">
            <button 
              onClick={logout}
              className="disconnect-button"
              title="Disconnect Wallet"
            >
              Disconnect
            </button>
          </div>
        </div>
      </div>
      {showRoleSwitcher && <RoleSwitcher />}
    </div>
  );
};