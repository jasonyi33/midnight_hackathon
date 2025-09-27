import React, { useState } from 'react'

export function CohortBuilder({ onBuild }: { onBuild?: (filters: Record<string, any>) => void }) {
  const [trait, setTrait] = useState('BRCA1')
  const [minSize, setMinSize] = useState(5)

  function handleBuild(e: React.FormEvent) {
    e.preventDefault()
    onBuild?.({ trait, minSize })
  }

  return (
    <div className="panel">
      <h3>Cohort builder</h3>
      <form onSubmit={handleBuild} className="space-y-3">
        <label className="block">
          <span className="text-sm">Trait</span>
          <select value={trait} onChange={(e) => setTrait(e.target.value)} className="input mt-1">
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
          />
        </label>

        <div className="flex gap-2">
          <button className="btn-primary">Build cohort</button>
        </div>
      </form>
    </div>
  )
}
