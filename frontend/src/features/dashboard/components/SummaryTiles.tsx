import { Grid, Paper, Skeleton, Typography } from '@mui/material'
import TrendingDownIcon from '@mui/icons-material/TrendingDown'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import type { TransactionBrief } from '@/api/generated'
import { deriveSummary, type Interval } from '../utils/dateUtils'

interface Props {
  transactions: TransactionBrief[]
  interval: Interval
  customRange: [Date, Date]
  isLoading: boolean
}

function formatAmount(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

export function SummaryTiles({ transactions, interval, customRange, isLoading }: Props) {
  const { totalIncome, totalExpense } = deriveSummary(transactions, interval, customRange)

  return (
    <Grid container spacing={2}>
      {/* Income tile */}
      <Grid size={{ xs: 6 }}>
        <Paper
          elevation={2}
          sx={{
            p: 2,
            borderRadius: 3,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            height: '100%',
          }}
        >
          <TrendingUpIcon sx={{ mb: 0.5, opacity: 0.85 }} />
          <Typography variant="body2" sx={{ opacity: 0.85, mb: 0.5 }}>
            Income
          </Typography>
          {isLoading ? (
            <Skeleton
              variant="text"
              width={80}
              sx={{ bgcolor: 'rgba(255,255,255,0.25)', borderRadius: 1 }}
            />
          ) : (
            <Typography variant="h6" fontWeight={700}>
              {formatAmount(totalIncome)}
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
            borderRadius: 3,
            bgcolor: 'error.main',
            color: 'error.contrastText',
            height: '100%',
          }}
        >
          <TrendingDownIcon sx={{ mb: 0.5, opacity: 0.85 }} />
          <Typography variant="body2" sx={{ opacity: 0.85, mb: 0.5 }}>
            Expenses
          </Typography>
          {isLoading ? (
            <Skeleton
              variant="text"
              width={80}
              sx={{ bgcolor: 'rgba(255,255,255,0.25)', borderRadius: 1 }}
            />
          ) : (
            <Typography variant="h6" fontWeight={700}>
              {formatAmount(totalExpense)}
            </Typography>
          )}
        </Paper>
      </Grid>
    </Grid>
  )
}
