import { useMemo, useState } from 'react'
import { AddRounded } from '@mui/icons-material'
import { Fab, List, Paper, Skeleton, Stack, TextField, ToggleButton, ToggleButtonGroup } from '@mui/material'
import { useNavigate } from '@tanstack/react-router'
import type { TransactionType } from '@/api/generated'
import { PageLayout } from '#/shared/layout/PageLayout'
import { EmptyState } from '#/shared/ui/EmptyState'
import { useTransactions } from './hooks/useTransactions'
import { TransactionCard } from './components/TransactionCard'

type TransactionTypeFilter = 'all' | TransactionType

export function TransactionsPage() {
  const navigate = useNavigate()
  const { data: transactions, isPending } = useTransactions()
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<TransactionTypeFilter>('all')

  const filteredTransactions = useMemo(() => {
    const list = transactions?.data ?? []
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return list.filter((tx) => {
      if (typeFilter !== 'all' && tx.transaction_type !== typeFilter) {
        return false
      }

      if (!normalizedSearch) {
        return true
      }

      const haystack = [
        tx.category.name,
        tx.note ?? '',
        tx.source_account?.name ?? '',
        tx.destination_account?.name ?? '',
      ]
        .join(' ')
        .toLowerCase()

      return haystack.includes(normalizedSearch)
    })
  }, [transactions?.data, searchTerm, typeFilter])

  const fab = (
    <Fab
      size="small"
      color="primary"
      aria-label="New transaction"
      onClick={() => void navigate({ to: '/transactions/new' })}
    >
      <AddRounded fontSize="large"/>
    </Fab>
  )

  return (
    <PageLayout title="Transactions" action={fab}>
      <Paper elevation={2} sx={{ p: 2, borderRadius: 2, mb: 2 }}>
        <Stack spacing={1.5}>
          <TextField
            size="small"
            label="Search"
            placeholder="Category, note, or account"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            fullWidth
          />

          <ToggleButtonGroup
            value={typeFilter}
            exclusive
            size="small"
            onChange={(_e, value: TransactionTypeFilter | null) => {
              if (value) setTypeFilter(value)
            }}
            sx={{ flexWrap: 'wrap' }}
          >
            <ToggleButton value="all">All</ToggleButton>
            <ToggleButton value="income">Income</ToggleButton>
            <ToggleButton value="expense">Expense</ToggleButton>
            <ToggleButton value="transfer">Transfer</ToggleButton>
          </ToggleButtonGroup>
        </Stack>
      </Paper>

      {isPending ? (
        <Paper elevation={2} sx={{ px: 2.5, py: 2, borderRadius: 2 }}>
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
      ) : !filteredTransactions.length ? (
        <EmptyState
          message={
            transactions?.data?.length
              ? 'No transactions match the current search/filter.'
              : 'No transactions yet. Tap + to record one.'
          }
        />
      ) : (
        <Paper elevation={2} sx={{ px: 2.5, borderRadius: 2, overflow: 'hidden' }}>
          <List disablePadding>
            {filteredTransactions.map((tx, idx) => (
              <TransactionCard
                key={tx.id}
                transaction={tx}
                showDivider={idx < filteredTransactions.length - 1}
              />
            ))}
          </List>
        </Paper>
      )}
    </PageLayout>
  )
}