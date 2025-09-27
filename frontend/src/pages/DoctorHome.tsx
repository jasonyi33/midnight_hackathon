import React from 'react'
import { GlassCard } from '../ui/GlassCard'

export default function DoctorHome() {
  return (
    <div className="max-w-5xl mx-auto grid grid-cols-2 gap-6">
      <GlassCard className="p-6">
        <h2 className="text-xl font-semibold mb-4">Doctor Portal</h2>
        <p className="text-sm text-gray-200">Lookup patients by wallet address, request verifications, and review proof results.</p>
      </GlassCard>

      <GlassCard className="p-6">
        <h3 className="text-lg font-medium">Recent Requests</h3>
        <div className="mt-4 space-y-3">
          <div className="p-3 bg-white/5 rounded">No requests yet — demo mode available</div>
        </div>
      </GlassCard>
    </div>
  )
}
