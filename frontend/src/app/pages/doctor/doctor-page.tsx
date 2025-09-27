import { WalletSummary } from '../shared/wallet-summary'
import { useAuthStore } from '../../stores/auth-store'

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
          <h2>Patient lookup</h2>
          <p>Search by wallet address to initiate BRCA1/BRCA2 or CYP2D6 verification requests.</p>
        </article>
        <article className="glass-panel">
          <h2>Request queue</h2>
          <p>Track pending approvals and receive real-time notifications when patients respond.</p>
        </article>
        <article className="glass-panel">
          <h2>Proof archive</h2>
          <p>View cryptographic proofs with validation links once the backend integration is complete.</p>
        </article>
      </section>
    </main>
  )
}
