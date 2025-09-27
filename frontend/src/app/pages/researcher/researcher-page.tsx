import { WalletSummary } from '../shared/wallet-summary'
import { useAuthStore } from '../../stores/auth-store'

export const ResearcherPage = () => {
  const { user } = useAuthStore((state) => ({ user: state.user }))

  return (
    <main className="page-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">Researcher Portal</p>
          <h1>Aggregate genomic insights</h1>
          <p className="subtitle">
            Explore anonymized mutation frequencies, monitor cohort thresholds, and export CSV snapshots for deeper analysis.
          </p>
        </div>
        <WalletSummary user={user} />
      </header>
      <section className="panel-grid">
        <article className="glass-panel">
          <h2>Dashboard</h2>
          <p>Interactive charts powered by BRCA1/BRCA2 and CYP2D6 datasets will land here.</p>
        </article>
        <article className="glass-panel">
          <h2>Cohort builder</h2>
          <p>Filter by trait and ensure a minimum cohort size of five before aggregating data.</p>
        </article>
        <article className="glass-panel">
          <h2>Exports</h2>
          <p>Download anonymized CSV reports and share insights with partnering institutions.</p>
        </article>
      </section>
    </main>
  )
}
