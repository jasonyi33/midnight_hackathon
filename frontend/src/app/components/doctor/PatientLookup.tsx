import React, { useState } from 'react'

export function PatientLookup({ onRequest }: { onRequest?: (address: string) => void }) {
  const [address, setAddress] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!address) return
    onRequest?.(address.trim())
  }

  return (
    <div className="panel">
      <h3>Patient lookup</h3>
      <form onSubmit={handleSubmit} className="space-y-2">
        <label htmlFor="wallet" className="sr-only">
          Patient wallet address
        </label>
        <input
          id="wallet"
          aria-label="Patient wallet address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="0x..."
          className="input"
        />
        <div className="flex items-center gap-2">
          <button type="submit" className="btn-primary">
            Lookup
          </button>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => setAddress('')}
          >
            Clear
          </button>
        </div>
      </form>
    </div>
  )
}
