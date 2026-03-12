export const queryKeys = {
  dashboard: ['dashboard'] as const,
  health: ['health'] as const,
  accounts: {
    all: ['accounts'] as const,
    detail: (id: string) => ['accounts', id] as const,
  },
  categories: {
    all: ['categories'] as const,
    detail: (id: string) => ['categories', id] as const,
  },
  transactions: {
    all: ['transactions'] as const,
    detail: (id: string) => ['transactions', id] as const,
  },
}
