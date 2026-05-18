import { useQuery } from '@tanstack/react-query'
import type { DashboardIndex } from '@/api/generated'
import { dashboardApi } from '@/api/clients'
import { queryKeys } from '@/api/queryKeys'
import { useLocalAuth } from '#/features/auth/hooks/useLocalAuth'
import { getLocalAccounts, getLocalTransactions, getLocalCategories } from '@/lib/localCrud'

/** Build a local DashboardIndex from IndexedDB. */
async function buildLocalDashboard(): Promise<DashboardIndex> {
  const [accounts, transactions, categories] = await Promise.all([
    getLocalAccounts(),
    getLocalTransactions(),
    getLocalCategories(),
  ])

  const catMap = new Map(categories.map((c) => [c.id, c]))

  // Recent 10 transactions
  const recentTxns = transactions.slice(0, 10).map((t) => {
    const cat = t.category_id ? catMap.get(t.category_id) : null
    return {
      id: t.id,
      amount: String(t.amount),
      transaction_type: t.transaction_type as DashboardIndex['transactions'][number]['transaction_type'],
      category: cat ? { id: cat.id, name: cat.name } : { id: '', name: '' },
      occurred_at: t.occurred_at,
    }
  })

  return {
    accounts: accounts.map((a) => ({
      id: a.id,
      name: a.name,
      balance: String(a.balance),
      currency_code: a.currency_code,
    })),
    transactions: recentTxns,
  }
}

export function useDashboard() {
  const { mode } = useLocalAuth()
  const isLocal = mode === 'local'

  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: isLocal
      ? buildLocalDashboard
      : () => dashboardApi.getMyDashboardApiV1DashboardGet().then((r) => r.data),
  })
}
