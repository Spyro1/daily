import {
  AccountBalanceRounded,
  CreditCardRounded,
  PaymentsRounded,
  SavingsRounded,
  WalletRounded,
  WorkspacesRounded,
} from '@mui/icons-material'
import { alpha } from '@mui/material/styles'
import { Box, Chip, Paper, Stack, Typography } from '@mui/material'
import type { SvgIconProps } from '@mui/material'
import type { AccountIndex } from '@/api/generated'

const ICON_MAP: Record<string, React.ComponentType<SvgIconProps>> = {
  wallet: WalletRounded,
  savings: SavingsRounded,
  bank: AccountBalanceRounded,
  card: CreditCardRounded,
  cash: PaymentsRounded,
  shared: WorkspacesRounded,
}

interface AccountCardProps {
  account: AccountIndex
}

export function AccountCard({ account }: AccountCardProps) {
  const Icon = ICON_MAP[account.icon_name] ?? WalletRounded
  const balance = parseFloat(account.balance)
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: account.currency_code,
    minimumFractionDigits: 2,
  }).format(balance)

  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        borderRadius: 3,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        opacity: account.is_archived ? 0.55 : 1,
      }}
    >
      <Box
        sx={(theme) => ({
          width: 44,
          height: 44,
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          backgroundColor: alpha(account.color, theme.palette.mode === 'light' ? 0.15 : 0.25),
          color: account.color,
        })}
      >
        <Icon />
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="subtitle1" fontWeight={600} noWrap>
            {account.name}
          </Typography>
          {account.is_archived && (
            <Chip label="Archived" size="small" sx={{ height: 18, fontSize: '0.6rem' }} />
          )}
        </Stack>
        <Typography variant="caption" color="text.secondary">
          {account.currency_code}
          {!account.include_in_total && ' · excluded from total'}
        </Typography>
      </Box>

      <Typography variant="subtitle1" fontWeight={700} sx={{ flexShrink: 0 }}>
        {formatted}
      </Typography>
    </Paper>
  )
}
