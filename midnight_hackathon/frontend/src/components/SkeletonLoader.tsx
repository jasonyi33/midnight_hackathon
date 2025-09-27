import React from 'react';

interface SkeletonLoaderProps {
  className?: string;
  lines?: number;
  height?: string;
  width?: string;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ 
  className = '', 
  lines = 1,
  height = 'h-4',
  width = 'w-full'
}) => {
  return (
    <div className={`animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`
            bg-gray-300 rounded
            ${height}
            ${width}
            ${index < lines - 1 ? 'mb-2' : ''}
          `}
        />
      ))}
    </div>
  );
};

export default SkeletonLoader;
