import { AddRounded } from '@mui/icons-material'
import { Fab, List, Paper, Skeleton, Stack } from '@mui/material'
import { useNavigate } from '@tanstack/react-router'
import { PageLayout } from '#/shared/layout/PageLayout'
import { EmptyState } from '#/shared/ui/EmptyState'
import { useTransactions } from './hooks/useTransactions'
import { TransactionCard } from './components/TransactionCard'

export function TransactionsPage() {
  const navigate = useNavigate()
  const { data: transactions, isPending } = useTransactions()

  const fab = (
    <Fab
      size="small"
      color="primary"
      aria-label="New transaction"
      onClick={() => void navigate({ to: '/transactions/new' })}
    >
      <AddRounded />
    </Fab>
  )

  return (
    <PageLayout overline="History" title="Transactions" action={fab}>
      {isPending ? (
        <Paper elevation={2} sx={{ px: 2.5, py: 2, borderRadius: 3 }}>
          <Stack spacing={1.5}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Stack key={i} direction="row" spacing={1.5} alignItems="center">
                <Skeleton variant="rounded" width={36} height={36} />
                <Stack flex={1} spacing={0.5}>
                  <Skeleton variant="text" width="45%" />
                  <Skeleton variant="text" width="25%" />
                </Stack>
                <Skeleton variant="text" width={56} />
              </Stack>
            ))}
          </Stack>
        </Paper>
      ) : !transactions?.length ? (
        <EmptyState message="No transactions yet. Tap + to record one." />
      ) : (
        <Paper elevation={2} sx={{ px: 2.5, borderRadius: 3, overflow: 'hidden' }}>
          <List disablePadding>
            {transactions.map((tx, idx) => (
              <TransactionCard
                key={tx.id}
                transaction={tx}
                showDivider={idx < transactions.length - 1}
              />
            ))}
          </List>
        </Paper>
      )}
    </PageLayout>
  )
}