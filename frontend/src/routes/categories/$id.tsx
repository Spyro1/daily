import { createFileRoute } from '@tanstack/react-router'
import { EditCategoryPage } from '#/features/categories/EditCategoryPage'

export const Route = createFileRoute('/categories/$id')({
  component: EditCategoryPage,
})
