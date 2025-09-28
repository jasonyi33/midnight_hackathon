import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { LoadingSpinner } from '../components/ui/loading-spinner';
import './ConnectWalletGate.css';

interface ConnectWalletGateProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Connect Wallet Gate Component
 * 
 * This component checks if the user is authenticated.
 * If not, it redirects to the landing page.
 * If yes, it renders the children components.
 */
export const ConnectWalletGate = ({ 
  children, 
  fallback = <div className="loading-container"><LoadingSpinner /></div> 
}: ConnectWalletGateProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    // Short delay to prevent flash of loading state for quick auth checks
    const timer = setTimeout(() => {
      setIsLoading(false);
      if (!isAuthenticated) {
        navigate('/');
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [isAuthenticated, navigate]);

  if (isLoading || !user) {
    return fallback;
  }

  return <>{children}</>;
};