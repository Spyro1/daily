import { createFileRoute } from '@tanstack/react-router'
import { NewTransactionPage } from '#/features/transactions/NewTransactionPage'

export const Route = createFileRoute('/transactions/new')({
  component: NewTransactionPage
})