import { Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import LandingPage from './LandingPage'
import { useAuthStore } from './store/authStore'
import { ProtectedRoute } from './app/components/protected-route'
import { ConnectWalletGate } from './app/auth/ConnectWalletGate'

// UI Components
import { LoadingSpinner } from './app/components/ui/loading-spinner'
import NotFoundPage from './app/pages/not-found'

// Lazy load pages for better performance
const PatientPage = lazy(() => import('./app/pages/patient/patient-page').then(module => ({ default: module.PatientPage })))
const DoctorPage = lazy(() => import('./app/pages/doctor/doctor-page').then(module => ({ default: module.DoctorPage })))
const ResearcherPage = lazy(() => import('./app/pages/researcher/researcher-page').then(module => ({ default: module.ResearcherPage })))

const App = () => {
  const { isAuthenticated, user } = useAuthStore()

  // Redirect to appropriate page based on user role
  const getRedirectPath = () => {
    if (!isAuthenticated || !user) return '/'
    
    switch (user.role) {
      case 'patient':
        return '/patient'
      case 'doctor':
        return '/doctor'
      case 'researcher':
        return '/researcher'
      default:
        return '/'
    }
  }

  return (
    <Suspense fallback={<div className="loading-container"><LoadingSpinner message="Loading application..." /></div>}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        
        {/* Patient Routes */}
        <Route 
          path="/patient/*" 
          element={
            <ProtectedRoute allowedRoles={['patient']}>
              <ConnectWalletGate>
                <PatientPage />
              </ConnectWalletGate>
            </ProtectedRoute>
          } 
        />
        
        {/* Doctor Routes */}
        <Route 
          path="/doctor/*" 
          element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <ConnectWalletGate>
                <DoctorPage />
              </ConnectWalletGate>
            </ProtectedRoute>
          } 
        />
        
        {/* Researcher Routes */}
        <Route 
          path="/researcher/*" 
          element={
            <ProtectedRoute allowedRoles={['researcher']}>
              <ConnectWalletGate>
                <ResearcherPage />
              </ConnectWalletGate>
            </ProtectedRoute>
          } 
        />
        
        <Route path="/redirect" element={<Navigate to={getRedirectPath()} replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}

export default App
