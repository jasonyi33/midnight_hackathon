import React, { useState } from 'react'

type CohortBuilderProps = {
  onBuild?: (filters: { trait: string; minSize: number }) => void
}

export function CohortBuilder({ onBuild }: CohortBuilderProps) {
  const [trait, setTrait] = useState('BRCA1')
  const [minSize, setMinSize] = useState(5)
  const [error, setError] = useState<string | null>(null)

  function handleBuild(e: React.FormEvent) {
    e.preventDefault()
    const minAllowed = 5
    if (minSize < minAllowed) {
      setError(`Minimum cohort size is ${minAllowed} to protect anonymity`)
      return
    }
    setError(null)
    onBuild?.({ trait, minSize })
  }

  return (
    <div className="panel" aria-labelledby="cohort-builder-heading">
      <h3 id="cohort-builder-heading">Cohort builder</h3>
      <form onSubmit={handleBuild} className="space-y-3">
        <label className="block">
          <span className="text-sm">Trait</span>
          <select value={trait} onChange={(e) => setTrait(e.target.value)} className="input mt-1" aria-label="Select trait">
            <option value="BRCA1">BRCA1</option>
            <option value="BRCA2">BRCA2</option>
            <option value="CYP2D6">CYP2D6</option>
          </select>
        </label>

        <label className="block">
          <span className="text-sm">Minimum cohort size</span>
          <input
            type="number"
            min={1}
            value={minSize}
            onChange={(e) => setMinSize(Number(e.target.value))}
            className="input mt-1"
            aria-describedby="min-size-help"
          />
          <div id="min-size-help" className="text-xs muted">Minimum allowed: 5 (enforced to protect privacy)</div>
        </label>

        {error && (
          <div role="alert" className="text-sm text-error">{error}</div>
        )}

        <div className="flex gap-2">
          <button type="submit" className="btn-primary" aria-disabled={!!error}>Build cohort</button>
        </div>
      </form>
    </div>
  )
}
