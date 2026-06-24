// src/components/layout/AnimatedBackground.tsx
'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { getConditionGradient } from '@/lib/utils'
import type { WeatherCondition } from '@/types'

interface Props {
  condition: WeatherCondition
}

export function AnimatedBackground({ condition }: Props) {
  const gradient = getConditionGradient(condition)

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Deep base */}
      <div className="absolute inset-0 bg-[#070c18]" />

      {/* Animated gradient orbs */}
      <AnimatePresence mode="wait">
        <motion.div
          key={condition}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5 }}
        >
          {/* Top orb */}
          <motion.div
            className={`absolute -top-40 -left-20 w-[600px] h-[600px] rounded-full bg-gradient-to-br ${gradient} opacity-25 blur-[80px]`}
            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          {/* Bottom orb */}
          <motion.div
            className={`absolute -bottom-40 -right-20 w-[500px] h-[500px] rounded-full bg-gradient-to-tl ${gradient} opacity-20 blur-[90px]`}
            animate={{ scale: [1, 1.15, 1], rotate: [0, -5, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Subtle noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px',
        }}
      />
    </div>
  )
}
