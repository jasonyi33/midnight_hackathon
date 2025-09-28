/**
 * Protected Route Component
 * Handles role-based access control for different user types
 */

import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: string[];
  fallback?: ReactNode;
}

export const ProtectedRoute = ({ children, allowedRoles, fallback }: ProtectedRouteProps) => {
  const { user, isAuthenticated } = useAuthStore();

  // Default fallback is to redirect to home page
  const defaultFallback = <Navigate to="/" replace />;
  
  // If not authenticated, show fallback
  if (!isAuthenticated || !user) {
    return <>{fallback || defaultFallback}</>;
  }

  // If authenticated but role not allowed, show fallback
  if (!allowedRoles.includes(user.role)) {
    return <>{fallback || defaultFallback}</>;
  }

  // User is authenticated and has correct role
  return <>{children}</>;
};
