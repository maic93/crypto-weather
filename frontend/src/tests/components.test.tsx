// frontend/src/tests/components.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HeroCard } from '@/components/cards/HeroCard'
import { ForecastCard } from '@/components/cards/ForecastCard'
import { SevenDayCard } from '@/components/cards/SevenDayCard'
import { AccuracyCard } from '@/components/cards/AccuracyCard'
import { MarketMetricsCard } from '@/components/cards/MarketMetricsCard'
import type { ForecastData, DayForecast, AccuracyMetrics, MarketMetrics } from '@/types'

// Framer Motion mock
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
    p: ({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => <p {...props}>{children}</p>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

const mockForecast: ForecastData = {
  current: {
    price: 108250,
    change_24h: 2500,
    change_24h_pct: 2.36,
    market_cap: 2_140_000_000_000,
    volume_24h: 38_000_000_000,
    last_updated: '2024-11-15T12:00:00',
  },
  weather: {
    condition: 'bullish',
    label: 'Bullish',
    icon: '⛅',
    score: 74,
  },
  today_high: 111_000,
  today_low: 106_500,
  confidence: 78,
  seven_day: [],
  generated_at: '2024-11-15T12:00:00',
}

const mockSevenDay: DayForecast[] = Array.from({ length: 7 }, (_, i) => ({
  date: `2024-11-${16 + i}`,
  condition: 'bullish' as const,
  label: 'Bullish',
  icon: '⛅',
  high: 112_000,
  low: 105_000,
  confidence: 75 - i * 8,
  score: 72,
}))

const mockAccuracy: AccuracyMetrics = {
  period_days: 30,
  mean_absolute_error: 1200,
  mean_absolute_pct_error: 1.8,
  direction_accuracy: 68,
  within_range_accuracy: 71,
  total_forecasts: 28,
}

const mockMetrics: MarketMetrics = {
  rsi: 58.4,
  macd_signal: 'bullish',
  trend: 'up',
  volatility: 'medium',
  support: 103_000,
  resistance: 115_000,
  sma_20: 106_000,
  sma_50: 98_000,
  ema_12: 107_500,
  ema_26: 105_000,
}

describe('HeroCard', () => {
  it('renders the current price', () => {
    render(<HeroCard forecast={mockForecast} />)
    expect(screen.getByText(/108,250/)).toBeInTheDocument()
  })

  it('renders the weather condition label', () => {
    render(<HeroCard forecast={mockForecast} />)
    expect(screen.getByText('Bullish')).toBeInTheDocument()
  })

  it('renders the score', () => {
    render(<HeroCard forecast={mockForecast} />)
    expect(screen.getByText('74')).toBeInTheDocument()
  })

  it('renders confidence', () => {
    render(<HeroCard forecast={mockForecast} />)
    expect(screen.getByText('78%')).toBeInTheDocument()
  })

  it('shows positive change in green', () => {
    render(<HeroCard forecast={mockForecast} />)
    expect(screen.getByText(/\+2\.36%/)).toBeInTheDocument()
  })
})

describe('ForecastCard', () => {
  const props = { high: 111_000, low: 106_500, confidence: 78, condition: 'bullish' as const }

  it('renders today high', () => {
    render(<ForecastCard {...props} />)
    expect(screen.getByText(/111,000/)).toBeInTheDocument()
  })

  it('renders today low', () => {
    render(<ForecastCard {...props} />)
    expect(screen.getByText(/106,500/)).toBeInTheDocument()
  })

  it('renders confidence percentage', () => {
    render(<ForecastCard {...props} />)
    expect(screen.getByText('78%')).toBeInTheDocument()
  })

  it('renders the section header', () => {
    render(<ForecastCard {...props} />)
    expect(screen.getByText("Today's Forecast")).toBeInTheDocument()
  })
})

describe('SevenDayCard', () => {
  it('renders 7 day rows', () => {
    render(<SevenDayCard days={mockSevenDay} />)
    // Each day has a condition label
    const bullish = screen.getAllByText('Bullish')
    expect(bullish.length).toBe(7)
  })

  it('first day is labeled Tomorrow', () => {
    render(<SevenDayCard days={mockSevenDay} />)
    expect(screen.getByText('Tomorrow')).toBeInTheDocument()
  })

  it('renders high and low prices', () => {
    render(<SevenDayCard days={mockSevenDay} />)
    expect(screen.getAllByText(/112,000/).length).toBeGreaterThan(0)
  })

  it('renders confidence values', () => {
    render(<SevenDayCard days={mockSevenDay} />)
    expect(screen.getByText('75%')).toBeInTheDocument()
  })
})

describe('AccuracyCard', () => {
  it('shows loading state', () => {
    const { container } = render(<AccuracyCard accuracy={null} isLoading={true} />)
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('renders accuracy percentages when loaded', () => {
    render(<AccuracyCard accuracy={mockAccuracy} isLoading={false} />)
    expect(screen.getByText(/68\.0%/)).toBeInTheDocument()
  })

  it('renders total forecasts count', () => {
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
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('renders RSI value', () => {
    render(<MarketMetricsCard metrics={mockMetrics} isLoading={false} />)
    expect(screen.getByText('58.4')).toBeInTheDocument()
  })

  it('renders trend', () => {
    render(<MarketMetricsCard metrics={mockMetrics} isLoading={false} />)
    expect(screen.getByText('UP')).toBeInTheDocument()
  })

  it('renders support and resistance', () => {
    render(<MarketMetricsCard metrics={mockMetrics} isLoading={false} />)
    expect(screen.getByText(/103,000/)).toBeInTheDocument()
    expect(screen.getByText(/115,000/)).toBeInTheDocument()
  })
})
