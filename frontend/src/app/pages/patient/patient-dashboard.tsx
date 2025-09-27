import { useState } from 'react'
import { useProofHistory, useProofJob } from '../../hooks/use-proof-jobs'
import { ProofForm } from '../../components/proof/proof-form'
import type { GenomeSummary, TraitType } from '../../lib/api/types'

type PatientDashboardProps = {
  genomeSummary: GenomeSummary
  showProofForm?: boolean
}

export const PatientDashboard = ({ genomeSummary, showProofForm }: PatientDashboardProps) => {
  const [activeJobId, setActiveJobId] = useState<string | null>(null)
  const [selectedTrait, setSelectedTrait] = useState<TraitType | null>(null)
  
  const { data: proofJob } = useProofJob(activeJobId)
  const { data: proofHistory } = useProofHistory()
  
  const handleTraitSelect = (trait: TraitType) => {
    setSelectedTrait(trait === selectedTrait ? null : trait)
    setActiveJobId(null)
  }
  
  const handleJobCreated = (jobId: string) => {
    setActiveJobId(jobId)
  }
  
  return (
    <div className="patient-dashboard">
      <div className="genome-summary">
        <div className="summary-header">
          <h3>genome data summary</h3>
          <span className="upload-status success">uploaded</span>
        </div>
        
        <div className="info-item">
          <span className="info-label">ipfs cid</span>
          <code className="info-value">{genomeSummary.cid}</code>
        </div>
        
        <div className="info-item">
          <span className="info-label">uploaded</span>
          <span className="info-value">{new Date(genomeSummary.uploadedAt!).toLocaleDateString()}</span>
        </div>
      </div>
      
      <div className="trait-selection">
        <h3>available traits</h3>
        <div className="trait-grid">
          {genomeSummary.markers.map(marker => (
            <button 
              key={marker.id}
              className={`trait-button ${marker.available ? 'available' : 'unavailable'} ${selectedTrait === marker.id ? 'selected' : ''}`}
              disabled={!marker.available}
              onClick={() => marker.available && handleTraitSelect(marker.id)}
            >
              <span className="trait-name">{marker.id}</span>
              <span className="trait-desc">{marker.label}</span>
            </button>
          ))}
        </div>
      </div>
      
      {showProofForm && selectedTrait && !activeJobId && (
        <div className="proof-generation-form">
          <h3>generate proof for {selectedTrait}</h3>
          <p className="trait-description">
            {genomeSummary.markers.find(m => m.id === selectedTrait)?.description}
          </p>
          <ProofForm trait={selectedTrait} onJobCreated={handleJobCreated} />
        </div>
      )}
      
      {activeJobId && proofJob && (
        <div className="proof-progress">
          <h3>proof generation: {proofJob.traitType}</h3>
          <div className="progress-container">
            <div className="progress-bar" style={{ width: `${proofJob.progress}%` }}></div>
          </div>
          <div className="progress-status">
            <span className="status-label">status:</span>
            <span className="status-value">{proofJob.status}</span>
            <span className="progress-percentage">{Math.round(proofJob.progress)}%</span>
          </div>
        </div>
      )}
      
      {proofHistory && proofHistory.length > 0 && (
        <div className="proof-history">
          <h3>recent proofs</h3>
          <div className="proof-list">
            {proofHistory.slice(0, 5).map(proof => (
              <div key={proof.id} className="proof-item">
                <span className="proof-trait">{proof.traitType}</span>
                <span className="proof-date">{new Date(proof.generatedAt).toLocaleDateString()}</span>
                <span className={`proof-status ${proof.status}`}>{proof.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}