import { createFileRoute } from '@tanstack/react-router'
import { PageLayout } from '#/shared/layout/PageLayout'
import { CreateAccountPage } from '#/features/accounts/CreateAccountPage'
// import { DemoPage } from '#/shared/layout/DemoPage'

import * as MuiIcons from '@mui/icons-material';

export const Route = createFileRoute('/dashboard')({ component: DashboardPage })

function DashboardPage() {
  // const IconComponent = (MuiIcons as any)[iconName];
  return (
    <PageLayout verticalAlign="flex-start">
      {/* <DemoPage /> */}
      <CreateAccountPage />
      {/* <IconComponent style={{ color: account.color }} /> */}
      {/* <Box sx={{}}>
        <Typography variant="overline" sx={{ color: 'primary.main', letterSpacing: '0.22em', fontWeight: 700 }}>
          Daily Dashboard
        </Typography>
      </Box> */}
    </PageLayout >
  )
}