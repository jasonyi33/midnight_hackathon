import React from 'react'

export const GlassButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, className = '', ...rest }) => (
  <button
    {...rest}
    className={`px-4 py-2 rounded-lg bg-white/8 hover:bg-white/12 transition transform active:scale-95 ${className}`}
  >
    {children}
  </button>
)

export default GlassButton
