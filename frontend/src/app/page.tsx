// src/app/page.tsx
'use client'
import { useForecast, useHistory, useAccuracy, useMetrics } from '@/hooks/useWeatherData'
import { AnimatedBackground } from '@/components/layout/AnimatedBackground'
import { HeroCard } from '@/components/cards/HeroCard'
import { ForecastCard } from '@/components/cards/ForecastCard'
import { SevenDayCard } from '@/components/cards/SevenDayCard'
import { MarketMetricsCard } from '@/components/cards/MarketMetricsCard'
import { AccuracyCard } from '@/components/cards/AccuracyCard'
import { PriceChart } from '@/components/charts/PriceChart'
import { LoadingScreen } from '@/components/layout/LoadingScreen'
import { ErrorScreen } from '@/components/layout/ErrorScreen'
import { motion } from 'framer-motion'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

export default function Home() {
  const forecast = useForecast()
  const history = useHistory(30)
  const accuracy = useAccuracy()
  const metrics = useMetrics()

  if (forecast.isLoading) return <LoadingScreen />
  if (forecast.error || !forecast.data) return <ErrorScreen error={forecast.error?.message} />

  const condition = forecast.data.weather.condition

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <AnimatedBackground condition={condition} />

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-8 pb-16">
        <motion.div
          className="space-y-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center pt-4 pb-2">
            <p className="text-xs font-medium tracking-widest uppercase text-white/50 mb-1">
              Crypto Weather
            </p>
            <h1 className="text-lg font-semibold text-white/70">Bitcoin</h1>
          </motion.div>

          {/* Hero */}
          <motion.div variants={itemVariants}>
            <HeroCard forecast={forecast.data} />
          </motion.div>

          {/* Today Forecast */}
          <motion.div variants={itemVariants}>
            <ForecastCard
              high={forecast.data.today_high}
              low={forecast.data.today_low}
              confidence={forecast.data.confidence}
              condition={condition}
            />
          </motion.div>

          {/* 7-Day */}
          <motion.div variants={itemVariants}>
            <SevenDayCard days={forecast.data.seven_day} />
          </motion.div>

          {/* Price Chart */}
          <motion.div variants={itemVariants}>
            <PriceChart
              history={history.data ?? []}
              forecast={forecast.data.seven_day}
              isLoading={history.isLoading}
            />
          </motion.div>

          {/* Market Metrics */}
          <motion.div variants={itemVariants}>
            <MarketMetricsCard metrics={metrics.data ?? null} isLoading={metrics.isLoading} />
          </motion.div>

          {/* Accuracy */}
          <motion.div variants={itemVariants}>
            <AccuracyCard accuracy={accuracy.data ?? null} isLoading={accuracy.isLoading} />
          </motion.div>

          {/* Footer */}
          <motion.div variants={itemVariants}>
            <p className="text-center text-xs text-white/30 pt-4">
              Data from CoinGecko · Forecasts are probabilistic, not financial advice
              <br />
              Last updated: {new Date(forecast.data.generated_at).toLocaleTimeString()}
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
