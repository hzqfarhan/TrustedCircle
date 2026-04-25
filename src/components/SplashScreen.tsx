'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function SplashScreen() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const hasShown = sessionStorage.getItem('splashShown');
    if (hasShown) {
      setShow(false);
      return;
    }

    // Fallback timer just in case video doesn't play or doesn't end
    const timer = setTimeout(() => {
      setShow(false);
      sessionStorage.setItem('splashShown', 'true');
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none">
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full h-[100dvh] sm:max-w-[430px] sm:h-[900px] sm:rounded-[2.5rem] sm:shadow-2xl bg-white relative flex flex-col overflow-hidden sm:border sm:border-gray-200 pointer-events-auto"
          >
            <video 
              src="/assets/splash.MP4" 
              autoPlay 
              muted 
              playsInline 
              controls={false}
              className="w-full h-full object-cover pointer-events-none"
              onEnded={() => {
                setShow(false);
                sessionStorage.setItem('splashShown', 'true');
              }}
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
