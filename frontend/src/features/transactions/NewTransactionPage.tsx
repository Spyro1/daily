import { useState } from 'react'
import {
  ArrowDownwardRounded,
  ArrowUpwardRounded,
  SwapHorizRounded,
} from '@mui/icons-material'
import {
  Box,
  Button,
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
import { useNavigate } from '@tanstack/react-router'
import { TransactionType } from '@/api/generated'
import type { CreateTransaction, TransactionType as TxType } from '@/api/generated'
import { useNotify } from '#/shared/providers/SnackbarProvider'
import { buildCategoryTreeOptions } from '../categories/categoryTree'
import { useAccounts } from '../accounts/hooks/useAccounts'
import { useCategories } from '../categories/hooks/useCategories'
import { useCreateTransaction } from './hooks/useTransactions'
import { PageLayout } from '#/shared/layout/PageLayout'

const TYPE_CONFIG = [
  { value: TransactionType.Expense, label: 'Expense', Icon: ArrowDownwardRounded },
  { value: TransactionType.Income, label: 'Income', Icon: ArrowUpwardRounded },
  { value: TransactionType.Transfer, label: 'Transfer', Icon: SwapHorizRounded },
]

function today(): string {
  return new Date().toISOString().split('T')[0]!
}

function toApiAmount(value: string): CreateTransaction['amount'] {
  return value as CreateTransaction['amount']
}

export function NewTransactionPage() {
  const navigate = useNavigate()
  const notify = useNotify()
  const [txType, setTxType] = useState<TxType>(TransactionType.Expense)
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [sourceAccountId, setSourceAccountId] = useState('')
  const [destinationAccountId, setDestinationAccountId] = useState('')
  const [date, setDate] = useState(today())
  const [note, setNote] = useState('')

  const { data: accounts } = useAccounts()
  const { data: categories } = useCategories()
  const { mutate: createTransaction, isPending } = useCreateTransaction()
  const isExpense = txType === TransactionType.Expense
  const isIncome = txType === TransactionType.Income
  const isTransfer = txType === TransactionType.Transfer

  const filteredCategories =
    categories?.filter((c) =>
      isExpense
        ? c.type === 'expense'
        : isIncome
          ? c.type === 'income'
          : true,
    ) ?? []
  const categoryOptions = buildCategoryTreeOptions(filteredCategories)
  const sourceAccountRequired = !isIncome
  const destinationAccountRequired = !isExpense
  const hasRequiredAccounts =
    (!sourceAccountRequired || !!sourceAccountId) &&
    (!destinationAccountRequired || !!destinationAccountId)
  const hasValidTransferAccounts = !isTransfer || sourceAccountId !== destinationAccountId
  const canSubmit = !!amount.trim() && !!categoryId && hasRequiredAccounts && hasValidTransferAccounts

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const trimmedAmount = amount.trim()

    if (!trimmedAmount || !categoryId || !hasRequiredAccounts || !hasValidTransferAccounts) {
      return
    }

    createTransaction(
      {
        amount: toApiAmount(trimmedAmount),
        transaction_type: txType,
        category_id: categoryId,
        occurred_at: new Date(date).toISOString(),
        source_account_id: sourceAccountRequired ? sourceAccountId : null,
        destination_account_id: destinationAccountRequired ? destinationAccountId : null,
        note: note.trim() || null,
      },
      {
        onSuccess: () => {
          notify('Transaction created.', 'success')
          void navigate({ to: '/transactions' })
        },
      },
    )
  }

  return (
    <Box component="form" onSubmit={onSubmit} sx={{ display: 'contents' }}>
      <PageLayout title="New Transaction">
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
                if (v === TransactionType.Expense) {
                  setDestinationAccountId('')
                }
                if (v === TransactionType.Income) {
                  setSourceAccountId('')
                }
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
              <FormHelperText>
                {categoryOptions.length === 0
                  ? 'Create a category first before saving this transaction.'
                  : 'Nested categories are shown with their full path.'}
              </FormHelperText>
            </FormControl>

            {!isIncome && (
              <FormControl fullWidth required={sourceAccountRequired}>
                <InputLabel id="tx-source-label">
                  {isTransfer ? 'From account' : 'Account'}
                </InputLabel>
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
                <FormHelperText>
                  {isTransfer ? 'Money leaves this account.' : 'Choose the account affected by this transaction.'}
                </FormHelperText>
              </FormControl>
            )}

            {!isExpense && (
              <FormControl fullWidth required={destinationAccountRequired} error={isTransfer && !!sourceAccountId && sourceAccountId === destinationAccountId}>
                <InputLabel id="tx-dest-label">
                  {isTransfer ? 'To account' : 'Account'}
                </InputLabel>
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
                <FormHelperText>
                  {isTransfer && !!sourceAccountId && sourceAccountId === destinationAccountId
                    ? 'Choose a different destination account for transfers.'
                    : isTransfer
                      ? 'Money arrives in this account.'
                      : 'Choose the account receiving this income.'}
                </FormHelperText>
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
            fullWidth
            onClick={() => void navigate({ to: '/transactions' })}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button type="submit" variant="contained" fullWidth disabled={isPending || !canSubmit}>
            {isPending ? 'Saving...' : 'Save'}
          </Button>
        </Stack>
      </PageLayout>
    </Box>
  )
}
