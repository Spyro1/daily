import { createFileRoute } from '@tanstack/react-router'
import { CreateAccountPage } from '@/features/accounts/CreateAccountPage'

export const Route = createFileRoute('/accounts/new')({ 
    component: CreateAccountPage 
})
