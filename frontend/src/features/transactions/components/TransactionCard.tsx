import {
  ArrowDownwardRounded,
  ArrowUpwardRounded,
  SwapHorizRounded,
} from '@mui/icons-material'
import { Box, Divider, ListItem, ListItemText, Stack, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import type { TransactionIndex, TransactionType } from '@/api/generated'

interface TransactionCardProps {
  transaction: TransactionIndex
  showDivider?: boolean
}

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

export function TransactionCard({ transaction: tx, showDivider = true }: TransactionCardProps) {
  const cfg = TYPE_CONFIG[tx.transaction_type as TxType] ?? TYPE_CONFIG.transfer
  const { Icon, color, sign } = cfg
  const amountLabel = `${sign}$${parseFloat(tx.amount).toFixed(2)}`

  return (
    <>
      <ListItem
        sx={{ px: 0, py: 1.25 }}
        secondaryAction={
          <Typography variant="body2" fontWeight={700} sx={{ color }}>
            {amountLabel}
          </Typography>
        }
      >
        <Box
          sx={(theme) => ({
            width: 36,
            height: 36,
            borderRadius: 3,
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
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="body2" fontWeight={600}>
                {tx.category.name}
              </Typography>
            </Stack>
          }
          secondary={
            <Typography variant="caption" color="text.secondary">
              {formatDate(tx.occurred_at)}
              {tx.note ? ` · ${tx.note}` : ''}
            </Typography>
          }
          sx={{ mr: 6 }}
        />
      </ListItem>
      {showDivider && <Divider component="li" />}
    </>
  )
}
