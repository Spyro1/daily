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
import type { TransactionType as TxType } from '@/api/generated'
import { useAccounts } from '../accounts/hooks/useAccounts'
import { useCategories } from '../categories/hooks/useCategories'
import { useCreateTransaction } from './hooks/useTransactions'
import { PageLayout } from '#/shared/layout/PageLayout'

const TYPE_CONFIG = [
  { value: TransactionType.Expanse, label: 'Expense', Icon: ArrowDownwardRounded },
  { value: TransactionType.Income, label: 'Income', Icon: ArrowUpwardRounded },
  { value: TransactionType.Transfer, label: 'Transfer', Icon: SwapHorizRounded },
]

function today(): string {
  return new Date().toISOString().split('T')[0]!
}

export function NewTransactionPage() {
  const navigate = useNavigate()
  const [txType, setTxType] = useState<TxType>(TransactionType.Expanse)
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [sourceAccountId, setSourceAccountId] = useState('')
  const [destinationAccountId, setDestinationAccountId] = useState('')
  const [date, setDate] = useState(today())
  const [note, setNote] = useState('')

  const { data: accounts } = useAccounts()
  const { data: categories } = useCategories()
  const { mutate: createTransaction, isPending } = useCreateTransaction()

  const filteredCategories =
    categories?.filter((c) =>
      txType === TransactionType.Expanse
        ? c.type === 'expense'
        : txType === TransactionType.Income
          ? c.type === 'income'
          : true,
    ) ?? []

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!categoryId || !amount) return
    createTransaction(
      {
        amount: amount as unknown as object,
        transaction_type: txType,
        category_id: categoryId,
        date,
        source_account_id: sourceAccountId || null,
        destination_account_id: destinationAccountId || null,
        note: note || null,
      },
      { onSuccess: () => void navigate({ to: '/dashboard' }) },
    )
  }

  return (
    <Box component="form" onSubmit={onSubmit} sx={{ display: 'contents' }}>
      <PageLayout overline="Transactions" title="New Transaction">
        <Paper elevation={2} sx={{ p: 2.5, borderRadius: 3 }}>
          <Stack spacing={2.5}>
            <ToggleButtonGroup
              exclusive
              fullWidth
              value={txType}
              onChange={(_, v) => { if (v) { setTxType(v); setCategoryId('') } }}
              size="small"
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
                onChange={(e) => setCategoryId(e.target.value)}
              >
                {filteredCategories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {txType !== TransactionType.Income && (
              <FormControl fullWidth>
                <InputLabel id="tx-source-label">
                  {txType === TransactionType.Transfer ? 'From account' : 'Account'}
                </InputLabel>
                <Select
                  labelId="tx-source-label"
                  value={sourceAccountId}
                  label={txType === TransactionType.Transfer ? 'From account' : 'Account'}
                  onChange={(e) => setSourceAccountId(e.target.value)}
                >
                  <MenuItem value=""><em>None</em></MenuItem>
                  {accounts?.map((acc) => (
                    <MenuItem key={acc.id} value={acc.id}>{acc.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {txType !== TransactionType.Expanse && (
              <FormControl fullWidth>
                <InputLabel id="tx-dest-label">
                  {txType === TransactionType.Transfer ? 'To account' : 'Account'}
                </InputLabel>
                <Select
                  labelId="tx-dest-label"
                  value={destinationAccountId}
                  label={txType === TransactionType.Transfer ? 'To account' : 'Account'}
                  onChange={(e) => setDestinationAccountId(e.target.value)}
                >
                  <MenuItem value=""><em>None</em></MenuItem>
                  {accounts?.map((acc) => (
                    <MenuItem key={acc.id} value={acc.id}>{acc.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            <TextField
              label="Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="Note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
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
            onClick={() => void navigate({ to: '/dashboard' })}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button type="submit" variant="contained" fullWidth disabled={isPending}>
            {isPending ? 'Saving…' : 'Save'}
          </Button>
        </Stack>
      </PageLayout>
    </Box>
  )
}
