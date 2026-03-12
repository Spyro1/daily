import type { ReactNode } from 'react'
import { ButtonBase, Typography } from '@mui/material'

interface NavButtonProps {
  icon: ReactNode
  label: string
  active: boolean
  onClick: () => void
}

export function NavButton({ icon, label, active, onClick }: NavButtonProps) {
  return (
    <ButtonBase
      onClick={onClick}
      sx={{
        flex: 1,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0.5,
        color: active ? 'primary.main' : 'text.secondary',
        transition: 'color 0.2s',
        borderRadius: 2,
      }}
    >
      {icon}
      <Typography
        variant="caption"
        sx={{ fontSize: '0.6rem', fontWeight: active ? 700 : 400, lineHeight: 1 }}
      >
        {label}
      </Typography>
    </ButtonBase>
  )
}
