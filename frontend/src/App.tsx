import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './app/components/protected-route'
import { DoctorPage } from './app/pages/doctor/doctor-page'
import { PatientPage } from './app/pages/patient/patient-page'
import { ResearcherPage } from './app/pages/researcher/researcher-page'
import { ConnectWalletGate } from './app/pages/shared/connect-wallet-gate'

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/patient" replace />} />
      <Route
        path="/patient"
        element={
          <ProtectedRoute allowedRoles={["patient"]} fallback={<ConnectWalletGate />}
          >
            <PatientPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor"
        element={
          <ProtectedRoute allowedRoles={["doctor"]} fallback={<ConnectWalletGate requiredRole="doctor" />}
          >
            <DoctorPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/researcher"
        element={
          <ProtectedRoute
            allowedRoles={["researcher"]}
            fallback={<ConnectWalletGate requiredRole="researcher" />}
          >
            <ResearcherPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/patient" replace />} />
    </Routes>
  )
}

export default App
