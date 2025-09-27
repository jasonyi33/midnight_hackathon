import { useState, useEffect } from 'react'
import { useAuthStore } from '../../stores/auth-store'
import { WalletSummary } from '../shared/wallet-summary'
import { GenomeUpload } from '../../components/genome/genome-upload'
import { ProofForm } from '../../components/proof/proof-form'
import { useRealWebSocket, useProofProgress, useVerificationNotifications } from '../../../hooks/useRealWebSocket'
import { useGenomeSummary } from '../../hooks/use-genome'
import { useProofJobs, useProofRecords } from '../../hooks/use-proof-jobs'
import { useVerificationRequests, useVerificationResponse } from '../../hooks/use-verification'
import toast from 'react-hot-toast'
import type { TraitType } from '../../lib/api/types'

export const PatientPage = () => {
  const { user } = useAuthStore((state) => ({ user: state.user }))
  const [selectedTrait, setSelectedTrait] = useState<TraitType>('BRCA1')
  const [activeJobId, setActiveJobId] = useState<string | null>(null)

  // API hooks
  const { data: genomeSummary } = useGenomeSummary()
  const { data: proofRecords } = useProofRecords()
  const { data: verificationRequests, refetch: refetchRequests } = useVerificationRequests()
  const { mutate: respondToVerification } = useVerificationResponse()

  // WebSocket hooks
  const { connected, error: wsError } = useRealWebSocket()
  const { progress, stage } = useProofProgress(activeJobId)
  const pendingNotifications = useVerificationNotifications()

  // Show WebSocket connection status
  useEffect(() => {
    if (connected) {
      toast.success('Real-time connection established', { id: 'ws-connected' })
    } else if (wsError) {
      toast.error(`Connection error: ${wsError}`, { id: 'ws-error' })
    }
  }, [connected, wsError])

  // Show verification notifications
  useEffect(() => {
    if (pendingNotifications.length > 0) {
      const latest = pendingNotifications[pendingNotifications.length - 1]
      toast(`New verification request from ${latest.from}`, { icon: '🔔' })
      refetchRequests()
    }
  }, [pendingNotifications, refetchRequests])

  const handleApproveVerification = (requestId: string, expiresIn: number = 24) => {
    respondToVerification(
      { requestId, approved: true, expiresIn },
      {
        onSuccess: () => {
          toast.success('Verification request approved')
          refetchRequests()
        },
        onError: () => toast.error('Failed to approve verification')
      }
    )
  }

  const handleDenyVerification = (requestId: string) => {
    respondToVerification(
      { requestId, approved: false },
      {
        onSuccess: () => {
          toast.success('Verification request denied')
          refetchRequests()
        },
        onError: () => toast.error('Failed to deny verification')
      }
    )
  }

  return (
    <main className="page-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">Patient Portal</p>
          <h1>Selective genomic proof generation</h1>
          <p className="subtitle">
            Upload variant summaries, manage consents, and generate zero-knowledge proofs for your healthcare providers.
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
        {/* Genome Upload Panel */}
        <article className="glass-panel">
          <h2>Genome Data</h2>
          <GenomeUpload />
        </article>

        {/* Verification Requests Panel */}
        <article className="glass-panel">
          <h2>Verification Requests</h2>
          {verificationRequests && verificationRequests.length > 0 ? (
            <div className="request-list">
              {verificationRequests.map((request) => (
                <div key={request.id} className="verification-request">
                  <div className="request-header">
                    <span className="doctor-name">Dr. {request.doctorName || 'Unknown'}</span>
                    <span className="request-time">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="requested-traits">
                    Requesting: {request.requestedTraits.join(', ')}
                  </div>
                  {request.message && (
                    <div className="request-message">{request.message}</div>
                  )}
                  <div className="request-actions">
                    <button
                      className="approve-btn"
                      onClick={() => handleApproveVerification(request.id)}
                      disabled={request.status !== 'pending'}
                    >
                      Approve (24h)
                    </button>
                    <button
                      className="deny-btn"
                      onClick={() => handleDenyVerification(request.id)}
                      disabled={request.status !== 'pending'}
                    >
                      Deny
                    </button>
                  </div>
                  {request.status !== 'pending' && (
                    <div className={`status-badge ${request.status}`}>
                      {request.status}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-state">No pending verification requests</p>
          )}
        </article>

        {/* Proof Generation Panel */}
        <article className="glass-panel">
          <h2>Generate Proof</h2>
          {genomeSummary?.cid ? (
            <>
              <div className="trait-selector">
                <label>Select trait to prove:</label>
                <div className="trait-buttons">
                  {(['BRCA1', 'BRCA2', 'CYP2D6'] as TraitType[]).map(trait => (
                    <button
                      key={trait}
                      className={`trait-btn ${selectedTrait === trait ? 'active' : ''}`}
                      onClick={() => setSelectedTrait(trait)}
                    >
                      {trait}
                    </button>
                  ))}
                </div>
              </div>

              <ProofForm
                trait={selectedTrait}
                onJobCreated={(jobId) => setActiveJobId(jobId)}
              />

              {activeJobId && progress > 0 && (
                <div className="proof-progress">
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="progress-text">
                    {stage || `Generating proof: ${progress}%`}
                  </div>
                </div>
              )}

              {proofRecords && proofRecords.length > 0 && (
                <div className="proof-history">
                  <h3>Recent Proofs</h3>
                  <div className="proof-list">
                    {proofRecords.slice(0, 3).map((proof) => (
                      <div key={proof.id} className="proof-record">
                        <span className="proof-trait">{proof.traitType}</span>
                        <span className="proof-time">
                          {new Date(proof.createdAt).toLocaleTimeString()}
                        </span>
                        <span className={`proof-status ${proof.status}`}>
                          {proof.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="empty-state">Please upload your genome data first</p>
          )}
        </article>
      </section>
    </main>
  )
}
