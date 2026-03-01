import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bus } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 500); // Wait for exit animation
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-zinc-900"
        >
          <div className="flex flex-col items-center">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
                duration: 0.8
              }}
              className="w-24 h-24 bg-emerald-600 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-emerald-600/40 mb-6"
            >
              <Bus size={48} />
            </motion.div>
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-center"
            >
              <h1 className="text-3xl font-bold tracking-tighter text-white mb-2">
                BusWay <span className="text-emerald-500">Pro</span>
              </h1>
              <p className="text-zinc-400 text-sm font-medium tracking-widest uppercase">
                Enterprise Edition
              </p>
            </motion.div>

            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: 200 }}
              transition={{ delay: 0.5, duration: 1.5, ease: "easeInOut" }}
              className="h-1 bg-emerald-600/20 rounded-full mt-12 overflow-hidden"
            >
              <motion.div 
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="h-full w-1/2 bg-emerald-500 rounded-full"
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
