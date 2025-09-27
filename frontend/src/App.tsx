import React from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import DoctorHome from './pages/DoctorHome'
import ResearcherHome from './pages/ResearcherHome'
import { GlassCard } from './ui/GlassCard'
import AnimatedBackground from './ui/AnimatedBackground'

export default function App() {
  const location = useLocation()
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
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route
              path="/doctor"
              element={(
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.3 }}>
                  <DoctorHome />
                </motion.div>
              )}
            />

            <Route
              path="/researcher"
              element={(
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.3 }}>
                  <ResearcherHome />
                </motion.div>
              )}
            />

            <Route
              path="/"
              element={(
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.3 }}>
                  <GlassCard className="max-w-2xl mx-auto p-8">Welcome to the portals. Select a role.</GlassCard>
                </motion.div>
              )}
            />
          </Routes>
        </AnimatePresence>
      </main>
    </div>
  )
}
