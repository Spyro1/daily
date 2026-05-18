import { useEffect, useState } from 'react'
import {
  ArrowDownwardRounded,
  ArrowUpwardRounded,
  DeleteRounded,
  SwapHorizRounded,
} from '@mui/icons-material'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  FormHelperText,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material'
import { useNavigate, useParams } from '@tanstack/react-router'
import { TransactionType } from '@/api/generated'
import type { CreateTransaction, TransactionType as TxType } from '@/api/generated'
import { useNotify } from '#/shared/providers/SnackbarProvider'
import { buildCategoryTreeOptions } from '../categories/categoryTree'
import { useAccounts } from '../accounts/hooks/useAccounts'
import { useCategories } from '../categories/hooks/useCategories'
import { useTransaction, useUpdateTransaction, useDeleteTransaction } from './hooks/useTransactions'
import { PageLayout } from '#/shared/layout/PageLayout'

const TYPE_CONFIG = [
  { value: TransactionType.Expense, label: 'Expense', Icon: ArrowDownwardRounded },
  { value: TransactionType.Income, label: 'Income', Icon: ArrowUpwardRounded },
  { value: TransactionType.Transfer, label: 'Transfer', Icon: SwapHorizRounded },
]

function toDateInputValue(isoStr: string): string {
  return new Date(isoStr).toISOString().split('T')[0]!
}

function toApiAmount(value: string): CreateTransaction['amount'] {
  return value as CreateTransaction['amount']
}

export function EditTransactionPage() {
  const { id } = useParams({ strict: false }) as { id: string }
  const navigate = useNavigate()
  const notify = useNotify()
  const { data: transaction, isPending: isLoading } = useTransaction(id)
  const { data: accounts } = useAccounts()
  const { data: categories } = useCategories()
  const { mutate: updateTransaction, isPending: isUpdating } = useUpdateTransaction()
  const { mutate: deleteTransaction, isPending: isDeleting } = useDeleteTransaction()

  const [txType, setTxType] = useState<TxType>(TransactionType.Expense)
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [sourceAccountId, setSourceAccountId] = useState('')
  const [destinationAccountId, setDestinationAccountId] = useState('')
  const [date, setDate] = useState('')
  const [note, setNote] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (transaction && !initialized) {
      setTxType(transaction.transaction_type)
      setAmount(transaction.amount)
      setCategoryId(transaction.category?.id ?? '')
      setSourceAccountId(transaction.source_account?.id ?? '')
      setDestinationAccountId(transaction.destination_account?.id ?? '')
      setDate(toDateInputValue(transaction.occurred_at))
      setNote(transaction.note ?? '')
      setInitialized(true)
    }
  }, [transaction, initialized])

  const isExpense = txType === TransactionType.Expense
  const isIncome = txType === TransactionType.Income
  const isTransfer = txType === TransactionType.Transfer
  const isPending = isUpdating || isDeleting

  const filteredCategories =
    categories?.filter((c) =>
      isExpense ? c.type === 'expense' : isIncome ? c.type === 'income' : true,
    ) ?? []
  const categoryOptions = buildCategoryTreeOptions(filteredCategories)
  const sourceAccountRequired = !isIncome
  const destinationAccountRequired = !isExpense
  const hasRequiredAccounts =
    (!sourceAccountRequired || !!sourceAccountId) &&
    (!destinationAccountRequired || !!destinationAccountId)
  const hasValidTransferAccounts = !isTransfer || sourceAccountId !== destinationAccountId
  const hasRequiredCategory = isTransfer || !!categoryId
  const canSubmit = !!amount.trim() && hasRequiredCategory && hasRequiredAccounts && hasValidTransferAccounts

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const trimmedAmount = amount.trim()
    if (!trimmedAmount || !hasRequiredCategory || !hasRequiredAccounts || !hasValidTransferAccounts) return

    updateTransaction(
      {
        id,
        data: {
          amount: toApiAmount(trimmedAmount) as any,
          transaction_type: txType,
          category_id: isTransfer ? null : categoryId,
          occurred_at: new Date(date).toISOString(),
          source_account_id: sourceAccountRequired ? sourceAccountId : null,
          destination_account_id: destinationAccountRequired ? destinationAccountId : null,
          target_amount: isTransfer ? (toApiAmount(trimmedAmount) as any) : null,
          note: note.trim() || null,
        },
      },
      {
        onSuccess: () => {
          notify('Transaction updated.', 'success')
          void navigate({ to: '/transactions' })
        },
      },
    )
  }

  const onDelete = () => {
    deleteTransaction(id, {
      onSuccess: () => {
        notify('Transaction deleted.', 'success')
        void navigate({ to: '/transactions' })
      },
    })
    setDeleteDialogOpen(false)
  }

  if (isLoading) {
    return <PageLayout title="Edit Transaction"><Paper elevation={2} sx={{ p: 2.5, borderRadius: 1.5 }}>Loading...</Paper></PageLayout>
  }

  if (!transaction) {
    return <PageLayout title="Edit Transaction"><Paper elevation={2} sx={{ p: 2.5, borderRadius: 1.5 }}>Transaction not found.</Paper></PageLayout>
  }

  return (
    <Box component="form" onSubmit={onSubmit} sx={{ display: 'contents' }}>
      <PageLayout title="Edit Transaction">
        <Paper elevation={2} sx={{ p: 2.5, borderRadius: 1.5 }}>
          <Stack spacing={2.5}>
            <ToggleButtonGroup
              exclusive
              fullWidth
              value={txType}
              onChange={(_, v) => {
                if (!v) return
                setTxType(v)
                setCategoryId('')
                if (v === TransactionType.Expense) setDestinationAccountId('')
                if (v === TransactionType.Income) setSourceAccountId('')
              }}
              size="small"
              disabled={isPending}
            >
              {TYPE_CONFIG.map(({ value, label, Icon }) => (
                <ToggleButton key={value} value={value} sx={{ gap: 0.75 }}>
                  <Icon fontSize="small" />
                  {label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>

            <TextField
              label="Amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              inputProps={{ min: 0, step: '0.01' }}
              InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
              disabled={isPending}
              fullWidth
              required
              autoComplete="off"
            />

            {!isTransfer && (
              <FormControl fullWidth required>
                <InputLabel id="tx-category-label">Category</InputLabel>
                <Select
                  labelId="tx-category-label"
                  value={categoryId}
                  label="Category"
                  disabled={isPending}
                  onChange={(e) => setCategoryId(e.target.value)}
                >
                  {categoryOptions.map((option) => (
                    <MenuItem key={option.id} value={option.id}>{option.pathLabel}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {!isIncome && (
              <FormControl fullWidth required={sourceAccountRequired}>
                <InputLabel id="tx-source-label">{isTransfer ? 'From account' : 'Account'}</InputLabel>
                <Select
                  labelId="tx-source-label"
                  value={sourceAccountId}
                  label={isTransfer ? 'From account' : 'Account'}
                  disabled={isPending}
                  onChange={(e) => setSourceAccountId(e.target.value)}
                >
                  <MenuItem value=""><em>None</em></MenuItem>
                  {accounts?.map((acc) => (
                    <MenuItem key={acc.id} value={acc.id}>{acc.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {!isExpense && (
              <FormControl fullWidth required={destinationAccountRequired} error={isTransfer && !!sourceAccountId && sourceAccountId === destinationAccountId}>
                <InputLabel id="tx-dest-label">{isTransfer ? 'To account' : 'Account'}</InputLabel>
                <Select
                  labelId="tx-dest-label"
                  value={destinationAccountId}
                  label={isTransfer ? 'To account' : 'Account'}
                  disabled={isPending}
                  onChange={(e) => setDestinationAccountId(e.target.value)}
                >
                  <MenuItem value=""><em>None</em></MenuItem>
                  {accounts?.map((acc) => (
                    <MenuItem key={acc.id} value={acc.id}>{acc.name}</MenuItem>
                  ))}
                </Select>
                {isTransfer && !!sourceAccountId && sourceAccountId === destinationAccountId && (
                  <FormHelperText>Choose a different destination account for transfers.</FormHelperText>
                )}
              </FormControl>
            )}

            <TextField
              label="Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={isPending}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="Note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={isPending}
              fullWidth
              multiline
              rows={2}
              autoComplete="off"
            />
          </Stack>
        </Paper>

        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            color="error"
            onClick={() => setDeleteDialogOpen(true)}
            disabled={isPending}
            aria-label="Delete"
          >
            <DeleteRounded />
          </Button>
          <Button
            variant="outlined"
            fullWidth
            onClick={() => void navigate({ to: '/transactions' })}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button type="submit" variant="contained" fullWidth disabled={isPending || !canSubmit}>
            {isUpdating ? 'Saving...' : 'Save'}
          </Button>
        </Stack>

        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Delete transaction?</DialogTitle>
          <DialogContent>
            <DialogContentText>This action cannot be undone.</DialogContentText>
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
