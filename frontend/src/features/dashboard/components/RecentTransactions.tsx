import {
  Box,
  Button,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material'
import type { TransactionBrief } from '@/api/generated'

interface Props {
  transactions: TransactionBrief[]
  isLoading: boolean
}

const TYPE_CONFIG: Record<string, { label: string; color: 'success' | 'error' | 'info' }> = {
  income: { label: 'Income', color: 'success' },
  expanse: { label: 'Expense', color: 'error' },
  transfer: { label: 'Transfer', color: 'info' },
}

const RECENT_LIMIT = 6

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatAmount(tx: TransactionBrief): string {
  const sign = tx.transaction_type === 'expanse' ? '-' : '+'
  return `${sign}$${parseFloat(tx.amount).toFixed(2)}`
}

export function RecentTransactions({ transactions, isLoading }: Props) {
  const recent = transactions.slice(0, RECENT_LIMIT)

  return (
    <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
      <Box sx={{ px: 2.5, pt: 2.5, pb: 1 }}>
        <Typography variant="h6">Recent Transactions</Typography>
      </Box>

      {isLoading ? (
        <Stack spacing={1.5} sx={{ px: 2.5, pb: 2.5 }}>
          {[1, 2, 3].map((i) => (
            <Stack key={i} direction="row" spacing={2} alignItems="center">
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="55%" />
                <Skeleton variant="text" width="30%" />
              </Box>
              <Skeleton variant="text" width={64} />
            </Stack>
          ))}
        </Stack>
      ) : recent.length === 0 ? (
        <Box sx={{ px: 2.5, pb: 2.5 }}>
          <Typography variant="body2" color="text.secondary">
            No transactions yet. Add your first transaction!
          </Typography>
        </Box>
      ) : (
        <>
          <List disablePadding>
            {recent.map((tx, idx) => {
              const cfg = TYPE_CONFIG[tx.transaction_type] ?? { label: tx.transaction_type, color: 'info' as const }
              const isExpense = tx.transaction_type === 'expanse'
              return (
                <Box key={tx.id}>
                  <ListItem
                    sx={{ px: 2.5, py: 1.25 }}
                    secondaryAction={
                      <Typography
                        variant="body2"
                        fontWeight={700}
                        color={isExpense ? 'error.main' : 'primary.main'}
                      >
                        {formatAmount(tx)}
                      </Typography>
                    }
                  >
                    <ListItemText
                      primary={
                        <Typography variant="body2" fontWeight={500}>
                          {tx.category.name}
                        </Typography>
                      }
                      secondary={formatDate(tx.date)}
                      sx={{ mr: 1 }}
                    />
                    <Chip label={cfg.label} color={cfg.color} size="small" sx={{ mr: 1 }} />
                  </ListItem>
                  {idx < recent.length - 1 && <Divider component="li" />}
                </Box>
              )
            })}
          </List>

          {transactions.length > RECENT_LIMIT && (
            <Box sx={{ px: 2.5, pb: 2 }}>
              <Button
                fullWidth
                variant="text"
                onClick={() => {
                  window.location.href = '/transactions'
                }}
              >
                See All {transactions.length} Transactions
              </Button>
            </Box>
          )}
        </>
      )}
    </Paper>
  )
}
