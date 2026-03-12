import { Box, Skeleton, Typography } from '@mui/material'
import type { AccountBrief } from '@/api/generated'

interface Props {
  accounts: AccountBrief[]
  isLoading: boolean
}

function formatBalance(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function BalanceHeader({ accounts, isLoading }: Props) {
  const totalBalance = accounts.reduce((sum, acc) => sum + parseFloat(acc.balance), 0)
  const currency = accounts[0]?.currency_code ?? 'USD'

  return (
    <Box sx={{ textAlign: 'center', pt: 4, pb: 2 }}>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Total Balance
      </Typography>

      {isLoading ? (
        <Skeleton variant="text" width={180} height={52} sx={{ mx: 'auto' }} />
      ) : (
        <Typography variant="h3" fontWeight={700}>
          {formatBalance(totalBalance, currency)}
        </Typography>
      )}

      {!isLoading && accounts.length > 0 && (
        <Typography variant="caption" color="text.secondary">
          Across {accounts.length} account{accounts.length !== 1 ? 's' : ''}
        </Typography>
      )}

      {!isLoading && accounts.length === 0 && (
        <Typography variant="caption" color="text.secondary">
          No accounts yet
        </Typography>
      )}
    </Box>
  )
}
