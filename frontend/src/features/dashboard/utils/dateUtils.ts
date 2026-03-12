import type { TransactionBrief } from "#/api/generated"

/** Supported time intervals for the analytics chart */
export type Interval = 'day' | 'week' | 'month' | 'year' | 'custom'

/** Returns the [start, end] date range for a given interval */
export function getDateRange(
  interval: Interval,
  customRange?: [Date, Date],
): [Date, Date] {
  const now = new Date()
  switch (interval) {
    case 'day': {
      const start = new Date(now)
      start.setDate(now.getDate() - 30)
      return [start, now]
    }
    case 'week': {
      const start = new Date(now)
      start.setDate(now.getDate() - 84) // ~12 weeks
      return [start, now]
    }
    case 'month': {
      const start = new Date(now)
      start.setMonth(now.getMonth() - 12)
      return [start, now]
    }
    case 'year': {
      const start = new Date(now)
      start.setFullYear(now.getFullYear() - 5)
      return [start, now]
    }
    case 'custom':
      return customRange ?? [new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), now]
  }
}

/** Returns a display label and a sortable key for a given date + interval */
function getIntervalBucket(
  date: Date,
  interval: Interval,
): { label: string; sortKey: string } {
  switch (interval) {
    case 'day':
    case 'custom': {
      const y = date.getFullYear()
      const m = String(date.getMonth() + 1).padStart(2, '0')
      const d = String(date.getDate()).padStart(2, '0')
      return {
        sortKey: `${y}-${m}-${d}`,
        label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      }
    }
    case 'week': {
      const d = new Date(date)
      const day = d.getDay()
      const diff = d.getDate() - day + (day === 0 ? -6 : 1) // ISO week: Monday
      d.setDate(diff)
      const y = d.getFullYear()
      const mo = String(d.getMonth() + 1).padStart(2, '0')
      const da = String(d.getDate()).padStart(2, '0')
      return {
        sortKey: `${y}-${mo}-${da}`,
        label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      }
    }
    case 'month': {
      const y = date.getFullYear()
      const m = String(date.getMonth() + 1).padStart(2, '0')
      return {
        sortKey: `${y}-${m}`,
        label: date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
      }
    }
    case 'year': {
      const y = date.getFullYear()
      return { sortKey: `${y}`, label: `${y}` }
    }
  }
}

export interface BucketData {
  label: string
  income: number
  expense: number
}

/** Group transactions into chart buckets for the given interval + date range */
export function deriveChartData(
  transactions: TransactionBrief[],
  interval: Interval,
  dateRange: [Date, Date],
): BucketData[] {
  const [start, end] = dateRange
  const buckets = new Map<string, { label: string; income: number; expense: number }>()

  for (const tx of transactions) {
    const txDate = new Date(tx.occurred_at)
    if (txDate < start || txDate > end) continue
    const { label, sortKey } = getIntervalBucket(txDate, interval)
    const bucket = buckets.get(sortKey) ?? { label, income: 0, expense: 0 }
    const amount = parseFloat(tx.amount)
    if (tx.transaction_type === 'income') bucket.income += amount
    else if (tx.transaction_type === 'expense') bucket.expense += amount
    buckets.set(sortKey, bucket)
  }

  return Array.from(buckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, data]) => data)
}

/** Sum income and expense for transactions within the given interval window */
export function deriveSummary(
  transactions: TransactionBrief[],
  interval: Interval,
  customRange?: [Date, Date],
): { totalIncome: number; totalExpense: number } {
  const [start, end] = getDateRange(interval, customRange)
  let totalIncome = 0
  let totalExpense = 0
  for (const tx of transactions) {
    const d = new Date(tx.occurred_at)
    if (d < start || d > end) continue
    const amount = parseFloat(tx.amount)
    if (tx.transaction_type === 'income') totalIncome += amount
    else if (tx.transaction_type === 'expense') totalExpense += amount
  }
  return { totalIncome, totalExpense }
}
