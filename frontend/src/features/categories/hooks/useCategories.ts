import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { CreateCategory, UpdateCategory } from '@/api/generated'
import { categoriesApi } from '@/api/clients'
import { queryKeys } from '@/api/queryKeys'

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories.all,
    queryFn: () => categoriesApi.getMyCategoriesApiV1CategoriesGet().then((r) => r.data),
  })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateCategory) =>
      categoriesApi.createMyNewCategoryApiV1CategoriesPost(data).then((r) => r.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.categories.all })
    },
  })
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategory }) =>
      categoriesApi
        .updateMyCategoryApiV1CategoriesCategoryIdPatch(id, data)
        .then((r) => r.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.categories.all })
    },
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      categoriesApi
        .deleteMyCategoryApiV1CategoriesCategoryIdDelete(id)
        .then((r) => r.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.categories.all })
    },
  })
}
