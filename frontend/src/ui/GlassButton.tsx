import React from 'react'
import { ButtonHTMLAttributes } from 'react'
import { motion } from 'framer-motion'

type GlassButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost'
}

export const GlassButton: React.FC<GlassButtonProps> = ({ children, variant = 'primary', className = '', ...rest }) => {
  const base = 'rounded-lg px-4 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-offset-2'
  const variants: Record<string, string> = {
    primary: 'bg-[#6c63ff]/90 text-white',
    ghost: 'bg-white/6 text-white'
  }

  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      className={`${base} ${variants[variant]} ${className}`}
      {...rest}
    >
      {children}
    </motion.button>
  )
}

export default GlassButton
