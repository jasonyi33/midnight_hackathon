import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { LoadingSpinner } from '../../components/ui/loading-spinner'
import './patient-styles.css'

// Lazy-load the patient sub-pages
const PatientDashboard = lazy(() => import('./dashboard'))
const PatientGenome = lazy(() => import('./genome'))
const PatientRequests = lazy(() => import('./requests'))

export const PatientPage = () => {
  return (
    <Suspense fallback={<div className="loading-container"><LoadingSpinner message="Loading..." /></div>}>
      <Routes>
        <Route index element={<Navigate to="/patient/dashboard" replace />} />
        <Route path="dashboard" element={<PatientDashboard />} />
        <Route path="genome" element={<PatientGenome />} />
        <Route path="requests" element={<PatientRequests />} />
        <Route path="*" element={<Navigate to="/patient/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}
