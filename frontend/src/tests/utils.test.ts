// frontend/src/tests/utils.test.ts
import { describe, it, expect } from 'vitest'
import {
  formatPrice,
  formatChange,
  formatVolume,
  formatMarketCap,
  formatPriceCompact,
  getConditionGradient,
  getConditionTextColor,
  getChangeColor,
  formatDate,
  cn,
} from '@/lib/utils'

describe('formatPrice', () => {
  it('formats large prices with commas and no decimals', () => {
    expect(formatPrice(65000)).toBe('$65,000')
    expect(formatPrice(108250)).toBe('$108,250')
  })

  it('handles zero', () => {
    expect(formatPrice(0)).toBe('$0')
  })

  it('rounds to nearest dollar', () => {
    expect(formatPrice(65000.99)).toBe('$65,001')
  })
})

describe('formatChange', () => {
  it('shows + for positive', () => {
    expect(formatChange(2.5)).toBe('+2.50%')
  })

  it('shows - for negative', () => {
    expect(formatChange(-3.2)).toBe('-3.20%')
  })

  it('handles zero', () => {
    expect(formatChange(0)).toBe('+0.00%')
  })

  it('can hide sign', () => {
    expect(formatChange(2.5, false)).toBe('2.50%')
  })
})

describe('formatVolume', () => {
  it('formats billions with B suffix', () => {
    expect(formatVolume(35_000_000_000)).toBe('$35.00B')
  })

  it('formats millions with M suffix', () => {
    expect(formatVolume(500_000_000)).toBe('$500.0M')
  })
})

describe('formatMarketCap', () => {
  it('formats trillions with T suffix', () => {
    expect(formatMarketCap(1_280_000_000_000)).toBe('$1.28T')
  })

  it('formats billions with B suffix', () => {
    expect(formatMarketCap(900_000_000_000)).toBe('$900.00B')
  })
})

describe('formatPriceCompact', () => {
  it('formats thousands with K', () => {
    expect(formatPriceCompact(65000)).toBe('$65.0K')
  })

  it('formats millions with M', () => {
    expect(formatPriceCompact(1_500_000)).toBe('$1.50M')
  })
})

describe('getConditionGradient', () => {
  it('returns a string with "from-"', () => {
    expect(getConditionGradient('strong_bullish')).toContain('from-')
  })

  it('returns different gradients per condition', () => {
    const bull = getConditionGradient('strong_bullish')
    const bear = getConditionGradient('strong_bearish')
    expect(bull).not.toBe(bear)
  })

  it('handles all five conditions', () => {
    const conditions = ['strong_bullish', 'bullish', 'neutral', 'bearish', 'strong_bearish'] as const
    conditions.forEach(c => {
      expect(getConditionGradient(c)).toBeTruthy()
    })
  })
})

describe('getConditionTextColor', () => {
  it('returns text- class', () => {
    expect(getConditionTextColor('bullish')).toContain('text-')
  })

  it('bullish is green-ish', () => {
    expect(getConditionTextColor('bullish')).toContain('teal')
  })

  it('bearish is rose-ish', () => {
    expect(getConditionTextColor('bearish')).toContain('rose')
  })
})

describe('getChangeColor', () => {
  it('positive is green', () => {
    expect(getChangeColor(2)).toContain('emerald')
  })

  it('negative is red', () => {
    expect(getChangeColor(-2)).toContain('rose')
  })

  it('zero is muted', () => {
    expect(getChangeColor(0)).toContain('slate')
  })
})

describe('formatDate', () => {
  it('short format includes month and day', () => {
    const result = formatDate('2024-11-15', 'short')
    expect(result).toMatch(/Nov 15/)
  })

  it('day format returns weekday abbreviation', () => {
    const result = formatDate('2024-11-15', 'day')
    expect(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']).toContain(result)
  })
})

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('a', 'b')).toBe('a b')
  })

  it('handles conditional classes', () => {
    expect(cn('a', false && 'b', 'c')).toBe('a c')
  })

  it('merges tailwind conflicts correctly', () => {
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
  })
})
