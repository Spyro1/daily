import { useHealth } from '@/features/auth/hooks/useHealth'
import { CancelRounded, CheckCircleRounded } from '@mui/icons-material'
import { Tooltip } from '@mui/material'

export function HealthIcon() {
    const health = useHealth()
    const healthStatus = health?.status

    return (
        <Tooltip title={healthStatus ? "Server avalible" : "Server not avalible"} sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', m: 1 }}>
            {healthStatus != null ? (
                <CheckCircleRounded color="success" />
            ) : (
                <CancelRounded color="disabled" />
            )}
        </Tooltip>
    )
}
