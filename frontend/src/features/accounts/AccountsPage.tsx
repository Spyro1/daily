import { AddRounded } from '@mui/icons-material'
import { Box, Fab, Paper, Skeleton, Stack } from '@mui/material'
import { useNavigate } from '@tanstack/react-router'
import { useAccounts } from './hooks/useAccounts'
import { AccountCard } from './components/AccountCard'
import { PageLayout } from '#/shared/layout/PageLayout'
import { EmptyState } from '#/shared/ui/EmptyState'

export function AccountsPage() {
  const { data: accounts, isPending } = useAccounts()
  const navigate = useNavigate()

  const addAccountFab = (
    <Fab
      color="primary"
      size="small"
      aria-label="add account"
      onClick={() => void navigate({ to: '/accounts/new' })}
    >
      <AddRounded />
    </Fab>
  )

  return (
    <PageLayout title="Accounts" action={addAccountFab}>
      {isPending ? (
        <Stack spacing={1.5}>
          {[1, 2, 3].map((i) => (
            <Paper key={i} elevation={2} sx={{ p: 2, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Skeleton variant="rounded" width={44} height={44} sx={{ borderRadius: 2, flexShrink: 0 }} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="50%" />
                <Skeleton variant="text" width="30%" />
              </Box>
              <Skeleton variant="text" width={64} />
            </Paper>
          ))}
        </Stack>
      ) : accounts?.length === 0 ? (
        <EmptyState message="No accounts yet. Create your first one!" />
      ) : (
        <Stack spacing={1.5}>
          {accounts?.map((acc) => (
            <AccountCard key={acc.id} account={acc} />
          ))}
        </Stack>
      )}
    </PageLayout>
  )
}
