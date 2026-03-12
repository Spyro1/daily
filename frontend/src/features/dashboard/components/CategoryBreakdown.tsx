import { Box, LinearProgress, Paper, Skeleton, Stack, Typography } from '@mui/material'
import type { TransactionBrief } from '@/api/generated'

interface Props {
  transactions: TransactionBrief[]
  isLoading: boolean
}

interface CategoryTotal {
  id: string
  name: string
  total: number
  percentage: number
}

const TOP_N = 5

function deriveCategories(
  transactions: TransactionBrief[],
): { items: CategoryTotal[]; total: number } {
  const map = new Map<string, { name: string; total: number }>()
  let total = 0

  for (const tx of transactions) {
    // Only count expense-type transactions
    if (tx.transaction_type !== 'expense') continue
    const amount = parseFloat(tx.amount)
    total += amount
    const existing = map.get(tx.category.id) ?? { name: tx.category.name, total: 0 }
    existing.total += amount
    map.set(tx.category.id, existing)
  }

  const items: CategoryTotal[] = Array.from(map.entries())
    .map(([id, { name, total: catTotal }]) => ({
      id,
      name,
      total: catTotal,
      percentage: total > 0 ? (catTotal / total) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, TOP_N)

  return { items, total }
}

export function CategoryBreakdown({ transactions, isLoading }: Props) {
  const { items } = deriveCategories(transactions)

  return (
    <Paper elevation={2} sx={{ p: 2.5, borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom>
        Top Spending Categories
      </Typography>

      {isLoading ? (
        <Stack spacing={2.5}>
          {[1, 2, 3].map((i) => (
            <Box key={i}>
              <Skeleton variant="text" width="45%" sx={{ mb: 0.5 }} />
              <Skeleton variant="rectangular" height={6} sx={{ borderRadius: 3 }} />
            </Box>
          ))}
        </Stack>
      ) : items.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No expense data available for this period
        </Typography>
      ) : (
        <Stack spacing={2}>
          {items.map((cat) => (
            <Box key={cat.id}>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                <Typography variant="body2" fontWeight={600}>
                  {cat.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ${cat.total.toFixed(0)} &middot; {cat.percentage.toFixed(1)}%
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={cat.percentage}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  bgcolor: 'action.hover',
                  '& .MuiLinearProgress-bar': { borderRadius: 3 },
                }}
              />
            </Box>
          ))}
        </Stack>
      )}
    </Paper>
  )
}
