import { Grid, Paper, Skeleton, Stack, Typography } from '@mui/material'
import TrendingDownIcon from '@mui/icons-material/TrendingDown'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import type { TransactionBrief } from '@/api/generated'
import { deriveSummary, type Interval } from '../utils/dateUtils'
import { formatCurrency } from '@/shared/utils/currency'

interface Props {
  transactions: TransactionBrief[]
  currencyCode: string
  interval: Interval
  customRange: [Date, Date]
  isLoading: boolean
}

export function SummaryTiles({ transactions, currencyCode, interval, customRange, isLoading }: Props) {
  const { totalIncome, totalExpense } = deriveSummary(transactions, interval, customRange)

  return (
    <Grid container spacing={2}>
      {/* Income tile */}
      <Grid size={{ xs: 6 }}>
        <Paper
          elevation={2}
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            height: '100%',
          }}
        >
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 0.5 }}>
            <TrendingUpIcon sx={{ mb: 0.5, opacity: 0.85 }} />
            <Typography variant="body2" sx={{ opacity: 0.85, mb: 0.5 }}>
              Income
            </Typography>
          </Stack>
          {isLoading ? (
            <Skeleton
              variant="text"
              width={80}
              sx={{ bgcolor: 'rgba(255,255,255,0.25)', borderRadius: 1 }}
            />
          ) : (
            <Typography variant="h6" fontWeight={700}>
              {formatCurrency(totalIncome, currencyCode, { maximumFractionDigits: 0 })}
            </Typography>
          )}
        </Paper>
      </Grid>

      {/* Expense tile */}
      <Grid size={{ xs: 6 }}>
        <Paper
          elevation={2}
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: 'error.main',
            color: 'error.contrastText',
            height: '100%',
          }}
        >
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 0.5 }}>
            <TrendingDownIcon sx={{ mb: 0.5, opacity: 0.85 }} />
            <Typography variant="body2" sx={{ opacity: 0.85, mb: 0.5 }}>
              Expenses
            </Typography>
          </Stack>
          {isLoading ? (
            <Skeleton
              variant="text"
              width={80}
              sx={{ bgcolor: 'rgba(255,255,255,0.25)', borderRadius: 1 }}
            />
          ) : (
            <Typography variant="h6" fontWeight={700}>
              {formatCurrency(totalExpense, currencyCode, { maximumFractionDigits: 0 })}
            </Typography>
          )}
        </Paper>
      </Grid>
    </Grid>
  )
}
