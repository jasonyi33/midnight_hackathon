import React from 'react'

export function RequestQueue({ requests = [] }: { requests?: Array<{ id: string; patient: string; trait: string; status: string }> }) {
  return (
    <div className="panel">
      <h3>Request queue</h3>
      {requests.length === 0 ? (
        <p className="muted">No pending requests</p>
      ) : (
        <ul className="space-y-2">
          {requests.map((r) => (
            <li key={r.id} className="request-item">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium">{r.patient}</div>
                  <div className="text-sm muted">{r.trait}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`status status-${r.status}`}>{r.status}</span>
                  <button className="btn-sm">View</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
