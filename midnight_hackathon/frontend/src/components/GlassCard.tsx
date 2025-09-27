import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg' | 'xl';
  hover?: boolean;
}

const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = '', 
  padding = 'md',
  hover = false 
}) => {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-12'
  };

  return (
    <div 
      className={`
        glass-card 
        ${paddingClasses[padding]} 
        ${hover ? 'hover:scale-105 transition-transform duration-300' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default GlassCard;
