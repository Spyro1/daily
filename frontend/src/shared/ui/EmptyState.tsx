import { Typography } from '@mui/material'

export interface EmptyStateProps {
  message: string
}

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <Typography variant="body2" color="text.secondary">
      {message}
    </Typography>
  )
}
