import { useState } from 'react'
import { useProofGenerator } from '../../hooks/use-proof-jobs'
import type { TraitType, ProofGenerationPayload } from '../../lib/api/types'

type ProofType = 'boolean' | 'range' | 'set'

type ProofFormProps = {
  trait: TraitType
  onJobCreated?: (jobId: string) => void
}

export const ProofForm = ({ trait, onJobCreated }: ProofFormProps) => {
  const [proofType, setProofType] = useState<ProofType>('boolean')
  const [threshold, setThreshold] = useState(0.5)
  const { mutate: generateProof, isPending } = useProofGenerator()
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    const payload: ProofGenerationPayload = {
      traitType: trait,
      proofKind: proofType,
      ...(proofType === 'range' ? { threshold } : {})
    }
    
    generateProof(payload, {
      onSuccess: (result) => {
        onJobCreated?.(result.jobId)
      }
    })
  }
  
  return (
    <form onSubmit={handleSubmit} className="proof-form">
      <div className="form-group">
        <label htmlFor="proofType">Proof Type</label>
        <select 
          id="proofType" 
          value={proofType}
          onChange={(e) => setProofType(e.target.value as ProofType)}
          disabled={isPending}
        >
          <option value="boolean">Boolean (Present/Absent)</option>
          <option value="range">Range (Score Below Threshold)</option>
          <option value="set">Set Membership</option>
        </select>
      </div>
      
      {proofType === 'range' && (
        <div className="form-group">
          <label htmlFor="threshold">Threshold Value</label>
          <div className="range-control">
            <input 
              type="range" 
              id="threshold"
              min={0} 
              max={1} 
              step={0.05}
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              disabled={isPending}
            />
            <span className="value">{threshold}</span>
          </div>
          <p className="hint">
            Prove the genetic risk score is below this threshold without revealing the actual value
          </p>
        </div>
      )}
      
      <button 
        type="submit" 
        className="form-button"
        disabled={isPending}
      >
        {isPending ? 'Generating...' : 'Generate Proof'}
      </button>
    </form>
  )
}