import { createFileRoute } from '@tanstack/react-router'
import { PageLayout } from '#/shared/layout/PageLayout'
import { CreateAccountPage } from '#/features/accounts/CreateAccountPage'
import { DemoPage } from '#/shared/layout/DemoPage'

export const Route = createFileRoute('/dashboard')({ component: DashboardPage })

function DashboardPage() {
  return (
    <PageLayout verticalAlign="flex-start">
      <DemoPage />
      {/* <CreateAccountPage /> */}
      {/* <Box sx={{}}>
        <Typography variant="overline" sx={{ color: 'primary.main', letterSpacing: '0.22em', fontWeight: 700 }}>
          Daily Dashboard
        </Typography>
      </Box> */}
    </PageLayout >
  )
}