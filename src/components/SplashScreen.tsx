import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface SplashScreenProps {
  onComplete: () => void;
  forceShow?: boolean;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<number>(0);

  useEffect(() => {
    // Elegant line animation -> Symbol formation -> Wordmark reveal
    const t1 = setTimeout(() => setPhase(1), 300);
    const t2 = setTimeout(() => setPhase(2), 900);
    const t3 = setTimeout(() => {
      onComplete();
    }, 2200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        id="splash-screen-container"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.45, ease: 'easeInOut' } }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0B0B0F] text-[#FFFFFF] px-6 select-none overflow-hidden"
      >
        {/* Subtle architectural dot grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#2563EB_1px,transparent_1px)] [background-size:32px_32px] opacity-10 pointer-events-none" />

        <div className="relative flex flex-col items-center max-w-sm text-center">
          {/* Animated Orange & Blue vector lines forming the geometric house / location crest */}
          <div className="relative w-28 h-28 mb-8 flex items-center justify-center">
            <svg
              viewBox="0 0 100 100"
              className="w-24 h-24 overflow-visible"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Blue line: Left side of roof and foundation (Trust & Security) */}
              <motion.path
                d="M 50 15 L 18 42 L 18 82 L 50 82"
                stroke="#2563EB"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
              />

              {/* Orange line: Right side of roof and doorway (Action & Proximity) */}
              <motion.path
                d="M 50 15 L 82 42 L 82 82 L 50 82"
                stroke="#F97316"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.15, ease: 'easeInOut' }}
              />

              {/* Center Location Pin Node connecting both */}
              <motion.circle
                cx="50"
                cy="52"
                r="6"
                fill="#F97316"
                initial={{ scale: 0, opacity: 0 }}
                animate={phase >= 1 ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                transition={{ type: 'spring', damping: 14 }}
              />
              <motion.circle
                cx="50"
                cy="52"
                r="11"
                stroke="#2563EB"
                strokeWidth="2"
                strokeDasharray="3 3"
                initial={{ rotate: 0, scale: 0 }}
                animate={phase >= 1 ? { rotate: 360, scale: 1 } : { rotate: 0, scale: 0 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              />
            </svg>
          </div>

          {/* Wordmark */}
          <motion.div
            id="splash-title"
            initial={{ opacity: 0, y: 12 }}
            animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="flex items-center gap-1.5"
          >
            <span className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              HANDY<span className="text-[#F97316]">NAIJA</span>
            </span>
          </motion.div>

          {/* Tagline */}
          <motion.p
            id="splash-tagline"
            initial={{ opacity: 0, y: 8 }}
            animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="mt-3 text-sm sm:text-base text-[#FFFFFF]/80 font-medium tracking-wide"
          >
            Good work is closer than you think.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={phase >= 2 ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="mt-6 flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 text-[11px] font-medium text-stone-400"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] animate-pulse" />
            Verified Nigerian Artisan Marketplace
          </motion.div>
        </div>

        {/* Skip button for quick navigation */}
        <button
          id="btn-skip-splash"
          onClick={onComplete}
          className="absolute bottom-8 text-xs font-semibold text-stone-500 hover:text-white transition-colors tracking-wider px-4 py-2"
        >
          Skip Intro
        </button>
      </motion.div>
    </AnimatePresence>
  );
};
