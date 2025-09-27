import { WalletSummary } from '../shared/wallet-summary'
import { useAuthStore } from '../../stores/auth-store'
import { PatientLookup } from '../../components/doctor/PatientLookup'
import { RequestQueue } from '../../components/doctor/RequestQueue'

export const DoctorPage = () => {
  const { user } = useAuthStore((state) => ({ user: state.user }))

  return (
    <main className="page-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">Doctor Portal</p>
          <h1>Request and review patient proofs</h1>
          <p className="subtitle">
            Submit verification requests, monitor statuses in real time, and access immutable proof history for your patients.
          </p>
        </div>
        <WalletSummary user={user} />
      </header>
      <section className="panel-grid">
        <article className="glass-panel">
          <PatientLookup onRequest={(addr) => console.log('lookup', addr)} />
        </article>
        <article className="glass-panel">
          <RequestQueue
            requests={[
              { id: 'r1', patient: '0xAb...1234', trait: 'BRCA1', status: 'pending' },
              { id: 'r2', patient: '0xCd...5678', trait: 'CYP2D6', status: 'approved' }
            ]}
          />
        </article>
        <article className="glass-panel">
          <h2>Proof archive</h2>
          <p>View cryptographic proofs with validation links once the backend integration is complete.</p>
        </article>
      </section>
    </main>
  )
}
