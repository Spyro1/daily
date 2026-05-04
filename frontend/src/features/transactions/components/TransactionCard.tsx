import {
  ArrowDownwardRounded,
  ArrowUpwardRounded,
  SwapHorizRounded,
} from '@mui/icons-material'
import { Box, ButtonBase, Divider, Paper, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { useNavigate } from '@tanstack/react-router'
import type { TransactionIndex, TransactionType } from '@/api/generated'
import { formatCurrency } from '@/shared/utils/currency'

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
  const navigate = useNavigate()
  const cfg = TYPE_CONFIG[tx.transaction_type as TxType] ?? TYPE_CONFIG.transfer
  const { Icon, color, sign } = cfg
  const currencyCode = tx.source_account?.currency_code ?? tx.destination_account?.currency_code ?? 'USD'
  const amountLabel = `${sign}${formatCurrency(parseFloat(tx.amount), currencyCode)}`

  return (
    <>
      <ButtonBase
        onClick={() => void navigate({ to: '/transactions/$id', params: { id: tx.id } })}
        sx={{ width: '100%', borderRadius: 2, textAlign: 'left' }}
      >
        <Paper
          elevation={2}
          sx={{
            px: 2,
            py: 1.25,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            width: '100%',
          }}
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
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" fontWeight={600} noWrap>
              {tx.category.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {formatDate(tx.occurred_at)}
              {tx.note ? ` · ${tx.note}` : ''}
            </Typography>
          </Box>
          <Typography variant="body2" fontWeight={700} sx={{ color, flexShrink: 0, ml: 1 }}>
            {amountLabel}
          </Typography>
        </Paper>
      </ButtonBase>
      {showDivider && <Divider sx={{ my: 0.5 }} />}
    </>
  )
}
