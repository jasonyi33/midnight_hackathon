import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { LoadingSpinner } from '../../components/ui/loading-spinner'
import './doctor-styles.css'

// Lazy-load the doctor sub-pages
const DoctorDashboard = lazy(() => import('./dashboard'))
const DoctorPatients = lazy(() => import('./patients'))
const DoctorVerification = lazy(() => import('./verification'))

export const DoctorPage = () => {
  return (
    <Suspense fallback={<div className="loading-container"><LoadingSpinner message="Loading..." /></div>}>
      <Routes>
        <Route index element={<Navigate to="/doctor/dashboard" replace />} />
        <Route path="dashboard" element={<DoctorDashboard />} />
        <Route path="patients" element={<DoctorPatients />} />
        <Route path="verification" element={<DoctorVerification />} />
        <Route path="*" element={<Navigate to="/doctor/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}
