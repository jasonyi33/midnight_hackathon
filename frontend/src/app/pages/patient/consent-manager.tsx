import { useState } from 'react'
import { useVerificationRequests, useRespondToVerification } from '../../hooks/use-verification'
import type { VerificationRequest } from '../../lib/api/types'

export const ConsentManager = () => {
  const { data: requests, isLoading } = useVerificationRequests()
  const { mutate: respondToRequest } = useRespondToVerification()
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null)
  const [expiryDays, setExpiryDays] = useState(7)
  
  const handleApprove = (requestId: string) => {
    const expiryTime = new Date()
    expiryTime.setDate(expiryTime.getDate() + expiryDays)
    
    respondToRequest({
      requestId,
      approved: true,
      expiryTime: expiryTime.toISOString()
    })
  }
  
  const handleDeny = (requestId: string) => {
    respondToRequest({
      requestId,
      approved: false
    })
  }
  
  if (isLoading) {
    return <div className="loading-state">loading verification requests...</div>
  }
  
  if (!requests || requests.length === 0) {
    return <p className="muted-text">no pending verification requests from doctors.</p>
  }
  
  const pendingRequests = requests.filter(req => req.status === 'pending')
  const activeRequests = requests.filter(req => req.status === 'approved')
  const deniedRequests = requests.filter(req => req.status === 'denied')
  
  return (
    <div className="consent-manager">
      {pendingRequests.length > 0 && (
        <div className="request-section">
          <h3>pending requests</h3>
          <div className="request-list">
            {pendingRequests.map(req => (
              <div key={req.id} className="request-item">
                <div className="request-header">
                  <span className="doctor-name">{req.doctorDisplayName || 'dr. unknown'}</span>
                  <span className="request-date">{new Date(req.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="request-traits">
                  <span className="trait-pill">{req.traitType}</span>
                </div>
                <div className="request-purpose">
                  <p>verification request for {req.traitType}</p>
                </div>
                <div className="request-actions">
                  <button 
                    className="approve-button"
                    onClick={() => setSelectedRequest(req)}
                  >
                    approve
                  </button>
                  <button 
                    className="deny-button"
                    onClick={() => handleDeny(req.id)}
                  >
                    deny
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {activeRequests.length > 0 && (
        <div className="request-section">
          <h3>active consents</h3>
          <div className="request-list">
            {activeRequests.map(req => (
              <div key={req.id} className="request-item approved">
                <div className="request-header">
                  <span className="doctor-name">{req.doctorDisplayName || 'dr. unknown'}</span>
                  <span className="expiry-date">
                    expires: {new Date(req.expiresAt!).toLocaleDateString()}
                  </span>
                </div>
                <div className="request-traits">
                  <span className="trait-pill">{req.traitType}</span>
                </div>
                <div className="request-actions">
                  <button 
                    className="revoke-button"
                    onClick={() => handleDeny(req.id)}
                  >
                    revoke access
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {deniedRequests.length > 0 && (
        <div className="request-section">
          <h3>denied requests</h3>
          <div className="request-list">
            {deniedRequests.slice(0, 3).map(req => (
              <div key={req.id} className="request-item denied">
                <div className="request-header">
                  <span className="doctor-name">{req.doctorDisplayName || 'dr. unknown'}</span>
                  <span className="request-date">{new Date(req.respondedAt!).toLocaleDateString()}</span>
                </div>
                <div className="request-traits muted">
                  <span className="trait-pill">{req.traitType}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {selectedRequest && (
        <div className="approval-modal">
          <div className="modal-content">
            <h3>set access duration</h3>
            <p>approve access for dr. {selectedRequest.doctorDisplayName || 'unknown'}</p>
            <div className="form-group">
              <label htmlFor="expiryDays">access duration (days):</label>
              <input
                id="expiryDays"
                type="range"
                min="1"
                max="30"
                value={expiryDays}
                onChange={e => setExpiryDays(parseInt(e.target.value))}
              />
              <span>{expiryDays} days</span>
            </div>
            <div className="modal-actions">
              <button 
                className="approve-button"
                onClick={() => {
                  handleApprove(selectedRequest.id)
                  setSelectedRequest(null)
                }}
              >
                confirm
              </button>
              <button 
                className="cancel-button"
                onClick={() => setSelectedRequest(null)}
              >
                cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}