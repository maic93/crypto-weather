// frontend/src/tests/layout.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { LoadingScreen } from '@/components/layout/LoadingScreen'
import { ErrorScreen } from '@/components/layout/ErrorScreen'
import { PriceChart } from '@/components/charts/PriceChart'
import type { HistoricalDay, DayForecast } from '@/types'

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
    p: ({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => <p {...props}>{children}</p>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

// Mock recharts — renders nothing but doesn't crash
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="chart">{children}</div>,
  ComposedChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Area: () => null,
  Line: () => null,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
  ReferenceLine: () => null,
  CartesianGrid: () => null,
}))

// ── LoadingScreen ─────────────────────────────────────────────────────────────

describe('LoadingScreen', () => {
  it('renders loading text', () => {
    render(<LoadingScreen />)
    expect(screen.getByText(/checking the crypto weather/i)).toBeInTheDocument()
  })

  it('renders a weather emoji', () => {
    const { container } = render(<LoadingScreen />)
    expect(container.textContent).toContain('⛅')
  })
})

// ── ErrorScreen ───────────────────────────────────────────────────────────────

describe('ErrorScreen', () => {
  it('renders default error message', () => {
    render(<ErrorScreen />)
    expect(screen.getByText(/connection error/i)).toBeInTheDocument()
  })

  it('renders custom error message', () => {
    render(<ErrorScreen error="Custom error text" />)
    expect(screen.getByText('Custom error text')).toBeInTheDocument()
  })

  it('renders a try again button', () => {
    render(<ErrorScreen />)
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
  })

  it('reloads page when try again is clicked', () => {
    const reload = vi.fn()
    Object.defineProperty(window, 'location', {
      value: { reload },
      writable: true,
    })
    render(<ErrorScreen />)
    fireEvent.click(screen.getByRole('button', { name: /try again/i }))
    expect(reload).toHaveBeenCalled()
  })
})

// ── PriceChart ────────────────────────────────────────────────────────────────

const makeHistory = (n = 10): HistoricalDay[] =>
  Array.from({ length: n }, (_, i) => ({
    date: `2026-06-${String(i + 1).padStart(2, '0')}`,
    open: 100000 + i * 100,
    high: 101000 + i * 100,
    low: 99000 + i * 100,
    close: 100500 + i * 100,
    volume: 30e9,
    change_pct: 0.5,
  }))

const makeForecast = (n = 7): DayForecast[] =>
  Array.from({ length: n }, (_, i) => ({
    date: `2026-06-${String(i + 11).padStart(2, '0')}`,
    condition: 'bullish' as const,
    label: 'Bullish',
    icon: '⛅',
    high: 102000,
    low: 99000,
    confidence: 70 - i * 5,
    score: 72,
  }))

describe('PriceChart', () => {
  it('renders chart container', () => {
    render(<PriceChart history={makeHistory()} forecast={makeForecast()} isLoading={false} />)
    expect(screen.getByTestId('chart')).toBeInTheDocument()
  })

  it('renders section header', () => {
    render(<PriceChart history={makeHistory()} forecast={makeForecast()} isLoading={false} />)
    expect(screen.getByText(/Price History/i)).toBeInTheDocument()
  })

  it('shows loading skeleton when isLoading', () => {
    const { container } = render(<PriceChart history={[]} forecast={[]} isLoading={true} />)
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('renders with empty history gracefully', () => {
    expect(() =>
      render(<PriceChart history={[]} forecast={makeForecast()} isLoading={false} />)
    ).not.toThrow()
  })

  it('renders legend labels', () => {
    render(<PriceChart history={makeHistory()} forecast={makeForecast()} isLoading={false} />)
    expect(screen.getByText('Actual')).toBeInTheDocument()
    expect(screen.getByText('Forecast')).toBeInTheDocument()
  })
})

// ── AnimatedBackground ────────────────────────────────────────────────────────

describe('AnimatedBackground', () => {
  it('renders without crashing for all conditions', async () => {
    const { AnimatedBackground } = await import('@/components/layout/AnimatedBackground')
    const conditions = ['strong_bullish', 'bullish', 'neutral', 'bearish', 'strong_bearish'] as const
    for (const condition of conditions) {
      expect(() => render(<AnimatedBackground condition={condition} />)).not.toThrow()
    }
  })
})
