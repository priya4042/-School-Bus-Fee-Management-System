
import React from 'react';
// @ts-ignore
import { motion, AnimatePresence } from 'framer-motion';
import { useLoadingStore } from '../../store/loadingStore';

/**
 * GlobalLoader component
 * Handles high-level app initialization states.
 */
const GlobalLoader: React.FC = () => {
  const { globalLoading, loadingMessage } = useLoadingStore();

  return (
    <AnimatePresence>
      {globalLoading && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-xl flex items-center justify-center"
        >
          <div className="flex flex-col items-center gap-8">
            <motion.div 
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ repeat: Infinity, duration: 4 }}
              className="w-24 h-24 bg-primary rounded-[2.5rem] flex items-center justify-center shadow-2xl border-2 border-white/10"
            >
              <i className="fas fa-bus-alt text-4xl text-white"></i>
            </motion.div>
            
            <div className="text-center space-y-3">
              <div className="flex items-center gap-2 justify-center">
                 <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></div>
                 <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.2s]"></div>
                 <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em]">
                {loadingMessage}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GlobalLoader;
