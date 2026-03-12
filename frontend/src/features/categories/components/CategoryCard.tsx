import { ArrowDownwardRounded, ArrowUpwardRounded, CategoryRounded } from '@mui/icons-material'
import { alpha } from '@mui/material/styles'
import { Box, Chip, Paper, Typography } from '@mui/material'
import { CategoryType } from '@/api/generated'
import type { CategoryIndex } from '@/api/generated'

interface CategoryCardProps {
  category: CategoryIndex
}

export function CategoryCard({ category }: CategoryCardProps) {
  const isExpense = category.type === CategoryType.Expense
  const color = category.color ?? (isExpense ? '#ef5350' : '#66bb6a')

  return (
    <Paper
      elevation={2}
      sx={{
        px: 2,
        py: 1.5,
        borderRadius: 3,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
      }}
    >
      <Box
        sx={(theme) => ({
          width: 40,
          height: 40,
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          backgroundColor: alpha(color, theme.palette.mode === 'light' ? 0.15 : 0.25),
          color,
        })}
      >
        <CategoryRounded fontSize="small" />
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="subtitle1" fontWeight={600} noWrap>
          {category.name}
        </Typography>
        {category.parent_id && (
          <Typography variant="caption" color="text.secondary">
            Subcategory
          </Typography>
        )}
      </Box>

      <Chip
        size="small"
        icon={isExpense ? <ArrowDownwardRounded /> : <ArrowUpwardRounded />}
        label={isExpense ? 'Expense' : 'Income'}
        color={isExpense ? 'error' : 'success'}
        variant="outlined"
        sx={{ height: 22, fontSize: '0.65rem' }}
      />
    </Paper>
  )
}
