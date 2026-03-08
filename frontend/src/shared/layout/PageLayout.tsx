import { Box } from '@mui/material'

export interface PageLayoutProps {
    verticalAlign?: 'flex-start' | 'center' | 'flex-end'
    horizontalAlign?: 'flex-start' | 'center' | 'flex-end'
    children: React.ReactNode
}

export function PageLayout({ children, verticalAlign = 'center', horizontalAlign = 'center' }: PageLayoutProps) {
    return (
        <Box
            sx={{
                minHeight: '100dvh',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: verticalAlign,
                alignItems: horizontalAlign,
                px: { xs: 1.5, sm: 3 },
                py: { xs: 1.5, sm: 2.5 },
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    flex: 1,
                    flexDirection: 'column',
                    width: '100%',
                    maxWidth: { xs: '100%', sm: '720px', md: '960px' },
                    minHeight: 0,
                }}
            >
                {children}
            </Box>
        </Box>
    )
}