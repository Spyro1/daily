import { createFileRoute } from '@tanstack/react-router'
import { EditAccountPage } from '#/features/accounts/EditAccountPage'

export const Route = createFileRoute('/accounts/$id')({
  component: EditAccountPage,
})
