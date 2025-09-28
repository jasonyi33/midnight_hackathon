import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { LoadingSpinner } from '../../components/ui/loading-spinner'
import './researcher-styles.css'

// Lazy-load the researcher sub-pages
const ResearcherDashboard = lazy(() => import('./dashboard'))
const ResearcherData = lazy(() => import('./data'))
const ResearcherAnalysis = lazy(() => import('./analysis'))

export const ResearcherPage = () => {
  return (
    <Suspense fallback={<div className="loading-container"><LoadingSpinner message="Loading..." /></div>}>
      <Routes>
        <Route index element={<Navigate to="/researcher/dashboard" replace />} />
        <Route path="dashboard" element={<ResearcherDashboard />} />
        <Route path="data" element={<ResearcherData />} />
        <Route path="analysis" element={<ResearcherAnalysis />} />
        <Route path="*" element={<Navigate to="/researcher/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}
