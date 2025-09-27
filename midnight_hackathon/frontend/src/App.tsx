import React from 'react';
import { motion } from 'framer-motion';
import GlassCard from './components/GlassCard';
import GlassButton from './components/GlassButton';
import SkeletonLoader from './components/SkeletonLoader';
import AnimatedBackground from './components/AnimatedBackground';

function App() {
  return (
    <div className="min-h-screen bg-primary-dark text-text-primary font-inter">
      <AnimatedBackground />
      
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-6xl font-space-grotesk font-bold mb-4 bg-gradient-to-r from-primary-purple to-accent-cyan bg-clip-text text-transparent">
            Genomic Privacy DApp
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            Privacy-preserving genetic verification on Midnight blockchain
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          <GlassCard className="text-center">
            <h3 className="text-2xl font-space-grotesk font-semibold mb-4 text-primary-purple">
              Patient Portal
            </h3>
            <p className="text-text-secondary mb-6">
              Upload genomic data and generate privacy-preserving proofs
            </p>
            <GlassButton variant="primary" size="lg">
              Access Portal
            </GlassButton>
          </GlassCard>

          <GlassCard className="text-center">
            <h3 className="text-2xl font-space-grotesk font-semibold mb-4 text-accent-cyan">
              Doctor Portal
            </h3>
            <p className="text-text-secondary mb-6">
              Request and verify patient genetic traits securely
            </p>
            <GlassButton variant="secondary" size="lg">
              Access Portal
            </GlassButton>
          </GlassCard>

          <GlassCard className="text-center">
            <h3 className="text-2xl font-space-grotesk font-semibold mb-4 text-accent-magenta">
              Researcher Portal
            </h3>
            <p className="text-text-secondary mb-6">
              Analyze anonymous aggregate genetic data
            </p>
            <GlassButton variant="secondary" size="lg">
              Access Portal
            </GlassButton>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="w-full max-w-2xl"
        >
          <GlassCard>
            <h2 className="text-3xl font-space-grotesk font-semibold mb-6 text-center">
              Demo Components
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Skeleton Loader</h3>
                <SkeletonLoader lines={3} height="h-4" />
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3">Glass Buttons</h3>
                <div className="flex gap-4 flex-wrap">
                  <GlassButton variant="primary">Primary</GlassButton>
                  <GlassButton variant="secondary">Secondary</GlassButton>
                  <GlassButton variant="danger">Danger</GlassButton>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}

export default App
