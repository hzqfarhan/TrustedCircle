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
        <motion.div 
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[9999] bg-white flex items-center justify-center overflow-hidden h-[100dvh] w-screen"
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
      )}
    </AnimatePresence>
  );
}
