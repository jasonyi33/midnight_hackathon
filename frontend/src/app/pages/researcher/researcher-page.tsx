import { WalletSummary } from '../shared/wallet-summary'
import { useAuthStore } from '../../stores/auth-store'
import { CohortBuilder } from '../../components/researcher/CohortBuilder'
import { ResearcherCharts } from '../../components/researcher/ResearcherCharts'
import { exportCsv } from '../../utils/csvExport'

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
          <ResearcherCharts data={[{ name: 'BRCA1', value: 12 }, { name: 'BRCA2', value: 7 }, { name: 'CYP2D6', value: 4 }]} />
        </article>
        <article className="glass-panel">
          <CohortBuilder onBuild={(filters) => console.log('build cohort', filters)} />
        </article>
        <article className="glass-panel">
          <h2>Exports</h2>
          <p>Download anonymized CSV reports and share insights with partnering institutions.</p>
          <div className="mt-3">
            <button className="btn-primary" onClick={() => exportCsv('cohort.csv', [{ trait: 'BRCA1', count: 12 }, { trait: 'BRCA2', count: 7 }])}>
              Export CSV
            </button>
          </div>
        </article>
      </section>
    </main>
  )
}
