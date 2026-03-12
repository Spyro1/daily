import { useState } from 'react'
import { Alert, Box } from '@mui/material'
import type { AccountBrief, TransactionBrief } from '@/api/generated'
import { useDashboard } from './hooks/useDashboard'
import { type Interval } from './utils/dateUtils'
import { BalanceHeader } from './components/BalanceHeader'
import { BalanceTrendChart } from './components/BalanceTrendChart'
import { CategoryBreakdown } from './components/CategoryBreakdown'
import { RecentTransactions } from './components/RecentTransactions'
import { SummaryTiles } from './components/SummaryTiles'
import { PageLayout } from '#/shared/layout/PageLayout'

export function DashboardPage() {
  const { data, isPending, isError, error } = useDashboard()
  const [interval, setInterval] = useState<Interval>('month')
  const [customRange, setCustomRange] = useState<[Date, Date]>([
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    new Date(),
  ])

  const accounts: AccountBrief[] = data?.accounts ?? []
  const transactions: TransactionBrief[] = data?.transactions ?? []

  if (isError) {
    const status = (error as { response?: { status?: number } }).response?.status
    if (status !== 501) {
      return (
        <Box sx={{ p: 2 }}>
          <Alert severity="error">Failed to load dashboard data. Please try again later.</Alert>
        </Box>
      )
    }
  }

  return (
    <PageLayout overline="Overview" title="Dashboard">
      <BalanceHeader accounts={accounts} isLoading={isPending} />

      <BalanceTrendChart
        transactions={transactions}
        interval={interval}
        onIntervalChange={setInterval}
        customRange={customRange}
        onCustomRangeChange={setCustomRange}
      />

      <SummaryTiles
        transactions={transactions}
        interval={interval}
        customRange={customRange}
        isLoading={isPending}
      />

      <CategoryBreakdown transactions={transactions} isLoading={isPending} />

      <RecentTransactions transactions={transactions} isLoading={isPending} />
    </PageLayout>
  )
}
