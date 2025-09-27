import React from 'react'

type Request = { id: string; patient: string; trait: string; status: string }

export function RequestQueue({ requests = [] }: { requests?: Request[] }) {
  return (
    <div className="panel" aria-labelledby="request-queue-heading">
      <h3 id="request-queue-heading">Request queue</h3>
      {requests.length === 0 ? (
        <p className="muted">No pending requests</p>
      ) : (
        <ul className="space-y-2" aria-live="polite">
          {requests.map((r) => (
            <li key={r.id} className="request-item">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium">{r.patient}</div>
                  <div className="text-sm muted">{r.trait}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`status status-${r.status}`}>{r.status}</span>
                  <button className="btn-sm" aria-label={`View request ${r.id}`}>View</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
