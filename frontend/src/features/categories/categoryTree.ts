import type { CategoryIndex, CategoryType } from '@/api/generated'

export interface CategoryTreeOption {
  id: string
  name: string
  depth: number
  pathLabel: string
}

export function buildCategoryTreeOptions(
  categories: CategoryIndex[] | undefined,
  type?: CategoryType,
): CategoryTreeOption[] {
  const filtered = categories?.filter((category) => (type ? category.type === type : true)) ?? []

  if (filtered.length === 0) {
    return []
  }

  const byId = new Map(filtered.map((category) => [category.id, category]))
  const childrenByParent = new Map<string | null, CategoryIndex[]>()

  for (const category of filtered) {
    const parentId = category.parent_id && byId.has(category.parent_id) ? category.parent_id : null
    const siblings = childrenByParent.get(parentId) ?? []
    siblings.push(category)
    childrenByParent.set(parentId, siblings)
  }

  for (const siblings of childrenByParent.values()) {
    siblings.sort((left, right) => left.name.localeCompare(right.name))
  }

  const flattened: CategoryTreeOption[] = []

  const visit = (parentId: string | null, depth: number, trail: string[]) => {
    const children = childrenByParent.get(parentId) ?? []

    for (const child of children) {
      const nextTrail = [...trail, child.name]
      flattened.push({
        id: child.id,
        name: child.name,
        depth,
        pathLabel: nextTrail.join(' / '),
      })
      visit(child.id, depth + 1, nextTrail)
    }
  }

  visit(null, 0, [])

  return flattened
}