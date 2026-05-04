import {
  ArrowDownwardRounded,
  ArrowUpwardRounded,
  BusinessCenterRounded,
  CardGiftcardRounded,
  CategoryRounded,
  DirectionsCarRounded,
  FastfoodRounded,
  HomeRounded,
  LaptopRounded,
  LocalAtmRounded,
  LocalHospitalRounded,
  MovieRounded,
  ReceiptLongRounded,
  SellRounded,
  ShoppingBagRounded,
  TrendingUpRounded,
  WorkRounded,
} from '@mui/icons-material'
import { alpha } from '@mui/material/styles'
import { Box, ButtonBase, Chip, Paper, Typography } from '@mui/material'
import type { SvgIconProps } from '@mui/material'
import { useNavigate } from '@tanstack/react-router'
import { CategoryType } from '@/api/generated'
import type { CategoryIndex } from '@/api/generated'

const ICON_MAP: Record<string, React.ComponentType<SvgIconProps>> = {
  general: CategoryRounded,
  food: FastfoodRounded,
  shopping: ShoppingBagRounded,
  home: HomeRounded,
  bills: ReceiptLongRounded,
  transport: DirectionsCarRounded,
  health: LocalHospitalRounded,
  fun: MovieRounded,
  salary: WorkRounded,
  freelance: LaptopRounded,
  business: BusinessCenterRounded,
  investment: TrendingUpRounded,
  gift: CardGiftcardRounded,
  cash: LocalAtmRounded,
  sale: SellRounded,
  other: CategoryRounded,
}

interface CategoryCardProps {
  category: CategoryIndex
}

export function CategoryCard({ category }: CategoryCardProps) {
  const navigate = useNavigate()
  const isExpense = category.type === CategoryType.Expense
  const color = category.color ?? (isExpense ? '#ef5350' : '#66bb6a')
  const Icon = ICON_MAP[category.icon_name] ?? CategoryRounded

  return (
    <ButtonBase
      onClick={() => void navigate({ to: '/categories/$id', params: { id: category.id } })}
      sx={{ width: '100%', borderRadius: 3, textAlign: 'left' }}
    >
      <Paper
        elevation={2}
        sx={{
          px: 2,
          py: 1.5,
          borderRadius: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          width: '100%',
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
        <Icon fontSize="small" />
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
    </ButtonBase>
  )
}
