import { useAuthStore } from '../../stores/auth-store'
import { WalletSummary } from '../shared/wallet-summary'

export const PatientPage = () => {
  const { user } = useAuthStore((state) => ({ user: state.user }))

  return (
    <main className="page-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">Patient Portal</p>
          <h1>Selective genomic proof generation</h1>
          <p className="subtitle">
            Upload variant summaries, manage consents, and generate zero-knowledge proofs for your healthcare providers.
          </p>
        </div>
        <WalletSummary user={user} />
      </header>
      <section className="panel-grid">
        <article className="glass-panel">
          <h2>Genome uploads</h2>
          <p>Coming soon: drag-and-drop JSON upload with schema validation and encrypted storage.</p>
        </article>
        <article className="glass-panel">
          <h2>Verification requests</h2>
          <p>Pending doctor requests will appear here with consent controls and expiry options.</p>
        </article>
        <article className="glass-panel">
          <h2>Proof generation</h2>
          <p>Select traits such as BRCA1, BRCA2, or CYP2D6 to generate proofs and share them securely.</p>
        </article>
      </section>
    </main>
  )
}
