import React from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

type DataPoint = { name: string; value: number }

export function ResearcherCharts({ data }: { data: DataPoint[] }) {
  return (
    <div className="panel" role="region" aria-label="Mutation frequency charts">
      <h3>Mutation frequencies</h3>
      <div style={{ width: '100%', height: 240 }}>
        <ResponsiveContainer>
          <BarChart data={data} aria-label="Bar chart showing mutation frequencies">
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#6c63ff" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
