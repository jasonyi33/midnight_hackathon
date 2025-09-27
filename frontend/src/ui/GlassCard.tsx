import React from 'react'

export const GlassCard: React.FC<React.PropsWithChildren<{className?: string}>> = ({ children, className = '' }) => (
  <div className={`bg-white/6 backdrop-blur-md rounded-xl ${className}`}>
    {children}
  </div>
)

export default GlassCard
