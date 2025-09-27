import React from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const data = [
  { name: 'BRCA1', value: 12 },
  { name: 'BRCA2', value: 8 },
  { name: 'CYP2D6', value: 20 },
]

export const SimpleBarChart: React.FC = () => (
  <div style={{ width: '100%', height: 240 }}>
    <ResponsiveContainer>
      <BarChart data={data}>
        <XAxis dataKey="name" stroke="#cbd5e1" />
        <YAxis stroke="#cbd5e1" />
        <Tooltip />
        <Bar dataKey="value" fill="#6c63ff" />
      </BarChart>
    </ResponsiveContainer>
  </div>
)

export default SimpleBarChart
