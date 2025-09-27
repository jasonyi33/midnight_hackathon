import { useAuthStore } from '../../stores/auth-store'
import { WalletSummary } from '../shared/wallet-summary'
import { GenomeUpload } from '../../components/genome/genome-upload'
import { PatientDashboard } from './patient-dashboard'
import { ConsentManager } from './consent-manager'
import { useGenomeSummary } from '../../hooks/use-genome'

export const PatientPage = () => {
  const { user } = useAuthStore((state) => ({ user: state.user }))
  const { data: genomeSummary } = useGenomeSummary()
  
  return (
    <main className="page-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">patient portal</p>
          <h1>selective genomic proof generation</h1>
          <p className="subtitle">
            upload variant summaries, manage consents, and generate zero-knowledge proofs for your healthcare providers.
          </p>
        </div>
        <WalletSummary user={user} />
      </header>
      <section className="panel-grid">
        <article className="glass-panel">
          <h2>genome uploads</h2>
          {!genomeSummary?.cid ? (
            <GenomeUpload />
          ) : (
            <PatientDashboard genomeSummary={genomeSummary} />
          )}
        </article>
        <article className="glass-panel">
          <h2>verification requests</h2>
          <ConsentManager />
        </article>
        <article className="glass-panel">
          <h2>proof generation</h2>
          {!genomeSummary?.cid ? (
            <p className="muted-text">please upload your genome data to generate proofs.</p>
          ) : (
            <PatientDashboard genomeSummary={genomeSummary} showProofForm={true} />
          )}
        </article>
      </section>
    </main>
  )
}
