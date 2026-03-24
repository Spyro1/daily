import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { CreateTransaction, UpdateTransaction } from '@/api/generated'
import { transactionsApi } from '@/api/clients'
import { queryKeys } from '@/api/queryKeys'

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
  return useQuery({
    queryKey: [...queryKeys.transactions.all, { dateFrom, dateTo, categoryId, accountId, transactionType, skip, limit }],
    queryFn: () => transactionsApi.getMyTransactionsApiV1TransactionsGet(
      dateFrom, dateTo, categoryId, accountId, transactionType as any, skip, limit
    ).then((r) => r.data),
  })
}

export function useCreateTransaction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateTransaction) =>
      transactionsApi
        .createMyNewTransactionApiV1TransactionsPost(data)
        .then((r) => r.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all })
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard })
    },
  })
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTransaction }) =>
      transactionsApi
        .updateMyTransactionApiV1TransactionsTransactionIdPatch(id, data)
        .then((r) => r.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all })
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard })
    },
  })
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      transactionsApi
        .deleteMyTransactionApiV1TransactionsTransactionIdDelete(id)
        .then((r) => r.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all })
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard })
    },
  })
}
