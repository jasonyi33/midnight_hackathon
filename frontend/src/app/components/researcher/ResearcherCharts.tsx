import React from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export function ResearcherCharts({ data }: { data: Array<{ name: string; value: number }> }) {
  return (
    <div className="panel">
      <h3>Mutation frequencies</h3>
      <div style={{ width: '100%', height: 240 }}>
        <ResponsiveContainer>
          <BarChart data={data}>
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
