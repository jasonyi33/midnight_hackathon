import { motion } from 'framer-motion';

/**
 * Loading Spinner Component
 * Shows an animated loading indicator with glass morphism styling
 */
export const LoadingSpinner = ({ message = 'Loading...' }: { message?: string }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-opacity-80 bg-primary-dark z-50">
      <motion.div 
        className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 shadow-xl"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col items-center">
          <div className="spinner">
            <div className="double-bounce1"></div>
            <div className="double-bounce2"></div>
          </div>
          <p className="mt-4 text-white font-medium">{message}</p>
        </div>
      </motion.div>
    </div>
  );
};