import React, { useState } from 'react'

type PatientLookupProps = {
  onRequest?: (address: string) => void
}

export function PatientLookup({ onRequest }: PatientLookupProps) {
  const [address, setAddress] = useState('')
  const [touched, setTouched] = useState(false)

  const isValidAddress = (addr: string) => /^0x[a-fA-F0-9]{40}$/.test(addr.trim())

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setTouched(true)
    if (!address) return
    if (!isValidAddress(address)) return
    onRequest?.(address.trim())
  }

  const showError = touched && address.length > 0 && !isValidAddress(address)

  return (
    <div className="panel" aria-labelledby="patient-lookup-heading">
      <h3 id="patient-lookup-heading">Patient lookup</h3>
      <form onSubmit={handleSubmit} className="space-y-2">
        <label htmlFor="wallet" className="sr-only">
          Patient wallet address
        </label>
        <input
          id="wallet"
          aria-label="Patient wallet address"
          aria-invalid={showError}
          value={address}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAddress(e.target.value)}
          onBlur={() => setTouched(true)}
          placeholder="0x..."
          className="input"
        />
        {showError && (
          <div role="alert" className="text-sm text-error">
            Please enter a valid wallet address (0x + 40 hex chars)
          </div>
        )}

        <div className="flex items-center gap-2">
          <button type="submit" className="btn-primary" disabled={!isValidAddress(address)}>
            Lookup
          </button>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => {
              setAddress('')
              setTouched(false)
            }}
          >
            Clear
          </button>
        </div>
      </form>
    </div>
  )
}
