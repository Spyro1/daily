import { QueryClient } from '@tanstack/react-query'

type QueryErrorLike = {
  response?: {
    status?: number
  }
}

function isQueryErrorLike(error: unknown): error is QueryErrorLike {
  return typeof error === 'object' && error !== null && 'response' in error
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24,
      retry: (failureCount: number, error: Error) => {
        if (isQueryErrorLike(error) && (error.response?.status === 401 || error.response?.status === 403)) {
          return false
        }

        return failureCount < 3
      },
      refetchOnWindowFocus: false,
    },
  },
})