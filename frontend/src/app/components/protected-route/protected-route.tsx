import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuthStore } from '../../stores/auth-store'
import type { Role } from '../../../types/auth'

export type ProtectedRouteProps = {
  allowedRoles: Role[]
  fallback?: ReactNode
  children: ReactNode
}

export const ProtectedRoute = ({ allowedRoles, fallback, children }: ProtectedRouteProps) => {
  const location = useLocation()
  const { isAuthenticated, user } = useAuthStore((state) => ({
    isAuthenticated: state.isAuthenticated,
    user: state.user,
  }))

  if (!isAuthenticated) {
    return fallback ?? <Navigate to="/" replace state={{ from: location }} />
  }

  if (user && !allowedRoles.includes(user.role)) {
    return (
      fallback ?? (
        <Navigate to={`/${user.role}`} replace state={{ from: location }} />
      )
    )
  }

  return <>{children}</>
}
