import { AddRounded } from '@mui/icons-material'
import { Box, Fab, Paper, Skeleton, Stack } from '@mui/material'
import { CategoryType } from '@/api/generated'
import { useCategories } from './hooks/useCategories'
import { PageLayout } from '#/shared/layout/PageLayout'
import { CategoryGroup } from './components/CategoryGroup'

export function CategoriesPage() {
  const { data: categories, isPending } = useCategories()

  const expenses = categories?.filter((c) => c.type === CategoryType.Expense) ?? []
  const income = categories?.filter((c) => c.type === CategoryType.Income) ?? []

  const fab = (
    <Fab color="primary" size="small" aria-label="add category">
      <AddRounded />
    </Fab>
  )

  return (
    <PageLayout overline="Organize" title="Categories" action={fab}>
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
          <CategoryGroup items={expenses} label="Expenses" />
          <CategoryGroup items={income} label="Income" />
        </Stack>
      )}
    </PageLayout>

  )
}
