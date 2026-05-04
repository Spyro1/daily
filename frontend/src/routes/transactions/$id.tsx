import { createFileRoute } from '@tanstack/react-router'
import { EditTransactionPage } from '../../features/transactions/EditTransactionPage'

export const Route = createFileRoute('/transactions/$id')({
  component: EditTransactionPage,
})
