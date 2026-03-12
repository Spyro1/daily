import { Stack, Typography } from '@mui/material'
import type { CategoryIndex } from '@/api/generated'
import { EmptyState } from '#/shared/ui/EmptyState'
import { CategoryCard } from './CategoryCard'

export function CategoryGroup({ items, label }: { items: CategoryIndex[]; label: string }) {
  return (
    <Stack spacing={1}>
      <Typography variant="overline" sx={{ letterSpacing: '0.15em', fontWeight: 700, color: 'text.secondary' }}>
        {label}
      </Typography>
      {items.length === 0 ? (
        <EmptyState message="None yet" />
      ) : (
        items.map((cat) => <CategoryCard key={cat.id} category={cat} />)
      )}
    </Stack>
  )
}