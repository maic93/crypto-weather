// frontend/src/app/api/accuracy/route.ts
import { NextResponse } from 'next/server'

// Accuracy tracking requires a database to store forecasts and compare with actuals.
// Without a backend DB connection, we return a placeholder that updates over time.
export async function GET() {
  return NextResponse.json({
    period_days: 30,
    mean_absolute_error: 0,
    mean_absolute_pct_error: 0,
    direction_accuracy: 0,
    within_range_accuracy: 0,
    total_forecasts: 0,
  })
}
