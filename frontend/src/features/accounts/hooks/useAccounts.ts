import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { AccountIndex, CreateAccount, UpdateAccount } from '@/api/generated'
import { accountsApi } from '@/api/clients'
import { queryKeys } from '@/api/queryKeys'
import { useLocalAuth } from '#/features/auth/hooks/useLocalAuth'
import {
  getLocalAccounts,
  getLocalAccount,
  createLocalAccount,
  updateLocalAccount,
  deleteLocalAccount,
} from '@/lib/localCrud'
import type { LocalAccount } from '@/lib/localDb'
import { enqueueMutation, isOffline } from '@/lib/offlineQueue'

/** Map a LocalAccount to the shape the UI expects (AccountIndex). */
function toAccountIndex(a: LocalAccount): AccountIndex {
  return {
    id: a.id,
    name: a.name,
    balance: String(a.balance),
    currency_code: a.currency_code,
    icon_name: a.icon_name,
    color: a.color ?? '',
    include_in_total: a.include_in_total,
    is_archived: a.is_archived,
  }
}

export function useAccounts() {
  const { mode } = useLocalAuth()
  const isLocal = mode === 'local'

  return useQuery({
    queryKey: queryKeys.accounts.all,
    queryFn: isLocal
      ? () => getLocalAccounts().then((list) => list.map(toAccountIndex))
      : () => accountsApi.getMyAccountsApiV1AccountsGet().then((r) => r.data),
  })
}

export function useAccount(id: string) {
  const { mode } = useLocalAuth()
  const isLocal = mode === 'local'

  return useQuery({
    queryKey: queryKeys.accounts.detail(id),
    queryFn: isLocal
      ? () => getLocalAccount(id).then((a) => (a ? toAccountIndex(a) : undefined))
      : () => accountsApi.getMyAccountApiV1AccountsAccountIdGet(id).then((r) => r.data),
    enabled: !!id,
  })
}

export function useCreateAccount() {
  const queryClient = useQueryClient()
  const { mode } = useLocalAuth()
  const isLocal = mode === 'local'

  return useMutation({
    mutationFn: async (data: CreateAccount) => {
      if (isLocal || (mode === 'online' && isOffline())) {
        const result = await createLocalAccount({
          ...data,
          balance: data.balance != null ? Number(data.balance) : undefined,
        }).then(toAccountIndex)
        if (mode === 'online') {
          enqueueMutation({ type: 'create-account', data })
        }
        return result
      }
      return accountsApi.createMyNewAccountApiV1AccountsPost(data).then((r) => r.data)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all })
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard })
    },
  })
}

export function useUpdateAccount() {
  const queryClient = useQueryClient()
  const { mode } = useLocalAuth()
  const isLocal = mode === 'local'

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateAccount }) => {
      if (isLocal || (mode === 'online' && isOffline())) {
        const result = await updateLocalAccount(id, {
          name: data.name ?? undefined,
          balance: data.balance != null ? Number(data.balance) : undefined,
          currency_code: data.currency_code ?? undefined,
          icon_name: data.icon_name ?? undefined,
          color: data.color,
          include_in_total: data.include_in_total ?? undefined,
          is_archived: data.is_archived ?? undefined,
        }).then(toAccountIndex)
        if (mode === 'online') {
          enqueueMutation({ type: 'update-account', id, data })
        }
        return result
      }
      return accountsApi
        .updateMyAccountApiV1AccountsAccountIdPatch(id, data)
        .then((r) => r.data)
    },
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
  const { mode } = useLocalAuth()
  const isLocal = mode === 'local'

  return useMutation({
    mutationFn: async (id: string) => {
      if (isLocal || (mode === 'online' && isOffline())) {
        await deleteLocalAccount(id)
        if (mode === 'online') {
          enqueueMutation({ type: 'delete-account', id })
        }
        return
      }
      return accountsApi.deleteMyAccountApiV1AccountsAccountIdDelete(id).then((r) => r.data)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all })
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard })
    },
  })
}
