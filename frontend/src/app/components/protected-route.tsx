/**
 * Protected Route Component
 * Handles role-based access control for different user types
 */

import type { ReactNode } from 'react';
import { useAuthStore } from '../../store/authStore';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: string[];
  fallback: ReactNode;
}

export const ProtectedRoute = ({ children, allowedRoles, fallback }: ProtectedRouteProps) => {
  const { user, isAuthenticated } = useAuthStore();

  // If not authenticated, show fallback (ConnectWalletGate)
  if (!isAuthenticated || !user) {
    return <>{fallback}</>;
  }

  // If authenticated but role not allowed, show fallback
  if (!allowedRoles.includes(user.role)) {
    return <>{fallback}</>;
  }

  // User is authenticated and has correct role
  return <>{children}</>;
};
