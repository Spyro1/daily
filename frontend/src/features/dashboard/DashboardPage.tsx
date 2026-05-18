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
  const currencyCode = accounts[0]?.currency_code ?? 'USD'

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
    <PageLayout overline="Dashboard">
      <BalanceHeader accounts={accounts} isLoading={isPending} />

      {/* <Stack direction="row" spacing={1}>
        <Button size="small" variant="outlined" startIcon={<AddRounded />} onClick={() => void navigate({ to: '/transactions/new' })}>
          Transaction
        </Button>
        <Button size="small" variant="outlined" startIcon={<AccountBalanceRounded />} onClick={() => void navigate({ to: '/accounts/new' })}>
          Account
        </Button>
        <Button size="small" variant="outlined" startIcon={<CategoryRounded />} onClick={() => void navigate({ to: '/categories/new' })}>
          Category
        </Button>
      </Stack> */}

      <BalanceTrendChart
        transactions={transactions}
        currencyCode={currencyCode}
        interval={interval}
        onIntervalChange={setInterval}
        customRange={customRange}
        onCustomRangeChange={setCustomRange}
      />

      <SummaryTiles
        transactions={transactions}
        currencyCode={currencyCode}
        interval={interval}
        customRange={customRange}
        isLoading={isPending}
      />

      <CategoryBreakdown transactions={transactions} currencyCode={currencyCode} isLoading={isPending} />

      <RecentTransactions transactions={transactions} currencyCode={currencyCode} isLoading={isPending} />
    </PageLayout>
  )
}
