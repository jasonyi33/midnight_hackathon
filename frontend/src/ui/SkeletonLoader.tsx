import React from 'react'

export const SkeletonLoader: React.FC<{className?: string}> = ({ className = '' }) => (
  <div className={`animate-pulse bg-white/6 rounded ${className}`} />
)

export default SkeletonLoader
