import { AddRounded } from '@mui/icons-material'
import { Box, Fab, Paper, Skeleton, Stack, ToggleButton, ToggleButtonGroup } from '@mui/material'
import { useState } from 'react'
import { CategoryType } from '@/api/generated'
import { useCategories } from './hooks/useCategories'
import { PageLayout } from '#/shared/layout/PageLayout'
import { CategoryGroup } from './components/CategoryGroup'
import { useNavigate } from '@tanstack/react-router'

export function CategoriesPage() {
  const { data: categories, isPending } = useCategories()
  const navigate = useNavigate()
  const [selectedType, setSelectedType] = useState<CategoryType>(CategoryType.Expense)

  const expenses = categories?.filter((c) => c.type === CategoryType.Expense) ?? []
  const income = categories?.filter((c) => c.type === CategoryType.Income) ?? []

  const fab = (
    <Fab
      color="primary"
      size="small"
      aria-label="add category"
      onClick={() => void navigate({ to: '/categories/new' })}
    >
      <AddRounded fontSize="large" />
    </Fab>
  )

  return (
    <PageLayout title="Categories" action={fab}>
      <ToggleButtonGroup
        exclusive
        fullWidth
        size="small"
        value={selectedType}
        onChange={(_, value: CategoryType | null) => {
          if (value) {
            setSelectedType(value)
          }
        }}
      >
        <ToggleButton value={CategoryType.Expense}>Expense</ToggleButton>
        <ToggleButton value={CategoryType.Income}>Income</ToggleButton>
      </ToggleButtonGroup>

      {isPending ? (
        <Stack spacing={1.5}>
          {[1, 2, 3, 4].map((i) => (
            <Paper key={i} elevation={2} sx={{ px: 2, py: 1.5, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Skeleton variant="rounded" width={40} height={40} sx={{ borderRadius: 2 }} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="45%" />
              </Box>
              <Skeleton variant="rounded" width={70} height={22} sx={{ borderRadius: 2 }} />
            </Paper>
          ))}
        </Stack>
      ) : (
        <Stack spacing={3}>
          {selectedType === CategoryType.Expense ? (
            <CategoryGroup items={expenses} label="Expenses" />
          ) : (
            <CategoryGroup items={income} label="Income" />
          )}
        </Stack>
      )}
    </PageLayout>

  )
}
