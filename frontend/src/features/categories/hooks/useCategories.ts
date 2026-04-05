import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { CategoryIndex, CreateCategory, UpdateCategory } from '@/api/generated'
import { categoriesApi } from '@/api/clients'
import { queryKeys } from '@/api/queryKeys'
import { useLocalAuth } from '#/features/auth/hooks/useLocalAuth'
import {
  getLocalCategories,
  createLocalCategory,
  updateLocalCategory,
  deleteLocalCategory,
} from '@/lib/localCrud'
import type { LocalCategory } from '@/lib/localDb'

/** Map a LocalCategory to the shape the UI expects (CategoryIndex). */
function toCategoryIndex(c: LocalCategory): CategoryIndex {
  return {
    id: c.id,
    name: c.name,
    parent_id: c.parent_id ?? undefined,
    icon_name: c.icon_name,
    color: c.color ?? undefined,
    type: c.category_type as CategoryIndex['type'],
  }
}

export function useCategories() {
  const { mode } = useLocalAuth()
  const isLocal = mode === 'local'

  return useQuery({
    queryKey: queryKeys.categories.all,
    queryFn: isLocal
      ? () => getLocalCategories().then((list) => list.map(toCategoryIndex))
      : () => categoriesApi.getMyCategoriesApiV1CategoriesGet().then((r) => r.data),
  })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()
  const { mode } = useLocalAuth()
  const isLocal = mode === 'local'

  return useMutation({
    mutationFn: (data: CreateCategory) =>
      isLocal
        ? createLocalCategory({
            name: data.name,
            parent_id: data.parent_id,
            icon_name: data.icon_name,
            color: data.color,
            type: data.type as 'expense' | 'income',
          }).then(toCategoryIndex)
        : categoriesApi.createMyNewCategoryApiV1CategoriesPost(data).then((r) => r.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.categories.all })
    },
  })
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()
  const { mode } = useLocalAuth()
  const isLocal = mode === 'local'

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategory }) =>
      isLocal
        ? updateLocalCategory(id, {
            name: data.name ?? undefined,
            parent_id: data.parent_id,
            icon_name: data.icon_name ?? undefined,
            color: data.color,
            type: data.type as 'expense' | 'income' | undefined,
          }).then(toCategoryIndex)
        : categoriesApi
            .updateMyCategoryApiV1CategoriesCategoryIdPatch(id, data)
            .then((r) => r.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.categories.all })
    },
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()
  const { mode } = useLocalAuth()
  const isLocal = mode === 'local'

  return useMutation({
    mutationFn: (id: string) =>
      isLocal
        ? deleteLocalCategory(id)
        : categoriesApi
            .deleteMyCategoryApiV1CategoriesCategoryIdDelete(id)
            .then((r) => r.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.categories.all })
    },
  })
}
