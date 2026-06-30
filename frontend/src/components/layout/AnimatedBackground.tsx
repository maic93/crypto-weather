// frontend/src/components/layout/AnimatedBackground.tsx
'use client'
import { motion, AnimatePresence } from 'framer-motion'
import type { WeatherCondition } from '@/types'

const ORBS: Record<WeatherCondition, [string, string]> = {
  strong_bullish: ['rgba(52,211,153,0.15)', 'rgba(16,185,129,0.1)'],
  bullish:        ['rgba(251,191,36,0.12)', 'rgba(59,130,246,0.1)'],
  neutral:        ['rgba(100,116,139,0.12)', 'rgba(71,85,105,0.08)'],
  bearish:        ['rgba(248,113,113,0.12)', 'rgba(139,92,246,0.08)'],
  strong_bearish: ['rgba(239,68,68,0.15)', 'rgba(109,40,217,0.1)'],
}

export function AnimatedBackground({ condition }: { condition: WeatherCondition }) {
  const [c1, c2] = ORBS[condition]
  return (
    <div style={{ position:'fixed', inset:0, zIndex:-1, overflow:'hidden', background:'#06091a' }}>
      <AnimatePresence mode="wait">
        <motion.div key={condition} initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} transition={{ duration:1.2 }}>
          <motion.div animate={{ scale:[1,1.1,1], rotate:[0,5,0] }} transition={{ duration:8,repeat:Infinity,ease:'easeInOut' }}
            style={{ position:'absolute',top:-200,left:-100,width:500,height:500,borderRadius:'50%',
              background:`radial-gradient(circle, ${c1} 0%, transparent 70%)`, filter:'blur(60px)' }}/>
          <motion.div animate={{ scale:[1,1.15,1], rotate:[0,-5,0] }} transition={{ duration:10,repeat:Infinity,ease:'easeInOut',delay:2 }}
            style={{ position:'absolute',bottom:-200,right:-100,width:400,height:400,borderRadius:'50%',
              background:`radial-gradient(circle, ${c2} 0%, transparent 70%)`, filter:'blur(70px)' }}/>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
