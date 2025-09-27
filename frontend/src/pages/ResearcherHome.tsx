import React from 'react'
import { GlassCard } from '../ui/GlassCard'
import { SimpleBarChart } from '../ui/SimpleBarChart'

export default function ResearcherHome() {
  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 gap-6">
      <GlassCard className="p-6">
        <h2 className="text-xl font-semibold mb-4">Researcher Portal</h2>
        <p className="text-sm text-gray-200">Aggregate mutation frequencies and export CSVs (minimum cohort size enforced).</p>
      </GlassCard>

      <GlassCard className="p-6">
        <h3 className="text-lg font-medium">Mutation Frequency</h3>
        <div className="mt-4">
          <SimpleBarChart />
        </div>
      </GlassCard>
    </div>
  )
}
