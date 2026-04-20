import {
  ArrowDownwardRounded,
  ArrowUpwardRounded,
  SwapHorizRounded,
} from '@mui/icons-material'
import {
  Box,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import { useNavigate } from '@tanstack/react-router'
import type { TransactionBrief, TransactionType } from '@/api/generated'
import { formatCurrency } from '@/shared/utils/currency'

interface Props {
  transactions: TransactionBrief[]
  currencyCode: string
  isLoading: boolean
}

const RECENT_LIMIT = 6

type TxType = typeof TransactionType[keyof typeof TransactionType]

const TYPE_CONFIG: Record<
  TxType,
  { Icon: React.ElementType; color: string; sign: string }
> = {
  expense: { Icon: ArrowDownwardRounded, color: '#f44336', sign: '-' },
  income: { Icon: ArrowUpwardRounded, color: '#4caf50', sign: '+' },
  transfer: { Icon: SwapHorizRounded, color: '#2196f3', sign: '' },
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function extractNote(tx: TransactionBrief): string {
  const note = (tx as { note?: string | null }).note
  return typeof note === 'string' ? note.trim() : ''
}

function formatAmount(tx: TransactionBrief, currencyCode: string): string {
  const value = parseFloat(tx.amount)
  const cfg = TYPE_CONFIG[tx.transaction_type as TxType] ?? TYPE_CONFIG.transfer
  return `${cfg.sign}${formatCurrency(value, currencyCode)}`
}

export function RecentTransactions({ transactions, currencyCode, isLoading }: Props) {
  const navigate = useNavigate()
  const recent = transactions.slice(0, RECENT_LIMIT)

  return (
    <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
      <Box sx={{ px: 2.5, pt: 2.5, pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
        <Typography variant="h6">Recent Transactions</Typography>
        <Button
          variant="text"
          size="small"
          onClick={() => void navigate({ to: '/transactions' })}
        >
          View all
        </Button>
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
              const cfg = TYPE_CONFIG[tx.transaction_type as TxType] ?? TYPE_CONFIG.transfer
              const { Icon, color } = cfg
              const note = extractNote(tx)
              return (
                <Box key={tx.id}>
                  <ListItem
                    sx={{ px: 2.5, py: 1.25 }}
                    secondaryAction={
                      <Typography
                        variant="body2"
                        fontWeight={700}
                        sx={{ color }}
                      >
                        {formatAmount(tx, currencyCode)}
                      </Typography>
                    }
                  >
                    <Box
                      sx={(theme) => ({
                        width: 36,
                        height: 36,
                        borderRadius: 2,
                        backgroundColor: alpha(color, theme.palette.mode === 'light' ? 0.12 : 0.2),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 1.5,
                        flexShrink: 0,
                      })}
                    >
                      <Icon sx={{ fontSize: 18, color }} />
                    </Box>
                    <ListItemText
                      primary={
                        <Typography variant="body2" fontWeight={600} noWrap>
                          {tx.category.name}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {note ? `${formatDate(tx.occurred_at)} · ${note}` : formatDate(tx.occurred_at)}
                        </Typography>
                      }
                      sx={{ mr: 6 }}
                    />
                  </ListItem>
                  {idx < recent.length - 1 && <Divider component="li" />}
                </Box>
              )
            })}
          </List>
        </>
      )}
    </Paper>
  )
}
