import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { AccountIndex, CreateAccount, UpdateAccount } from '@/api/generated'
import { accountsApi } from '@/api/clients'
import { queryKeys } from '@/api/queryKeys'

export function useAccounts() {
  return useQuery({
    queryKey: queryKeys.accounts.all,
    queryFn: () => accountsApi.getMyAccountsApiV1AccountsGet().then((r) => r.data),
  })
}

export function useAccount(id: string) {
  return useQuery({
    queryKey: queryKeys.accounts.detail(id),
    queryFn: () => accountsApi.getMyAccountApiV1AccountsAccountIdGet(id).then((r) => r.data),
    enabled: !!id,
  })
}

export function useCreateAccount() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateAccount) =>
      accountsApi.createMyNewAccountApiV1AccountsPost(data).then((r) => r.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all })
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard })
    },
  })
}

export function useUpdateAccount() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAccount }) =>
      accountsApi
        .updateMyAccountApiV1AccountsAccountIdPatch(id, data)
        .then((r) => r.data),
    // Optimistic update: reflect safe field changes immediately in the cached list
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.accounts.all })
      const snapshot = queryClient.getQueryData<AccountIndex[]>(queryKeys.accounts.all)
      queryClient.setQueryData<AccountIndex[]>(queryKeys.accounts.all, (prev) =>
        prev?.map((acc) => {
          if (acc.id !== id) return acc
          return {
            ...acc,
            ...(data.name != null && { name: data.name }),
            ...(data.color != null && { color: data.color }),
            ...(data.icon_name != null && { icon_name: data.icon_name }),
            ...(data.currency_code != null && { currency_code: data.currency_code }),
            ...(data.include_in_total != null && { include_in_total: data.include_in_total }),
            ...(data.is_archived != null && { is_archived: data.is_archived }),
          }
        }),
      )
      return { snapshot }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.snapshot) {
        queryClient.setQueryData(queryKeys.accounts.all, ctx.snapshot)
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all })
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard })
    },
  })
}

export function useDeleteAccount() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      accountsApi.deleteMyAccountApiV1AccountsAccountIdDelete(id).then((r) => r.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all })
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard })
    },
  })
}
