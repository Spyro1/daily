import { Stack, Typography } from '@mui/material'
import type { CategoryIndex } from '@/api/generated'
import { EmptyState } from '#/shared/ui/EmptyState'
import { CategoryCard } from './CategoryCard'

interface CategoryNode {
  category: CategoryIndex
  children: CategoryNode[]
}

function buildTree(items: CategoryIndex[]): CategoryNode[] {
  const byId = new Map(items.map((c) => [c.id, c]))
  const childrenMap = new Map<string | null, CategoryIndex[]>()

  for (const item of items) {
    const parentId = item.parent_id && byId.has(item.parent_id) ? item.parent_id : null
    const siblings = childrenMap.get(parentId) ?? []
    siblings.push(item)
    childrenMap.set(parentId, siblings)
  }

  function build(parentId: string | null): CategoryNode[] {
    const children = childrenMap.get(parentId) ?? []
    return children
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((c) => ({ category: c, children: build(c.id) }))
  }

  return build(null)
}

function TreeNodes({ nodes, depth }: { nodes: CategoryNode[]; depth: number }) {
  return (
    <>
      {nodes.map((node) => (
        <Stack key={node.category.id} spacing={1} sx={{ pl: depth * 3 }}>
          <CategoryCard category={node.category} />
          {node.children.length > 0 && <TreeNodes nodes={node.children} depth={depth + 1} />}
        </Stack>
      ))}
    </>
  )
}

export function CategoryGroup({ items, label }: { items: CategoryIndex[]; label: string }) {
  const tree = buildTree(items)

  return (
    <Stack spacing={1}>
      <Typography variant="overline" sx={{ letterSpacing: '0.15em', fontWeight: 700, color: 'text.secondary' }}>
        {label}
      </Typography>
      {items.length === 0 ? (
        <EmptyState message="None yet" />
      ) : (
        <TreeNodes nodes={tree} depth={0} />
      )}
    </Stack>
  )
}