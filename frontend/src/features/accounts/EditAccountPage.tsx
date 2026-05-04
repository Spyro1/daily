import { useEffect, useState } from 'react'
import {
  AccountBalanceRounded,
  CreditCardRounded,
  DeleteRounded,
  PaymentsRounded,
  SavingsRounded,
  WalletRounded,
  WorkspacesRounded,
} from '@mui/icons-material'
import { alpha } from '@mui/material/styles'
import { MuiColorInput } from 'mui-color-input'
import {
  Box,
  Button,
  ButtonBase,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material'
import { useNavigate, useParams } from '@tanstack/react-router'
import { PageLayout } from '#/shared/layout/PageLayout'
import { useNotify } from '#/shared/providers/SnackbarProvider'
import { useAccount, useUpdateAccount, useDeleteAccount } from './hooks/useAccounts'

const ACCOUNT_ICONS = [
  { value: 'wallet', label: 'Wallet', Icon: WalletRounded },
  { value: 'savings', label: 'Savings', Icon: SavingsRounded },
  { value: 'bank', label: 'Bank', Icon: AccountBalanceRounded },
  { value: 'card', label: 'Card', Icon: CreditCardRounded },
  { value: 'cash', label: 'Cash', Icon: PaymentsRounded },
  { value: 'shared', label: 'Shared', Icon: WorkspacesRounded },
] as const

const CURRENCIES = ['HUF', 'USD', 'EUR'] as const

export function EditAccountPage() {
  const { id } = useParams({ strict: false }) as { id: string }
  const navigate = useNavigate()
  const notify = useNotify()
  const { data: account, isPending: isLoading } = useAccount(id)
  const { mutate: updateAccount, isPending: isUpdating } = useUpdateAccount()
  const { mutate: deleteAccount, isPending: isDeleting } = useDeleteAccount()

  const [name, setName] = useState('')
  const [currency, setCurrency] = useState<string>('USD')
  const [icon, setIcon] = useState<string>('wallet')
  const [color, setColor] = useState('#14633d')
  const [includeInTotal, setIncludeInTotal] = useState(true)
  const [isArchived, setIsArchived] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (account && !initialized) {
      setName(account.name)
      setCurrency(account.currency_code)
      setIcon(account.icon_name)
      setColor(account.color || '#14633d')
      setIncludeInTotal(account.include_in_total)
      setIsArchived(account.is_archived)
      setInitialized(true)
    }
  }, [account, initialized])

  const isPending = isUpdating || isDeleting

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName) return

    updateAccount(
      {
        id,
        data: {
          name: trimmedName,
          currency_code: currency,
          icon_name: icon,
          color,
          include_in_total: includeInTotal,
          is_archived: isArchived,
        },
      },
      {
        onSuccess: () => {
          notify('Account updated.', 'success')
          void navigate({ to: '/accounts' })
        },
      },
    )
  }

  const onDelete = () => {
    deleteAccount(id, {
      onSuccess: () => {
        notify('Account deleted.', 'success')
        void navigate({ to: '/accounts' })
      },
    })
    setDeleteDialogOpen(false)
  }

  if (isLoading) {
    return <PageLayout title="Edit Account"><Paper elevation={2} sx={{ p: 2.5, borderRadius: 1.5 }}>Loading...</Paper></PageLayout>
  }

  if (!account) {
    return <PageLayout title="Edit Account"><Paper elevation={2} sx={{ p: 2.5, borderRadius: 1.5 }}>Account not found.</Paper></PageLayout>
  }

  return (
    <Box component="form" onSubmit={onSubmit} sx={{ display: 'contents' }}>
      <PageLayout title="Edit Account">
        <Paper elevation={2} sx={{ p: 2.5, borderRadius: 1.5 }}>
          <Stack spacing={2.5}>
            <TextField
              label="Account name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Main wallet"
              autoComplete="off"
              disabled={isPending}
              fullWidth
              required
            />

            <FormControl fullWidth>
              <InputLabel id="account-currency-label">Currency</InputLabel>
              <Select
                labelId="account-currency-label"
                value={currency}
                label="Currency"
                disabled={isPending}
                onChange={(e) => setCurrency(e.target.value)}
              >
                {CURRENCIES.map((c) => (
                  <MenuItem key={c} value={c}>{c}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <Stack spacing={1.25}>
              <Typography variant="subtitle2">Account icon</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 1.25 }}>
                {ACCOUNT_ICONS.map(({ value, label, Icon }) => {
                  const selected = icon === value
                  return (
                    <ButtonBase
                      key={value}
                      type="button"
                      onClick={() => setIcon(value)}
                      disabled={isPending}
                      sx={{ width: '100%', borderRadius: 3, textAlign: 'center' }}
                    >
                      <Box
                        sx={(theme) => ({
                          width: '100%',
                          borderRadius: 3,
                          border: `1px solid ${selected ? theme.palette.primary.main : theme.palette.divider}`,
                          backgroundColor: selected
                            ? alpha(theme.palette.primary.main, theme.palette.mode === 'light' ? 0.12 : 0.18)
                            : theme.palette.background.default,
                          px: 1,
                          py: 1.5,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 0.75,
                        })}
                      >
                        <Icon color={selected ? 'primary' : 'inherit'} />
                        <Typography variant="body2" fontWeight={selected ? 700 : 600}>{label}</Typography>
                      </Box>
                    </ButtonBase>
                  )
                })}
              </Box>
            </Stack>

            <Stack spacing={1.25}>
              <Typography variant="subtitle2">Account color</Typography>
              <MuiColorInput
                fullWidth
                isAlphaHidden
                format="hex"
                value={color}
                variant="outlined"
                disabled={isPending}
                onChange={(value) => setColor(value)}
              />
            </Stack>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, px: 2, py: 1.5 }}>
              <Stack spacing={0.25}>
                <Typography variant="subtitle2">Include in total</Typography>
                <Typography variant="body2" color="text.secondary">Count this account when showing the combined balance.</Typography>
              </Stack>
              <FormControlLabel
                sx={{ m: 0 }}
                control={<Switch checked={includeInTotal} disabled={isPending} onChange={(e) => setIncludeInTotal(e.target.checked)} />}
                label=""
              />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, px: 2, py: 1.5 }}>
              <Stack spacing={0.25}>
                <Typography variant="subtitle2">Archived</Typography>
                <Typography variant="body2" color="text.secondary">Archived accounts can't receive new transactions.</Typography>
              </Stack>
              <FormControlLabel
                sx={{ m: 0 }}
                control={<Switch checked={isArchived} disabled={isPending} onChange={(e) => setIsArchived(e.target.checked)} />}
                label=""
              />
            </Box>
          </Stack>
        </Paper>

        <Stack direction="row" spacing={1.5}>
          <Button variant="outlined" color="error" onClick={() => setDeleteDialogOpen(true)} disabled={isPending} aria-label="Delete">
            <DeleteRounded />
          </Button>
          <Button variant="outlined" fullWidth onClick={() => void navigate({ to: '/accounts' })} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" fullWidth disabled={isPending}>
            {isUpdating ? 'Saving...' : 'Save'}
          </Button>
        </Stack>

        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Delete account?</DialogTitle>
          <DialogContent>
            <DialogContentText>This will permanently remove this account and may affect related transactions.</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button onClick={onDelete} color="error" variant="contained">Delete</Button>
          </DialogActions>
        </Dialog>
      </PageLayout>
    </Box>
  )
}
