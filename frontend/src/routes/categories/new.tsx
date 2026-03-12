import { createFileRoute } from '@tanstack/react-router'
import { CreateCategoryPage } from '@/features/categories/CreateCategoryPage'

export const Route = createFileRoute('/categories/new')({
    component: CreateCategoryPage,
})
