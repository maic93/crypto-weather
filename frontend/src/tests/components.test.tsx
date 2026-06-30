// frontend/src/tests/components.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HeroCard } from '@/components/cards/HeroCard'
import { ForecastCard } from '@/components/cards/ForecastCard'
import { SevenDayCard } from '@/components/cards/SevenDayCard'
import { AccuracyCard } from '@/components/cards/AccuracyCard'
import { MarketMetricsCard } from '@/components/cards/MarketMetricsCard'
import { BottomNav } from '@/components/layout/BottomNav'
import type { ForecastData, DayForecast, AccuracyMetrics, MarketMetrics } from '@/types'

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...p }: React.HTMLAttributes<HTMLDivElement>) => <div {...p}>{children}</div>,
    p: ({ children, ...p }: React.HTMLAttributes<HTMLParagraphElement>) => <p {...p}>{children}</p>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

const mockForecast: ForecastData = {
  current: { price: 108250, change_24h: 2500, change_24h_pct: 2.36,
    market_cap: 2_140_000_000_000, volume_24h: 38_000_000_000, last_updated: '2024-11-15T12:00:00' },
  weather: { condition: 'bullish', label: 'Bullish', icon: '⛅', score: 74 },
  today_high: 111_000, today_low: 106_500, confidence: 78, seven_day: [], generated_at: '2024-11-15T12:00:00',
}

const mockSevenDay: DayForecast[] = Array.from({ length: 7 }, (_, i) => ({
  date: `2026-06-${16 + i}`, condition: 'bullish' as const,
  label: 'Bullish', icon: '⛅', high: 112_000, low: 105_000, confidence: 75 - i*8, score: 72,
}))

const mockAccuracy: AccuracyMetrics = {
  period_days: 30, mean_absolute_error: 1200, mean_absolute_pct_error: 1.8,
  direction_accuracy: 68, within_range_accuracy: 71, total_forecasts: 28,
}

const mockMetrics: MarketMetrics = {
  rsi: 58.4, macd_signal: 'bullish', trend: 'up', volatility: 'medium',
  support: 103_000, resistance: 115_000, sma_20: 106_000, sma_50: 98_000,
  ema_12: 107_500, ema_26: 105_000,
}

describe('HeroCard', () => {
  it('renders the current price', () => {
    render(<HeroCard forecast={mockForecast} />)
    expect(screen.getByText(/108,250/)).toBeInTheDocument()
  })
  it('renders the condition label', () => {
    render(<HeroCard forecast={mockForecast} />)
    expect(screen.getByText('Bullish')).toBeInTheDocument()
  })
  it('renders the score', () => {
    render(<HeroCard forecast={mockForecast} />)
    expect(screen.getAllByText(/74/).length).toBeGreaterThan(0)
  })
  it('renders confidence', () => {
    render(<HeroCard forecast={mockForecast} />)
    expect(screen.getByText('78%')).toBeInTheDocument()
  })
  it('shows Bitcoin label', () => {
    render(<HeroCard forecast={mockForecast} />)
    expect(screen.getByText(/Bitcoin/)).toBeInTheDocument()
  })
})

describe('ForecastCard', () => {
  it('renders hourly slots', () => {
    const { container } = render(<ForecastCard condition="bullish" confidence={78} />)
    expect(container.textContent).toContain('Now')
  })
  it('renders Now as first slot', () => {
    render(<ForecastCard condition="bullish" confidence={78} />)
    expect(screen.getByText('Now')).toBeInTheDocument()
  })
  it('shows percentage changes', () => {
    render(<ForecastCard condition="bullish" confidence={78} />)
    expect(screen.getByText('+2.4%')).toBeInTheDocument()
  })
  it('renders 6 hourly slots', () => {
    render(<ForecastCard condition="bullish" confidence={78} />)
    expect(screen.getAllByText(/[+-]\d+\.\d+%/).length).toBeGreaterThanOrEqual(4)
  })
})

describe('SevenDayCard', () => {
  it('renders 7 rows', () => {
    render(<SevenDayCard days={mockSevenDay} />)
    const bullishLabels = screen.getAllByText('Bullish')
    expect(bullishLabels.length).toBe(7)
  })
  it('first day is Tomorrow', () => {
    render(<SevenDayCard days={mockSevenDay} />)
    expect(screen.getByText('Tomorrow')).toBeInTheDocument()
  })
  it('renders price ranges in k format', () => {
    render(<SevenDayCard days={mockSevenDay} />)
    expect(screen.getAllByText(/\$\d+k/).length).toBeGreaterThan(0)
  })
  it('renders percentage changes', () => {
    render(<SevenDayCard days={mockSevenDay} />)
    expect(screen.getAllByText(/%/).length).toBeGreaterThan(0)
  })
})

describe('AccuracyCard', () => {
  it('shows loading state', () => {
    const { container } = render(<AccuracyCard accuracy={null} isLoading={true} />)
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })
  it('renders direction accuracy', () => {
    render(<AccuracyCard accuracy={mockAccuracy} isLoading={false} />)
    expect(screen.getByText(/68%/)).toBeInTheDocument()
  })
  it('renders total forecasts', () => {
    render(<AccuracyCard accuracy={mockAccuracy} isLoading={false} />)
    expect(screen.getByText(/28 forecasts/)).toBeInTheDocument()
  })
  it('renders section header', () => {
    render(<AccuracyCard accuracy={mockAccuracy} isLoading={false} />)
    expect(screen.getByText(/30-Day Forecast Accuracy/i)).toBeInTheDocument()
  })
})

describe('MarketMetricsCard', () => {
  it('shows loading state', () => {
    const { container } = render(<MarketMetricsCard metrics={null} isLoading={true} />)
    expect(container.firstChild).toBeTruthy()
  })
  it('renders RSI value', () => {
    render(<MarketMetricsCard metrics={mockMetrics} isLoading={false} />)
    expect(screen.getAllByText(/58/).length).toBeGreaterThan(0)
  })
  it('renders Fear and Greed section', () => {
    render(<MarketMetricsCard metrics={mockMetrics} isLoading={false} />)
    expect(screen.getByText(/Fear/i)).toBeInTheDocument()
  })
  it('renders dominance section', () => {
    render(<MarketMetricsCard metrics={mockMetrics} isLoading={false} />)
    expect(screen.getByText('BTC')).toBeInTheDocument()
    expect(screen.getByText('ETH')).toBeInTheDocument()
  })
})

describe('BottomNav', () => {
  it('renders all 5 tabs', () => {
    render(<BottomNav />)
    expect(screen.getByText('Today')).toBeInTheDocument()
    expect(screen.getByText('Radar')).toBeInTheDocument()
    expect(screen.getByText('Alerts')).toBeInTheDocument()
    expect(screen.getByText('News')).toBeInTheDocument()
    expect(screen.getByText('Markets')).toBeInTheDocument()
  })
  it('highlights the active tab', () => {
    render(<BottomNav active="today" />)
    const today = screen.getByText('Today')
    expect(today).toBeInTheDocument()
  })
  it('defaults active to today', () => {
    render(<BottomNav />)
    expect(screen.getByText('Today')).toBeInTheDocument()
  })
})
