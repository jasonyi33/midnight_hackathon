import { useState, useEffect } from 'react'
import { WalletSummary } from '../shared/wallet-summary'
import { useAuthStore } from '../../stores/auth-store'
import { CohortBuilder } from '../../components/researcher/CohortBuilder'
import { ResearcherCharts } from '../../components/researcher/ResearcherCharts'
import { useRealWebSocket } from '../../../hooks/useRealWebSocket'
import { apiService } from '../../../services/api.service'
import toast from 'react-hot-toast'

interface MutationFrequency {
  trait: string
  count: number
  percentage: number
  confidence: number
}

interface MetabolizerDistribution {
  type: string
  count: number
  percentage: number
}

interface AggregateData {
  totalPatients: number
  mutationFrequencies: MutationFrequency[]
  metabolizerDistribution: MetabolizerDistribution[]
  lastUpdated: string
  minimumCohortMet: boolean
}

export const ResearcherPage = () => {
  const { user } = useAuthStore((state) => ({ user: state.user }))
  const [aggregateData, setAggregateData] = useState<AggregateData | null>(null)
  const [loading, setLoading] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)

  // WebSocket for real-time updates
  const { connected, onDataUpdated } = useRealWebSocket()

  // Fetch aggregate data
  const fetchAggregateData = async () => {
    try {
      setLoading(true)
      const data = await apiService.getAggregatedData()

      // Check minimum cohort size
      if (data.totalPatients < 5) {
        toast.error('Minimum cohort size not met. Need at least 5 patients for privacy.')
        setAggregateData({
          ...data,
          minimumCohortMet: false,
          mutationFrequencies: [],
          metabolizerDistribution: []
        })
      } else {
        setAggregateData({
          ...data,
          minimumCohortMet: true
        })
      }
    } catch (error) {
      toast.error('Failed to fetch aggregate data')
      console.error('Aggregate data error:', error)
    } finally {
      setLoading(false)
    }
  }

  // Export data as CSV
  const handleExportCSV = async (dataType: 'mutations' | 'metabolizers' | 'trends') => {
    try {
      await apiService.exportData(dataType)
      toast.success(`${dataType} data exported successfully`)
    } catch (error) {
      toast.error('Failed to export data')
    }
  }

  // Listen for real-time updates
  useEffect(() => {
    if (connected && autoRefresh) {
      onDataUpdated(() => {
        toast('New data available - refreshing charts', { icon: '📊' })
        fetchAggregateData()
      })
    }
  }, [connected, autoRefresh, onDataUpdated])

  // Load initial data
  useEffect(() => {
    fetchAggregateData()
  }, [])

  // Show connection status
  useEffect(() => {
    if (connected) {
      toast.success('Real-time connection established', { id: 'ws-connected' })
    }
  }, [connected])

  // Prepare chart data
  const getChartData = () => {
    if (!aggregateData || !aggregateData.minimumCohortMet) {
      return []
    }

    return aggregateData.mutationFrequencies.map(freq => ({
      name: freq.trait,
      value: freq.count,
      percentage: freq.percentage.toFixed(1) + '%',
      confidence: (freq.confidence * 100).toFixed(0) + '% CI'
    }))
  }

  const getMetabolizerData = () => {
    if (!aggregateData || !aggregateData.minimumCohortMet) {
      return []
    }

    return aggregateData.metabolizerDistribution.map(dist => ({
      name: dist.type,
      value: dist.count,
      percentage: dist.percentage.toFixed(1) + '%'
    }))
  }

  return (
    <main className="page-shell researcher-portal">
      <header className="page-header">
        <div>
          <p className="eyebrow">Researcher Portal</p>
          <h1>Aggregate genomic insights</h1>
          <p className="subtitle">
            Explore anonymized mutation frequencies, monitor cohort thresholds, and export CSV snapshots for deeper analysis.
          </p>
        </div>
        <WalletSummary user={user} />
        {connected && (
          <div className="connection-status">
            <span className="status-dot connected" />
            Real-time connected
            <label className="auto-refresh">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
              />
              Auto-refresh
            </label>
          </div>
        )}
      </header>

      {aggregateData && !aggregateData.minimumCohortMet && (
        <div className="cohort-warning">
          <span className="warning-icon">⚠️</span>
          <span className="warning-text">
            Minimum cohort size not met. Need at least 5 patients for privacy protection.
            Current: {aggregateData.totalPatients}/5
          </span>
        </div>
      )}

      <section className="panel-grid">
        {/* Mutation Frequencies Panel */}
        <article className="glass-panel">
          <h2>Mutation Frequencies</h2>
          {loading ? (
            <div className="loading-state">Loading aggregate data...</div>
          ) : aggregateData && aggregateData.minimumCohortMet ? (
            <>
              <ResearcherCharts data={getChartData()} />
              <div className="stats-summary">
                <div className="stat-item">
                  <span className="stat-label">Total Patients:</span>
                  <span className="stat-value">{aggregateData.totalPatients}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Last Updated:</span>
                  <span className="stat-value">
                    {new Date(aggregateData.lastUpdated).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <p className="empty-state">Insufficient data for display</p>
          )}
        </article>

        {/* Metabolizer Distribution Panel */}
        <article className="glass-panel">
          <h2>CYP2D6 Metabolizer Distribution</h2>
          {aggregateData && aggregateData.minimumCohortMet && getMetabolizerData().length > 0 ? (
            <div className="metabolizer-distribution">
              {getMetabolizerData().map((item) => (
                <div key={item.name} className="distribution-item">
                  <div className="distribution-header">
                    <span className="distribution-name">{item.name}</span>
                    <span className="distribution-percentage">{item.percentage}</span>
                  </div>
                  <div className="distribution-bar">
                    <div
                      className="distribution-fill"
                      style={{
                        width: item.percentage,
                        background: getMetabolizerColor(item.name)
                      }}
                    />
                  </div>
                  <div className="distribution-count">
                    {item.value} patients
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-state">
              {aggregateData?.minimumCohortMet
                ? 'No CYP2D6 metabolizer data available'
                : 'Insufficient data for display'}
            </p>
          )}
        </article>

        {/* Cohort Builder Panel */}
        <article className="glass-panel">
          <h2>Cohort Analysis</h2>
          <CohortBuilder
            onBuild={(filters) => {
              console.log('Building cohort with filters:', filters)
              toast.success('Cohort analysis started')
              // In a real implementation, this would trigger a new analysis
            }}
          />

          <div className="analysis-info">
            <h3>Privacy Protection</h3>
            <ul>
              <li>Minimum cohort size: 5 patients</li>
              <li>No individual-level data exposed</li>
              <li>Aggregates only with noise addition</li>
              <li>Differential privacy applied</li>
            </ul>
          </div>
        </article>

        {/* Export Panel */}
        <article className="glass-panel">
          <h2>Data Exports</h2>
          <p>Download anonymized CSV reports for offline analysis or sharing with partnering institutions.</p>

          <div className="export-options">
            <button
              className="export-btn"
              onClick={() => handleExportCSV('mutations')}
              disabled={!aggregateData?.minimumCohortMet}
            >
              <span className="export-icon">📊</span>
              Export Mutation Frequencies
            </button>

            <button
              className="export-btn"
              onClick={() => handleExportCSV('metabolizers')}
              disabled={!aggregateData?.minimumCohortMet}
            >
              <span className="export-icon">💊</span>
              Export Metabolizer Distribution
            </button>

            <button
              className="export-btn"
              onClick={() => handleExportCSV('trends')}
              disabled={!aggregateData?.minimumCohortMet}
            >
              <span className="export-icon">📈</span>
              Export Trend Analysis
            </button>
          </div>

          {!aggregateData?.minimumCohortMet && (
            <p className="export-warning">
              Exports disabled until minimum cohort size is met
            </p>
          )}
        </article>
      </section>
    </main>
  )
}

// Helper function to get color for metabolizer types
function getMetabolizerColor(type: string): string {
  const colors: Record<string, string> = {
    'Poor': '#f87171',
    'Intermediate': '#fbbf24',
    'Normal': '#10b981',
    'Rapid': '#60a5fa',
    'Ultrarapid': '#a78bfa'
  }
  return colors[type] || '#8b5cf6'
}