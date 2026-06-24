// src/components/layout/LoadingScreen.tsx
'use client'
import { motion } from 'framer-motion'

export function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#070c18]">
      <motion.div
        className="text-5xl mb-6"
        animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        ⛅
      </motion.div>
      <motion.p
        className="text-white/60 text-sm font-medium tracking-wide"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.8, repeat: Infinity }}
      >
        Checking the crypto weather…
      </motion.p>
    </div>
  )
}

// src/components/layout/ErrorScreen.tsx is merged here
export function ErrorScreen({ error }: { error?: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#070c18] px-6">
      <div className="text-5xl mb-4">⛈️</div>
      <h2 className="text-white font-semibold text-lg mb-2">Connection Error</h2>
      <p className="text-white/50 text-sm text-center max-w-xs">
        {error ?? 'Unable to reach the forecast service. Make sure the backend is running.'}
      </p>
      <button
        className="mt-6 px-5 py-2 rounded-xl bg-white/10 border border-white/15 text-white/80 text-sm hover:bg-white/15 transition-colors"
        onClick={() => window.location.reload()}
      >
        Try again
      </button>
    </div>
  )
}
