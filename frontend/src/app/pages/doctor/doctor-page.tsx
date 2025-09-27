import { useState, useEffect } from 'react'
import { WalletSummary } from '../shared/wallet-summary'
import { useAuthStore } from '../../stores/auth-store'
import { PatientLookup } from '../../components/doctor/PatientLookup'
import { RequestQueue } from '../../components/doctor/RequestQueue'
import { useRealWebSocket } from '../../../hooks/useRealWebSocket'
import { apiService } from '../../../services/api.service'
import toast from 'react-hot-toast'

interface VerificationRequest {
  id: string
  patientAddress: string
  requestedTraits: string[]
  status: 'pending' | 'approved' | 'denied'
  message?: string
  createdAt: string
  respondedAt?: string
}

interface ProofRecord {
  id: string
  patientAddress: string
  traitType: string
  proofHash: string
  status: 'valid' | 'invalid'
  createdAt: string
  verificationLink?: string
}

export const DoctorPage = () => {
  const { user } = useAuthStore((state) => ({ user: state.user }))
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>([])
  const [proofRecords, setProofRecords] = useState<ProofRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<string>('')

  // WebSocket for real-time updates
  const { connected, onVerificationRequest } = useRealWebSocket()

  // Fetch verification history
  const fetchVerificationHistory = async () => {
    try {
      setLoading(true)
      const history = await apiService.getVerificationHistory(user?.id)
      setVerificationRequests(history.requests || [])
      setProofRecords(history.proofs || [])
    } catch (error) {
      toast.error('Failed to fetch verification history')
    } finally {
      setLoading(false)
    }
  }

  // Request verification from patient
  const handleRequestVerification = async (patientAddress: string, traits: string[]) => {
    try {
      const response = await apiService.requestVerification({
        patientAddress,
        requestedTraits: traits,
        message: `Dr. ${user?.name || 'Unknown'} is requesting genetic verification`,
        expiresIn: 24
      })

      toast.success('Verification request sent')

      // Add to local state
      setVerificationRequests(prev => [{
        id: response.requestId,
        patientAddress,
        requestedTraits: traits,
        status: 'pending',
        createdAt: response.createdAt,
        message: `Dr. ${user?.name} is requesting genetic verification`
      }, ...prev])
    } catch (error) {
      toast.error('Failed to send verification request')
    }
  }

  // Listen for real-time updates
  useEffect(() => {
    if (connected) {
      onVerificationRequest((data) => {
        // Update requests when patient responds
        if (data.action === 'APPROVED' || data.action === 'DENIED') {
          setVerificationRequests(prev =>
            prev.map(req =>
              req.id === data.requestId
                ? { ...req, status: data.action.toLowerCase() as 'approved' | 'denied', respondedAt: new Date().toISOString() }
                : req
            )
          )

          const statusMsg = data.action === 'APPROVED'
            ? `Patient approved verification request`
            : `Patient denied verification request`
          toast(statusMsg, { icon: data.action === 'APPROVED' ? '✅' : '❌' })

          // Refresh proof records if approved
          if (data.action === 'APPROVED') {
            fetchVerificationHistory()
          }
        }
      })
    }
  }, [connected, onVerificationRequest])

  // Load initial data
  useEffect(() => {
    if (user?.id) {
      fetchVerificationHistory()
    }
  }, [user?.id])

  // Show connection status
  useEffect(() => {
    if (connected) {
      toast.success('Real-time connection established', { id: 'ws-connected' })
    }
  }, [connected])

  return (
    <main className="page-shell doctor-portal">
      <header className="page-header">
        <div>
          <p className="eyebrow">Doctor Portal</p>
          <h1>Request and review patient proofs</h1>
          <p className="subtitle">
            Submit verification requests, monitor statuses in real time, and access immutable proof history for your patients.
          </p>
        </div>
        <WalletSummary user={user} />
        {connected && (
          <div className="connection-status">
            <span className="status-dot connected" />
            Real-time connected
          </div>
        )}
      </header>

      <section className="panel-grid">
        {/* Patient Lookup Panel */}
        <article className="glass-panel">
          <h2>Request Verification</h2>
          <PatientLookup
            onRequest={(address, traits) => {
              handleRequestVerification(address, traits)
            }}
          />

          <div className="trait-selection">
            <h3>Available Traits</h3>
            <div className="trait-checkboxes">
              <label>
                <input type="checkbox" value="BRCA1" defaultChecked />
                BRCA1 Mutation
              </label>
              <label>
                <input type="checkbox" value="BRCA2" />
                BRCA2 Mutation
              </label>
              <label>
                <input type="checkbox" value="CYP2D6" />
                CYP2D6 Metabolizer
              </label>
            </div>
          </div>
        </article>

        {/* Request Queue Panel */}
        <article className="glass-panel">
          <h2>Verification Requests</h2>
          {loading ? (
            <div className="loading-state">Loading requests...</div>
          ) : verificationRequests.length > 0 ? (
            <RequestQueue
              requests={verificationRequests.map(req => ({
                id: req.id,
                patient: req.patientAddress.slice(0, 6) + '...' + req.patientAddress.slice(-4),
                trait: req.requestedTraits.join(', '),
                status: req.status,
                timestamp: new Date(req.createdAt).toLocaleString()
              }))}
            />
          ) : (
            <p className="empty-state">No verification requests yet</p>
          )}
        </article>

        {/* Proof Archive Panel */}
        <article className="glass-panel">
          <h2>Proof Archive</h2>
          {proofRecords.length > 0 ? (
            <div className="proof-archive">
              {proofRecords.map((proof) => (
                <div key={proof.id} className="proof-item">
                  <div className="proof-header">
                    <span className="patient-address">
                      {proof.patientAddress.slice(0, 8)}...{proof.patientAddress.slice(-6)}
                    </span>
                    <span className="proof-trait">{proof.traitType}</span>
                  </div>

                  <div className="proof-details">
                    <div className="proof-hash">
                      <span className="label">Proof Hash:</span>
                      <span className="value">{proof.proofHash.slice(0, 16)}...</span>
                    </div>

                    <div className="proof-meta">
                      <span className={`proof-status ${proof.status}`}>
                        {proof.status}
                      </span>
                      <span className="proof-date">
                        {new Date(proof.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {proof.verificationLink && (
                    <a
                      href={proof.verificationLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="verify-link"
                    >
                      Verify on Blockchain →
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-state">
              {loading ? 'Loading proofs...' : 'No proofs available yet. Request verification from patients to see their proofs here.'}
            </p>
          )}
        </article>
      </section>
    </main>
  )
}