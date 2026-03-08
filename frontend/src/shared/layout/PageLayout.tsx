import { Box } from "@mui/material";

export interface PageLayoutProps {
    verticalAlign?: 'flex-start' | 'center' | 'flex-end'
    horizontalAlign?: 'flex-start' | 'center' | 'flex-end'
    children: React.ReactNode
}

export function PageLayout({children, verticalAlign = 'center', horizontalAlign = 'center'}: PageLayoutProps) {
    return (
        <Box
            sx={{
                minHeight: '100dvh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: horizontalAlign,
                justifyContent: verticalAlign,
                // px: 3,
            }}
        >
            {children}
        </Box>
    )
}