
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cake, Star } from 'lucide-react';

interface CakeCelebrationProps {
  show: boolean;
  onComplete: () => void;
}

const CakeCelebration: React.FC<CakeCelebrationProps> = ({ show, onComplete }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onComplete();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
          {/* Backdrop flash */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.2, 0] }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-amber-400"
          />

          <div className="relative">
            {/* Main Cake Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ 
                scale: [0, 1.5, 1.2],
                rotate: [20, -10, 0],
                y: [0, -20, 0]
              }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.8, ease: "backOut" }}
              className="bg-white p-12 rounded-[4rem] shadow-2xl border-8 border-amber-500 flex flex-col items-center gap-6 relative z-10"
            >
              <div className="relative">
                <Cake className="w-32 h-32 text-amber-600" />
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute -top-4 -right-4"
                >
                  <Star className="w-12 h-12 text-yellow-400 fill-yellow-400" />
                </motion.div>
              </div>
              
              <div className="text-center">
                <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Bolo Produzido!</h2>
                <p className="text-amber-600 font-bold uppercase tracking-[0.3em] text-sm mt-2">O Reino Celebra!</p>
              </div>
            </motion.div>

            {/* Particles */}
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
                animate={{ 
                  x: (Math.random() - 0.5) * 600,
                  y: (Math.random() - 0.5) * 600,
                  opacity: 0,
                  scale: Math.random() * 2 + 0.5,
                  rotate: Math.random() * 360
                }}
                transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
                className="absolute top-1/2 left-1/2 w-4 h-4"
              >
                {i % 2 === 0 ? (
                  <Star className="text-yellow-400 fill-yellow-400" />
                ) : (
                  <div className="w-full h-full bg-amber-500 rounded-full" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CakeCelebration;
