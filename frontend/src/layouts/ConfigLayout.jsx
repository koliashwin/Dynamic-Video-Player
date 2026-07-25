import { ArrowBackRounded } from '@mui/icons-material'
import { Box, Container, Icon, Stack, Tab, Tabs, Tooltip, Typography } from '@mui/material'
import React from 'react'
import { Link as RouterLink, Navigate, useLocation, Outlet } from 'react-router-dom'
import { palette } from '../theme'

const TABS = [
    { label: 'Clip Library', path: '/config/clips' },
    { label: 'Sections', path: '/config/sections' },
    { label: 'Flows', path: '/config/flows' }
]

const ConfigLayout = () => {
    const location = useLocation()

    if (location.pathname === '/config' || location.pathname === '/config/') {
        return <Navigate to="/config/clips" replace />
    }

    const activeTab = TABS.find((tab) => location.pathname.startsWith(tab.path))?.path || false

    return (
        <Container maxWidth='lg' sx={{ py: { xs: 4, sm: 6 } }}>
            <Stack spacing={3}>
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                    <Tooltip title="Back to Player">
                        <Icon component={RouterLink} to="/" size="small">
                            <ArrowBackRounded fontSize='small' />
                        </Icon>
                    </Tooltip>
                </Stack>
                <Stack spacing={0.25}>
                    <Typography variant='h1' sx={{ fontSize: { xs: 20, sm: 24 } }}>
                        Configuration options
                    </Typography>
                    <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>
                        Manage clips, sections and flows
                    </Typography>
                </Stack>

                <Box
                    sx={{
                        borderRadius: 1.5,
                        border: '1px solid',
                        borderColor: 'divider',
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        px: 1
                    }}
                >
                    <Tabs
                        value={activeTab}
                        TabIndicatorProps={{ style: { backgroundColor: palette.filmAmber } }}
                        sx={{ minHeight: 44 }}
                    >
                        {TABS.map((tab) => (
                            <Tab
                                key={tab.path}
                                value={tab.path}
                                label={tab.label}
                                component={RouterLink}
                                to={tab.path}
                                sx={{
                                    minHeight: 44,
                                    fontFamily: '"Oswald", sans-serif',
                                    letterSpacing: '0.03em',
                                    fontSize: 13,
                                    '&.Mui-selected': { color: palette.filmAmber }
                                }}
                            />
                        ))}
                    </Tabs>
                </Box>

                <Outlet />
            </Stack>
        </Container>
    )
}

export default ConfigLayout
