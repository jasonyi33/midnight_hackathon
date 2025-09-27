import React from 'react'
import { HTMLAttributes } from 'react'
import { motion, MotionProps } from 'framer-motion'

type GlassCardProps = React.PropsWithChildren<{
  className?: string
} & HTMLAttributes<HTMLDivElement> & MotionProps>

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', ...rest }) => (
  <motion.div
    className={`bg-white/6 backdrop-blur-md rounded-xl ${className}`}
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -6 }}
    transition={{ duration: 0.3, ease: "easeOut" }}
    {...rest}
  >
    {children}
  </motion.div>
)

export default GlassCard
