import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { CreateTransaction, TransactionListResponse, UpdateTransaction } from '@/api/generated'
import { transactionsApi } from '@/api/clients'
import { queryKeys } from '@/api/queryKeys'
import { useLocalAuth } from '#/features/auth/hooks/useLocalAuth'
import {
  getLocalTransactions,
  createLocalTransaction,
  updateLocalTransaction,
  deleteLocalTransaction,
} from '@/lib/localCrud'
import type { LocalTransaction } from '@/lib/localDb'
import { getLocalAccounts, getLocalCategories } from '@/lib/localCrud'

/** Build the list response shape the UI expects from local data. */
async function buildLocalTransactionList(filters: {
  dateFrom?: string | null
  dateTo?: string | null
  categoryId?: string | null
  accountId?: string | null
  transactionType?: string | null
  skip?: number
  limit?: number
}): Promise<TransactionListResponse> {
  let txns = await getLocalTransactions()

  // Apply filters
  if (filters.dateFrom) {
    const from = new Date(filters.dateFrom).getTime()
    txns = txns.filter((t) => new Date(t.occurred_at).getTime() >= from)
  }
  if (filters.dateTo) {
    const to = new Date(filters.dateTo).getTime()
    txns = txns.filter((t) => new Date(t.occurred_at).getTime() <= to)
  }
  if (filters.categoryId) {
    txns = txns.filter((t) => t.category_id === filters.categoryId)
  }
  if (filters.accountId) {
    txns = txns.filter(
      (t) => t.source_account_id === filters.accountId || t.destination_account_id === filters.accountId,
    )
  }
  if (filters.transactionType) {
    txns = txns.filter((t) => t.transaction_type === filters.transactionType)
  }

  const total = txns.length
  const skip = filters.skip ?? 0
  const limit = filters.limit ?? 50
  const page = txns.slice(skip, skip + limit)

  // Resolve account / category names for the index view
  const [accounts, categories] = await Promise.all([getLocalAccounts(), getLocalCategories()])
  const acctMap = new Map(accounts.map((a) => [a.id, a]))
  const catMap = new Map(categories.map((c) => [c.id, c]))

  const data = page.map((t) => mapTransaction(t, acctMap, catMap))

  return { data, total, skip, limit }
}

function mapTransaction(
  t: LocalTransaction,
  acctMap: Map<string, { id: string; name: string; balance: number; currency_code: string }>,
  catMap: Map<string, { id: string; name: string }>,
) {
  const srcAcct = t.source_account_id ? acctMap.get(t.source_account_id) : null
  const dstAcct = t.destination_account_id ? acctMap.get(t.destination_account_id) : null
  const cat = t.category_id ? catMap.get(t.category_id) : null

  return {
    id: t.id,
    amount: String(t.amount),
    transaction_type: t.transaction_type,
    category: cat ? { id: cat.id, name: cat.name } : { id: '', name: '' },
    occurred_at: t.occurred_at,
    source_account: srcAcct
      ? { id: srcAcct.id, name: srcAcct.name, balance: String(srcAcct.balance), currency_code: srcAcct.currency_code }
      : undefined,
    destination_account: dstAcct
      ? { id: dstAcct.id, name: dstAcct.name, balance: String(dstAcct.balance), currency_code: dstAcct.currency_code }
      : undefined,
    target_amount: t.target_amount != null ? String(t.target_amount) : undefined,
    note: t.note,
  }
}

export function useTransactions({
  dateFrom,
  dateTo,
  categoryId,
  accountId,
  transactionType,
  skip,
  limit,
}: {
  dateFrom?: string | null
  dateTo?: string | null
  categoryId?: string | null
  accountId?: string | null
  transactionType?: string | null
  skip?: number
  limit?: number
} = {}) {
  const { mode } = useLocalAuth()
  const isLocal = mode === 'local'

  return useQuery({
    queryKey: [...queryKeys.transactions.all, { dateFrom, dateTo, categoryId, accountId, transactionType, skip, limit }],
    queryFn: isLocal
      ? () => buildLocalTransactionList({ dateFrom, dateTo, categoryId, accountId, transactionType, skip, limit })
      : () => transactionsApi.getMyTransactionsApiV1TransactionsGet(
          dateFrom, dateTo, categoryId, accountId, transactionType as any, skip, limit
        ).then((r) => r.data),
  })
}

export function useCreateTransaction() {
  const queryClient = useQueryClient()
  const { mode } = useLocalAuth()
  const isLocal = mode === 'local'

  return useMutation({
    mutationFn: (data: CreateTransaction) =>
      isLocal
        ? createLocalTransaction({
            amount: data.amount as number,
            transaction_type: data.transaction_type as 'expense' | 'income' | 'transfer',
            occurred_at: data.occurred_at,
            category_id: data.category_id,
            source_account_id: data.source_account_id,
            destination_account_id: data.destination_account_id,
            target_amount: data.target_amount as number | undefined,
            note: data.note,
          })
        : transactionsApi
            .createMyNewTransactionApiV1TransactionsPost(data)
            .then((r) => r.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all })
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard })
      void queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all })
    },
  })
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient()
  const { mode } = useLocalAuth()
  const isLocal = mode === 'local'

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTransaction }) =>
      isLocal
        ? updateLocalTransaction(id, {
            amount: data.amount != null ? Number(data.amount) : undefined,
            transaction_type: data.transaction_type as 'expense' | 'income' | 'transfer' | undefined,
            occurred_at: data.occurred_at ?? undefined,
            category_id: data.category_id,
            source_account_id: data.source_account_id,
            destination_account_id: data.destination_account_id,
            target_amount: data.target_amount != null ? Number(data.target_amount) : undefined,
            note: data.note,
          }).then(() => undefined as any)
        : transactionsApi
            .updateMyTransactionApiV1TransactionsTransactionIdPatch(id, data)
            .then((r) => r.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all })
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard })
      void queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all })
    },
  })
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient()
  const { mode } = useLocalAuth()
  const isLocal = mode === 'local'

  return useMutation({
    mutationFn: (id: string) =>
      isLocal
        ? deleteLocalTransaction(id)
        : transactionsApi
            .deleteMyTransactionApiV1TransactionsTransactionIdDelete(id)
            .then((r) => r.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all })
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard })
      void queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all })
    },
  })
}
