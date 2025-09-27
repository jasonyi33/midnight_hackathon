import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import DoctorHome from './pages/DoctorHome'
import ResearcherHome from './pages/ResearcherHome'
import { GlassCard } from './ui/GlassCard'
import AnimatedBackground from './ui/AnimatedBackground'

export default function App() {
  return (
    <div className="min-h-screen text-white bg-gradient-to-br from-[#1a1a2e] to-[#0b1020]">
      <AnimatedBackground />
      <header className="p-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Genomic Privacy — Provider Portals</h1>
        <nav className="space-x-4">
          <Link to="/doctor" className="underline">Doctor</Link>
          <Link to="/researcher" className="underline">Researcher</Link>
        </nav>
      </header>

      <main className="p-6">
        <Routes>
          <Route path="/doctor" element={<DoctorHome />} />
          <Route path="/researcher" element={<ResearcherHome />} />
          <Route path="/" element={<GlassCard className="max-w-2xl mx-auto p-8">Welcome to the portals. Select a role.</GlassCard>} />
        </Routes>
      </main>
    </div>
  )
}
